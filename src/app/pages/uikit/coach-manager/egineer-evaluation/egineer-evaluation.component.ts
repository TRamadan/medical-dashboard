import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { WeeklyEvaluationComponent } from './components/weekly-evaluation/weekly-evaluation.component';
import { CumulativePreferenceComponent } from './components/cumulative-preference/cumulative-preference.component';
import { AthleteVoiceComponent } from './components/athlete-voice/athlete-voice.component';

type TabId = 'weekly' | 'cumulative' | 'athlete';

@Component({
  selector: 'app-engineer-evaluation',
  imports: [
    CommonModule,
    FormsModule,
    DatePickerModule,
    WeeklyEvaluationComponent,
    CumulativePreferenceComponent,
    AthleteVoiceComponent
  ],
  templateUrl: './egineer-evaluation.component.html',
  styleUrl: './egineer-evaluation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EngineerEvaluationComponent {

  readonly activeTab = signal<TabId>('weekly');
  readonly weekDates = signal<Date[]>(this.currentWeekRange());

  /** Formatted start date as YYYY-MM-DD */
  readonly weekStartStr = computed<string>(() => {
    const dates = this.weekDates();
    if (!dates || dates.length === 0 || !dates[0]) return '';
    return this.formatDate(dates[0]);
  });

  /** Formatted end date as YYYY-MM-DD */
  readonly weekEndStr = computed<string>(() => {
    const dates = this.weekDates();
    if (!dates || dates.length < 2 || !dates[1]) {
      return this.weekStartStr();
    }
    return this.formatDate(dates[1]);
  });

  selectTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  onWeekDatesChange(dates: Date[]): void {
    this.weekDates.set(dates || []);
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private currentWeekRange(): Date[] {
    const today = new Date();
    const day = today.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(0, 0, 0, 0);
    return [monday, sunday];
  }
}
