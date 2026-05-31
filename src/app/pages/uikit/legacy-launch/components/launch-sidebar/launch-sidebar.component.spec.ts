import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaunchSidebarComponent } from './launch-sidebar.component';
import { CardModule } from 'primeng/card';
import { By } from '@angular/platform-browser';

describe('LaunchSidebarComponent', () => {
  let component: LaunchSidebarComponent;
  let fixture: ComponentFixture<LaunchSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaunchSidebarComponent, CardModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LaunchSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render multiple p-card components for each section', () => {
    const cards = fixture.debugElement.queryAll(By.css('p-card'));
    expect(cards.length).toBe(5);
  });

  it('should display bold black section titles before cards', () => {
    const titles = fixture.debugElement.queryAll(By.css('.bold-black-section-title'));
    expect(titles.length).toBe(5);
    expect(titles[0].nativeElement.textContent).toContain('حالة التكت');
    expect(titles[1].nativeElement.textContent).toContain('معايير التخرج');
  });

  it('should have accessibility attributes on cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('p-card'));
    cards.forEach(card => {
      expect(card.attributes['role']).toBe('region');
      expect(card.attributes['aria-label']).toBeTruthy();
    });
  });

  it('should render criteria list correctly', () => {
    const items = fixture.debugElement.queryAll(By.css('.criteria-item'));
    expect(items.length).toBe(5);
  });
});
