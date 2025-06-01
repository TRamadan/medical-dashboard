/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GovernorateComponent } from './Governorate.component';

describe('GovernorateComponent', () => {
  let component: GovernorateComponent;
  let fixture: ComponentFixture<GovernorateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GovernorateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GovernorateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
