import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

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

interface PendingTicketsJson {
  tab_decision: ApiTicket[];
  tab_urgent: ApiTicket[];
  tab_all: ApiTicket[];
  proposed_gap_fill: ApiTicket[];
}

// ── Service ───────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PendingTicketsService {
  private readonly http = inject(HttpClient);

  /** Fetch pending tickets for the given tab filter from the local JSON asset. */
  getTickets(tab: PendingTicketsTab = 'decision'): Observable<ApiTicket[]> {
    return this.http.get<PendingTicketsJson>('/assets/pending-tickets.json').pipe(
      map(json => {
        switch (tab) {
          case 'urgent':   return json.tab_urgent   ?? [];
          case 'all':      return [
            ...(json.tab_decision ?? []),
            ...(json.tab_urgent   ?? []),
            ...(json.tab_all      ?? []),
          ];
          case 'decision':
          default:
            return json.tab_decision ?? [];
        }
      })
    );
  }

  /** Approve a protocol modification (no-op in asset mode — logs to console). */
  approveModification(modificationRequestId: number, note: string | null = null): Observable<void> {
    console.log('[PendingTicketsService] approveModification', modificationRequestId, note);
    return new Observable<void>(obs => { obs.next(); obs.complete(); });
  }

  /** Revert a protocol modification (no-op in asset mode — logs to console). */
  revertModification(modificationRequestId: number, reason: string | null = null): Observable<void> {
    console.log('[PendingTicketsService] revertModification', modificationRequestId, reason);
    return new Observable<void>(obs => { obs.next(); obs.complete(); });
  }
}
