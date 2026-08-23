import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

export interface ApiScheduleItem {
  appointmentId: number;
  patientName: string;
  appointmentType: string;
  statusBadge: string;
  time: string;
  colorIndicator: string;
}

export interface ApiPriorityAction {
  label: string;
  action: string;
  style: 'primary' | 'secondary' | 'warning' | 'danger';
}

export interface ApiPriorityItem {
  ticketId: string;
  ticketType: number;
  typeLabel: string;
  patientId: number;
  patientName: string;
  description: string;
  subDescription: string | null;
  urgency: number;
  urgencyLabel: string;
  createdAt: string;
  slaLabel: string | null;
  metrics: unknown | null;
  actions: ApiPriorityAction[];
  appointmentId: number | null;
  treatmentPlanId: number | null;
  modificationRequestId: number | null;
}

export interface DoctorDashboardResponse {
  todayConsultationsCount: number;
  remainingFromYesterday: number;
  pendingDecisionsCount: number;
  clarityScoreNPS: number;
  negativeFeedbackCount: number;
  todaySchedule: ApiScheduleItem[];
  priorityItems: ApiPriorityItem[];
}

interface DashboardJsonRoot {
  primary_seeded_scenario: DoctorDashboardResponse;
  [key: string]: DoctorDashboardResponse;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  getDashboardData() {
    return this.http
      .get<DashboardJsonRoot>('/assets/dashboard.json')
      .pipe(map(json => json['primary_seeded_scenario']));
  }
}
