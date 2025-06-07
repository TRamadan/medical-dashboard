import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuItem } from 'primeng/api';
@Component({
    selector: 'app-attendance-tracking',
    standalone: true,
    imports: [TieredMenuModule, DatePickerModule, FloatLabelModule, CommonModule, TableModule, ButtonModule, TagModule, SelectModule],
    templateUrl: './attendance-tracking.component.html',
    styleUrls: ['./attendance-tracking.component.css']
})
export class AttendanceTrackingComponent implements OnInit {
    appointments: any[] = [];
    allCoachs: any[] = [];
    items: MenuItem[] | undefined;

    constructor() {}

    ngOnInit() {
        this.getAllSessions();
        this.items = [
            {
                label: 'File',
                icon: 'pi pi-file',
                items: [
                    {
                        label: 'New',
                        icon: 'pi pi-plus',
                        items: [
                            {
                                label: 'Document',
                                icon: 'pi pi-file'
                            },
                            {
                                label: 'Image',
                                icon: 'pi pi-image'
                            },
                            {
                                label: 'Video',
                                icon: 'pi pi-video'
                            }
                        ]
                    },
                    {
                        label: 'Open',
                        icon: 'pi pi-folder-open'
                    },
                    {
                        label: 'Print',
                        icon: 'pi pi-print'
                    }
                ]
            },

            {
                label: 'Search',
                icon: 'pi pi-search'
            },
            {
                separator: true
            }
        ];
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 4/6/2025
     * Porpuse : this function is created to fetch all sessions
     */
    getAllSessions(): void {
        this.appointments = [
            {
                id: '#S001',
                client: 'Alice Johnson',
                employee: 'John Smith',
                service: 'Hair Cut & Style',
                datetime: 'Dec 15, 2024 - 10:00 AM',
                status: 'scheduled'
            },
            {
                id: '#S002',
                client: 'Bob Wilson',
                employee: 'Jane Doe',
                service: 'Massage Therapy',
                datetime: 'Dec 15, 2024 - 2:00 PM',
                status: 'completed'
            },
            {
                id: '#S003',
                client: 'Carol Brown',
                employee: 'Mike Johnson',
                service: 'Facial Treatment',
                datetime: 'Dec 16, 2024 - 11:30 AM',
                status: 'rescheduled'
            },
            {
                id: '#S004',
                client: 'David Lee',
                employee: 'John Smith',
                service: 'Beard Trim',
                datetime: 'Dec 16, 2024 - 3:00 PM',
                status: 'canceled'
            }
        ];
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 4/6/2025
     * Porpuse : this function is created to get all added users of type coachs
     */
    getAllCoachs(): void {
        this.allCoachs = [];
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 4/6/2025
     * Porpuse : this function is created to handle appointment status
     * @param status
     * @returns
     */
    getTagSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | undefined {
        switch (status.toLowerCase()) {
            case 'scheduled':
                return 'info';
            case 'completed':
                return 'success';
            case 'rescheduled':
                return 'warn';
            case 'canceled':
                return 'danger';
            default:
                return undefined;
        }
    }
}
