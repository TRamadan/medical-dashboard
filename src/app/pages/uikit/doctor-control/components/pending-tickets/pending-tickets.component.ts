import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { PatientDossierDialogComponent } from '../patient-dossier-dialog/patient-dossier-dialog.component';
import { finalize, of } from 'rxjs';
import {
  PendingTicketsService,
  ApiTicket,
  ApiTicketType,
  ApiUrgency,
  PendingTicketsTab,
  ProtocolModificationDetails,
} from './pending-tickets.service';

// ── UI-level tab ids (mapped to API tab param) ──────────────────────────────
export type PtTab = 'decision' | 'urgent' | 'all';

// ── Urgency badge helpers ────────────────────────────────────────────────────
const URGENCY_COLORS: Record<ApiUrgency, string> = {
  [ApiUrgency.Urgent]: '#ef4444',
  [ApiUrgency.NeedsReview]: '#f59e0b',
  [ApiUrgency.Waiting]: '#94a3b8',
  [ApiUrgency.Ready]: '#38bdf8',
  [ApiUrgency.Graduation]: '#c9a84c',
};

// Action-string → PrimeNG button severity / custom style class
type BtnStyle = 'primary' | 'ghost' | 'danger' | 'warning' | 'purple';

const ACTION_STYLES: Record<string, BtnStyle> = {
  'open-consultation': 'primary',
  'approve-modification': 'primary',
  'build-treatment-plan': 'primary',
  'assign-coach-manager': 'primary',
  'open-legacy-launch': 'warning',
  'view-modification': 'ghost',
  'revert-modification': 'danger',
  're-evaluate': 'danger',
  'athlete-call': 'purple',
  'extend-package': 'warning',
  'temporary-pause': 'purple',
  'review-criteria': 'ghost',
  'request-remeasurement': 'purple',
  'approve-clinical': 'primary',
};

function actionStyle(action: string): BtnStyle {
  return ACTION_STYLES[action] ?? 'ghost';
}

@Component({
  selector: 'app-dc-pending-tickets',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    BadgeModule,
    ToggleSwitchModule,
    DialogModule,
    ToastModule,
    TextareaModule,
    PatientDossierDialogComponent,
  ],
  templateUrl: './pending-tickets.component.html',
  styleUrl: './pending-tickets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class PendingTicketsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(PendingTicketsService);
  private readonly messageService = inject(MessageService);

  readonly ApiTicketType = ApiTicketType;

  // ── State ────────────────────────────────────────────────────────────────

  activeTab = signal<PtTab>('decision');
  useMockData = signal<boolean>(false);

  loading = signal(false);
  error = signal<string | null>(null);

  // ── Patient Dossier Dialog ──────────────────────────────────────────────
  dossierVisible = signal(false);
  dossierAppointmentId = signal<number | null>(null);

  // ── Protocol Modification Dialog ──────────────────────────────────────────
  readonly modDialogVisible = signal(false);
  readonly modDetailsLoading = signal(false);
  readonly modActionProcessing = signal(false);
  readonly modDetails = signal<ProtocolModificationDetails | null>(null);
  modNotifyPatient = true;
  modNote = '';

  /** Raw API tickets for the current tab */
  private rawTickets = signal<ApiTicket[]>([]);

  // ── Derived ──────────────────────────────────────────────────────────────

  /** Tickets sorted by urgency (Urgent first), then createdAt descending */
  readonly tickets = computed(() =>
    [...this.rawTickets()].sort((a, b) => {
      if (a.urgency !== b.urgency) return a.urgency - b.urgency;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
  );

  /** Tab counts — decision + urgent driven by API badges; all is total */
  readonly tabs: { id: PtTab; label: string }[] = [
    { id: 'decision', label: 'Needs your decision' },
    { id: 'urgent', label: 'Urgent alerts' },
    { id: 'all', label: 'All tickets' },
  ];

  // ── Lifecycle ────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadTickets();
  }

  // ── Tab switching ────────────────────────────────────────────────────────

  setTab(tab: PtTab): void {
    this.activeTab.set(tab);
    this.loadTickets();
  }

  // ── Toggle Mock Data ────────────────────────────────────────────────────

  toggleMockData(enabled: boolean): void {
    // this.useMockData.set(enabled);
    // this.loadTickets();
  }

  // ── Data loading ─────────────────────────────────────────────────────────

  private loadTickets(): void {
    this.loading.set(true);
    this.error.set(null);

    const tab = this.activeTab();

    // ── Live API data ────────────────────────────────────────────────────
    this.service
      .getTickets(tab)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (tickets) => this.rawTickets.set(tickets ?? []),
        error: (err) => {
          console.error('Failed to load pending tickets from API:', err);
          this.error.set('Failed to load pending tickets. Please try again.');
        },
      });
  }

  // ── Patient Dossier Dialog ───────────────────────────────────────────────

  openDossier(appointmentId: number | null | undefined, event: Event): void {
    event.stopPropagation();
    if (!appointmentId) return;
    this.dossierAppointmentId.set(appointmentId);
    this.dossierVisible.set(true);
  }

  // ── Protocol Modification Dialog Actions ─────────────────────────────────

  openModificationDialog(ticket: ApiTicket): void {
    if (!ticket.modificationRequestId) return;
    this.modNote = '';
    this.modNotifyPatient = true;
    this.modDetailsLoading.set(true);
    this.service
      .getModificationDetails(ticket.modificationRequestId)
      .pipe(finalize(() => this.modDetailsLoading.set(false)))
      .subscribe({
        next: (details) => {
          this.modDetails.set(details);
          this.modDialogVisible.set(true);
        },
        error: (err) => {
          console.error('Failed to load modification details', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not load modification details.',
          });
        },
      });
  }

  approveMod(): void {
    const det = this.modDetails();
    if (!det) return;
    this.modActionProcessing.set(true);
    this.service
      .approveModification(det.id, this.modNotifyPatient, this.modNote || null)
      .pipe(finalize(() => this.modActionProcessing.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Approved',
            detail: 'Protocol modification has been approved.',
          });
          this.modDialogVisible.set(false);
          this.loadTickets();
        },
        error: (err) => {
          console.error('Approve failed', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to approve modification.',
          });
        },
      });
  }

  revertMod(): void {
    const det = this.modDetails();
    if (!det) return;
    this.modActionProcessing.set(true);
    this.service
      .revertModification(det.id, this.modNote || null)
      .pipe(finalize(() => this.modActionProcessing.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Refused',
            detail: 'Protocol modification has been refused/reverted.',
          });
          this.modDialogVisible.set(false);
          this.loadTickets();
        },
        error: (err) => {
          console.error('Revert failed', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to revert modification.',
          });
        },
      });
  }

  // ── Template helpers ─────────────────────────────────────────────────────

  urgencyColor(t: ApiTicket): string {
    return URGENCY_COLORS[t.urgency as ApiUrgency] ?? '#94a3b8';
  }

  getActionStyle(action: string): BtnStyle {
    return actionStyle(action);
  }

  /** Format metrics Dictionary<string,string> into a readable string */
  formatMetrics(metrics: Record<string, string> | null): string {
    if (!metrics) return '';
    return Object.entries(metrics)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' · ');
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  /** Check if the ticket is a ProtocolModification type */
  isProtocolModification(t: ApiTicket): boolean {
    return t.ticketType === ApiTicketType.ProtocolModification;
  }

  // ── Action handler ───────────────────────────────────────────────────────

  onTicketCardClick(ticket: ApiTicket, event: Event): void {
    if (ticket.ticketType === ApiTicketType.AssignCoachManager) {
      this.handleAction('assign-coach-manager', ticket, event);
    }
  }

  handleAction(action: string, ticket: ApiTicket, event: Event): void {
    event.stopPropagation();

    if (
      ticket.ticketType === ApiTicketType.AssignCoachManager ||
      action === 'assign-coach-manager'
    ) {
      this.router.navigate(['/uikit/protocol-config'], {
        queryParams: {
          tab: 'Published',
          template: 'false',
          highlightPlanId: ticket.treatmentPlanId ?? undefined,
          treatmentPlanId: ticket.treatmentPlanId ?? undefined,
          patientId: ticket.patientId ?? undefined,
          autoAssign: 'true',
        },
      });
      return;
    }

    if (
      ticket.ticketType === ApiTicketType.DirectBlueprintAwaitingPlan ||
      ticket.ticketType === ApiTicketType.ReportAcceptedAwaitingPlan ||
      action === 'build-treatment-plan'
    ) {
      this.router.navigate(['/uikit/protocol-config'], {
        queryParams: {
          tab: 'Published',
          startNew: 'false',
          patientId: ticket.patientId,
          appointmentId: ticket.appointmentId,
          consultationDecisionId: ticket.consultationDecisionId,
          medicalReportId: ticket.medicalReportId,
        },
      });
      return;
    }

    switch (action) {
      case 'open-consultation':
        this.router.navigate(['/uikit/consultation-type'], {
          queryParams: {
            patientId: ticket.patientId,
            appointmentId: ticket.appointmentId ?? undefined,
          },
        });
        break;

      case 'approve-modification':
        if (ticket.modificationRequestId != null) {
          this.service.approveModification(ticket.modificationRequestId, false).subscribe({
            next: () => this.loadTickets(),
            error: (err) => console.error('Approve failed', err),
          });
        }
        break;

      case 'revert-modification':
        if (ticket.modificationRequestId != null) {
          this.service.revertModification(ticket.modificationRequestId).subscribe({
            next: () => this.loadTickets(),
            error: (err) => console.error('Revert failed', err),
          });
        }
        break;

      case 'view-modification':
        if (ticket.modificationRequestId != null) {
          this.openModificationDialog(ticket);
        }
        break;

      case 'open-legacy-launch':
        this.router.navigate(['/uikit/phases-sessions'], {
          queryParams: { treatmentPlanId: ticket.treatmentPlanId ?? undefined },
        });
        break;

      case 'review-criteria':
        this.router.navigate(['/uikit/phases-sessions'], {
          queryParams: { treatmentPlanId: ticket.treatmentPlanId ?? undefined },
        });
        break;

      case 'athlete-call':
      case 'extend-package':
      case 'temporary-pause':
      case 're-evaluate':
      case 'request-remeasurement':
      case 'approve-clinical':
        // Future flows — log for now
        console.log(`Action "${action}" on ticket`, ticket.ticketId);
        break;

      default:
        console.warn('Unhandled ticket action:', action, ticket);
    }
  }
}
