import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementCategoriesComponent } from './measurement-categories.component';

describe('MeasurementCategoriesComponent', () => {
  let component: MeasurementCategoriesComponent;
  let fixture: ComponentFixture<MeasurementCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeasurementCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
