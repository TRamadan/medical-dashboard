import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from "primeng/card";
type NotifLevel = 'critical' | 'warning' | 'info' | 'success' | 'protocol';

interface Notification {
  id: string;
  level: NotifLevel;
  icon: string;
  title: string;
  body: string;
  time: string;
  tag?: string;
  primaryAction?: string;
  secondaryAction?: string;
}

@Component({
  selector: 'app-dc-notifications-alerts',
  standalone: true,
  imports: [ButtonModule, CardModule],
  templateUrl: './notifications-alerts.component.html',
  styleUrl: './notifications-alerts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsAlertsComponent {

  notifications = signal<Notification[]>([
    {
      id: 'n1', level: 'protocol', icon: 'pi-file-edit',
      title: 'Protocol Modification — H. Salem',
      body: 'Team Lead (M. Khaled) added exercise Terminal Knee Extension · 3x12 for Phase 2. Modification applied - Review and approve or revert.',
      time: '45 mins ago', tag: 'Return to Play Protocol',
      primaryAction: 'Review Modification →', secondaryAction: 'Revert Modification'
    },
    {
      id: 'n2', level: 'critical', icon: 'pi-exclamation-triangle',
      title: 'Low NPS — N. Khaled',
      body: 'Gave 5/10 in month 2 evaluation. Wrote: "Exercises are not suited for my level". Appointment on Friday — pathway review needed before.',
      time: '3 hours ago',
      primaryAction: 'Review Athlete Profile →'
    },
    {
      id: 'n3', level: 'critical', icon: 'pi-comment',
      title: 'Negative Session Feedback — F. Sami',
      body: 'After session 18 wrote: "Feeling increased fatigue and seeing no difference". Attendance dropped to 70% this month.',
      time: '1 day ago',
      primaryAction: 'Review Session Log →'
    },
    {
      id: 'n4', level: 'warning', icon: 'pi-star',
      title: 'Low Blueprint Rating — K. Mahmoud',
      body: 'Report clarity 3/5. Wrote: "Need more explanation for phases". Consultation on April 1st — clarification call before.',
      time: '4 days ago',
      primaryAction: 'Contact Him →'
    },
    {
      id: 'n5', level: 'success', icon: 'pi-chart-line',
      title: 'Noticeable Improvement — M. Tarek',
      body: 'Session 12 measurement: 68% improvement in knee strength. On track for 90-day goal.',
      time: '3 days ago',
      primaryAction: 'View Report →'
    }
  ]);


  markAllRead(): void {
    this.notifications.update(list =>
      list.map(n => ({ ...n, read: true }))
    );
  }

  markRead(id: string): void {
    this.notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  readonly levelConfig: Record<NotifLevel, { color: string; bg: string; border: string }> = {
    critical: { color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
    warning: { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
    info: { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.25)' },
    success: { color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
    protocol: { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)' }
  };
}
