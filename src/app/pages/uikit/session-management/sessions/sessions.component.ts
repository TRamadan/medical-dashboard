import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
@Component({
    selector: 'app-sessions',
    imports: [CardModule],
    standalone: true,
    templateUrl: './sessions.component.html',
    styleUrl: './sessions.component.scss'
})
export class SessionsComponent {
    upcomingSessions: any[] = [
        {
            id: 1,
            sessionNumber: 7,
            date: '2025-11-16',
            time: '10:00 AM',
            phase: 'Phase 2',
            status: 'scheduled'
        },
        {
            id: 2,
            sessionNumber: 8,
            date: '2025-11-18',
            time: '10:00 AM',
            phase: 'Phase 2',
            status: 'scheduled'
        },
        {
            id: 3,
            sessionNumber: 9,
            date: '2025-11-20',
            time: '02:00 PM',
            phase: 'Phase 2',
            status: 'scheduled'
        },
        {
            id: 4,
            sessionNumber: 10,
            date: '2025-11-23',
            time: '10:00 AM',
            phase: 'Phase 2',
            status: 'scheduled'
        }
    ];

    completedSessions: any[] = [
        {
            id: 5,
            sessionNumber: 6,
            date: '2025-11-14',
            time: '10:00 AM',
            phase: 'Phase 1',
            status: 'completed',
            notes: 'Good progress, reduced swelling noted'
        },
        {
            id: 6,
            sessionNumber: 5,
            date: '2025-11-12',
            time: '02:00 PM',
            phase: 'Phase 1',
            status: 'completed',
            notes: 'Patient tolerating exercises well'
        }
    ];

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
