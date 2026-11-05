import { Component, ChangeDetectionStrategy, inject, input, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { AssignEmployeeBranchService } from '../../../add-employees-to-branch/services/assign-employee-branch.service';

@Component({
    selector: 'app-view-and-review',
    imports: [CommonModule, FormsModule, CardModule, TagModule, ButtonModule, AccordionModule, TooltipModule, InputTextarea, ToastModule, DropdownModule, FloatLabelModule, ToggleSwitchModule, InputTextModule, DialogModule],
    templateUrl: './view-and-review.component.html',
    styleUrl: './view-and-review.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewAndReviewComponent {
    private readonly route = inject(ActivatedRoute);
    private protocolService = inject(ProtocolService);
    readonly readonly = input(false);
    readonly assignMode = input(false);
    private messageService = inject(MessageService);
    private pdfExportService = inject(PdfExportService);
    private assignEmployeeBranchService = inject(AssignEmployeeBranchService);
    readonly protocol = this.protocolService.activeProtocol;
    readonly isAssigning = this.protocolService.isAssigningToPatient;
    readonly stepperMode = this.protocolService.stepperMode;
    readonly savingDraft = this.protocolService.savingDraft;

    readonly getPhaseSessionCount = getPhaseSessionCount;

    constructor() {
        effect(() => {
            const proto = this.protocol();
            const routePatientId = this.route.snapshot.queryParamMap.get('patientId');
            if (proto) {
                if (proto.doctorId) {
                    this.selectedDoctorId = proto.doctorId;
                }
                const effectivePatientId = proto.patientId ? String(proto.patientId) : routePatientId;
                if (effectivePatientId) {
                    this.selectedPatientId = effectivePatientId;
                    proto.patientId = effectivePatientId;
                }
            } else if (routePatientId) {
                this.selectedPatientId = routePatientId;
            }
        });

        // In assign mode: pre-select 'athlete' and load athletes list
        effect(() => {
            if (this.assignMode()) {
                if (this.selectedAction !== 'athlete') {
                    this.selectedAction = 'athlete';
                }
                // this.fetchAthletes();
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
                p.weeks.forEach(w => {
                    w.sessions.forEach(s => {
                        const isMeasurement = p.measurementSessionNums.includes(s.sessionNumber);

                        if (isMeasurement) {
                            if (!s.measurementTemplateId) {
                                missing.push(`${label} › Session ${s.sessionNumber}: Measurement Template missing`);
                            }
                        } else {
                            let sessionHasExercises = false;
                            s.sections.forEach(sec => {
                                if (sec.exercises.length > 0) sessionHasExercises = true;
                                if (!sec.time?.trim()) missing.push(`${label} › Session ${s.sessionNumber} › ${sec.sectionName || 'Section'}: Duration`);
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
                            if (!sessionHasExercises) {
                                missing.push(`${label} › Session ${s.sessionNumber}: No exercises added`);
                            }
                        }
                    });
                });
            });
        }

        return {
            isComplete: missing.length === 0,
            missingSections: missing
        };
    });

    // Selection properties
    readonly athletes = signal<any[]>([]);
    readonly locations = signal<any[]>([]);
    readonly coachManagers = signal<any[]>([]);
    readonly isEditMode = computed(() => this.protocolService.stepperMode() === 'edit');
    readonly notifyPatient = signal(false);
    readonly saveAsNewTemplate = signal(false);
    readonly newTemplateName = signal('');
    readonly showAssignCoachModal = signal(false);
    readonly createdPlanId = signal<number | null>(null);
    readonly assigningCoachManager = signal(false);

    selectedPatientId: string | null = null;
    selectedLocationId: number | null = null;
    selectedDoctorId: string | null = null;

    toggleAction(action: string): void {
        if (this.assignMode()) {
            return; // In assign mode, the action is locked to 'athlete' and cannot be unchecked or changed
        }
        this.selectedAction = this.selectedAction === action ? null : action;

        const proto = this.protocol();
        const routePatientId = this.route.snapshot.queryParamMap.get('patientId');
        // Reset selections to the original values from proto or route parameter when action changes, or null.
        this.selectedPatientId = proto?.patientId ? String(proto.patientId) : (routePatientId || null);
        this.selectedLocationId = null;
        this.selectedDoctorId = proto?.doctorId || null;

        if (this.selectedAction === 'template') {
            this.saveAsNewTemplate.set(true);
            if (!this.newTemplateName() && proto?.name) {
                this.newTemplateName.set(proto.name);
            }
        } else if (this.selectedAction === 'share') {
            this.fetchLocations();
        }
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

    onToggleSaveAsTemplate(checked: boolean): void {
        this.saveAsNewTemplate.set(checked);
        if (checked && !this.newTemplateName()) {
            this.newTemplateName.set(this.protocol()?.name || '');
        }
    }

    isAssignCoachDisabled(): boolean {
        return !this.selectedDoctorId || this.assigningCoachManager();
    }

    assignCoachManager(): void {
        const planId = this.createdPlanId();
        const coachManagerId = this.selectedDoctorId ? Number(this.selectedDoctorId) : null;
        if (!planId || !coachManagerId) return;

        this.assigningCoachManager.set(true);
        this.protocolService.assignCoachManager(planId, coachManagerId).subscribe({
            next: (updatedPlan) => {
                const assignedName =
                    updatedPlan.coachManagerNameEn ||
                    updatedPlan.coachManagerNameAr ||
                    'Coach manager';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Coach Manager Assigned',
                    detail: `${assignedName} will run this plan.`,
                });
                this.assigningCoachManager.set(false);
                this.showAssignCoachModal.set(false);
                this.protocolService.finaliseProtocol();
            },
            error: (err: any) => {
                this.assigningCoachManager.set(false);
                const msg =
                    err?.error?.error?.errors?.[0]?.errorEn ||
                    'Failed to assign coach manager.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Assignment Failed',
                    detail: msg,
                });
            },
        });
    }

    skipAssignCoachManager(): void {
        this.showAssignCoachModal.set(false);
        this.protocolService.finaliseProtocol();
    }

    saveEditedProtocol(): void {
        const proto = this.protocol();
        if (!proto) return;

        const routePatientId = this.route.snapshot.queryParamMap.get('patientId');
        const routeMedicalReportId = this.route.snapshot.queryParamMap.get('medicalReportId');
        const routeConsultationDecisionId = this.route.snapshot.queryParamMap.get('consultationDecisionId');

        const rawPatientId = this.selectedPatientId || (proto.patientId ? String(proto.patientId) : null) || routePatientId || null;
        const patientId = rawPatientId != null && rawPatientId !== '' ? Number(rawPatientId) : null;
        const doctorId = this.selectedDoctorId || proto.doctorId || null;
        const medicalReportId = routeMedicalReportId ? Number(routeMedicalReportId) : null;
        const consultationDecisionId = routeConsultationDecisionId ? Number(routeConsultationDecisionId) : null;

        if (patientId && !proto.patientId) {
            proto.patientId = patientId;
        }

        const completeness = this.protocolCompleteness();
        let saveAsDraftFlag = false;
        let saveAsNewTemplateFlag = false;
        let templateName: string | undefined = undefined;

        if (!completeness.isComplete) {
            saveAsDraftFlag = true;
            saveAsNewTemplateFlag = false; // Cannot save incomplete protocol as a new template
        } else if (this.isActionSelected('template') || this.saveAsNewTemplate()) {
            saveAsDraftFlag = false;
            saveAsNewTemplateFlag = true;
            templateName = this.newTemplateName().trim() || proto?.name || 'Protocol Template';
        } else {
            // Default for updates, or if complete and not explicitly saving as new template.
            saveAsDraftFlag = false;
        }

        this.protocolService.savingDraft.set(true);
        this.protocolService.updateTreatmentPlan(proto.id, saveAsDraftFlag, patientId, doctorId, medicalReportId, consultationDecisionId, this.notifyPatient(), saveAsNewTemplateFlag, templateName).subscribe({
            next: () => {
                this.protocolService.savingDraft.set(false);
                const statusDetail = saveAsDraftFlag === false
                    ? 'The protocol has been updated and published successfully.'
                    : 'The protocol has been saved successfully.';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Protocol Updated',
                    detail: statusDetail,
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

        const routePatientId = this.route.snapshot.queryParamMap.get('patientId');
        const routeMedicalReportId = this.route.snapshot.queryParamMap.get('medicalReportId');
        const routeConsultationDecisionId = this.route.snapshot.queryParamMap.get('consultationDecisionId');

        const rawPatientId = this.selectedPatientId || (this.protocol()?.patientId ? String(this.protocol()?.patientId) : null) || routePatientId || null;
        const patientId = rawPatientId != null && rawPatientId !== '' ? Number(rawPatientId) : null;
        const doctorId = this.isActionSelected('share') ? this.selectedDoctorId : null;
        const medicalReportId = routeMedicalReportId ? Number(routeMedicalReportId) : null;
        const consultationDecisionId = routeConsultationDecisionId ? Number(routeConsultationDecisionId) : null;

        this.protocolService.createTreatmentPlan(false, patientId, doctorId, medicalReportId, consultationDecisionId).subscribe({
            next: (res: any) => {
                this.protocolService.savingDraft.set(false);
                const createdPlan = res?.data;
                const planId = createdPlan?.id;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Protocol Activated',
                    detail: 'Protocol has been published and activated successfully.',
                });
                if (planId && patientId) {
                    this.createdPlanId.set(planId);
                    this.selectedLocationId = null;
                    this.selectedDoctorId = null;
                    this.fetchLocations();
                    this.showAssignCoachModal.set(true);
                } else {
                    this.protocolService.finaliseProtocol();
                }
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

    /** Called when user clicks 'Assign to Patient' in assign mode. */
    assignToPatient(): void {
        if (!this.selectedPatientId) {
            this.messageService.add({ severity: 'warn', summary: 'Patient Required', detail: 'Please select a patient before assigning.' });
            return;
        }

        const routeMedicalReportId = this.route.snapshot.queryParamMap.get('medicalReportId');
        const routeConsultationDecisionId = this.route.snapshot.queryParamMap.get('consultationDecisionId');
        const patientId = Number(this.selectedPatientId);
        const medicalReportId = routeMedicalReportId ? Number(routeMedicalReportId) : null;
        const consultationDecisionId = routeConsultationDecisionId ? Number(routeConsultationDecisionId) : null;

        this.protocolService.savingDraft.set(true);
        this.protocolService.createTreatmentPlan(
            false,              // saveAsDraft: false — publish
            patientId,
            null,               // doctorId — taken from token by the API
            medicalReportId,
            consultationDecisionId,
            false,              // notifyPatient
            false,              // saveAsNewTemplate
            undefined
        ).subscribe({
            next: (res: any) => {
                this.protocolService.savingDraft.set(false);
                const planId = res?.data?.id;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Protocol Assigned',
                    detail: 'Protocol published and assigned to patient successfully.',
                });
                if (planId && patientId) {
                    this.createdPlanId.set(planId);
                    this.selectedLocationId = null;
                    this.selectedDoctorId = null;
                    this.fetchLocations();
                    this.showAssignCoachModal.set(true);
                } else {
                    this.protocolService.finaliseProtocol();
                }
            },
            error: (err: any) => {
                this.protocolService.savingDraft.set(false);
                let message = 'Failed to assign protocol. Please try again.';
                if (err.error?.error?.errors && Array.isArray(err.error.error.errors)) {
                    message = err.error.error.errors.map((e: any) => e.errorEn).filter((m: string) => !!m).join(' ');
                }
                this.messageService.add({ severity: 'error', summary: 'Assignment Failed', detail: message });
            }
        });
    }

    saveAsDraft(): void {
        this.protocolService.saveDraftError.set(null);
        this.protocolService.savingDraft.set(true);

        const isTemplate = this.isActionSelected('template');
        const completeness = this.protocolCompleteness();
        const proto = this.protocol();

        // 1- If protocol is missing anything, save as draft (saveAsDraft: true)
        // 2- If complete and user chooses save as template: saveAsDraft: true, saveAsNewTemplate: true, newTemplateName: string
        // 3- If complete and user does not choose template: saveAsDraft: false (published for patient)
        let saveAsDraftFlag = false;
        let saveAsNewTemplateFlag = false;
        let templateName: string | undefined = undefined;

        if (!completeness.isComplete) {
            // Requirement 1: If protocol is incomplete, save as draft.
            saveAsDraftFlag = true;
            saveAsNewTemplateFlag = false; // Cannot save incomplete protocol as a new template
        } else {
            // Protocol is complete. This method is only called when isActionSelected('template') is true.
            if (this.saveAsNewTemplate()) {
                // Requirement 2: Complete, user chose to save as new template
                saveAsDraftFlag = false;
                saveAsNewTemplateFlag = true;
                templateName = this.newTemplateName().trim() || proto?.name || 'Protocol Template';
            } else {
                // Complete, user selected 'Save as Template' but didn't toggle 'Save as a new Template'
                // Requirement 3: Complete and not saved as template -> publish for patient
                saveAsDraftFlag = false;
                saveAsNewTemplateFlag = false;
            }
        }

        const routePatientId = this.route.snapshot.queryParamMap.get('patientId');
        const routeMedicalReportId = this.route.snapshot.queryParamMap.get('medicalReportId');
        const routeConsultationDecisionId = this.route.snapshot.queryParamMap.get('consultationDecisionId');

        const rawPatientId = this.selectedPatientId || (proto?.patientId ? String(proto.patientId) : null) || routePatientId || null;
        const patientId = rawPatientId != null && rawPatientId !== '' ? Number(rawPatientId) : null;
        const doctorId = this.isActionSelected('share') ? this.selectedDoctorId : null;
        const medicalReportId = routeMedicalReportId ? Number(routeMedicalReportId) : null;
        const consultationDecisionId = routeConsultationDecisionId ? Number(routeConsultationDecisionId) : null;

        this.protocolService.createTreatmentPlan(
            saveAsDraftFlag,
            patientId,
            doctorId,
            medicalReportId,
            consultationDecisionId,
            false,
            saveAsNewTemplateFlag,
            templateName
        ).subscribe({
            next: (res: any) => {
                this.protocolService.savingDraft.set(false);
                const createdPlan = res?.data;
                const planId = createdPlan?.id;

                if (saveAsDraftFlag) {
                    const statusMessage = saveAsNewTemplateFlag
                        ? 'Protocol saved to template library successfully.'
                        : 'Protocol saved as draft.';
                    this.messageService.add({
                        severity: 'success',
                        summary: saveAsNewTemplateFlag ? 'Template Saved' : 'Draft Saved',
                        detail: statusMessage,
                    });
                    this.protocolService.saveProtocolAsDraft();
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Protocol Published',
                        detail: 'Protocol published and assigned to patient successfully.',
                    });
                    // Ready for next step: assign coach manager via specific endpoint
                    if (planId && patientId) {
                        this.createdPlanId.set(planId);
                        this.selectedLocationId = null;
                        this.selectedDoctorId = null;
                        this.fetchLocations();
                        this.showAssignCoachModal.set(true);
                    } else {
                        this.protocolService.finaliseProtocol();
                    }
                }
            },
            error: (err: any) => {
                this.protocolService.savingDraft.set(false);

                let message = 'Failed to save draft. Please try again.';

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
