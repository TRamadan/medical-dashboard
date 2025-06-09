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
import { ManageScheduelsComponent } from './manage-scheduels/manage-scheduels.component';
@Component({
    selector: 'app-coach-manager',
    standalone: true,
    imports: [ManageScheduelsComponent, ProgressBarModule, AvatarModule, TagModule, ToastModule, FormsModule, DialogModule, ButtonModule, LucideAngularModule, CardModule, CommonModule, ToolbarModule, TabsModule],

    templateUrl: './coach-manager.component.html',
    styleUrls: ['./coach-manager.component.css']
})
export class CoachManagerComponent implements OnInit {
    patients: any[] = [];
    coachesSlots: any[] = [];
    searchTerm: string = '';
    currentPatient: any;

    constructor() {}

    ngOnInit() {
        this.getAllPatients();
    }

    //here is the function needed to get all patients
    getAllPatients(): void {
        this.patients = [
            {
                id: 1,
                name: 'John Smith',
                age: 28,
                injury: 'ACL Tear',
                severity: 'High',
                dateOfInjury: '2024-05-15',
                status: 'Active Treatment',
                doctor: 'Dr. Williams',
                description: 'Complete tear of anterior cruciate ligament during soccer match. Patient reports instability and pain during movement.',
                symptoms: ['Knee instability', 'Swelling', 'Pain during movement', 'Limited range of motion'],
                treatmentHistory: [
                    { date: '2024-05-16', treatment: 'Initial assessment and MRI', provider: 'Dr. Williams' },
                    { date: '2024-05-20', treatment: 'Started physical therapy', provider: 'Coach Martinez' },
                    { date: '2024-05-27', treatment: 'Strength building exercises', provider: 'Coach Anderson' }
                ],
                currentPlan: 'ACL Reconstruction Recovery Protocol',
                progress: 65,
                nextAppointment: '2024-06-08'
            },
            {
                id: 2,
                name: 'Sarah Johnson',
                age: 34,
                injury: 'Shoulder Impingement',
                severity: 'Medium',
                dateOfInjury: '2024-05-20',
                status: 'Scheduled',
                doctor: 'Dr. Lee',
                description: 'Rotator cuff impingement due to repetitive overhead activities. Patient works as a painter.',
                symptoms: ['Shoulder pain', 'Weakness in arm elevation', 'Night pain', 'Reduced overhead reach'],
                treatmentHistory: [
                    { date: '2024-05-21', treatment: 'Initial consultation', provider: 'Dr. Lee' },
                    { date: '2024-05-25', treatment: 'Ultrasound therapy', provider: 'Coach Davis' }
                ],
                currentPlan: 'Shoulder Mobility and Strengthening Program',
                progress: 30,
                nextAppointment: '2024-06-06'
            },
            {
                id: 3,
                name: 'Mike Davis',
                age: 42,
                injury: 'Lower Back Pain',
                severity: 'Medium',
                dateOfInjury: '2024-05-10',
                status: 'Active Treatment',
                doctor: 'Dr. Rodriguez',
                description: 'Chronic lower back pain with disc herniation at L4-L5. Office worker with poor posture habits.',
                symptoms: ['Lower back pain', 'Leg numbness', 'Morning stiffness', 'Pain with sitting'],
                treatmentHistory: [
                    { date: '2024-05-11', treatment: 'MRI and assessment', provider: 'Dr. Rodriguez' },
                    { date: '2024-05-15', treatment: 'Core strengthening program', provider: 'Coach Thompson' },
                    { date: '2024-05-22', treatment: 'Postural correction training', provider: 'Coach Wilson' }
                ],
                currentPlan: 'Spinal Stabilization Protocol',
                progress: 45,
                nextAppointment: '2024-06-07'
            }
        ];
    }

    //here is the function needed to get all coaches with slots
    getAllCoachesSlots(): void {
        this.coachesSlots = [
            {
                id: 1,
                name: 'Dr. Anderson',
                specialization: 'Physical Therapy',
                avatar: 'DA',
                status: 'Available',
                sessions: [
                    { time: '09:00', patient: 'John Smith', type: 'ACL Recovery' },
                    { time: '11:00', patient: 'Sarah Johnson', type: 'Shoulder Therapy' },
                    { time: '14:00', patient: 'Mike Davis', type: 'Back Strengthening' }
                ]
            },
            {
                id: 2,
                name: 'Coach Martinez',
                specialization: 'Strength Training',
                avatar: 'CM',
                status: 'Busy',
                sessions: [
                    { time: '10:00', patient: 'Emma Wilson', type: 'Core Training' },
                    { time: '13:00', patient: 'Alex Brown', type: 'Recovery Session' }
                ]
            },
            {
                id: 3,
                name: 'Dr. Lee',
                specialization: 'Sports Medicine',
                avatar: 'DL',
                status: 'Available',
                sessions: [
                    { time: '08:00', patient: 'Tom Wilson', type: 'Assessment' },
                    { time: '15:00', patient: 'Lisa Garcia', type: 'Follow-up' }
                ]
            }
        ];
    }

    //here is the function needed to show details for the selected patient
    setSelectedPatientDetail(patient: any): void {
        this.currentPatient = patient;
    }

    getSeveritySeverity(severity: string): 'success' | 'warn' | 'danger' | 'info' {
        switch (severity?.toLowerCase()) {
            case 'high':
                return 'danger';
            case 'medium':
                return 'warn';
            case 'low':
                return 'success';
            default:
                return 'info';
        }
    }

    //here is the function needed to get the first and second letters for the first name
    getInitials(name: string): string {
        if (!name) return '';
        const words = name.trim().split(' ');
        const initials = words.slice(0, 2).map((w) => w.charAt(0).toUpperCase());
        return initials.join('');
    }
}
