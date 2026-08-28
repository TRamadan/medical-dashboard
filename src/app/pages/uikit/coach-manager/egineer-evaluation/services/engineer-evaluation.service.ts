import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../../service/api.service';
import {
  EngineerEvaluationsResponseDto,
  SaveEngineerEvaluationDto
} from '../../models/coach-manager-api.model';

const MOCK_EVALUATIONS_RESPONSE: EngineerEvaluationsResponseDto = {
  weekStart: '2026-08-25',
  weekEnd: '2026-08-31',
  evaluations: [
    {
      evaluationId: 1,
      coachId: 5,
      coachName: 'Eng. Karim Mostafa',
      stationLabel: 'Junior • Recharger Station',
      overallScore: 2.8,
      compositeOutOf100: 56,
      performanceLabel: 'Needs Attention',
      sessionQuality: 1.9,
      protocolCoherence: 3.5,
      attendancePunctuality: 2.0,
      clientRatings: 0.8,
      professionalDev: 1.9,
      mainPointForImprovement: 'Delaying session starts is still a recurring issue.',
      keyStrengths: 'Showed interest in learning new VBT techniques this week.'
    },
    {
      evaluationId: 2,
      coachId: 6,
      coachName: 'Eng. Sarah Mohamed',
      stationLabel: 'Senior • Resilience Station',
      overallScore: 4.5,
      compositeOutOf100: 90,
      performanceLabel: 'Excellent Performance',
      sessionQuality: 4.6,
      protocolCoherence: 4.8,
      attendancePunctuality: 4.9,
      clientRatings: 4.2,
      professionalDev: 4.0,
      mainPointForImprovement: 'Documentation sharing in the sRPE system could be faster.',
      keyStrengths: 'Her initiative in group sessions was exceptional. Motivation level in Calibration Report 3.4.'
    },
    {
      evaluationId: 3,
      coachId: 7,
      coachName: 'Eng. Amr Ahmed',
      stationLabel: 'Junior • Apex Station',
      overallScore: 3.5,
      compositeOutOf100: 70,
      performanceLabel: 'Continuous Improvement',
      sessionQuality: 3.6,
      protocolCoherence: 4.0,
      attendancePunctuality: 3.8,
      clientRatings: 3.1,
      professionalDev: 3.0,
      mainPointForImprovement: 'Building trust with athletes - seems overly cautious in instructions.',
      keyStrengths: 'Clear improvement in reading phase three protocols.'
    }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class EngineerEvaluationService {
  private readonly apiService = inject(ApiService);

  /**
   * GET /api/CoachManagerDashboard/evaluations?from=YYYY-MM-DD&to=YYYY-MM-DD
   */
  getEvaluations(from?: string, to?: string): Observable<EngineerEvaluationsResponseDto> {
    let url = 'CoachManagerDashboard/evaluations';
    const params: string[] = [];
    if (from) params.push(`from=${encodeURIComponent(from)}`);
    if (to) params.push(`to=${encodeURIComponent(to)}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.apiService.get<EngineerEvaluationsResponseDto>(url).pipe(
      catchError(err => {
        console.warn('API getEvaluations failed:', err);
        return of({
          weekStart: from || '',
          weekEnd: to || '',
          evaluations: []
        });
      })
    );
  }

  /**
   * POST /api/CoachManagerDashboard/evaluations (single evaluation save)
   */
  saveEvaluation(dto: SaveEngineerEvaluationDto): Observable<void> {
    return this.apiService.post<void>('CoachManagerDashboard/evaluations', dto).pipe(
      catchError(err => {
        console.warn('API saveEvaluation failed, applying local fallback:', err);
        return of(void 0);
      })
    );
  }

  /**
   * POST multiple evaluations sequentially/parallel
   */
  saveBulkEvaluations(dtos: SaveEngineerEvaluationDto[]): Observable<void[]> {
    if (!dtos || dtos.length === 0) {
      return of([]);
    }
    const calls = dtos.map(d => this.saveEvaluation(d));
    return forkJoin(calls);
  }
}
