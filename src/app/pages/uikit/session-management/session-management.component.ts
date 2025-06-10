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
import { TagModule } from 'primeng/tag';

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
    duration: string;
    sessionType: string;
    scheduledDate: string;
    scheduledTime: string;
    status: 'scheduled' | 'completed' | 'not-completed' | 'in progress';
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
    imports: [TagModule, ToastModule, FormsModule, DialogModule, ButtonModule, LucideAngularModule, CardModule, CommonModule, ToolbarModule, TabsModule],
    templateUrl: './session-management.component.html',
    styleUrls: ['./session-management.component.css']
})
export class SessionManagementComponent implements OnInit {
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
            duration: '30 min',
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
            duration: '30 min',
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
            duration: '30 min',
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
        this.selectedSession = session;
        this.isSessionDetails = true;
    }

    updateSessionStatus(session: Session, newStatus: Session['status']): void {
        // if ((session.status === 'in progress' || session.status === 'scheduled') && (newStatus == 'not-completed' || newStatus === 'completed')) {
        //     window.alert('msh hynf3 t3ml in complete aw complete mn 8er ma el session tkon start');
        //     return;
        // }
        this.assignedSessions = this.assignedSessions.map((s) => (s.id === session.id ? { ...s, status: newStatus } : s));
    }

    saveProgress(sessionId: string): void {
        console.log('Saving progress for', sessionId, this.progressData[sessionId]);
        alert('Progress measurements saved successfully!');
    }

    getSeverity(status: Session['status']): 'success' | 'info' | 'warn' | 'danger' | 'contrast' {
        switch (status) {
            case 'completed':
                return 'success';
            case 'scheduled':
                return 'warn';
            case 'not-completed':
                return 'danger';
            default:
                return 'info';
        }
    }

    ngOnInit(): void {}

    /* trackBy boosts ngFor performance */
    trackById = (_: number, s: Session) => s.id;
}
