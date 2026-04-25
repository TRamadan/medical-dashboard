import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayOverallComponent } from './day-overall.component';

describe('DayOverallComponent', () => {
  let component: DayOverallComponent;
  let fixture: ComponentFixture<DayOverallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayOverallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayOverallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
