import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AthleteSummary } from '../../models/athlete-profile.models';

@Component({
  selector: 'app-profile-summary-side',
  imports: [CommonModule, CardModule, DividerModule, ButtonModule, TagModule],
  templateUrl: './profile-summary-side.component.html',
  styleUrl: './profile-summary-side.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSummarySideComponent {
  summary = input<AthleteSummary | null>(null);
  loadingSummary = input(false);

  getNpsSeverity(category: string | null): 'success' | 'info' | 'danger' | 'warn' | 'secondary' {
    switch (category) {
      case 'Promoter':  return 'success';
      case 'Passive':   return 'info';
      case 'Detractor': return 'danger';
      default:          return 'secondary';
    }
  }

  getStatusSeverity(status: string | null): 'success' | 'info' | 'warn' | 'secondary' {
    switch (status) {
      case 'Active':    return 'success';
      case 'Completed': return 'info';
      case 'Paused':    return 'warn';
      default:          return 'secondary';
    }
  }
}
