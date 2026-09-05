import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { finalize, of } from 'rxjs';
import {
  PendingTicketsService,
  ApiTicket,
  ApiTicketType,
  ApiUrgency,
  PendingTicketsTab,
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
  imports: [ButtonModule, CardModule, BadgeModule, ToggleSwitchModule, FormsModule],
  templateUrl: './pending-tickets.component.html',
  styleUrl: './pending-tickets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingTicketsComponent implements OnInit {
  private readonly router  = inject(Router);
  private readonly service = inject(PendingTicketsService);

  // ── State ────────────────────────────────────────────────────────────────

  activeTab = signal<PtTab>('decision');
  useMockData = signal<boolean>(false);

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

  /** Tab counts — decision + urgent driven by API badges; all is total */
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

  // ── Toggle Mock Data ────────────────────────────────────────────────────

  toggleMockData(enabled: boolean): void {
    this.useMockData.set(enabled);
    this.loadTickets();
  }

  // ── Data loading ─────────────────────────────────────────────────────────

  private loadTickets(): void {
    this.loading.set(true);
    this.error.set(null);

    const tab = this.activeTab();

    if (this.useMockData()) {
      // ── Mock data — 6 scenarios from the README ───────────────────────────
      const ALL_MOCK_TICKETS: ApiTicket[] = [
        // ── Scenario 1: Phase Transition Confirmation ─────────────────────
        {
          ticketId: 'TKT-001',
          ticketType: ApiTicketType.BlueprintConsultation,
          typeLabel: 'Phase Transition',
          patientId: 101,
          patientName: 'Ahmed Salah',
          description: 'Athlete is ready to transition to Phase 3 — ACL Rehab protocol.',
          subDescription: 'LSI: 82% · VAS: 1 · ROM: 128°  —  All criteria met for advancement.',
          urgency: ApiUrgency.NeedsReview,
          urgencyLabel: 'Needs Review',
          createdAt: '2026-08-18T08:00:00Z',
          slaLabel: 'Review by today',
          metrics: { LSI: '82%', VAS: '1', ROM: '128°' },
          actions: [
            { label: 'Open Consultation', action: 'open-consultation', style: 'primary' },
            { label: 'Approve Transition', action: 'approve-clinical',  style: 'primary' },
          ],
          appointmentId: 501,
          treatmentPlanId: null,
          modificationRequestId: null,
        },

        // ── Scenario 2: Internal Referral — Measurements Ready ────────────
        {
          ticketId: 'TKT-002',
          ticketType: ApiTicketType.BlueprintConsultation,
          typeLabel: 'Internal Referral',
          patientId: 102,
          patientName: 'Karim Hassan',
          description: 'Internal referral measurements are complete. Review results in the consultation.',
          subDescription: 'Internal Measurements: ✓ Completed — Isokinetic Strength, ROM, Balance.',
          urgency: ApiUrgency.Ready,
          urgencyLabel: 'Ready',
          createdAt: '2026-08-17T14:30:00Z',
          slaLabel: null,
          metrics: { 'Isokinetic Strength': '91%', ROM: '132°', Balance: 'Good' },
          actions: [
            { label: 'Open Consultation', action: 'open-consultation', style: 'primary' },
          ],
          appointmentId: 502,
          treatmentPlanId: null,
          modificationRequestId: null,
        },

        // ── Scenario 3: Team-Leader Protocol Modification ─────────────────
        {
          ticketId: 'TKT-003',
          ticketType: ApiTicketType.ProtocolModification,
          typeLabel: 'Protocol Modification',
          patientId: 103,
          patientName: 'Omar Nasser',
          description: 'Team Leader modified the current protocol — 2 exercises added, 1 adjusted.',
          subDescription: 'Added: Lateral Band Walk (3×15), Terminal Knee Extension (3×20). Modified: Leg Press → reduced resistance from 60 kg to 45 kg.',
          urgency: ApiUrgency.Urgent,
          urgencyLabel: 'Urgent',
          createdAt: '2026-08-18T06:15:00Z',
          slaLabel: 'Decision required within 24 h',
          metrics: null,
          actions: [
            { label: 'View Changes',  action: 'view-modification',   style: 'secondary' },
            { label: 'Approve',       action: 'approve-modification', style: 'primary'   },
            { label: 'Reject',        action: 'revert-modification',  style: 'danger'    },
          ],
          appointmentId: null,
          treatmentPlanId: 301,
          modificationRequestId: 201,
        },

        // ── Scenario 4: Completed Protocol — Graduation Ready ─────────────
        {
          ticketId: 'TKT-004',
          ticketType: ApiTicketType.GraduationReady,
          typeLabel: 'Graduation Ready',
          patientId: 104,
          patientName: 'Youssef Atef',
          description: 'Athlete has completed the full ACL protocol. Ready for graduation review.',
          subDescription: 'LSI: 98% · VAS: 0 · Hop Test: 95%',
          urgency: ApiUrgency.Graduation,
          urgencyLabel: 'Graduation',
          createdAt: '2026-08-16T10:00:00Z',
          slaLabel: null,
          metrics: { LSI: '98%', VAS: '0', 'Hop Test': '95%' },
          actions: [
            { label: 'Open Legacy Launch', action: 'open-legacy-launch', style: 'warning' },
          ],
          appointmentId: null,
          treatmentPlanId: 302,
          modificationRequestId: null,
        },

        // ── Scenario 5: Phase Timeout — High Defer Rate (>50%) ────────────
        {
          ticketId: 'TKT-005',
          ticketType: ApiTicketType.PhaseTimeoutAlert,
          typeLabel: 'Phase Timeout Alert',
          patientId: 105,
          patientName: 'Mahmoud Fares',
          description: 'Deferral rate exceeded 50% in Phase 2. Athlete has been deferred 4 out of 7 transition attempts.',
          subDescription: 'Expected duration: 6 weeks · Actual: 11 weeks · ROM: 97° / target 120° · Quad LSI: 61% / target 75%',
          urgency: ApiUrgency.Urgent,
          urgencyLabel: 'Urgent',
          createdAt: '2026-08-18T07:45:00Z',
          slaLabel: 'Escalation required',
          metrics: { 'Defer Rate': '57%', ROM: '97° / 120°', 'Quad LSI': '61% / 75%' },
          actions: [
            { label: 'Review Criteria',       action: 'review-criteria',       style: 'secondary' },
            { label: 'Request Measurement',   action: 'request-remeasurement', style: 'warning'   },
            { label: 'Re-evaluate',           action: 're-evaluate',           style: 'danger'    },
          ],
          appointmentId: null,
          treatmentPlanId: 303,
          modificationRequestId: null,
        },

        // ── Scenario 6: Non-Compliance — 2 Consecutive Absences ──────────
        {
          ticketId: 'TKT-006',
          ticketType: ApiTicketType.ComplianceAlert,
          typeLabel: 'Compliance Alert',
          patientId: 106,
          patientName: 'Sara Magdy',
          description: 'Athlete missed 2 consecutive sessions. Compliance rate dropped to 40%.',
          subDescription: 'Attended: 4 / 10 sessions · Unused sessions: 6 · Estimated loss: 1,800 EGP',
          urgency: ApiUrgency.Urgent,
          urgencyLabel: 'Urgent',
          createdAt: '2026-08-17T16:00:00Z',
          slaLabel: 'Contact within 48 h',
          metrics: { 'Compliance Rate': '40%', 'Threshold': '70%', 'Unused Sessions': '6' },
          actions: [
            { label: 'Call Athlete',    action: 'athlete-call',     style: 'secondary' },
            { label: 'Extend Package',  action: 'extend-package',   style: 'warning'   },
            { label: 'Hold Plan',       action: 'temporary-pause',  style: 'danger'    },
          ],
          appointmentId: null,
          treatmentPlanId: 304,
          modificationRequestId: null,
        },
      ];

      // Client-side tab filter to simulate the API `tab` param
      const URGENT_TYPES = new Set<ApiUrgency>([ApiUrgency.Urgent]);
      const DECISION_TYPES = new Set<ApiUrgency>([
        ApiUrgency.NeedsReview,
        ApiUrgency.Ready,
        ApiUrgency.Graduation,
      ]);

      const filtered = ALL_MOCK_TICKETS.filter((t) => {
        if (tab === 'urgent')   return URGENT_TYPES.has(t.urgency as ApiUrgency);
        if (tab === 'decision') return DECISION_TYPES.has(t.urgency as ApiUrgency) || URGENT_TYPES.has(t.urgency as ApiUrgency);
        return true; // 'all'
      });

      of(filtered)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (tickets) => this.rawTickets.set(tickets ?? []),
          error: () => this.error.set('Failed to load pending tickets. Please try again.'),
        });
    } else {
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
        // Show detail via ticket description / subDescription (handled in template)
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
        // Future flows — log for now
        console.log(`Action "${action}" on ticket`, ticket.ticketId);
        break;

      default:
        console.warn('Unhandled ticket action:', action, ticket);
    }
  }
}
