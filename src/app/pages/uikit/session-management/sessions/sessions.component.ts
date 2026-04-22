import { Component, OnInit, signal, computed, output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-sessions',
    imports: [CardModule, TableModule, DatePickerModule, DropdownModule, SelectButtonModule, FormsModule, CommonModule],
    standalone: true,
    templateUrl: './sessions.component.html',
    styleUrl: './sessions.component.scss'
})
export class SessionsComponent implements OnInit {
    coachName: string = 'Captain Sarah Johnson';

    // Event emitted when a session is clicked
    sessionSelected = output<any>();
    
    // Filter states
    dateRange: Date[] = [new Date(), new Date()];
    timeOptions: { label: string; value: number }[] = [];
    selectedSlotMinutes: number = 30; // default 30 minutes
    viewValue: string = 'daily';
    viewOptions: any[] = [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' }
    ];

    // Mapped internal list
    schedule: {[time: string]: any} = {};
    timeSlots = signal<string[]>([]);
    
    // New stats based on reference HTML
    totalSlots = signal<number>(0);
    upcomingSlots = signal<number>(0);
    executedSessions = signal<number>(0);
    remainingSessions = signal<number>(0);
    soloCount = signal<number>(0);
    swarmCount = signal<number>(0);
    measurementsCount = signal<number>(0);

    // Today's sessions — all 3 types in one day
    upcomingSessions: any[] = [
        {
            id: 1, patientName: 'Ali Hassan', sessionNumber: 5, date: '', time: '10:00 - 10:30',
            phase: 'Phase 2', status: 'completed', type: 'Swarm',
            stationInfo: 'Recharger · Station 1/3', progress: 'Session 5 / 36'
        },
        {
            id: 2, patientName: 'Nour Khaled', sessionNumber: 12, date: '', time: '10:30 - 11:00',
            phase: 'Phase 2', status: 'completed', type: 'Swarm',
            stationInfo: 'Recharger · Station 1/3', progress: 'Session 12 / 36'
        },
        {
            id: 3, patientName: 'Hana Salem', sessionNumber: 7, date: '', time: '11:00 - 11:30',
            phase: 'Phase 3', status: 'in-progress', type: 'Swarm',
            stationInfo: 'Recharger · Station 2/3', progress: 'Session 7 / 36'
        },
        {
            id: 4, patientName: 'Rami Mostafa', sessionNumber: 1, date: '', time: '14:00 - 14:15',
            phase: 'Knee Basic', status: 'scheduled', type: 'Measurements',
            stationInfo: 'Periodic Measurements · 15 min', progress: 'Assessment 2 / 4'
        },
        {
            id: 5, patientName: 'Rami Mostafa', sessionNumber: 1, date: '', time: '14:30 - 15:30',
            phase: 'Phase 1', status: 'scheduled', type: 'Solo',
            stationInfo: 'Solo · 60 min', progress: 'Session 1 / 36'
        },
        {
            id: 6, patientName: 'Fatma Ali', sessionNumber: 20, date: '', time: '15:30 - 16:00',
            phase: 'Phase 4', status: 'scheduled', type: 'Swarm',
            stationInfo: 'Apex Station', progress: 'Session 20 / 24'
        }
    ];

    ngOnInit(): void {
        this.buildTimeOptions();
        this.generateScheduleGrid();
    }

    buildTimeOptions(): void {
        const options: { label: string; value: number }[] = [];
        for (let minutes = 15; minutes <= 120; minutes += 15) {
            options.push({ label: `${minutes} Min`, value: minutes });
        }
        this.timeOptions = options;
    }

    onDateRangeSelect(): void {
        this.generateScheduleGrid();
    }

    onSlotMinutesChange(): void {
        this.generateScheduleGrid();
    }

    onViewChange(): void {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (this.viewValue === 'daily') {
            this.dateRange = [new Date(today), new Date(today)];
        } else if (this.viewValue === 'weekly') {
            const end = new Date(today);
            end.setDate(end.getDate() + 6);
            this.dateRange = [new Date(today), end];
        } else {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            this.dateRange = [start, end];
        }
        this.generateScheduleGrid();
    }

    generateScheduleGrid(): void {
        // Generating sequential slots from 09:00 to 17:00
        const slots: string[] = [];
        let startMins = 9 * 60; // 09:00
        const endMins = 17 * 60; // 17:00

        while (startMins < endMins) {
            const endSlot = startMins + this.selectedSlotMinutes;
            const formatTime = (m: number) => {
                const hh = Math.floor(m / 60).toString().padStart(2, '0');
                const mm = (m % 60).toString().padStart(2, '0');
                return `${hh}:${mm}`;
            };
            slots.push(`${formatTime(startMins)} - ${formatTime(endSlot)}`);
            startMins = endSlot;
        }
        this.timeSlots.set(slots);
        this.totalSlots.set(slots.length);

        this.schedule = {};
        
        [...this.upcomingSessions].forEach(session => {
            const timeStart = session.time.split(' - ')[0]; // e.g., '10:00'
            const matchedSlot = slots.find(s => s.startsWith(timeStart));
            if (matchedSlot) {
                this.schedule[matchedSlot] = session;
            } else if (slots.length > 0) {
                const emptySlot = slots.find(s => !this.schedule[s]);
                if (emptySlot) this.schedule[emptySlot] = session;
            }
        });

        const scheduledCount = Object.values(this.schedule).filter(s => s.status === 'scheduled').length;
        const inProgressCount = Object.values(this.schedule).filter(s => s.status === 'in-progress').length;
        const completedCount = Object.values(this.schedule).filter(s => s.status === 'completed').length;
        const solo = Object.values(this.schedule).filter(s => s.type === 'Solo').length;
        const swarm = Object.values(this.schedule).filter(s => s.type === 'Swarm').length;
        const meas = Object.values(this.schedule).filter(s => s.type === 'Measurements').length;

        this.upcomingSlots.set(scheduledCount + inProgressCount);
        this.executedSessions.set(completedCount);
        this.remainingSessions.set(scheduledCount);
        this.soloCount.set(solo);
        this.swarmCount.set(swarm);
        this.measurementsCount.set(meas);
    }

    getAppointment(time: string) {
        return this.schedule[time];
    }

    onSessionClick(appt: any) {
        if (!appt) return;
        this.sessionSelected.emit(appt);
    }

    getAppointmentStatus(time: string) {
        return this.schedule[time]?.status || 'available';
    }

    getDateRangeLabel(): string {
        if (!this.dateRange?.length || !this.dateRange[0]) return '';
        const from = this.dateRange[0];
        const to = this.dateRange.length === 2 && this.dateRange[1] ? this.dateRange[1] : from;
        const fromStr = this.formatDate(from);
        const toStr = this.formatDate(to);
        return fromStr === toStr ? fromStr : `${fromStr} to ${toStr}`;
    }

    formatDate(date: Date | string): string {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getInitials(name: string): string {
        if (!name?.trim()) return 'DR';
        const words = name.trim().split(/\s+/).filter(w => w.length > 0);
        if (words.length === 1) return words[0][0].toUpperCase();
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }

    getStatusColor(status: string): string {
        switch (status.toLowerCase()) {
            case 'scheduled':
                return 'bg-blue-50';
            case 'completed':
                return 'bg-green-50';
            default:
                return 'bg-white';
        }
    }

    getBadgeColor(status: string): string {
        switch (status.toLowerCase()) {
            case 'scheduled':
                return 'bg-blue-500 text-white';
            case 'completed':
                return 'bg-green-500 text-white';
            default:
                return 'bg-gray-300 text-gray-800';
        }
    }
}
