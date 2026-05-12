import {
  TicketType,
  TicketPriority,
  ActionType,
  ActionStyle,
  MeasurementStatus,
  NotifyTarget
} from '../constants/ticket.enums';

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface TicketAction {
  label: string;
  type: ActionType;
  style?: ActionStyle;
}

// ─── Metrics ─────────────────────────────────────────────────────────────────

export interface PhaseTransitionMetrics {
  LSI: string;
  VAS: number;
  ROM: string;
}

export interface GraduationMetrics {
  LSI: string;
  VAS: number;
  Hop_Test: string;
}

export interface PhaseTimeoutMetrics {
  expected_duration: string;
  actual_duration: string;
  ROM: {
    current: string;
    target: string;
  };
  Quad_LSI: {
    current: string;
    target: string;
  };
}

export interface MeasurementMetric {
  last_measured_days_ago: number;
  max_allowed_days: number;
  status: MeasurementStatus;
}

export interface StaleDataMetrics {
  VAS: MeasurementMetric;
  Quad_LSI: MeasurementMetric;
  ROM: MeasurementMetric;
}

// ─── Defer Options (Ticket 1) ─────────────────────────────────────────────────

export interface NotifyOption {
  label: NotifyTarget;
  default_checked: boolean;
}

export interface DeferOptions {
  notify: NotifyOption[];
}

// ─── Protocol Diff (Ticket 3) ─────────────────────────────────────────────────

export interface AddedExercise {
  exercise: string;
  sets: number;
  reps: number;
  resistance: string;
  phase: number;
  added_by: string;
  time_ago: string;
}

export interface ModifiedExercise {
  exercise: string;
  before: string;
  after: string;
  reason: string;
}

export interface ProtocolDiff {
  added: AddedExercise[];
  modified: ModifiedExercise[];
  unchanged_exercises_count: number;
}

// ─── Package Impact (Ticket 6) ────────────────────────────────────────────────

export interface SessionInfo {
  attended: number;
  total: number;
}

export interface PackageImpact {
  unused_sessions: number;
  estimated_loss_egp: number;
}

// ─── Ticket Variants ──────────────────────────────────────────────────────────

export interface BaseTicket {
  id: number;
  type: TicketType;
  priority: TicketPriority;
  client: string;
  description: string;
  actions: TicketAction[];
  badge?: string;
  time_ago?: string;
}

export interface PhaseTransitionTicket extends BaseTicket {
  type: TicketType.PHASE_TRANSITION;
  program: string;
  sla: string;
  metrics: PhaseTransitionMetrics;
  defer_options: DeferOptions;
}

export interface BlueprintConsultationTicket extends BaseTicket {
  type: TicketType.BLUEPRINT_CONSULTATION;
  sla: string;
  issue: string;
  notes: string;
}

export interface ProtocolModificationTicket extends BaseTicket {
  type: TicketType.PROTOCOL_MODIFICATION;
  program: string;
  modification_status: string;
  protocol_diff: ProtocolDiff;
}

export interface GraduationReadyTicket extends BaseTicket {
  type: TicketType.GRADUATION_READY;
  program: string;
  metrics: GraduationMetrics;
}

export interface PhaseTimeoutTicket extends BaseTicket {
  type: TicketType.PHASE_TIMEOUT_ALERT;
  metrics: PhaseTimeoutMetrics;
}

export interface ComplianceAlertTicket extends BaseTicket {
  type: TicketType.COMPLIANCE_ALERT;
  compliance_rate: string;
  threshold: string;
  sessions: SessionInfo;
  package_impact: PackageImpact;
}

export interface StaleDataTicket extends BaseTicket {
  type: TicketType.STALE_DATA_WARNING;
  metrics: StaleDataMetrics;
}

// ─── Union Type ───────────────────────────────────────────────────────────────

export type Ticket =
  | PhaseTransitionTicket
  | BlueprintConsultationTicket
  | ProtocolModificationTicket
  | GraduationReadyTicket
  | PhaseTimeoutTicket
  | ComplianceAlertTicket
  | StaleDataTicket;

// ─── API Response ─────────────────────────────────────────────────────────────

export interface TicketsResponse {
  tickets: Ticket[];
}
