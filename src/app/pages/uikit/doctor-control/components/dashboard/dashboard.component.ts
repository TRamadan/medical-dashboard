import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { DashboardService, ApiScheduleItem, ApiPriorityItem, ApiPriorityAction, DoctorDashboardResponse } from './services/dashboard.service';

interface StatCard { label: string; value: string; sub: string; accent: string; icon: string; }
interface PatientRow { appointmentId: number; name: string; time: string; type: string; badge: string; badgeAccent: string; dot: string; details: string; }
interface ActionRow {
  ticketId: string;
  appointmentId: number | null;
  patientId: number;
  typeLabel: string;
  name: string;
  dot: string;
  summary: string;
  details: string;
  created: string;
  actions: { label: string; action: string; style: 'primary' | 'secondary' | 'warning' | 'danger' }[];
}

// ── Types are imported from dashboard.service.ts ─────────────────────

// Named colors coming back on schedule items (colorIndicator)
const COLOR_MAP: Record<string, string> = {
  yellow: '#f59e0b',
  green: '#10b981',
  red: '#ef4444',
  blue: '#38bdf8',
  gray: '#94a3b8',
};

// Urgency/status labels on priority items drive their dot color
const STATUS_ACCENTS: Record<string, string> = {
  New: '#10b981',
  Revise: '#f59e0b',
  Plan: '#ef4444',
  Urgent: '#ef4444',
  Waiting: '#f59e0b',
  Ready: '#10b981',
};

@Component({
  selector: 'app-dc-dashboard',
  imports: [CardModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardService);



  activeFilter = signal('all');

  loading = signal(true);
  error = signal<string | null>(null);

  readonly stats = signal<StatCard[]>([]);
  readonly patients = signal<PatientRow[]>([]);
  readonly priorityRows = signal<ActionRow[]>([]);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getDashboardData()
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (data) => {
          this.stats.set(this.mapStats(data));
          this.patients.set((data.todaySchedule ?? []).map(item => this.mapScheduleItem(item)));
          this.priorityRows.set((data.priorityItems ?? []).map(item => this.mapPriorityItem(item)));
        },
        error: (err) => {
          this.error.set('Failed to load dashboard. Please try again.');
          console.error('Dashboard load error:', err);
        }
      });
  }

  private mapStats(data: DoctorDashboardResponse): StatCard[] {
    return [
      {
        label: 'Today\'s Consultations',
        value: String(data.todayConsultationsCount),
        sub: `${data.remainingFromYesterday} remaining from yesterday`,
        accent: '#38bdf8',
        icon: 'pi-calendar'
      },
      {
        label: 'Pending Decisions',
        value: String(data.pendingDecisionsCount),
        sub: 'Decisions completed',
        accent: '#f59e0b',
        icon: 'pi-ticket'
      },
      {
        label: 'Clarity Score — NPS',
        value: data.clarityScoreNPS.toFixed(1),
        sub: 'Target 8–9',
        accent: '#a78bfa',
        icon: 'pi-chart-bar'
      },
      {
        label: 'Negative Feedback',
        value: String(data.negativeFeedbackCount),
        sub: 'This week',
        accent: '#f87171',
        icon: 'pi-exclamation-triangle'
      }
    ];
  }

  private mapScheduleItem(item: ApiScheduleItem): PatientRow {
    const badge = item.statusBadge ?? '';
    const accent = COLOR_MAP[item.colorIndicator ?? ''] ?? STATUS_ACCENTS[badge] ?? '#94a3b8';
    return {
      appointmentId: item.appointmentId,
      name: item.patientName ?? '',
      time: item.time ?? '',
      type: item.appointmentType ?? '',
      badge,
      badgeAccent: accent,
      dot: accent,
      details: item.appointmentType ?? ''
    };
  }

  private mapPriorityItem(item: ApiPriorityItem): ActionRow {
    const urgency = item.urgencyLabel ?? '';
    const accent = STATUS_ACCENTS[urgency] ?? '#94a3b8';
    return {
      ticketId: item.ticketId,
      appointmentId: item.appointmentId,
      patientId: item.patientId,
      typeLabel: item.typeLabel ?? '',
      name: item.patientName ?? '',
      dot: accent,
      summary: item.description ?? '',
      details: item.subDescription ?? '',
      created: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
      actions: item.actions ?? []
    };
  }

  navigateToConsultation(status: string) {
    let type = '';
    if (status === 'New') type = 'new';
    else if (status === 'Revise') type = 'return';
    else if (status === 'Plan') type = 'reassess';

    if (type) {
      this.router.navigate(['/uikit/consultation-type'], { queryParams: { type } });
    } else {
      this.router.navigate(['/uikit/consultation-type']);
    }
  }

  // Routes a priority-row action button based on the `action` id the API sent back.
  onPriorityAction(row: ActionRow, action: string, event: Event): void {
    event.stopPropagation();
    switch (action) {
      case 'open-consultation':
        this.router.navigate(['/uikit/consultation-type'], {
          queryParams: { patientId: row.patientId, appointmentId: row.appointmentId ?? undefined }
        });
        break;

      case 'approve-modification':
        if (row.appointmentId != null) {
          // modificationRequestId is embedded in ticketId for priority items;
          // use the service if modificationRequestId is available on the row
          console.log('Approve modification for ticket', row.ticketId);
        }
        break;

      case 'revert-modification':
        console.log('Revert modification for ticket', row.ticketId);
        break;

      case 'view-modification':
        console.log('View modification detail:', row.ticketId, row.details);
        break;

      case 'open-legacy-launch':
        this.router.navigate(['/uikit/phases-sessions']);
        break;

      case 'review-criteria':
        this.router.navigate(['/uikit/phases-sessions']);
        break;

      case 'athlete-call':
      case 'extend-package':
      case 'temporary-pause':
      case 're-evaluate':
      case 'request-remeasurement':
      case 'approve-clinical':
        console.log(`Action "${action}" on ticket`, row.ticketId);
        break;

      default:
        console.warn('Unhandled priority action:', action, row);
    }
  }
}