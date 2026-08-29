import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import {
  ActiveSessionResponse,
  CompleteSessionPayload,
  ReportAbsencePayload,
  ExercisePhase,
  DayOverallResponse
} from '../models/coach-dashboard.model';

const DEFAULT_EXERCISE_PROTOCOL: ExercisePhase[] = [
  {
    phaseId: 1,
    phaseName: 'Phase 1: Pain & Swelling Control',
    phaseObjective: 'Control initial swelling and regain early quadriceps activation.',
    isCompleted: true,
    isCurrent: false,
    sections: []
  },
  {
    phaseId: 2,
    phaseName: 'Phase 2: Range of Motion',
    phaseObjective: 'Restore full ROM, begin light strengthening, improve flexibility',
    isCompleted: false,
    isCurrent: true,
    sections: [
      {
        sectionId: 10,
        sectionName: 'Warm-up — 10 min',
        durationMinutes: 10,
        exercises: [
          {
            sessionExerciseId: 101,
            exerciseName: 'Stationary bike: 10-15 min (low resistance)',
            description: '1 × 10 min · Low resistance',
            sets: [{ setNumber: 1, reps: 10, intensity: 'Low' }],
            isCompleted: false,
            coachNote: ''
          },
          {
            sessionExerciseId: 102,
            exerciseName: 'Ankle Pumps',
            description: '2 × 20 reps · Both directions',
            sets: [{ setNumber: 1, reps: 20 }],
            isCompleted: false,
            coachNote: ''
          }
        ]
      },
      {
        sectionId: 11,
        sectionName: 'Main — 40 min',
        durationMinutes: 40,
        exercises: [
          {
            sessionExerciseId: 103,
            exerciseName: 'Heel slides',
            description: '3 × 15 reps · Track ROM angle',
            sets: [{ setNumber: 1, reps: 15 }],
            isCompleted: false,
            coachNote: ''
          },
          {
            sessionExerciseId: 104,
            exerciseName: 'Wall slides',
            description: '3 × 10 reps',
            sets: [{ setNumber: 1, reps: 10 }],
            isCompleted: false,
            coachNote: ''
          },
          {
            sessionExerciseId: 105,
            exerciseName: 'Mini squats (0-45°)',
            description: '3 × 10 reps · 0-45° range',
            sets: [{ setNumber: 1, reps: 10 }],
            isCompleted: false,
            coachNote: ''
          },
          {
            sessionExerciseId: 106,
            exerciseName: 'Step-ups (4-inch height)',
            description: '3 × 10 reps',
            sets: [{ setNumber: 1, reps: 10 }],
            isCompleted: false,
            coachNote: ''
          },
          {
            sessionExerciseId: 107,
            exerciseName: 'Hamstring curls',
            description: '3 × 12 reps · Light weight',
            sets: [{ setNumber: 1, reps: 12 }],
            isCompleted: false,
            coachNote: ''
          }
        ]
      },
      {
        sectionId: 12,
        sectionName: 'Cool-down — 10 min',
        durationMinutes: 10,
        exercises: [
          {
            sessionExerciseId: 108,
            exerciseName: 'Calf raises',
            description: '3 × 15 reps',
            sets: [{ setNumber: 1, reps: 15 }],
            isCompleted: false,
            coachNote: ''
          }
        ]
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class CoachDashboardService {
  private readonly apiService = inject(ApiService);

  /**
   * GET /api/CoachDashboard/active-session
   * Returns active/upcoming session or null if no session available today.
   */
  getActiveSession(): Observable<ActiveSessionResponse | null> {
    return this.apiService.get<ActiveSessionResponse | null>('CoachDashboard/active-session');
  }

  /**
   * PUT /api/CoachDashboard/sessions/{phaseSessionId}/start
   * Sets Appointment.Status = InProgress & ActualStartTime = UtcNow
   */
  startSession(phaseSessionId: number): Observable<{ message: string; actualStartTime?: string }> {
    return this.apiService.put<{ message: string; actualStartTime?: string }>(
      `CoachDashboard/sessions/${phaseSessionId}/start`,
      {}
    );
  }

  /**
   * PUT /api/CoachDashboard/sessions/{phaseSessionId}/report-absence
   */
  reportAbsence(phaseSessionId: number, payload: ReportAbsencePayload): Observable<{ message: string }> {
    return this.apiService.put<{ message: string }>(
      `CoachDashboard/sessions/${phaseSessionId}/report-absence`,
      payload
    );
  }

  /**
   * PUT /api/CoachDashboard/sessions/{phaseSessionId}/complete
   */
  completeSession(phaseSessionId: number, payload: CompleteSessionPayload): Observable<{ message: string }> {
    return this.apiService.put<{ message: string }>(
      `CoachDashboard/sessions/${phaseSessionId}/complete`,
      payload
    );
  }

  /**
   * GET /api/CoachDashboard/day-overall
   * Returns end-of-day summary stats and sessions in detail for today.
   */
  getDayOverall(): Observable<DayOverallResponse> {
    return this.apiService.get<DayOverallResponse>('CoachDashboard/day-overall');
  }

  getDefaultProtocol(): ExercisePhase[] {
    return JSON.parse(JSON.stringify(DEFAULT_EXERCISE_PROTOCOL));
  }
}
