import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';

// ── API enums ──────────────────────────────────────────────────────────

/** ticketType numeric values from the API */
export enum ApiTicketType {
  BlueprintConsultation = 0,
  ProtocolModification = 1,
  ComplianceAlert = 2,
  GraduationReady = 3,
  PhaseTimeoutAlert = 4,
  StaleDataWarning = 5,
  DirectBlueprintAwaitingPlan = 6,
  ReportAcceptedAwaitingPlan = 7,
  AssignCoachManager = 9,
}

/** urgency numeric values from the API */
export enum ApiUrgency {
  Urgent = 0,
  NeedsReview = 1,
  Waiting = 2,
  Ready = 3,
  Graduation = 4,
}

// ── API shapes ────────────────────────────────────────────────────────

export interface ApiTicketAction {
  label: string;
  action: string;
  style: 'primary' | 'secondary' | 'warning' | 'danger';
}

export interface ApiTicket {
  ticketId: string;
  ticketType: ApiTicketType;
  typeLabel: string;
  patientId: number;
  patientName: string;
  description: string;
  subDescription: string | null;
  urgency: ApiUrgency;
  urgencyLabel: string;
  createdAt: string;
  slaLabel: string | null;
  metrics: Record<string, string> | null;
  actions: ApiTicketAction[];
  appointmentId: number | null;
  treatmentPlanId: number | null;
  modificationRequestId: number | null;
  consultationDecisionId?: number | null;
  medicalReportId?: number | null;
}

// --- Protocol Modification Details --- //
export type ChangeType = 'AddExercise' | 'UpdateExercise' | 'RemoveExercise' | 'ReorderExercises' | 'Legacy';

export interface ProposedChange {
  [key: string]: any; // Flexible to accommodate different changeType structures
}

export interface ProtocolModificationDetails {
  id: number;
  treatmentPlanId: number;
  planName: string;
  phaseId: number;
  phaseName: string;
  phaseOrder: number;
  changeType: ChangeType;
  description: string;
  requestedById: number;
  requestedByName: string;
  status: 'Pending' | 'Approved' | 'Refused' | 'Outdated';
  coachManagerId: number;
  doctorNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  proposedChange: ProposedChange;
}

export type PendingTicketsTab = 'decision' | 'urgent' | 'all';

// ── Service ───────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PendingTicketsService {
  private readonly BASE_URL = environment.apiUrl + 'PendingTickets';
  private readonly http = inject(HttpClient);

  /** Fetch pending tickets for the given tab filter. */
  getTickets(tab: PendingTicketsTab = 'decision'): Observable<ApiTicket[]> {
    return this.http.get<ApiTicket[]>(this.BASE_URL, { params: { tab } });
  }

  /** Fetch details of a specific protocol modification request. */
  getModificationDetails(modificationRequestId: number): Observable<ProtocolModificationDetails> {
    return this.http.get<ProtocolModificationDetails>(`${this.BASE_URL}/protocol-modification/${modificationRequestId}`);
  }

  /** Approve a protocol modification by its modificationRequestId. */
  approveModification(modificationRequestId: number, notifyPatient: boolean = false, note: string | null = null): Observable<void> {
    const url = `${this.BASE_URL}/protocol-modification/${modificationRequestId}/approve`;
    const params = { notifyPatient: notifyPatient.toString() };
    return this.http.post<void>(url, note !== null ? JSON.stringify(note) : null, { params, headers: { 'Content-Type': 'application/json' } });
  }

  /** Revert a protocol modification by its modificationRequestId. */
  revertModification(modificationRequestId: number, reason: string | null = null): Observable<void> {
    const url = `${this.BASE_URL}/protocol-modification/${modificationRequestId}/revert`;
    return this.http.post<void>(url, reason !== null ? JSON.stringify(reason) : null, { headers: { 'Content-Type': 'application/json' } });
  }
}
