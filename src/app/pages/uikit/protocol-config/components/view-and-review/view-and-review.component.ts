import { Component, ChangeDetectionStrategy, inject, input, signal, computed, effect } from '@angular/core';
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
import { Phase, Section, Exercise, getPhaseSessionCount, getProtocolWeeks, getProtocolSessions, ExerciseType } from '../../models/protocol.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AssignEmployeeBranchService } from '../../../add-employees-to-branch/services/assign-employee-branch.service';

@Component({
    selector: 'app-view-and-review',
    imports: [CommonModule, FormsModule, CardModule, TagModule, ButtonModule, AccordionModule, TooltipModule, InputTextarea, ToastModule, DropdownModule, FloatLabelModule],
    templateUrl: './view-and-review.component.html',
    styleUrl: './view-and-review.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewAndReviewComponent {
    private protocolService = inject(ProtocolService);
    readonly readonly = input(false);
    private messageService = inject(MessageService);
    private pdfExportService = inject(PdfExportService);
    private assignEmployeeBranchService = inject(AssignEmployeeBranchService);
    readonly protocol = this.protocolService.activeProtocol;
    readonly savingDraft = this.protocolService.savingDraft;
    readonly saveDraftError = this.protocolService.saveDraftError;

    readonly getPhaseSessionCount = getPhaseSessionCount;

    constructor() {
        effect(() => {
            const proto = this.protocol();
            if (proto) {
                if (proto.doctorId) {
                    this.selectedDoctorId = proto.doctorId;
                }
                if (proto.patientId) {
                    this.selectedPatientId = proto.patientId;
                }
            }
        });
    }

    activationNotes = '';
    selectedAction: string | null = null;

    // ── Completeness Logic ──────────────────────────────────────────────────
    readonly protocolCompleteness = computed(() => {
        // Dependencies for reactivity
        this.protocolService.protocolRevision();
        const proto = this.protocol();
        if (!proto) return { isComplete: false, missingSections: ['Protocol data missing'] };

        const missing: string[] = [];
        const phases = proto.phases || [];

        // 1. Basic Metadata
        if (!proto.name?.trim()) missing.push('Protocol Name');

        // 2. Phases and Frequency
        if (phases.length === 0) {
            missing.push('Phases (add at least one phase)');
        } else {
            phases.forEach((p, i) => {
                const label = p.name || `Phase ${i + 1}`;
                if (!p.totalWeeks || p.totalWeeks < 1) missing.push(`${label}: Total Weeks`);
                if (!p.sessionsPerWeek || p.sessionsPerWeek < 1) missing.push(`${label}: Sessions per Week`);
                if (!p.objective?.trim()) missing.push(`${label}: Objective`);
                if (!p.criteria?.transitionCriteria?.length) missing.push(`${label}: Transition Criteria`);

                // 3. Sessions and Exercises
                let hasExercises = false;
                p.weeks.forEach(w => {
                    w.sessions.forEach(s => {
                        if (p.measurementSessionNums.includes(s.sessionNumber)) return;
                        s.sections.forEach(sec => {
                            if (!sec.time?.trim()) missing.push(`${label} › Session ${s.sessionNumber} › ${sec.sectionName || 'Section'}: Duration`);
                            if (sec.exercises.length > 0) hasExercises = true;
                            sec.exercises.forEach(ex => {
                                if (!ex.name?.trim()) missing.push(`${label} › Session ${s.sessionNumber} › Exercise Name`);
                                if (ex.type === 'exercise') {
                                    const exE = ex as ExerciseType;
                                    if (!exE.equipment?.trim()) missing.push(`${label} › ${ex.name}: Equipment`);
                                    if (!exE.contractionType?.trim()) missing.push(`${label} › ${ex.name}: Contraction Type`);
                                    if (exE.sets.some(st => !st.intensity?.trim() || !st.repetitions || !st.tempo?.trim())) {
                                        missing.push(`${label} › ${ex.name}: Set Details (Reps/Intensity/Tempo)`);
                                    }
                                }
                            });
                        });
                    });
                });
                if (!hasExercises && p.totalWeeks > 0) missing.push(`${label}: Exercises`);
            });
        }

        return {
            isComplete: missing.length === 0,
            missingSections: missing
        };
    });

    // Selection properties
    athletes = signal<any[]>([]);
    locations = signal<any[]>([]);
    coachManagers = signal<any[]>([]);

    selectedPatientId: string | null = null;
    selectedLocationId: number | null = null;
    selectedDoctorId: string | null = null;

    toggleAction(action: string): void {
        this.selectedAction = this.selectedAction === action ? null : action;

        const proto = this.protocol();
        // Reset selections to the original values from proto when action changes, or null.
        this.selectedPatientId = proto?.patientId || null;
        this.selectedLocationId = null;
        this.selectedDoctorId = proto?.doctorId || null;

        if (this.selectedAction === 'athlete') {
            this.fetchAthletes();
        } else if (this.selectedAction === 'share') {
            this.fetchLocations();
        }
    }

    fetchAthletes(): void {
        this.protocolService.getAthletes().subscribe({
            next: (data) => this.athletes.set(data),
            error: (err) => console.error('Failed to fetch athletes', err)
        });
    }

    fetchLocations(): void {
        this.assignEmployeeBranchService.getBranches().subscribe({
            next: (data) => {
                this.locations.set(data.map((item: any) => {
                    return {
                        label: item.nameEn + ' - ' + item.nameAr,
                        id: item.id
                    }
                }))
            },
            error: (err) => console.error('Failed to fetch locations', err)
        });
    }

    onLocationChange(locationId: number): void {
        this.selectedDoctorId = null;
        this.coachManagers.set([]);
        if (locationId) {
            this.assignEmployeeBranchService.getBranchEmployees(locationId).subscribe({
                next: (employees: any) => {
                    this.coachManagers.set(employees?.data);
                },
                error: (err) => console.error('Failed to fetch coach managers', err)
            });
        }
    }

    isActionSelected(action: string): boolean {
        return this.selectedAction === action;
    }

    readonly isEditMode = computed(() => this.protocolService.stepperMode() === 'edit');

    saveEditedProtocol(): void {
        const proto = this.protocol();
        if (!proto) return;

        const patientId = this.selectedPatientId || proto.patientId || null;
        const doctorId = this.selectedDoctorId || proto.doctorId || null;

        this.protocolService.savingDraft.set(true);
        this.protocolService.updateTreatmentPlan(proto.id, undefined, patientId, doctorId).subscribe({
            next: () => {
                this.protocolService.savingDraft.set(false);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Protocol Updated',
                    detail: 'The protocol has been saved successfully.',
                });
                this.protocolService.fetchProtocols();
                this.protocolService.cancelProtocol();
            },
            error: (err: any) => {
                this.protocolService.savingDraft.set(false);
                let message = 'Failed to update protocol. Please try again.';
                if (err.error?.error?.errors && Array.isArray(err.error.error.errors)) {
                    message = err.error.error.errors.map((e: any) => e.errorEn).join(' ');
                }
                this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: message });
            }
        });
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
        this.protocolService.saveDraftError.set(null);
        this.protocolService.savingDraft.set(true); // Reusing savingDraft for loading state

        const patientId = this.isActionSelected('athlete') ? this.selectedPatientId : null;
        const doctorId = this.isActionSelected('share') ? this.selectedDoctorId : null;

        this.protocolService.createTreatmentPlan(false, patientId, doctorId).subscribe({
            next: () => {
                this.protocolService.savingDraft.set(false);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Protocol Activated',
                    detail: 'Protocol has been published and activated successfully.',
                });
                this.protocolService.finaliseProtocol();
            },
            error: (err: any) => {
                this.protocolService.savingDraft.set(false);
                let message = 'Failed to activate protocol. Please try again.';
                if (err.error?.error?.errors && Array.isArray(err.error.error.errors)) {
                    message = err.error.error.errors.map((e: any) => e.errorEn).join(' ');
                }
                this.messageService.add({ severity: 'error', summary: 'Activation Failed', detail: message });
            }
        });
    }

    saveAsDraft(): void {
        this.protocolService.saveDraftError.set(null);
        this.protocolService.savingDraft.set(true);

        const isTemplate = this.isActionSelected('template');
        const completeness = this.protocolCompleteness();

        // If it's a template and it's complete, saveAsDraft should be false (Published)
        // If it's athlete or share, it should be false (Published) as requested
        // Otherwise (incomplete template OR no action selected), saveAsDraft is true
        const saveAsDraftFlag = isTemplate
            ? !completeness.isComplete
            : (this.isActionSelected('athlete') || this.isActionSelected('share') ? false : true);

        const patientId = this.isActionSelected('athlete') ? this.selectedPatientId : null;
        const doctorId = this.isActionSelected('share') ? this.selectedDoctorId : null;

        this.protocolService.createTreatmentPlan(saveAsDraftFlag, patientId, doctorId).subscribe({
            next: () => {
                this.protocolService.savingDraft.set(false);
                const statusMessage = saveAsDraftFlag ? 'Protocol saved as draft.' : 'Protocol published successfully.';
                this.messageService.add({
                    severity: 'success',
                    summary: saveAsDraftFlag ? 'Draft Saved' : 'Protocol Published',
                    detail: statusMessage,
                });
                if (saveAsDraftFlag) {
                    this.protocolService.saveProtocolAsDraft();
                } else {
                    this.protocolService.finaliseProtocol();
                }
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
