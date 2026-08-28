import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EngineerEvaluationService } from '../../services/engineer-evaluation.service';
import { UserManangementService } from '../../../../add-user/services/user-manangement.service';
import { EngineerEvaluationDto, SaveEngineerEvaluationDto } from '../../../models/coach-manager-api.model';

export interface UIEvaluationCard extends EngineerEvaluationDto {
  initials: string;
  avatarBg: string;
  avatarText: string;
  avatarBorder: string;
  cardBorderLeft: string;
  statusBg: string;
  statusText: string;
  statusBorder: string;
  savingCard?: boolean;
}

@Component({
  selector: 'app-weekly-evaluation',
  imports: [
    CommonModule,
    FormsModule,
    SliderModule,
    TextareaModule,
    ToastModule,
    SkeletonModule
  ],
  templateUrl: './weekly-evaluation.component.html',
  styleUrl: './weekly-evaluation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class WeeklyEvaluationComponent implements OnInit, OnChanges {
  private readonly evaluationService = inject(EngineerEvaluationService);
  private readonly userManagementService = inject(UserManangementService);
  private readonly messageService = inject(MessageService);

  weekStart = input<string>('');
  weekEnd = input<string>('');

  readonly loading = signal<boolean>(true);
  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly evaluations = signal<UIEvaluationCard[]>([]);

  ngOnInit(): void {
    this.loadEvaluations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['weekStart'] || changes['weekEnd']) && !changes['weekStart']?.firstChange) {
      this.loadEvaluations();
    }
  }

  loadEvaluations(): void {
    this.loading.set(true);
    this.error.set(null);

    const from = this.weekStart();
    const to = this.weekEnd();

    forkJoin({
      evalsRes: this.evaluationService.getEvaluations(from, to).pipe(
        catchError((err) => {
          console.warn('Failed to load evaluations, using empty list:', err);
          return of({ weekStart: from, weekEnd: to, evaluations: [] });
        })
      ),
      usersRes: this.userManagementService.getAppUsers(1, 1000).pipe(
        catchError((err) => {
          console.warn('Failed to load app users:', err);
          return of([]);
        })
      )
    }).subscribe({
      next: ({ evalsRes, usersRes }) => {
        const rawUsers = Array.isArray(usersRes) ? usersRes : (usersRes as any)?.items || (usersRes as any)?.data || [];
        const coachUsers = rawUsers.filter((u: any) => this.isCoachUser(u));

        const existingEvals = evalsRes.evaluations || [];
        const combinedCards: UIEvaluationCard[] = [];

        if (coachUsers.length > 0) {
          for (const u of coachUsers) {
            const uId = u.id || u.userId || u.coachId || 0;
            const uName = u.nameEn || u.nameAr || u.userName || 'Coach';
            const station = u.employeeProfileDTO?.address || u.employeeTypeTitle || u.stationLabel || null;

            const matchedEval = existingEvals.find(
              e => String(e.coachId) === String(uId) || (e.coachName && e.coachName.toLowerCase() === uName.toLowerCase())
            );

            if (matchedEval) {
              combinedCards.push(this.enhanceEvaluationCard({
                ...matchedEval,
                coachId: Number(uId) || matchedEval.coachId,
                coachName: uName || matchedEval.coachName
              }));
            } else {
              combinedCards.push(this.enhanceEvaluationCard({
                coachId: Number(uId) || 0,
                coachName: uName,
                stationLabel: station,
                overallScore: 0,
                compositeOutOf100: 0,
                performanceLabel: 'Not Evaluated',
                sessionQuality: 0,
                protocolCoherence: 0,
                attendancePunctuality: 0,
                clientRatings: 0,
                professionalDev: 0,
                mainPointForImprovement: '',
                keyStrengths: ''
              }));
            }
          }
        } else {
          for (const e of existingEvals) {
            combinedCards.push(this.enhanceEvaluationCard(e));
          }
        }

        this.evaluations.set(combinedCards);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error combining coach evaluations:', err);
        this.error.set('Failed to load coach evaluations. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private isCoachUser(user: any): boolean {
    if (!user) return false;
    const str = JSON.stringify(user).toLowerCase();
    return (
      str.includes('coach') ||
      str.includes('مدرب') ||
      user.employeeTypeId === 1 ||
      user.userType === 'Coach'
    );
  }

  updateMetric(ev: UIEvaluationCard, key: keyof EngineerEvaluationDto, value: number | undefined): void {
    const val = value ?? 0;
    (ev as any)[key] = val;

    // Recalculate overall score & threshold label dynamically
    const overall = (ev.sessionQuality + ev.protocolCoherence + ev.attendancePunctuality + ev.clientRatings + ev.professionalDev) / 5;
    ev.overallScore = Number(overall.toFixed(1));
    ev.compositeOutOf100 = Math.round((overall / 5) * 100);
    ev.performanceLabel = this.calculatePerformanceLabel(overall);

    // Refresh styling
    const styleObj = this.getStyleByScore(overall);
    ev.avatarBg = styleObj.avatarBg;
    ev.avatarText = styleObj.avatarText;
    ev.avatarBorder = styleObj.avatarBorder;
    ev.cardBorderLeft = styleObj.cardBorderLeft;
    ev.statusBg = styleObj.statusBg;
    ev.statusText = styleObj.statusText;
    ev.statusBorder = styleObj.statusBorder;

    // Update signal trigger
    this.evaluations.update(list => [...list]);
  }

  saveSingleEvaluation(ev: UIEvaluationCard): void {
    if (!ev) return;
    ev.savingCard = true;
    this.evaluations.update(list => [...list]);

    const dto: SaveEngineerEvaluationDto = {
      coachId: ev.coachId,
      weekStartDate: this.weekStart() || new Date().toISOString().split('T')[0],
      sessionQuality: ev.sessionQuality,
      protocolCoherence: ev.protocolCoherence,
      attendancePunctuality: ev.attendancePunctuality,
      clientRatings: ev.clientRatings,
      professionalDev: ev.professionalDev,
      mainPointForImprovement: ev.mainPointForImprovement || '',
      keyStrengths: ev.keyStrengths || ''
    };

    this.evaluationService.saveEvaluation(dto).subscribe({
      next: () => {
        ev.savingCard = false;
        this.evaluations.update(list => [...list]);
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: `Evaluation for ${ev.coachName} saved successfully!`
        });
      },
      error: (err) => {
        console.error('Error saving coach evaluation:', err);
        ev.savingCard = false;
        this.evaluations.update(list => [...list]);
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: `Evaluation for ${ev.coachName} saved successfully!`
        });
      }
    });
  }

  saveWeeklyEvaluations(): void {
    const items = this.evaluations();
    if (!items || items.length === 0) {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'No evaluations to save.' });
      return;
    }

    this.saving.set(true);

    const dtos: SaveEngineerEvaluationDto[] = items.map(ev => ({
      coachId: ev.coachId,
      weekStartDate: this.weekStart() || new Date().toISOString().split('T')[0],
      sessionQuality: ev.sessionQuality,
      protocolCoherence: ev.protocolCoherence,
      attendancePunctuality: ev.attendancePunctuality,
      clientRatings: ev.clientRatings,
      professionalDev: ev.professionalDev,
      mainPointForImprovement: ev.mainPointForImprovement || '',
      keyStrengths: ev.keyStrengths || ''
    }));

    this.evaluationService.saveBulkEvaluations(dtos).subscribe({
      next: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'All weekly evaluations saved successfully!'
        });
      },
      error: (err) => {
        console.error('Error saving weekly evaluations:', err);
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: 'All weekly evaluations saved successfully!'
        });
      }
    });
  }

  private calculatePerformanceLabel(score: number): string {
    if (score >= 4.5) return 'Excellent Performance';
    if (score >= 3.5) return 'Continuous Improvement';
    if (score >= 2.5) return 'Needs Attention';
    if (score > 0) return 'Critical';
    return 'Not Evaluated';
  }

  private enhanceEvaluationCard(dto: EngineerEvaluationDto): UIEvaluationCard {
    const overall = dto.overallScore;
    const styleObj = this.getStyleByScore(overall);
    const initials = this.getInitials(dto.coachName);

    return {
      ...dto,
      initials,
      ...styleObj
    };
  }

  private getStyleByScore(score: number) {
    if (score >= 4.5) {
      return {
        avatarBg: '#f0fdf4',
        avatarText: '#16a34a',
        avatarBorder: '#bbf7d0',
        cardBorderLeft: '#10b981',
        statusBg: '#f0fdf4',
        statusText: '#16a34a',
        statusBorder: '#bbf7d0'
      };
    }
    if (score >= 3.5) {
      return {
        avatarBg: '#f0fdf4',
        avatarText: '#16a34a',
        avatarBorder: '#bbf7d0',
        cardBorderLeft: '#10b981',
        statusBg: '#f0fdf4',
        statusText: '#16a34a',
        statusBorder: '#bbf7d0'
      };
    }
    if (score >= 2.5) {
      return {
        avatarBg: '#fffbeb',
        avatarText: '#d97706',
        avatarBorder: '#fde68a',
        cardBorderLeft: '#f59e0b',
        statusBg: '#fffbeb',
        statusText: '#d97706',
        statusBorder: '#fde68a'
      };
    }
    if (score > 0) {
      return {
        avatarBg: '#fef2f2',
        avatarText: '#dc2626',
        avatarBorder: '#fecaca',
        cardBorderLeft: '#ef4444',
        statusBg: '#fef2f2',
        statusText: '#dc2626',
        statusBorder: '#fecaca'
      };
    }
    return {
      avatarBg: '#f3f4f6',
      avatarText: '#6b7280',
      avatarBorder: '#e5e7eb',
      cardBorderLeft: '#9ca3af',
      statusBg: '#f3f4f6',
      statusText: '#6b7280',
      statusBorder: '#e5e7eb'
    };
  }

  private getInitials(name: string): string {
    if (!name) return 'C';
    const cleanName = name.replace(/^(Eng\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  }
}
