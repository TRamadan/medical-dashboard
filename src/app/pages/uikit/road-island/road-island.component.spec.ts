/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RoadIslandComponent } from './road-island.component';

describe('RoadIslandComponent', () => {
  let component: RoadIslandComponent;
  let fixture: ComponentFixture<RoadIslandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoadIslandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoadIslandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
