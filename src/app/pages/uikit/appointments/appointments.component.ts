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
import { PatientFormService } from './services/patient-form.service';


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
        ContactUsComponent
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './appointments.component.html',
    styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
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
        private _locationService: LocationService, // Inject LocationService
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

    // ── Doctors seen (Tab 4) ────────────────────────────────────────
    addDoctor(): void {
        if (!this.patientForm.doctors) {
            this.patientForm.doctors = [];
        }
        this.patientForm.doctors.push({ name: '', specialty: '', contactMethod: '', diagnosis: '' });
        this.syncForm();
    }

    removeDoctor(index: number): void {
        this.patientForm.doctors?.splice(index, 1);
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

    maritalStatusOptions = [
        { label: 'متزوج', value: true },
        { label: 'أعزب', value: false }
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
    private readonly _patientFormService = inject(PatientFormService);
    /** Local mutable copy — bound via ngModel. Synced to service on change. */
    patientForm = this._patientFormService.form();

    /** Call this from (ngModelChange) or any change event to keep the service in sync. */
    syncForm(): void {
        this._patientFormService.form.set({ ...this.patientForm });
    }

    openCompletePatientInfo(row: any) {
        this.currentPatientRow = row;
        this.patientForm = { ...this._patientFormService.form(), fullName: row.patientNameEn || '' };
        this.syncForm();
        this.displayCompletePatientInfoDialog = true;
    }

    closePatientInfoDialog() {
        this.displayCompletePatientInfoDialog = false;
        this.currentPatientRow = null;
    }

    savePatientInfo() {
        this.syncForm();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Patient information has been completed successfully.' });
        this.closePatientInfoDialog();
    }

    // ── Previous injuries (Tab 5) ──────────────────────────────────
    addPreviousInjury(): void {
        if (!this.patientForm.previousInjuries) {
            this.patientForm.previousInjuries = [];
        }
        this.patientForm.previousInjuries.push({ name: '', date: '', description: '' });
        this.syncForm();
    }

    removePreviousInjury(index: number): void {
        this.patientForm.previousInjuries?.splice(index, 1);
        this.syncForm();
    }

    setBookingForSelf(val: boolean): void {
        this.patientForm.bookingForSelf = val;
        if (val) {
            // Clear the "on behalf of" fields when switching back to "for myself"
            this.patientForm.injuredRelation = '';
            this.patientForm.fillerName = '';
            this.patientForm.fillerRelation = '';
        }
        this.syncForm();
    }

    /**
 * Strips everything but digits as the person types, caps the length at 11
 * (Egyptian mobile format: 01XXXXXXXXX), and keeps the leading zero intact —
 * something p-inputNumber cannot do since it stores values as JS numbers.
 */
    sanitizePhoneInput(event: Event, field: 'phone' | 'emergencyPhone' | 'fillerPhone'): void {
        const input = event.target as HTMLInputElement;
        const digitsOnly = input.value.replace(/\D/g, '').slice(0, 11);
        input.value = digitsOnly;
        (this.patientForm as any)[field] = digitsOnly;
        this.syncForm();
    }


    // ── Previous surgeries (Tab 5) ─────────────────────────────────
    addSurgery(): void {
        if (!this.patientForm.surgeries) {
            this.patientForm.surgeries = [];
        }
        this.patientForm.surgeries.push({ type: '', part: '', year: '', notes: '' });
        this.syncForm();
    }

    removeSurgery(index: number): void {
        this.patientForm.surgeries?.splice(index, 1);
        this.syncForm();
    }

    // ── Medical history disease chips (Tab 6) ───────────────────────
    toggleChip(field: 'chronicConditions' | 'fatherConditions' | 'motherConditions', value: string): void {
        const list = (this.patientForm[field] as string[]) || (this.patientForm[field] = []);
        const idx = list.indexOf(value);
        if (idx > -1) {
            list.splice(idx, 1);
        } else {
            list.push(value);
        }
        this.syncForm();
    }

    isChipSelected(field: 'chronicConditions' | 'fatherConditions' | 'motherConditions', value: string): boolean {
        return !!(this.patientForm[field] as string[])?.includes(value);
    }

    // ── Regular medications / stimulants (Tab 6) ────────────────────
    addMedication(): void {
        if (!this.patientForm.regularMedications) {
            this.patientForm.regularMedications = [];
        }
        this.patientForm.regularMedications.push({ name: '', dose: '', duration: '' });
        this.syncForm();
    }

    removeMedication(index: number): void {
        this.patientForm.regularMedications?.splice(index, 1);
        this.syncForm();
    }
}