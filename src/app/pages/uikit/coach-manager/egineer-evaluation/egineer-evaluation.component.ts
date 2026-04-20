import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';

interface Metrics {
  communication: number;
  execution: number;
  professionalDev: number;
  punctuality: number;
}

interface Evaluation {
  id: number;
  initials: string;
  name: string;
  role: string;
  score: number;
  status: string;
  statusBg: string;
  statusText: string;
  statusBorder: string;
  color: string;
  avatarBg: string;
  avatarText: string;
  avatarBorder: string;
  cardBorder: string;
  metrics: Metrics;
  strengths: string;
  improvements: string;
}

@Component({
  selector: 'app-engineer-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule, SliderModule, TextareaModule, DatePickerModule],
  templateUrl: './egineer-evaluation.component.html',
  styleUrl: './egineer-evaluation.component.scss'
})
export class EngineerEvaluationComponent {

  /** Current-week date range: [Monday, Sunday] */
  weekDates: Date[] = this.currentWeekRange();

  evaluations: Evaluation[] = [
    {
      id: 1,
      initials: 'KM',
      name: 'Eng. Karim Mostafa',
      role: 'Junior • Recharger Station',
      score: 2.8,
      status: '⚠ 3 weeks under 3.0',
      statusBg: '#fef2f2',
      statusText: '#dc2626',
      statusBorder: '#fecaca',
      color: '#f59e0b',
      avatarBg: '#fef2f2',
      avatarText: '#dc2626',
      avatarBorder: '#fecaca',
      cardBorder: '#fee2e2',
      metrics: { communication: 0, execution: 0, professionalDev: 0, punctuality: 0 },
      strengths: 'Showed interest in learning new VBT techniques this week.',
      improvements: "Delaying session starts is still a recurring issue. Discussed in Monday's session."
    },
    {
      id: 2,
      initials: 'SM',
      name: 'Eng. Sarah Mohamed',
      role: 'Senior • Resilience Station',
      score: 4.5,
      status: 'Excellent Performance ✓',
      statusBg: '#f0fdf4',
      statusText: '#16a34a',
      statusBorder: '#bbf7d0',
      color: '#10b981',
      avatarBg: '#f0fdf4',
      avatarText: '#16a34a',
      avatarBorder: '#bbf7d0',
      cardBorder: '#d1fae5',
      metrics: { communication: 0, execution: 0, professionalDev: 0, punctuality: 0 },
      strengths: 'Her initiative in group sessions was exceptional. Motivation level in Calibration Report 3.4.',
      improvements: 'Documentation sharing in the RPE system could be faster.'
    },
    {
      id: 3,
      initials: 'AA',
      name: 'Eng. Ali Ahmed',
      role: 'Junior • Apex Station',
      score: 3.5,
      status: 'Noticeable Improvement ↑',
      statusBg: '#fffbeb',
      statusText: '#d97706',
      statusBorder: '#fde68a',
      color: '#f59e0b',
      avatarBg: '#fffbeb',
      avatarText: '#d97706',
      avatarBorder: '#fde68a',
      cardBorder: '#fef3c7',
      metrics: { communication: 0, execution: 0, professionalDev: 0, punctuality: 0 },
      strengths: 'Clear improvement in reading phase three protocols.',
      improvements: 'Building trust with athletes - seems overly cautious in instructions.'
    }
  ];

  /** Type-safe handler for p-slider (onChange) — $event.value is number | undefined */
  updateMetric(ev: Evaluation, key: keyof Metrics, value: number | undefined): void {
    ev.metrics[key] = value ?? 0;
  }

  private currentWeekRange(): Date[] {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday
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
