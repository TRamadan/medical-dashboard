import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointments-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments-details.component.html',
  styleUrl: './appointments-details.component.scss'
})
export class AppointmentsDetailsComponent {
  @Input() appointment: any;
}
