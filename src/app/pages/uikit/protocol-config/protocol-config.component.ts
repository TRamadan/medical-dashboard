import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProtocolService } from './services/protocol.service';
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
export class ProtocolConfigComponent {
    private protocolService = inject(ProtocolService);
    private messageService = inject(MessageService);
    readonly showStepper = this.protocolService.showStepper;
    readonly currentStep = this.protocolService.currentStep;
    readonly stepperMode = this.protocolService.stepperMode;
    readonly activeProtocol = this.protocolService.activeProtocol;
    readonly isReadonly = computed(() => this.protocolService.stepperMode() === 'view');

    readonly steps = [
        { value: 1, icon: 'pi pi-info-circle', label: 'Protocol Info' },
        { value: 2, icon: 'pi pi-sitemap', label: 'Phases & Criteria' },
        { value: 3, icon: 'pi pi-list', label: 'Sessions & Exercises' },
        { value: 4, icon: 'pi pi-sliders-h', label: 'FITT-VP Revision' },
        { value: 5, icon: 'pi pi-eye', label: 'View & Review' }
    ];

    startNewProtocol(): void {
        this.protocolService.startNewProtocol();
    }

    saveEditedProtocol(): void {
        const proto = this.activeProtocol();
        if (!proto) return;

        this.protocolService.updateTreatmentPlan(proto.id).subscribe({
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
}
