import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from "primeng/card";
import { TagModule } from 'primeng/tag';
import { NotificationService } from '../../../../../core/services/notification.service';
import { NotificationDTO, NotificationType } from '../../../../../core/services/notification.model';

type NotifLevel = 'critical' | 'warning' | 'info' | 'success' | 'protocol';

interface UiNotification {
  id: number | string;
  level: NotifLevel;
  icon: string;
  title: string;
  body: string;
  time: string;
  tag?: string;
  isRead: boolean;
  relatedEntityType?: string | null;
  relatedEntityId?: number | null;
}

@Component({
  selector: 'app-dc-notifications-alerts',
  imports: [ButtonModule, CardModule, TagModule],
  templateUrl: './notifications-alerts.component.html',
  styleUrl: './notifications-alerts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsAlertsComponent implements OnInit {
  private readonly router = inject(Router);
  public readonly notificationService = inject(NotificationService);

  readonly notificationsList = signal<UiNotification[]>([]);
  readonly loading = signal<boolean>(false);

  readonly levelConfig: Record<NotifLevel, { color: string; bg: string; border: string }> = {
    critical: { color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
    warning: { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
    info: { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.25)' },
    success: { color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
    protocol: { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)' }
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.notificationService.loadNotificationsHistory(1, 50).subscribe({
      next: (items) => {
        const list = Array.isArray(items) ? items : ((items as any)?.items ?? []);
        this.notificationsList.set(list.map((n: NotificationDTO) => this.mapDtoToUi(n)));
        this.loading.set(false);
      },
      error: () => {
        this.notificationsList.set([]);
        this.loading.set(false);
      }
    });
  }

  private mapDtoToUi(n: NotificationDTO): UiNotification {
    return {
      id: n.id,
      level: this.getLevelForType(n.type),
      icon: this.getIconForType(n.type),
      title: n.titleEn || n.titleAr,
      body: n.messageEn || n.messageAr,
      time: this.formatTime(n.createdAt),
      tag: n.relatedEntityType ?? undefined,
      isRead: n.isRead,
      relatedEntityType: n.relatedEntityType,
      relatedEntityId: n.relatedEntityId
    };
  }

  private getLevelForType(type: NotificationType): NotifLevel {
    switch (type) {
      case NotificationType.LowNPSAlert:
      case NotificationType.NegativeSessionFeedback:
      case NotificationType.ReferralEscalated:
        return 'critical';
      case NotificationType.LowBlueprintRating:
      case NotificationType.ReferralReminder2Days:
      case NotificationType.ReferralReminder5Days:
        return 'warning';
      case NotificationType.NoticeableImprovement:
      case NotificationType.AppointmentPaid:
        return 'success';
      case NotificationType.ProtocolModificationPending:
      case NotificationType.PlanAppointmentReady:
        return 'protocol';
      default:
        return 'info';
    }
  }

  private getIconForType(type: NotificationType): string {
    switch (type) {
      case NotificationType.AppointmentBooked:
      case NotificationType.AppointmentPaid:
      case NotificationType.AppointmentCancelled:
      case NotificationType.AppointmentRescheduled:
        return 'pi-calendar';
      case NotificationType.ProtocolModificationPending:
        return 'pi-file-edit';
      case NotificationType.LowNPSAlert:
      case NotificationType.NegativeSessionFeedback:
        return 'pi-exclamation-triangle';
      case NotificationType.NoticeableImprovement:
        return 'pi-chart-line';
      default:
        return 'pi-bell';
    }
  }

  private formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe();
    this.notificationsList.update(list => list.map(n => ({ ...n, isRead: true })));
  }

  markRead(id: number | string): void {
    if (typeof id === 'number') {
      this.notificationService.markAsRead(id).subscribe();
    }
    this.notificationsList.update(list =>
      list.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }

  onNotificationClick(n: UiNotification): void {
    this.markRead(n.id);
    if (n.relatedEntityType === 'Appointment' && n.relatedEntityId) {
      this.router.navigate(['/uikit/appointment-consultation-form', n.relatedEntityId]);
    } else if (n.relatedEntityType === 'TreatmentPlan' && n.relatedEntityId) {
      this.router.navigate(['/uikit/phases-sessions']);
    } else {
      this.router.navigate(['/uikit/athleteprofile']);
    }
  }

  private getMockNotifications(): UiNotification[] {
    return [
      {
        id: 'n1', level: 'protocol', icon: 'pi-file-edit',
        title: 'Protocol Modification — H. Salem',
        body: 'Team Lead added exercise Terminal Knee Extension · 3x12 for Phase 2.',
        time: '45 mins ago', tag: 'Return to Play Protocol', isRead: false
      },
      {
        id: 'n2', level: 'critical', icon: 'pi-exclamation-triangle',
        title: 'Low NPS — N. Khaled',
        body: 'Gave 5/10 in evaluation. Wrote: "Exercises are not suited for my level".',
        time: '3 hours ago', isRead: false
      },
      {
        id: 'n3', level: 'success', icon: 'pi-chart-line',
        title: 'Noticeable Improvement — M. Tarek',
        body: 'Session 12 measurement: 68% improvement in knee strength.',
        time: '3 days ago', isRead: true
      }
    ];
  }
}
