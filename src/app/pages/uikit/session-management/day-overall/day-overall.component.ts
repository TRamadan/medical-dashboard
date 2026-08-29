import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { CoachDashboardService } from '../services/coach-dashboard.service';
import { DayOverallResponse, DayOverallSession } from '../models/coach-dashboard.model';

interface StatCard {
  label: string;
  count: string;
  subtitle: string;
  accentKey: string;
  icon: string;
}

interface SessionCard {
  phaseSessionId: number;
  patientName: string;
  sessionInfo: string;
  status: string;
  rating: number | null;
  stars: number[];
  dotColor: string;
  topBorderColor: string;
  badge: { label: string; color: string; border: string; bg: string } | null;
}

@Component({
  selector: 'app-day-overall',
  imports: [CardModule, ButtonModule, ToastModule],
  templateUrl: './day-overall.component.html',
  styleUrl: './day-overall.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class DayOverallComponent implements OnInit {
  private readonly coachDashboardService = inject(CoachDashboardService);
  private readonly messageService = inject(MessageService);

  // ── API State Signals ─────────────────────────────────────────
  readonly loading = signal<boolean>(true);
  readonly error = signal<{ status?: number; message: string } | null>(null);
  readonly dayOverall = signal<DayOverallResponse | null>(null);

  // ── Derived: Stats Cards ──────────────────────────────────────
  readonly stats = computed<StatCard[]>(() => {
    const data = this.dayOverall();
    if (!data) return [];
    return [
      {
        label: 'Executed Sessions',
        count: String(data.sessionsFinished),
        subtitle: `Out of ${data.sessionsFinished + (data.sessionsInDetail.filter(s => s.status === 'Remaining').length)} scheduled`,
        accentKey: 'completed',
        icon: 'pi-check-circle'
      },
      {
        label: 'Performance Rating',
        count: data.performanceRating > 0 ? data.performanceRating.toFixed(1) : '—',
        subtitle: '/ 5 Today',
        accentKey: 'rating',
        icon: 'pi-star'
      },
      {
        label: 'Swarm',
        count: String(data.groups),
        subtitle: 'Group sessions',
        accentKey: 'swarm',
        icon: 'pi-users'
      },
      {
        label: 'Solo',
        count: String(data.solo),
        subtitle: 'Independent sessions',
        accentKey: 'solo',
        icon: 'pi-user'
      },
      {
        label: 'Late Notes',
        count: String(data.lateNotes),
        subtitle: 'Notes after +2h',
        accentKey: data.lateNotes > 0 ? 'remaining' : 'neutral',
        icon: 'pi-file-edit'
      },
      {
        label: 'Transferred',
        count: String(data.transferredToAnother),
        subtitle: 'To another coach',
        accentKey: 'neutral',
        icon: 'pi-arrow-right-arrow-left'
      }
    ];
  });

  // ── Derived: Session Detail Cards ─────────────────────────────
  readonly sessions = computed<SessionCard[]>(() => {
    const data = this.dayOverall();
    if (!data) return [];
    return data.sessionsInDetail.map(s => this.mapSession(s));
  });

  ngOnInit(): void {
    this.loadDayOverall();
  }

  loadDayOverall(): void {
    this.loading.set(true);
    this.error.set(null);

    this.coachDashboardService.getDayOverall().subscribe({
      next: (res) => {
        this.loading.set(false);
        this.dayOverall.set(res);
      },
      error: (err: HttpErrorResponse | any) => {
        this.loading.set(false);
        this.dayOverall.set(null);

        const status = err?.status;
        let message = 'Failed to connect to the server.';
        if (status === 404) {
          message = 'Not Found (404): Day overall data could not be found.';
        } else if (status === 401 || status === 403) {
          message = `Unauthorized (${status}): You do not have permission to view this data.`;
        } else if (status === 500) {
          message = 'Server Error (500): Internal server error fetching day overall.';
        } else if (err?.error?.message) {
          message = err.error.message;
        }

        this.error.set({ status, message });
        this.messageService.add({
          severity: 'error',
          summary: `HTTP Error ${status || 'Unknown'}`,
          detail: message,
          life: 5000
        });
      }
    });
  }

  private mapSession(s: DayOverallSession): SessionCard {
    const normalizedStatus = s.status?.toLowerCase() ?? '';
    const isCompleted = normalizedStatus === 'completed';
    const isInProgress = normalizedStatus === 'inprogress';
    const isNoShow = normalizedStatus === 'noshow';

    let dotColor = '#64748b';
    let topBorderColor = 'transparent';
    let badge: SessionCard['badge'] = null;

    if (isCompleted) {
      dotColor = '#10b981';
      topBorderColor = '#10b981';
    } else if (isInProgress) {
      dotColor = '#f59e0b';
      topBorderColor = '#f59e0b';
      badge = { label: 'In Progress', color: '#f59e0b', border: 'rgba(245,158,11,0.4)', bg: 'rgba(245,158,11,0.05)' };
    } else if (isNoShow) {
      dotColor = '#ef4444';
      topBorderColor = '#ef4444';
      badge = { label: 'No Show', color: '#ef4444', border: 'rgba(239,68,68,0.4)', bg: 'rgba(239,68,68,0.05)' };
    } else {
      // Remaining / Scheduled / Confirmed
      badge = { label: s.status, color: '#64748b', border: 'rgba(100,116,139,0.4)', bg: 'rgba(100,116,139,0.05)' };
    }

    const rating = s.rating;
    const stars = rating !== null
      ? Array.from({ length: 5 }, (_, i) => (i < Math.round(rating) ? 1 : 0))
      : [];

    return {
      phaseSessionId: s.phaseSessionId,
      patientName: s.patientName,
      sessionInfo: s.sessionInfo,
      status: s.status,
      rating,
      stars,
      dotColor,
      topBorderColor,
      badge
    };
  }
}
