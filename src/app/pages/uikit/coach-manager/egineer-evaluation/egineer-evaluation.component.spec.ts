import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EgineerEvaluationComponent } from './egineer-evaluation.component';

describe('EgineerEvaluationComponent', () => {
  let component: EgineerEvaluationComponent;
  let fixture: ComponentFixture<EgineerEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EgineerEvaluationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EgineerEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
