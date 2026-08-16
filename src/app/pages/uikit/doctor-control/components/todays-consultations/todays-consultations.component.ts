import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { SlicePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import {
  TodaysConsultationsService,
  CalendarDay,
  NextTwoWeeksItem,
  CalendarSlot,
} from './todays-consultations.service';

// Indicator colour coming from the API → CSS hex
const INDICATOR_COLORS: Record<string, string> = {
  yellow: '#f59e0b',
  green: '#10b981',
  red: '#ef4444',
  blue: '#38bdf8',
  gray: '#94a3b8',
};

function indicatorColor(indicator: string): string {
  return INDICATOR_COLORS[indicator?.toLowerCase()] ?? '#94a3b8';
}

@Component({
  selector: 'app-dc-todays-consultations',
  imports: [SlicePipe, CardModule, ButtonModule],
  templateUrl: './todays-consultations.component.html',
  styleUrl: './todays-consultations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodaysConsultationsComponent implements OnInit {
  private readonly service = inject(TodaysConsultationsService);

  // ── State ─────────────────────────────────────────────────────────

  loading = signal(true);
  error = signal<string | null>(null);

  /** The weekStart ISO date string (YYYY-MM-DD) for the *current* API call (null = current week). */
  private currentWeekStart = signal<string | null>(null);

  /** weekStart / weekEnd strings returned by the last successful API call */
  weekStart = signal<string>('');
  weekEnd = signal<string>('');

  days = signal<CalendarDay[]>([]);
  nextTwoWeeks = signal<NextTwoWeeksItem[]>([]);

  // ── Derived ───────────────────────────────────────────────────────

  /** Header label: "Aug 14 – Aug 20" derived from API dates */
  readonly weekRangeLabel = computed(() => {
    const start = this.weekStart();
    const end = this.weekEnd();
    if (!start || !end) return '';
    return `${this.formatDate(start)} – ${this.formatDate(end)}`;
  });

  /** Max slots across all days, used to drive slot-row iteration */
  readonly maxSlots = computed(() =>
    Math.max(0, ...this.days().map(d => d.slots.length))
  );

  readonly slotIndices = computed(() =>
    Array.from({ length: this.maxSlots() }, (_, i) => i)
  );

  /** true when we are already at the earliest navigable week */
  readonly isFirstWeek = computed(() => this.currentWeekStart() === null);

  // ── Lifecycle ─────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadCalendar();
  }

  // ── Navigation ────────────────────────────────────────────────────

  prevWeek(): void {
    const start = this.weekStart();
    if (!start) return;
    const prevStart = this.addDays(start, -7);
    this.currentWeekStart.set(prevStart);
    this.loadCalendar();
  }

  nextWeek(): void {
    const end = this.weekEnd();
    if (!end) return;
    const nextStart = this.addDays(end, 1);
    this.currentWeekStart.set(nextStart);
    this.loadCalendar();
  }

  // ── Data helpers ──────────────────────────────────────────────────

  slotColor(slot: CalendarSlot): string {
    return indicatorColor(slot.indicator);
  }

  // ── Private ───────────────────────────────────────────────────────

  private loadCalendar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service
      .getCalendar(this.currentWeekStart())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.weekStart.set(data.weekStart);
          this.weekEnd.set(data.weekEnd);
          this.days.set(data.days ?? []);
          this.nextTwoWeeks.set(data.nextTwoWeeks ?? []);
        },
        error: () => {
          this.error.set('Failed to load calendar. Please try again.');
        },
      });
  }

  /**  "2026-08-09" → "Aug 9" */
  private formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /** Add `days` to an ISO date string and return the new ISO date string. */
  private addDays(iso: string, days: number): string {
    const d = new Date(iso);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
}
