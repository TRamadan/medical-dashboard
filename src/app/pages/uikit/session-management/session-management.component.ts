import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';

export interface TreatmentPlan {
    phase: string;
    exercises: string[];
    goals: string;
    measurements: string[];
}

export interface Session {
    id: string;
    patientName: string;
    patientId: string;
    injury: string;
    sessionType: string;
    scheduledDate: string;
    scheduledTime: string;
    status: 'scheduled' | 'completed' | 'not-completed';
    sessionNumber: number;
    totalSessions: number;
    otherCoaches: string[];
    treatmentPlan: TreatmentPlan;
}

export interface Coach {
    id: string;
    name: string;
    specialization: string;
}

@Component({
    selector: 'app-session-management',
    imports: [ToastModule, FormsModule, DialogModule, ButtonModule, LucideAngularModule, CardModule, CommonModule, ToolbarModule, TabsModule],
    templateUrl: './session-management.component.html',
    styleUrls: ['./session-management.component.css']
})
export class SessionManagementComponent implements OnInit {
    currentView: 'sessions' | 'schedule' = 'sessions';
    isSessionDetails: boolean = false;

    selectedSession: Session | null = null;
    progressData: Record<string, Record<string, string>> = {};
    coachData: Coach = {
        id: 'C001',
        name: 'Dr. Sarah Johnson',
        specialization: 'Orthopedic Rehabilitation'
    };

    assignedSessions: Session[] = [
        {
            id: 'S001',
            patientName: 'John Smith',
            patientId: 'P001',
            injury: 'ACL Tear - Right Knee',
            sessionType: 'Strengthening',
            scheduledDate: '2025-06-06',
            scheduledTime: '10:00 AM',
            status: 'scheduled',
            sessionNumber: 5,
            totalSessions: 12,
            otherCoaches: ['Dr. Mike Wilson'],
            treatmentPlan: {
                phase: 'Strengthening Phase',
                exercises: ['Quad sets', 'Straight leg raises', 'Mini squats'],
                goals: 'Increase quadriceps strength by 20%',
                measurements: ['Range of motion', 'Muscle strength', 'Pain level']
            }
        },
        {
            id: 'S002',
            patientName: 'Emily Davis',
            patientId: 'P002',
            injury: 'Rotator Cuff Strain',
            sessionType: 'Mobility',
            scheduledDate: '2025-06-06',
            scheduledTime: '2:00 PM',
            status: 'scheduled',
            sessionNumber: 3,
            totalSessions: 8,
            otherCoaches: [],
            treatmentPlan: {
                phase: 'Mobility Phase',
                exercises: ['Pendulum swings', 'Wall slides', 'External rotation'],
                goals: 'Restore full shoulder ROM',
                measurements: ['Shoulder flexion', 'External rotation', 'Pain assessment']
            }
        },
        {
            id: 'S003',
            patientName: 'Robert Chen',
            patientId: 'P003',
            injury: 'Lower Back Strain',
            sessionType: 'Core Strengthening',
            scheduledDate: '2025-06-05',
            scheduledTime: '11:00 AM',
            status: 'completed',
            sessionNumber: 8,
            totalSessions: 10,
            otherCoaches: ['Dr. Lisa Park', 'Dr. Tom Anderson'],
            treatmentPlan: {
                phase: 'Stabilization Phase',
                exercises: ['Dead bug', 'Bird dog', 'Modified plank'],
                goals: 'Improve core stability and reduce pain',
                measurements: ['Core strength', 'Pain level', 'Functional movement']
            }
        }
    ];

    upcomingSchedule = [
        { date: '2025-06-06', sessions: this.assignedSessions.filter((s) => s.scheduledDate === '2025-06-06') },
        { date: '2025-06-07', sessions: [] },
        { date: '2025-06-08', sessions: [] }
    ];

    openSession(session: Session): void {
        debugger;
        this.selectedSession = session;
        this.isSessionDetails = true;
    }

    updateSessionStatus(sessionId: string, newStatus: Session['status']): void {
        console.log(`Updating session ${sessionId} to ${newStatus}`);
        this.assignedSessions = this.assignedSessions.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s));
    }

    saveProgress(sessionId: string): void {
        console.log('Saving progress for', sessionId, this.progressData[sessionId]);
        alert('Progress measurements saved successfully!');
    }

    statusBadgeClasses(status: Session['status']): string {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'scheduled':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    ngOnInit(): void {}

    /* trackBy boosts ngFor performance */
    trackById = (_: number, s: Session) => s.id;
}
