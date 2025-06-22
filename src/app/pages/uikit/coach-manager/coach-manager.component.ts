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
import { CoachAssignmentComponent } from './coach-assignment/coach-assignment.component';

interface TreatmentTemplate {
    id: string;
    name: string;
    category: string;
    description: string;
    duration: number;
    sessionsPerWeek: number;
    exercises: string[];
}

interface TreatmentPlan {
    id: string;
    name: string;
    progress: number;
    completedSessions: number;
    totalSessions: number;
    nextSession: string;
    duration: number;
    sessionsPerWeek: number;
    sessionDuration: number;
    exercises: Exercise[];
    goals: string;
    notes: string;
}

interface Exercise {
    name: string;
    sets: number;
    reps: number;
    duration: number;
}

@Component({
    selector: 'app-coach-manager',
    standalone: true,
    imports: [CoachAssignmentComponent,ManageScheduelsComponent, ProgressBarModule, AvatarModule, TagModule, ToastModule, FormsModule, DialogModule, ButtonModule, LucideAngularModule, CardModule, CommonModule, ToolbarModule, TabsModule],

    templateUrl: './coach-manager.component.html',
    styleUrls: ['./coach-manager.component.css']
})
export class CoachManagerComponent implements OnInit {
    patients: any[] = [];
    coachesSlots: any[] = [];
    searchTerm: string = '';
    currentPatient: any;

    // Treatment Plans properties
    selectedPatientForPlan: string = '';
    treatmentTemplates: TreatmentTemplate[] = [];
    selectedTemplate: TreatmentTemplate | null = null;
    currentTreatmentPlan: TreatmentPlan | null = null;
    isEditingPlan: boolean = false;
    editingPlan: TreatmentPlan | null = null;

    imgPath: string = '../../../../../public/Capture.PNG';

    constructor() {}

    ngOnInit() {
        this.getAllPatients();
        this.loadTreatmentTemplates();
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
                injuryLocation: 'Right Knee',
                mechanismOfInjury: 'Non-contact injury during soccer game - sudden change of direction',
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
                injuryLocation: 'Right Shoulder',
                mechanismOfInjury: 'Repetitive overhead movements during work',
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
                injuryLocation: 'L4-L5 Disc',
                mechanismOfInjury: 'Chronic poor posture and sedentary lifestyle',
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

    // Load treatment plan templates
    loadTreatmentTemplates(): void {
        this.treatmentTemplates = [
            {
                id: '1',
                name: 'ACL Reconstruction Recovery',
                category: 'Knee Rehabilitation',
                description: 'Comprehensive rehabilitation program for ACL reconstruction recovery with progressive phases.',
                duration: 12,
                sessionsPerWeek: 3,
                exercises: [
                    'Quadriceps strengthening',
                    'Hamstring curls',
                    'Balance exercises',
                    'Progressive walking',
                    'Plyometric training',
                    'Sport-specific drills'
                ]
            },
            {
                id: '2',
                name: 'Shoulder Impingement Protocol',
                category: 'Shoulder Rehabilitation',
                description: 'Targeted exercises to reduce impingement and improve shoulder mobility and strength.',
                duration: 8,
                sessionsPerWeek: 2,
                exercises: [
                    'Scapular stabilization',
                    'Rotator cuff strengthening',
                    'Range of motion exercises',
                    'Postural correction',
                    'Functional movements'
                ]
            },
            {
                id: '3',
                name: 'Lower Back Pain Management',
                category: 'Spine Rehabilitation',
                description: 'Core strengthening and stabilization program for chronic lower back pain.',
                duration: 10,
                sessionsPerWeek: 2,
                exercises: [
                    'Core stabilization',
                    'Pelvic tilts',
                    'Bird dog exercises',
                    'Dead bug variations',
                    'Gentle stretching',
                    'Postural training'
                ]
            }
        ];
    }

    // Treatment plan methods
    onPatientForPlanChange(): void {
        if (this.selectedPatientForPlan) {
            // Load current treatment plan for selected patient
            this.loadCurrentTreatmentPlan();
        } else {
            this.currentTreatmentPlan = null;
            this.selectedTemplate = null;
        }
    }

    loadCurrentTreatmentPlan(): void {
        // Mock data - in real app, this would come from a service
        const patientId = parseInt(this.selectedPatientForPlan);
        if (patientId === 1) {
            this.currentTreatmentPlan = {
                id: '1',
                name: 'ACL Reconstruction Recovery - Modified',
                progress: 65,
                completedSessions: 13,
                totalSessions: 20,
                nextSession: '2024-06-10',
                duration: 12,
                sessionsPerWeek: 3,
                sessionDuration: 60,
                exercises: [
                    { name: 'Quadriceps strengthening', sets: 3, reps: 12, duration: 30 },
                    { name: 'Hamstring curls', sets: 3, reps: 15, duration: 45 },
                    { name: 'Balance exercises', sets: 2, reps: 10, duration: 60 }
                ],
                goals: 'Restore full knee function and return to sports activities',
                notes: 'Patient responding well to treatment. Progressing to phase 3 exercises.'
            };
        } else {
            this.currentTreatmentPlan = null;
        }
    }

    selectTemplate(template: TreatmentTemplate): void {
        this.selectedTemplate = template;
        this.isEditingPlan = true;
        this.initializeEditingPlan(template);
    }

    initializeEditingPlan(template: TreatmentTemplate): void {
        this.editingPlan = {
            id: Date.now().toString(),
            name: template.name + ' - Customized',
            progress: 0,
            completedSessions: 0,
            totalSessions: template.duration * template.sessionsPerWeek,
            nextSession: new Date().toLocaleDateString(),
            duration: template.duration,
            sessionsPerWeek: template.sessionsPerWeek,
            sessionDuration: 60,
            exercises: template.exercises.map(exercise => ({
                name: exercise,
                sets: 3,
                reps: 10,
                duration: 30
            })),
            goals: 'Improve function and reduce pain',
            notes: ''
        };
    }

    editCurrentPlan(): void {
        if (this.currentTreatmentPlan) {
            this.editingPlan = { ...this.currentTreatmentPlan };
            this.isEditingPlan = true;
        }
    }

    viewCurrentPlan(): void {
        // This would open a detailed view dialog
        console.log('Viewing current plan:', this.currentTreatmentPlan);
    }

    addExercise(): void {
        if (this.editingPlan) {
            this.editingPlan.exercises.push({
                name: 'New Exercise',
                sets: 3,
                reps: 10,
                duration: 30
            });
        }
    }

    removeExercise(index: number): void {
        if (this.editingPlan) {
            this.editingPlan.exercises.splice(index, 1);
        }
    }

    cancelEdit(): void {
        this.isEditingPlan = false;
        this.editingPlan = null;
        this.selectedTemplate = null;
    }

    savePlan(): void {
        if (this.editingPlan) {
            // In a real app, this would save to a service
            this.currentTreatmentPlan = { ...this.editingPlan };
            this.isEditingPlan = false;
            this.editingPlan = null;
            this.selectedTemplate = null;
            console.log('Plan saved:', this.currentTreatmentPlan);
        }
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

    // Navigate to treatment plans tab
    navigateToTreatmentPlans(): void {
        // In a real application, this would navigate to the treatment plans tab
        // For now, we'll just log the action
        console.log('Navigating to treatment plans for patient:', this.currentPatient?.name);
        // You could implement tab switching here if needed
    }
}
