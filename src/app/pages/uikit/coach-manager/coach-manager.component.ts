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
import { AvatarModule } from 'primeng/avatar';
import { ProgressBarModule } from 'primeng/progressbar';
import { DropdownModule } from 'primeng/dropdown';
import { TabsNavigationComponent } from '../session-management/tabs-navigation/tabs-navigation.component';
import { PatientOverviewComponent } from './patient-overview/patient-overview.component';
import { EditProtocolComponent } from './edit-protocol/edit-protocol.component';
import { AssignSessionsComponent } from './assign-sessions/assign-sessions.component';
import { ScheduleComponent } from './schedule/schedule.component';
@Component({
    selector: 'app-coach-manager',
    standalone: true,
    imports: [
        PatientOverviewComponent,
        DropdownModule,
        ProgressBarModule,
        ToastModule,
        FormsModule,
        DialogModule,
        ButtonModule,
        LucideAngularModule,
        CommonModule,
        ToolbarModule,
        TabsModule,
        TabsNavigationComponent,
        EditProtocolComponent,
        AssignSessionsComponent,
        ScheduleComponent
    ],

    templateUrl: './coach-manager.component.html',
    styleUrls: ['./coach-manager.component.css']
})
export class CoachManagerComponent implements OnInit {
    currentTab = 'overview';
    selectedPatient: any = null; 


    onPatientSelected(patient: any) {
        this.selectedPatient = patient;
    }
    data = {
        sessionsDone: 12,
        remaining: 36,
        currentPhase: '2 / 4',
        totalWeeks: 12
    };

    tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'edit', label: 'Edit Protocol' },
        { id: 'assign', label: 'Assign Coaches' },
        { id: 'schedule', label: 'Schedule' }
    ];

    constructor() {}

    ngOnInit() {}

    onTabChange(tabId: any): void {
        this.currentTab = tabId;
    }
}
