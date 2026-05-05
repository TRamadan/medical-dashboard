import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';

export type PtTab = 'waiting' | 'followup' | 'all';

interface TicketAction { label: string; style: 'primary' | 'ghost' | 'danger' | 'warning' | 'purple'; }

interface PendingTicket {
  id: string;
  urgency: 'عاجل' | 'تنبيه' | 'منتظر' | 'بيانات قديمة' | 'مرحلة متأخرة' | 'تبليغ أولي';
  urgencyAccent: string;
  name: string;
  type: string;
  complaint: string;
  meta: string;
  actions: TicketAction[];
  extraBadge?: string;
  extraBadgeAccent?: string;
}

interface FollowupTicket {
  id: string;
  urgencyIcon: string;
  urgencyAccent: string;
  type: string;
  name: string;
  quote: string;
  meta: string;
  actions: TicketAction[];
}

interface AllTicketRow {
  badge: string;
  badgeAccent: string;
  name: string;
  meta: string;
  dot: string;
}

@Component({
  selector: 'app-dc-pending-tickets',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './pending-tickets.component.html',
  styleUrl: './pending-tickets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingTicketsComponent {

  activeTab = signal<PtTab>('waiting');

  readonly tabs: { id: PtTab; label: string; count: number }[] = [
    { id: 'waiting',  label: 'Waiting for Visit',   count: 4 },
    { id: 'followup', label: 'Experience + Deficit',    count: 2 },
    { id: 'all',      label: 'All Data',       count: 8 }
  ];

  // ── Tab 1: Waiting ──────────────────────────────────────────
  readonly waitingTickets: PendingTicket[] = [
    {
      id: 'w1',
      urgency: 'عاجل',
      urgencyAccent: '#ef4444',
      name: 'M. Salem — Return to Play',
      type: 'Phase Transition 2/1',
      complaint: 'Suspended views (12 -> 13M x 45 neglect)',
      meta: '7.5 hours ago • VAS: 2 • ROM: 7 • LSI: 78%',
      extraBadge: 'Confirm Completion ✓',
      extraBadgeAccent: '#10b981',
      actions: [
        { label: 'Review File', style: 'ghost' },
        { label: 'Note', style: 'ghost' },
        { label: 'Secure ←', style: 'ghost' },
        { label: 'Confirm Completion ✓', style: 'primary' }
      ]
    },
    {
      id: 'w2',
      urgency: 'تنبيه',
      urgencyAccent: '#f59e0b',
      name: 'M. Ahmed — Right Knee Pain',
      type: 'First Consultation',
      complaint: 'Clinical evaluation completed — Data ready',
      meta: 'New priority — 90 mins ago',
      actions: [
        { label: 'Send to Study Dept +', style: 'purple' }
      ]
    },
    {
      id: 'w3',
      urgency: 'منتظر',
      urgencyAccent: '#a78bfa',
      name: 'M. Salem — Return to Play',
      type: 'Protocol Check',
      complaint: 'M. Khaled (Second Near) AML (2 Second Phase - Terminal Knee Extension)',
      meta: '60 mins ago • Session: Currently speaking',
      actions: [
        { label: 'Approve ✓', style: 'primary' },
        { label: 'Decline', style: 'ghost' },
        { label: 'View Record ↓', style: 'ghost' }
      ]
    },
    {
      id: 'w4',
      urgency: 'تبليغ أولي',
      urgencyAccent: '#38bdf8',
      name: 'B. Salem — ACI Protocol',
      type: 'Player Graduation',
      complaint: 'All Stage 5 criteria met — Ready 1 • Hop Test',
      meta: 'LSI: 90% • VAS: 5 • 6 mins ago',
      actions: [
        { label: 'Legacy Launch Explanation ✦', style: 'warning' }
      ]
    }
  ];

  // ── Tab 2: Followup ─────────────────────────────────────────
  readonly followupTickets: FollowupTicket[] = [
    {
      id: 'f1',
      urgencyIcon: '🔴',
      urgencyAccent: '#ef4444',
      type: 'NPS Specialist 5 / 10',
      name: 'N. Khaled',
      quote: '"Despair from alternatives to level"',
      meta: 'Arrived after follow-up day — 3 hours ago',
      actions: [
        { label: 'View Review File', style: 'primary' },
        { label: 'Mark as Direct', style: 'ghost' }
      ]
    },
    {
      id: 'f2',
      urgencyIcon: '🔴',
      urgencyAccent: '#ef4444',
      type: 'Negative Feedback',
      name: 'F. Sami',
      quote: '"Fifth session without seeing progress"',
      meta: 'Since Session 28 • Last log: 38 days ago',
      actions: [
        { label: 'View Session Log', style: 'primary' },
        { label: 'Mark as Direct', style: 'ghost' }
      ]
    }
  ];

  // ── Tab 3: All ──────────────────────────────────────────────
  readonly allTickets: AllTicketRow[] = [
    { badge: 'Speaking',    badgeAccent: '#f59e0b', dot: '#f59e0b', name: 'M. Tarek — 68% Knee Strength Control',  meta: 'Safety: Session 13 • Verified Today' },
    { badge: 'Review Path', badgeAccent: '#38bdf8', dot: '#38bdf8', name: 'B. Salem — All progression criteria met ✦',  meta: 'Needs Tarek Review • Legacy Launch — 1 day ago' },
    { badge: 'Fair',      badgeAccent: '#10b981', dot: '#10b981', name: 'K. Sami — Negative comment after Session 18', meta: 'Safety: 1 day ago' },
    { badge: 'Fair',      badgeAccent: '#10b981', dot: '#10b981', name: 'N. Khaled — NPS 5/10 in monthly evaluation',  meta: 'Safety: 3 hours ago' },
    { badge: 'Review Path', badgeAccent: '#38bdf8', dot: '#38bdf8', name: 'M. Salem — M. Khaled every exercise in protocol', meta: 'Tarek Log: 65 mins ago' },
    { badge: 'Review Path', badgeAccent: '#38bdf8', dot: '#38bdf8', name: 'M. Salem — 3M x 3M absolute drop',     meta: 'Waiting for Tarek • SLA: 2 days · Extended 2/2' },
    { badge: 'Active',      badgeAccent: '#a78bfa', dot: '#a78bfa', name: 'M. Ahmed — Fluorite consultation pending',   meta: 'Active Tarek • SLA: 2 x Ext 69' },
    { badge: 'Referred',      badgeAccent: '#64748b', dot: '#64748b', name: 'R. Mustafa — Stuck on rehab plan',     meta: 'Referred — 2 hours ago' }
  ];

  setTab(t: PtTab): void {
    this.activeTab.set(t);
  }
}
