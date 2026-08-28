import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamScheduleBriefDto } from '../../../models/coach-manager-api.model';

@Component({
  selector: 'app-team-schedule',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './team-schedule.component.html',
  styleUrl: './team-schedule.component.scss'
})
export class TeamScheduleComponent {
  scheduleData = input<TeamScheduleBriefDto[] | undefined>();
  navigateToSchedule = output<void>();

  getSlotStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('late')) return 'late';
    if (s.includes('available')) return 'available';
    if (s.includes('session')) return 'session';
    if (s.includes('training')) return 'training';
    return 'default';
  }

  getAvatarBg(initial: string): string {
    const colors = ['#374151', '#1e3a8a', '#5b21b6', '#065f46', '#9a3412'];
    const charCode = initial ? initial.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  }
}
