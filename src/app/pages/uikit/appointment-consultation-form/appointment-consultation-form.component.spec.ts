import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentConsultationFormComponent } from './appointment-consultation-form.component';

describe('AppointmentConsultationFormComponent', () => {
  let component: AppointmentConsultationFormComponent;
  let fixture: ComponentFixture<AppointmentConsultationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentConsultationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentConsultationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
