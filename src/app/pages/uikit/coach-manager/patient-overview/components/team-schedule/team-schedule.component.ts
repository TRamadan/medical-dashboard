import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-schedule.component.html',
  styleUrl: './team-schedule.component.scss'
})
export class TeamScheduleComponent {
  @Output() navigateToSchedule = new EventEmitter<void>();

  scheduleData = [
    {
      name: 'Eng. Karim',
      initial: 'K',
      initialBg: '#374151',
      slot11: { text: 'Late', type: 'late' },
      slot14: { text: 'Available', type: 'available' }
    },
    {
      name: 'Eng. Sarah',
      initial: 'S',
      initialBg: '#1e3a8a',
      slot11: { text: 'Session', type: 'session' },
      slot14: { text: 'Session', type: 'session' }
    },
    {
      name: 'Eng. Amr',
      initial: 'A',
      initialBg: '#5b21b6',
      slot11: { text: 'Session', type: 'session' },
      slot14: { text: 'Training', type: 'training' }
    }
  ];
}
