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

@Component({
    selector: 'app-appointments',
    standalone: true,
    imports: [
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
            { field: 'starttime', label: 'Start time', type: 'text' },
            { field: 'endtime', label: 'End time', type: 'text' },
            { field: 'status', label: 'Status', type: 'text' }
        ];
        this.tableHeaders.forEach((h) => this.globalFilterFields.push(h.field));

        this.tableActions = [
            { label: 'Complete', icon: 'pi pi-check', severity: 'success', action: (item: any) => console.log('Complete', item), condition: (item: any) => item.status !== 'completed' && item.status !== 'canceled' },
            { label: 'Reschedule', icon: 'pi pi-calendar', severity: 'info', action: (item: any) => console.log('Reschedule', item) },
            { label: 'Cancel', icon: 'pi pi-times', severity: 'danger', action: (item: any) => console.log('Cancel', item), condition: (item: any) => item.status !== 'canceled' }
        ];
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
            this.groupAppointmentsByDate(appointments);
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
}
