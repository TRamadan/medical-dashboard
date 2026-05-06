import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import {
  TicketPriority,
  TicketType, ActionType, ActionStyle
} from './constants/ticket.enums';
import { Ticket, PhaseTransitionTicket } from "./models/ticket.models";
export type PtTab = 'waiting' | 'followup' | 'all';

interface TicketAction { label: string; style: 'primary' | 'ghost' | 'danger' | 'warning' | 'purple' | 'defer'; id?: string; }

interface PendingTicket {
  id: string;
  urgency: string;
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
  id: number;
  name: string;
  summary: string;
  status: string;
  session?: string | null;
  time_ago: string;
  program: string | null;
  sla?: string;
}

@Component({
  selector: 'app-dc-pending-tickets',
  standalone: true,
  imports: [ButtonModule, CardModule, BadgeModule],
  templateUrl: './pending-tickets.component.html',
  styleUrl: './pending-tickets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingTicketsComponent {

  activeTab = signal<PtTab>('waiting');

  expandedDeferTicketId = signal<string | null>(null);
  deferNote = signal('');
  notifyPlayer = signal(true);
  notifyTeamLeader = signal(true);
  notifyAdmin = signal(false);
  notifyMentors = signal(false);

  readonly tabs: { id: PtTab; label: string; count: number }[] = [
    { id: 'waiting', label: 'Needs your descision', count: 4 },
    { id: 'followup', label: 'Urgent alerts', count: 2 },
    { id: 'all', label: 'All Notifications', count: 8 }
  ];

  // ── Tab 1: Waiting ──────────────────────────────────────────
  readonly waitingTickets: any[] = [
    {
      "id": 1,
      "type": "Phase Transition",
      "priority": "urgent",
      "sla": "Expires in 2:15",
      "client": "H. Salem",
      "program": "Return to Play",
      "description": "All criteria met — Phase 2 → Phase 3 ready to activate",
      "metrics": {
        "LSI": "83%",
        "VAS": 2,
        "ROM": "124°"
      },
      "time_ago": "1:45 hours ago",
      "badge": "Urgent",
      "actions": [
        {
          "label": "Confirm Transition",
          "type": "approve"
        },
        {
          "label": "Defer + Note",
          "type": "defer"
        },
        {
          "label": "Athlete Profile",
          "type": "view_profile"
        }
      ],
      "defer_options": {
        "notify": [
          { "label": "Athlete", "default_checked": true },
          { "label": "Team Leader", "default_checked": true },
          { "label": "Admin", "default_checked": false },
          { "label": "Engineers", "default_checked": false }
        ]
      }
    },
    {
      "id": 2,
      "type": "Blueprint Consultation",
      "priority": "urgent",
      "sla": "Expires in 4:30",
      "client": "M. Ahmed",
      "issue": "Right Knee Pain",
      "description": "Clinical assessment completed — data ready",
      "notes": "New Blueprint",
      "time_ago": "45 minutes ago",
      "badge": "Urgent",
      "actions": [
        {
          "label": "Open Consultation",
          "type": "open_consultation"
        }
      ]
    },
    {
      "id": 3,
      "type": "Protocol Modification",
      "priority": "warning",
      "client": "H. Salem",
      "program": "Return to Play",
      "description": "M. Khaled (Team Leader) added Terminal Knee Extension · 3×12 to Phase 2",
      "time_ago": "45 minutes ago",
      "modification_status": "Currently Applied",
      "badge": "Needs Review",
      "actions": [
        {
          "label": "Approve",
          "type": "approve_edit"
        },
        {
          "label": "Revert",
          "type": "revert_edit"
        },
        {
          "label": "View Changes",
          "type": "view_diff"
        }
      ],
      "protocol_diff": {
        "added": [
          {
            "exercise": "Terminal Knee Extension",
            "sets": 3,
            "reps": 12,
            "resistance": "Band Resistance",
            "phase": 2,
            "added_by": "M. Khaled (Team Leader)",
            "time_ago": "45 minutes ago"
          }
        ],
        "modified": [
          {
            "exercise": "Quad Set Isometric",
            "before": "3×10",
            "after": "4×15",
            "reason": "Athlete tolerates current load easily — increasing challenge"
          }
        ],
        "unchanged_exercises_count": 6
      }
    },
    {
      "id": 4,
      "type": "Graduation Ready",
      "priority": "normal",
      "client": "B. Salem",
      "program": "ACL Protocol",
      "description": "All Phase 5 criteria met — ready for Legacy Launch",
      "metrics": {
        "LSI": "95%",
        "VAS": 0.5,
        "Hop_Test": "92%"
      },
      "time_ago": "1 day ago",
      "badge": "Graduation",
      "actions": [
        {
          "label": "Open Legacy Launch",
          "type": "open_legacy_launch"
        }
      ]
    },
    {
      "id": 5,
      "type": "Phase Timeout Alert",
      "priority": "urgent",
      "client": "H. Salem",
      "description": "Phase 2 exceeded 150% of expected duration",
      "metrics": {
        "expected_duration": "3-4 weeks",
        "actual_duration": "6 weeks",
        "ROM": {
          "current": "108°",
          "target": "120°"
        },
        "Quad_LSI": {
          "current": "35%",
          "target": "40%"
        }
      },
      "actions": [
        {
          "label": "Review Criteria",
          "type": "review_criteria"
        },
        {
          "label": "Adjust Thresholds",
          "type": "adjust_thresholds"
        },
        {
          "label": "Request Measurement",
          "type": "request_measurement"
        },
        {
          "label": "Re-evaluate",
          "type": "re_evaluate"
        }
      ]
    },
    {
      "id": 6,
      "type": "Compliance Alert",
      "priority": "urgent",
      "client": "A. Tariq",
      "description": "33% attendance in the last two weeks",
      "compliance_rate": "33%",
      "threshold": "< 60%",
      "sessions": {
        "attended": 2,
        "total": 6
      },
      "package_impact": {
        "unused_sessions": 7,
        "estimated_loss_egp": 3700
      },
      "time_ago": "1 day ago",
      "actions": [
        {
          "label": "Admin → Athlete Call",
          "type": "admin_call"
        },
        {
          "label": "Extend Package",
          "type": "extend_package"
        },
        {
          "label": "Temporary Pause",
          "type": "pause"
        }
      ]
    },
    {
      "id": 7,
      "type": "Stale Data Warning",
      "priority": "warning",
      "client": "K. Mahmoud",
      "description": "Phase 2→3 transition with 42-day-old data",
      "metrics": {
        "VAS": {
          "last_measured_days_ago": 42,
          "max_allowed_days": 14,
          "status": "expired"
        },
        "Quad_LSI": {
          "last_measured_days_ago": 28,
          "max_allowed_days": 14,
          "status": "expired"
        },
        "ROM": {
          "last_measured_days_ago": 3,
          "max_allowed_days": 14,
          "status": "valid"
        }
      },
      "actions": [
        {
          "label": "Request Re-measurement",
          "type": "request_remeasurement"
        },
        {
          "label": "Approve with Clinical Justification",
          "type": "approve_with_justification"
        }
      ]
    }
  ];

  // ── Tab 2: Followup ─────────────────────────────────────────
  readonly followupTickets: any[] = [
    {
      id: 'f1',
      urgencyIcon: '⚠',
      urgencyAccent: '#ef4444',
      type: 'Low NPS 5 / 10',
      name: 'N. Khaled',
      quote: 'Exercises are not suited for my level',
      meta: 'Appointment on Friday • 3 hours ago',
      actions: [
        { label: 'View Athlete Profile', style: 'purple' },
        { label: 'Add follow up mark', style: 'warning', id: 'followup' }
      ]
    },
    {
      id: 'f2',
      urgencyIcon: '⚠',
      urgencyAccent: '#ef4444',
      type: 'Negative Feedback',
      name: 'F. Sami',
      quote: 'Feeling increased fatigue and seeing no difference',
      meta: 'Attendance 70% this month • 1 day ago',
      actions: [
        { label: 'View Session Log', style: 'purple' },
        { label: 'Add follow up mark', style: 'warning', id: 'followup' }
      ]
    }
  ];

  followedUpTickets = signal<Set<string>>(new Set());

  toggleFollowUp(ticketId: string): void {
    const current = new Set(this.followedUpTickets());
    if (current.has(ticketId)) {
      current.delete(ticketId);
    } else {
      current.add(ticketId);
    }
    this.followedUpTickets.set(current);
  }

  // ── Tab 3: All ──────────────────────────────────────────────
  readonly allTickets: AllTicketRow[] = [
    {
      "id": 1,
      "name": "M. Tariq",
      "summary": "68% improvement in knee strength",
      "status": "Positive",
      "session": "Session 12",
      "time_ago": "3 days ago",
      "program": null
    },
    {
      "id": 2,
      "name": "B. Salem",
      "summary": "All graduation criteria met ✦",
      "status": "Awaiting My Decision",
      "session": null,
      "time_ago": "1 day ago",
      "program": "Legacy Launch"
    },
    {
      "id": 3,
      "name": "F. Sami",
      "summary": "Negative feedback after session 18",
      "status": "Urgent",
      "session": null,
      "time_ago": "1 day ago",
      "program": null
    },
    {
      "id": 4,
      "name": "N. Khaled",
      "summary": "NPS 5/10 in monthly review",
      "status": "Urgent",
      "session": null,
      "time_ago": "3 hours ago",
      "program": null
    },
    {
      "id": 5,
      "name": "H. Salem — M. Khaled",
      "summary": "Modified an exercise in the protocol",
      "status": "Awaiting My Decision",
      "session": null,
      "time_ago": "45 minutes ago",
      "program": null
    },
    {
      "id": 6,
      "name": "H. Salem",
      "summary": "2M→3M criteria achieved",
      "status": "Awaiting My Decision",
      "sla": "2:15",
      "time_ago": "1:45 ago",
      "program": null
    },
    {
      "id": 7,
      "name": "M. Ahmed",
      "summary": "Blueprint consultation pending",
      "status": "Awaiting My Decision",
      "sla": "4:30",
      "time_ago": "45 minutes ago",
      "program": null
    },
    {
      "id": 8,
      "name": "R. Mustafa",
      "summary": "Approved the rehabilitation plan",
      "status": "Positive",
      "session": null,
      "time_ago": "2 hours ago",
      "program": "Return to Play"
    }

  ];

  setTab(t: PtTab): void {
    this.activeTab.set(t);
    this.expandedDeferTicketId.set(null);
    this.deferNote.set('');
  }

  toggleDefer(id: string): void {
    this.expandedDeferTicketId.update(cur => cur === id ? null : id);
    this.deferNote.set('');
  }

  submitDefer(id: string): void {
    // TODO: send to service
    this.expandedDeferTicketId.set(null);
    this.deferNote.set('');
  }

  toggleNotifyPlayer(): void { this.notifyPlayer.update(v => !v); }
  toggleNotifyTeamLeader(): void { this.notifyTeamLeader.update(v => !v); }
  toggleNotifyAdmin(): void { this.notifyAdmin.update(v => !v); }
  toggleNotifyMentors(): void { this.notifyMentors.update(v => !v); }


  // ─── Color Helper ─────────────────────────────────────────────────────────────

  getPriorityColor(priority: TicketPriority): string {
    const map: Record<TicketPriority, string> = {
      [TicketPriority.URGENT]: '#E24B4A',
      [TicketPriority.WARNING]: '#9B7FFF',
      [TicketPriority.NORMAL]: '#C9A84C',
    };
    return map[priority] ?? '#94a3b8';
  }

  // ─── Type Narrowing Helpers ───────────────────────────────────────────────────

  hasSLA(t: Ticket): string | null {
    return 'sla' in t ? (t as any).sla : null;
  }

  hasProgram(t: Ticket): string | null {
    return 'program' in t ? (t as any).program : null;
  }

  hasDefer(t: Ticket): PhaseTransitionTicket['defer_options'] | null {
    return t.type === TicketType.PHASE_TRANSITION
      ? (t as PhaseTransitionTicket).defer_options
      : null;
  }

  // ─── Button Style Helper ──────────────────────────────────────────────────────

  getButtonStyle(actionType: string): string {
    switch (actionType) {
      case ActionType.APPROVE:
      case ActionType.APPROVE_EDIT:
      case ActionType.OPEN_CONSULTATION:
        return ActionStyle.PRIMARY;
      case ActionType.DEFER:
        return ActionStyle.DEFER;
      case ActionType.VIEW_PROFILE:
      case ActionType.VIEW_DIFF:
        return ActionStyle.GHOST;
      case ActionType.REVERT_EDIT:
      case ActionType.RE_EVALUATE:
        return ActionStyle.DANGER;
      case ActionType.OPEN_LEGACY_LAUNCH:
      case ActionType.ADJUST_THRESHOLDS:
      case ActionType.EXTEND_PACKAGE:
      case ActionType.APPROVE_WITH_JUSTIFICATION:
        return ActionStyle.WARNING;
      case ActionType.REVIEW_CRITERIA:
      case ActionType.REQUEST_MEASUREMENT:
      case ActionType.REQUEST_REMEASUREMENT:
      case ActionType.ADMIN_CALL:
      case ActionType.PAUSE:
        return ActionStyle.PURPLE;
      default:
        return ActionStyle.PRIMARY;
    }
  }

  // ─── Metrics Formatter ────────────────────────────────────────────────────────

  formatMetrics(t: Ticket): string {
    if (!('metrics' in t) || !t.metrics) return '';

    const m = (t as any).metrics;
    return Object.entries(m)
      .map(([key, val]) => {
        if (typeof val === 'object' && val !== null && 'current' in val) {
          return `${key}: ${(val as any).current} (target ${(val as any).target})`;
        }
        if (typeof val === 'object' && val !== null && 'last_measured_days_ago' in val) {
          return `${key}: ${(val as any).last_measured_days_ago}d ago`;
        }
        return `${key}: ${val}`;
      })
      .join(' · ');
  }

  // ─── Action Handler ───────────────────────────────────────────────────────────

  handleAction(type: ActionType, ticket: Ticket): void {
    console.log(`Action: ${type} on ticket #${ticket.id}`);
    // dispatch or route based on type
  }

  // ─── Notify Toggle ────────────────────────────────────────────────────────────

  toggleNotify(label: string): void {
    // handle per-label toggle from defer_options.notify
  }


}
