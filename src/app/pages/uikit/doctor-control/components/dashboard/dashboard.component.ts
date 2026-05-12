import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

interface StatCard { label: string; value: string; sub: string; accent: string; icon: string; }
interface PatientRow { name: string; time: string; badge: string; badgeAccent: string; dot: string; details: string; }
interface ActionRow { name: string; dot: string; summary: string; details: string; actions: { label: string; style: 'primary' | 'ghost' | 'danger' }[]; }

@Component({
  selector: 'app-dc-dashboard',
  standalone: true,
  imports: [CardModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {

  activeFilter = signal('all');



  readonly stats: StatCard[] = [
    { label: 'Today\'s Consultations', value: '3', sub: '10 remaining from yesterday', accent: '#38bdf8', icon: 'pi-calendar' },
    { label: 'Pending Decisions', value: '4', sub: 'Decisions completed', accent: '#f59e0b', icon: 'pi-ticket' },
    { label: 'Clarity Score — NPS', value: '8.7', sub: 'Target 8–9', accent: '#a78bfa', icon: 'pi-chart-bar' },
    { label: 'Negative Feedback', value: '2', sub: 'This week', accent: '#f87171', icon: 'pi-exclamation-triangle' }
  ];

  readonly patients: PatientRow[] = [
    { name: 'M. Ahmed — Jan 24', time: '9:00 AM', badge: 'New', badgeAccent: '#10b981', dot: '#10b981', details: 'Initial Consultation — New' },
    { name: 'M. Salem — 132', time: '10:30 AM', badge: 'Revise', badgeAccent: '#f59e0b', dot: '#f59e0b', details: 'MRI Results Arrived — Review Plan' },
    { name: 'R. Mustafa — 36M', time: '12:00 PM', badge: 'Plan', badgeAccent: '#ef4444', dot: '#ef4444', details: 'Connection Lost — Restart Program' }
  ];

  readonly priorityRows: ActionRow[] = [
    {
      name: 'R. Mustafa',
      dot: '#ef4444',
      summary: 'Stuck on Rehab Plan — Please Review',
      details: 'Return to Play — 2 hours ago',
      actions: [
        { label: 'Urgent', style: 'danger' }
      ]
    },
    {
      name: 'M. Salem',
      dot: '#f59e0b',
      summary: 'MRI Completed — Review Rehabilitation Plan',
      details: 'Reached Phase 2 · External transfer detected',
      actions: [
        { label: 'Waiting', style: 'ghost' }
      ]
    },
    {
      name: 'M. Ahmed',
      dot: '#10b981',
      summary: 'Initial Evaluation Completed — Write Report',
      details: 'Automated order visible',
      actions: [
        { label: 'Ready', style: 'ghost' }
      ]
    },


  ];
}
