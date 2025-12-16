import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanCofigComponent } from './plan-cofig.component';

describe('PlanCofigComponent', () => {
  let component: PlanCofigComponent;
  let fixture: ComponentFixture<PlanCofigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanCofigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanCofigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
