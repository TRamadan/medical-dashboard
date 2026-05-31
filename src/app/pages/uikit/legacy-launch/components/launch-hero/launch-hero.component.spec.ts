import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaunchHeroComponent } from './launch-hero.component';
import { CardModule } from 'primeng/card';
import { By } from '@angular/platform-browser';

describe('LaunchHeroComponent', () => {
  let component: LaunchHeroComponent;
  let fixture: ComponentFixture<LaunchHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaunchHeroComponent, CardModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LaunchHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render p-card component', () => {
    const card = fixture.debugElement.query(By.css('p-card'));
    expect(card).toBeTruthy();
    expect(card.attributes['styleClass']).toContain('grad-hero-card');
  });

  it('should display the bold black section title', () => {
    const title = fixture.debugElement.query(By.css('.bold-black-section-title'));
    expect(title).toBeTruthy();
    expect(title.nativeElement.textContent).toContain('Legacy Launch');
  });

  it('should have accessibility attributes', () => {
    const card = fixture.debugElement.query(By.css('p-card'));
    expect(card.attributes['role']).toBe('region');
    expect(card.attributes['aria-label']).toBe('Legacy Launch Hero');
  });

  it('should render stats correctly', () => {
    const stats = fixture.debugElement.queryAll(By.css('.gs-val'));
    expect(stats.length).toBe(4);
    expect(stats[0].nativeElement.textContent).toContain('٣٦');
  });
});
