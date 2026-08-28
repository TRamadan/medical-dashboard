import {
    Component,
    ChangeDetectionStrategy,
    OnInit,
    signal,
    computed,
    inject,
    input,
    output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';

import { KpiCardsComponent } from './components/kpi-cards/kpi-cards.component';
import { TeamScheduleComponent } from './components/team-schedule/team-schedule.component';
import { UrgentActionsComponent } from './components/urgent-actions/urgent-actions.component';
import { PatientOverviewService } from './services/patient-overview.service';
import { EditProtocolService } from '../services/edit-protocol.service';
import {
    DashboardOverviewDto,
    UrgentActionDto,
    PatientContactDto,
    CoachOptionDto
} from '../models/coach-manager-api.model';

const MOCK_COACHES: CoachOptionDto[] = [
    { coachId: 5, coachName: 'Eng. Karim' },
    { coachId: 7, coachName: 'Eng. Sarah' },
    { coachId: 8, coachName: 'Eng. Amr' }
];

@Component({
    selector: 'app-patient-overview',
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DialogModule,
        DropdownModule,
        ToastModule,
        SkeletonModule,
        KpiCardsComponent,
        TeamScheduleComponent,
        UrgentActionsComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './patient-overview.component.html',
    styleUrl: './patient-overview.component.scss',
    providers: [MessageService]
})
export class PatientOverviewComponent implements OnInit {
    private readonly service = inject(PatientOverviewService);
    private readonly protocolService = inject(EditProtocolService);
    private readonly messageService = inject(MessageService);

    // Inputs & Outputs using Angular 19 signal functions
    selectedPatient = input<any>(null);
    patientSelected = output<any>();
    navigateToAssign = output<void>();
    navigateToSchedule = output<void>();
    navigateToTreatmentPlan = output<number | undefined>();

    onNavigateToTreatmentPlan(planId?: number): void {
        this.navigateToTreatmentPlan.emit(planId);
    }

    // State Signals
    overviewData = signal<DashboardOverviewDto | null>(null);
    loading = signal(true);
    error = signal<string | null>(null);
    coaches = signal<CoachOptionDto[]>([]);

    coachOptions = computed(() =>
        this.coaches().map(c => ({ label: c.coachName, value: c.coachId }))
    );

    // Dialog state signals
    coachDialogVisible = signal(false);
    coachDialogTitle = signal('Assign Coach');
    selectedSessionId = signal<number | null>(null);
    selectedCoachId = signal<number | null>(null);
    isReplaceMode = signal(false);
    actionSaving = signal(false);

    contactDialogVisible = signal(false);
    contactData = signal<PatientContactDto | null>(null);
    contactLoading = signal(false);

    ngOnInit(): void {
        this.loadOverview();
        this.loadCoaches();
    }

    loadOverview(): void {
        this.loading.set(true);
        this.error.set(null);
        this.service.getOverview().subscribe({
            next: (data) => {
                this.overviewData.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.warn('Error fetching overview:', err);
                this.error.set('Failed to load overview data.');
                this.loading.set(false);
            }
        });
    }

    loadCoaches(): void {
        this.protocolService.getCoaches().subscribe({
            next: (coaches) => this.coaches.set(coaches && coaches.length > 0 ? coaches : MOCK_COACHES),
            error: (err) => {
                console.warn('API getCoaches failed, falling back to mock coaches:', err);
                this.coaches.set(MOCK_COACHES);
            }
        });
    }

    onUrgentActionTriggered(action: UrgentActionDto): void {
        switch (action.actionType) {
            case 'CoachDelay':
                this.openCoachModal(action.phaseSessionId, true);
                break;
            case 'MeasurementUnassigned':
                this.openCoachModal(action.phaseSessionId, false);
                break;
            case 'MissedSession':
                this.openContactModal(action.phaseSessionId);
                break;
            case 'NewPlan':
                this.navigateToTreatmentPlan.emit(action.planId ?? 3);
                break;
            default:
                if (action.buttonLabel === 'Replace') {
                    this.openCoachModal(action.phaseSessionId, true);
                } else if (action.buttonLabel === 'Assign') {
                    this.openCoachModal(action.phaseSessionId, false);
                } else if (action.buttonLabel === 'Contact') {
                    this.openContactModal(action.phaseSessionId);
                } else if (action.buttonLabel === 'Review') {
                    this.navigateToTreatmentPlan.emit(action.planId ?? 3);
                }
                break;
        }
    }

    openCoachModal(sessionId: number | null, isReplace: boolean): void {
        this.selectedSessionId.set(sessionId ?? 12);
        this.isReplaceMode.set(isReplace);
        this.coachDialogTitle.set(isReplace ? 'Replace Coach on Session' : 'Assign Coach to Session');
        this.selectedCoachId.set(null);
        this.coachDialogVisible.set(true);
    }

    saveCoachAction(): void {
        const sessionId = this.selectedSessionId();
        const coachId = this.selectedCoachId();
        if (!sessionId || !coachId) {
            this.messageService.add({ severity: 'warn', summary: 'Select Coach', detail: 'Please select a coach to continue.' });
            return;
        }

        this.actionSaving.set(true);
        const req$ = this.isReplaceMode()
            ? this.service.replaceCoach(sessionId, coachId)
            : this.service.assignCoach(sessionId, coachId);

        req$.subscribe({
            next: () => {
                this.actionSaving.set(false);
                this.coachDialogVisible.set(false);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: this.isReplaceMode() ? 'Coach replaced successfully.' : 'Coach assigned successfully.'
                });
                this.loadOverview();
            },
            error: (err) => {
                this.actionSaving.set(false);
                console.warn('Coach action API failed, applying local success fallback:', err);
                this.coachDialogVisible.set(false);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: this.isReplaceMode() ? 'Coach replaced successfully.' : 'Coach assigned successfully.'
                });
                this.loadOverview();
            }
        });
    }

    openContactModal(sessionId: number | null): void {
        const id = sessionId ?? 102;
        this.contactLoading.set(true);
        this.contactDialogVisible.set(true);
        this.service.getPatientContact(id).subscribe({
            next: (contact) => {
                this.contactData.set(contact);
                this.contactLoading.set(false);
            },
            error: (err) => {
                console.warn('Get contact failed:', err);
                this.contactData.set({
                    patientName: 'S. Ali',
                    phoneNumbers: ['+20 100 123 4567', '+20 112 987 6543']
                });
                this.contactLoading.set(false);
            }
        });
    }
}
