import { Component, output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionsService } from './services/sessions.service';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { EngineerStats } from './models/engineer-stats';


@Component({
    selector: 'app-sessions',
    standalone: true,
    imports: [CommonModule, CardModule, ProgressSpinnerModule],
    templateUrl: './sessions.component.html',
    styleUrl: './sessions.component.scss'
})
export class SessionsComponent implements OnInit {
    // Top header data
    coachName = 'Eng. Karim — Recharger';
    dateLocation = 'Thursday 27 March · Maadi Branch';
    totalSessionsToday = '4 Sessions Today';

    isLoading = signal<boolean>(true);
    hasNoData = signal<boolean>(false);

    // Stats row
    stats: EngineerStats[] = [
        { count: '2', label: 'Completed', colorClass: 'text-emerald-400', accentKey: 'completed', icon: 'pi-check-circle' },
        { count: '2', label: 'Remaining', colorClass: 'text-amber-400', accentKey: 'remaining', icon: 'pi-clock' },
        { count: '1', label: 'Solo', colorClass: 'text-violet-400', accentKey: 'solo', icon: 'pi-user' },
        { count: '3', label: 'Swarm', colorClass: 'text-sky-400', accentKey: 'swarm', icon: 'pi-users' }
    ];

    // Timeline data matching the screenshot exactly
    sessions: any[] = [];

    sessionSelected = output<any>();

    constructor(private sessionsService: SessionsService) { }

    ngOnInit(): void {
        this.updateDateLocation();
        this.fetchSessions();
    }

    updateDateLocation(): void {
        const today = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const dayName = days[today.getDay()];
        const dayNum = today.getDate();
        const monthName = months[today.getMonth()];

        this.dateLocation = `${dayName} ${dayNum} ${monthName} · Maadi Branch`;
    }

    fetchSessions(): void {
        const today = new Date();
        const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const dateFrom = currentDate;
        const dateTo = currentDate;
        const slotMinutes = 30;
        const userDataStr = localStorage.getItem('userData');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const doctorId = userData?.id || 24;
        const locationId = 8;
        this.hasNoData.set(false);
        this.isLoading.set(true);

        this.sessionsService.getAllCalenderData(dateFrom, slotMinutes, doctorId, locationId, dateTo).subscribe({
            next: (res: any) => {
                if (!res || res.length === 0) {
                    this.hasNoData.set(true);
                    this.isLoading.set(false);
                    return;
                }
                this.mapApiResponse(res);
                this.isLoading.set(false)

            },
            error: (err: any) => {
                console.error('Error fetching sessions:', err);
                // Fallback to default mock data if API fails to show design
                this.hasNoData.set(true);
                this.isLoading.set(false)

            }
        });
    }

    mapApiResponse(res: any): void {
        const slots = res[0].slotTime || [];
        if (slots.length === 0) {
            this.hasNoData.set(true);
            return;
        }

        let completed = 0;
        let upcoming = 0;
        let solo = 0;
        let swarm = 0;
        let totalSessions = 0;

        const mappedSessions: any[] = [];

        // Static data exactly matching the screenshot
        const mockAppointments = [
            { patientNameEn: 'Eng. Ahmed — Recharger Station', serviceNameEn: 'Swarm - Station 1/3 Session 5/24', status: 2 },
            { patientNameEn: 'N. Khaled — Recharger Station', serviceNameEn: 'Swarm - Station 1/3 Session 12/24', status: 2 },
            { patientNameEn: 'Eng. Salem — Recharger Station', serviceNameEn: 'Swarm - Station 1/3 Session 7/26   12:18 Remaining', status: 1 },
            null, // Intentionally empty slot to show "No session"
            { patientNameEn: 'R. Mostafa — Periodic Measurements', serviceNameEn: 'measurement · 15 mins   Sent to Doctor', status: 0 },
            { patientNameEn: 'R. Mostafa — Return to Play', serviceNameEn: 'solo measurement · 60 mins   Measurements at end', status: 0 },
            { patientNameEn: 'F. Ali — Resilient Station', serviceNameEn: 'Swarm - Apex Station  Session 20/24', status: 0 }
        ];

        let mockIndex = 0;

        slots.forEach((slot: any) => {
            if (slot.appointment == null) {
                // Inject the static data sequentially into empty slots
                if (mockIndex < mockAppointments.length) {
                    slot.appointment = mockAppointments[mockIndex];
                }
                mockIndex++;
            }

            const fromTime = slot.from ? slot.from.slice(0, 5) : '';

            // Map to UI model
            if (slot.appointment) {
                const appt = slot.appointment;
                totalSessions++;

                let type = 'upcoming';
                let badgeText = 'Upcoming';
                let badgeIcon = false;

                // Determine Swarm/Solo from service name
                const serviceEn = appt.serviceNameEn?.toLowerCase() || '';
                const isMeasurement = serviceEn.includes('measurement') || serviceEn.includes('assessment');
                const isSolo = serviceEn.includes('solo');

                if (isSolo) solo++;
                else if (!isMeasurement) swarm++;

                // Map Status
                if (appt.status === 2 || appt.status === 'completed' || appt.status === 'Completed') {
                    type = 'finished';
                    badgeText = 'Finished';
                    completed++;
                } else if (appt.status === 1 || appt.status === 'in-progress' || appt.status === 'Confirmed') {
                    type = 'live';
                    badgeText = 'Live Now';
                    upcoming++;
                } else {
                    type = 'upcoming';
                    badgeText = 'Upcoming';
                    upcoming++;
                }

                // Measurements override
                if (isMeasurement) {
                    type = isSolo ? 'solo-measurement' : 'measurement';
                    badgeText = isSolo ? 'Solo + Integrated Measurements' : 'Measurements';
                    badgeIcon = !isSolo;
                }

                mappedSessions.push({
                    time: this.formatTo12Hour(fromTime),
                    type: type,
                    patient: appt.patientNameEn || appt.patientNameAr || 'Unknown Patient',
                    details: appt.serviceNameEn || appt.serviceNameAr || 'Details',
                    badgeText: badgeText,
                    badgeIcon: badgeIcon,
                    originalAppt: appt
                });
            }
        });


        this.sessions = mappedSessions;
        this.totalSessionsToday = `${totalSessions} Sessions Today`;

        this.stats = [
            { count: completed.toString(), label: 'Completed', colorClass: 'text-emerald-400', accentKey: 'completed', icon: 'pi-check-circle' },
            { count: upcoming.toString(), label: 'Remaining', colorClass: 'text-amber-400', accentKey: 'remaining', icon: 'pi-clock' },
            { count: solo.toString(), label: 'Solo', colorClass: 'text-violet-400', accentKey: 'solo', icon: 'pi-user' },
            { count: swarm.toString(), label: 'Swarm', colorClass: 'text-sky-400', accentKey: 'swarm', icon: 'pi-users' }
        ];
        console.log('fksjskefjhsg')
    }

    formatTo12Hour(time24: string): string {
        if (!time24) return '';
        let [hour, min] = time24.split(':').map(Number);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12; // the hour '0' should be '12'
        const hourStr = hour < 10 ? '0' + hour : hour.toString();
        const minStr = min < 10 ? '0' + min : min.toString();
        return `${hourStr}:${minStr} ${ampm}`;
    }

    toArabicNumeral(num: number): string {
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return num.toString().split('').map(char => {
            const digit = parseInt(char);
            return isNaN(digit) ? char : arabicNumbers[digit];
        }).join('');
    }

    setMockData(): void {
        this.sessions = [
            {
                time: '10:00 AM',
                type: 'finished',
                patient: 'Eng. Ahmed — Recharger Station',
                details: 'Swarm - Station 1/3 Session 5/24',
                badgeText: 'Finished'
            },
            {
                time: '10:30 AM',
                type: 'finished',
                patient: 'N. Khaled — Recharger Station',
                details: 'Swarm - Station 1/3 Session 12/24',
                badgeText: 'Finished'
            },
            {
                time: '11:00 AM',
                type: 'live',
                patient: 'Eng. Salem — Recharger Station',
                details: 'Swarm - Station 1/3 Session 7/26   12:18 Remaining',
                badgeText: 'Live Now'
            },
            {
                time: '11:30 AM',
                type: 'empty',
                patient: 'No session'
            },
            {
                time: '12:00 PM',
                type: 'measurement',
                patient: 'R. Mostafa — Periodic Measurements',
                details: 'Knee Basic · 15 mins   Sent to Doctor',
                badgeText: 'Measurements',
                badgeIcon: true
            },
            {
                time: '02:30 PM',
                type: 'solo-measurement',
                patient: 'R. Mostafa — Return to Play',
                details: 'Solo · 60 mins   Measurements at end',
                badgeText: 'Solo + Integrated Measurements'
            },
            {
                time: '03:00 PM',
                type: 'upcoming',
                patient: 'F. Ali — Resilient Station',
                details: 'Swarm - Apex Station  Session 20/24',
                badgeText: 'Upcoming'
            }
        ];
    }

    onSessionClick(session: any) {
        if (session.type === 'live' || session.type == 'measurement' || session.type == 'solo-measurement') {
            this.sessionSelected.emit(session);
        }
    }
}
