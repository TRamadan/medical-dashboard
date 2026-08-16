import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';

// ── API enums ──────────────────────────────────────────────────────────

/** ticketType numeric values from the API */
export enum ApiTicketType {
  BlueprintConsultation = 0,
  ProtocolModification  = 1,
  ComplianceAlert       = 2,
  GraduationReady       = 3,
  PhaseTimeoutAlert     = 4,
  StaleDataWarning      = 5,
}

/** urgency numeric values from the API */
export enum ApiUrgency {
  Urgent      = 0,
  NeedsReview = 1,
  Waiting     = 2,
  Ready       = 3,
  Graduation  = 4,
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

  /** Approve a protocol modification by its modificationRequestId. */
  approveModification(modificationRequestId: number, note: string | null = null): Observable<void> {
    const url = `${this.BASE_URL}/protocol-modification/${modificationRequestId}/approve`;
    return this.http.post<void>(url, note !== null ? JSON.stringify(note) : null, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /** Revert a protocol modification by its modificationRequestId. */
  revertModification(modificationRequestId: number, reason: string | null = null): Observable<void> {
    const url = `${this.BASE_URL}/protocol-modification/${modificationRequestId}/revert`;
    return this.http.post<void>(url, reason !== null ? JSON.stringify(reason) : null, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
