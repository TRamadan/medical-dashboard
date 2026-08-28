import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import {
  PlanSummaryDto,
  ProtocolDetailDto,
  AddExerciseDto,
  ExerciseDto,
  ReorderExercisesDto,
  PhaseStationDto,
  CreateStationDto,
  SaveStationAssignmentsDto,
  CoachOptionDto
} from '../models/coach-manager-api.model';

@Injectable({
  providedIn: 'root'
})
export class EditProtocolService {
  private readonly apiService = inject(ApiService);

  /**
   * GET /api/CoachManagerDashboard/plans
   */
  getPlans(): Observable<PlanSummaryDto[]> {
    return this.apiService.get<PlanSummaryDto[]>('CoachManagerDashboard/plans');
  }

  /**
   * GET /api/CoachManagerDashboard/plans/{planId}/protocol
   */
  getProtocol(planId: number): Observable<ProtocolDetailDto> {
    return this.apiService.get<ProtocolDetailDto>(`CoachManagerDashboard/plans/${planId}/protocol`);
  }

  /**
   * POST /api/CoachManagerDashboard/phases/{phaseId}/exercises
   */
  addExercise(phaseId: number, body: AddExerciseDto): Observable<ExerciseDto> {
    return this.apiService.post<ExerciseDto>(`CoachManagerDashboard/phases/${phaseId}/exercises`, body);
  }

  /**
   * PUT /api/CoachManagerDashboard/phases/{phaseId}/exercises/reorder
   */
  reorderExercises(phaseId: number, body: ReorderExercisesDto): Observable<void> {
    return this.apiService.put<void>(`CoachManagerDashboard/phases/${phaseId}/exercises/reorder`, body);
  }

  /**
   * GET /api/CoachManagerDashboard/phases/{phaseId}/stations
   */
  getStations(phaseId: number): Observable<PhaseStationDto[]> {
    return this.apiService.get<PhaseStationDto[]>(`CoachManagerDashboard/phases/${phaseId}/stations`);
  }

  /**
   * POST /api/CoachManagerDashboard/phases/{phaseId}/stations
   */
  createStation(phaseId: number, body: CreateStationDto): Observable<PhaseStationDto> {
    return this.apiService.post<PhaseStationDto>(`CoachManagerDashboard/phases/${phaseId}/stations`, body);
  }

  /**
   * PUT /api/CoachManagerDashboard/phases/{phaseId}/stations
   */
  saveStationAssignments(phaseId: number, body: SaveStationAssignmentsDto): Observable<void> {
    return this.apiService.put<void>(`CoachManagerDashboard/phases/${phaseId}/stations`, body);
  }

  /**
   * Available performance engineers / coaches list
   * GET /api/CoachManagerDashboard/coaches (or fallback list)
   */
  getCoaches(): Observable<CoachOptionDto[]> {
    return this.apiService.get<CoachOptionDto[]>('CoachManagerDashboard/coaches');
  }
}
