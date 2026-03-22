import { Component, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { PatientData } from '../../appointments/booking-form/patient-form/patient-form.component';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';

@Component({
    selector: 'app-overview',
    imports: [CommonModule, AccordionModule, CheckboxModule, InputTextModule, FormsModule, ButtonModule, DialogModule, TextareaModule],
    standalone: true,
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnDestroy {
    @Input() patientData: any = {
        patientId: 'PT-202225',
        name: 'Ahmed Ali Hassan',
        age: 35,
        gender: 'Male',
        injury: 'ACL Tear - Right Knee',
        injuryDate: '25-11-2025'
    };

    coaches: any = {
        name: 'You ( Ahmed Samir )',
        specialty: 'Physical Therapy',
        isPrimary: true
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

    isSessionStarted: boolean = false;
    sessionTimer: string = '00:00:00';
    private timerInterval: any;
    private endTime: number = 0;

    activePanels: number[] = [];
    displayNoShowDialog: boolean = false;
    noShowReason: string = '';

    isTimerFinished: boolean = false;
    sessionDurationSeconds: number = 30; // Reduced to 30 seconds for quick testing purposes

    @ViewChild('timerContainer') timerContainer!: ElementRef;

    phases: any[] = [
        {
            id: 1,
            title: 'Phase 1: Pain & Swelling Control',
            weeks: 'Weeks 1-2',
            sessions: 'Sessions 1-6',
            completed: true,
            current: false
        },
        {
            id: 2,
            title: 'Phase 2: Range of Motion',
            weeks: 'Weeks 3-5',
            sessions: 'Sessions 7-15',
            completed: false,
            current: true,
            objectives: 'Restore full ROM, begin light strengthening, improve flexibility',
            exercises: [
                { name: 'Stationary bike: 10-15 minutes (low resistance)', completed: false, comment: '' },
                { name: 'Heel slides: 3 sets of 15 reps', completed: false, comment: '' },
                { name: 'Wall slides: 3 sets of 10 reps', completed: false, comment: '' },
                { name: 'Mini squats (0-45 degrees): 3 sets of 10 reps', completed: false, comment: '' },
                { name: 'Step-ups (4-inch height): 3 sets of 10 reps', completed: false, comment: '' },
                { name: 'Hamstring curls: 3 sets of 12 reps (light weight)', completed: false, comment: '' },
                { name: 'Calf raises: 3 sets of 15 reps', completed: false, comment: '' }
            ],
            measurementNote: 'Measurements due after session 15'
        }
    ];

    getProgressPercentage(): number {
        return Math.round((this.progressData.completed / this.progressData.total) * 100);
    }

    onNoShow(): void {
        this.displayNoShowDialog = true;
    }

    submitNoShow(): void {
        console.log('No show reason:', this.noShowReason);
        this.displayNoShowDialog = false;
        this.noShowReason = '';
    }

    cancelNoShow(): void {
        this.displayNoShowDialog = false;
        this.noShowReason = '';
    }

    onStartSession(): void {
        if (!this.isSessionStarted) {
            this.isSessionStarted = true;
            this.activePanels = this.phases.map(p => p.id);
            this.isTimerFinished = false;
            this.endTime = Date.now() + this.sessionDurationSeconds * 1000;

            this.updateTimer(); // Process immediately
            this.timerInterval = setInterval(() => {
                this.updateTimer();
            }, 1000);

            setTimeout(() => {
                if (this.timerContainer) {
                    this.timerContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }

    onEndSession(): void {
        // Enforce the guard programmatically too
        if (this.isSessionStarted && this.isTimerFinished) {
            this.isSessionStarted = false;

            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }

            this.sessionTimer = '00:00:00';

            this.phases.forEach(phase => {
                if (phase.exercises) {
                    phase.exercises.forEach((ex: any) => {
                        ex.completed = false;
                        ex.comment = '';
                    });
                }
            });
        }
    }

    private updateTimer(): void {
        const diff = Math.floor((this.endTime - Date.now()) / 1000);

        if (diff <= 0) {
            this.isTimerFinished = true;
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            this.sessionTimer = '00:00:00';
            return;
        }

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        this.sessionTimer =
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');
    }

    ngOnDestroy(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    canCheckExercise(phaseIndex: number, exerciseIndex: number): boolean {
        // Only the first exercise is enabled unconditionally
        // For others, the previous exercise must be completed.
        if (exerciseIndex === 0) return true;
        return this.phases[phaseIndex].exercises[exerciseIndex - 1].completed;
    }

    onExerciseCheckChange(phaseIndex: number, exerciseIndex: number, checked: boolean): void {
        // If unchecking, uncheck all subsequent exercises to maintain strict chronology
        if (!checked) {
            for (let i = exerciseIndex; i < this.phases[phaseIndex].exercises.length; i++) {
                this.phases[phaseIndex].exercises[i].completed = false;
            }
        }
    }
}
