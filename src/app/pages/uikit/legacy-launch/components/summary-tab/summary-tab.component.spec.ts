import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryTabComponent } from './summary-tab.component';
import { CardModule } from 'primeng/card';
import { By } from '@angular/platform-browser';

describe('SummaryTabComponent', () => {
  let component: SummaryTabComponent;
  let fixture: ComponentFixture<SummaryTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryTabComponent, CardModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render p-card components for stats and timeline', () => {
    const cards = fixture.debugElement.queryAll(By.css('p-card'));
    expect(cards.length).toBe(3);
  });

  it('should display bold black section titles', () => {
    const titles = fixture.debugElement.queryAll(By.css('.bold-black-section-title'));
    expect(titles.length).toBe(2);
    expect(titles[0].nativeElement.textContent).toContain('إحصائيات البرنامج الكاملة');
  });

  it('should render timeline items correctly', () => {
    const timelineItems = fixture.debugElement.queryAll(By.css('.pti'));
    expect(timelineItems.length).toBe(5);
  });

  it('should have accessibility attributes on cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('p-card'));
    cards.forEach(card => {
      expect(card.attributes['role']).toBe('region');
      expect(card.attributes['aria-label']).toBeTruthy();
    });
  });
});
