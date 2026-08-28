import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../../service/api.service';
import {
    DashboardOverviewDto,
    PatientContactDto,
    AssignCoachDto
} from '../../models/coach-manager-api.model';

const MOCK_OVERVIEW: DashboardOverviewDto = {
    openIssues: 1,
    plansPendingAssignment: 2,
    teamSessionsToday: 12,
    sessionsFinished: 8,
    sessionsUpcoming: 4,
    teamScheduleBrief: [
        {
            coachId: 5,
            coachName: 'Eng. Karim',
            avatarInitial: 'K',
            slots: [
                { time: '11:00 AM', status: 'Late', statusColor: 'red' },
                { time: '2:00 PM', status: 'Available', statusColor: 'gray' }
            ]
        },
        {
            coachId: 7,
            coachName: 'Eng. Sarah',
            avatarInitial: 'S',
            slots: [
                { time: '11:00 AM', status: 'Session', statusColor: 'blue' },
                { time: '2:00 PM', status: 'Session', statusColor: 'blue' }
            ]
        },
        {
            coachId: 8,
            coachName: 'Eng. Amr',
            avatarInitial: 'A',
            slots: [
                { time: '11:00 AM', status: 'Session', statusColor: 'blue' },
                { time: '2:00 PM', status: 'Training', statusColor: 'purple' }
            ]
        }
    ],
    urgentActions: [
        {
            actionType: 'CoachDelay',
            title: 'Eng. Karim delayed 20 minutes',
            description: 'For session: Muscle Measurements - 11:00 AM',
            badge: 'Urgent',
            badgeColor: 'red',
            buttonLabel: 'Replace',
            phaseSessionId: 12,
            appointmentId: 55,
            planId: null
        },
        {
            actionType: 'NewPlan',
            title: 'New Rehab Plan - R. Mostafa',
            description: 'Pending Medical Protocol Review',
            badge: 'Pending',
            badgeColor: 'yellow',
            buttonLabel: 'Review',
            phaseSessionId: null,
            appointmentId: null,
            planId: 3
        },
        {
            actionType: 'MeasurementUnassigned',
            title: 'Measurements Session - K. Mahmoud',
            description: 'Measurement Engineer not assigned yet',
            badge: 'Measur.',
            badgeColor: 'dark-blue',
            buttonLabel: 'Assign',
            phaseSessionId: 101,
            appointmentId: null,
            planId: null
        },
        {
            actionType: 'MissedSession',
            title: 'Missed Session - S. Ali',
            description: 'Patient did not attend 10:00 AM session',
            badge: 'Missed',
            badgeColor: 'red',
            buttonLabel: 'Contact',
            phaseSessionId: 102,
            appointmentId: 60,
            planId: null
        }
    ]
};

@Injectable({
    providedIn: 'root'
})
export class PatientOverviewService {
    private readonly apiService = inject(ApiService);

    /**
     * GET /api/CoachManagerDashboard/overview
     */
    getOverview(): Observable<DashboardOverviewDto> {
        return this.apiService.get<DashboardOverviewDto>('CoachManagerDashboard/overview').pipe(
            catchError(err => {
                console.warn('API getOverview failed, falling back to mock overview:', err);
                return of(MOCK_OVERVIEW);
            })
        );
    }

    /**
     * PUT /api/CoachManagerDashboard/sessions/{id}/assign-coach
     */
    assignCoach(sessionId: number, coachId: number): Observable<void> {
        const body: AssignCoachDto = { coachId };
        return this.apiService.put<void>(`CoachManagerDashboard/sessions/${sessionId}/assign-coach`, body);
    }

    /**
     * PUT /api/CoachManagerDashboard/sessions/{id}/replace-coach
     */
    replaceCoach(sessionId: number, coachId: number): Observable<void> {
        const body: AssignCoachDto = { coachId };
        return this.apiService.put<void>(`CoachManagerDashboard/sessions/${sessionId}/replace-coach`, body);
    }

    /**
     * GET /api/CoachManagerDashboard/sessions/{id}/patient-contact
     */
    getPatientContact(sessionId: number): Observable<PatientContactDto> {
        return this.apiService.get<PatientContactDto>(`CoachManagerDashboard/sessions/${sessionId}/patient-contact`).pipe(
            catchError(err => {
                console.warn('API getPatientContact failed, falling back to mock contact:', err);
                return of({
                    patientName: 'S. Ali',
                    phoneNumbers: ['+20 100 123 4567', '+20 112 987 6543']
                });
            })
        );
    }
}
