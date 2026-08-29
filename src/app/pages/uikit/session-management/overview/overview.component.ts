import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Renderer2,
  ChangeDetectorRef,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { CoachDashboardService } from '../services/coach-dashboard.service';
import { ActiveSessionResponse, ExercisePhase } from '../models/coach-dashboard.model';

@Component({
  selector: 'app-overview',
  imports: [
    CommonModule,
    AccordionModule,
    CheckboxModule,
    InputTextModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    TextareaModule,
    CardModule,
    TooltipModule,
    ToastModule
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class OverviewComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly renderer = inject(Renderer2);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly document = inject(DOCUMENT);
  private readonly coachDashboardService = inject(CoachDashboardService);
  private readonly messageService = inject(MessageService);

  // ── Signals for API State ─────────────────────────────────────
  readonly loading = signal<boolean>(true);
  readonly error = signal<{ status?: number; message: string } | null>(null);
  readonly activeSession = signal<ActiveSessionResponse | null>(null);

  // ── Session State Signals ─────────────────────────────────────
  readonly isSessionStarted = signal<boolean>(false);
  readonly isPaused = signal<boolean>(false);
  readonly isTimerFinished = signal<boolean>(false);
  readonly sessionTimer = signal<string>('05:00');
  readonly remainingTimeSeconds = signal<number>(300);
  readonly elapsedSeconds = signal<number>(0);
  readonly sessionDurationSeconds = signal<number>(300);

  readonly displayNoShowDialog = signal<boolean>(false);
  readonly noShowReason = signal<string>('');
  readonly generalComment = signal<string>('');
  readonly followUpActivities = signal<string>('');
  readonly saveDraftSent = signal<boolean>(false);
  readonly displayHandoffDialog = signal<boolean>(false);
  readonly handoffChecklist = signal<string[]>([]);

  readonly isProtocolCtxOpen = signal<boolean>(false);
  readonly notifyDoctorSent = signal<boolean>(false);
  readonly activePanels = signal<number[]>([]);

  // ── Dynamic Protocol Phases Signal ────────────────────────────
  readonly phases = signal<any[]>([]);

  // ── Derived State via computed() ──────────────────────────────
  readonly patientData = computed(() => {
    const session = this.activeSession();
    if (!session?.patientInfo) {
      return {
        patientId: '',
        name: '',
        age: 0,
        gender: '',
        chiefComplaint: '',
        onsetDate: ''
      };
    }
    return {
      patientId: 'PT-202225',
      name: session.patientInfo.name,
      age: session.patientInfo.age,
      gender: session.patientInfo.gender,
      chiefComplaint: session.patientInfo.chiefComplaint,
      onsetDate: session.patientInfo.onsetDate
    };
  });

  readonly progressData = computed(() => {
    const session = this.activeSession();
    if (!session?.overallProgress) {
      return {
        completed: 0,
        total: 0,
        currentPhase: '',
        phaseSessionRange: '',
        progressPercent: 0
      };
    }
    return {
      completed: session.overallProgress.sessionsCompleted,
      total: session.overallProgress.totalSessions,
      currentPhase: session.overallProgress.currentPhase,
      phaseSessionRange: session.overallProgress.phaseSessionRange,
      progressPercent: session.overallProgress.progressPercent
    };
  });

  readonly workflowData = computed(() => {
    const session = this.activeSession();
    if (!session?.workflow) {
      return {
        phaseSessionId: 0,
        appointmentId: 0,
        dateTime: '',
        session: '',
        location: '',
        status: '',
        sessionType: 'Solo' as const,
        lastSRPE: 0,
        avgSRPE: 0,
        hasPerformanceAlert: false,
        alertMessage: ''
      };
    }
    return {
      phaseSessionId: session.workflow.phaseSessionId,
      appointmentId: session.workflow.appointmentId,
      dateTime: session.workflow.appointmentDateTime,
      session: session.workflow.sessionLabel,
      location: session.workflow.branch,
      status: session.workflow.status,
      sessionType: session.workflow.sessionType,
      lastSRPE: session.workflow.lastSRPE,
      avgSRPE: session.workflow.avgSRPE,
      hasPerformanceAlert: session.workflow.hasPerformanceAlert,
      alertMessage: session.workflow.alertMessage
    };
  });

  readonly sessionType = computed(() => this.workflowData().sessionType || 'Solo');

  readonly sessionMeta = computed(() => {
    const session = this.activeSession();
    const wf = session?.workflow;
    return {
      sessionNumber: wf?.sessionNumber ?? 0,
      totalSessions: wf?.totalPlanSessions ?? 0,
      stationDuration: `${wf?.durationMinutes ?? 0} min`,
      lastSRPE: wf?.lastSRPE ?? 0,
      avgSRPE4Wk: wf?.avgSRPE ?? 0,
      lastWellness: 5.2,
      sessionGoal: 'Full ROM + Weight Bearing'
    };
  });

  readonly sRPEData = computed(() => {
    const lastRPE = this.sessionMeta().lastSRPE;
    const avgRPE = this.sessionMeta().avgSRPE4Wk;
    const deviation = avgRPE > 0 ? (lastRPE - avgRPE) / avgRPE : 0;

    let color = 'mint';
    if (deviation > 0.3) color = 'amber';
    else if (deviation < -0.3) color = 'blue';

    const percent = Math.abs(Math.round(deviation * 100));
    const direction = deviation > 0 ? 'above' : 'below';
    const defaultTooltip = `Athlete's load is ${percent}% ${direction} 4-week average. Monitor for fatigue.`;

    const tooltip = this.workflowData().alertMessage || defaultTooltip;

    return { lastRPE, avgRPE, deviation, color, tooltip };
  });

  readonly timerSubtitle = computed(() => {
    if (this.sessionType() === 'Swarm') {
      const m = Math.floor(this.sessionDurationSeconds() / 60);
      return `Remaining of ${String(m).padStart(2, '0')}:00`;
    }
    return 'Session in progress — elapsed time';
  });

  readonly timerProgressPercent = computed(() => {
    if (this.sessionType() === 'Swarm') {
      const dur = this.sessionDurationSeconds();
      const rem = this.remainingTimeSeconds();
      return dur > 0 ? Math.round(((dur - rem) / dur) * 100) : 0;
    }
    return Math.min(100, Math.round((this.elapsedSeconds() / (60 * 60)) * 100));
  });

  readonly progressPercentage = computed(() => {
    if (!this.activeSession()?.overallProgress) return 0;
    return this.progressData().progressPercent ?? Math.round((this.progressData().completed / Math.max(1, this.progressData().total)) * 100);
  });

  // ── Protocol Context Panel Data ──────────────────────────────
  readonly protocolCtx = {
    phaseName: 'Phase 3 — Functional Strength Building',
    phaseNumber: 3,
    phaseTotal: 5,
    phaseProgress: 50,
    isApproachingTransition: true,
    criteria: [
      { label: 'ROM Flexion ≥ 120°', value: '124°', status: 'met' },
      { label: 'VAS ≤ 3 / 10', value: '2.5', status: 'met' },
      { label: 'Quad LSI ≥ 40%', value: '35%', percentOfTarget: 87, status: 'approaching' },
      { label: 'Avg sRPE ≤ 5', value: '6.2', percentOfTarget: 62, status: 'not-met' }
    ],
    doctorNotes: 'Athlete shows improvement in movement pattern but LSI is still below target. Do not increase exercise load until exceeding 40%. If pain noticed at Full Extension — stop and record immediately.',
    lastMeasurement: '18 March 2026',
    nextMeasurement: '25 March 2026'
  };

  readonly metCriteriaCount = computed(() => this.protocolCtx.criteria.filter(c => c.status === 'met').length);
  readonly totalCriteriaCount = computed(() => this.protocolCtx.criteria.length);

  // ── Station Handoff Chain (Swarm) ─────────────────────────────
  readonly stationChain = [
    { name: '—', engineer: 'Before You', status: 'done' },
    { name: 'Recharger', engineer: 'Eng. Karim (You)', status: 'current' },
    { name: 'Resilience', engineer: 'Eng. Sarah', status: 'next' },
    { name: 'Apex', engineer: 'Eng. Amr', status: 'pending' }
  ];

  @ViewChild('timerContainer') timerContainer!: ElementRef;
  @ViewChild('fabContainer') fabContainer!: ElementRef;
  @ViewChild('handoffSection') handoffSection!: ElementRef;

  readonly isHandoffVisible = signal<boolean>(false);
  private scrollListenerFn: (() => void) | null = null;
  private timerInterval: any;

  ngOnInit(): void {
    this.loadActiveSession();
  }

  loadActiveSession(): void {
    this.loading.set(true);
    this.error.set(null);

    this.coachDashboardService.getActiveSession().subscribe({
      next: (res) => {
        this.loading.set(false);
        this.activeSession.set(res);

        if (res && res.workflow) {
          const status = res.workflow.status;
          if (status === 'InProgress') {
            this.isSessionStarted.set(true);
          }
          if (res.workflow.exerciseProtocol && res.workflow.exerciseProtocol.length > 0) {
            this.setPhasesFromProtocol(res.workflow.exerciseProtocol);
          } else {
            this.setPhasesFromProtocol(this.coachDashboardService.getDefaultProtocol());
          }
          if (res.workflow.sessionComment) {
            this.generalComment.set(res.workflow.sessionComment);
          }
        } else {
          this.phases.set([]);
        }
      },
      error: (err: HttpErrorResponse | any) => {
        this.loading.set(false);
        this.activeSession.set(null);
        this.phases.set([]);

        const status = err?.status;
        let message = 'Failed to connect to the server.';

        if (status === 500) {
          message = 'Server Error (Status 500): Internal server error while fetching active session details.';
        } else if (status === 404) {
          message = 'Not Found (Status 404): Active session resource could not be found.';
        } else if (status === 401 || status === 403) {
          message = 'Unauthorized (Status ' + status + '): You do not have permissions for this dashboard.';
        } else if (err?.error?.message) {
          message = err.error.message;
        }

        this.error.set({ status, message });

        this.messageService.add({
          severity: 'error',
          summary: `HTTP Error ${status || 'Unknown'}`,
          detail: message,
          life: 5000
        });
      }
    });
  }

  private setPhasesFromProtocol(protocolPhases: ExercisePhase[]): void {
    const mapped = protocolPhases.map((phase) => ({
      id: phase.phaseId,
      title: phase.phaseName,
      weeks: phase.isCompleted ? 'Completed Phase' : phase.isCurrent ? 'Current Phase' : '',
      sessions: '',
      completed: phase.isCompleted,
      current: phase.isCurrent,
      objectives: phase.phaseObjective || '',
      sections: (phase.sections || []).map((sec) => ({
        label: sec.sectionName,
        exercises: (sec.exercises || []).map((ex) => ({
          sessionExerciseId: ex.sessionExerciseId,
          name: ex.exerciseName,
          params: ex.description || (ex.sets ? `${ex.sets.length} sets` : ''),
          completed: ex.isCompleted,
          noteVisible: !!ex.coachNote,
          note: ex.coachNote || ''
        }))
      }))
    }));

    this.phases.set(mapped);
  }

  ngAfterViewInit(): void {
    if (this.fabContainer) {
      this.renderer.appendChild(this.document.body, this.fabContainer.nativeElement);
    }

    this.scrollListenerFn = this.checkHandoffVisibility.bind(this);
    this.document.addEventListener('scroll', this.scrollListenerFn as any, true);
    window.addEventListener('resize', this.scrollListenerFn as any);

    setTimeout(() => this.checkHandoffVisibility(), 200);
  }

  checkHandoffVisibility(): void {
    const target = this.handoffSection ? this.handoffSection.nativeElement : this.document.getElementById('handoff-section');
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const isVisible = rect.top < windowHeight && rect.bottom > 0;

    if (this.isHandoffVisible() !== isVisible) {
      this.isHandoffVisible.set(isVisible);
      this.cdr.detectChanges();
    }
  }

  scrollToHandoff(): void {
    const el = this.document.getElementById('handoff-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // ── Exercise Helpers ─────────────────────────────────────────
  getAllExercises(phase: any): any[] {
    if (phase.sections) return phase.sections.flatMap((s: any) => s.exercises);
    return phase.exercises || [];
  }

  getGlobalIndex(phase: any, sectionIdx: number, exIdx: number): number {
    if (!phase.sections) return exIdx;
    let offset = 0;
    for (let i = 0; i < sectionIdx; i++) offset += phase.sections[i].exercises.length;
    return offset + exIdx;
  }

  canCheckExercise(phase: any, globalIndex: number): boolean {
    return true;
  }

  onExerciseCheckChange(phase: any, globalIndex: number, checked: boolean): void {
    // Allows interactive exercise checklist toggling
  }

  toggleExerciseNote(exercise: any): void {
    exercise.noteVisible = !exercise.noteVisible;
  }

  // ── Actions: No Show ──────────────────────────────────────────
  onNoShow(): void {
    this.displayNoShowDialog.set(true);
  }

  submitNoShow(): void {
    const reason = this.noShowReason().trim();
    if (!reason) return;

    const phaseSessionId = this.workflowData().phaseSessionId;
    this.coachDashboardService.reportAbsence(phaseSessionId, { reason }).subscribe({
      next: (res) => {
        this.displayNoShowDialog.set(false);
        this.noShowReason.set('');
        this.messageService.add({
          severity: 'warn',
          summary: 'Absence Reported',
          detail: res?.message || 'Absence reported and team leader notified.'
        });
        this.loadActiveSession();
      },
      error: (err: HttpErrorResponse | any) => {
        this.displayNoShowDialog.set(false);
        this.noShowReason.set('');
        const status = err?.status;
        const msg = status === 500
          ? 'Server Error (500): Could not report absence.'
          : (err?.error?.message || 'Failed to report absence.');

        this.messageService.add({
          severity: 'error',
          summary: `Report Absence Failed (${status || 'Error'})`,
          detail: msg
        });
      }
    });
  }

  cancelNoShow(): void {
    this.displayNoShowDialog.set(false);
    this.noShowReason.set('');
  }

  // ── Protocol Context Actions ─────────────────────────────────
  toggleProtocolCtx(): void {
    this.isProtocolCtxOpen.update(v => !v);
  }

  notifyDoctor(): void {
    this.notifyDoctorSent.set(true);
    this.messageService.add({
      severity: 'info',
      summary: 'Doctor Notified',
      detail: 'Doctor has been notified of approaching transition criteria.'
    });
  }

  // ── Actions: Session Controls ────────────────────────────────
  onStartSession(): void {
    if (this.isSessionStarted()) return;

    const phaseSessionId = this.workflowData().phaseSessionId;
    this.coachDashboardService.startSession(phaseSessionId).subscribe({
      next: (res) => {
        this.isSessionStarted.set(true);
        this.isPaused.set(false);
        this.isTimerFinished.set(false);
        this.activePanels.set(this.phases().map(p => p.id));

        if (this.sessionType() === 'Swarm') {
          this.remainingTimeSeconds.set(this.sessionDurationSeconds());
        } else {
          this.elapsedSeconds.set(0);
        }

        this.updateTimerDisplay();
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => this.tick(), 1000);

        this.messageService.add({
          severity: 'success',
          summary: 'Session Started',
          detail: res?.message || 'Session is now in progress.'
        });

        setTimeout(() => this.timerContainer?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      },
      error: (err: HttpErrorResponse | any) => {
        const status = err?.status;
        let detail = 'Could not start session.';
        if (status === 400) detail = 'Bad Request (400): Session is already completed or in progress.';
        else if (status === 404) detail = 'Not Found (404): Session not found or not assigned to you.';
        else if (status === 500) detail = 'Server Error (500): Internal error starting session.';

        this.messageService.add({
          severity: 'error',
          summary: `Start Session Failed (${status || 'Error'})`,
          detail
        });
      }
    });
  }

  pauseTimer(): void {
    if (!this.isSessionStarted() || this.isTimerFinished()) return;
    this.isPaused.update(v => !v);
    if (this.isPaused()) {
      clearInterval(this.timerInterval);
    } else {
      this.timerInterval = setInterval(() => this.tick(), 1000);
    }
  }

  private tick(): void {
    if (this.sessionType() === 'Swarm') {
      const currentRem = this.remainingTimeSeconds();
      if (currentRem <= 1) {
        this.remainingTimeSeconds.set(0);
        this.isTimerFinished.set(true);
        clearInterval(this.timerInterval);
      } else {
        this.remainingTimeSeconds.set(currentRem - 1);
      }
    } else {
      this.elapsedSeconds.update(v => v + 1);
    }
    this.updateTimerDisplay();
  }

  private updateTimerDisplay(): void {
    const val = this.sessionType() === 'Swarm' ? this.remainingTimeSeconds() : this.elapsedSeconds();
    const m = Math.floor(val / 60);
    const s = val % 60;
    this.sessionTimer.set(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
  }

  onEndSession(): void {
    if (!this.isSessionStarted()) return;
    if (this.sessionType() === 'Swarm' && !this.isTimerFinished()) return;

    this.submitCompleteSession();
  }

  private submitCompleteSession(): void {
    const phaseSessionId = this.workflowData().phaseSessionId;
    const exerciseLogs = this.phases().flatMap(p =>
      (p.sections || []).flatMap((s: any) =>
        (s.exercises || []).map((ex: any) => ({
          sessionExerciseId: ex.sessionExerciseId || 0,
          isCompleted: ex.completed,
          note: ex.note || undefined
        }))
      )
    );

    this.coachDashboardService.completeSession(phaseSessionId, {
      notes: this.generalComment(),
      followUpActivities: this.followUpActivities() || undefined,
      exerciseLogs
    }).subscribe({
      next: (res) => {
        this.isSessionStarted.set(false);
        this.isPaused.set(false);
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.sessionTimer.set(this.sessionType() === 'Swarm' ? `${String(this.sessionDurationSeconds() / 60).padStart(2, '0')}:00` : '00:00');

        this.phases.update(phases => phases.map(p => {
          this.getAllExercises(p).forEach((ex: any) => { ex.completed = false; ex.note = ''; ex.noteVisible = false; });
          return p;
        }));
        this.generalComment.set('');
        this.followUpActivities.set('');

        this.messageService.add({
          severity: 'success',
          summary: 'Session Completed',
          detail: res?.message || 'Session completed successfully.'
        });
        this.loadActiveSession();
      },
      error: (err: HttpErrorResponse | any) => {
        const status = err?.status;
        let detail = 'Could not complete session.';
        if (status === 400) detail = 'Bad Request (400): Session must be InProgress before completing.';
        else if (status === 500) detail = 'Server Error (500): Internal error completing session.';

        this.messageService.add({
          severity: 'error',
          summary: `Completion Failed (${status || 'Error'})`,
          detail
        });
      }
    });
  }

  saveDraft(): void {
    this.saveDraftSent.set(true);
    this.messageService.add({
      severity: 'success',
      summary: 'Draft Saved',
      detail: 'Session draft notes saved successfully.'
    });
    setTimeout(() => this.saveDraftSent.set(false), 2000);
  }

  handoffToNextStation(): void {
    let uncheckedWithoutNoteRowId: string | null = null;
    let uncheckedWithoutNoteName = '';

    const currentPhases = this.phases();
    for (let pIdx = 0; pIdx < currentPhases.length; pIdx++) {
      const phase = currentPhases[pIdx];
      if (phase.sections) {
        for (let sIdx = 0; sIdx < phase.sections.length; sIdx++) {
          const section = phase.sections[sIdx];
          for (let eIdx = 0; eIdx < section.exercises.length; eIdx++) {
            const ex = section.exercises[eIdx];
            if (!ex.completed && (!ex.note || ex.note.trim() === '')) {
              ex.noteVisible = true;
              uncheckedWithoutNoteRowId = 'row-ex-' + phase.id + '-' + sIdx + '-' + eIdx;
              uncheckedWithoutNoteName = ex.name;
              break;
            }
          }
          if (uncheckedWithoutNoteRowId) break;
        }
      }
      if (uncheckedWithoutNoteRowId) break;
    }

    if (uncheckedWithoutNoteRowId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Note Required',
        detail: `Please add a note for skipped exercise: ${uncheckedWithoutNoteName}`
      });
      setTimeout(() => {
        const el = document.getElementById(uncheckedWithoutNoteRowId!);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            const textarea = el.querySelector('textarea');
            if (textarea) textarea.focus();
          }, 50);
        }
      }, 100);
      return;
    }

    this.handoffChecklist.set([]);
    this.displayHandoffDialog.set(true);
  }

  confirmHandoff(): void {
    this.displayHandoffDialog.set(false);
    this.submitCompleteSession();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.fabContainer) {
      this.renderer.removeChild(this.document.body, this.fabContainer.nativeElement);
    }
    if (this.scrollListenerFn) {
      this.document.removeEventListener('scroll', this.scrollListenerFn as any, true);
      window.removeEventListener('resize', this.scrollListenerFn as any);
    }
  }
}
