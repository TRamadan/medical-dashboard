import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseProtocolComponent } from './exercise-protocol.component';

describe('ExerciseProtocolComponent', () => {
  let component: ExerciseProtocolComponent;
  let fixture: ComponentFixture<ExerciseProtocolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseProtocolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseProtocolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
