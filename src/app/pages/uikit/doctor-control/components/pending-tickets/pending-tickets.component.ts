import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { finalize } from 'rxjs';
import {
  PendingTicketsService,
  ApiTicket,
  ApiTicketType,
  ApiUrgency,
} from './pending-tickets.service';

// ── UI-level tab ids (mapped to API tab param) ──────────────────────────────
export type PtTab = 'decision' | 'urgent' | 'all';

// ── Urgency badge helpers ────────────────────────────────────────────────────
const URGENCY_COLORS: Record<ApiUrgency, string> = {
  [ApiUrgency.Urgent]:      '#ef4444',
  [ApiUrgency.NeedsReview]: '#f59e0b',
  [ApiUrgency.Waiting]:     '#94a3b8',
  [ApiUrgency.Ready]:       '#38bdf8',
  [ApiUrgency.Graduation]:  '#c9a84c',
};

// Action-string → PrimeNG button severity / custom style class
type BtnStyle = 'primary' | 'ghost' | 'danger' | 'warning' | 'purple';

const ACTION_STYLES: Record<string, BtnStyle> = {
  'open-consultation':      'primary',
  'approve-modification':   'primary',
  'open-legacy-launch':     'warning',
  'view-modification':      'ghost',
  'revert-modification':    'danger',
  're-evaluate':            'danger',
  'athlete-call':           'purple',
  'extend-package':         'warning',
  'temporary-pause':        'purple',
  'review-criteria':        'ghost',
  'request-remeasurement':  'purple',
  'approve-clinical':       'primary',
};

function actionStyle(action: string): BtnStyle {
  return ACTION_STYLES[action] ?? 'ghost';
}

@Component({
  selector: 'app-dc-pending-tickets',
  imports: [ButtonModule, CardModule, BadgeModule],
  templateUrl: './pending-tickets.component.html',
  styleUrl: './pending-tickets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingTicketsComponent implements OnInit {
  private readonly router  = inject(Router);
  private readonly service = inject(PendingTicketsService);

  // ── State ────────────────────────────────────────────────────────────────

  activeTab = signal<PtTab>('decision');

  loading = signal(false);
  error   = signal<string | null>(null);

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

  /** Tab definitions */
  readonly tabs: { id: PtTab; label: string }[] = [
    { id: 'decision', label: 'Needs your decision' },
    { id: 'urgent',   label: 'Urgent alerts'       },
    { id: 'all',      label: 'All tickets'          },
  ];

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadTickets();
  }

  // ── Tab switching ────────────────────────────────────────────────────────

  setTab(tab: PtTab): void {
    this.activeTab.set(tab);
    this.loadTickets();
  }

  // ── Data loading ─────────────────────────────────────────────────────────

  private loadTickets(): void {
    this.loading.set(true);
    this.error.set(null);

    const tab = this.activeTab();

    this.service
      .getTickets(tab)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (tickets) => this.rawTickets.set(tickets ?? []),
        error: () => this.error.set('Failed to load pending tickets. Please try again.'),
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

  handleAction(action: string, ticket: ApiTicket, event: Event): void {
    event.stopPropagation();

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
          this.service.approveModification(ticket.modificationRequestId).subscribe({
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
        console.log('View modification:', ticket.ticketId, ticket.subDescription);
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
        console.log(`Action "${action}" on ticket`, ticket.ticketId);
        break;

      default:
        console.warn('Unhandled ticket action:', action, ticket);
    }
  }
}
