import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrgentActionDto } from '../../../models/coach-manager-api.model';

@Component({
  selector: 'app-urgent-actions',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './urgent-actions.component.html',
  styleUrl: './urgent-actions.component.scss'
})
export class UrgentActionsComponent {
  actions = input<UrgentActionDto[] | undefined>();
  navigateToTreatmentPlan = output<number | undefined>();
  actionClicked = output<UrgentActionDto>();

  onActionClick(action: UrgentActionDto) {
    if (action.actionType === 'NewPlan' || action.buttonLabel === 'Review') {
      this.navigateToTreatmentPlan.emit(action.planId ?? 3);
    }
    this.actionClicked.emit(action);
  }

  getActionCardType(action: UrgentActionDto): 'red' | 'yellow' | 'blue' {
    if (action.badgeColor === 'red' || action.actionType === 'CoachDelay' || action.actionType === 'MissedSession') return 'red';
    if (action.badgeColor === 'yellow' || action.actionType === 'NewPlan') return 'yellow';
    return 'blue';
  }

  getActionIcon(action: UrgentActionDto): string {
    switch (action.actionType) {
      case 'CoachDelay': return 'pi-bell-slash';
      case 'NewPlan': return 'pi-clipboard';
      case 'MeasurementUnassigned': return 'pi-id-card';
      case 'MissedSession': return 'pi-exclamation-triangle';
      default: return 'pi-bolt';
    }
  }

  getBadgeType(action: UrgentActionDto): 'red' | 'yellow' | 'dark-blue' {
    if (action.badgeColor === 'red' || action.actionType === 'CoachDelay' || action.actionType === 'MissedSession') return 'red';
    if (action.badgeColor === 'yellow' || action.actionType === 'NewPlan') return 'yellow';
    return 'dark-blue';
  }

  getButtonType(action: UrgentActionDto): 'dark' | 'blue' {
    if (action.buttonLabel === 'Replace' || action.buttonLabel === 'Contact') return 'dark';
    return 'blue';
  }
}
