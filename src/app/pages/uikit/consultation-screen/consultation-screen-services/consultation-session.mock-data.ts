/**
 * consultation-session.mock-data.ts
 * ────────────────────────────────────────────────────────────────────────
 * Fake `ConsultationSessionDto` records for every state the wizard can be
 * resumed in, built to match the shapes documented in
 * `consultation-session-api-request-bodies.md` and the interfaces exported
 * from `consultation-screen.service.ts`.
 *
 * Purpose: let you open the consultation screen against any of the
 * `appointmentId`s below (via the mock interceptor in
 * `consultation-session.mock.interceptor.ts`) and land directly on a fully
 * populated step, instead of manually re-typing the wizard every time you
 * want to check a screen. Covers: not-started, mid-flow at each step,
 * both judgment branches, all three decision variants, an
 * update/edit scenario (existing serverIds), and a validation-error
 * scenario — so every path gets exercised before a client demo.
 *
 * Import { MOCK_CONSULTATION_SESSIONS, MOCK_ERROR_APPOINTMENT_ID } from this
 * file wherever you wire up the interceptor or a Storybook-style harness.
 */

import type {
  ConsultationSessionDto,
  ConsultationProcedureDto,
  ConsultationPlanPhaseDto,
  ConsultationDecisionDto
} from './consultation-screen.service';

// ── Shared building blocks ─────────────────────────────────────────────────

const EMPTY_STEP1 = {
  complaintInAthleteWords: null,
  impactOnTraining: null,
  impactOnCompetition: null,
  impactOnDailyLife: null,
  additionalImpactComment: null,
  complaintStartDate: null,
  daysSinceOnset: null,
  whatAggravatesPain: null
};

const EMPTY_STEP2 = {
  procedures: null,
  vASPain: null,
  effusion: null,
  asymmetryPercent: null
};

const EMPTY_STEP3 = {
  dysfunctionsAndRiskFactors: null,
  strengthsObserved: null,
  weaknessesObserved: null,
  notesAndGeneralImpression: null,
  yellowFlags: null,
  yellowFlagScore: null,
  emotionalTrigger: null,
  experienceWithOtherProviders: null,
  expectationsAndFears: null,
  complianceIndex: null,
  personaClassification: null,
  purchaseInfluencer: null,
  additionalBehavioralNotes: null,
  judgmentType: null,
  generalOpinion: null,
  diagnosisText: null,
  injuryGrade: null,
  injuryPhase: null,
  clinicalNotes: null,
  therapeuticGoal: null,
  expectedDuration: null,
  therapeuticGoalType: null
};

const EMPTY_STEP4 = {
  recommendedServiceId: null,
  recommendedServiceName: null,
  priorityLevel: null,
  programDuration: null,
  planPhases: null,
  sportsRecommendations: null,
  teamNotes: null
};

const EMPTY_DECISION = { decision: null };

/** Bitmask helper — mirrors `yfFlags` in the component (bit i = flag i, values 1,2,4,8,16). */
function yellowFlagsMask(...bitIndexes: number[]): number {
  return bitIndexes.reduce((mask, i) => mask | (1 << i), 0);
}

// ── Scenario 501 — Not started (id: 0) ──────────────────────────────────────
// "New Athlete" entry, Hani Salem. GET should be a no-op per applySession()
// (`if (!session || session.id === 0) return;`), so the wizard shows its
// blank intro / Start Consultation screen.
const SESSION_501_NOT_STARTED: ConsultationSessionDto = {
  id: 0,
  appointmentId: 501,
  isCompleted: false,
  currentStep: 1,
  ...EMPTY_STEP1,
  ...EMPTY_STEP2,
  ...EMPTY_STEP3,
  ...EMPTY_STEP4,
  ...EMPTY_DECISION
};

// ── Scenario 502 — Step 1 saved, resume at Assessment ───────────────────────
// Ahmed Salah. currentStep: 2 → local FlowStep 2 (Assessment/Examination review).
const SESSION_502_STEP1_DONE: ConsultationSessionDto = {
  id: 8502,
  appointmentId: 502,
  isCompleted: false,
  currentStep: 2,
  complaintInAthleteWords: 'Sharp pain in the right knee when pivoting during training.',
  impactOnTraining: 2,
  impactOnCompetition: 1,
  impactOnDailyLife: 0,
  additionalImpactComment: 'Pain worsens after 20 minutes of running.',
  complaintStartDate: '2026-08-01',
  daysSinceOnset: 22,
  whatAggravatesPain: 'Pivoting, stairs, deep squats',
  ...EMPTY_STEP2,
  ...EMPTY_STEP3,
  ...EMPTY_STEP4,
  ...EMPTY_DECISION
};

// ── Scenario 503 — Step 2 saved, resume at Judgment (API step 3) ───────────
// Karim Hassan. currentStep: 3 → applySession() maps this to local step 4.
const SESSION_503_STEP2_DONE: ConsultationSessionDto = {
  id: 8503,
  appointmentId: 503,
  isCompleted: false,
  currentStep: 3,
  complaintInAthleteWords: 'Dull ache in the left shoulder after overhead lifts.',
  impactOnTraining: 1,
  impactOnCompetition: 1,
  impactOnDailyLife: 0,
  additionalImpactComment: 'Worse with overhead pressing, fine at rest.',
  complaintStartDate: '2026-07-20',
  daysSinceOnset: 34,
  whatAggravatesPain: 'Overhead press, bench press lockout',
  procedures: [
    { id: null, procedureName: 'Empty Can Test', result: 'Positive - pain at 90°', order: 1 },
    { id: null, procedureName: 'Neer Impingement Test', result: 'Positive', order: 2 },
    { id: null, procedureName: 'Apprehension Test', result: 'Negative', order: 3 }
  ] as ConsultationProcedureDto[],
  vASPain: 4,
  effusion: 0,
  asymmetryPercent: 8,
  ...EMPTY_STEP3,
  ...EMPTY_STEP4,
  ...EMPTY_DECISION
};

// ── Scenario 504 — Judgment saved as Extra Assessment (judgmentType=1) ─────
// Karim Mahmoud, Reassessment entry. Skips Athlete Report — API currentStep: 5.
const SESSION_504_EXTRA_ASSESSMENT: ConsultationSessionDto = {
  id: 8504,
  appointmentId: 504,
  isCompleted: false,
  currentStep: 5,
  complaintInAthleteWords: 'New sharp pain in the shoulder during an ACL rehab session.',
  impactOnTraining: 2,
  impactOnCompetition: 2,
  impactOnDailyLife: 1,
  additionalImpactComment: 'Started acutely during a resisted rotation drill.',
  complaintStartDate: '2026-08-19',
  daysSinceOnset: 4,
  whatAggravatesPain: 'External rotation against resistance, overhead reach',
  procedures: [
    { id: null, procedureName: 'Empty Can Test', result: 'Positive', order: 1 },
    { id: null, procedureName: "O'Brien Test", result: 'Positive - possible labral involvement', order: 2 }
  ] as ConsultationProcedureDto[],
  vASPain: 7,
  effusion: 1,
  asymmetryPercent: null,
  dysfunctionsAndRiskFactors: 'Possible labral involvement, guarding on active ROM.',
  strengthsObserved: 'Strong grip and forearm strength, good scapular rhythm at rest.',
  weaknessesObserved: 'External rotation strength down ~40% vs. contralateral side.',
  notesAndGeneralImpression: 'Findings inconclusive, structural involvement not ruled out.',
  yellowFlags: yellowFlagsMask(1, 2), // Low recovery expectation + High stress = 2 + 4 = 6
  yellowFlagScore: 2,
  emotionalTrigger: '',
  experienceWithOtherProviders: '',
  expectationsAndFears: 'Worried this will delay his ACL return-to-play timeline.',
  complianceIndex: 0,
  personaClassification: 3,
  purchaseInfluencer: 0,
  additionalBehavioralNotes: 'Already anxious about the ACL timeline; handle carefully.',
  judgmentType: 1,
  generalOpinion: null,
  diagnosisText: null,
  injuryGrade: 0,
  injuryPhase: 0,
  clinicalNotes: 'Recommend MRI before finalizing diagnosis. Hold overhead loading meanwhile.',
  therapeuticGoal: null,
  expectedDuration: '',
  therapeuticGoalType: 0,
  ...EMPTY_STEP4,
  ...EMPTY_DECISION
};

// ── Scenario 505 — Judgment saved as Write Report (judgmentType=0) ─────────
// Omar Tarek, Returning athlete entry. Goes to Athlete Report — API currentStep: 4.
const SESSION_505_WRITE_REPORT: ConsultationSessionDto = {
  id: 8505,
  appointmentId: 505,
  isCompleted: false,
  currentStep: 4,
  complaintInAthleteWords: 'Aching in the front of the right knee when climbing stairs.',
  impactOnTraining: 2,
  impactOnCompetition: 1,
  impactOnDailyLife: 0,
  additionalImpactComment: 'Pain worsens after 20 minutes of running.',
  complaintStartDate: '2026-07-01',
  daysSinceOnset: 53,
  whatAggravatesPain: 'Pivoting, stairs, deep squats',
  procedures: [
    { id: null, procedureName: 'Lachman Test', result: 'Negative', order: 1 },
    { id: null, procedureName: 'McMurray Test', result: 'Positive - medial click', order: 2 }
  ] as ConsultationProcedureDto[],
  vASPain: 6,
  effusion: 2,
  asymmetryPercent: 12,
  dysfunctionsAndRiskFactors: 'Reduced quad activation, mild valgus collapse on single-leg squat.',
  strengthsObserved: 'Good core stability, full ankle mobility.',
  weaknessesObserved: 'Quad LSI at 68%, delayed glute med firing.',
  notesAndGeneralImpression: 'Consistent with early-stage patellofemoral pain syndrome.',
  yellowFlags: yellowFlagsMask(0, 2), // Kinesiophobia + High stress = 1 + 4 = 5
  yellowFlagScore: 2,
  emotionalTrigger: 'Missed the regional qualifier last season due to injury.',
  experienceWithOtherProviders: 'Saw a physio for 2 weeks with no improvement.',
  expectationsAndFears: 'Afraid this will end his season again.',
  complianceIndex: 0,
  personaClassification: 1,
  purchaseInfluencer: 2,
  additionalBehavioralNotes: 'Coach is very involved in decision-making.',
  judgmentType: 0,
  generalOpinion: 'Manageable with structured rehab, no red flags for surgical referral.',
  diagnosisText: 'Grade I MCL sprain with secondary quad inhibition.',
  injuryGrade: 0,
  injuryPhase: 0,
  clinicalNotes: 'Reassess ROM in 2 weeks.',
  therapeuticGoal: 'Return to full training within 6 weeks.',
  expectedDuration: '6 weeks',
  therapeuticGoalType: 0,
  ...EMPTY_STEP4,
  ...EMPTY_DECISION
};

// ── Scenario 506 — Athlete Report saved, resume at Decision ────────────────
// Youssef-style profile. Custom program duration string, to exercise that
// free-text branch. API currentStep: 5.
const SESSION_506_ATHLETE_REPORT_DONE: ConsultationSessionDto = {
  ...SESSION_505_WRITE_REPORT,
  id: 8506,
  appointmentId: 506,
  currentStep: 5,
  recommendedServiceId: 4,
  recommendedServiceName: 'ACL Return-to-Play Program',
  priorityLevel: 1,
  programDuration: 'Custom Program - 4 sessions/week',
  planPhases: [
    {
      id: null,
      phaseName: 'Phase 1: Mobility & Control',
      goal: 'Restore full range of motion',
      transitionCriteria: 'ROM flexion > 120°',
      sessions: 8,
      order: 1
    },
    {
      id: null,
      phaseName: 'Phase 2: Strength & Load',
      goal: 'Equalize limb strength',
      transitionCriteria: 'LSI > 80%',
      sessions: 12,
      order: 2
    }
  ] as ConsultationPlanPhaseDto[],
  sportsRecommendations: 'Resume light jogging after Phase 2, avoid contact sports until graduation.',
  teamNotes: 'Monitor psychological status (Yellow Flag alert). Focus on quad control.',
  ...EMPTY_DECISION
};

// ── Scenario 507 — Completed, decisionType 0 (Direct Blueprint) ────────────
const SESSION_507_COMPLETED_DIRECT: ConsultationSessionDto = {
  ...SESSION_506_ATHLETE_REPORT_DONE,
  id: 8507,
  appointmentId: 507,
  isCompleted: true,
  currentStep: 6,
  decision: {
    id: 1,
    decisionType: 0,
    notes: 'Proceeding directly with the rehab blueprint, no further referral needed.',
    externalReferral: null
  } as ConsultationDecisionDto
};

// ── Scenario 508 — Completed, decisionType 1 (External Referral) ───────────
const SESSION_508_COMPLETED_REFERRAL: ConsultationSessionDto = {
  ...SESSION_504_EXTRA_ASSESSMENT,
  id: 8508,
  appointmentId: 508,
  isCompleted: true,
  currentStep: 6,
  decision: {
    id: 2,
    decisionType: 1,
    notes: 'Referring for imaging before finalizing rehab plan.',
    externalReferral: { status: 0 } // 0 = Pending, see ReferralStatus 0–5
  } as ConsultationDecisionDto
};

// ── Scenario 509 — Completed, decisionType 2 (Internal Measurements) ───────
const SESSION_509_COMPLETED_MEASUREMENTS: ConsultationSessionDto = {
  ...SESSION_505_WRITE_REPORT,
  id: 8509,
  appointmentId: 509,
  isCompleted: true,
  currentStep: 6,
  recommendedServiceId: 2,
  recommendedServiceName: 'Baseline Strength & Movement Screen',
  priorityLevel: 1,
  programDuration: '4 Weeks',
  planPhases: [
    {
      id: null,
      phaseName: 'Phase 1: Baseline Testing',
      goal: 'Establish strength & movement baselines',
      transitionCriteria: 'All measurements collected',
      sessions: 2,
      order: 1
    }
  ] as ConsultationPlanPhaseDto[],
  sportsRecommendations: 'Hold return-to-sport decision until baseline testing is reviewed.',
  teamNotes: 'Force plate + isokinetic testing booked for 2026-08-10.',
  decision: {
    id: 3,
    decisionType: 2,
    notes:
      'Baseline strength testing before confirming return-to-play timeline. (Measurement: Force Plate on 2026-08-10)',
    externalReferral: null
  } as ConsultationDecisionDto
};

// ── Scenario 510 — Edit/update scenario: existing serverIds everywhere ─────
// Simulates re-opening an already-saved session to edit it: every row and
// phase carries a real serverId (not null), so the smart-merge (update vs.
// insert) path in submitStep2()/submitStep4() gets exercised, plus a fully
// maxed-out yellow-flags bitmask (all 5 flags) and a null asymmetryPercent.
const SESSION_510_EDIT_EXISTING: ConsultationSessionDto = {
  id: 8510,
  appointmentId: 510,
  isCompleted: false,
  currentStep: 4,
  complaintInAthleteWords: 'Recurrent lower back tightness after long training blocks.',
  impactOnTraining: 1,
  impactOnCompetition: 0,
  impactOnDailyLife: 0,
  additionalImpactComment: 'Improves with rest, flares after heavy squat sessions.',
  complaintStartDate: '2026-05-15',
  daysSinceOnset: 100,
  whatAggravatesPain: 'Heavy back squat, deadlift, prolonged sitting',
  procedures: [
    { id: 301, procedureName: 'Straight Leg Raise', result: 'Negative bilaterally', order: 1 },
    { id: 302, procedureName: "FABER Test", result: 'Negative', order: 2 },
    { id: 303, procedureName: 'Prone Instability Test', result: 'Positive', order: 3 }
  ] as ConsultationProcedureDto[],
  vASPain: 3,
  effusion: 0,
  asymmetryPercent: null,
  dysfunctionsAndRiskFactors: 'Segmental hypermobility L4-L5, poor bracing under load.',
  strengthsObserved: 'Good hip hinge pattern, strong posterior chain overall.',
  weaknessesObserved: 'Anti-rotation core strength below expected for training age.',
  notesAndGeneralImpression: 'Non-specific mechanical low back pain, load-management driven.',
  yellowFlags: yellowFlagsMask(0, 1, 2, 3, 4), // all 5 flags = 31
  yellowFlagScore: 5,
  emotionalTrigger: 'Coach threatened to cut training volume if pain continues.',
  experienceWithOtherProviders: 'Tried two chiropractors, temporary relief only.',
  expectationsAndFears: 'Wants a fast fix, skeptical of "just do exercises" advice.',
  complianceIndex: 2,
  personaClassification: 2,
  purchaseInfluencer: 2,
  additionalBehavioralNotes: 'Likely to skip home exercises without check-ins.',
  judgmentType: 0,
  generalOpinion: 'Load-management case, good prognosis with consistent bracing work.',
  diagnosisText: 'Non-specific mechanical LBP with segmental hypermobility.',
  injuryGrade: 0,
  injuryPhase: 2,
  clinicalNotes: 'Weekly check-ins recommended given low compliance risk.',
  therapeuticGoal: 'Pain-free heavy squat/deadlift within 8 weeks.',
  expectedDuration: '8 weeks',
  therapeuticGoalType: 0,
  recommendedServiceId: 3,
  recommendedServiceName: 'Strength & Conditioning Rehab',
  priorityLevel: 0,
  programDuration: '8 Weeks',
  planPhases: [
    {
      id: 41,
      phaseName: 'Phase 1: Bracing & Control',
      goal: 'Restore pain-free bracing under light load',
      transitionCriteria: 'Pain-free bodyweight hinge x 3 sets',
      sessions: 6,
      order: 1
    },
    {
      id: 42,
      phaseName: 'Phase 2: Progressive Loading',
      goal: 'Return to heavy squat/deadlift',
      transitionCriteria: 'Pain-free 80% 1RM squat',
      sessions: 10,
      order: 2
    }
  ] as ConsultationPlanPhaseDto[],
  sportsRecommendations: 'Cap loaded spinal flexion volume for 4 weeks.',
  teamNotes: 'Compliance risk flagged — schedule weekly check-ins.',
  ...EMPTY_DECISION
};

// ── Master export ───────────────────────────────────────────────────────────

export const MOCK_CONSULTATION_SESSIONS: Record<number, ConsultationSessionDto> = {
  501: SESSION_501_NOT_STARTED,
  502: SESSION_502_STEP1_DONE,
  503: SESSION_503_STEP2_DONE,
  504: SESSION_504_EXTRA_ASSESSMENT,
  505: SESSION_505_WRITE_REPORT,
  506: SESSION_506_ATHLETE_REPORT_DONE,
  507: SESSION_507_COMPLETED_DIRECT,
  508: SESSION_508_COMPLETED_REFERRAL,
  509: SESSION_509_COMPLETED_MEASUREMENTS,
  510: SESSION_510_EDIT_EXISTING
};

/** Quick human-readable index — handy for a picker screen or console.table(). */
export const MOCK_CONSULTATION_SCENARIOS: { appointmentId: number; label: string }[] = [
  { appointmentId: 501, label: 'Not started — fresh "New Athlete" intake (id: 0)' },
  { appointmentId: 502, label: 'Step 1 saved — resume at Assessment' },
  { appointmentId: 503, label: 'Step 2 saved — resume at Judgment' },
  { appointmentId: 504, label: 'Judgment: Extra Assessment (skips Athlete Report) — Reassessment entry' },
  { appointmentId: 505, label: 'Judgment: Write Report — resume at Athlete Report' },
  { appointmentId: 506, label: 'Athlete Report saved (custom duration) — resume at Decision' },
  { appointmentId: 507, label: 'Completed — Direct Blueprint (decisionType 0)' },
  { appointmentId: 508, label: 'Completed — External Referral (decisionType 1)' },
  { appointmentId: 509, label: 'Completed — Internal Measurements (decisionType 2)' },
  { appointmentId: 510, label: 'Edit/update — existing serverIds, all yellow flags, null asymmetry' }
];

/**
 * Any GET/PUT/POST against this appointmentId always fails, returning the
 * documented `ConsultationApiErrorResponse` shape (HTTP 400) with a bilingual
 * message — use it to verify `sessionError` / `extractApiError()` render
 * correctly and the wizard doesn't get stuck on a failed save.
 */
export const MOCK_ERROR_APPOINTMENT_ID = 599;
export const MOCK_ERROR_RESPONSE = {
  errors: [
    {
      errorEn: 'Validation failed: complaintStartDate cannot be in the future.',
      errorAr: 'خطأ في التحقق: لا يمكن أن يكون تاريخ بدء الشكوى في المستقبل.'
    }
  ]
};
