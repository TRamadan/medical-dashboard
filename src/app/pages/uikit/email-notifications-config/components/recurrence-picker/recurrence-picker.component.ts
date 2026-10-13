import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker';
import { DAY_LABELS, EndType, RecurrenceFrequency, RecurrenceRule } from '../../models/notification-trigger.model';

@Component({
  selector: 'app-recurrence-picker',
  imports: [CommonModule, FormsModule, SelectButtonModule, InputNumberModule, DatePickerModule, RadioButtonModule],
  templateUrl: './recurrence-picker.component.html',
  styleUrl: './recurrence-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecurrencePickerComponent {
  private _rule!: RecurrenceRule;

  readonly timeAsDate = signal<Date | null>(null);
  readonly startDateAsDate = signal<Date | null>(null);
  readonly endDateAsDate = signal<Date | null>(null);

  @Input({ required: true })
  set rule(value: RecurrenceRule) {
    this._rule = value;
    // Only reflect values that the user has explicitly set (not defaults)
    this.timeAsDate.set(value.time ? parseTime(value.time) : null);
    this.startDateAsDate.set(value.startDate ? new Date(value.startDate + 'T00:00:00') : null);
    this.endDateAsDate.set(value.endDate ? new Date(value.endDate + 'T00:00:00') : null);
  }
  get rule(): RecurrenceRule {
    return this._rule;
  }

  @Output() ruleChange = new EventEmitter<RecurrenceRule>();

  readonly frequencyOptions: { label: string; value: RecurrenceFrequency }[] = [
    { label: 'Daily', value: 1 },
    { label: 'Weekly', value: 2 },
    { label: 'Monthly', value: 3 },
  ];

  readonly dayOptions = DAY_LABELS.map((d) => ({ label: d.short, value: d.value, title: d.full }));

  private emit(changes: Partial<RecurrenceRule>): void {
    this.ruleChange.emit({ ...this.rule, ...changes });
  }

  setFrequency(frequency: RecurrenceFrequency): void {
    this.emit({ frequency });
  }

  setInterval(n: number): void {
    this.emit({ interval: Math.max(1, n || 1) });
  }

  setDaysOfWeek(days: number[]): void {
    this.emit({ daysOfWeek: days ?? [] });
  }

  setDayOfMonth(n: number): void {
    this.emit({ dayOfMonth: Math.min(31, Math.max(1, n || 1)) });
  }

  setEndMode(mode: EndType): void {
    this.emit({ endMode: mode });
  }

  setOccurrenceCount(n: number): void {
    this.emit({ occurrenceCount: Math.max(1, n || 1) });
  }

  setTimeFromDate(d: Date): void {
    if (!d) return;
    const hh = `${d.getHours()}`.padStart(2, '0');
    const mm = `${d.getMinutes()}`.padStart(2, '0');
    const ss = `${d.getSeconds()}`.padStart(2, '0');
    this.emit({ time: `${hh}:${mm}:${ss}` });
  }

  setStartDateFromDate(d: Date): void {
    if (!d) return;
    this.emit({ startDate: toIsoDate(d) });
  }

  setEndDateFromDate(d: Date): void {
    if (!d) return;
    this.emit({ endDate: toIsoDate(d) });
  }

  get intervalUnitLabel(): string {
    const freq = this.rule?.frequency;
    const interval = this.rule?.interval;
    if (!freq || !interval) return '';
    if (freq === 1) return interval === 1 ? 'day' : 'days';
    if (freq === 2) return interval === 1 ? 'week' : 'weeks';
    return interval === 1 ? 'month' : 'months';
  }
}

function parseTime(time: string): Date {
  const [hh, mm] = (time || '08:00:00').split(':').map((v) => parseInt(v, 10) || 0);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

