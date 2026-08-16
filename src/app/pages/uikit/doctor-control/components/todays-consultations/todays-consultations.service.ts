import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';

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

// ── Service ───────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class TodaysConsultationsService {
  private readonly BASE_URL = environment.apiUrl + 'DoctorDashboard/calendar';
  private readonly http = inject(HttpClient);

  /**
   * Fetches the weekly calendar.
   * @param weekStart Optional ISO date string (YYYY-MM-DD) for the first day of
   *                  the week to display. Omit or pass null for the current week.
   */
  getCalendar(weekStart?: string | null) {
    const params = weekStart
      ? new HttpParams().set('weekStart', weekStart)
      : undefined;

    return this.http.get<CalendarResponse>(this.BASE_URL, { params });
  }
}
