import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

interface WeekSlot { label: string; doctor: string | null; color: string; }
interface WeekDay { key: string; name: string; date: number; slots: WeekSlot[]; }
interface ConsultationRow { name: string; type: string; badge: string; badgeAccent: string; dot: string; details: string; }

@Component({
  selector: 'app-dc-todays-consultations',
  standalone: true,
  imports: [CardModule, ButtonModule],
  templateUrl: './todays-consultations.component.html',
  styleUrl: './todays-consultations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodaysConsultationsComponent {

  weekOffset = signal(1); // 0 = current, 1 = next week
  readonly monthLabel = 'March 2026';

  weekLabel = computed(() =>
    this.weekOffset() === 0 ? 'Current Week' : 'Next Week'
  );

  readonly timeSlots = ['Morning', 'Afternoon'];


  readonly weekDays: WeekDay[] = [
    {
      key: 'sun', name: 'Sunday', date: 1,
      slots: [
        { label: 'Morning', doctor: 'M. Tarek', color: '#10b981' },
        { label: 'Afternoon', doctor: 'F. Sami', color: '#10b981' }
      ]
    },
    {
      key: 'mon', name: 'Monday', date: 2,
      slots: [
        { label: 'Morning', doctor: 'Dr. Salem', color: '#10b981' },
        { label: 'Afternoon', doctor: 'N. Khaled', color: '#f59e0b' }
      ]
    },
    {
      key: 'tue', name: 'Tuesday', date: 3,
      slots: [
        { label: 'Morning', doctor: 'M. Ahmed', color: '#f59e0b' },
        { label: 'Afternoon', doctor: 'Dr. Salem', color: '#10b981' }
      ]
    },
    {
      key: 'wed', name: 'Wednesday', date: 4,
      slots: [
        { label: 'Morning', doctor: null, color: '' },
        { label: 'Afternoon', doctor: 'R. Mustafa', color: '#f59e0b' }
      ]
    },
    {
      key: 'thu', name: 'Thursday', date: 5,
      slots: [
        { label: 'Morning', doctor: 'M. Salem', color: '#10b981' },
        { label: 'Morning', doctor: 'M. Salem', color: '#10b981' },

        { label: 'Afternoon', doctor: 'R. Mustafa', color: '#f59e0b' }
      ]
    },
    {
      key: 'fri', name: 'Friday', date: 6,
      slots: [
        { label: 'Morning', doctor: null, color: '' },
        { label: 'Afternoon', doctor: null, color: '' }
      ]
    },
  ];

  readonly slotIndices = (() => {
    const max = Math.max(...this.weekDays.map(d => d.slots.length));
    return Array.from({ length: max }, (_, i) => i);
  })();

  readonly upcomingConsultations: ConsultationRow[] = [
    {
      name: 'M. Ahmed — New Fluorite',
      type: 'Today',
      badge: 'New', badgeAccent: '#10b981',
      dot: '#10b981',
      details: 'First Consultation — Knee injury'
    },
    {
      name: 'R. Khaled — NPS Specialist',
      type: '24/3',
      badge: 'Classic', badgeAccent: '#f59e0b',
      dot: '#f59e0b',
      details: 'Needs review signal on dot'
    },
    {
      name: 'A. Mahmoud — Second Consultation',
      type: '4/4',
      badge: 'Partial', badgeAccent: '#a78bfa',
      dot: '#a78bfa',
      details: 'External consultation result available now'
    },

  ];

  prevWeek(): void {
    this.weekOffset.update(v => Math.max(0, v - 1));
  }

  nextWeek(): void {
    this.weekOffset.update(v => v + 1);
  }
}
