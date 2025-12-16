import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhasesSessionsComponent } from './phases-sessions.component';

describe('PhasesSessionsComponent', () => {
  let component: PhasesSessionsComponent;
  let fixture: ComponentFixture<PhasesSessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhasesSessionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhasesSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
