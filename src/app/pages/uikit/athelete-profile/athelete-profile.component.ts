import {
  Component, ChangeDetectionStrategy, signal, computed, inject, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabViewModule } from 'primeng/tabview';
import { RatingModule } from 'primeng/rating';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProfileOverviewComponent } from './components/profile-overview/profile-overview.component';
import { InjuryHistoryComponent } from './components/injury-history/injury-history.component';
import { ProgramPlanComponent } from './components/program-plan/program-plan.component';
import { MeasurementsDataComponent } from './components/measurements-data/measurements-data.component';
import { SessionLogComponent } from './components/session-log/session-log.component';
import { SurveysComponent } from './components/surveys/surveys.component';
import { ProfileSummarySideComponent } from './components/profile-summary-side/profile-summary-side.component';
import { QuickActionsSidebarComponent } from './components/quick-actions-sidebar/quick-actions-sidebar.component';

import { AtheleteprofileService } from './services/atheleteprofile.service';
import {
  AthleteSummary,
  OverviewData,
  InjuryHistoryData,
  ProgramPlanData,
  MeasurementsData,
  SessionLogData,
  SurveysData,
} from './models/athlete-profile.models';

@Component({
  selector: 'app-athelete-profile',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    TagModule,
    ProgressBarModule,
    TabViewModule,
    RatingModule,
    DividerModule,
    ToastModule,
    ProfileOverviewComponent,
    InjuryHistoryComponent,
    ProgramPlanComponent,
    MeasurementsDataComponent,
    SessionLogComponent,
    SurveysComponent,
    ProfileSummarySideComponent,
    QuickActionsSidebarComponent,
  ],
  templateUrl: './athelete-profile.component.html',
  styleUrl: './athelete-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class AtheleteProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svc = inject(AtheleteprofileService);
  private readonly messageService = inject(MessageService);

  // ── Patient ID ───────────────────────────────────────────────────────────────
  patientId = signal<number | null>(null);

  // ── Loading flags ─────────────────────────────────────────────────────────────
  loadingSummary  = signal(false);
  loadingOverview = signal(false);
  loadingInjury   = signal(false);
  loadingPlan     = signal(false);
  loadingMeasure  = signal(false);
  loadingSessions = signal(false);
  loadingSurveys  = signal(false);

  // ── Data signals ──────────────────────────────────────────────────────────────
  summary    = signal<AthleteSummary | null>(null);
  overview   = signal<OverviewData | null>(null);
  injury     = signal<InjuryHistoryData | null>(null);
  plan       = signal<ProgramPlanData | null>(null);
  measurements = signal<MeasurementsData | null>(null);
  sessions   = signal<SessionLogData | null>(null);
  surveys    = signal<SurveysData | null>(null);

  // ── Lazy-load flags (only first open triggers the API call) ─────────────────
  private injuryLoaded   = false;
  private planLoaded     = false;
  private measureLoaded  = false;
  private sessionsLoaded = false;
  private surveysLoaded  = false;

  // ── Derived header/KPI values ──────────────────────────────────────────────────
  readonly headerInitials = computed(() => {
    const s = this.summary();
    if (!s) return '?';
    const nameAr = s.nameAr || '';
    const nameEn = s.nameEn || '';
    const parts = (nameAr || nameEn).split(' ');
    return parts.length >= 2
      ? parts[0][0] + ' ' + parts[1][0]
      : (parts[0]?.[0] ?? '?');
  });

  readonly genderLabel = computed(() =>
    this.summary()?.genderId === 1 ? 'ذكر' : 'أنثى'
  );

  readonly kpiCards = computed(() => {
    const s = this.summary();
    if (!s) return [];
    const k = s.kpis;
    const cards: { label: string; value: number; target: string; color: string }[] = [];

    // Progress card
    cards.push({
      label: 'تقدم البرنامج',
      value: k.programProgressPercent,
      target: `${k.completedSessions} من ${k.totalSessions} جلسة`,
      color: 'var(--blue-500)',
    });

    // Phase criteria (max 2, exclude VAS tokens)
    const nonVas = (k.phaseCriteria ?? []).filter(
      c => !c.criterionType.toLowerCase().includes('vas')
    );
    nonVas.slice(0, 2).forEach(c => {
      const met     = c.isMet;
      const current = c.currentValue ?? '—';
      cards.push({
        label: c.criterionType,
        value: met === null ? 0 : (c.currentValue ?? 0),
        target: `الهدف ${c.operator} ${c.targetValue} ${c.unit ?? ''}`.trim(),
        color: met === true
          ? 'var(--green-500)'
          : met === false
          ? 'var(--orange-500)'
          : 'var(--gray-400)',
      });
    });

    // VAS card
    const vasValue = k.latestVas ?? 0;
    cards.push({
      label: 'آخر VAS',
      value: vasValue * 10, // display as percent bar out of 10
      target: k.vasAcceptableMax != null ? `مقبول ≤ ${k.vasAcceptableMax}` : '—',
      color: 'var(--teal-500)',
    });

    return cards;
  });

  readonly quickActions = signal([
    { label: 'فتح جلسة جديدة',      sub: 'حجز موعد الجلسة القادمة', icon: 'pi pi-plus-circle' },
    { label: 'جدولة قياسات دورية',  sub: 'القياس القادم',            icon: 'pi pi-calendar-plus' },
    { label: 'تعديل الخطة',         sub: 'تغيير تمرين أو مرحلة',    icon: 'pi pi-file-edit' },
    { label: 'إرسال إنذار للرياضي', sub: 'تكرار أو رسالة',           icon: 'pi pi-bell' },
    { label: 'بلاغ تنبيه سريع',     sub: 'إيقاف أو تعديل طارئ',    icon: 'pi pi-exclamation-triangle' },
  ]);

  ngOnInit(): void {
    const idParam = this.route.snapshot.queryParamMap.get('patientId')
      ?? this.route.snapshot.paramMap.get('patientId');
    if (idParam) {
      const numId = Number(idParam);
      if (!isNaN(numId)) {
        this.patientId.set(numId);
        this.loadSummary(numId);
        this.loadOverview(numId);
      }
    }
  }

  // ── Loaders ────────────────────────────────────────────────────────────────────
  loadSummary(id: number): void {
    this.loadingSummary.set(true);
    this.svc.getSummary(id).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loadingSummary.set(false);
      },
      error: () => {
        this.loadingSummary.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل بيانات الملف الشخصي' });
      },
    });
  }

  loadOverview(id: number): void {
    this.loadingOverview.set(true);
    this.svc.getOverview(id).subscribe({
      next: (data) => {
        this.overview.set(data);
        this.loadingOverview.set(false);
      },
      error: () => {
        this.loadingOverview.set(false);
      },
    });
  }

  onTabChange(index: number): void {
    const id = this.patientId();
    if (!id) return;
    switch (index) {
      case 1: // Injury & History
        if (!this.injuryLoaded) {
          this.injuryLoaded = true;
          this.loadingInjury.set(true);
          this.svc.getInjuryHistory(id).subscribe({
            next: d => { this.injury.set(d); this.loadingInjury.set(false); },
            error: ()  => this.loadingInjury.set(false),
          });
        }
        break;
      case 2: // Program & Plan
        if (!this.planLoaded) {
          this.planLoaded = true;
          this.loadingPlan.set(true);
          this.svc.getProgramPlan(id).subscribe({
            next: d => { this.plan.set(d); this.loadingPlan.set(false); },
            error: ()  => this.loadingPlan.set(false), // 404 = no plan
          });
        }
        break;
      case 3: // Measurements & Data
        if (!this.measureLoaded) {
          this.measureLoaded = true;
          this.loadingMeasure.set(true);
          this.svc.getMeasurements(id).subscribe({
            next: d => { this.measurements.set(d); this.loadingMeasure.set(false); },
            error: ()  => this.loadingMeasure.set(false),
          });
        }
        break;
      case 4: // Session Log
        if (!this.sessionsLoaded) {
          this.sessionsLoaded = true;
          this.loadSessionsPreview(id);
        }
        break;
      case 5: // Surveys
        if (!this.surveysLoaded) {
          this.surveysLoaded = true;
          this.loadingSurveys.set(true);
          this.svc.getSurveys(id).subscribe({
            next: d => { this.surveys.set(d); this.loadingSurveys.set(false); },
            error: ()  => this.loadingSurveys.set(false),
          });
        }
        break;
    }
  }

  loadSessionsPreview(id: number): void {
    this.loadingSessions.set(true);
    this.svc.getSessions(id, 5).subscribe({
      next: d => { this.sessions.set(d); this.loadingSessions.set(false); },
      error: ()  => this.loadingSessions.set(false),
    });
  }

  loadAllSessions(): void {
    const id = this.patientId();
    if (!id) return;
    this.loadingSessions.set(true);
    this.svc.getSessions(id).subscribe({
      next: d => { this.sessions.set(d); this.loadingSessions.set(false); },
      error: ()  => this.loadingSessions.set(false),
    });
  }
}
