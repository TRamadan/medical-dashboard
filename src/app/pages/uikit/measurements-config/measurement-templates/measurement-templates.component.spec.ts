import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementTemplatesComponent } from './measurement-templates.component';

describe('MeasurementTemplatesComponent', () => {
  let component: MeasurementTemplatesComponent;
  let fixture: ComponentFixture<MeasurementTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementTemplatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeasurementTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
