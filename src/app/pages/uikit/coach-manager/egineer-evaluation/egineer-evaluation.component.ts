import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { WeeklyEvaluationComponent } from './components/weekly-evaluation/weekly-evaluation.component';
import { CumulativePreferenceComponent } from './components/cumulative-preference/cumulative-preference.component';
import { AthleteVoiceComponent } from './components/athlete-voice/athlete-voice.component';

type TabId = 'weekly' | 'cumulative' | 'athlete';

@Component({
  selector: 'app-engineer-evaluation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePickerModule,
    WeeklyEvaluationComponent,
    CumulativePreferenceComponent,
    AthleteVoiceComponent
  ],
  templateUrl: './egineer-evaluation.component.html',
  styleUrl: './egineer-evaluation.component.scss'
})
export class EngineerEvaluationComponent {

  activeTab: TabId = 'weekly';

  /** Current-week date range: [Monday, Sunday] */
  weekDates: Date[] = this.currentWeekRange();

  selectTab(tab: TabId): void {
    this.activeTab = tab;
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
