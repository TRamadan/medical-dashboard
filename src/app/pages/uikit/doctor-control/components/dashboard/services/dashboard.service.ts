import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
interface DoctorDashboardResponse {
  todayConsultationsCount: number;
  remainingFromYesterday: number;
  pendingDecisionsCount: number;
  clarityScoreNPS: number;
  negativeFeedbackCount: number;
  todaySchedule: ApiScheduleItem[];
  priorityItems: ApiPriorityItem[];
}
interface ApiScheduleItem {
  name?: string;          // TODO: confirm actual field name (e.g. patientName)
  time?: string;
  status?: string;        // e.g. 'New' | 'Revise' | 'Plan' -> drives badge
  details?: string;
}

interface ApiPriorityItem {
  name?: string;          // TODO: confirm actual field name (e.g. patientName)
  summary?: string;
  details?: string;
  priority?: string;      // e.g. 'Urgent' | 'Waiting' | 'Ready' -> drives dot/action label
}
@Injectable({
  providedIn: 'root'
})

export class DashboardService {
  private readonly DASHBOARD_API_URL = environment.apiUrl + 'DoctorDashboard';
  private readonly http = inject(HttpClient);

  getDashboardData() {
    return this.http.get<DoctorDashboardResponse>(this.DASHBOARD_API_URL)
  }

}
