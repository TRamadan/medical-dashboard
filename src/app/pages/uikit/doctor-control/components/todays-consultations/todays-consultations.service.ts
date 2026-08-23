import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

// ── API response shapes ────────────────────────────────────────────────

export interface CalendarSlot {
  appointmentId: number;
  patientName: string;
  time: string;
  indicator: string; // 'yellow' | 'green' | 'gray'
}

export interface CalendarDay {
  date: string;        // e.g. "2026-08-09"
  dayOfWeek: string;   // e.g. "SUNDAY"
  dayNumber: number;
  slots: CalendarSlot[];
}

export interface NextTwoWeeksItem {
  appointmentId: number;
  patientName: string;
  service: string;
  description: string;
  date: string;        // e.g. "17/8" or "Today"
}

export interface CalendarResponse {
  weekStart: string;  // YYYY-MM-DD
  weekEnd: string;    // YYYY-MM-DD
  days: CalendarDay[];
  nextTwoWeeks: NextTwoWeeksItem[];
}

interface CalendarJsonRoot {
  [weekKey: string]: CalendarResponse;
}

// ── Service ───────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class TodaysConsultationsService {
  private readonly http = inject(HttpClient);

  /**
   * Fetches the weekly calendar from the local JSON asset.
   * @param weekStart Optional ISO date string (YYYY-MM-DD) used to look up a
   *                  specific week scenario in the JSON. Omit for the first
   *                  (default) week.
   */
  getCalendar(weekStart?: string | null) {
    return this.http.get<CalendarJsonRoot>('/assets/calendar.json').pipe(
      map(json => {
        const weeks = Object.values(json);
        if (!weeks.length) {
          return { weekStart: '', weekEnd: '', days: [], nextTwoWeeks: [] } as CalendarResponse;
        }

        // If a weekStart was requested, try to find a matching scenario.
        if (weekStart) {
          const match = weeks.find(w => w.weekStart === weekStart);
          if (match) return match;
        }

        // Otherwise return the first scenario (primary / current week).
        return weeks[0];
      })
    );
  }
}
