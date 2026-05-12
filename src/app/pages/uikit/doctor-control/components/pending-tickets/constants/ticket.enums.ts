export enum TicketType {
  PHASE_TRANSITION       = "Phase Transition",
  BLUEPRINT_CONSULTATION = "Blueprint Consultation",
  PROTOCOL_MODIFICATION  = "Protocol Modification",
  GRADUATION_READY       = "Graduation Ready",
  PHASE_TIMEOUT_ALERT    = "Phase Timeout Alert",
  COMPLIANCE_ALERT       = "Compliance Alert",
  STALE_DATA_WARNING     = "Stale Data Warning",
}

export enum TicketPriority {
  URGENT  = "urgent",
  WARNING = "warning",
  NORMAL  = "normal",
}

export enum ActionType {
  APPROVE                    = "approve",
  DEFER                      = "defer",
  VIEW_PROFILE               = "view_profile",
  OPEN_CONSULTATION          = "open_consultation",
  APPROVE_EDIT               = "approve_edit",
  REVERT_EDIT                = "revert_edit",
  VIEW_DIFF                  = "view_diff",
  OPEN_LEGACY_LAUNCH         = "open_legacy_launch",
  REVIEW_CRITERIA            = "review_criteria",
  ADJUST_THRESHOLDS          = "adjust_thresholds",
  REQUEST_MEASUREMENT        = "request_measurement",
  RE_EVALUATE                = "re_evaluate",
  ADMIN_CALL                 = "admin_call",
  EXTEND_PACKAGE             = "extend_package",
  PAUSE                      = "pause",
  REQUEST_REMEASUREMENT      = "request_remeasurement",
  APPROVE_WITH_JUSTIFICATION = "approve_with_justification",
}

export enum ActionStyle {
  PRIMARY = "primary",
  GHOST   = "ghost",
  DANGER  = "danger",
  WARNING = "warning",
  PURPLE  = "purple",
  DEFER   = "defer",
}

export enum MeasurementStatus {
  VALID   = "valid",
  EXPIRED = "expired",
}

export enum NotifyTarget {
  ATHLETE     = "Athlete",
  TEAM_LEADER = "Team Leader",
  ADMIN       = "Admin",
  ENGINEERS   = "Engineers",
}
