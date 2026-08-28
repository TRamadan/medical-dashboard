// ─── Plan List ────────────────────────────────────────────────────────────────

export interface PlanSummaryDto {
  planId: number;
  planName: string;
  patientName: string;
  injuryCondition: string;
  totalSessions: number;
  unassignedSessions: number;
  totalWeeks: number;
}

// ─── Protocol Detail ──────────────────────────────────────────────────────────

export interface SetDto {
  setNumber: number;
  reps: number;
  intensity: string;
  tempo: string;
  restSeconds: number;
}

export interface ExerciseDto {
  sessionExerciseId: number;
  exerciseName: string;
  description: string;
  videoUrl: string;
  order: number;
  sets: SetDto[];
}

export interface SectionDto {
  sectionId: number;
  sectionName: string;
  durationMinutes: number;
  order: number;
  exercises: ExerciseDto[];
}

export interface PhaseSessionDto {
  phaseSessionId: number;
  sessionNumber: number;
  isMeasurementSession: boolean;
  sessionType: string;
  coachId: number | null;
  coachName: string | null;
  appointmentStatus: string;
  sections: SectionDto[];
}

export interface PhaseStationDto {
  stationId: number;
  stationName: string;
  order: number;
  coachId: number | null;
  coachName: string | null;
  isAssigned: boolean;
}

export interface PhaseDetailDto {
  phaseId: number;
  phaseName: string;
  phaseOrder: number;
  weeks: number;
  sessionsPerWeek: number;
  phaseObjective: string;
  sessionCount: number;
  sessions: PhaseSessionDto[];
  stations: PhaseStationDto[];
}

export interface ProtocolDetailDto {
  planId: number;
  planName: string;
  patientName: string;
  totalSessions: number;
  totalWeeks: number;
  phases: PhaseDetailDto[];
}

// ─── Add Exercise ─────────────────────────────────────────────────────────────

export interface AddSetDto {
  setNumber: number;
  reps: number;
  intensity: string;
  tempo: string;
  restSeconds: number;
}

export interface AddExerciseDto {
  phaseSessionId: number;
  sectionId: number;
  exerciseName: string;
  description: string;
  videoUrl: string;
  order: number;
  sets: AddSetDto[];
}

// ─── Reorder Exercises ────────────────────────────────────────────────────────

export interface ReorderItemDto {
  sessionExerciseId: number;
  order: number;
}

export interface ReorderExercisesDto {
  sectionId: number;
  exercises: ReorderItemDto[];
}

// ─── Station Management ───────────────────────────────────────────────────────

export interface CreateStationDto {
  stationName: string;
  order: number;
  coachId: number | null;
}

export interface StationAssignmentDto {
  stationId: number;
  coachId: number | null;
}

export interface SaveStationAssignmentsDto {
  stations: StationAssignmentDto[];
}

// ─── Coach Options ────────────────────────────────────────────────────────────

export interface CoachOptionDto {
  coachId: number;
  coachName: string;
}

// ─── Overview Tab DTOs ────────────────────────────────────────────────────────

export interface TeamScheduleSlotDto {
  time: string;
  status: string;
  statusColor?: string;
}

export interface TeamScheduleBriefDto {
  coachId: number;
  coachName: string;
  avatarInitial: string;
  slots: TeamScheduleSlotDto[];
}

export interface UrgentActionDto {
  actionType: 'CoachDelay' | 'NewPlan' | 'MeasurementUnassigned' | 'MissedSession' | string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  buttonLabel: string;
  phaseSessionId: number | null;
  appointmentId: number | null;
  planId: number | null;
}

export interface DashboardOverviewDto {
  openIssues: number;
  plansPendingAssignment: number;
  teamSessionsToday: number;
  sessionsFinished: number;
  sessionsUpcoming: number;
  teamScheduleBrief: TeamScheduleBriefDto[];
  urgentActions: UrgentActionDto[];
}

export interface PatientContactDto {
  patientName: string;
  phoneNumbers: string[];
}

export interface AssignCoachDto {
  coachId: number;
}

// ─── Team Performance DTOs ───────────────────────────────────────────────────

export interface SRPEItemDto {
  coachId: number;
  coachName: string;
  averageSRPE: number;
  percentOfTeam: number;
}

export interface CoachPerformanceCardDto {
  coachId: number;
  coachName: string;
  stationLabel: string | null;
  compositeScore: number;
  compositeScoreOutOf100: number;
  trend: 'Improved' | 'Improving' | 'Declining' | 'Stable' | string;
  sessionQuality: number;
  protocolCoherence: number;
  attendancePunctuality: number;
  clientRatings: number;
  professionalDev: number;
  latestInsight: string;
}

export interface TeamPerformanceDto {
  sRPEDistribution: SRPEItemDto[];
  burnoutWarning: boolean;
  burnoutWarningMessage: string;
  teamQualityScore: number;
  coachCards: CoachPerformanceCardDto[];
}

// ─── Engineer Evaluation DTOs ────────────────────────────────────────────────

export interface EngineerEvaluationDto {
  evaluationId?: number;
  coachId: number;
  coachName: string;
  stationLabel: string | null;
  overallScore: number;
  compositeOutOf100: number;
  performanceLabel: string;
  sessionQuality: number;
  protocolCoherence: number;
  attendancePunctuality: number;
  clientRatings: number;
  professionalDev: number;
  mainPointForImprovement: string;
  keyStrengths: string;
}

export interface EngineerEvaluationsResponseDto {
  weekStart: string;
  weekEnd: string;
  evaluations: EngineerEvaluationDto[];
}

export interface SaveEngineerEvaluationDto {
  coachId: number;
  weekStartDate: string;
  sessionQuality: number;
  protocolCoherence: number;
  attendancePunctuality: number;
  clientRatings: number;
  professionalDev: number;
  mainPointForImprovement: string;
  keyStrengths: string;
}

// ─── Team Schedule DTOs ──────────────────────────────────────────────────────

export interface TeamScheduleSessionDto {
  phaseSessionId: number;
  appointmentId: number | null;
  time: string;
  patientName: string;
  phaseName: string;
  sessionType: string;
  status: string;
  statusBadge: string;
  badgeColor: string;
  isUrgent: boolean;
}

export interface TeamScheduleCoachDto {
  coachId: number;
  coachName: string;
  stationLabel: string | null;
  sessions: TeamScheduleSessionDto[];
}

export interface TeamScheduleDto {
  date: string;
  coaches: TeamScheduleCoachDto[];
}




