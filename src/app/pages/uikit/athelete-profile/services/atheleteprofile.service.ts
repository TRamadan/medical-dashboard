import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  AthleteSummary,
  OverviewData,
  InjuryHistoryData,
  ProgramPlanData,
  MeasurementsData,
  SessionLogData,
  SurveysData,
  InteractionNotePayload,
  InteractionNote,
  RecordMeasurementsPayload,
  SubmitSurveyPayload,
} from '../models/athlete-profile.models';

@Injectable({ providedIn: 'root' })
export class AtheleteprofileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl + 'AthleteProfile';

  // ── Envelope helper ─────────────────────────────────────────────────────────
  private unwrap<T>(obs: Observable<{ data: T }>): Observable<T> {
    return obs.pipe(map(res => res.data));
  }

  // ── Summary (Header + KPIs + Sidebar) ───────────────────────────────────────
  getSummary(patientId: number): Observable<AthleteSummary> {
    return this.unwrap(this.http.get<{ data: AthleteSummary }>(`${this.baseUrl}/${patientId}`));
  }

  // ── Tab 1 — Overview ────────────────────────────────────────────────────────
  getOverview(patientId: number): Observable<OverviewData> {
    return this.unwrap(this.http.get<{ data: OverviewData }>(`${this.baseUrl}/${patientId}/overview`));
  }

  // ── Tab 2 — Injury & History ────────────────────────────────────────────────
  getInjuryHistory(patientId: number): Observable<InjuryHistoryData> {
    return this.unwrap(this.http.get<{ data: InjuryHistoryData }>(`${this.baseUrl}/${patientId}/injury-history`));
  }

  // ── Tab 3 — Program & Plan (404 when no plan) ───────────────────────────────
  getProgramPlan(patientId: number): Observable<ProgramPlanData> {
    return this.unwrap(this.http.get<{ data: ProgramPlanData }>(`${this.baseUrl}/${patientId}/plan`));
  }

  // ── Tab 4 — Measurements & Data ─────────────────────────────────────────────
  getMeasurements(patientId: number): Observable<MeasurementsData> {
    return this.unwrap(this.http.get<{ data: MeasurementsData }>(`${this.baseUrl}/${patientId}/measurements`));
  }

  // ── Tab 5 — Session Log ──────────────────────────────────────────────────────
  getSessions(patientId: number, take?: number): Observable<SessionLogData> {
    const url = take != null
      ? `${this.baseUrl}/${patientId}/sessions?take=${take}`
      : `${this.baseUrl}/${patientId}/sessions`;
    return this.unwrap(this.http.get<{ data: SessionLogData }>(url));
  }

  // ── Tab 6 — Surveys ──────────────────────────────────────────────────────────
  getSurveys(patientId: number): Observable<SurveysData> {
    return this.unwrap(this.http.get<{ data: SurveysData }>(`${this.baseUrl}/${patientId}/surveys`));
  }

  // ── Write: Interaction Note ───────────────────────────────────────────────────
  saveInteractionNote(patientId: number, payload: InteractionNotePayload): Observable<InteractionNote> {
    return this.unwrap(this.http.put<{ data: InteractionNote }>(`${this.baseUrl}/${patientId}/interaction-note`, payload));
  }

  // ── Write: Record Measurements ────────────────────────────────────────────────
  recordMeasurements(patientId: number, payload: RecordMeasurementsPayload): Observable<boolean> {
    return this.unwrap(this.http.post<{ data: boolean }>(`${this.baseUrl}/${patientId}/measurements`, payload));
  }

  // ── Write: Submit Survey ──────────────────────────────────────────────────────
  submitSurvey(patientId: number, payload: SubmitSurveyPayload): Observable<number> {
    return this.unwrap(this.http.post<{ data: number }>(`${this.baseUrl}/${patientId}/surveys`, payload));
  }
}
