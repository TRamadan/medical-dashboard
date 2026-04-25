import { Component, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-overview',
    imports: [CommonModule, AccordionModule, CheckboxModule, InputTextModule, FormsModule, ButtonModule, DialogModule, TextareaModule, CardModule],
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.scss',
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

    coaches: any = { name: 'You ( Ahmed Samir )', specialty: 'Physical Therapy', isPrimary: true };

    @Input() progressData: any = { completed: 6, total: 36 };

    @Input() workflowData: any = {
        title: 'Plan Activation Workflow',
        dateTime: '2025-11-16 at 10:00 AM',
        session: 'Session #7 - Phase 2: Range of Motion',
        location: 'Cairo - Nasr City Branch'
    };

    // ── Session Type ─────────────────────────────────────────────
    sessionType: 'Swarm' | 'Solo' = 'Swarm';

    // ── Session Meta Bar ─────────────────────────────────────────
    sessionMeta = {
        sessionNumber: 7,
        totalSessions: 36,
        stationDuration: '5 min',
        lastSRPE: 6,
        lastWellness: 5.2,
        sessionGoal: 'Full ROM + Weight Bearing'
    };

    // ── Timer ────────────────────────────────────────────────────
    isSessionStarted = false;
    isPaused = false;
    isTimerFinished = false;
    sessionTimer = '05:00';
    sessionDurationSeconds = 5 * 60;
    private remainingTimeSeconds = 0;
    private elapsedSeconds = 0;
    private timerInterval: any;

    get timerSubtitle(): string {
        if (this.sessionType === 'Swarm') {
            const m = Math.floor(this.sessionDurationSeconds / 60);
            return `Remaining of ${String(m).padStart(2, '0')}:00`;
        }
        return 'Session in progress — elapsed time';
    }

    get timerProgressPercent(): number {
        if (this.sessionType === 'Swarm') {
            return Math.round(((this.sessionDurationSeconds - this.remainingTimeSeconds) / this.sessionDurationSeconds) * 100);
        }
        return Math.min(100, Math.round((this.elapsedSeconds / (60 * 60)) * 100));
    }

    // ── Protocol Context Panel ───────────────────────────────────
    isProtocolCtxOpen = false;
    notifyDoctorSent = false;
    protocolCtx = {
        phaseName: 'Phase 3 — Functional Strength Building',
        phaseNumber: 3,
        phaseTotal: 5,
        phaseProgress: 50,
        isApproachingTransition: true,
        criteria: [
            { label: 'ROM Flexion ≥ 120°', value: '124°', status: 'met' },
            { label: 'VAS ≤ 3 / 10', value: '2.5', status: 'met' },
            { label: 'Quad LSI ≥ 40%', value: '35%', percentOfTarget: 87, status: 'approaching' },
            { label: 'Avg sRPE ≤ 5', value: '6.2', percentOfTarget: 62, status: 'not-met' }
        ],
        doctorNotes: 'Athlete shows improvement in movement pattern but LSI is still below target. Do not increase exercise load until exceeding 40%. If pain noticed at Full Extension — stop and record immediately.',
        lastMeasurement: '18 March 2026',
        nextMeasurement: '25 March 2026'
    };

    // ── Station Handoff Chain (Swarm) ─────────────────────────────
    stationChain: any[] = [
        { name: '—', engineer: 'Before You', status: 'done' },
        { name: 'Recharger', engineer: 'Eng. Karim (You)', status: 'current' },
        { name: 'Resilience', engineer: 'Eng. Sarah', status: 'next' },
        { name: 'Apex', engineer: 'Eng. Amr', status: 'pending' }
    ];

    // ── Misc State ───────────────────────────────────────────────
    activePanels: number[] = [];
    displayNoShowDialog = false;
    noShowReason = '';
    generalComment = '';
    saveDraftSent = false;

    @ViewChild('timerContainer') timerContainer!: ElementRef;

    // ── Phases & Exercises (Sections Model) ──────────────────────
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
            measurementNote: 'Measurements due after session 15',
            sections: [
                {
                    label: 'Warm-up — 10 min',
                    exercises: [
                        { name: 'Stationary bike: 10-15 min (low resistance)', params: '1 × 10 min · Low resistance', completed: false, noteVisible: false, note: '' },
                        { name: 'Ankle Pumps', params: '2 × 20 reps · Both directions', completed: false, noteVisible: false, note: '' }
                    ]
                },
                {
                    label: 'Main — 40 min',
                    exercises: [
                        { name: 'Heel slides', params: '3 × 15 reps · Track ROM angle', completed: false, noteVisible: false, note: '' },
                        { name: 'Wall slides', params: '3 × 10 reps', completed: false, noteVisible: false, note: '' },
                        { name: 'Mini squats (0-45°)', params: '3 × 10 reps · 0-45° range', completed: false, noteVisible: false, note: '' },
                        { name: 'Step-ups (4-inch height)', params: '3 × 10 reps', completed: false, noteVisible: false, note: '' },
                        { name: 'Hamstring curls', params: '3 × 12 reps · Light weight', completed: false, noteVisible: false, note: '' }
                    ]
                },
                {
                    label: 'Cool-down — 10 min',
                    exercises: [
                        { name: 'Calf raises', params: '3 × 15 reps', completed: false, noteVisible: false, note: '' }
                    ]
                }
            ]
        }
    ];

    // ── Helpers ──────────────────────────────────────────────────
    getProgressPercentage(): number {
        return Math.round((this.progressData.completed / this.progressData.total) * 100);
    }

    get metCriteriaCount(): number {
        return this.protocolCtx.criteria.filter((c: any) => c.status === 'met').length;
    }

    get totalCriteriaCount(): number {
        return this.protocolCtx.criteria.length;
    }

    getAllExercises(phase: any): any[] {
        if (phase.sections) return phase.sections.flatMap((s: any) => s.exercises);
        return phase.exercises || [];
    }

    getGlobalIndex(phase: any, sectionIdx: number, exIdx: number): number {
        if (!phase.sections) return exIdx;
        let offset = 0;
        for (let i = 0; i < sectionIdx; i++) offset += phase.sections[i].exercises.length;
        return offset + exIdx;
    }

    canCheckExercise(phase: any, globalIndex: number): boolean {
        if (globalIndex === 0) return true;
        return this.getAllExercises(phase)[globalIndex - 1]?.completed ?? false;
    }

    onExerciseCheckChange(phase: any, globalIndex: number, checked: boolean): void {
        if (!checked) {
            const all = this.getAllExercises(phase);
            for (let i = globalIndex; i < all.length; i++) all[i].completed = false;
        }
    }

    toggleExerciseNote(exercise: any): void {
        exercise.noteVisible = !exercise.noteVisible;
    }

    // ── No Show ──────────────────────────────────────────────────
    onNoShow(): void { this.displayNoShowDialog = true; }
    submitNoShow(): void { console.log('No show:', this.noShowReason); this.displayNoShowDialog = false; this.noShowReason = ''; }
    cancelNoShow(): void { this.displayNoShowDialog = false; this.noShowReason = ''; }

    // ── Protocol Context ─────────────────────────────────────────
    toggleProtocolCtx(): void { this.isProtocolCtxOpen = !this.isProtocolCtxOpen; }
    notifyDoctor(): void { this.notifyDoctorSent = true; }

    // ── Session Controls ─────────────────────────────────────────
    onStartSession(): void {
        if (this.isSessionStarted) return;
        this.isSessionStarted = true;
        this.isPaused = false;
        this.isTimerFinished = false;
        this.activePanels = this.phases.map(p => p.id);
        if (this.sessionType === 'Swarm') {
            this.remainingTimeSeconds = this.sessionDurationSeconds;
        } else {
            this.elapsedSeconds = 0;
        }
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => this.tick(), 1000);
        setTimeout(() => this.timerContainer?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }

    pauseTimer(): void {
        if (!this.isSessionStarted || this.isTimerFinished) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            clearInterval(this.timerInterval);
        } else {
            this.timerInterval = setInterval(() => this.tick(), 1000);
        }
    }

    private tick(): void {
        if (this.sessionType === 'Swarm') {
            this.remainingTimeSeconds--;
            if (this.remainingTimeSeconds <= 0) {
                this.remainingTimeSeconds = 0;
                this.isTimerFinished = true;
                clearInterval(this.timerInterval);
            }
        } else {
            this.elapsedSeconds++;
        }
        this.updateTimerDisplay();
    }

    private updateTimerDisplay(): void {
        const val = this.sessionType === 'Swarm' ? this.remainingTimeSeconds : this.elapsedSeconds;
        const m = Math.floor(val / 60);
        const s = val % 60;
        this.sessionTimer = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    onEndSession(): void {
        if (!this.isSessionStarted) return;
        if (this.sessionType === 'Swarm' && !this.isTimerFinished) return;
        this.isSessionStarted = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.sessionTimer = this.sessionType === 'Swarm' ? `${String(this.sessionDurationSeconds / 60).padStart(2, '0')}:00` : '00:00';
        this.phases.forEach(p => this.getAllExercises(p).forEach((ex: any) => { ex.completed = false; ex.note = ''; ex.noteVisible = false; }));
        this.generalComment = '';
    }

    saveDraft(): void {
        this.saveDraftSent = true;
        console.log('Draft saved');
        setTimeout(() => this.saveDraftSent = false, 2000);
    }

    handoffToNextStation(): void {
        console.log('Handoff to next station');
    }

    ngOnDestroy(): void {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
}
