import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DAY_LABELS, RecurrenceFrequency, RecurrenceRule } from '../../models/notification-trigger.model';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-recurrence-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectButtonModule, InputNumberModule, DatePickerModule, RadioButtonModule],
  templateUrl: './recurrence-picker.component.html',
  styleUrl: './recurrence-picker.component.scss',
})
export class RecurrencePickerComponent {
  private _rule!: RecurrenceRule;

  // p-calendar binds to Date objects; the model stores plain strings so it
  // survives JSON round-trips cleanly. These signals cache the converted
  // Date values and are only recomputed when the @Input actually changes —
  // NOT on every template read. A getter that returns `new Date(...)` on
  // every change-detection pass looks harmless but is a real bug: PrimeNG's
  // calendar writes back through ngModelChange as it renders, Angular sees
  // a new object reference on the next check, re-renders, the getter fires
  // again, produces another new object, forever. That infinite CD loop is
  // what pegs the CPU and crashes the tab — most visible on the calendar's
  // open/icon click because that forces an extra render pass for the overlay.
  readonly timeAsDate = signal<Date>(new Date());
  readonly startDateAsDate = signal<Date>(new Date());
  readonly endDateAsDate = signal<Date | null>(null);

  @Input({ required: true })
  set rule(value: RecurrenceRule) {
    this._rule = value;
    this.timeAsDate.set(parseTime(value.time));
    this.startDateAsDate.set(new Date(value.startDate + 'T00:00:00'));
    this.endDateAsDate.set(value.endDate ? new Date(value.endDate + 'T00:00:00') : null);
  }
  get rule(): RecurrenceRule {
    return this._rule;
  }

  @Output() ruleChange = new EventEmitter<RecurrenceRule>();

  readonly frequencyOptions: { label: string; value: RecurrenceFrequency }[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
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

  setEndMode(mode: RecurrenceRule['endMode']): void {
    this.emit({ endMode: mode });
  }

  setOccurrenceCount(n: number): void {
    this.emit({ occurrenceCount: Math.max(1, n || 1) });
  }

  setTimeFromDate(d: Date): void {
    if (!d) return;
    const hh = `${d.getHours()}`.padStart(2, '0');
    const mm = `${d.getMinutes()}`.padStart(2, '0');
    this.emit({ time: `${hh}:${mm}` });
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
    if (this.rule.frequency === 'daily') return this.rule.interval === 1 ? 'day' : 'days';
    if (this.rule.frequency === 'weekly') return this.rule.interval === 1 ? 'week' : 'weeks';
    return this.rule.interval === 1 ? 'month' : 'months';
  }
}

function parseTime(time: string): Date {
  const [hh, mm] = (time || '09:00').split(':').map((v) => parseInt(v, 10) || 0);
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
