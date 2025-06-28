import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
@Component({
  selector: 'app-working-hours',
  imports: [AccordionModule],
  standalone: true,
  templateUrl: './working-hours.component.html',
  styleUrl: './working-hours.component.scss'
})
export class WorkingHoursComponent {
  daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];
}
