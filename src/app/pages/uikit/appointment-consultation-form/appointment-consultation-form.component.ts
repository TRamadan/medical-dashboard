import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { DatePickerModule } from 'primeng/datepicker';
import { SliderModule } from 'primeng/slider';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { PatientFormService } from '../appointments/services/patient-form.service';
import { PATIENT_FORM_MOCKS, MockPatientPreset } from '../appointments/mock-data/patient-form-mocks';
import { MuscleSkeletonViewerComponent } from '../appointments/muscle-skeleton-viewer/muscle-skeleton-viewer.component';

@Component({
    selector: 'app-appointment-consultation-form',
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        TabsModule,
        DatePickerModule,
        SliderModule,
        SelectButtonModule,
        CheckboxModule,
        SelectModule,
        CardModule,
        TooltipModule,
        MuscleSkeletonViewerComponent,
    ],
    templateUrl: './appointment-consultation-form.component.html',
    styleUrl: './appointment-consultation-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentConsultationFormComponent implements OnInit {

    protected readonly _patientFormService = inject(PatientFormService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly location = inject(Location);

    displayCompletePatientInfoDialog = true;
    currentPatientRow: unknown = { id: 0 };

    ngOnInit(): void {
        const id = this.route.snapshot.params['id'] || this.route.snapshot.queryParams['id'];
        if (id) {
            this.currentPatientRow = { id: +id };
        } else if (!this.currentPatientRow) {
            this.currentPatientRow = { id: 0 };
        }
    }


    /** Local mutable copy — bound via ngModel. Synced to service on change. */
    patientForm = this._patientFormService.form();

    // ── Test / Mock data presets ─────────────────────────────────────────────
    readonly mockPresets: MockPatientPreset[] = PATIENT_FORM_MOCKS;
    selectedMockId: string | null = null;
    dateOfBirthValue: Date | null = null;
    injuryDateValue: Date | null = null;

    // ── Options ──────────────────────────────────────────────────────────────
    bookingForSelfOptions = [
        { label: 'نعم — لي', value: true },
        { label: 'لا — لشخص آخر', value: false }
    ];

    yesNoOptions = [
        { label: 'نعم', value: true },
        { label: 'لا', value: false }
    ];

    workNatureOptions = [
        { label: 'مكتبي', value: 'مكتبي' },
        { label: 'ميداني', value: 'ميداني' }
    ];

    maritalStatusOptions = [
        { label: 'متزوج', value: 1 },
        { label: 'أعزب', value: 0 }
    ];

    injurySideOptions = [
        { label: 'يمين', value: 'right' },
        { label: 'يسار', value: 'left' },
        { label: 'كلاهما', value: 'both' }
    ];

    inactivityDurationUnitOptions = [
        { label: 'أيام', value: 'days' },
        { label: 'أسابيع', value: 'weeks' },
        { label: 'أشهر', value: 'months' }
    ];

    habitsOptions = [
        { label: 'التدخين', value: 'smoking' },
        { label: 'الكحوليات', value: 'alcohol' },
        { label: 'المكيفات', value: 'stimulants' },
        { label: 'لا يوجد', value: 'none' }
    ];

    diagnosticTestOptions = [
        { label: 'أشعة X', value: 'xray' },
        { label: 'رنين مغناطيسي (MRI)', value: 'mri' },
        { label: 'مقطعية (CT)', value: 'ct' },
        { label: 'رسم عضلات', value: 'emg_muscle' },
        { label: 'رسم عصب', value: 'emg_nerve' },
        { label: 'موجات صوتية (سونار)', value: 'ultrasound' },
        { label: 'مسح عظام', value: 'bone_scan' },
        { label: 'أخرى', value: 'other' }
    ];

    prescribedTreatmentOptions = [
        { label: 'علاج دوائي', value: 'medication' },
        { label: 'علاج فيزيائي', value: 'physio' },
        { label: 'تأهيل رياضي', value: 'rehab' },
        { label: 'راحة', value: 'rest' },
        { label: 'أخرى', value: 'other' }
    ];

    diseaseOptions = [
        'ارتفاع ضغط الدم',
        'أمراض القلب',
        'اضطرابات السكر',
        'الأورام',
        'الصرع',
        'الجلطات',
        'اضطرابات الغدة الدرقية',
        'الربو',
        'اضطرابات الكلى',
        'أمراض جلدية'
    ];

    // ── Public API called by AppointmentsComponent ───────────────────────────
    open(row: unknown): void {
        this.currentPatientRow = row;
        this._patientFormService.reset();
        this._patientFormService.patch({
            personalData: {
                ...this._patientFormService.form().personalData,
                fullName: (row as Record<string, string>)['patientNameEn'] || ''
            }
        });
        this.refreshFromService();
        this.displayCompletePatientInfoDialog = true;
    }

    goBack(): void {
        this.location.back();
    }

    closePatientInfoDialog(): void {
        this.displayCompletePatientInfoDialog = false;
        this.goBack();
    }

    savePatientInfo(): void {
        if (!this.currentPatientRow) return;
        this.syncForm();
        const appointmentId = (this.currentPatientRow as Record<string, number>)['id'] || 0;
        this._patientFormService.submitConsultationProfile(appointmentId).subscribe({
            next: () => this.goBack()
        });
    }

    // ── Mock data ────────────────────────────────────────────────────────────
    loadMock(id: string | null): void {
        if (!id) return;
        const preset = this.mockPresets.find(p => p.id === id);
        if (!preset) return;
        const clone = JSON.parse(JSON.stringify(preset.data));
        this._patientFormService.form.set(clone);
        setTimeout(() => this.refreshFromService(), 0);
    }

    // ── Sync helpers ─────────────────────────────────────────────────────────
    syncForm(): void {
        this._patientFormService.form.set({ ...this.patientForm });
    }

    private refreshFromService(): void {
        this.patientForm = this._patientFormService.form();

        const newDobStr = this.patientForm.personalData.dateOfBirth;
        if (newDobStr) {
            const newTime = new Date(newDobStr).getTime();
            const oldTime = this.dateOfBirthValue ? this.dateOfBirthValue.getTime() : null;
            if (newTime !== oldTime) this.dateOfBirthValue = new Date(newDobStr);
        } else {
            this.dateOfBirthValue = null;
        }

        const newInjStr = this.patientForm.injuryData.injuryDate;
        if (newInjStr) {
            const newTime = new Date(newInjStr).getTime();
            const oldTime = this.injuryDateValue ? this.injuryDateValue.getTime() : null;
            if (newTime !== oldTime) this.injuryDateValue = new Date(newInjStr);
        } else {
            this.injuryDateValue = null;
        }
    }

    // ── Booking context (Tab 1) ───────────────────────────────────────────────
    setBookingForSelf(val: boolean): void {
        this.patientForm.personalData.bookingForSelf = val;
        if (val) {
            this.patientForm.personalData.fillerRelation = '';
            this.patientForm.personalData.fillerName = '';
            this.patientForm.personalData.fillerMobile = '';
        }
        this.syncForm();
    }

    sanitizePhoneInput(event: Event, field: 'phone' | 'emergencyPhone' | 'fillerMobile'): void {
        const input = event.target as HTMLInputElement;
        const digitsOnly = input.value.replace(/\D/g, '').slice(0, 11);
        input.value = digitsOnly;
        if (field === 'phone') {
            this.patientForm.personalData.phoneNumber = digitsOnly;
        } else if (field === 'emergencyPhone') {
            this.patientForm.personalData.emergencyPhone = digitsOnly;
        } else {
            this.patientForm.personalData.fillerMobile = digitsOnly;
        }
        this.syncForm();
    }

    // ── Date pickers ──────────────────────────────────────────────────────────
    onDateOfBirthChange(date: Date | null): void {
        this._patientFormService.setDateOfBirth(date);
        this.refreshFromService();
    }

    onInjuryDateChange(date: Date | null): void {
        this._patientFormService.setInjuryDate(date);
        this.refreshFromService();
    }

    // ── Specialists (Tab 4) ───────────────────────────────────────────────────
    addSpecialist(): void {
        if (!this.patientForm.injuryData.specialistsConsulted) {
            this.patientForm.injuryData.specialistsConsulted = [];
        }
        this.patientForm.injuryData.specialistsConsulted.push(
            { id: 0, doctorName: '', specialty: '', diagnosis: '', communicationMethod: '' }
        );
        this.syncForm();
    }

    removeSpecialist(index: number): void {
        this.patientForm.injuryData.specialistsConsulted?.splice(index, 1);
        this.syncForm();
    }

    // ── Previous injuries (Tab 5) ─────────────────────────────────────────────
    addPreviousInjury(): void {
        if (!this.patientForm.injuryHistory.previousInjuries) {
            this.patientForm.injuryHistory.previousInjuries = [];
        }
        this.patientForm.injuryHistory.previousInjuries.push(
            { id: 0, description: '', bodyPart: '', injuryDate: '', treatmentReceived: '' }
        );
        this.syncForm();
    }

    removePreviousInjury(index: number): void {
        this.patientForm.injuryHistory.previousInjuries?.splice(index, 1);
        this.syncForm();
    }

    // ── Surgeries (Tab 5) ─────────────────────────────────────────────────────
    addSurgery(): void {
        if (!this.patientForm.injuryHistory.previousSurgeries) {
            this.patientForm.injuryHistory.previousSurgeries = [];
        }
        this.patientForm.injuryHistory.previousSurgeries.push(
            { id: 0, description: '', surgeryType: '', surgeryDate: '' }
        );
        this.syncForm();
    }

    removeSurgery(index: number): void {
        this.patientForm.injuryHistory.previousSurgeries?.splice(index, 1);
        this.syncForm();
    }

    // ── Medications (Tab 6) ───────────────────────────────────────────────────
    addMedication(): void {
        if (!this.patientForm.medicalHistory.medications) {
            this.patientForm.medicalHistory.medications = [];
        }
        this.patientForm.medicalHistory.medications.push({ id: 0, name: '', dose: '', frequency: '' });
        this.syncForm();
    }

    removeMedication(index: number): void {
        this.patientForm.medicalHistory.medications?.splice(index, 1);
        this.syncForm();
    }

    // ── Muscle skeleton (Tab 3) ───────────────────────────────────────────────
    onMusclesChange(muscles: string[]): void {
        this._patientFormService.setSelectedMuscles(muscles);
        this.refreshFromService();
    }

    // ── Chip / checkbox toggles ───────────────────────────────────────────────
    togglePrescribedTreatment(value: string): void {
        this._patientFormService.togglePrescribedTreatment(value);
        this.refreshFromService();
    }

    isPrescribedTreatmentSelected(value: string): boolean {
        return !!this.patientForm.ui.prescribedTreatmentsSelected?.includes(value);
    }

    toggleChronicCondition(value: string): void {
        this._patientFormService.toggleChronicCondition(value);
        this.refreshFromService();
    }

    toggleFatherCondition(value: string): void {
        this._patientFormService.toggleFatherCondition(value);
        this.refreshFromService();
    }

    toggleMotherCondition(value: string): void {
        this._patientFormService.toggleMotherCondition(value);
        this.refreshFromService();
    }

    isChipSelected(
        field: 'chronicConditionsSelected' | 'fatherConditionsSelected' | 'motherConditionsSelected',
        value: string
    ): boolean {
        return !!this.patientForm.ui[field]?.includes(value);
    }

    toggleHabit(value: string): void {
        this._patientFormService.toggleHabit(value);
        this.refreshFromService();
    }

    isHabitSelected(value: string): boolean {
        return !!this.patientForm.ui.habitsSelected?.includes(value);
    }

    toggleDiagnosticTest(value: string): void {
        this._patientFormService.toggleDiagnosticTest(value);
        this.refreshFromService();
    }

    isDiagnosticTestSelected(value: string): boolean {
        return !!this.patientForm.ui.diagnosticTestsSelected?.includes(value);
    }

    // ── Enum-mapped select-button handlers ────────────────────────────────────
    onWorkNatureChange(label: string): void {
        this._patientFormService.setWorkNature(label);
        this.refreshFromService();
    }

    onInjurySideChange(label: 'right' | 'left' | 'both'): void {
        this._patientFormService.setInjurySide(label);
        this.refreshFromService();
    }

    onInactivityDurationUnitChange(label: 'days' | 'weeks' | 'months'): void {
        this._patientFormService.setInactivityDurationUnit(label);
        this.refreshFromService();
    }
}
