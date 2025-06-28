import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedServicesComponent } from './assigned-services.component';

describe('AssignedServicesComponent', () => {
  let component: AssignedServicesComponent;
  let fixture: ComponentFixture<AssignedServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
