import { Component, Input } from '@angular/core';
import { PatientData } from '../../appointments/booking-form/patient-form/patient-form.component';

@Component({
    selector: 'app-overview',
    imports: [],
    standalone: true,
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.scss'
})
export class OverviewComponent {
    @Input() patientData: any = {
        patientId: 'PT-202225',
        name: 'Ahmed Ali Hassan',
        age: 35,
        gender: 'Male',
        injury: 'ACL Tear - Right Knee',
        injuryDate: '25-11-2025'
    };

    @Input() progressData: any = {
        completed: 6,
        total: 36
    };

    @Input() workflowData: any = {
        title: 'Plan Activation Workflow',
        dateTime: '2025-11-16 at 10:00 AM',
        session: 'Session #7 - Phase 2: Range of Motion',
        location: 'Cairo - Nasr City Branch'
    };

    getProgressPercentage(): number {
        return Math.round((this.progressData.completed / this.progressData.total) * 100);
    }

    onNoShow(): void {
        console.log('No Show clicked');
        // Implement your logic here
    }

    onStartSession(): void {
        console.log('Start Session clicked');
        // Implement your logic here
    }
}
