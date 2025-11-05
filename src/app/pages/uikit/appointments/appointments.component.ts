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
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableColumn, TableComponent } from '../../../shared/table/table.component';
import { Appointment } from './models/appointment';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { AppointmentService } from './services/appointment.service';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

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
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './appointments.component.html',
    styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
    allAppointments = signal<Appointment[]>([]);
    groupedAppointments: { date: string; appointments: Appointment[] }[] = [];

    pendingAppointmentsCount: number = 0;
    approvedAppointmentsCount: number = 0;

    @ViewChild('dt') dt!: Table;
    tableHeaders: TableColumn[] = [];
    tableActions: any[] = [];
    globalFilterFields: string[] = [];
    displayNewAppointmentDialog: boolean = false;
    totalRecords: number = 0;

    constructor(
        private _appointmentService: AppointmentService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.initializeTable();
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

    customers = [
        { name: 'Abd rabou Mohamed Abd rabou', email: 'Aboodilielkady456@gmail.com' },
        { name: 'Abdelrahman Sherif', email: 'abdelrahmanshrief32@yahoo.com' },
        { name: 'Adham Khaled', email: 'adham.noaaman@gmail.com' },
        { name: 'Ahmed Zidan', email: 'ahmedzeat5008@gmail.com' }
    ];

    selectedCustomer: any;

    onCreateNewCustomer(event: Event) {
        event.stopPropagation(); // prevent dropdown from closing
    }

    getAllAppointments() {
        this._appointmentService.getAddedApointments().subscribe((response: any) => {
            const appointments = response.data || [];

            this.allAppointments.set(appointments);
            this.totalRecords = appointments.length;

            this.pendingAppointmentsCount = appointments.filter((a: any) => a.status === 0).length;
            this.approvedAppointmentsCount = appointments.filter((a: any) => a.status === 1).length;

            this.groupAppointmentsByDate(appointments);

            console.log('Pending:', this.pendingAppointmentsCount);
            console.log('Approved:', this.approvedAppointmentsCount);
        });
    }

    /**
     * Groups appointments by their date field
     */
    private groupAppointmentsByDate(appointments: Appointment[]): void {
        const grouped: { [key: string]: Appointment[] } = {};

        appointments.forEach((item: any) => {
            // Extract only the date part (assuming item.starttime is ISO string or has date info)
            const dateKey = new Date(item.startTime).toISOString().split('T')[0];
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(item);
        });

        // Convert object to array and sort by date
        this.groupedAppointments = Object.keys(grouped)
            .sort()
            .map((date) => ({
                date,
                appointments: grouped[date]
            }));
        console.log(this.groupedAppointments);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNewAppointmentDialog() {
        this.displayNewAppointmentDialog = true;
    }

    hideDialog(): void {
        this.displayNewAppointmentDialog = false;
    }

    onPageChange(event: PaginatorState) {
        // You can handle lazy loading here if needed in the future
    }

    selectedAppointment: any;
    displayStatusDialog = false;
    selectedStatusId: any;

    statuses = [
        { id: 0, label: 'Scheduled', color: 'info' },
        { id: 1, label: 'Confirmed', color: 'success' },
        { id: 2, label: 'Completed', color: 'secondary' },
        { id: 3, label: 'Cancelled', color: 'danger' }
    ];

    openStatusDialog(appointment: Appointment) {
        debugger;
        this.selectedAppointment = appointment;
        this.selectedStatusId = appointment.status;
        this.displayStatusDialog = true;
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
