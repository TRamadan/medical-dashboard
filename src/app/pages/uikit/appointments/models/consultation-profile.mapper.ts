import { ConsultationProfileRequest } from '../models/appointment';

/**
 * Your UI uses multi-select checkboxes/chips for several fields, but the API
 * expects a single number for each. These maps assume a [Flags]-style bitmask
 * enum on the backend (sum of powers of 2). CONFIRM the actual numeric values
 * with the backend team — these are placeholders based on declaration order.
 */
export const PRESCRIBED_TREATMENT_FLAGS: Record<string, number> = {
    medication: 1, physio: 2, rehab: 4, rest: 8, other: 16
};

export const DISEASE_CONDITION_FLAGS: Record<string, number> = {
    'ارتفاع ضغط الدم': 1, 'أمراض القلب': 2, 'اضطرابات السكر': 4, 'الأورام': 8,
    'الصرع': 16, 'الجلطات': 32, 'اضطرابات الغدة الدرقية': 64, 'الربو': 128,
    'اضطرابات الكلى': 256, 'أمراض جلدية': 512
};

export const HABIT_FLAGS: Record<string, number> = {
    smoking: 1, alcohol: 2, stimulants: 4, none: 8
};

// Single-select fields — still need confirmed numeric values from backend.
export const WORK_NATURE_MAP: Record<string, number> = { 'مكتبي': 0, 'ميداني': 1 };
export const INACTIVITY_UNIT_MAP: Record<string, number> = { days: 0, weeks: 1, months: 2 };
export const INJURY_SIDE_MAP: Record<string, number> = { right: 0, left: 1, both: 2 };

function sumFlags(selected: string[] | undefined, map: Record<string, number>): number {
    return (selected ?? []).reduce((sum, key) => sum + (map[key] ?? 0), 0);
}

function toIsoDate(value: any): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function mapToConsultationProfileRequest(form: any): ConsultationProfileRequest {
    return {
        personalData: {
            fullName: form.fullName ?? '',
            dateOfBirth: toIsoDate(form.dateOfBirth),
            address: form.address ?? '',
            phoneNumber: form.phone ?? '',
            emergencyPhone: form.emergencyPhone ?? '',
            emergencyRelation: form.emergencyRelation ?? '',
            bookingForSelf: form.bookingForSelf ?? true
        },
        sportsData: {
            sport: form.sport ?? '',
            playCenter: form.position ?? '',
            yearsOfPractice: form.practiceYears ?? 0,
            clubName: form.club ?? '',
            highestAchievement: form.topAchievement ?? ''
        },
        injuryData: {
            bodyMapData: form.bodyMapData ?? '', // TODO: app-contact-us is a placeholder — no real body-map data yet
            painLevel: form.currentPain ?? 0,
            functionalLevel: form.painEffectOnPerformance ?? 0,
            dailyActivityLevel: form.dailyActivityLevel ?? 0, // TODO: no slider bound to this yet — add one (see notes)
            injuryDescription: form.injuryDescription ?? '',
            injuryName: form.injuryName ?? '',                // TODO: no input bound yet — add one (see notes)
            injurySide: INJURY_SIDE_MAP[form.injurySide] ?? 0, // TODO: no selector bound yet — add one (see notes)
            injuryDate: toIsoDate(form.injuryDate),
            inactivityDurationValue: form.inactivityDurationValue ?? 0, // TODO: currently one free-text field — split it
            inactivityDurationUnit: INACTIVITY_UNIT_MAP[form.inactivityDurationUnit] ?? 1,
            isSportRelated: form.injuryRelatedToSport ?? true,
            seenSpecialist: form.wasExamined ?? false,
            prescribedTreatments: sumFlags(form.prescribedTreatments, PRESCRIBED_TREATMENT_FLAGS),
            hadDiagnosticTests: form.hadDiagnosticTests ?? false
        },
        injuryHistory: {
            previousInjuries: (form.previousInjuries ?? []).map((inj: any) => ({
                id: inj.id ?? 0,
                description: inj.description ?? '',
                bodyPart: inj.name ?? '',
                injuryDate: toIsoDate(inj.date),
                treatmentReceived: inj.treatmentReceived ?? '' // TODO: no input bound in tab 5 yet
            })),
            previousSurgeries: (form.surgeries ?? []).map((s: any) => ({
                id: s.id ?? 0,
                description: s.notes ?? '',
                surgeryType: s.type ?? '',
                surgeryDate: toIsoDate(s.year) // TODO: template stores "year" as free text, not a real date
            }))
        },
        medicalHistory: {
            currentConditions: sumFlags(form.chronicConditions, DISEASE_CONDITION_FLAGS),
            otherConditions: form.chronicConditionsOtherText ?? '',
            medications: (form.regularMedications ?? []).map((m: any) => ({
                id: m.id ?? 0,
                name: m.name ?? '',
                dose: m.dose ?? '',
                frequency: m.duration ?? '' // TODO: UI field is "duration", API wants "frequency" — confirm these mean the same thing
            })),
            knownAllergies: form.allergies ?? '',
            hadCovid: form.hadCovid ?? false,
            covidVaccinated: form.hadCovidVaccine ?? false,
            fatherConditions: sumFlags(form.fatherConditions, DISEASE_CONDITION_FLAGS),
            fatherOtherConditions: form.fatherConditionsOtherText ?? '',
            motherConditions: sumFlags(form.motherConditions, DISEASE_CONDITION_FLAGS),
            motherOtherConditions: form.motherConditionsOtherText ?? ''
        },
        socialProfile: {
            occupation: form.jobTitle ?? '',
            workNature: WORK_NATURE_MAP[form.workNature] ?? 0,
            dailySittingHours: form.dailySittingHours ?? 0,
            maritalStatus: form.isMarried ? 1 : 0, // TODO: confirm real enum — likely more than married/single
            habits: sumFlags(form.habits, HABIT_FLAGS),
            isWorkStressful: form.highWorkStress ?? false
        }
    };
}