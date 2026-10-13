// ── Shared ────────────────────────────────────────────────────────────────────

export interface CriterionStatus {
  criterionType: string;
  operator: string;
  targetValue: number;
  unit: string | null;
  currentValue: number | null;
  measuredAt: string | null;
  isMet: boolean | null;
}

export interface NamedPerson {
  id: number;
  nameEn: string;
  nameAr: string;
}

export interface SessionLogItem {
  phaseSessionId: number;
  globalSessionNumber: number;
  sessionNumber: number;
  phaseName: string;
  sessionType: string;
  isMeasurementSession: boolean;
  date: string;
  coachNames: string[];
  completionStatus: string;
  coachNote: string | null;
  patientComment: string | null;
  rating: number | null;
  rpe: number | null;
  durationMinutes: number | null;
  trainingLoad: number | null;
  painLevel: number | null;
}

// ── Summary ────────────────────────────────────────────────────────────────────

export interface ActivePlan {
  patientTreatmentPlanId: number;
  treatmentPlanId: number;
  planName: string;
  status: string;
  startDate: string;
  expectedEndDate: string;
  currentPhaseOrder: number;
  currentPhaseName: string;
  completedSessions: number;
  totalSessions: number;
}

export interface AthleteKpis {
  programProgressPercent: number;
  completedSessions: number;
  totalSessions: number;
  latestVas: number | null;
  vasAcceptableMax: number | null;
  phaseCriteria: CriterionStatus[];
}

export interface CareTeam {
  doctor: NamedPerson | null;
  coaches: NamedPerson[];
}

export interface AthleteStatus {
  programStatus: string;
  sessionsUntilPhaseTransition: number;
  wellnessToday: number | null;
  attendedAppointments: number;
  scheduledPastAppointments: number;
}

export interface InteractionNote {
  personality: string;
  communicationTip: string;
  updatedBy: NamedPerson | null;
  updatedAt: string;
}

export interface EmergencyContact {
  name: string;
  phoneNumber: string;
}

export interface ContactInfo {
  phone: string | null;
  email: string | null;
  address: string | null;
  emergencyContacts: EmergencyContact[];
}

export interface AthleteSummary {
  patientId: number;
  nameEn: string;
  nameAr: string;
  imageUrl: string | null;
  age: number;
  genderId: number;
  sport: string;
  branchNameEn: string;
  branchNameAr: string;
  memberSince: string | null;
  activePlan: ActivePlan | null;
  latestNps: number | null;
  npsCategory: string | null;
  kpis: AthleteKpis;
  careTeam: CareTeam;
  status: AthleteStatus;
  interactionNote: InteractionNote | null;
  contact: ContactInfo;
}

// ── Tab 1 — Overview ──────────────────────────────────────────────────────────

export interface NextSession {
  phaseSessionId: number;
  globalSessionNumber: number;
  sessionType: string;
  startTime: string;
  coachName: string;
}

export interface CurrentStatus {
  planName: string;
  phaseOrder: number;
  phaseName: string;
  currentSessionNumber: number;
  totalSessions: number;
  coaches: NamedPerson[];
  nextSession: NextSession | null;
  transitionCriteria: CriterionStatus[];
}

export interface ClinicalAlert {
  severity: 'Warning' | 'Info';
  messageEn: string;
  messageAr: string;
}

export interface DoctorNote {
  note: string;
  date: string;
}

export interface OverviewData {
  currentStatus: CurrentStatus | null;
  alerts: ClinicalAlert[];
  latestDoctorNote: DoctorNote | null;
  recentSessions: SessionLogItem[];
}

// ── Tab 2 — Injury & History ──────────────────────────────────────────────────

export interface Specialist {
  doctorName: string;
  specialty: string;
  diagnosis: string;
}

export interface CurrentInjury {
  diagnosis: string;
  injuryGrade: string;
  injuryName: string;
  side: string;
  injuryDate: string;
  mechanism: string;
  isSportRelated: boolean;
  diagnosticTests: string[];
  specialists: Specialist[];
}

export interface PreviousInjury {
  description: string;
  bodyPart: string;
  injuryDate: string;
  treatmentReceived: string;
}

export interface PreviousSurgery {
  surgeryType: string;
  bodyPart: string;
  surgeryDate: string;
  description: string;
}

export interface Medication {
  name: string;
  dose: string | null;
  frequency: string;
}

export interface MedicalHistory {
  previousInjuries: PreviousInjury[];
  previousSurgeries: PreviousSurgery[];
  chronicConditions: string[];
  medications: Medication[];
  allergies: string | null;
  sport: string;
  yearsOfPractice: number;
  clubName: string | null;
  goal: string;
}

export interface TimelineItem {
  type: 'Consultation' | 'ExternalReferral' | 'MedicalReport' | 'Surgery';
  date: string;
  title: string;
  subtitle: string;
  description: string;
  status: string | null;
}

export interface InjuryHistoryData {
  currentInjury: CurrentInjury | null;
  medicalHistory: MedicalHistory;
  clinicalWarning: string | null;
  timeline: TimelineItem[];
}

// ── Tab 3 — Program & Plan ────────────────────────────────────────────────────

export interface PlanPhase {
  phaseId: number;
  phaseOrder: number;
  phaseName: string;
  weeks: number;
  status: 'Completed' | 'InProgress' | 'Upcoming';
  progressPercent: number;
}

export interface PlanModification {
  id: number;
  phaseOrder: number;
  description: string;
  requestedBy: NamedPerson;
  status: 'Pending' | 'Approved' | 'Reverted';
  doctorNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface ProgramPlanData {
  treatmentPlanId: number;
  planName: string;
  status: string;
  doctor: NamedPerson;
  phases: PlanPhase[];
  currentPhaseOrder: number;
  currentPhaseCriteria: CriterionStatus[];
  modifications: PlanModification[];
}

// ── Tab 4 — Measurements & Data ───────────────────────────────────────────────

export interface MeasurementHistoryPoint {
  measuredAt: string;
  value: number;
  referenceValue: number | null;
}

export interface MeasurementItem {
  measurementId: number;
  name: string;
  unit: string;
  latestValue: number;
  referenceValue: number | null;
  lsiPercent: number | null;
  measuredAt: string;
  target: CriterionStatus | null;
  status: 'Normal' | 'NearTarget' | 'BelowTarget' | 'NoTarget';
  history: MeasurementHistoryPoint[];
}

export interface WellnessDay {
  date: string;
  sleepQuality: number | null;
  fatigue: number | null;
  mood: number | null;
  muscleSoreness: number | null;
  stress: number | null;
}

export interface WellnessSummary {
  sleepQuality: number | null;
  fatigue: number | null;
  mood: number | null;
  muscleSoreness: number | null;
  stress: number | null;
  days: WellnessDay[];
}

export interface TrainingLoad {
  sessions: SessionLogItem[];
  averageLoadPerSession: number;
}

export interface MeasurementsData {
  measurements: MeasurementItem[];
  wellness: WellnessSummary;
  trainingLoad: TrainingLoad;
}

// ── Tab 5 — Session Log ───────────────────────────────────────────────────────

export interface SessionLogData {
  completedSessions: number;
  totalSessions: number;
  sessions: SessionLogItem[];
}

// ── Tab 6 — Surveys ───────────────────────────────────────────────────────────

export interface SurveyAnswer {
  question: string;
  answer: string;
}

export interface NpsSurvey {
  id: number;
  surveyType: string;
  score: number;
  category: string | null;
  submittedAt: string;
  answers: SurveyAnswer[];
}

export interface SurveysData {
  wellnessDaysAnswered: number;
  wellnessDaysRequested: number;
  wellness: WellnessDay[];
  nps: NpsSurvey[];
  postBlueprint: NpsSurvey[];
}

// ── Write Payloads ────────────────────────────────────────────────────────────

export interface InteractionNotePayload {
  personality: string;
  communicationTip: string;
}

export interface MeasurementResult {
  measurementId: number;
  value: number;
  referenceValue: number | null;
  notes: string | null;
}

export interface RecordMeasurementsPayload {
  phaseSessionId?: number;
  measuredAt?: string;
  results: MeasurementResult[];
}

export interface SubmitSurveyPayload {
  surveyType: 'MonthlyNps' | 'PostBlueprint';
  score: number;
  answers: SurveyAnswer[];
}
