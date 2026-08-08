import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuscleSkeletonViewerComponent } from './muscle-skeleton-viewer.component';

describe('MuscleSkeletonViewerComponent', () => {
  let component: MuscleSkeletonViewerComponent;
  let fixture: ComponentFixture<MuscleSkeletonViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuscleSkeletonViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuscleSkeletonViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
