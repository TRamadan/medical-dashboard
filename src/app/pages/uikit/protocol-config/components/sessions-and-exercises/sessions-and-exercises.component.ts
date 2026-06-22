import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef, input, effect } from '@angular/core';
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
    public protocolService = inject(ProtocolService);
    private measurementTemplatesService = inject(MeasurementTemplatesService);
    private cdr = inject(ChangeDetectorRef)
    readonly protocol = this.protocolService.activeProtocol;
    readonly readonly = input(false);
    availableTemplates: any[] = [];

    get phases(): Phase[] {
        return this.protocol()?.phases ?? [];
    }

    ngOnInit(): void {
        this.measurementTemplatesService.getAllTemplates().subscribe({
            next: (data) => { this.availableTemplates = data; },
            error: (err) => console.error('Failed to load measurement templates', err)
        });

        // Initialize session data for all phases
        this.phases.forEach(phase => this.updateTotalSessions(phase));
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
        this.protocolService.activeProtocol.update(proto => {
            if (!proto) return proto;
            const targetPhase = proto.phases.find(p => p.id === phase.id);
            if (!targetPhase) return proto;

            const totalWeeks = Math.max(0, Number(targetPhase.totalWeeks) || 0);
            const perWeek = Math.max(0, Number(targetPhase.sessionsPerWeek) || 0);

            // ── Trim or grow weeks ───────────────────────────────────────────────
            while (targetPhase.weeks.length > totalWeeks) targetPhase.weeks.pop();
            for (let wi = targetPhase.weeks.length; wi < totalWeeks; wi++) {
                targetPhase.weeks.push({
                    id: crypto.randomUUID(),
                    weekNumber: wi + 1,
                    sessions: []
                });
            }

            // ── Sync sessions inside every week ─────────────────────────────────
            for (let wi = 0; wi < totalWeeks; wi++) {
                const week = targetPhase.weeks[wi];
                while (week.sessions.length > perWeek) week.sessions.pop();
                for (let si = week.sessions.length; si < perWeek; si++) {
                    const globalNum = wi * perWeek + si + 1;
                    const isMeasurement = (targetPhase.measurementSessionNums || []).includes(globalNum);
                    week.sessions.push({
                        id: crypto.randomUUID(),
                        sessionNumber: globalNum,
                        sections: isMeasurement ? [] : [{ sectionName: 'Warm Up', time: '10 min', exercises: [] }]
                    });
                }
                // Re-number sessions
                for (let si = 0; si < perWeek; si++) {
                    const globalNum = wi * perWeek + si + 1;
                    week.sessions[si].sessionNumber = globalNum;
                }
            }

            // ── Clean up measurementSessionNums ─────────────────────────────────
            const totalSessions = getPhaseSessionCount(targetPhase);
            if (totalSessions > 0) {
                targetPhase.measurementSessionNums = (targetPhase.measurementSessionNums || []).filter(
                    n => n >= 1 && n <= totalSessions
                );
            }

            // ── Reset per-week tab selection ───────────────────────────────────
            for (const week of targetPhase.weeks) {
                const key = this.weekTabKey(targetPhase, week);
                const current = this.selectedSessionTabs.get(key) ?? 0;
                const weekNums = week.sessions.map(s => s.sessionNumber);
                if (current === 0 || !weekNums.includes(current)) {
                    const first = week.sessions[0]?.sessionNumber;
                    if (first != null) this.selectedSessionTabs.set(key, first);
                }
            }

            return { ...proto };
        });
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
        for (const week of phase.weeks) {
            const session = week.sessions.find(s => s.sessionNumber === sessionNum);
            if (session) return session.sections;
        }
        return [];
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
        this.protocolService.activeProtocol.update(proto => {
            if (!proto) return proto;
            const targetPhase = proto.phases.find(p => p.id === phase.id);
            if (!targetPhase) return proto;

            this.protocolService.ensureSessionData(targetPhase, sessionNum);

            const session = targetPhase.weeks
                .flatMap(w => w.sessions)
                .find(s => s.sessionNumber === sessionNum);

            if (session) {
                if (session.measurementTemplateId === template?.id) {
                    // Toggle Off
                    session.measurementTemplateId = null;
                } else {
                    // Switch template
                    session.measurementTemplateId = template?.id ?? null;
                    // Ensure it's in measurementSessionNums
                    if (!targetPhase.measurementSessionNums.includes(sessionNum)) {
                        targetPhase.measurementSessionNums = [...targetPhase.measurementSessionNums, sessionNum];
                    }
                    // Clear sections since it's a measurement session
                    session.sections = [];
                }
            }

            return { ...proto };
        });
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
        const session = phase.weeks
            .flatMap(w => w.sessions)
            .find(s => s.sessionNumber === sessionNum);
        return session?.measurementTemplateId === template.id;
    }


    getSetIndices(ex: Exercise): number[] {
        if (ex.type !== 'exercise') return [];
        return this.protocolService.getRange((ex as ExerciseType).sets.length).map(v => v - 1);
    }

    syncSetData(ex: Exercise): void {
        if (ex.type !== 'exercise') return;

        const exerciseEx = ex as ExerciseType;
        const sets = exerciseEx.sets;

        // Ensure we have objects for all sets
        for (let i = 0; i < sets.length; i++) {
            if (!sets[i]) {
                const prev = sets[i - 1];
                sets[i] = {
                    repetitions: prev?.repetitions ?? 0,
                    intensity: prev?.intensity ?? '',
                    tempo: prev?.tempo ?? '',
                    rest: prev?.rest ?? ''
                };
            }
        }

        // Enforce limits
        if (sets.length > 20) sets.length = 20;
        if (sets.length < 1) sets.length = 1;
    }
}
