import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextarea } from 'primeng/inputtextarea';
import { ProtocolService } from '../../services/protocol.service';
import { Phase, Section, Exercise } from '../../models/protocol.model';

@Component({
    selector: 'app-view-and-review',
    imports: [CommonModule, FormsModule, CardModule, TagModule, ButtonModule, AccordionModule, TooltipModule, InputTextarea],
    templateUrl: './view-and-review.component.html',
    styleUrl: './view-and-review.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewAndReviewComponent {
    private protocolService = inject(ProtocolService);
    readonly protocol = this.protocolService.activeProtocol;

    activationNotes = '';
    selectedAction: string | null = null;

    toggleAction(action: string): void {
        this.selectedAction = this.selectedAction === action ? null : action;
    }

    isActionSelected(action: string): boolean {
        return this.selectedAction === action;
    }

    get phases(): Phase[] {
        return this.protocol()?.phases ?? [];
    }

    get totalExercises(): number {
        const proto = this.protocol();
        if (!proto) return 0;
        let count = 0;
        for (const phase of proto.phases) {
            for (const week of phase.weeks) {
                for (const session of week.sessions) {
                    for (const section of session.sections) {
                        count += section.exercises.length;
                    }
                }
            }
        }
        return count;
    }

    activateProtocol(): void {
        this.protocolService.finaliseProtocol();
    }

    saveAsDraft(): void {
        this.protocolService.saveProtocolAsDraft();
    }

    getSessionNumbers(phase: Phase): number[] {
        return phase.weeks
            .flatMap(week => week.sessions)
            .map(session => session.sessionNumber)
            .sort((a, b) => a - b);
    }

    getSections(phase: Phase, sessionNum: number): Section[] {
        return phase.weeks
            .flatMap(week => week.sessions)
            .find(session => session.sessionNumber === sessionNum)
            ?.sections ?? [];
    }

    getSessionMode(phase: Phase, sessionNum: number): string {
        const session = phase.weeks
            .flatMap(week => week.sessions)
            .find(session => session.sessionNumber === sessionNum);
        return session?.applyMeasurements ? 'measurements' : 'exercises';
    }

    getMeasurementTemplate(phase: Phase, sessionNum: number): string {
        const session = phase.weeks
            .flatMap(week => week.sessions)
            .find(session => session.sessionNumber === sessionNum);
        return session?.applyMeasurements ? 'Applied' : 'None';
    }

    getTotalExercises(phase: Phase): number {
        return phase.weeks
            .flatMap(week => week.sessions)
            .flatMap(session => session.sections)
            .reduce((count, section) => count + section.exercises.length, 0);
    }

    getExerciseModeBadge(ex: Exercise): string {
        return ex.type === 'manual' ? 'Manual' : 'Exercise';
    }

    getExerciseModeSeverity(ex: Exercise): 'success' | 'info' {
        return ex.type === 'manual' ? 'info' : 'success';
    }
}
