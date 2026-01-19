import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementsConfigComponent } from './measurements-config.component';

describe('MeasurementsConfigComponent', () => {
  let component: MeasurementsConfigComponent;
  let fixture: ComponentFixture<MeasurementsConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementsConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeasurementsConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
