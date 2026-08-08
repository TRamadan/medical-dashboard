import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { catchError, finalize, of } from 'rxjs';
import { DashboardService } from './services/dashboard.service';

interface StatCard { label: string; value: string; sub: string; accent: string; icon: string; }
interface PatientRow { name: string; time: string; badge: string; badgeAccent: string; dot: string; details: string; }
interface ActionRow { name: string; dot: string; summary: string; details: string; actions: { label: string; style: 'primary' | 'ghost' | 'danger' }[]; }

// ── Shapes returned by GET /api/DoctorDashboard ──────────────────────
// todaySchedule / priorityItems came back empty in the sample response,
// so the field names below are best-guess placeholders based on the
// existing PatientRow / ActionRow shapes. Confirm/adjust once real
// populated items are available from the API.
interface ApiScheduleItem {
  name?: string;          // TODO: confirm actual field name (e.g. patientName)
  time?: string;
  status?: string;        // e.g. 'New' | 'Revise' | 'Plan' -> drives badge
  details?: string;
}

interface ApiPriorityItem {
  name?: string;          // TODO: confirm actual field name (e.g. patientName)
  summary?: string;
  details?: string;
  priority?: string;      // e.g. 'Urgent' | 'Waiting' | 'Ready' -> drives dot/action label
}

interface DoctorDashboardResponse {
  todayConsultationsCount: number;
  remainingFromYesterday: number;
  pendingDecisionsCount: number;
  clarityScoreNPS: number;
  negativeFeedbackCount: number;
  todaySchedule: ApiScheduleItem[];
  priorityItems: ApiPriorityItem[];
}


// Shared color/badge lookup so schedule + priority rows stay visually consistent
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
  standalone: true,
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
    const status = item.status ?? '';
    const accent = STATUS_ACCENTS[status] ?? '#94a3b8';
    return {
      name: item.name ?? '',
      time: item.time ?? '',
      badge: status,
      badgeAccent: accent,
      dot: accent,
      details: item.details ?? ''
    };
  }

  private mapPriorityItem(item: ApiPriorityItem): ActionRow {
    const priority = item.priority ?? '';
    const accent = STATUS_ACCENTS[priority] ?? '#94a3b8';
    const style: 'primary' | 'ghost' | 'danger' = priority === 'Urgent' ? 'danger' : 'ghost';
    return {
      name: item.name ?? '',
      dot: accent,
      summary: item.summary ?? '',
      details: item.details ?? '',
      actions: priority ? [{ label: priority, style }] : []
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
}