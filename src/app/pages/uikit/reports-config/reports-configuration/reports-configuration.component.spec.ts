import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsConfigurationComponent } from './reports-configuration.component';

describe('ReportsConfigurationComponent', () => {
  let component: ReportsConfigurationComponent;
  let fixture: ComponentFixture<ReportsConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
