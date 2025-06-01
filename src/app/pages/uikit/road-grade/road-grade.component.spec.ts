/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RoadGradeComponent } from './road-grade.component';

describe('RoadGradeComponent', () => {
  let component: RoadGradeComponent;
  let fixture: ComponentFixture<RoadGradeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoadGradeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoadGradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
