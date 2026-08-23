import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../auth/services/auth.service';
import {
  MOCK_CONSULTATION_SESSIONS,
  MOCK_ERROR_APPOINTMENT_ID,
  MOCK_ERROR_RESPONSE
} from './consultation-session.mock-data';

// NOTE: hard-coded to match the guide (tariqMDfile.md). Swap for an
// `environment.apiUrl` import if this project already centralizes the API
// base URL the way ServicesService / PatientFormService do.
const API_BASE = environment.apiUrl;

// ── Quick local testing switch ──────────────────────────────────────────────
// Flip to `false` (or delete this block + the mock branches below) to go back
// to hitting the real backend. While `true`, every method below serves data
// from `consultation-session.mock-data.ts` instead of calling `this.http`, so
// the whole wizard is clickable end-to-end with no backend running.
// Try appointmentId 501–510 for the different scenarios, and 599 to see the
// error banner. See consultation-session.mock-data.ts for the full list.
const USE_MOCK_DATA = true;
const MOCK_LATENCY_MS = 400;

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

// ── Mock in-memory store (only used while USE_MOCK_DATA = true) ────────────
// Seeded from the fixtures, then mutated on every mock PUT/POST so state
// persists for the rest of the browser session — same as a real backend.
const mockStore = new Map<number, ConsultationSessionDto>(
  Object.entries(MOCK_CONSULTATION_SESSIONS).map(([id, dto]) => [Number(id), { ...dto }])
);

function mockBlankSession(appointmentId: number): ConsultationSessionDto {
  return {
    id: 0, appointmentId, isCompleted: false, currentStep: 1,
    complaintInAthleteWords: null, impactOnTraining: null, impactOnCompetition: null,
    impactOnDailyLife: null, additionalImpactComment: null, complaintStartDate: null,
    daysSinceOnset: null, whatAggravatesPain: null,
    procedures: null, vASPain: null, effusion: null, asymmetryPercent: null,
    dysfunctionsAndRiskFactors: null, strengthsObserved: null, weaknessesObserved: null,
    notesAndGeneralImpression: null, yellowFlags: null, yellowFlagScore: null,
    emotionalTrigger: null, experienceWithOtherProviders: null, expectationsAndFears: null,
    complianceIndex: null, personaClassification: null, purchaseInfluencer: null,
    additionalBehavioralNotes: null, judgmentType: null, generalOpinion: null,
    diagnosisText: null, injuryGrade: null, injuryPhase: null, clinicalNotes: null,
    therapeuticGoal: null, expectedDuration: null, therapeuticGoalType: null,
    recommendedServiceId: null, recommendedServiceName: null, priorityLevel: null,
    programDuration: null, planPhases: null, sportsRecommendations: null, teamNotes: null,
    decision: null
  };
}

function mockCountSetBits(mask: number): number {
  let count = 0;
  for (let i = 0; i < 5; i++) if (mask & (1 << i)) count++;
  return count;
}

/** 400 response shaped exactly like ConsultationApiErrorResponse, for appointmentId = MOCK_ERROR_APPOINTMENT_ID. */
function mockErrorResponse$(url: string): Observable<never> {
  return throwError(
    () => new HttpErrorResponse({ status: 400, statusText: 'Bad Request', url, error: MOCK_ERROR_RESPONSE })
  ).pipe(delay(MOCK_LATENCY_MS));
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
    if (USE_MOCK_DATA) {
      if (appointmentId === MOCK_ERROR_APPOINTMENT_ID) return mockErrorResponse$(`mock://ConsultationSession/${appointmentId}`);
      const session = mockStore.get(appointmentId) ?? mockBlankSession(appointmentId);
      return of(session).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.get<ConsultationSessionDto>(`${API_BASE}ConsultationSession/${appointmentId}`, { headers: this.getHeaders() });
  }

  saveStep1(appointmentId: number, payload: ConsultationStep1Payload): Observable<void> {
    if (USE_MOCK_DATA) {
      if (appointmentId === MOCK_ERROR_APPOINTMENT_ID) return mockErrorResponse$(`mock://ConsultationSession/${appointmentId}/step/1`);
      const current = mockStore.get(appointmentId) ?? mockBlankSession(appointmentId);
      mockStore.set(appointmentId, {
        ...current,
        id: current.id || appointmentId + 10000,
        complaintInAthleteWords: payload.complaintInAthleteWords,
        impactOnTraining: payload.impactOnTraining,
        impactOnCompetition: payload.impactOnCompetition,
        impactOnDailyLife: payload.impactOnDailyLife,
        additionalImpactComment: payload.additionalImpactComment,
        complaintStartDate: payload.complaintStartDate,
        daysSinceOnset: 0,
        whatAggravatesPain: payload.whatAggravatesPain,
        currentStep: Math.max(current.currentStep, 2)
      });
      return of(undefined).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.put<void>(`${API_BASE}ConsultationSession/${appointmentId}/step/1`, payload, { headers: this.getHeaders() });
  }

  saveStep2(appointmentId: number, payload: ConsultationStep2Payload): Observable<void> {
    if (USE_MOCK_DATA) {
      if (appointmentId === MOCK_ERROR_APPOINTMENT_ID) return mockErrorResponse$(`mock://ConsultationSession/${appointmentId}/step/2`);
      const current = mockStore.get(appointmentId) ?? mockBlankSession(appointmentId);
      mockStore.set(appointmentId, {
        ...current,
        procedures: payload.procedures.map((p, idx) => ({
          id: p.id ?? appointmentId * 100 + idx + 1,
          procedureName: p.procedureName,
          result: p.result,
          order: p.order
        })),
        vASPain: payload.vASPain,
        effusion: payload.effusion,
        asymmetryPercent: payload.asymmetryPercent,
        currentStep: Math.max(current.currentStep, 3)
      });
      return of(undefined).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.put<void>(`${API_BASE}ConsultationSession/${appointmentId}/step/2`, payload, { headers: this.getHeaders() });
  }

  /** Combined Impression & Findings + Judgment payload. Server sets currentStep=5 when judgmentType=1 (skips Athlete Report). */
  saveStep3(appointmentId: number, payload: ConsultationStep3Payload): Observable<void> {
    if (USE_MOCK_DATA) {
      if (appointmentId === MOCK_ERROR_APPOINTMENT_ID) return mockErrorResponse$(`mock://ConsultationSession/${appointmentId}/step/3`);
      const current = mockStore.get(appointmentId) ?? mockBlankSession(appointmentId);
      mockStore.set(appointmentId, {
        ...current,
        dysfunctionsAndRiskFactors: payload.dysfunctionsAndRiskFactors,
        strengthsObserved: payload.strengthsObserved,
        weaknessesObserved: payload.weaknessesObserved,
        notesAndGeneralImpression: payload.notesAndGeneralImpression,
        yellowFlags: payload.yellowFlags,
        yellowFlagScore: mockCountSetBits(payload.yellowFlags ?? 0),
        emotionalTrigger: payload.emotionalTrigger,
        experienceWithOtherProviders: payload.experienceWithOtherProviders,
        expectationsAndFears: payload.expectationsAndFears,
        complianceIndex: payload.complianceIndex,
        personaClassification: payload.personaClassification,
        purchaseInfluencer: payload.purchaseInfluencer,
        additionalBehavioralNotes: payload.additionalBehavioralNotes,
        judgmentType: payload.judgmentType,
        generalOpinion: payload.generalOpinion,
        diagnosisText: payload.diagnosisText,
        injuryGrade: payload.injuryGrade,
        injuryPhase: payload.injuryPhase,
        clinicalNotes: payload.clinicalNotes,
        therapeuticGoal: payload.therapeuticGoal,
        expectedDuration: payload.expectedDuration,
        therapeuticGoalType: payload.therapeuticGoalType,
        currentStep: payload.judgmentType === 1 ? 5 : 4
      });
      return of(undefined).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.put<void>(`${API_BASE}ConsultationSession/${appointmentId}/step/3`, payload, { headers: this.getHeaders() });
  }

  /** Only call when judgmentType = 0 (WriteReport). */
  saveStep4(appointmentId: number, payload: ConsultationStep4Payload): Observable<void> {
    if (USE_MOCK_DATA) {
      if (appointmentId === MOCK_ERROR_APPOINTMENT_ID) return mockErrorResponse$(`mock://ConsultationSession/${appointmentId}/step/4`);
      const current = mockStore.get(appointmentId) ?? mockBlankSession(appointmentId);
      mockStore.set(appointmentId, {
        ...current,
        recommendedServiceId: payload.recommendedServiceId,
        recommendedServiceName: current.recommendedServiceName ?? 'Mock Recommended Service',
        priorityLevel: payload.priorityLevel,
        programDuration: payload.programDuration,
        planPhases: payload.planPhases.map((p, idx) => ({
          id: p.id ?? appointmentId * 10 + idx + 1,
          phaseName: p.phaseName,
          goal: p.goal,
          transitionCriteria: p.transitionCriteria,
          sessions: p.sessions,
          order: p.order
        })),
        sportsRecommendations: payload.sportsRecommendations,
        teamNotes: payload.teamNotes,
        currentStep: 5
      });
      return of(undefined).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.put<void>(`${API_BASE}ConsultationSession/${appointmentId}/step/4`, payload, { headers: this.getHeaders() });
  }

  /** Final step — creates the decision record, sets isCompleted=true, currentStep=6. */
  complete(appointmentId: number, payload: ConsultationCompletePayload): Observable<void> {
    if (USE_MOCK_DATA) {
      if (appointmentId === MOCK_ERROR_APPOINTMENT_ID) return mockErrorResponse$(`mock://ConsultationSession/${appointmentId}/complete`);
      const current = mockStore.get(appointmentId) ?? mockBlankSession(appointmentId);
      mockStore.set(appointmentId, {
        ...current,
        isCompleted: true,
        currentStep: 6,
        decision: {
          id: appointmentId,
          decisionType: payload.decisionType,
          notes: payload.notes,
          externalReferral: payload.decisionType === 1 ? { status: 0 } : null
        }
      });
      return of(undefined).pipe(delay(MOCK_LATENCY_MS));
    }
    return this.http.post<void>(`${API_BASE}ConsultationSession/${appointmentId}/complete`, payload, { headers: this.getHeaders() });
  }
}