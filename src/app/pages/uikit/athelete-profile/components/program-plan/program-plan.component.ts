import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ProgramPlanData } from '../../models/athlete-profile.models';

@Component({
  selector: 'app-program-plan',
  imports: [CommonModule, CardModule, ProgressBarModule, TagModule, DividerModule],
  templateUrl: './program-plan.component.html',
  styleUrl: './program-plan.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramPlanComponent {
  data = input<ProgramPlanData | null>(null);
  loading = input(false);

  getPhaseSeverity(status: string): 'success' | 'info' | 'secondary' | 'warn' {
    switch (status) {
      case 'Completed':  return 'success';
      case 'InProgress': return 'info';
      case 'Upcoming':   return 'secondary';
      default:           return 'secondary';
    }
  }

  getPhaseLabel(status: string, percent: number): string {
    switch (status) {
      case 'Completed':  return 'مكتملة';
      case 'InProgress': return `جارية ${percent}%`;
      case 'Upcoming':   return 'قادمة';
      default:           return status;
    }
  }

  getModificationSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Approved':  return 'success';
      case 'Pending':   return 'warn';
      case 'Reverted':  return 'danger';
      default:          return 'secondary';
    }
  }

  getCriterionIcon(isMet: boolean | null): string {
    if (isMet === true)  return 'pi pi-check-circle text-green-500';
    if (isMet === false) return 'pi pi-exclamation-triangle text-orange-500';
    return 'pi pi-minus-circle text-gray-400';
  }

  countUnmet(criteria: any[]): number {
    return criteria.filter(c => c.isMet === false).length;
  }
}
