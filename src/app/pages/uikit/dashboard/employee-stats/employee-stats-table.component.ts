import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { PaginatorModule } from 'primeng/paginator';
import { TabsModule } from 'primeng/tabs';

interface EmployeeStat {
    avatar?: string;
    name: string;
    appointments: number;
    payments: string;
    hours: string;
    load: number;
}

interface ServiceStat {
    name: string;
    appointments: number;
    payments: string;
    hours: string;
    load: number;
}

@Component({
    selector: 'app-employee-stats-table',
    standalone: true,
    imports: [CommonModule, TableModule, ProgressBarModule, PaginatorModule, TabsModule],
    templateUrl: './employee-stats-table.component.html',
    styleUrl: './employee-stats-table.component.scss'
})
export class EmployeeStatsTableComponent implements OnInit {
    employees: EmployeeStat[] = [];
    page = 0;
    rows = 5;

    services: ServiceStat[] = [];
    servicePage = 0;

    ngOnInit() {
        this.employees = [
            { name: 'Ahmed Alaa', appointments: 7, payments: 'EGP0', hours: '7h', load: 14.6 },
            { name: 'C. Eslam Hosam', appointments: 0, payments: 'EGP0', hours: '0', load: 0 },
            { name: 'C. Mahmoud Awad', appointments: 3, payments: 'EGP0', hours: '3h', load: 7.9 },
            { name: 'C. Nafea Belal', appointments: 0, payments: 'EGP0', hours: '0', load: 0 },
            { name: 'Dr Hosam Zidan', appointments: 2, payments: 'EGP0', hours: '1h 30m', load: 3.1 },
            { name: 'Employee 6', appointments: 1, payments: 'EGP0', hours: '1h', load: 2.5 },
            { name: 'Employee 7', appointments: 4, payments: 'EGP0', hours: '2h', load: 5.2 }
        ];
        this.services = [
            { name: 'Athlete Profile ملف رياضي', appointments: 0, payments: 'EGP0', hours: '0', load: 0 },
            { name: 'Consultation', appointments: 1, payments: 'EGP0', hours: '30m', load: 1.9 },
            { name: 'Full Body', appointments: 0, payments: 'EGP0', hours: '0', load: 0 },
            { name: 'Half Body', appointments: 0, payments: 'EGP0', hours: '0', load: 0 },
            { name: 'Rehab Session', appointments: 11, payments: 'EGP0', hours: '11h', load: 4.5 }
        ];
    }

    get pagedEmployees() {
        const start = this.page * this.rows;
        return this.employees.slice(start, start + this.rows);
    }

    get pagedServices() {
        const start = this.servicePage * this.rows;
        return this.services.slice(start, start + this.rows);
    }

    onPageChange(event: any) {
        this.page = event.page;
    }

    onServicePageChange(event: any) {
        this.servicePage = event.page;
    }
} 