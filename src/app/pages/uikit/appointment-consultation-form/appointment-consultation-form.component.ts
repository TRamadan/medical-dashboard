import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-appointment-consultation-form',
  imports: [],
  templateUrl: './appointment-consultation-form.component.html',
  styleUrl: './appointment-consultation-form.component.scss'
})
export class AppointmentConsultationFormComponent implements OnInit {
  displayCompletePatientInfoDialog: boolean = false;
  ngOnInit(): void {
    this.displayCompletePatientInfoDialog = true;
  }
  hideCompletePatientInfoDialog(): void {
    this.displayCompletePatientInfoDialog = false;
  }
}
