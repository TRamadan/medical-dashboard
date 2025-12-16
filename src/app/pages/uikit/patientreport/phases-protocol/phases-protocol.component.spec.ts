import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhasesProtocolComponent } from './phases-protocol.component';

describe('PhasesProtocolComponent', () => {
  let component: PhasesProtocolComponent;
  let fixture: ComponentFixture<PhasesProtocolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhasesProtocolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhasesProtocolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
