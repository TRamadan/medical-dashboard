import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuscleSkeletonBuilderComponent } from './muscle-skeleton-builder.component';

describe('MuscleSkeletonBuilderComponent', () => {
  let component: MuscleSkeletonBuilderComponent;
  let fixture: ComponentFixture<MuscleSkeletonBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuscleSkeletonBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuscleSkeletonBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
