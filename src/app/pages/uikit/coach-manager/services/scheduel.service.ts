import { Injectable } from '@angular/core';
import { Branch, Coach, Session } from '../models/coach';
import { BehaviorSubject, Observable } from 'rxjs';
import { TreatmentPlan } from '../../session-management/session-management.component';

@Injectable({
    providedIn: 'root'
})
export class ScheduelService {
    private coachesSubject = new BehaviorSubject<Coach[]>(this.getMockCoaches());
    private sessionsSubject = new BehaviorSubject<Session[]>(this.getMockSessions());
    private branchesSubject = new BehaviorSubject<Branch[]>(this.getMockBranches());

    constructor() {}

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
                branch: 'Downtown',
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
                branch: 'Downtown',
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
                branch: 'Northside',
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
                date: new Date('2024-03-18'), // Monday
                time: '10:00',
                duration: 60,
                type: 'Rehabilitation',
                status: 'Scheduled'
            },
            {
                id: '2',
                patientId: '2',
                coachId: '1',
                date: new Date('2024-03-18'), // Monday
                time: '14:00',
                duration: 45,
                type: 'Assessment',
                status: 'Scheduled'
            },
            {
                id: '3',
                patientId: '3',
                coachId: '2',
                date: new Date('2024-03-19'), // Tuesday
                time: '11:00',
                duration: 60,
                type: 'Rehabilitation',
                status: 'Scheduled'
            },
            {
                id: '4',
                patientId: '1',
                coachId: '3',
                date: new Date('2024-03-20'), // Wednesday
                time: '09:00',
                duration: 45,
                type: 'Follow-up',
                status: 'Scheduled'
            },
            {
                id: '5',
                patientId: '2',
                coachId: '',
                date: new Date('2024-03-21'), // Thursday
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
                name: 'Downtown Branch',
                location: '123 Main St, Downtown',
                coaches: this.getMockCoaches().filter((c) => c.branch === 'Downtown')
            },
            {
                id: '2',
                name: 'Northside Branch',
                location: '456 Oak Ave, Northside',
                coaches: this.getMockCoaches().filter((c) => c.branch === 'Northside')
            }
        ];
    }
}
