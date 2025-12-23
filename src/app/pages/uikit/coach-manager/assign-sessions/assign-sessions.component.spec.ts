import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignSessionsComponent } from './assign-sessions.component';

describe('AssignSessionsComponent', () => {
  let component: AssignSessionsComponent;
  let fixture: ComponentFixture<AssignSessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignSessionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
