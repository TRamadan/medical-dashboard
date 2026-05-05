import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TodaysConsultationsComponent } from './components/todays-consultations/todays-consultations.component';
import { PendingTicketsComponent } from './components/pending-tickets/pending-tickets.component';
import { NotificationsAlertsComponent } from './components/notifications-alerts/notifications-alerts.component';

export type DcNavId = 'dashboard' | 'todays-consultations' | 'pending-tickets' | 'notifications-alerts';

interface DcNavItem {
  id: DcNavId;
  label: string;
  icon: string;
  badge?: number;
  dot?: string;
}

@Component({
  selector: 'app-doctor-control',
  standalone: true,
  imports: [DashboardComponent, TodaysConsultationsComponent, PendingTicketsComponent, NotificationsAlertsComponent],
  templateUrl: './doctor-control.component.html',
  styleUrl: './doctor-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorControlComponent {
  activeNav = signal<DcNavId>('dashboard');

  readonly navItems: DcNavItem[] = [
    { id: 'dashboard',              label: 'Dashboard',         icon: 'pi-th-large',      dot: '#10b981' },
    { id: 'todays-consultations',   label: 'Today\'s Consultations', icon: 'pi-calendar-plus', badge: 2 },
    { id: 'pending-tickets',        label: 'Pending Tickets',    icon: 'pi-ticket',        badge: 4 },
    { id: 'notifications-alerts',   label: 'Notifications & Alerts', icon: 'pi-bell',          badge: 3 }
  ];

  setActive(id: DcNavId): void {
    this.activeNav.set(id);
  }
}
