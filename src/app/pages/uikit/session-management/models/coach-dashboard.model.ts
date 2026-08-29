export interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  onsetDate: string;
}

export interface OverallProgress {
  sessionsCompleted: number;
  totalSessions: number;
  currentPhase: string;
  phaseSessionRange: string;
  progressPercent: number;
}

export interface ExerciseSet {
  setNumber: number;
  reps?: number;
  intensity?: string;
  tempo?: string | null;
  restSeconds?: number;
}

export interface Exercise {
  sessionExerciseId: number;
  exerciseName: string;
  description?: string | null;
  sets?: ExerciseSet[];
  progressionTitle?: string | null;
  isCompleted: boolean;
  coachNote?: string | null;
}

export interface ExerciseSection {
  sectionId: number;
  sectionName: string;
  durationMinutes?: number;
  exercises: Exercise[];
}

export interface ExercisePhase {
  phaseId: number;
  phaseName: string;
  phaseObjective?: string | null;
  isCompleted: boolean;
  isCurrent: boolean;
  sections?: ExerciseSection[];
}

export interface ActiveSessionWorkflow {
  phaseSessionId: number;
  appointmentId: number;
  appointmentDateTime: string;
  sessionLabel: string;
  branch: string;
  patientName: string;
  durationMinutes: number;
  lastSRPE: number;
  avgSRPE: number;
  hasPerformanceAlert: boolean;
  alertMessage: string;
  sessionType: 'Solo' | 'Swarm';
  sessionNumber: number;
  totalPlanSessions: number;
  status: string; // Scheduled | Confirmed | InProgress | Completed | NoShow | Cancelled
  actualStartTime?: string | null;
  exerciseProtocol?: ExercisePhase[] | null;
  sessionComment?: string | null;
}

export interface ActiveSessionResponse {
  patientInfo: PatientInfo;
  overallProgress: OverallProgress;
  workflow: ActiveSessionWorkflow;
}

export interface CompleteSessionPayload {
  notes?: string;
  followUpActivities?: string;
  exerciseLogs: Array<{
    sessionExerciseId: number;
    isCompleted: boolean;
    note?: string;
  }>;
}

export interface ReportAbsencePayload {
  reason: string;
}

export interface DayOverallSession {
  phaseSessionId: number;
  patientName: string;
  sessionInfo: string;
  status: string; // 'Completed' | 'Remaining' | 'InProgress' | 'NoShow' | ...
  rating: number | null;
}

export interface DayOverallResponse {
  sessionsFinished: number;
  performanceRating: number;
  groups: number;
  solo: number;
  lateNotes: number;
  transferredToAnother: number;
  sessionsInDetail: DayOverallSession[];
}
