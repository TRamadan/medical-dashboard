import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
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
@Component({
    selector: 'app-appointments',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
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
        ConfirmDialogModule,
        TableComponent
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './appointments.component.html',
    styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
    allAppointments = signal<Appointment[]>([]);
    @ViewChild('dt') dt!: Table;
    tableHeaders: TableColumn[] = [];
    tableActions: any[] = [];
    globalFilterFields: string[] = [];

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.initializeTable();
        this.getAllAppointments();
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Porpuse : implement a signal that call an api that fetch all added appointments
     */
    getAllAppointement(): void {}
    initializeTable() {
        this.tableHeaders = [
            { field: 'id', label: 'Session ID', type: 'text' },
            { field: 'client', label: 'Client Name', type: 'text' },
            { field: 'employee', label: 'Assigned To', type: 'text' },
            { field: 'service', label: 'Service', type: 'text' },
            { field: 'datetime', label: 'Date & Time', type: 'text' },
            { field: 'status', label: 'Status', type: 'text' }
        ];
        this.tableHeaders.forEach((h) => this.globalFilterFields.push(h.field));

        this.tableActions = [
            { label: 'Complete', icon: 'pi pi-check', severity: 'success', action: (item: any) => console.log('Complete', item), condition: (item: any) => item.status !== 'completed' && item.status !== 'canceled' },
            { label: 'Reschedule', icon: 'pi pi-calendar', severity: 'info', action: (item: any) => console.log('Reschedule', item) },
            { label: 'Cancel', icon: 'pi pi-times', severity: 'danger', action: (item: any) => console.log('Cancel', item), condition: (item: any) => item.status !== 'canceled' }
        ];
    }

    getAllAppointments() {
        // this.allAppointments.set([
        //     { id: '#S001', client: 'Alice Johnson', employee: 'John Smith', service: 'Hair Cut & Style', datetime: 'Dec 15, 2024 - 10:00 AM', status: 'scheduled' },
        //     { id: '#S002', client: 'Bob Wilson', employee: 'Jane Doe', service: 'Massage Therapy', datetime: 'Dec 15, 2024 - 2:00 PM', status: 'completed' },
        //     { id: '#S003', client: 'Carol Brown', employee: 'Mike Johnson', service: 'Facial Treatment', datetime: 'Dec 16, 2024 - 11:30 AM', status: 'rescheduled' },
        //     { id: '#S004', client: 'David Lee', employee: 'John Smith', service: 'Beard Trim', datetime: 'Dec 16, 2024 - 3:00 PM', status: 'canceled' }
        // ]);
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Porpuse : fetch accurate data by search in an input in the desired table
     * @param table
     * @param event
     */
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
