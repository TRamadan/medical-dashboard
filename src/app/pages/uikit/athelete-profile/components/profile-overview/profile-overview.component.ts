import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { OverviewData, SessionLogItem, CriterionStatus } from '../../models/athlete-profile.models';

@Component({
  selector: 'app-profile-overview',
  imports: [CommonModule, CardModule, TagModule, RatingModule, FormsModule, DividerModule, ProgressBarModule],
  templateUrl: './profile-overview.component.html',
  styleUrl: './profile-overview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileOverviewComponent {
  overviewData = input<OverviewData | null>(null);
  loading = input(false);

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

  getAlertSeverity(severity: string): string {
    return severity === 'Warning' ? 'warn' : 'info';
  }

  getTimelineIcon(type: string): string {
    switch (type) {
      case 'Surgery':          return 'pi pi-heart-fill';
      case 'Consultation':     return 'pi pi-user-edit';
      case 'ExternalReferral': return 'pi pi-send';
      case 'MedicalReport':    return 'pi pi-file-pdf';
      default:                 return 'pi pi-circle';
    }
  }

  getCriterionIcon(isMet: boolean | null): string {
    if (isMet === true)  return 'pi pi-check-circle text-green-500';
    if (isMet === false) return 'pi pi-exclamation-triangle text-orange-500';
    return 'pi pi-minus-circle text-gray-400';
  }
}
