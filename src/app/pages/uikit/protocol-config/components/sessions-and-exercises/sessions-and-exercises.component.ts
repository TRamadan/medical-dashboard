import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { AccordionModule } from 'primeng/accordion';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProtocolService } from '../../services/protocol.service';
import { MeasurementTemplatesService } from '../../../measurements-config/services/measurement-templates.service';
import { Phase, Week, Exercise, Section, ExerciseType, isMeasurementSession, getPhaseSessionCount } from '../../models/protocol.model';

@Component({
    selector: 'app-sessions-and-exercises',
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, InputTextarea, AccordionModule, DropdownModule, CardModule, TagModule, TooltipModule],
    templateUrl: './sessions-and-exercises.component.html',
    styleUrl: './sessions-and-exercises.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionsAndExercisesComponent implements OnInit {
    private protocolService = inject(ProtocolService);
    private measurementTemplatesService = inject(MeasurementTemplatesService);
    private cdr = inject(ChangeDetectorRef)
    readonly protocol = this.protocolService.activeProtocol;
    availableTemplates: any[] = [];

    get phases(): Phase[] {
        return this.protocol()?.phases ?? [];
    }

    ngOnInit(): void {
        this.measurementTemplatesService.getAllTemplates().subscribe({
            next: (data) => { this.availableTemplates = data; },
            error: (err) => console.error('Failed to load measurement templates', err)
        });
    }

    // ── Session helpers ──────────────────────────────────────────────────────

    /** Per-WEEK selected session number — key: "<phaseId>-w<weekNum>" */
    private selectedSessionTabs = new Map<string, number>();

    private weekTabKey(phase: Phase, week: Week): string {
        return `${phase.id ?? phase.name}-w${week.weekNumber}`;
    }

    selectSessionTab(phase: Phase, week: Week, sessionNum: number): void {
        this.selectedSessionTabs.set(this.weekTabKey(phase, week), sessionNum);
    }

    getSelectedSessionTab(phase: Phase, week: Week): number {
        const key = this.weekTabKey(phase, week);
        if (this.selectedSessionTabs.has(key)) {
            return this.selectedSessionTabs.get(key)!;
        }
        // Default to the first session in THIS week
        return week.sessions[0]?.sessionNumber ?? 0;
    }

    updateTotalSessions(phase: Phase): void {
        const totalWeeks = Math.max(0, Number(phase.totalWeeks) || 0);
        const perWeek = Math.max(0, Number(phase.sessionsPerWeek) || 0);
        // phase.totalSessions removed — computed via getPhaseSessionCount(phase)

        // ── Trim or grow weeks ───────────────────────────────────────────────
        while (phase.weeks.length > totalWeeks) phase.weeks.pop();
        for (let wi = phase.weeks.length; wi < totalWeeks; wi++) {
            phase.weeks.push({
                id: crypto.randomUUID(),
                weekNumber: wi + 1,
                sessions: []
            });
        }

        // ── Sync sessions inside every week ─────────────────────────────────
        for (let wi = 0; wi < totalWeeks; wi++) {
            const week = phase.weeks[wi];

            while (week.sessions.length > perWeek) week.sessions.pop();

            for (let si = week.sessions.length; si < perWeek; si++) {
                const globalNum = wi * perWeek + si + 1;
                week.sessions.push({
                    id: crypto.randomUUID(),
                    sessionNumber: globalNum,
                    sections: [{ sectionName: 'Warm Up', time: '10 min', exercises: [] }]
                });
            }

            // Re-number sessions in case sessionsPerWeek changed
            for (let si = 0; si < perWeek; si++) {
                const globalNum = wi * perWeek + si + 1;
                week.sessions[si].sessionNumber = globalNum;
            }
        }

        // ── Clean up measurementSessionNums that no longer exist ────────────
        const totalSessions = getPhaseSessionCount(phase);
        phase.measurementSessionNums = phase.measurementSessionNums.filter(
            n => n >= 1 && n <= totalSessions
        );

        // ── Reset per-week tab selection if the current tab no longer exists ──
        for (const week of phase.weeks) {
            const key = this.weekTabKey(phase, week);
            const current = this.selectedSessionTabs.get(key) ?? 0;
            const weekNums = week.sessions.map(s => s.sessionNumber);
            if (current === 0 || !weekNums.includes(current)) {
                const first = week.sessions[0]?.sessionNumber;
                if (first != null) this.selectedSessionTabs.set(key, first);
            }
        }
    }


    // ── Session mode ─────────────────────────────────────────────────────────
    getSessionMode(phase: Phase, sessionNum: number): 'exercises' | 'measurements' {
        return phase.measurementSessionNums.includes(sessionNum) ? 'measurements' : 'exercises';
    }

    isSessionPredefined(phase: Phase, sessionNum: number): boolean {
        return isMeasurementSession(phase, sessionNum);
    }

    // ── Sections ─────────────────────────────────────────────────────────────
    getSections(phase: Phase, sessionNum: number): Section[] {
        this.protocolService.ensureSessionData(phase, sessionNum);
        return phase.weeks
            .flatMap(w => w.sessions)
            .find(s => s.sessionNumber === sessionNum)
            ?.sections ?? [];
    }

    addSection(phase: Phase, globalSessionNum: number): void {
        this.getSections(phase, globalSessionNum).push(this.protocolService.createSection());
    }

    removeSection(phase: Phase, globalSessionNum: number, index: number): void {
        this.getSections(phase, globalSessionNum).splice(index, 1);
    }

    // ── Exercises ────────────────────────────────────────────────────────────
    addExercise(section: any): void {
        section.exercises.push(this.protocolService.createExercise());
    }

    removeExercise(section: any, index: number): void {
        section.exercises.splice(index, 1);
    }

    // ── Sets ─────────────────────────────────────────────────────────────────
    getRepArray(ex: Exercise): number[] {
        return this.protocolService.syncSetData(ex);
    }

    // ── Measurement templates ────────────────────────────────────────────────
    setSessionMeasurementTemplate(phase: Phase, sessionNum: number, template: { id: number; name: string } | null): void {
        this.protocolService.ensureSessionData(phase, sessionNum);

        const isCurrentlySelected = phase.measurementSessionNums.includes(sessionNum);

        phase.measurementSessionNums = isCurrentlySelected
            ? phase.measurementSessionNums.filter(n => n !== sessionNum)
            : [...phase.measurementSessionNums, sessionNum];

        this.cdr.markForCheck();
    }

    // ── Validation ───────────────────────────────────────────────────────────
    isSectionValid(section: any): boolean {
        if (!section.exercises?.length) return false;
        return section.exercises.every((ex: any) => {
            const hasSetData = Array.isArray(ex.setData) && ex.setData.some(
                (row: any) => row.reps && row.reps.toString().trim() !== ''
            );
            return ex.name?.trim() && ex.sets && hasSetData;
        });
    }

    isSessionMeasurementSelected(phase: Phase, sessionNum: number, template: { id: number; name: string }): boolean {
        return phase.measurementSessionNums.includes(sessionNum);
    }


    syncSetData(ex: Exercise): number[] {
        if (ex.type !== 'exercise') return [];

        const exerciseEx = ex as ExerciseType;
        const desiredLength = exerciseEx.sets.length;

        // Ensure sets array matches desired length
        while (exerciseEx.sets.length < desiredLength) {
            exerciseEx.sets.push({
                repetitions: 0,
                intensity: '',
                tempo: '',
                rest: ''
            });
        }

        if (exerciseEx.sets.length > desiredLength) {
            exerciseEx.sets.splice(desiredLength);
        }

        // Return array of indices for *ngFor
        return Array.from({ length: exerciseEx.sets.length }, (_, i) => i);
    }
}
