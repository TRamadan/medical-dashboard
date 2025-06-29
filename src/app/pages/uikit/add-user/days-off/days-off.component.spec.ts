import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaysOffComponent } from './days-off.component';

describe('DaysOffComponent', () => {
  let component: DaysOffComponent;
  let fixture: ComponentFixture<DaysOffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaysOffComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DaysOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
