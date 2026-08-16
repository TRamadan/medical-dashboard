import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

// ─────────────────────────────────────────────────────────────
// Groups — shaped EXACTLY like the ConsultationProfile request body
// ─────────────────────────────────────────────────────────────
export interface PersonalData {
    fullName: string;
    dateOfBirth: string;       // 'YYYY-MM-DD'
    address: string;
    phoneNumber: string;
    emergencyPhone: string;
    emergencyRelation: string;
    bookingForSelf: boolean;
    // Only meaningful when bookingForSelf === false — who is filling the form
    // out on the injured person's behalf, and their relation to them.
    fillerRelation: string;
    fillerName: string;
    fillerMobile: string;
}

export interface SportsData {
    sport: string;
    playCenter: string;
    yearsOfPractice: number;
    clubName: string;
    highestAchievement: string;
}

export interface SpecialistConsulted {
    id: number;
    doctorName: string;
    specialty: string;
    diagnosis: string;
    communicationMethod: string;
}

import { MuscleName, mapMusclesToPainLocations, mapMuscleNameToEnum, mapPainLocationsToMuscleNames } from '../models/muscle-names.enum';
export { MuscleName, mapMusclesToPainLocations, mapMuscleNameToEnum, mapPainLocationsToMuscleNames };

export interface InjuryData {
    bodyMapData: string;
    painLevel: number;
    functionalLevel: number;
    dailyActivityLevel: number;
    injuryDescription: string;
    injuryName: string;
    injurySide: number;
    injuryDate: string;        // 'YYYY-MM-DD'
    inactivityDurationValue: number;
    inactivityDurationUnit: number;
    isSportRelated: boolean;
    seenSpecialist: boolean;
    specialistsConsulted: SpecialistConsulted[];
    prescribedTreatments: number;
    otherPrescribedTreatment: string;
    hadDiagnosticTests: boolean;
    diagnosticTests: number;   // bitmask
    otherDiagnosticTest: string;
    painLocations: number[];
}

export interface PreviousInjuryEntry {
    id: number;
    description: string;
    bodyPart: string;
    injuryDate: string;
    treatmentReceived: string;
}

export interface PreviousSurgeryEntry {
    id: number;
    description: string;
    surgeryType: string;
    surgeryDate: string;
}

export interface InjuryHistoryGroup {
    previousInjuries: PreviousInjuryEntry[];
    previousSurgeries: PreviousSurgeryEntry[];
}

export interface MedicationEntry {
    id: number;
    name: string;
    dose: string;
    frequency: string;
}

export interface MedicalHistoryGroup {
    currentConditions: number;
    otherConditions: string;
    medications: MedicationEntry[];
    knownAllergies: string;
    hadCovid: boolean;
    covidTimesCount: number;
    covidVaccinated: boolean;
    vaccineType: string;
    vaccineDoses: number;
    fatherConditions: number;
    fatherOtherConditions: string;
    motherConditions: number;
    motherOtherConditions: string;
}

export interface SocialProfileGroup {
    occupation: string;
    workNature: number;
    dailySittingHours: number;
    maritalStatus: number;
    habits: number;
    isWorkStressful: boolean;
    hasChildren: boolean;
}

export interface ConsultationProfileRequest {
    personalData: PersonalData;
    sportsData: SportsData;
    injuryData: InjuryData;
    injuryHistory: InjuryHistoryGroup;
    medicalHistory: MedicalHistoryGroup;
    socialProfile: SocialProfileGroup;
}

// ─────────────────────────────────────────────────────────────
// UI-only state — things the dialog needs that the API does NOT
// take directly (checkbox/chip arrays that collapse to one number,
// "booking for someone else" fields, the doctors-seen list, etc.)
// Nothing in here is sent to the backend on its own — it only
// exists to compute the grouped fields above.
// ─────────────────────────────────────────────────────────────
export interface PatientFormUi {
    prescribedTreatmentsSelected: string[];
    diagnosticTestsSelected: string[]; // drives diagnosticTests bitmask

    chronicConditionsSelected: string[];
    fatherConditionsSelected: string[];
    motherConditionsSelected: string[];
    habitsSelected: string[];

    inactivityDurationUnitLabel: 'days' | 'weeks' | 'months';
    injurySideLabel: 'right' | 'left' | 'both';
    workNatureLabel: string;
}

export interface PatientForm {
    personalData: PersonalData;
    sportsData: SportsData;
    injuryData: InjuryData;
    injuryHistory: InjuryHistoryGroup;
    medicalHistory: MedicalHistoryGroup;
    socialProfile: SocialProfileGroup;
    ui: PatientFormUi;
    selectedMuscles?: string[];
}

// ─────────────────────────────────────────────────────────────
// Bitmask / enum maps — CONFIRM the real numeric values with the
// backend team before relying on these in production.
// ─────────────────────────────────────────────────────────────
const PRESCRIBED_TREATMENT_FLAGS: Record<string, number> = {
    medication: 1, physio: 2, rehab: 4, rest: 8, other: 16
};

const DIAGNOSTIC_TEST_FLAGS: Record<string, number> = {
    xray: 1, mri: 2, ct: 4, emg_muscle: 8, emg_nerve: 16, ultrasound: 32, bone_scan: 64, other: 128
};

const DISEASE_CONDITION_FLAGS: Record<string, number> = {
    'ارتفاع ضغط الدم': 1, 'أمراض القلب': 2, 'اضطرابات السكر': 4, 'الأورام': 8,
    'الصرع': 16, 'الجلطات': 32, 'اضطرابات الغدة الدرقية': 64, 'الربو': 128,
    'اضطرابات الكلى': 256, 'أمراض جلدية': 512
};

const HABIT_FLAGS: Record<string, number> = {
    smoking: 1, alcohol: 2, stimulants: 4, none: 8
};

const WORK_NATURE_MAP: Record<string, number> = { 'مكتبي': 0, 'ميداني': 1 };
const INACTIVITY_UNIT_MAP: Record<PatientFormUi['inactivityDurationUnitLabel'], number> = { days: 0, weeks: 1, months: 2 };
const INJURY_SIDE_MAP: Record<PatientFormUi['injurySideLabel'], number> = { right: 0, left: 1, both: 2 };

function sumFlags(selected: string[], map: Record<string, number>): number {
    return (selected ?? []).reduce((sum, key) => sum + (map[key] ?? 0), 0);
}

function toIsoDate(value: Date | string | null): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const defaultForm: PatientForm = {
    personalData: {
        fullName: '', dateOfBirth: '', address: '', phoneNumber: '',
        emergencyPhone: '', emergencyRelation: '', bookingForSelf: true,
        fillerRelation: '', fillerName: '', fillerMobile: ''
    },
    sportsData: {
        sport: '', playCenter: '', yearsOfPractice: 0, clubName: '', highestAchievement: ''
    },
    injuryData: {
        bodyMapData: '', painLevel: 0, functionalLevel: 0, dailyActivityLevel: 0,
        injuryDescription: '', injuryName: '', injurySide: 0, injuryDate: '',
        inactivityDurationValue: 0, inactivityDurationUnit: 0,
        isSportRelated: true, seenSpecialist: false, specialistsConsulted: [],
        prescribedTreatments: 0, otherPrescribedTreatment: '',
        hadDiagnosticTests: false, diagnosticTests: 0, otherDiagnosticTest: '',
        painLocations: []
    },
    injuryHistory: { previousInjuries: [], previousSurgeries: [] },
    medicalHistory: {
        currentConditions: 0, otherConditions: '', medications: [],
        knownAllergies: '', hadCovid: false, covidTimesCount: 0,
        covidVaccinated: false, vaccineType: '', vaccineDoses: 0,
        fatherConditions: 0, fatherOtherConditions: '', motherConditions: 0, motherOtherConditions: ''
    },
    socialProfile: {
        occupation: '', workNature: 0, dailySittingHours: 0, maritalStatus: 0, habits: 0,
        isWorkStressful: false, hasChildren: false
    },
    ui: {
        prescribedTreatmentsSelected: [],
        diagnosticTestsSelected: [],
        chronicConditionsSelected: [], fatherConditionsSelected: [], motherConditionsSelected: [], habitsSelected: [],
        inactivityDurationUnitLabel: 'weeks',
        injurySideLabel: 'right',
        workNatureLabel: ''
    },
    selectedMuscles: []
};

@Injectable({ providedIn: 'root' })
export class PatientFormService {
    private readonly baseUrl = 'https://portalapi.thesportsdoctorlab.com/api/ConsultationProfile';
    private readonly http = inject(HttpClient);
    private readonly messageService = inject(MessageService);

    readonly form = signal<PatientForm>(structuredClone(defaultForm));

    // ── Submit state signals ──────────────────────────────────────────────────
    readonly submitLoading = signal<boolean>(false);
    readonly submitError = signal<string | null>(null);
    readonly submitSuccess = signal<boolean>(false);

    reset(): void {
        this.form.set(structuredClone(defaultForm));
    }

    patch(partial: Partial<PatientForm>): void {
        this.form.update(current => ({ ...current, ...partial }));
    }

    // ── Date helpers: p-datepicker gives you a Date, the API wants an ISO string ──
    setDateOfBirth(date: Date | null): void {
        this.form.update(f => ({ ...f, personalData: { ...f.personalData, dateOfBirth: toIsoDate(date) } }));
    }

    setInjuryDate(date: Date | null): void {
        this.form.update(f => ({ ...f, injuryData: { ...f.injuryData, injuryDate: toIsoDate(date) } }));
    }

    // ── Multi-select toggles — each recomputes the single numeric field the API wants ──
    togglePrescribedTreatment(value: string): void {
        const list = this.toggle(this.form().ui.prescribedTreatmentsSelected, value);
        this.form.update(f => ({
            ...f,
            ui: { ...f.ui, prescribedTreatmentsSelected: list },
            injuryData: { ...f.injuryData, prescribedTreatments: sumFlags(list, PRESCRIBED_TREATMENT_FLAGS) }
        }));
    }

    toggleDiagnosticTest(value: string): void {
        const list = this.toggle(this.form().ui.diagnosticTestsSelected, value);
        this.form.update(f => ({
            ...f,
            ui: { ...f.ui, diagnosticTestsSelected: list },
            injuryData: { ...f.injuryData, diagnosticTests: sumFlags(list, DIAGNOSTIC_TEST_FLAGS) }
        }));
    }

    toggleChronicCondition(value: string): void {
        const list = this.toggle(this.form().ui.chronicConditionsSelected, value);
        this.form.update(f => ({
            ...f,
            ui: { ...f.ui, chronicConditionsSelected: list },
            medicalHistory: { ...f.medicalHistory, currentConditions: sumFlags(list, DISEASE_CONDITION_FLAGS) }
        }));
    }

    toggleFatherCondition(value: string): void {
        const list = this.toggle(this.form().ui.fatherConditionsSelected, value);
        this.form.update(f => ({
            ...f,
            ui: { ...f.ui, fatherConditionsSelected: list },
            medicalHistory: { ...f.medicalHistory, fatherConditions: sumFlags(list, DISEASE_CONDITION_FLAGS) }
        }));
    }

    toggleMotherCondition(value: string): void {
        const list = this.toggle(this.form().ui.motherConditionsSelected, value);
        this.form.update(f => ({
            ...f,
            ui: { ...f.ui, motherConditionsSelected: list },
            medicalHistory: { ...f.medicalHistory, motherConditions: sumFlags(list, DISEASE_CONDITION_FLAGS) }
        }));
    }

    toggleHabit(value: string): void {
        const list = this.toggle(this.form().ui.habitsSelected, value);
        this.form.update(f => ({
            ...f,
            ui: { ...f.ui, habitsSelected: list },
            socialProfile: { ...f.socialProfile, habits: sumFlags(list, HABIT_FLAGS) }
        }));
    }

    setWorkNature(label: string): void {
        this.form.update(f => ({
            ...f,
            ui: { ...f.ui, workNatureLabel: label },
            socialProfile: { ...f.socialProfile, workNature: WORK_NATURE_MAP[label] ?? 0 }
        }));
    }

    setInjurySide(label: PatientFormUi['injurySideLabel']): void {
        this.form.update(f => ({
            ...f,
            ui: { ...f.ui, injurySideLabel: label },
            injuryData: { ...f.injuryData, injurySide: INJURY_SIDE_MAP[label] ?? 0 }
        }));
    }

    setInactivityDurationUnit(label: PatientFormUi['inactivityDurationUnitLabel']): void {
        this.form.update(f => ({
            ...f,
            ui: { ...f.ui, inactivityDurationUnitLabel: label },
            injuryData: { ...f.injuryData, inactivityDurationUnit: INACTIVITY_UNIT_MAP[label] ?? 1 }
        }));
    }

    private toggle(list: string[], value: string): string[] {
        const idx = list.indexOf(value);
        return idx > -1 ? list.filter(v => v !== value) : [...list, value];
    }

    // ── Body-map muscle selection — keeps `selectedMuscles` (UI labels) and
    // `injuryData.painLocations` (numeric MuscleName values) in sync ──
    toggleMuscle(name: string): void {
        const list = this.toggle(this.form().selectedMuscles ?? [], name);
        this.setSelectedMuscles(list);
    }

    setSelectedMuscles(muscles: string[]): void {
        this.form.update(f => ({
            ...f,
            selectedMuscles: muscles,
            injuryData: { ...f.injuryData, painLocations: mapMusclesToPainLocations(muscles) }
        }));
    }

    // ── Submit — the six groups already match the API 1:1, so no separate mapper needed ──
    submitConsultationProfile(consultationId: number): Observable<void> {
        this.submitLoading.set(true);
        this.submitError.set(null);
        this.submitSuccess.set(false);

        const { personalData, sportsData, injuryData, injuryHistory, medicalHistory, socialProfile, selectedMuscles } = this.form();
        const body: ConsultationProfileRequest = {
            personalData,
            sportsData,
            injuryData: { ...injuryData, painLocations: mapMusclesToPainLocations(selectedMuscles ?? []) },
            injuryHistory,
            medicalHistory,
            socialProfile
        };

        return this.http.put<void>(`${this.baseUrl}/${consultationId}`, body).pipe(
            tap(() => {
                this.submitLoading.set(false);
                this.submitSuccess.set(true);
                this.messageService.add({
                    severity: 'success',
                    summary: 'تم الحفظ بنجاح',
                    detail: 'تم حفظ بيانات المريض بنجاح.',
                    life: 4000
                });
            }),
            catchError((err: HttpErrorResponse) => {
                this.submitLoading.set(false);
                const apiErrors = err?.error as { errors?: { errorEn?: string }[] } | undefined;
                const errorMsg = apiErrors?.errors?.[0]?.errorEn
                    ?? err.message
                    ?? 'فشل حفظ بيانات المريض. يرجى المحاولة مرة أخرى.';
                this.submitError.set(errorMsg);
                this.messageService.add({
                    severity: 'error',
                    summary: 'خطأ في الحفظ',
                    detail: errorMsg,
                    life: 6000
                });
                return throwError(() => err);
            })
        );
    }

    // ── Fetch profile by appointmentId ──
    getConsultationProfile(appointmentId: number): Observable<any> {
        this.submitLoading.set(true);
        this.submitError.set(null);
        return this.http.get<{ data: any; isSuccess: boolean; error: any }>(`${this.baseUrl}/${appointmentId}`).pipe(
            tap(res => {
                this.submitLoading.set(false);
                if (res && res.isSuccess && res.data) {
                    this.applyProfileData(res.data);
                }
            }),
            catchError((err: HttpErrorResponse) => {
                this.submitLoading.set(false);
                const errorMsg = err?.error?.error || 'فشل تحميل بيانات الملف الشخصي للمريض.';
                this.submitError.set(errorMsg);
                return throwError(() => err);
            })
        );
    }

    applyProfileData(data: any): void {
        if (!data) return;
        const p = data.personalData || {};
        const s = data.sportsData || {};
        const i = data.injuryData || {};
        const h = data.injuryHistory || {};
        const m = data.medicalHistory || {};
        const soc = data.socialProfile || {};

        this.form.set({
            personalData: {
                fullName: p.fullName ?? '',
                dateOfBirth: p.dateOfBirth ?? '',
                address: p.address ?? '',
                phoneNumber: p.phoneNumber ?? '',
                emergencyPhone: p.emergencyPhone ?? '',
                emergencyRelation: p.emergencyRelation ?? '',
                bookingForSelf: p.bookingForSelf ?? true,
                fillerRelation: p.fillerRelation ?? '',
                fillerName: p.fillerName ?? '',
                fillerMobile: p.fillerMobile ?? ''
            },
            sportsData: {
                sport: s.sport ?? '',
                playCenter: s.playCenter ?? '',
                yearsOfPractice: s.yearsOfPractice ?? 0,
                clubName: s.clubName ?? '',
                highestAchievement: s.highestAchievement ?? ''
            },
            injuryData: {
                bodyMapData: i.bodyMapData ?? '',
                painLevel: i.painLevel ?? 0,
                functionalLevel: i.functionalLevel ?? 0,
                dailyActivityLevel: i.dailyActivityLevel ?? 0,
                injuryDescription: i.injuryDescription ?? '',
                injuryName: i.injuryName ?? '',
                injurySide: i.injurySide ?? 0,
                injuryDate: i.injuryDate ?? '',
                inactivityDurationValue: i.inactivityDurationValue ?? 0,
                inactivityDurationUnit: i.inactivityDurationUnit ?? 0,
                isSportRelated: i.isSportRelated ?? true,
                seenSpecialist: i.seenSpecialist ?? false,
                specialistsConsulted: i.specialistsConsulted ?? [],
                prescribedTreatments: i.prescribedTreatments ?? 0,
                otherPrescribedTreatment: i.otherPrescribedTreatment ?? '',
                hadDiagnosticTests: i.hadDiagnosticTests ?? false,
                diagnosticTests: i.diagnosticTests ?? 0,
                otherDiagnosticTest: i.otherDiagnosticTest ?? '',
                painLocations: i.painLocations ?? []
            },
            injuryHistory: {
                previousInjuries: h.previousInjuries ?? [],
                previousSurgeries: h.previousSurgeries ?? []
            },
            medicalHistory: {
                currentConditions: m.currentConditions ?? 0,
                otherConditions: m.otherConditions ?? '',
                medications: m.medications ?? [],
                knownAllergies: m.knownAllergies ?? '',
                hadCovid: m.hadCovid ?? false,
                covidTimesCount: m.covidTimesCount ?? 0,
                covidVaccinated: m.covidVaccinated ?? false,
                vaccineType: m.vaccineType ?? '',
                vaccineDoses: m.vaccineDoses ?? 0,
                fatherConditions: m.fatherConditions ?? 0,
                fatherOtherConditions: m.fatherOtherConditions ?? '',
                motherConditions: m.motherConditions ?? 0,
                motherOtherConditions: m.motherOtherConditions ?? ''
            },
            socialProfile: {
                occupation: soc.occupation ?? '',
                workNature: soc.workNature ?? 0,
                dailySittingHours: soc.dailySittingHours ?? 0,
                maritalStatus: soc.maritalStatus ?? 0,
                habits: soc.habits ?? 0,
                isWorkStressful: soc.isWorkStressful ?? false,
                hasChildren: soc.hasChildren ?? false
            },
            ui: {
                prescribedTreatmentsSelected: this.decodeBitmask(i.prescribedTreatments, PRESCRIBED_TREATMENT_FLAGS),
                diagnosticTestsSelected: this.decodeBitmask(i.diagnosticTests, DIAGNOSTIC_TEST_FLAGS),
                chronicConditionsSelected: this.decodeBitmask(m.currentConditions, DISEASE_CONDITION_FLAGS),
                fatherConditionsSelected: this.decodeBitmask(m.fatherConditions, DISEASE_CONDITION_FLAGS),
                motherConditionsSelected: this.decodeBitmask(m.motherConditions, DISEASE_CONDITION_FLAGS),
                habitsSelected: this.decodeBitmask(soc.habits, HABIT_FLAGS),
                inactivityDurationUnitLabel: i.inactivityDurationUnit === 0 ? 'days' : i.inactivityDurationUnit === 2 ? 'months' : 'weeks',
                injurySideLabel: i.injurySide === 0 ? 'right' : i.injurySide === 1 ? 'left' : 'both',
                workNatureLabel: soc.workNature === 0 ? 'مكتبي' : 'ميداني'
            },
            selectedMuscles: mapPainLocationsToMuscleNames(i.painLocations ?? [])
        });
    }

    private decodeBitmask(mask: number, map: Record<string, number>): string[] {
        if (!mask) return [];
        return Object.keys(map).filter(key => (mask & map[key]) === map[key]);
    }
}