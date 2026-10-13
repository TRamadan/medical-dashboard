import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SessionLogData } from '../../models/athlete-profile.models';

@Component({
  selector: 'app-session-log',
  imports: [CommonModule, CardModule, TagModule, RatingModule, FormsModule, ButtonModule, DividerModule],
  templateUrl: './session-log.component.html',
  styleUrl: './session-log.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionLogComponent {
  data = input<SessionLogData | null>(null);
  loading = input(false);
  showAll = output<void>();

  getStars(rating: number | null): number {
    if (rating == null) return 0;
    return Math.round(rating / 2);
  }

  getCompletionSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'Excellent': return 'success';
      case 'Good':      return 'success';
      case 'Normal':    return 'info';
      case 'Poor':      return 'warn';
      default:          return 'secondary';
    }
  }

  onShowAll(): void {
    this.showAll.emit();
  }
}
