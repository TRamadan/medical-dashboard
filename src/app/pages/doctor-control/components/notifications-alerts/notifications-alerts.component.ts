import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';

type NotifLevel = 'critical' | 'warning' | 'info' | 'success';

interface Notification {
  id: string;
  level: NotifLevel;
  icon: string;
  title: string;
  body: string;
  time: string;
  tag?: string;
  read: boolean;
}

@Component({
  selector: 'app-dc-notifications-alerts',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './notifications-alerts.component.html',
  styleUrl: './notifications-alerts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsAlertsComponent {

  notifications = signal<Notification[]>([
    {
      id: 'n1', level: 'critical', icon: 'pi-exclamation-circle',
      title: 'Urgent Alert — M. Salem', read: false,
      body: 'NPS dropped to 2/10 · Requires immediate doctor intervention',
      time: '5 mins ago', tag: 'SLA Overdue'
    },
    {
      id: 'n2', level: 'critical', icon: 'pi-exclamation-circle',
      title: 'Negative Feedback — F. Sami', read: false,
      body: '5th consecutive session without noticeable improvement · Protocol review required',
      time: '20 mins ago', tag: 'Recurring'
    },
    {
      id: 'n3', level: 'warning', icon: 'pi-clock',
      title: 'SLA Expiring Soon — N. Khaled', read: false,
      body: 'Must reply to NPS ticket within 2 hours',
      time: '45 mins ago', tag: 'SLA'
    },
    {
      id: 'n4', level: 'warning', icon: 'pi-user',
      title: 'Waiting Consultation — M. Ahmed', read: false,
      body: 'Waiting in the lobby for 15 minutes · Appointment was at 9:00 AM',
      time: '15 mins ago', tag: 'Delay'
    },
    {
      id: 'n5', level: 'info', icon: 'pi-file',
      title: 'MRI Report Arrived — M. Salem', read: true,
      body: 'Knee MRI results available for review · Please update rehab plan',
      time: '1 hour ago', tag: undefined
    },
    {
      id: 'n6', level: 'success', icon: 'pi-check-circle',
      title: 'Rehab Phase Completed — B. Salem', read: true,
      body: 'All ACI Protocol criteria met · Ready for Legacy Launch',
      time: '2 hours ago', tag: 'Achievement'
    },
    {
      id: 'n7', level: 'info', icon: 'pi-calendar',
      title: 'Tomorrow\'s Appointments Confirmed', read: true,
      body: '4 consultations scheduled · 2 need final confirmation from patient',
      time: '3 hours ago', tag: undefined
    }
  ]);

  unreadCount = signal(this.notifications().filter(n => !n.read).length);

  markAllRead(): void {
    this.notifications.update(list =>
      list.map(n => ({ ...n, read: true }))
    );
    this.unreadCount.set(0);
  }

  markRead(id: string): void {
    this.notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
    this.unreadCount.set(this.notifications().filter(n => !n.read).length);
  }

  readonly levelConfig: Record<NotifLevel, { color: string; bg: string; border: string }> = {
    critical: { color: '#f87171', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)' },
    warning:  { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)' },
    info:     { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.25)' },
    success:  { color: '#34d399', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)' }
  };
}
