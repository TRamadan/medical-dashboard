import { Component, OnInit, signal, ViewChild, inject } from '@angular/core';

import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule } from 'primeng/paginator';
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


@Component({
    selector: 'app-appointments',
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
        DropdownModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        DatePickerModule,
        BadgeModule,
        AppointmentsDetailsComponent,
        PaginatorModule,
        TooltipModule,
        CheckboxModule,
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './appointments.component.html',
    styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
    private readonly router = inject(Router);


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

    private readonly _appointmentService = inject(AppointmentService);
    private readonly _locationService = inject(LocationService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);

    ngOnInit() {
        this.initializeTable();
        this.getAllLocations();
    }

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

    // ── Dropdown / Checkbox / Radio Options ───────────────────────
    genderOptions = [{ label: 'ذكر', value: 'male' }, { label: 'أنثى', value: 'female' }];

    performanceEngineerOptions = [
        { label: 'مهندس 1', value: '1' },
        { label: 'مهندس 2', value: '2' }
    ];

    openCompletePatientInfo(row: unknown): void {
        const id = (row as Record<string, number>)?.['id'];
        if (id) {
            this.router.navigate(['/uikit/appointment-consultation-form', id]);
        } else {
            this.router.navigate(['/uikit/appointment-consultation-form']);
        }
    }
}

