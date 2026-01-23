import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMeasurementTemplateComponent } from './view-measurement-template.component';

describe('ViewMeasurementTemplateComponent', () => {
  let component: ViewMeasurementTemplateComponent;
  let fixture: ComponentFixture<ViewMeasurementTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMeasurementTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMeasurementTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
