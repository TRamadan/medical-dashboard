import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsConfigComponent } from './reports-config.component';

describe('ReportsConfigComponent', () => {
  let component: ReportsConfigComponent;
  let fixture: ComponentFixture<ReportsConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
