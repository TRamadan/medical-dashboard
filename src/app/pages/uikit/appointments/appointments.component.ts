import { Component, OnInit, signal, ViewChild, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule } from 'primeng/paginator';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { TableColumn, TableComponent } from '../../../shared/table/table.component';
import { Appointment } from './models/appointment';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { AppointmentService } from './services/appointment.service';
import { LocationService } from '../add-location/services/location.service';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { CardModule } from "primeng/card";
import { BadgeModule } from 'primeng/badge';
import { AppointmentsDetailsComponent } from './appointments-details/appointments-details.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SliderModule } from 'primeng/slider';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ContactUsComponent } from '../contact-us/contact-us.component';
import { MuscleSkeletonViewerComponent } from './muscle-skeleton-viewer/muscle-skeleton-viewer.component';
import { PatientFormService } from './services/patient-form.service';
import { PATIENT_FORM_MOCKS, MockPatientPreset } from './mock-data/patient-form-mocks';
import { SelectModule } from 'primeng/select';
import { ViewSide, BodyState } from 'body-muscles';


@Component({
    selector: 'app-appointments',
    standalone: true,
    imports: [
        CardModule,
        ProgressSpinnerModule,
        ConfirmPopupModule,
        CommonModule,
        TableComponent,
        BookingFormComponent,
        FormsModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        TextareaModule,
        DropdownModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        TabsModule,
        DatePickerModule,
        BadgeModule,
        AppointmentsDetailsComponent,
        PaginatorModule,
        TooltipModule,
        CheckboxModule,
        SliderModule,
        SelectButtonModule,
        SelectModule,
        ContactUsComponent,
        MuscleSkeletonViewerComponent
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './appointments.component.html',
    styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
    ViewSide = ViewSide;
    currentView: ViewSide = ViewSide.FRONT;

    muscleState: BodyState = {
        'biceps-left': { intensity: 7, selected: true },
        'chest-upper-right': { intensity: 4, selected: false }
    };

    toggleView(): void {
        this.currentView = this.currentView === ViewSide.FRONT ? ViewSide.BACK : ViewSide.FRONT;
    }

    onMuscleClicked(event: { id: string; name: string }): void {
        const currentState = this.muscleState[event.id] || { intensity: 0, selected: false };

        this.muscleState = {
            ...this.muscleState,
            [event.id]: {
                ...currentState,
                selected: !currentState.selected
            }
        };
    }
    allAppointments = signal<Appointment[]>([]);
    filteredAppointments: Appointment[] = []; // Store filtered appointments
    groupedUrgentAppointments: { date: string; appointments: Appointment[] }[] = [];
    loading = signal(false);
    // New lists for tabs
    pendingAppointments: Appointment[] = [];
    confirmedAppointments: Appointment[] = [];
    cancelledAppointments: Appointment[] = [];
    rescheduledAppointments: Appointment[] = [];
    completedAppointments: Appointment[] = [];

    appointmentsMap: Record<number, {
        list: any[];
        grouped: any[];
        pageNumber: number;
        pageSize: number;
        totalRecords: number;
    }> = {
            0: { list: [], grouped: [], pageNumber: 1, pageSize: 10, totalRecords: 0 }, // Pending
            1: { list: [], grouped: [], pageNumber: 1, pageSize: 10, totalRecords: 0 }, // Confirmed
            3: { list: [], grouped: [], pageNumber: 1, pageSize: 10, totalRecords: 0 }, // Cancelled
            4: { list: [], grouped: [], pageNumber: 1, pageSize: 10, totalRecords: 0 }, // Re-scheduled
            2: { list: [], grouped: [], pageNumber: 1, pageSize: 10, totalRecords: 0 }  // Completed
        };

    urgentSection = { pageNumber: 1, pageSize: 10, totalRecords: 0 };

    dateRange: Date[] = [];

    locations: any[] = [];
    selectedLocation: any | null = null;
    selectedCard: string | number = 'urgent';

    pendingAppointmentsCount: number = 0;
    approvedAppointmentsCount: number = 0;
    canceledAppointmentsCount: number = 0;
    rescheduledAppointmentsCount: number = 0;
    completedAppointmentsCount: number = 0;

    @ViewChild('dt') dt!: Table;
    @ViewChild('isPaidTemplate', { static: true }) isPaidTemplate!: any;

    tableHeaders: TableColumn[] = [];
    tableActions: any[] = [];
    globalFilterFields: string[] = [];
    displayNewAppointmentDialog: boolean = false;
    rowsPerPageOptions: number[] = [10, 20, 30];
    totalRecords: number = 0;

    constructor(
        private _appointmentService: AppointmentService,
        private _locationService: LocationService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.initializeTable();
        this.getAllLocations();
    }
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

    // Shared fixed disease list for the client / father / mother chip pickers (Tab 6)
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

    initializeTable() {
        this.tableHeaders = [
            { field: 'id', label: 'Appointment ID', type: 'text' },
            { field: 'patientNameEn', label: 'Client Name', type: 'text' },
            { field: 'doctorNameEn', label: 'Assigned To', type: 'text' },
            { field: 'serviceNameEn', label: 'Service', type: 'text' },
            { field: 'locationNameEn', label: 'Location', type: 'text' },
            { field: 'startTime', label: 'Start time', type: 'time' },
            { field: 'endTime', label: 'End time', type: 'time' },
            { field: 'isPaid', label: 'Is Paid', type: 'custom', customTemplate: this.isPaidTemplate },
            { field: 'status', label: 'Status', type: 'status' }
        ];
        this.tableHeaders.forEach((h) => this.globalFilterFields.push(h.field));

        this.tableActions = [
            {
                label: 'Complete Info',
                icon: 'pi pi-user-edit',
                type: 'primary',
                tooltip: 'Complete Patient Info',
                onClick: (row: any) => this.openCompletePatientInfo(row)
            }
        ];
    }

    // ── Specialists consulted (Tab 4) — now injuryData.specialistsConsulted, matching the API 1:1 ──
    addSpecialist(): void {
        if (!this.patientForm.injuryData.specialistsConsulted) {
            this.patientForm.injuryData.specialistsConsulted = [];
        }
        this.patientForm.injuryData.specialistsConsulted.push({ id: 0, doctorName: '', specialty: '', diagnosis: '', communicationMethod: '' });
        this.syncForm();
    }

    removeSpecialist(index: number): void {
        this.patientForm.injuryData.specialistsConsulted?.splice(index, 1);
        this.syncForm();
    }

    getAllLocations() {
        this._locationService.getLocations().subscribe({
            next: (data) => {
                this.locations = data;
                // Optionally select the first location by default? 
                // For now, per requirements, we might just leave it null to show placeholder.
            },
            error: (err) => console.error('Failed to load locations', err)
        });
    }

    onLocationChange() {
        this.filterAppointments();
        this.selectCard(this.selectedCard);
        this.updateCounts();
    }

    filterAppointments() {
        if (!this.selectedLocation) {
            this.filteredAppointments = [];
            this.groupedUrgentAppointments = [];
            return;
        } else {
            // Reset pages when location changes
            this.urgentSection.pageNumber = 1;
            Object.values(this.appointmentsMap).forEach(tab => tab.pageNumber = 1);
            this.loadUrgentAppointments();
        }
    }

    loadUrgentAppointments(): void {
        this.loading.set(true);
        this._appointmentService.getFilteredAppointments(
            { locationId: this.selectedLocation.id, isUrgent: true },
            this.urgentSection.pageNumber,
            this.urgentSection.pageSize
        ).subscribe((response: any) => {
            this.loading.set(false);
            const appointments = response.items || [];
            this.allAppointments.set(appointments);
            this.groupedUrgentAppointments = this.groupAppointmentsByDate(appointments);
            this.urgentSection.totalRecords = response.totalCount ?? 0;
        });
    }

    parsedDates: any = {}
    onDateRangeSelect() {

        if (this.dateRange != null) {
            const [startDate, endDate] = this.dateRange;

            if (startDate && endDate) {
                this.parsedDates = {
                    startDate: this.formatLocalDate(startDate),
                    endDate: this.formatLocalDate(endDate),
                };
                if (typeof this.selectedCard === 'number') {
                    this.loadAppointments(this.selectedCard);
                }
            }
        }
        else {
            this.parsedDates.startDate = null;
            this.parsedDates.endDate = null;
            if (typeof this.selectedCard === 'number') {
                this.loadAppointments(this.selectedCard);
            }
        }

    }

    private formatLocalDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    selectCard(cardId: string | number): void {
        this.selectedCard = cardId;
        if (typeof cardId === 'number') {
            this.loadAppointments(cardId);
        } else if (cardId === 'urgent') {
            this.loadUrgentAppointments();
        }
    }

    loadAppointments(statusId: number, pageNumber?: number, pageSize?: number): void {
        const target = this.appointmentsMap[statusId];
        if (!target) return;

        if (pageNumber !== undefined) target.pageNumber = pageNumber;
        if (pageSize !== undefined) target.pageSize = pageSize;

        const fromDate = this.parsedDates?.startDate;
        const toDate = this.parsedDates?.endDate;

        this.loading.set(true);

        this._appointmentService.getFilteredAppointments({
            locationId: this.selectedLocation?.id,
            status: statusId.toString(),
            fromDate,
            toDate,
        }, target.pageNumber, target.pageSize).subscribe({
            next: (response) => {
                this.loading.set(false);
                target.list = response.items;
                target.grouped = this.groupAppointmentsByDate(response.items);
                target.totalRecords = response.totalCount ?? 0;
            },
            error: (err) => {
                this.loading.set(false);
                console.error('Failed to load appointments', err);
            }
        });
    }

    onPageChangeForTab(statusId: number, event: any): void {
        if (!this.selectedLocation) return;
        const page = Math.floor((event.first ?? 0) / (event.rows ?? 10)) + 1;
        const size = event.rows ?? 10;
        this.loadAppointments(statusId, page, size);
    }

    onPageChangeForUrgent(event: any): void {
        if (!this.selectedLocation) return;
        this.urgentSection.pageNumber = Math.floor((event.first ?? 0) / (event.rows ?? 10)) + 1;
        this.urgentSection.pageSize = event.rows ?? 10;
        this.loadUrgentAppointments();
    }

    updateCounts() {
        this._appointmentService.getAppointmentsCountByStatus(this.selectedLocation.id).subscribe((response: any) => {
            const counts = response;
            this.pendingAppointmentsCount = counts.pending;
            this.approvedAppointmentsCount = counts.confirmed;
            this.canceledAppointmentsCount = counts.cancelled;
            this.rescheduledAppointmentsCount = counts.rescheduled ? counts.rescheduled : 0;
            this.completedAppointmentsCount = counts.completed;
        });
    }

    /**
     * Groups appointments by their date field
     */
    private groupAppointmentsByDate(appointments: Appointment[]): { date: string; appointments: Appointment[] }[] {
        const grouped: { [key: string]: Appointment[] } = {};

        appointments?.forEach((item: any) => {
            // Extract only the date part (assuming item.starttime is ISO string or has date info)
            const dateKey = new Date(item.startTime).toISOString().split('T')[0];
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(item);
        });

        // Convert object to array and sort by date
        return Object.keys(grouped)
            .sort()
            .map((date) => ({
                date,
                appointments: grouped[date]
            }));
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNewAppointmentDialog() {
        this.appointmentToEdit = null;
        this.displayNewAppointmentDialog = true;
    }

    openEditAppointmentDialog(appointment: any) {
        this.appointmentToEdit = appointment;
        this.displayNewAppointmentDialog = true;
    }

    onDialogHide() {
        this.appointmentToEdit = null;
    }

    hideDialog(): void {
        this.displayNewAppointmentDialog = false;
    }

    onBookingSuccess(): void {
        this.hideDialog();
    }

    selectedAppointment: any;
    appointmentToEdit: any = null;
    displayStatusDialog = false;
    selectedStatusId: any;
    markPaidLoading = signal<number | null>(null); // holds the row id being updated

    /** Called when the isPaid checkbox is toggled.
     *  Uses the consultationProfileId (row.id) to call mark-paid. */
    onIsPaidChange(row: any): void {
        const id = row.id;
        if (this.markPaidLoading() !== null) return; // prevent concurrent calls

        // Optimistic toggle already applied by ngModel — store previous value for rollback
        const previousValue = !row.isPaid;
        this.markPaidLoading.set(id);

        this._appointmentService.markAsPaid(id).subscribe({
            next: () => {
                this.markPaidLoading.set(null);
                this.messageService.add({
                    severity: 'success',
                    summary: 'تم التحديث',
                    detail: row.isPaid ? 'تم تأكيد الدفع بنجاح.' : 'تم إلغاء تأكيد الدفع بنجاح.',
                    life: 4000
                });
                this.selectCard(this.selectedCard);
            },
            error: (err) => {
                this.markPaidLoading.set(null);
                // Roll back the optimistic update
                row.isPaid = previousValue;
                const apiErrors = err?.error as { errors?: { errorEn?: string }[] } | undefined;
                const errorMsg = apiErrors?.errors?.[0]?.errorEn
                    ?? err?.message
                    ?? 'فشل تحديث حالة الدفع. يرجى المحاولة مرة أخرى.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'خطأ في التحديث',
                    detail: errorMsg,
                    life: 6000
                });
            }
        });
    }


    statuses = [
        { id: 0, label: 'Pending', color: 'warn' },
        { id: 1, label: 'Confirmed', color: 'success' },
        { id: 3, label: 'Cancelled', color: 'danger' },
        { id: 4, label: 'Re-scheduled', color: 'help' },
        { id: 2, label: 'Completed', color: 'info' }
    ];

    openStatusDialog(appointment: any) {
        if (appointment.status == 0) {
            this.selectedAppointment = appointment;
            this.selectedStatusId = appointment.status;
            this.displayStatusDialog = true;
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Status Updated',
                detail: `You cannot change this appointment status, it's status is ${this.getStatusLabel(appointment.status)}`
            });
        }
    }

    confirmStatusChange() {
        if (!this.selectedAppointment || this.selectedStatusId === null) return;
        this._appointmentService.updateAppointmentStatus(this.selectedAppointment.id, this.selectedStatusId).subscribe({
            next: (res: any) => {
                if (this.selectedStatusId === 1) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Appointment Confirmed',
                        detail: 'A mail has been sent to the user and the appointment confirmed successfully.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Status Updated',
                        detail: `Appointment status changed to ${this.getStatusLabel(this.selectedStatusId)}`
                    });
                }
                this.loadUrgentAppointments();
                if (typeof this.selectedCard === 'number') {
                    this.loadAppointments(this.selectedCard);
                }
                this.updateCounts();
            },
            error: (error: any) => {
                //error handle goes here
            }
        });

        // Optionally update local data
        this.selectedAppointment.status = this.selectedStatusId;

        this.displayStatusDialog = false;
    }

    cancelStatusChange() {
        this.displayStatusDialog = false;
    }

    getStatusLabel(status: number | string): string {
        if (status === 'urgent') return 'Urgent';
        const s = this.statuses.find((st) => st.id === status);
        return s ? s.label : 'Unknown';
    }

    displayCompletePatientInfoDialog: boolean = false;
    currentPatientRow: any = null;

    // ── Dropdown / Checkbox / Radio Options ───────────────────────
    // Kept from the original form in case other parts of the app still reference them.
    genderOptions = [{ label: 'ذكر', value: 'male' }, { label: 'أنثى', value: 'female' }];

    performanceEngineerOptions = [
        { label: 'مهندس 1', value: '1' },
        { label: 'مهندس 2', value: '2' }
    ];

    // ── Options for the new tabbed patient-info form ──────────────
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

    // NOTE: socialProfile.maritalStatus is typed as `number` in the API contract
    // (ConsultationProfileRequest), not boolean — CONFIRM the real numeric values
    // with the backend team, same as the other enum-like fields below.
    maritalStatusOptions = [
        { label: 'متزوج', value: 1 },
        { label: 'أعزب', value: 0 }
    ];

    // ui.injurySideLabel options — feeds INJURY_SIDE_MAP in the service (right=0, left=1, both=2)
    injurySideOptions = [
        { label: 'يمين', value: 'right' },
        { label: 'يسار', value: 'left' },
        { label: 'كلاهما', value: 'both' }
    ];

    // ui.inactivityDurationUnitLabel options — feeds INACTIVITY_UNIT_MAP in the service (days=0, weeks=1, months=2)
    inactivityDurationUnitOptions = [
        { label: 'أيام', value: 'days' },
        { label: 'أسابيع', value: 'weeks' },
        { label: 'أشهر', value: 'months' }
    ];

    procedureTypeOptions = [
        { label: 'دواء', value: 'medication' },
        { label: 'علاج طبيعي', value: 'physio' },
        { label: 'تأهيل', value: 'rehab' },
        { label: 'راحة', value: 'rest' }
    ];

    diagnosticMethodsOptions = [
        { label: 'فحص سريري', value: 'clinical' },
        { label: 'أشعة', value: 'imaging' },
        { label: 'تحاليل', value: 'lab' }
    ];

    habitsOptions = [
        { label: 'التدخين', value: 'smoking' },
        { label: 'الكحوليات', value: 'alcohol' },
        { label: 'المكيفات', value: 'stimulants' },
        { label: 'لا يوجد', value: 'none' }
    ];

    // ── Patient Form Model ── shared via PatientFormService ───────────────────
    protected readonly _patientFormService = inject(PatientFormService);
    /** Local mutable copy — bound via ngModel. Synced to service on change. */
    patientForm = this._patientFormService.form();

    // ── Test / Mock data presets ─────────────────────────────────────────────
    readonly mockPresets: MockPatientPreset[] = PATIENT_FORM_MOCKS;
    selectedMockId: string | null = null;
    dateOfBirthValue: Date | null = null;
    injuryDateValue: Date | null = null;

    /** Load a mock preset into the form for quick testing.
     *  Uses JSON deep-clone to avoid shared object references, and
     *  defers the local patientForm refresh to the next tick so the
     *  signal settles before Angular re-renders the bound templates. */
    loadMock(id: string | null): void {

        if (!id) return;
        const preset = this.mockPresets.find(p => p.id === id);
        if (!preset) return;
        // Deep-clone to prevent shared references between the mock constant and live form
        const clone = JSON.parse(JSON.stringify(preset.data));
        this._patientFormService.form.set(clone);
        // Defer patientForm re-assignment so the current CD cycle finishes first.
        // Without this the ngModel two-way bindings on nested objects crash Angular.
        setTimeout(() => this.refreshFromService(), 0);
    }

    /** Call this from (ngModelChange) or any change event to keep the service in sync. */
    syncForm(): void {
        this._patientFormService.form.set({ ...this.patientForm });
    }

    /** Pull the freshest state back from the service — needed after calling any
     *  service method that recomputes a field itself (chip toggles, date setters). */
    private refreshFromService(): void {
        this.patientForm = this._patientFormService.form();

        // Synchronize dateOfBirth safely without creating redundant Date references
        const newDobStr = this.patientForm.personalData.dateOfBirth;
        if (newDobStr) {
            const newTime = new Date(newDobStr).getTime();
            const oldTime = this.dateOfBirthValue ? this.dateOfBirthValue.getTime() : null;
            if (newTime !== oldTime) {
                this.dateOfBirthValue = new Date(newDobStr);
            }
        } else {
            this.dateOfBirthValue = null;
        }

        // Synchronize injuryDate safely without creating redundant Date references
        const newInjStr = this.patientForm.injuryData.injuryDate;
        if (newInjStr) {
            const newTime = new Date(newInjStr).getTime();
            const oldTime = this.injuryDateValue ? this.injuryDateValue.getTime() : null;
            if (newTime !== oldTime) {
                this.injuryDateValue = new Date(newInjStr);
            }
        } else {
            this.injuryDateValue = null;
        }
    }

    openCompletePatientInfo(row: any) {
        this.currentPatientRow = row;
        this._patientFormService.reset();
        this._patientFormService.patch({
            personalData: {
                ...this._patientFormService.form().personalData,
                fullName: row.patientNameEn || ''
            }
        });
        this.refreshFromService();
        this.displayCompletePatientInfoDialog = true;
    }

    closePatientInfoDialog() {
        this.displayCompletePatientInfoDialog = false;
        this.currentPatientRow = null;
    }

    savePatientInfo(): void {
        if (!this.currentPatientRow) return;
        this.syncForm();
        this._patientFormService.submitConsultationProfile(this.currentPatientRow.id).subscribe({
            next: () => this.closePatientInfoDialog()
        });
    }

    // ── Booking context (Tab 1) ────────────────────────────────────
    setBookingForSelf(val: boolean): void {
        this.patientForm.personalData.bookingForSelf = val;
        if (val) {
            // Clear the "on behalf of" fields when switching back to "for myself"
            this.patientForm.personalData.fillerRelation = '';
            this.patientForm.personalData.fillerName = '';
            this.patientForm.personalData.fillerMobile = '';
        }
        this.syncForm();
    }

    /**
     * Strips everything but digits as the person types, caps the length at 11
     * (Egyptian mobile format: 01XXXXXXXXX), and keeps the leading zero intact —
     * something p-inputNumber cannot do since it stores values as JS numbers.
     */
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

    // ── Date pickers (Tab 1 / Tab 3) — service converts Date -> ISO string ──
    // p-datepicker needs a Date object, but the form stores an ISO 'YYYY-MM-DD'
    // string (to match the API contract), converted back safely via refreshFromService.


    onDateOfBirthChange(date: Date | null): void {
        this._patientFormService.setDateOfBirth(date);
        this.refreshFromService();
    }

    onInjuryDateChange(date: Date | null): void {
        this._patientFormService.setInjuryDate(date);
        this.refreshFromService();
    }

    // ── Previous injuries (Tab 5) — now matches injuryHistory.previousInjuries shape ──
    addPreviousInjury(): void {
        if (!this.patientForm.injuryHistory.previousInjuries) {
            this.patientForm.injuryHistory.previousInjuries = [];
        }
        this.patientForm.injuryHistory.previousInjuries.push({
            id: 0, description: '', bodyPart: '', injuryDate: '', treatmentReceived: ''
        });
        this.syncForm();
    }

    removePreviousInjury(index: number): void {
        this.patientForm.injuryHistory.previousInjuries?.splice(index, 1);
        this.syncForm();
    }

    // ── Previous surgeries (Tab 5) — now matches injuryHistory.previousSurgeries shape ──
    addSurgery(): void {
        if (!this.patientForm.injuryHistory.previousSurgeries) {
            this.patientForm.injuryHistory.previousSurgeries = [];
        }
        this.patientForm.injuryHistory.previousSurgeries.push({
            id: 0, description: '', surgeryType: '', surgeryDate: ''
        });
        this.syncForm();
    }

    removeSurgery(index: number): void {
        this.patientForm.injuryHistory.previousSurgeries?.splice(index, 1);
        this.syncForm();
    }

    // ── Muscle skeleton map (Tab 4) — delegates to the service, which keeps
    // selectedMuscles and injuryData.painLocations (MuscleName enum values) in sync ──
    onMusclesChange(muscles: string[]): void {
        this._patientFormService.setSelectedMuscles(muscles);
        this.refreshFromService();
    }

    // ── Multi-select chips / checkboxes (Tabs 4, 6, 7) ──────────────
    // Delegated to the service, which recomputes the API's single numeric
    // field (currentConditions / prescribedTreatments / habits, etc.) for you.
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

    isChipSelected(field: 'chronicConditionsSelected' | 'fatherConditionsSelected' | 'motherConditionsSelected', value: string): boolean {
        return !!this.patientForm.ui[field]?.includes(value);
    }

    toggleHabit(value: string): void {
        this._patientFormService.toggleHabit(value);
        this.refreshFromService();
    }

    isHabitSelected(value: string): boolean {
        return !!this.patientForm.ui.habitsSelected?.includes(value);
    }

    // ── Diagnostic tests (Tab 4) — delegates to service, which computes diagnosticTests bitmask ──
    toggleDiagnosticTest(value: string): void {
        this._patientFormService.toggleDiagnosticTest(value);
        this.refreshFromService();
    }

    isDiagnosticTestSelected(value: string): boolean {
        return !!this.patientForm.ui.diagnosticTestsSelected?.includes(value);
    }

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

    // ── Regular medications (Tab 6) — now matches medicalHistory.medications shape ──
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
}