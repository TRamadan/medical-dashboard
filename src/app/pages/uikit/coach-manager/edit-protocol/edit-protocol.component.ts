import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';

interface Exercise {
    name: string;
    description: string;
    tool?: string;
    sets: any;
    reps: any; // Can be a string, number, or array per set
    intensity: string;
    tempo: string;
    rest: string;
    videoUrl: string;
}

interface Section {
    name: string;
    time: number;
    coachManager: string | null;
    exercises: Exercise[];
}

interface Session {
    name: string;
    sections: Section[];
}

interface Week {
    weekName: string;
    sessions: Session[];
}

interface Phase {
    phaseName: string;
    weeks: Week[];
}

interface Station {
    name: string;
    type: 'resilience' | 'recharger' | 'apex';
    icon: string;
    coach: string | null;
}

@Component({
    selector: 'app-edit-protocol',
    imports: [
        AccordionModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        InputNumberModule,
        TagModule,
        ProgressBarModule,
        TooltipModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './edit-protocol.component.html',
    styleUrl: './edit-protocol.component.scss'
})
export class EditProtocolComponent {
    // Patient Info & Stats
    patientName = signal('Mustafa');
    totalSessions = signal(16);
    totalWeeks = signal(4);

    // Timer
    timerDisplay = signal('00:00');
    sessionProgress = signal(0);
    exercisesDone = signal(0);
    exercisesTotal = signal(0);

    // Coaches
    coaches = [
        { label: 'Dr. Safari', value: 'Dr. Safari' },
        { label: 'Dr. Karim', value: 'Dr. Karim' },
        { label: 'Dr. Lasel', value: 'Dr. Lasel' },
        { label: 'Ahmed Coach', value: 'Ahmed Coach' },
        { label: 'Sarah Coach', value: 'Sarah Coach' }
    ];

    // Intensity options
    intensityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Moderate', value: 'Moderate' },
        { label: 'High', value: 'High' }
    ];

    // Station assignments
    stations: Station[] = [
        { name: 'Resilience Station', type: 'resilience', icon: 'pi pi-check-circle', coach: 'Dr. Safari' },
        { name: 'Recharger Station', type: 'recharger', icon: 'pi pi-star-fill', coach: null },
        { name: 'Apex Station', type: 'apex', icon: 'pi pi-star-fill', coach: null }
    ];

    // Mock phases data (replaces selectedPatient.treatmentPlan.phases)
    phases: Phase[] = [
        {
            phaseName: 'Phase 1 - Initial Rehabilitation',
            weeks: [
                {
                    weekName: 'Week 1–2',
                    sessions: [
                        {
                            name: 'Session A',
                            sections: [
                                {
                                    name: 'Warm Up',
                                    time: 10,
                                    coachManager: 'Ahmed Coach',
                                    exercises: [
                                        {
                                            name: 'Stationary Bike',
                                            tool: 'Bike',
                                            description: 'Light resistance to increase blood flow.',
                                            sets: '1',
                                            reps: ['5 min'],
                                            intensity: 'Low',
                                            tempo: 'Steady',
                                            rest: '0s',
                                            videoUrl: 'https://example.com/bike'
                                        },
                                        {
                                            name: 'Dynamic Stretching',
                                            tool: 'Bodyweight',
                                            description: 'Leg swings and arm circles.',
                                            sets: '2',
                                            reps: ['10 reps', '10 reps'],
                                            intensity: 'Low',
                                            tempo: 'Controlled',
                                            rest: '30s',
                                            videoUrl: 'https://example.com/stretch'
                                        },
                                        {
                                            name: 'Glute Bridges',
                                            tool: 'Mat',
                                            description: 'Squeeze glutes at the top, hold for 2s.',
                                            sets: '3',
                                            reps: ['15 reps', '15 reps', '15 reps'],
                                            intensity: 'Medium',
                                            tempo: '2-0-2-2',
                                            rest: '45s',
                                            videoUrl: 'https://example.com/bridge'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            phaseName: 'Phase 2 - Strengthening',
            weeks: [
                {
                    weekName: 'Week 3–4',
                    sessions: [
                        {
                            name: 'Session A',
                            sections: [
                                {
                                    name: 'Main Workout',
                                    time: 30,
                                    coachManager: null,
                                    exercises: [
                                        { name: '', tool: '', description: '', sets: '1', reps: [''], intensity: '', tempo: '', rest: '', videoUrl: '' }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    addSection(session: Session): void {
        if (!session.sections) {
            session.sections = [];
        }
        session.sections.push({
            name: 'New Section',
            time: 10,
            coachManager: null,
            exercises: []
        });
        this.addExercise(session.sections[session.sections.length - 1]);
    }

    addExercise(section: Section): void {
        if (!section.exercises) {
            section.exercises = [];
        }
        section.exercises.push({
            name: '',
            tool: '',
            description: '',
            sets: '1',
            reps: [''],
            intensity: '',
            tempo: '',
            rest: '',
            videoUrl: ''
        });
    }

    getRepArray(ex: Exercise): number[] {
        const numSets = parseInt(ex.sets, 10);
        const count = isNaN(numSets) || numSets <= 0 ? 1 : Math.min(numSets, 10);

        if (!Array.isArray(ex.reps)) ex.reps = [ex.reps || ''];

        while (ex.reps.length < count) ex.reps.push('');

        return Array.from({ length: count }, (_, i) => i);
    }

    moveExerciseUp(section: Section, index: number): void {
        if (index > 0) {
            const temp = section.exercises[index];
            section.exercises[index] = section.exercises[index - 1];
            section.exercises[index - 1] = temp;
        }
    }

    moveExerciseDown(section: Section, index: number): void {
        if (index < section.exercises.length - 1) {
            const temp = section.exercises[index];
            section.exercises[index] = section.exercises[index + 1];
            section.exercises[index + 1] = temp;
        }
    }

    getPhaseSessionCount(phase: Phase): number {
        return phase.weeks.reduce((total, week) => total + week.sessions.length, 0);
    }

    getSeverity(status: string | undefined): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status) {
            case 'Low':
                return 'danger';
            case 'Moderate':
                return 'warn';
            case 'High':
                return 'success';
            default:
                return 'info';
        }
    }

    get hasUnassignedStations(): boolean {
        return this.stations.some(station => !station.coach);
    }
}
