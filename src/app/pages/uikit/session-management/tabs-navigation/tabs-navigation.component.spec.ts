import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsNavigationComponent } from './tabs-navigation.component';

describe('TabsNavigationComponent', () => {
  let component: TabsNavigationComponent;
  let fixture: ComponentFixture<TabsNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsNavigationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabsNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
