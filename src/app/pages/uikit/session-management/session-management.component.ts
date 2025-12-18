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
import { TabsNavigationComponent } from './tabs-navigation/tabs-navigation.component';
import { OverviewComponent } from './overview/overview.component';
import { ExerciseProtocolComponent } from './exercise-protocol/exercise-protocol.component';
import { SessionsComponent } from './sessions/sessions.component';
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
    imports: [SessionsComponent, ExerciseProtocolComponent, OverviewComponent, TabsNavigationComponent, TagModule, ToastModule, FormsModule, DialogModule, ButtonModule, LucideAngularModule, CardModule, CommonModule, ToolbarModule, TabsModule],
    templateUrl: './session-management.component.html',
    styleUrls: ['./session-management.component.css']
})
export class SessionManagementComponent implements OnInit {
    coachData: Coach = {
        id: 'C001',
        name: 'Captain. Sarah Johnson',
        specialization: 'Orthopedic Rehabilitation'
    };
    data = {
        sessionsDone: 12,
        remaining: 36,
        currentPhase: '2 / 4',
        totalWeeks: 12
    };

    currentTab = 'overview';

    tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'exercise', label: 'Exercise Protocol' },
        { id: 'sessions', label: 'Sessions' },
        { id: 'measurments', label: 'Measurments' }
    ];

    onTabChange(tabId: any): void {
        this.currentTab = tabId;
    }
    ngOnInit(): void {}
}
