import { Component, ChangeDetectionStrategy, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { MenuItem, MessageService } from 'primeng/api';
import { SharedService } from '../../../shared/services/shared.service';
import { ProtocolService } from './services/protocol.service';
import { ProtocolKind } from './models/protocol.model';
import { AllProtocolsComponent } from './components/all-protocols/all-protocols.component';
import { ProtocolInformationComponent } from './components/protocol-information/protocol-information.component';
import { PhasesAndCriteriaComponent } from './components/phases-and-criteria/phases-and-criteria.component';
import { SessionsAndExercisesComponent } from './components/sessions-and-exercises/sessions-and-exercises.component';
import { FittVpRevisionComponent } from './components/fitt-vp-revision/fitt-vp-revision.component';
import { ViewAndReviewComponent } from './components/view-and-review/view-and-review.component';

@Component({
    selector: 'app-protocol-config',
    imports: [
        CommonModule,
        StepperModule,
        ButtonModule,
        CardModule,
        ToastModule,
        MenuModule,
        DialogModule,
        AllProtocolsComponent,
        ProtocolInformationComponent,
        PhasesAndCriteriaComponent,
        SessionsAndExercisesComponent,
        FittVpRevisionComponent,
        ViewAndReviewComponent
    ],
    templateUrl: './protocol-config.component.html',
    styleUrl: './protocol-config.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService]
})
export class ProtocolConfigComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private protocolService = inject(ProtocolService);
    private messageService = inject(MessageService);
    private sharedService = inject(SharedService);

    // ── Excel Upload & Define Options ──────────────────────────────────────────
    readonly showExcelUploadModal = signal(false);
    readonly selectedExcelFile = signal<File | null>(null);
    readonly isDragging = signal(false);
    readonly isUploadingExcel = signal(false);

    readonly defineOptions: MenuItem[] = [
        {
            label: 'Upload Excel File',
            icon: 'pi pi-file-excel text-emerald-600',
            command: () => this.openExcelUploadModal()
        },
        {
            label: 'Add Protocol Manually',
            icon: 'pi pi-pencil text-blue-600',
            command: () => this.startNewProtocol()
        }
    ];
    readonly showStepper = this.protocolService.showStepper;
    readonly currentStep = this.protocolService.currentStep;
    readonly stepperMode = this.protocolService.stepperMode;
    readonly activeProtocol = this.protocolService.activeProtocol;
    readonly isReadonly = computed(() => {
        const mode = this.protocolService.stepperMode();
        return mode === 'view' || mode === 'assignment';
    });
    readonly isAssignMode = computed(() => this.protocolService.stepperMode() === 'assignment');
    readonly activePlanKind = computed<ProtocolKind | null>(() => {
        const proto = this.activeProtocol();
        if (!proto) return null;
        if (proto.kind) return proto.kind;
        if (proto.status === 'Draft') return 'Drafted';
        if (proto.patientId != null && !proto.isTemplate) return 'Published';
        return 'Template';
    });

    readonly steps = [
        { value: 1, icon: 'pi pi-info-circle', label: 'Protocol Info' },
        { value: 2, icon: 'pi pi-sitemap', label: 'Phases & Criteria' },
        { value: 3, icon: 'pi pi-list', label: 'Sessions & Exercises' },
        { value: 4, icon: 'pi pi-sliders-h', label: 'FITT-VP Revision' },
        { value: 5, icon: 'pi pi-eye', label: 'View & Review' }
    ];

    ngOnInit(): void {
        const queryPatientId = this.route.snapshot.queryParamMap.get('patientId');
        const startNew = this.route.snapshot.queryParamMap.get('startNew') === 'true';
        if (startNew && queryPatientId && !this.activeProtocol()) {
            this.startNewProtocol();
            const proto = this.activeProtocol();
            if (proto) {
                proto.patientId = queryPatientId;
            }
        }
    }

    startNewProtocol(): void {
        this.protocolService.startNewProtocol();
    }

    saveEditedProtocol(): void {
        const proto = this.activeProtocol();
        if (!proto) return;

        const routePatientId = this.route.snapshot.queryParamMap.get('patientId');
        const routeMedicalReportId = this.route.snapshot.queryParamMap.get('medicalReportId');
        const routeConsultationDecisionId = this.route.snapshot.queryParamMap.get('consultationDecisionId');

        const isTemplate = this.activePlanKind() === 'Template';
        const rawPatientId = isTemplate ? null : (proto.patientId ?? routePatientId);
        const patientId = rawPatientId != null && rawPatientId !== '' ? Number(rawPatientId) : null;
        const medicalReportId = routeMedicalReportId ? Number(routeMedicalReportId) : null;
        const consultationDecisionId = routeConsultationDecisionId ? Number(routeConsultationDecisionId) : null;

        this.protocolService.updateTreatmentPlan(proto.id, false, patientId, undefined, medicalReportId, consultationDecisionId, proto.notifyPatient ?? false).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Protocol Updated',
                    detail: 'The protocol has been saved successfully.',
                });
                this.protocolService.fetchProtocols(); // Refresh UI list
                this.protocolService.cancelProtocol(); // Close stepper
            },
            error: (err) => {
                console.error('Failed to update protocol:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Update Failed',
                    detail: 'Failed to update protocol. Please try again.',
                });
            }
        });
    }

    switchToEdit(): void {
        this.protocolService.stepperMode.set('edit');
    }

    cancelProtocol(): void {
        this.protocolService.cancelProtocol();
    }

    goToStep(step: number): void {
        this.protocolService.currentStep.set(step);
    }

    nextStep(): void {
        const curr = this.currentStep();
        if (curr < 5) this.protocolService.currentStep.set(curr + 1);
    }

    prevStep(): void {
        const curr = this.currentStep();
        if (curr > 1) this.protocolService.currentStep.set(curr - 1);
    }

    // ── Excel Upload Handlers ────────────────────────────────────────────────
    openExcelUploadModal(): void {
        this.selectedExcelFile.set(null);
        this.isUploadingExcel.set(false);
        this.showExcelUploadModal.set(true);
    }

    closeExcelUploadModal(): void {
        this.selectedExcelFile.set(null);
        this.isUploadingExcel.set(false);
        this.showExcelUploadModal.set(false);
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.handleFile(input.files[0]);
        }
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging.set(true);
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging.set(false);
    }

    onFileDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging.set(false);
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
            this.handleFile(event.dataTransfer.files[0]);
        }
    }

    handleFile(file: File): void {
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (ext !== '.xlsx' && ext !== '.xls') {
            this.messageService.add({
                severity: 'error',
                summary: 'Invalid File',
                detail: 'Please upload an Excel spreadsheet (.xlsx or .xls).'
            });
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            this.messageService.add({
                severity: 'error',
                summary: 'File Too Large',
                detail: 'The selected file exceeds 10MB limit.'
            });
            return;
        }
        this.selectedExcelFile.set(file);
    }

    removeSelectedFile(): void {
        this.selectedExcelFile.set(null);
    }

    formatFileSize(bytes?: number): string {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    async uploadExcelProtocol(): Promise<void> {
        const file = this.selectedExcelFile();
        if (!file || this.isUploadingExcel()) return;

        this.isUploadingExcel.set(true);

        try {
            // Replace with however your component gets the current doctor's id (or pass null/undefined)

            const results = await this.protocolService.importTreatmentPlansFromExcel(file);

            // Workbook could not be read/validated: nothing was sent
            const parseError = this.protocolService.importError();
            if (parseError) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Invalid Excel File',
                    detail: parseError,
                    life: 8000
                });
                return;
            }

            const succeeded = results.filter(r => r.status === 'success');
            const failed = results.find(r => r.status === 'failed');
            const skipped = results.filter(r => r.status === 'skipped');
            const drafts = succeeded.filter(r => r.missing.length > 0);

            if (!failed) {
                // Everything was saved
                this.messageService.add({
                    severity: 'success',
                    summary: 'Import Completed',
                    detail: drafts.length
                        ? `${succeeded.length} plan(s) imported, ${drafts.length} saved as draft because some fields were empty.`
                        : `${succeeded.length} plan(s) imported successfully.`,
                    life: 6000
                });
                this.closeExcelUploadModal();
            } else {
                // Stopped at the first failure
                this.messageService.add({
                    severity: 'error',
                    summary: 'Import Stopped',
                    detail:
                        `${succeeded.length} imported. "${failed.name}" (${failed.planKey}) failed: ${failed.error}. ` +
                        `${skipped.length} remaining plan(s) were not sent.`,
                    sticky: true
                });
                // Keep the modal open so the user can fix the file and retry.
                // Note: plans already imported will be created again if the same file is re-uploaded.
            }
        } catch (err: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Upload Failed',
                detail: err?.message ?? 'Failed to import Excel file. Please try again.'
            });
        } finally {
            this.isUploadingExcel.set(false);
            // the service already refreshes the list when at least one plan succeeded
        }
    }
}
