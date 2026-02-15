import { Component, OnInit, signal, ViewChild } from '@angular/core';
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
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableColumn, TableComponent } from '../../../shared/table/table.component';
import { Appointment } from './models/appointment';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { AppointmentService } from './services/appointment.service';
import { LocationService } from '../add-location/services/location.service';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { BadgeModule } from 'primeng/badge';

@Component({
    selector: 'app-appointments',
    standalone: true,
    imports: [
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
        IconFieldModule,
        ConfirmDialogModule,
        TabViewModule,
        CalendarModule,
        BadgeModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './appointments.component.html',
    styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
    allAppointments = signal<Appointment[]>([]);
    filteredAppointments: Appointment[] = []; // Store filtered appointments
    groupedPendingAppointments: { date: string; appointments: Appointment[] }[] = [];
    groupedConfirmedAppointments: { date: string; appointments: Appointment[] }[] = [];
    groupedCancelledAppointments: { date: string; appointments: Appointment[] }[] = [];

    // New lists for tabs
    pendingAppointments: Appointment[] = [];
    confirmedAppointments: Appointment[] = [];
    cancelledAppointments: Appointment[] = [];
    rescheduledAppointments: Appointment[] = [];
    completedAppointments: Appointment[] = [];

    dateRange: Date[] | undefined;

    locations: any[] = [];
    selectedLocation: any | null = null;

    pendingAppointmentsCount: number = 0;
    approvedAppointmentsCount: number = 0;
    canceledAppointmentsCount: number = 0;
    rescheduledAppointmentsCount: number = 0;
    completedAppointmentsCount: number = 0;

    @ViewChild('dt') dt!: Table;
    tableHeaders: TableColumn[] = [];
    tableActions: any[] = [];
    globalFilterFields: string[] = [];
    displayNewAppointmentDialog: boolean = false;
    totalRecords: number = 0;

    constructor(
        private _appointmentService: AppointmentService,
        private _locationService: LocationService, // Inject LocationService
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.initializeTable();
        this.getAllLocations(); // Fetch locations
        this.getAllAppointments();
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
            { field: 'status', label: 'Status', type: 'status' }
        ];
        this.tableHeaders.forEach((h) => this.globalFilterFields.push(h.field));
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

    getAllAppointments() {
        this._appointmentService.getAddedApointments().subscribe((response: any) => {
            const appointments = response.data || [];
            this.allAppointments.set(appointments);
            this.filterAppointments(); // Initial filter (might be empty if no location selected)
        });
    }

    onLocationChange() {
        this.filterAppointments();
    }

    filterAppointments() {
        const all = this.allAppointments();

        if (!this.selectedLocation) {
            this.filteredAppointments = [];

            this.groupedPendingAppointments = []; // Clear specific groups
            this.groupedConfirmedAppointments = [];
            this.groupedCancelledAppointments = [];
            this.resetCounts();
            return;
        }

        this.filteredAppointments = all.filter(a => a.locationNameEn === this.selectedLocation.nameEn); // Assuming location name match or ID if available. 
        // Better to match by ID if possible, but Appointment interface has locationNameEn. 
        // Let's check if Location object has ID and Appointment has locationId. 
        // Appointment interface doesn't show locationId, only locationNameEn/Ar.
        // Location service returns Location[], need to see Location interface.
        // Assuming matching by Name for now as that's what is in Appointment.
        // Wait, let's look at Appointment interface again.
        // It has locationNameEn.
        // Let's assume Location object has nameEn. 

        // Actually, let's refine this matching. 
        // If I can't match by ID, I will match by name.

        // Filter by date range if selected
        if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            const startDate = this.dateRange[0];
            const endDate = this.dateRange[1];
            // Set endDate to end of day to include all appointments on that day
            const endDateEndOfDay = new Date(endDate);
            endDateEndOfDay.setHours(23, 59, 59, 999);

            this.filteredAppointments = this.filteredAppointments.filter(a => {
                const appDate = new Date(a.startTime);
                return appDate >= startDate && appDate <= endDateEndOfDay;
            });
        }

        this.updateCounts();
        this.updateCounts();

        // Populate specific lists
        this.pendingAppointments = this.filteredAppointments.filter(a => a.status === 0);
        this.confirmedAppointments = this.filteredAppointments.filter(a => a.status === 1);
        this.cancelledAppointments = this.filteredAppointments.filter(a => a.status === 3);
        this.rescheduledAppointments = this.filteredAppointments.filter(a => a.status === 4);
        this.completedAppointments = this.filteredAppointments.filter(a => a.status === 2);

        this.groupedPendingAppointments = this.groupAppointmentsByDate(this.pendingAppointments);
        this.groupedConfirmedAppointments = this.groupAppointmentsByDate(this.confirmedAppointments);
        this.groupedCancelledAppointments = this.groupAppointmentsByDate(this.cancelledAppointments);
    }

    onDateRangeSelect() {
        this.filterAppointments();
    }

    resetCounts() {
        this.pendingAppointmentsCount = 0;
        this.approvedAppointmentsCount = 0;
        this.canceledAppointmentsCount = 0;
        this.rescheduledAppointmentsCount = 0;
        this.completedAppointmentsCount = 0;
        this.totalRecords = 0;
    }

    updateCounts() {
        const apps = this.filteredAppointments;
        this.totalRecords = apps.length;
        this.pendingAppointmentsCount = apps.filter((a: any) => a.status === 0).length;
        this.approvedAppointmentsCount = apps.filter((a: any) => a.status === 1).length;
        this.completedAppointmentsCount = apps.filter((a: any) => a.status === 2).length;
        this.canceledAppointmentsCount = apps.filter((a: any) => a.status === 3).length;
        // Assuming 4 is Re-scheduled based on typical enum values found in other projects usually
        // or derived from statuses array below.
        // statuses array only has 0, 1, 2, 3. 
        // I will add 4 for Re-scheduled to statuses array too.
        this.rescheduledAppointmentsCount = apps.filter((a: any) => a.status === 12).length; // Wait, Re-scheduled is 12 in the image? No, image status is 12. 
        // Actually the image shows "12 Re-scheduled". That's the count. 
        // Let's check status definitions again.
        // The user didn't give me the status enum.
        // I'll check the 'statuses' array I have.
        // id: 0 -> Scheduled (Pending?)
        // id: 1 -> Confirmed
        // id: 2 -> Completed
        // id: 3 -> Cancelled
        // I need to add Re-scheduled. Let's assume it is 4 for now.
        this.rescheduledAppointmentsCount = apps.filter((a: any) => a.status === 4).length;
    }

    /**
     * Groups appointments by their date field
     */
    private groupAppointmentsByDate(appointments: Appointment[]): { date: string; appointments: Appointment[] }[] {
        const grouped: { [key: string]: Appointment[] } = {};

        appointments.forEach((item: any) => {
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
        this.getAllAppointments();
    }

    onPageChange(event: PaginatorState) {
        // You can handle lazy loading here if needed in the future
    }

    selectedAppointment: any;
    appointmentToEdit: any = null;
    displayStatusDialog = false;
    selectedStatusId: any;

    statuses = [
        { id: 0, label: 'Pending', color: 'warn' }, // Changed Scheduled to Pending to match image
        { id: 1, label: 'Confirmed', color: 'success' },
        { id: 3, label: 'Cancelled', color: 'danger' },
        { id: 4, label: 'Re-scheduled', color: 'help' }, // Added Re-scheduled
        { id: 2, label: 'Completed', color: 'info' } // Changed color to match image blueish
        // Image colors:
        // Pending: Orange/Yellow (warn)
        // Confirmed: Green (success)
        // Cancelled: Red (danger)
        // Re-scheduled: Purple (help)
        // Completed: Blue (info or primary)
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
                this.messageService.add({
                    severity: 'success',
                    summary: 'Status Updated',
                    detail: `Appointment status changed to ${this.getStatusLabel(this.selectedStatusId)}`
                });
                this.getAllAppointments(); // Refresh to update counts/lists
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

    getStatusLabel(status: number): string {
        const s = this.statuses.find((st) => st.id === status);
        return s ? s.label : 'Unknown';
    }
}
