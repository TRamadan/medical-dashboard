import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientreportComponent } from './patientreport.component';

describe('PatientreportComponent', () => {
  let component: PatientreportComponent;
  let fixture: ComponentFixture<PatientreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
