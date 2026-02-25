/* tslint:disable:no-unused-variable */
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CuttingEdgeTechnologyComponent } from './cutting-edge-technology.component';

describe('CuttingEdgeTechnologyComponent', () => {
  let component: CuttingEdgeTechnologyComponent;
  let fixture: ComponentFixture<CuttingEdgeTechnologyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CuttingEdgeTechnologyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuttingEdgeTechnologyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
