import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../../service/api.service';
import { TeamPerformanceDto } from '../../models/coach-manager-api.model';

const MOCK_TEAM_PERFORMANCE: TeamPerformanceDto = {
  sRPEDistribution: [
    { coachId: 5, coachName: 'Eng. Karim', averageSRPE: 6.2, percentOfTeam: 45 },
    { coachId: 6, coachName: 'Eng. Sarah', averageSRPE: 4.1, percentOfTeam: 30 },
    { coachId: 7, coachName: 'Eng. Amr', averageSRPE: 3.5, percentOfTeam: 25 }
  ],
  burnoutWarning: true,
  burnoutWarningMessage: 'Monitoring sRPE — Eng. Karim may need reduced load.',
  teamQualityScore: 4.6,
  coachCards: [
    {
      coachId: 5,
      coachName: 'Eng. Karim',
      stationLabel: 'Senior • Recharger • 3 years experience',
      compositeScore: 3.9,
      compositeScoreOutOf100: 78,
      trend: 'Improving',
      sessionQuality: 4.2,
      protocolCoherence: 3.8,
      attendancePunctuality: 3.5,
      clientRatings: 4.0,
      professionalDev: 3.9,
      latestInsight: 'Delaying session starts is still a recurring issue.'
    },
    {
      coachId: 6,
      coachName: 'Eng. Sarah',
      stationLabel: 'Senior • Resilience • 4 years experience',
      compositeScore: 4.6,
      compositeScoreOutOf100: 92,
      trend: 'Improved',
      sessionQuality: 4.8,
      protocolCoherence: 4.6,
      attendancePunctuality: 5.0,
      clientRatings: 4.9,
      professionalDev: 4.4,
      latestInsight: 'Smart graduation - tracking the athletic part excellently every 3 months.'
    },
    {
      coachId: 7,
      coachName: 'Eng. Amr',
      stationLabel: 'Junior • Apex • 8 months experience',
      compositeScore: 3.6,
      compositeScoreOutOf100: 72,
      trend: 'Improving',
      sessionQuality: 3.8,
      protocolCoherence: 4.0,
      attendancePunctuality: 4.5,
      clientRatings: 3.8,
      professionalDev: 3.25,
      latestInsight: 'Sometimes appears excessive in every session - normal progress for a beginner, review protocol weekly.'
    }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class TeamPerformanceService {
  private readonly apiService = inject(ApiService);

  /**
   * GET /api/CoachManagerDashboard/team-performance
   */
  getTeamPerformance(): Observable<TeamPerformanceDto> {
    return this.apiService.get<TeamPerformanceDto>('CoachManagerDashboard/team-performance').pipe(
      catchError(err => {
        console.warn('API getTeamPerformance failed:', err);
        return of({
          sRPEDistribution: [],
          burnoutWarning: false,
          burnoutWarningMessage: '',
          teamQualityScore: 0,
          coachCards: []
        });
      })
    );
  }
}
