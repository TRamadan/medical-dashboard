import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../auth/services/auth.service';

// NOTE: hard-coded to match the guide (tariqMDfile.md). Swap for an
// `environment.apiUrl` import if this project already centralizes the API
// base URL the way ServicesService / PatientFormService do.
const API_BASE = environment.apiUrl;

// ── Shared row shapes ───────────────────────────────────────────────────────
export interface ConsultationProcedureDto {
  id: number | null;      // null = insert, existing id = update, omitted = delete
  procedureName: string;
  result: string;
  order: number;
}

export interface ConsultationPlanPhaseDto {
  id: number | null;      // same smart-merge rule as procedures
  phaseName: string;
  goal: string;
  transitionCriteria: string;
  sessions: number;
  order: number;
}

export interface ConsultationExternalReferralDto {
  status: number; // ReferralStatus 0–5, read-only/server-managed
}

export interface ConsultationDecisionDto {
  id?: number;
  decisionType: number; // 0 Direct Blueprint, 1 External Referral, 2 Internal Measurements
  notes: string;
  externalReferral?: ConsultationExternalReferralDto | null;
}

// ── GET /ConsultationSession/{appointmentId} ────────────────────────────────
export interface ConsultationSessionDto {
  id: number;
  appointmentId: number;
  isCompleted: boolean;
  currentStep: number; // 1–6

  // Step 1 — Examination
  complaintInAthleteWords: string | null;
  impactOnTraining: number | null;
  impactOnCompetition: number | null;
  impactOnDailyLife: number | null;
  additionalImpactComment: string | null;
  complaintStartDate: string | null;
  daysSinceOnset: number | null; // read-only, server-calculated
  whatAggravatesPain: string | null;

  // Step 2 — Assessment
  procedures: ConsultationProcedureDto[] | null;
  vASPain: number | null;
  effusion: number | null;
  asymmetryPercent: number | null;

  // Step 3 — Diagnosis (Findings + Behavioural Signals + Judgment)
  dysfunctionsAndRiskFactors: string | null;
  strengthsObserved: string | null;
  weaknessesObserved: string | null;
  notesAndGeneralImpression: string | null;
  yellowFlags: number | null;      // bitmask
  yellowFlagScore: number | null;  // read-only count, 0–5
  emotionalTrigger: string | null;
  experienceWithOtherProviders: string | null;
  expectationsAndFears: string | null;
  complianceIndex: number | null;
  personaClassification: number | null;
  purchaseInfluencer: number | null;
  additionalBehavioralNotes: string | null;
  judgmentType: number | null; // 0 WriteReport, 1 ExtraAssessment
  generalOpinion: string | null;
  diagnosisText: string | null;
  injuryGrade: number | null;
  injuryPhase: number | null;
  clinicalNotes: string | null;
  therapeuticGoal: string | null;
  expectedDuration: string | null;
  therapeuticGoalType: number | null;

  // Step 4 — Athlete Report (skipped when judgmentType = 1)
  recommendedServiceId: number | null;
  recommendedServiceName: string | null;
  priorityLevel: number | null;
  programDuration: string | null;
  planPhases: ConsultationPlanPhaseDto[] | null;
  sportsRecommendations: string | null;
  teamNotes: string | null;

  // Step 5 — Decision
  decision: ConsultationDecisionDto | null;
}

// ── PUT payload shapes ──────────────────────────────────────────────────────
export interface ConsultationStep1Payload {
  complaintInAthleteWords: string;
  impactOnTraining: number;
  impactOnCompetition: number;
  impactOnDailyLife: number;
  additionalImpactComment: string;
  complaintStartDate: string;
  whatAggravatesPain: string;
  // daysSinceOnset is read-only — never sent
}

export interface ConsultationStep2Payload {
  procedures: ConsultationProcedureDto[];
  vASPain: number | null;
  effusion: number;
  asymmetryPercent: number | null;
}

export interface ConsultationStep3Payload {
  dysfunctionsAndRiskFactors: string;
  strengthsObserved: string;
  weaknessesObserved: string;
  notesAndGeneralImpression: string;
  yellowFlags: number;

  emotionalTrigger: string;
  experienceWithOtherProviders: string;
  expectationsAndFears: string;
  complianceIndex: number;
  personaClassification: number;
  purchaseInfluencer: number;
  additionalBehavioralNotes: string;

  judgmentType: number;

  generalOpinion: string | null;
  diagnosisText: string | null;
  injuryGrade: number;
  injuryPhase: number;
  clinicalNotes: string;
  therapeuticGoal: string | null;
  expectedDuration: string;
  therapeuticGoalType: number;
}

export interface ConsultationStep4Payload {
  recommendedServiceId: number | null;
  priorityLevel: number;
  programDuration: string;
  planPhases: ConsultationPlanPhaseDto[];
  sportsRecommendations: string;
  teamNotes: string;
}

export interface ConsultationCompletePayload {
  decisionType: number; // 0 Direct Blueprint, 1 External Referral, 2 Internal Measurements
  notes: string;
  referralSpecialty?: string;   // required when decisionType = 1
  referralDescription?: string; // required when decisionType = 1
  referralNeedFollowUp?: boolean;
}

export interface ConsultationApiErrorResponse {
  errors: { errorEn: string; errorAr: string }[];
}

@Injectable({ providedIn: 'root' })
export class ConsultationSessionService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken() ?? localStorage.getItem('access_token') ?? '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /** Loads (or resumes) the session for an appointment. `id: 0` = not started yet — not an error. */
  getSession(appointmentId: number): Observable<ConsultationSessionDto> {
    return this.http.get<ConsultationSessionDto>(`${API_BASE}ConsultationSession/${appointmentId}`, { headers: this.getHeaders() });
  }

  saveStep1(appointmentId: number, payload: ConsultationStep1Payload): Observable<void> {
    return this.http.put<void>(`${API_BASE}ConsultationSession/${appointmentId}/step/1`, payload, { headers: this.getHeaders() });
  }

  saveStep2(appointmentId: number, payload: ConsultationStep2Payload): Observable<void> {
    return this.http.put<void>(`${API_BASE}ConsultationSession/${appointmentId}/step/2`, payload, { headers: this.getHeaders() });
  }

  /** Combined Impression & Findings + Judgment payload. Server sets currentStep=5 when judgmentType=1 (skips Athlete Report). */
  saveStep3(appointmentId: number, payload: ConsultationStep3Payload): Observable<void> {
    return this.http.put<void>(`${API_BASE}ConsultationSession/${appointmentId}/step/3`, payload, { headers: this.getHeaders() });
  }

  /** Only call when judgmentType = 0 (WriteReport). */
  saveStep4(appointmentId: number, payload: ConsultationStep4Payload): Observable<void> {
    return this.http.put<void>(`${API_BASE}ConsultationSession/${appointmentId}/step/4`, payload, { headers: this.getHeaders() });
  }

  /** Final step — creates the decision record, sets isCompleted=true, currentStep=6. */
  complete(appointmentId: number, payload: ConsultationCompletePayload): Observable<void> {
    return this.http.post<void>(`${API_BASE}ConsultationSession/${appointmentId}/complete`, payload, { headers: this.getHeaders() });
  }
}