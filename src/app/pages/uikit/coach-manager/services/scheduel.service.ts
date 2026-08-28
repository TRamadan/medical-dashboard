import { Injectable, inject } from '@angular/core';
import { Branch, Coach, Session } from '../models/coach';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../service/api.service';
import { TeamScheduleDto } from '../models/coach-manager-api.model';

const MOCK_TEAM_SCHEDULE: TeamScheduleDto = {
    date: 'الثلاثاء 26 أغسطس',
    coaches: [
        {
            coachId: 5,
            coachName: 'م. عمرو',
            stationLabel: 'APEX CLINIC',
            sessions: [
                {
                    phaseSessionId: 10,
                    appointmentId: 50,
                    time: '10:00',
                    patientName: 'ewarm - Apex',
                    phaseName: 'تحليل الأداء الحركي',
                    sessionType: 'Solo',
                    status: 'Completed',
                    statusBadge: 'انتهت',
                    badgeColor: 'gray',
                    isUrgent: false
                },
                {
                    phaseSessionId: 14,
                    appointmentId: 58,
                    time: '2:00',
                    patientName: 'م. مصطفى',
                    phaseName: 'Solo Training',
                    sessionType: 'Solo Training',
                    status: 'Confirmed',
                    statusBadge: 'Return to Play',
                    badgeColor: 'blue',
                    isUrgent: false
                }
            ]
        },
        {
            coachId: 6,
            coachName: 'م. سارة',
            stationLabel: 'RESILIENCE HUB',
            sessions: [
                {
                    phaseSessionId: 11,
                    appointmentId: 51,
                    time: '10:00',
                    patientName: 'ewarm - Resilience',
                    phaseName: 'مراجعة البيانات الحيوية',
                    sessionType: 'Group',
                    status: 'Completed',
                    statusBadge: 'انتهت',
                    badgeColor: 'gray',
                    isUrgent: false
                },
                {
                    phaseSessionId: 13,
                    appointmentId: 56,
                    time: '11:00',
                    patientName: 'م. سارة',
                    phaseName: 'تنسيق الخطة العلاجية',
                    sessionType: 'Assessment',
                    status: 'InProgress',
                    statusBadge: 'جاري',
                    badgeColor: 'green',
                    isUrgent: false
                },
                {
                    phaseSessionId: 15,
                    appointmentId: 59,
                    time: '2:00',
                    patientName: 'م. علي',
                    phaseName: 'Solo Session',
                    sessionType: 'Solo Session',
                    status: 'Confirmed',
                    statusBadge: 'Resilience',
                    badgeColor: 'purple',
                    isUrgent: false
                }
            ]
        },
        {
            coachId: 7,
            coachName: 'م. كريم',
            stationLabel: 'RECHARGER UNIT',
            sessions: [
                {
                    phaseSessionId: 16,
                    appointmentId: 60,
                    time: '10:00',
                    patientName: 'ewarm - Recharger',
                    phaseName: 'جلسة تقييم شاملة',
                    sessionType: 'Solo',
                    status: 'Completed',
                    statusBadge: 'انتهت',
                    badgeColor: 'gray',
                    isUrgent: false
                },
                {
                    phaseSessionId: 17,
                    appointmentId: 61,
                    time: '11:00',
                    patientName: 'بلا مدرب',
                    phaseName: 'تغيب مفاجئ - مطلوب بديل',
                    sessionType: 'Urgent',
                    status: 'Scheduled',
                    statusBadge: 'إحلال عاجل',
                    badgeColor: 'red',
                    isUrgent: true
                },
                {
                    phaseSessionId: 18,
                    appointmentId: 62,
                    time: '2:00',
                    patientName: 'ك. محمود',
                    phaseName: 'Knee Basic -',
                    sessionType: 'Measurement',
                    status: 'Scheduled',
                    statusBadge: 'مقاسات',
                    badgeColor: 'yellow',
                    isUrgent: false
                },
                {
                    phaseSessionId: 19,
                    appointmentId: 63,
                    time: '3:00',
                    patientName: 'م. خالد',
                    phaseName: 'Recharger Session',
                    sessionType: 'Solo',
                    status: 'Scheduled',
                    statusBadge: 'قادمة',
                    badgeColor: 'gray',
                    isUrgent: false
                }
            ]
        }
    ]
};

@Injectable({
    providedIn: 'root'
})
export class ScheduelService {
    private readonly apiService = inject(ApiService);
    private coachesSubject = new BehaviorSubject<Coach[]>(this.getMockCoaches());
    private sessionsSubject = new BehaviorSubject<Session[]>(this.getMockSessions());
    private branchesSubject = new BehaviorSubject<Branch[]>(this.getMockBranches());

    constructor() { }

    /**
     * GET /api/CoachManagerDashboard/team-schedule
     */
    getTeamSchedule(): Observable<TeamScheduleDto> {
        return this.apiService.get<TeamScheduleDto>('CoachManagerDashboard/team-schedule').pipe(
            catchError(err => {
                console.warn('API getTeamSchedule failed:', err);
                return of({ date: '', coaches: [] });
            })
        );
    }

    getCoaches(): Observable<Coach[]> {
        return this.coachesSubject.asObservable();
    }

    getBranches(): Observable<Branch[]> {
        return this.branchesSubject.asObservable();
    }

    private getMockCoaches(): Coach[] {
        return [
            {
                id: '1',
                name: 'Dr. Emily Rodriguez',
                email: 'emily.rodriguez@clinic.com',
                specializations: ['Knee Rehabilitation', 'Sports Medicine', 'ACL Recovery'],
                branch: 'Tawfikia tennis club',
                availability: [
                    { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
                    { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
                    { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
                    { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
                    { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
                ],
                currentPatients: 8,
                maxPatients: 12,
                experience: 5
            },
            {
                id: '2',
                name: 'James Thompson',
                email: 'james.thompson@clinic.com',
                specializations: ['Shoulder Rehabilitation', 'Upper Body Therapy'],
                branch: 'Tawfikia tennis club',
                availability: [
                    { day: 'Monday', startTime: '10:00', endTime: '18:00', isAvailable: true },
                    { day: 'Tuesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
                    { day: 'Wednesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
                    { day: 'Thursday', startTime: '10:00', endTime: '18:00', isAvailable: true },
                    { day: 'Friday', startTime: '10:00', endTime: '18:00', isAvailable: true }
                ],
                currentPatients: 6,
                maxPatients: 10,
                experience: 3
            },
            {
                id: '3',
                name: 'Lisa Chen',
                email: 'lisa.chen@clinic.com',
                specializations: ['Spine Therapy', 'Core Strengthening', 'Posture Correction'],
                branch: 'The club 5th settelment',
                availability: [
                    { day: 'Monday', startTime: '08:00', endTime: '16:00', isAvailable: true },
                    { day: 'Tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
                    { day: 'Wednesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
                    { day: 'Thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
                    { day: 'Friday', startTime: '08:00', endTime: '16:00', isAvailable: true }
                ],
                currentPatients: 9,
                maxPatients: 12,
                experience: 7
            }
        ];
    }

    private getMockSessions(): Session[] {
        return [
            {
                id: '1',
                patientId: '1',
                coachId: '1',
                date: new Date('2024-03-18'),
                time: '10:00',
                duration: 60,
                type: 'Rehabilitation',
                status: 'Scheduled'
            },
            {
                id: '2',
                patientId: '2',
                coachId: '1',
                date: new Date('2024-03-18'),
                time: '14:00',
                duration: 45,
                type: 'Assessment',
                status: 'Scheduled'
            },
            {
                id: '3',
                patientId: '3',
                coachId: '2',
                date: new Date('2024-03-19'),
                time: '11:00',
                duration: 60,
                type: 'Rehabilitation',
                status: 'Scheduled'
            },
            {
                id: '4',
                patientId: '1',
                coachId: '3',
                date: new Date('2024-03-20'),
                time: '09:00',
                duration: 45,
                type: 'Follow-up',
                status: 'Scheduled'
            },
            {
                id: '5',
                patientId: '2',
                coachId: '',
                date: new Date('2024-03-21'),
                time: '15:00',
                duration: 45,
                type: 'Assessment',
                status: 'Scheduled'
            }
        ];
    }

    getSessions(): Observable<Session[]> {
        return this.sessionsSubject.asObservable();
    }

    private getMockBranches(): Branch[] {
        return [
            {
                id: '1',
                name: 'Tawfikia tennis club',
                location: '123 Main St, Downtown',
                coaches: this.getMockCoaches().filter((c) => c.branch === 'Tawfikia tennis club')
            },
            {
                id: '2',
                name: 'The club 5th settelment',
                location: '456 Oak Ave, Northside',
                coaches: this.getMockCoaches().filter((c) => c.branch === 'The club 5th settelment')
            }
        ];
    }
}
