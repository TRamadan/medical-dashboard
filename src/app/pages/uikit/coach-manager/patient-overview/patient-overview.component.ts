import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';

@Component({
    selector: 'app-patient-overview',
    imports: [CommonModule, FormsModule, AccordionModule, TagModule, ButtonModule, TooltipModule, CardModule, TableModule, TabViewModule, InputTextModule, InputNumberModule, DropdownModule],
    standalone: true,
    templateUrl: './patient-overview.component.html',
    styleUrl: './patient-overview.component.scss'
})
export class PatientOverviewComponent {
    @Input() selectedPatient: any = null;

    coaches: any[] = [
        { label: 'Ahmed Coach', value: 'Ahmed Coach' },
        { label: 'Sarah Coach', value: 'Sarah Coach' }
    ];

    intensityOptions: any[] = [
        { label: 'Low', value: 'Low' },
        { label: 'Moderate', value: 'Moderate' },
        { label: 'High', value: 'High' }
    ];

    patients: any[] = [
        {
            id: 'PT-202225',
            name: 'Ahmed Ali Hassan',
            age: '35 Years',
            gender: 'Male',
            mobile: '01010101010',
            email: 'ahmed.ali@gmail.com',
            address: '84 El-Tayraan street - Nasr City',
            bookingDate: '2025-12-15',
            service: 'Physiotherapy',
            bookingTime: '10:00 AM - 11:00 AM',
            status: 'VIP',
            level: 'High',
            injury: 'ACL Tear',
            sport: 'Football',
            acceptedReport: true,
            treatmentPlan: {
                planId: 'TP-2025-001',
                createdBy: 'Dr. Mohamed Ali',
                assignedDate: '2025-11-14',
                patientApproval: 'Approved',
                approvalDate: '2025-11-15',
                durationWeeks: 12,
                totalSessions: 36,
                sessionsPerWeek: 3,
                sessionsDone: 6,
                remaining: 30,
                currentPhase: 'Rehabilitation Phase',
                totalWeeks: 12,
                phases: [
                    {
                        phaseName: 'Phase 1: Pain & Swelling Control',
                        durationWeeks: 2,
                        sessionsPerWeek: 3,
                        phaseWeeks: 3,
                        specializations: ['Physical Therapy', 'Sports Medicine'],
                        objective: 'Reduce pain and inflammation, restore basic range of motion.',
                        showWeeks: true,
                        weeksRange: '1-2',
                        sessionsRange: '1-6',
                        weeks: [
                            {
                                weekName: 'Week #1',
                                sessions: [
                                    {
                                        name: 'Session 1',
                                        sections: [
                                            {
                                                name: 'Warm Up',
                                                time: 10,
                                                coachManager: 'Ahmed Coach',
                                                exercises: [
                                                    {
                                                        name: 'Ankle Pumps',
                                                        description: 'Move ankle up and down',
                                                        sets: 3,
                                                        reps: 15,
                                                        intensity: 'Low',
                                                        tempo: '2-0-2',
                                                        rest: '30s',
                                                        videoUrl: 'http://example.com/v1'
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        name: 'Session 2',
                                        sections: []
                                    },
                                    {
                                        name: 'Session 3',
                                        sections: []
                                    }
                                ]
                            },
                            {
                                weekName: 'Week #2',
                                sessions: [
                                    {
                                        name: 'Session 1',
                                        sections: []
                                    },
                                    {
                                        name: 'Session 2',
                                        sections: []
                                    },
                                    {
                                        name: 'Session 3',
                                        sections: []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        phaseName: 'Phase 2: Range of Motion',
                        durationWeeks: 3,
                        phaseWeeks: 3,
                        sessionsPerWeek: 3,
                        specializations: ['Physical Therapy', 'Sports Medicine', 'kdlkslkdld', 'Sports Medicine', 'kkw909sf09sffek', 'Sports Medicine', 'ejejjdjjd'],
                        objective: 'Increase flexibility and joint mobility.',

                        weeks: [] // Populated similarly...
                    }
                ]
            }
        },
        {
            id: 'PT-202226',
            name: 'Sara Ahmed',
            age: '28 Years',
            gender: 'Female',
            mobile: '01234567890',
            email: 'sara.ahmed@gmail.com',
            address: '123 Main St - Cairo',
            bookingDate: '2025-12-20',
            service: 'Physiotherapy',
            bookingTime: '09:00 AM - 10:00 AM',
            status: 'Regular',
            level: 'Moderate',
            injury: 'Shoulder Impingement',
            sport: 'Tennis',
            acceptedReport: true,
            treatmentPlan: {
                planId: 'TP-2025-002',
                createdBy: 'Dr. Sarah Smith',
                assignedDate: '2025-12-01',
                patientApproval: 'Pending',
                approvalDate: '-',
                durationWeeks: 8,
                totalSessions: 24,
                sessionsPerWeek: 3,
                sessionsDone: 0,
                remaining: 24,
                currentPhase: 'Initial Phase',
                totalWeeks: 8,
                phases: [
                    {
                        phaseName: 'Phase 1: Pain Assessment & Control',
                        durationWeeks: 2,
                        sessionsPerWeek: 3,
                        phaseWeeks: 2,
                        specializations: ['Physical Therapy'],
                        objective: 'Assess pain levels and reduce inflammation.',
                        showWeeks: true,
                        weeksRange: '1-2',
                        sessionsRange: '1-6',
                        weeks: [
                            {
                                weekName: 'Week #1',
                                sessions: [
                                    {
                                        name: 'Session 1',
                                        sections: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
        // ... (can add other patients with simpler structures or same if needed, kept brief for this task)
    ];
    @Output() patientSelected = new EventEmitter<any>();
    @Output() navigateToAssign = new EventEmitter<void>();

    selectPatient(patient: any) {
        this.selectedPatient = patient;
        this.patientSelected.emit(patient);
    }

    resetSelection() {
        this.selectedPatient = null;
        this.patientSelected.emit(null);
    }

    addSection(session: any) {
        if (!session.sections) {
            session.sections = [];
        }
        session.sections.push({
            name: 'New Section',
            time: 10,
            coachManager: null,
            exercises: []
        });
    }

    addExercise(section: any) {
        if (!section.exercises) {
            section.exercises = [];
        }
        section.exercises.push({
            name: '',
            description: '',
            sets: 3,
            reps: 10,
            intensity: 'Moderate',
            tempo: '2-0-2',
            rest: '60s',
            videoUrl: ''
        });
    }

    removeExercise(section: any, index: number) {
        section.exercises.splice(index, 1);
    }

    getSeverity(status: string | undefined) {
        switch (status) {
            case 'Low':
                return 'danger';
            case 'Moderate':
                return 'warn';
            case 'VIP':
                return 'success';
            default:
                return 'info';
        }
    }
}
