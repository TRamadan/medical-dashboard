import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachAssignmentComponent } from './coach-assignment.component';

describe('CoachAssignmentComponent', () => {
  let component: CoachAssignmentComponent;
  let fixture: ComponentFixture<CoachAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachAssignmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoachAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
