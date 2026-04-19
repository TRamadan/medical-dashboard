import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-urgent-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './urgent-actions.component.html',
  styleUrl: './urgent-actions.component.scss'
})
export class UrgentActionsComponent {
  navigateToTreatmentPlan = output<void>();

  onActionClick(action: any) {
    if (action.buttonText === 'Review') {
      this.navigateToTreatmentPlan.emit();
    }
  }

  actions = [
    {
      type: 'red',
      icon: 'pi-bell-slash',
      title: 'Eng. Karim delayed 20 minutes',
      subtitle: 'For session: Muscle measurements - 11:00 AM',
      badgeText: 'Urgent',
      badgeType: 'red',
      buttonText: 'Replace',
      buttonType: 'dark'
    },
    {
      type: 'yellow',
      icon: 'pi-clipboard',
      title: 'New Rehab Plan - R. Mostafa',
      subtitle: 'Pending Medical Protocol Review',
      badgeText: 'Pending',
      badgeType: 'yellow',
      buttonText: 'Review',
      buttonType: 'blue'
    },
    {
      type: 'blue',
      icon: 'pi-id-card',
      title: 'Measurements Session - K. Mahmoud',
      subtitle: 'Measurement Engineer not assigned yet',
      badgeText: 'Measur.',
      badgeType: 'dark-blue',
      buttonText: 'Assign',
      buttonType: 'blue'
    },
    {
      type: 'red',
      icon: 'pi-exclamation-triangle',
      title: 'Missed Session - S. Ali',
      subtitle: 'Patient did not attend 10:00 AM session',
      badgeText: 'Missed',
      badgeType: 'red',
      buttonText: 'Contact',
      buttonType: 'dark'
    },
    {
      type: 'yellow',
      icon: 'pi-file-edit',
      title: 'Update Progress - M. Hassan',
      subtitle: 'Weekly progress report is due today',
      badgeText: 'Report',
      badgeType: 'yellow',
      buttonText: 'Write',
      buttonType: 'blue'
    },
    {
      type: 'blue',
      icon: 'pi-calendar-plus',
      title: 'Reschedule Request - T. Omar',
      subtitle: 'Patient requested to change tomorrow\'s session',
      badgeText: 'Schedule',
      badgeType: 'dark-blue',
      buttonText: 'Manage',
      buttonType: 'blue'
    }
  ];
}
