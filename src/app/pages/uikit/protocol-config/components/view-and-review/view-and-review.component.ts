import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextarea } from 'primeng/inputtextarea';
import { ProtocolService } from '../../services/protocol.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { Phase, Section, Exercise, getPhaseSessionCount, getProtocolWeeks, getProtocolSessions } from '../../models/protocol.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-view-and-review',
    imports: [CommonModule, FormsModule, CardModule, TagModule, ButtonModule, AccordionModule, TooltipModule, InputTextarea, ToastModule],
    templateUrl: './view-and-review.component.html',
    styleUrl: './view-and-review.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService]
})
export class ViewAndReviewComponent {
    private protocolService = inject(ProtocolService);
    readonly readonly = input(false);
    private messageService = inject(MessageService);
    private pdfExportService = inject(PdfExportService);
    readonly protocol = this.protocolService.activeProtocol;
    readonly savingDraft = this.protocolService.savingDraft;
    readonly saveDraftError = this.protocolService.saveDraftError;

    readonly getPhaseSessionCount = getPhaseSessionCount;

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

    get computedTotalWeeks(): number {
        const proto = this.protocol();
        return proto ? getProtocolWeeks(proto) : 0;
    }

    get computedTotalSessions(): number {
        const proto = this.protocol();
        return proto ? getProtocolSessions(proto) : 0;
    }

    get totalExercises(): number {
        const proto = this.protocol();
        if (!proto) return 0;
        let count = 0;
        for (const phase of proto.phases) {
            for (const week of phase.weeks) {
                for (const session of week.sessions) {
                    if (phase.measurementSessionNums.includes(session.sessionNumber)) {
                        continue;
                    }
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
        this.protocolService.saveDraftError.set(null);
        this.protocolService.savingDraft.set(true);
        this.protocolService.createTreatmentPlan(true).subscribe({
            next: () => {
                this.protocolService.savingDraft.set(false);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Draft Saved',
                    detail: 'Protocol saved as draft successfully.',
                });
                this.protocolService.saveProtocolAsDraft();
            },
            error: (err: any) => {
                this.protocolService.savingDraft.set(false);
                
                let message = 'Failed to save draft. Please try again.';
                
                // Parse the specific error structure provided
                if (err.error?.error?.errors && Array.isArray(err.error.error.errors)) {
                    message = err.error.error.errors
                        .map((e: any) => e.errorEn)
                        .filter((msg: string) => !!msg)
                        .join(' ');
                } else if (err.message) {
                    message = err.message;
                }

                this.protocolService.saveDraftError.set(message);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Save Failed',
                    detail: message,
                });
            },
        });
    }

    getSessionNumbers(phase: Phase): number[] {
        return phase.weeks
            .flatMap(week => week.sessions)
            .map(session => session.sessionNumber)
            .sort((a, b) => a - b);
    }

    getSections(phase: Phase, sessionNum: number): Section[] {
        if (phase.measurementSessionNums.includes(sessionNum)) {
            return [];
        }
        return phase.weeks
            .flatMap(week => week.sessions)
            .find(session => session.sessionNumber === sessionNum)
            ?.sections ?? [];
    }

    getSessionMode(phase: Phase, sessionNum: number): string {
        return phase.measurementSessionNums.includes(sessionNum) ? 'Measurements' : 'Exercises';
    }

    getMeasurementTemplate(phase: Phase, sessionNum: number): string {
        const session = phase.weeks
            .flatMap(week => week.sessions)
            .find(session => session.sessionNumber === sessionNum);
        return phase?.measurementSessionNums.includes(sessionNum) ? 'Applied' : 'None';
    }

    getTotalExercises(phase: Phase): number {
        return phase.weeks
            .flatMap(week => week.sessions)
            .filter(session => !phase.measurementSessionNums.includes(session.sessionNumber))
            .flatMap(session => session.sections)
            .reduce((count, section) => count + section.exercises.length, 0);
    }

    getExerciseModeBadge(ex: Exercise): string {
        return ex.type === 'manual' ? 'Manual' : 'Exercise';
    }

    getExerciseModeSeverity(ex: Exercise): 'success' | 'info' {
        return ex.type === 'manual' ? 'info' : 'success';
    }

    exportToPDF(): void {
        const proto = this.protocol();
        if (proto) {
            this.pdfExportService.exportProtocolToPDF(proto);
        }
    }
}
