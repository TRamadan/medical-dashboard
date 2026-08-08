import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, catchError, startWith } from 'rxjs';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ContactUsComponent } from '../contact-us/contact-us.component';
import { PatientFormService } from '../appointments/services/patient-form.service';
import { ServicesService } from '../add-service/services/services.service';
import {
    ConsultationSessionService,
    ConsultationSessionDto,
    ConsultationApiErrorResponse
} from './consultation-screen-services/consultation-screen.service';

// EntryType — consultation entry classification. Values are read-only reference
// data set once at intake (route query param, or an existing customer's record);
// the flow only ever checks this to route steps/labels — it's never sent back to the API.
export enum EntryType {
    New = 'new',
    Return = 'return',
    Reassess = 'reassess'
}
export type FlowStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type PathChoice = 1 | 2 | 3 | null;
export type ReassessChoice = 'A' | 'B' | 'C' | 'D' | null;

interface Procedure {
    id: number;              // local/UI tracking id — stable across re-renders
    serverId: number | null; // real API row id; null until the row has been saved once
    name: string;
    result?: string;
}

interface AthleteInfo {
    name: string;
    initials: string;
    meta: string;
}

@Component({
    selector: 'app-consultation-screen',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        CardModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        TextareaModule,
        TagModule,
        DividerModule,
        TooltipModule,
        BadgeModule,
        RippleModule,
        SelectButtonModule,
        DropdownModule,
        TableModule,
        DialogModule,
        ContactUsComponent
    ],
    templateUrl: './consultation-screen.component.html',
    styleUrl: './consultation-screen.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationScreenComponent {
    onsetDate: string = '';          // now bound to <input type="date">, stays a plain ISO string e.g. "2026-07-01"
    impactComment: string = '';      // new comment box under Impact on Performance

    // Step 3 — Impression & Findings
    generalImpressionNotes: string = '';
    purchaseInfluencer: string | null = null;

    // Step 4 — Judgment (Write Report branch)
    generalOpinion: string = '';
    // ── State ──────────────────────────────────────────────────────────────
    readonly entryType = signal<EntryType | null>(null);
    /** Exposes the enum to the template so it can compare/bind against EntryType.New etc. instead of raw strings. */
    readonly EntryType = EntryType;
    displayPatientInfoDialog = false;

    // ── Patient form — live signal from the shared PatientFormService ──────
    private readonly _patientFormService = inject(PatientFormService);
    /** Reactive alias: template uses mockPatientInfo() or mockPatientInfo directly */
    get mockPatientInfo() { return this._patientFormService.form(); }

    private readonly fb = inject(FormBuilder);
    private readonly servicesService = inject(ServicesService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly consultationSessionService = inject(ConsultationSessionService);

    // PurchaseInfluencer enum values (0–3) — see tariqMDfile.md
    readonly purchaseInfluencerOptions = [
        { label: 'Athlete themself', value: '0' },
        { label: 'Parent / Guardian', value: '1' },
        { label: 'Coach', value: '2' },
        { label: 'Club / Team', value: '3' }
    ];

    // ── ConsultationSession API wiring ──────────────────────────────────────
    readonly appointmentId = signal<number | null>(null);
    readonly sessionLoading = signal(false);
    readonly sessionSaving = signal(false);
    readonly sessionError = signal<string | null>(null);

    constructor() {
        this.route.queryParams.subscribe(params => {
            if (params['type']) {
                this.selectEntry(params['type'] as EntryType);
            }
        });

        this.route.paramMap.subscribe(pm => {
            debugger
            const raw = pm.get('appointmentId');
            const id = raw ? Number(raw) : null;
            if (id) {
                this.appointmentId.set(id);
                this.loadSession(id);
            }
        });
    }

    /** GET /ConsultationSession/{appointmentId} — resumes the wizard at whatever step the doctor left off on. */
    private loadSession(appointmentId: number): void {
        this.sessionLoading.set(true);
        this.sessionError.set(null);
        this.consultationSessionService.getSession(appointmentId).subscribe({
            next: session => {
                this.applySession(session);
                this.sessionLoading.set(false);
            },
            error: (err: HttpErrorResponse) => {
                this.sessionError.set(this.extractApiError(err) ?? 'Failed to load consultation session');
                this.sessionLoading.set(false);
            }
        });
    }

    /** Pre-fills every local form field from a GET response. `id: 0` means "not started yet" — leave defaults. */
    private applySession(session: ConsultationSessionDto): void {
        if (!session || session.id === 0) return;

        // Step 1
        this.complaintWords = session.complaintInAthleteWords ?? '';
        this.impactTraining = session.impactOnTraining != null ? String(session.impactOnTraining) : '';
        this.impactCompetition = session.impactOnCompetition != null ? String(session.impactOnCompetition) : '';
        this.impactDaily = session.impactOnDailyLife != null ? String(session.impactOnDailyLife) : '';
        this.impactComment = session.additionalImpactComment ?? '';
        this.onsetDate = session.complaintStartDate ?? '';
        this.aggravating = session.whatAggravatesPain ?? '';

        // Step 2
        if (session.procedures?.length) {
            this.procedures.set(session.procedures.map((p, idx) => ({
                id: idx + 1,
                serverId: p.id,
                name: p.procedureName,
                result: p.result
            })));
            this.nextProcId = this.procedures().length + 1;
        }
        this.vasPain = session.vASPain ?? null;
        this.effusion = session.effusion != null ? String(session.effusion) : '0';
        this.asymmetry = session.asymmetryPercent != null ? String(session.asymmetryPercent) : '';

        // Step 3 — Findings
        this.findingsMain = session.dysfunctionsAndRiskFactors ?? '';
        this.findingsStrengths = session.strengthsObserved ?? '';
        this.findingsWeaknesses = session.weaknessesObserved ?? '';
        this.generalImpressionNotes = session.notesAndGeneralImpression ?? '';
        if (session.yellowFlags != null) {
            this.yfFlags.set([0, 1, 2, 3, 4].map(i => ((session.yellowFlags as number) & (1 << i)) !== 0));
        }

        // Step 3 — Behavioural Signals
        this.emotionalTrigger = session.emotionalTrigger ?? '';
        this.prevProvider = session.experienceWithOtherProviders ?? '';
        this.fears = session.expectationsAndFears ?? '';
        this.compliance = session.complianceIndex != null ? String(session.complianceIndex) : '0';
        this.persona = session.personaClassification != null ? String(session.personaClassification) : '0';
        this.purchaseInfluencer = session.purchaseInfluencer != null ? String(session.purchaseInfluencer) : '0';
        this.behavioralNotes = session.additionalBehavioralNotes ?? '';

        // Step 3 — Judgment / Diagnosis
        this.judgmentChoice.set(session.judgmentType === 1 ? 'extraAssessment' : session.judgmentType === 0 ? 'writeReport' : null);
        this.generalOpinion = session.generalOpinion ?? '';
        this.diagnosisText = session.diagnosisText ?? '';
        this.diagnosisGrade = session.injuryGrade != null ? String(session.injuryGrade) : '0';
        this.diagnosisPhase = session.injuryPhase != null ? String(session.injuryPhase) : '0';
        this.clinicalNotes = session.clinicalNotes ?? '';
        this.goalText = session.therapeuticGoal ?? '';
        this.expectedDuration = session.expectedDuration ?? '';
        this.goalType = session.therapeuticGoalType != null ? String(session.therapeuticGoalType) : '0';

        // Step 4 — Athlete Report
        if (session.recommendedServiceId != null) {
            this.rehabForm.get('recommendedTrack')?.setValue(session.recommendedServiceId);
        }
        if (session.priorityLevel != null) {
            this.rehabForm.get('priorityLevel')?.setValue(String(session.priorityLevel));
        }
        if (session.programDuration) {
            this.rehabForm.get('programDuration')?.setValue(session.programDuration);
        }
        if (session.planPhases?.length) {
            this.phasesArray.clear();
            session.planPhases.forEach(phase => {
                this.phasesArray.push(this.fb.group({
                    id: [phase.id],
                    phaseName: [phase.phaseName],
                    goal: [phase.goal],
                    transitionCriteria: [phase.transitionCriteria],
                    sessions: [phase.sessions]
                }));
            });
        }
        if (session.sportsRecommendations != null) {
            this.rehabForm.get('sportsRecommendations')?.setValue(session.sportsRecommendations);
        }
        if (session.teamNotes != null) {
            this.rehabForm.get('teamNotes')?.setValue(session.teamNotes);
        }

        // Step 5 — Decision
        if (session.decision) {
            this.decisionNotes = session.decision.notes ?? '';
        }

        // Resume on the right screen. API steps (1–6) line up with the local
        // FlowStep numbering except that API step 3 covers both HTML "Impression &
        // Findings" and "Judgment" — land on Judgment (4) so nothing is skipped.
        const resumeStep = session.currentStep === 3 ? 4 : (session.currentStep as FlowStep);
        if (session.isCompleted) {
            this.flowStarted.set(true);
            this.actionDone.set(true);
            this.currentStep.set(6);
        } else if (resumeStep >= 1) {
            this.flowStarted.set(true);
            this.currentStep.set(resumeStep);
        }
    }

    private extractApiError(err: HttpErrorResponse): string | null {
        const body = err?.error as ConsultationApiErrorResponse | undefined;
        return body?.errors?.[0]?.errorEn ?? null;
    }

    backToDashboard(): void {
        this.router.navigate(['/uikit/doctor-control']);
    }

    // ── Services (Recommended Track) — loaded from /api/Serivces ───────────
    readonly servicesLoading = signal(true);
    readonly servicesError = signal<string | null>(null);

    private readonly _servicesRaw = toSignal(
        this.servicesService.getServices().pipe(
            map(data => { this.servicesLoading.set(false); return data; }),
            catchError(err => {
                this.servicesLoading.set(false);
                this.servicesError.set(err?.message ?? 'Failed to load services');
                return of([]);
            }),
            startWith([])
        ),
        { initialValue: [] }
    );

    readonly recommendedTrackOptions = computed(() =>
        (this._servicesRaw() ?? []).map(s => ({
            label: s.nameEn ?? s.nameAr ?? `Service ${s.id}`,
            value: s.id
        }))
    );

    /** Currently selected service id — drives the card-selection highlight. */
    get selectedServiceId(): number | null {
        return this.rehabForm.get('recommendedTrack')?.value as number | null;
    }

    selectService(id: number | undefined): void {
        if (id == null) return;
        this.rehabForm.get('recommendedTrack')?.setValue(id);
    }

    // ConsultationPriorityLevel enum (0–2)
    readonly priorityOptions = [
        { label: 'Low', value: '0' },
        { label: 'Medium', value: '1' },
        { label: 'High', value: '2' }
    ];

    readonly durationOptions = [
        { label: '4 Weeks', value: '4' },
        { label: '6 Weeks', value: '6' },
        { label: '8 Weeks', value: '8' },
        { label: '12 Weeks', value: '12' },
        { label: 'Custom Program', value: 'custom' }
    ];

    readonly rehabForm = this.fb.group({
        recommendedTrack: [null as number | null],
        priorityLevel: ['1'],
        programDuration: ['8'],
        customSessionsPerWeek: [3],
        phases: this.fb.array([
            this.fb.group({
                id: [null as number | null],
                phaseName: ['Phase 1: Mobility & Control'],
                goal: ['Restore full range of motion'],
                transitionCriteria: ['ROM flexion > 120°'],
                sessions: [8]
            }),
            this.fb.group({
                id: [null as number | null],
                phaseName: ['Phase 2: Strength & Load'],
                goal: ['Equalize limb strength'],
                transitionCriteria: ['LSI > 80%'],
                sessions: [12]
            })
        ]),
        sportsRecommendations: ['Resume light jogging after Phase 2, avoid contact sports until graduation.'],
        teamNotes: ['Monitor psychological status (Yellow Flag alert). Focus on quad control.']
    });

    get phasesArray(): FormArray {
        return this.rehabForm.get('phases') as FormArray;
    }

    addPhaseRow(): void {
        this.phasesArray.push(this.fb.group({
            id: [null as number | null],
            phaseName: [''],
            goal: [''],
            transitionCriteria: [''],
            sessions: [6]
        }));
    }

    removePhaseRow(index: number): void {
        if (this.phasesArray.length > 1) {
            this.phasesArray.removeAt(index);
        }
    }


    readonly currentStep = signal<FlowStep>(0);
    readonly selectedPath = signal<PathChoice>(null);
    readonly selectedReassessPath = signal<ReassessChoice>(null);
    readonly flowStarted = signal(false);
    readonly actionDone = signal(false);

    // ── Athlete data ────────────────────────────────────────────────────────
    readonly athleteInfo = computed<AthleteInfo | null>(() => {
        const t = this.entryType();
        if (!t) return null;
        const map: Record<EntryType, AthleteInfo> = {
            new: { name: 'Hani Salem', initials: 'HS', meta: 'Male · 28 yrs · Football · Right Knee Pain' },
            return: { name: 'Omar Tarek', initials: 'OT', meta: 'Male · 32 yrs · Graduated Mar 2026 · New Shoulder Pain' },
            reassess: { name: 'Karim Mahmoud', initials: 'KM', meta: 'Male · 25 yrs · Active ACL Program · Phase 3 · New Shoulder Injury' }
        };
        return map[t];
    });

    readonly entryBadge = computed(() => {
        const t = this.entryType();
        if (!t) return null;
        const map: Record<EntryType, { label: string; severity: 'success' | 'warn' | 'danger' }> = {
            new: { label: 'New Athlete', severity: 'success' },
            return: { label: 'Returning Athlete', severity: 'warn' },
            reassess: { label: 'Reassessment', severity: 'danger' }
        };
        return map[t];
    });

    // ── Step label per flow ─────────────────────────────────────────────────
    readonly stepLabels = computed(() => {
        const t = this.entryType();
        if (t === EntryType.Return) return ['Validity', 'Examination', 'Assessment', 'Diagnosis', 'Athlete Report', 'Decision'];
        if (t === EntryType.Reassess) return ['Examination', 'Assessment', 'Diagnosis', 'Athlete Report', 'Decision', 'Action'];
        return ['Examination', 'Assessment', 'Diagnosis', 'Athlete Report', 'Decision', 'Action'];
    });

    // ── Examination form ────────────────────────────────────────────────────
    readonly procedures = signal<Procedure[]>([
        { id: 1, serverId: null, name: '' },
        { id: 2, serverId: null, name: '' }
    ]);
    nextProcId = 3;

    vasPain: number | null = null;
    romFlexion: string = '';
    romExtension: string = '';
    quadLsi: string = '';
    effusion: string = '0';
    asymmetry: string = '';

    // EffusionLevel enum (0–4) — see tariqMDfile.md
    readonly effusionOptions = [
        { label: 'None', value: '0' },
        { label: 'Trace', value: '1' },
        { label: 'Mild', value: '2' },
        { label: 'Moderate', value: '3' },
        { label: 'Severe', value: '4' }
    ];

    // ── Clinical Assessment (Step 2 — Doctor Form) ─────────────────────────
    // Complaint
    complaintWords: string = '';
    impactTraining: string = '';
    impactCompetition: string = '';
    impactDaily: string = '';
    aggravating: string = '';

    // Clinical Findings
    findingsMain: string = '';
    findingsStrengths: string = '';
    findingsWeaknesses: string = '';

    // Yellow Flag Score
    readonly yfFlags = signal<boolean[]>([false, false, false, false, false]);
    readonly yfScore = computed(() => this.yfFlags().filter(Boolean).length);
    readonly yfAlert = computed(() => this.yfScore() >= 3);
    // yfItems is in the exact YellowFlagItem bit order (1, 2, 4, 8, 16) — sum the checked bits.
    readonly yellowFlagsBitmask = computed(() =>
        this.yfFlags().reduce((sum, checked, i) => checked ? sum + (1 << i) : sum, 0)
    );

    readonly yfItems = [
        { label: 'Chronic fear of movement (Kinesiophobia)', sub: 'Avoids movements out of clear fear of pain' },
        { label: 'Very low recovery expectation (≤ 3/10)', sub: 'Athlete does not believe improvement is possible' },
        { label: 'High psychological / social stress', sub: 'Work / relationships / external pressure visible' },
        { label: 'Negative experience with previous treatment', sub: 'Disappointment / low trust in therapy' },
        { label: 'Catastrophizing behaviour', sub: 'Exaggerates pain or expects worst outcomes' }
    ];

    toggleYfFlag(index: number): void {
        this.yfFlags.update(flags => {
            const copy = [...flags];
            copy[index] = !copy[index];
            return copy;
        });
    }

    daysSinceOnset(): number | null {
        if (!this.onsetDate) return null;
        const start = new Date(this.onsetDate);
        if (isNaN(start.getTime())) return null;
        const diffMs = Date.now() - start.getTime();
        return Math.max(0, Math.floor(diffMs / 86400000));
    }

    // Behavioral Signals (Internal Only)
    emotionalTrigger: string = '';
    prevProvider: string = '';
    fears: string = '';
    compliance: string = '0';
    persona: string = '0';
    behavioralNotes: string = '';

    // ComplianceIndex enum (0–2)
    readonly complianceOptions = [
        { label: 'High — enthusiastic and committed', value: '0' },
        { label: 'Medium — needs motivation', value: '1' },
        { label: 'Low — needs intensive follow-up', value: '2' }
    ];
    // PersonaClassification enum (0–5)
    readonly personaOptions = [
        { label: 'Not specified', value: '0' },
        { label: 'Champion — committed professional', value: '1' },
        { label: 'Skeptic — hesitant, needs proof', value: '2' },
        { label: 'Anxious — worried, needs reassurance', value: '3' },
        { label: 'Passive — inactive, needs activation', value: '4' },
        { label: 'VIP — returning with excellent experience', value: '5' }
    ];
    // PerformanceImpactLevel enum (0–2)
    readonly impactOptions = [
        { label: 'No impact', value: '0' },
        { label: 'Partial impact', value: '1' },
        { label: 'Completely prevents me', value: '2' }
    ];

    // ── Diagnosis form ──────────────────────────────────────────────────────
    diagnosisText: string = '';
    diagnosisGrade: string = '0';
    diagnosisPhase: string = '0';
    clinicalNotes: string = '';
    goalText: string = '';
    expectedDuration: string = '';
    goalType: string = '0';

    // InjuryGrade enum (0–2)
    readonly gradeOptions = [
        { label: 'Grade I', value: '0' },
        { label: 'Grade II', value: '1' },
        { label: 'Grade III', value: '2' }
    ];
    // InjuryPhase enum (0–2)
    readonly phaseOptions = [
        { label: 'Acute', value: '0' },
        { label: 'Sub-Acute', value: '1' },
        { label: 'Chronic', value: '2' }
    ];
    // TherapeuticGoalType enum (0–3)
    readonly goalTypeOptions = [
        { label: 'Return to Play', value: '0' },
        { label: 'Prevention', value: '1' },
        { label: 'Peak Performance', value: '2' },
        { label: 'Recharger', value: '3' }
    ];

    // ── Measurement path detail fields ──────────────────────────────────────
    measurementType: string = 'Force Plate';
    measurementDate: string = '';
    readonly measurementTypeOptions = [
        { label: 'Force Plate', value: 'Force Plate' },
        { label: 'Isokinetic', value: 'Isokinetic' },
        { label: 'VBT', value: 'VBT' }
    ];

    // ── Referral path detail fields ─────────────────────────────────────────
    referralTest: string = 'MRI';
    referralRegion: string = '';
    readonly referralTestOptions = [
        { label: 'MRI', value: 'MRI' },
        { label: 'X-Ray', value: 'X-Ray' },
        { label: 'CT', value: 'CT' },
        { label: 'Blood Tests', value: 'Blood Tests' }
    ];
    // ⚠ Not in tariqMDfile.md's referral schema — `referralTest` + `referralRegion`
    // are combined into `referralDescription` on submit; `referralSpecialty` is a
    // separate "who" field the current HTML has no input for yet.
    referralSpecialty: string = '';
    referralNeedFollowUp: boolean = true;

    // ── Decision notes (Step 6) ─────────────────────────────────────────────
    // ⚠ Gap: POST /complete requires `notes` on every decisionType, but Step 6's
    // HTML only shows static confirm copy — no bound textarea exists yet. Add one
    // bound to `decisionNotes` before wiring the confirm button.
    decisionNotes: string = '';

    // ── Pause reason fields ─────────────────────────────────────────────────
    pauseReason: string = '';
    investigationType: string = 'Internal Measurements';
    pauseDuration: string = 'Two Weeks';
    readonly investigationTypeOptions = [
        { label: 'Internal Measurements', value: 'Internal Measurements' },
        { label: 'External Referral (MRI/X-Ray)', value: 'External Referral (MRI/X-Ray)' },
        { label: 'Specialist Consultation', value: 'Specialist Consultation' }
    ];
    readonly pauseDurationOptions = [
        { label: 'One Week', value: 'One Week' },
        { label: 'Two Weeks', value: 'Two Weeks' },
        { label: 'One Month', value: 'One Month' },
        { label: 'Undetermined', value: 'Undetermined' }
    ];

    // ── Derived / helpers ────────────────────────────────────────────────────
    readonly sidebarData = computed(() => {
        const t = this.entryType();
        if (!t) return null;
        const map: Record<EntryType, SidebarData> = {
            new: {
                title: 'Athlete Summary',
                items: [
                    { color: '#EEEEF8', text: 'Hani Salem · 28 yrs' },
                    { color: '#3DD9A0', text: 'Football — Active Amateur' },
                    { color: '#FC6B44', text: 'Right knee pain · 3 months' }
                ],
                history: [
                    { color: '#E24B4A', text: 'Ankle sprain 2023 (healed)' },
                    { color: '#7A7FA8', text: 'No chronic illness · No medications' }
                ],
                ticketStatus: [
                    { color: '#3DD9A0', text: 'Data Map complete ✓' },
                    { color: '#3DD9A0', text: 'Payment confirmed ✓ — 4,000 EGP' }
                ],
                activeProtocol: null
            },
            return: {
                title: 'Athlete Summary — Returning',
                items: [
                    { color: '#C9A84C', text: 'Omar Tarek · 32 yrs · Graduated' },
                    { color: '#3DD9A0', text: 'Previous Program: ACL RTP — Grad Mar 2026' },
                    { color: '#FC6B44', text: 'New Complaint: Right Shoulder Pain' }
                ],
                history: [
                    { color: '#3DD9A0', text: 'ACL Reconstruction — 24 weeks' },
                    { color: '#3DD9A0', text: 'Adherence 94% · NPS 9.2 · Excellent result' },
                    { color: '#3DD9A0', text: 'LSI at graduation: 92%' }
                ],
                ticketStatus: [
                    { color: '#C9A84C', text: 'Total paid previously: 13,000 EGP' },
                    { color: '#3DD9A0', text: 'Data Map valid until Jan 2027' }
                ],
                activeProtocol: null
            },
            reassess: {
                title: 'Athlete — Active Program',
                items: [
                    { color: '#FC6B44', text: 'Karim Mahmoud · 25 yrs' },
                    { color: '#3DD9A0', text: 'Basketball — Professional' },
                    { color: '#FC6B44', text: 'New complaint: Right shoulder pain during passing' }
                ],
                history: [
                    { color: '#E24B4A', text: 'ACL Reconstruction — Jan 2026' },
                    { color: '#7A7FA8', text: 'No chronic illness' }
                ],
                ticketStatus: [],
                activeProtocol: {
                    title: 'ACL Return to Play — Active',
                    rows: [
                        { label: 'Phase', value: '3 of 5 — Strength' },
                        { label: 'Sessions', value: '18 of 36 completed' },
                        { label: 'Completion', value: '50%' },
                        { label: 'Lead', value: 'Ahmed Salem' },
                        { label: 'Engineers', value: 'R: Sara · S: Karim · A: Mohamed' },
                        { label: 'Phase Criteria', value: '2 of 4 achieved' }
                    ]
                }
            }
        };
        return map[t] ?? null;
    });

    // ── Actions ──────────────────────────────────────────────────────────────
    selectEntry(type: EntryType): void {
        this.entryType.set(type);
        this.currentStep.set(0);
        this.flowStarted.set(false);
        this.selectedPath.set(null);
        this.selectedReassessPath.set(null);
        this.actionDone.set(false);

        // Seed PatientFormService with mockup data matching the selected entry type.
        // Shaped to match PatientForm (personalData/sportsData/injuryData/injuryHistory/
        // medicalHistory/socialProfile/ui) from patient-form.service.ts — the old flat
        // shape here (gender/weight/height/decisionInfluencers/consentFullName/etc.)
        // never matched the real API contract and has been dropped.
        this._patientFormService.reset();

        if (type === EntryType.New) {
            this._patientFormService.patch({
                personalData: {
                    fullName: 'Hani Salem', dateOfBirth: '1998-05-15', address: 'Cairo, Nasr City',
                    phoneNumber: '01012345678', emergencyPhone: '01198765432', emergencyRelation: 'Brother',
                    bookingForSelf: true, fillerRelation: '', fillerName: '', fillerMobile: ''
                },
                sportsData: {
                    sport: 'Football', playCenter: 'Midfielder', yearsOfPractice: 12,
                    clubName: 'Al Ahly', highestAchievement: 'League Cup 2024'
                },
                injuryData: {
                    bodyMapData: '', painLevel: 4, functionalLevel: 6, dailyActivityLevel: 5,
                    injuryDescription: 'Twisting knee while changing direction on turf',
                    injuryName: 'Right knee sprain', injurySide: 0, injuryDate: '2026-04-10',
                    inactivityDurationValue: 3, inactivityDurationUnit: 1,
                    isSportRelated: true, seenSpecialist: true,
                    specialistsConsulted: [{ id: 0, doctorName: 'Dr. Ahmed', specialty: 'Orthopedics', diagnosis: 'Knee sprain', communicationMethod: 'In-person' }],
                    prescribedTreatments: 2, otherPrescribedTreatment: '',
                    hadDiagnosticTests: true, diagnosticTests: 2, otherDiagnosticTest: ''
                },
                injuryHistory: {
                    previousInjuries: [{ id: 0, description: 'Fully healed', bodyPart: 'Ankle', injuryDate: '2023-01-01', treatmentReceived: 'Physio' }],
                    previousSurgeries: []
                },
                medicalHistory: {
                    currentConditions: 0, otherConditions: '', medications: [],
                    knownAllergies: 'None', hadCovid: false, covidTimesCount: 0,
                    covidVaccinated: true, vaccineType: 'Pfizer', vaccineDoses: 2,
                    fatherConditions: 0, fatherOtherConditions: '', motherConditions: 0, motherOtherConditions: ''
                },
                socialProfile: {
                    occupation: 'Accountant', workNature: 0, dailySittingHours: 8,
                    maritalStatus: 0, habits: 0, isWorkStressful: false, hasChildren: false
                },
                ui: {
                    prescribedTreatmentsSelected: ['physio'],
                    diagnosticTestsSelected: ['mri'],
                    chronicConditionsSelected: [], fatherConditionsSelected: [], motherConditionsSelected: [], habitsSelected: [],
                    inactivityDurationUnitLabel: 'weeks', injurySideLabel: 'right', workNatureLabel: 'مكتبي'
                },
                selectedMuscles: ['muscle 11', 'muscle 12']
            });
        } else if (type === EntryType.Return) {
            this._patientFormService.patch({
                personalData: {
                    fullName: 'Omar Tarek', dateOfBirth: '1994-08-22', address: 'Giza, Dokki',
                    phoneNumber: '01234567890', emergencyPhone: '01512345678', emergencyRelation: 'Wife',
                    bookingForSelf: true, fillerRelation: '', fillerName: '', fillerMobile: ''
                },
                sportsData: {
                    sport: 'Tennis', playCenter: 'Singles Player', yearsOfPractice: 15,
                    clubName: 'Gezira Sporting Club', highestAchievement: 'National amateur champion 2022'
                },
                injuryData: {
                    bodyMapData: '', painLevel: 3, functionalLevel: 5, dailyActivityLevel: 5,
                    injuryDescription: 'Overhead serve pain in shoulder',
                    injuryName: 'Rotator Cuff Tendinopathy', injurySide: 0, injuryDate: '2026-06-01',
                    inactivityDurationValue: 2, inactivityDurationUnit: 1,
                    isSportRelated: true, seenSpecialist: true,
                    specialistsConsulted: [{ id: 0, doctorName: 'Dr. Mona', specialty: 'Physiotherapy', diagnosis: 'Tendinopathy', communicationMethod: 'Clinic visit' }],
                    prescribedTreatments: 18, otherPrescribedTreatment: 'Massage',
                    hadDiagnosticTests: true, diagnosticTests: 32, otherDiagnosticTest: ''
                },
                injuryHistory: {
                    previousInjuries: [],
                    previousSurgeries: [{ id: 0, description: 'Successful recovery', surgeryType: 'ACL Reconstruction', surgeryDate: '2025-01-01' }]
                },
                medicalHistory: {
                    currentConditions: 0, otherConditions: '', medications: [],
                    knownAllergies: 'None', hadCovid: false, covidTimesCount: 0,
                    covidVaccinated: false, vaccineType: '', vaccineDoses: 0,
                    fatherConditions: 0, fatherOtherConditions: '', motherConditions: 0, motherOtherConditions: ''
                },
                socialProfile: {
                    occupation: 'Engineer', workNature: 1, dailySittingHours: 4,
                    maritalStatus: 1, habits: 0, isWorkStressful: true, hasChildren: true
                },
                ui: {
                    prescribedTreatmentsSelected: ['physio', 'other'],
                    diagnosticTestsSelected: ['ultrasound'],
                    chronicConditionsSelected: [], fatherConditionsSelected: [], motherConditionsSelected: [], habitsSelected: [],
                    inactivityDurationUnitLabel: 'weeks', injurySideLabel: 'right', workNatureLabel: 'ميداني'
                },
                selectedMuscles: ['muscle 1', 'muscle 3']
            });
        } else if (type === EntryType.Reassess) {
            this._patientFormService.patch({
                personalData: {
                    fullName: 'Karim Mahmoud', dateOfBirth: '2001-11-03', address: 'Giza, 6th of October',
                    phoneNumber: '01011122233', emergencyPhone: '01133322211', emergencyRelation: 'Father',
                    bookingForSelf: true, fillerRelation: '', fillerName: '', fillerMobile: ''
                },
                sportsData: {
                    sport: 'Basketball', playCenter: 'Center', yearsOfPractice: 10,
                    clubName: 'Zamalek', highestAchievement: 'African Championship 2025'
                },
                injuryData: {
                    bodyMapData: '', painLevel: 5, functionalLevel: 7, dailyActivityLevel: 6,
                    injuryDescription: 'Sudden shoulder stretch during defensive block',
                    injuryName: 'Rotator Cuff Strain', injurySide: 0, injuryDate: '2026-07-15',
                    inactivityDurationValue: 1, inactivityDurationUnit: 1,
                    isSportRelated: true, seenSpecialist: true,
                    specialistsConsulted: [{ id: 0, doctorName: 'Dr. Samir', specialty: 'Sports Medicine', diagnosis: 'Rotator cuff strain', communicationMethod: 'Remote consultation' }],
                    prescribedTreatments: 4, otherPrescribedTreatment: '',
                    hadDiagnosticTests: true, diagnosticTests: 3, otherDiagnosticTest: ''
                },
                injuryHistory: {
                    previousInjuries: [{ id: 0, description: 'Ongoing recovery', bodyPart: 'Right Knee', injuryDate: '2026-01-01', treatmentReceived: 'Surgery + rehab' }],
                    previousSurgeries: [{ id: 0, description: 'Active recovery program', surgeryType: 'ACL Reconstruction', surgeryDate: '2026-01-01' }]
                },
                medicalHistory: {
                    currentConditions: 0, otherConditions: '', medications: [],
                    knownAllergies: 'None', hadCovid: false, covidTimesCount: 0,
                    covidVaccinated: false, vaccineType: '', vaccineDoses: 0,
                    fatherConditions: 0, fatherOtherConditions: '', motherConditions: 0, motherOtherConditions: ''
                },
                socialProfile: {
                    occupation: 'Athlete', workNature: 1, dailySittingHours: 2,
                    maritalStatus: 0, habits: 0, isWorkStressful: true, hasChildren: false
                },
                ui: {
                    prescribedTreatmentsSelected: ['rehab'],
                    diagnosticTestsSelected: ['mri', 'xray'],
                    chronicConditionsSelected: [], fatherConditionsSelected: [], motherConditionsSelected: [], habitsSelected: [],
                    inactivityDurationUnitLabel: 'weeks', injurySideLabel: 'right', workNatureLabel: 'ميداني'
                },
                selectedMuscles: ['muscle 3', 'muscle 12']
            });
        } else {
            this._patientFormService.reset();
        }
    }

    startFlow(): void {
        this.flowStarted.set(true);
        this.currentStep.set(1);
    }

    go(step: any): void {
        this.currentStep.set(step);
    }

    addProcedure(): void {
        this.procedures.update(procs => [...procs, { id: this.nextProcId++, serverId: null, name: '' }]);
    }

    updateProcedure(id: number, text: string): void {
        this.procedures.update(procs => procs.map(p => p.id === id ? { ...p, name: text } : p));
    }

    removeProcedure(id: number): void {
        this.procedures.update(procs => procs.filter(p => p.id !== id));
    }

    pickPath(path: PathChoice): void {
        this.selectedPath.set(path);
    }

    pickReassessPath(letter: ReassessChoice): void {
        this.selectedReassessPath.set(letter);
    }

    // ── API submit methods ──────────────────────────────────────────────────
    // Bind these to the wizard's "Next" / "Confirm" buttons in place of bare
    // go(n) calls. Each one saves to the documented endpoint, then advances
    // the stepper only once the save succeeds.

    /** HTML Step 1 (Complaint Registration) → PUT /step/1 */
    submitStep1(): void {
        debugger
        const id = 2;
        if (!id) { this.go(2); return; }
        this.sessionSaving.set(true);
        this.sessionError.set(null);
        this.consultationSessionService.saveStep1(id, {
            complaintInAthleteWords: this.complaintWords,
            impactOnTraining: Number(this.impactTraining || 0),
            impactOnCompetition: Number(this.impactCompetition || 0),
            impactOnDailyLife: Number(this.impactDaily || 0),
            additionalImpactComment: this.impactComment,
            complaintStartDate: this.onsetDate,
            whatAggravatesPain: this.aggravating
        }).subscribe({
            next: () => { this.sessionSaving.set(false); this.go(2); },
            error: (err: HttpErrorResponse) => {
                this.sessionSaving.set(false);
                this.sessionError.set(this.extractApiError(err) ?? 'Failed to save Step 1');
            }
        });
    }

    /** HTML Step 2 (Assessment) → PUT /step/2. `order` is the row's array index — not its display id. */
    submitStep2(): void {
        const id = 2;
        if (!id) { this.go(3); return; }
        this.sessionSaving.set(true);
        this.sessionError.set(null);
        this.consultationSessionService.saveStep2(id, {
            procedures: this.procedures().map((p, idx) => ({
                id: p.serverId,
                procedureName: p.name,
                result: p.result ?? '',
                order: idx + 1
            })),
            vASPain: this.vasPain,
            effusion: Number(this.effusion || 0),
            asymmetryPercent: this.asymmetry ? Number(this.asymmetry) : null
        }).subscribe({
            next: () => { this.sessionSaving.set(false); this.go(3); },
            error: (err: HttpErrorResponse) => {
                this.sessionSaving.set(false);
                this.sessionError.set(this.extractApiError(err) ?? 'Failed to save Step 2');
            }
        });
    }

    /**
     * HTML Step 4 (Judgment) → PUT /step/3. Combines Step 3's Impression &
     * Findings fields with Step 4's Judgment fields into the single documented
     * Diagnosis payload. Routes to Athlete Report (5) when judgmentType=0, or
     * skips straight to Confirmation (6) when judgmentType=1 — matching the
     * server's currentStep=5 (API numbering) skip behavior.
     */
    submitJudgment(): void {
        const isWriteReport = this.judgmentChoice() === 'writeReport';
        const id = 2;
        const nextStep: FlowStep = isWriteReport ? 5 : 6;
        if (!id) { this.go(nextStep); return; }

        this.sessionSaving.set(true);
        this.sessionError.set(null);
        this.consultationSessionService.saveStep3(id, {
            dysfunctionsAndRiskFactors: this.findingsMain,
            strengthsObserved: this.findingsStrengths,
            weaknessesObserved: this.findingsWeaknesses,
            notesAndGeneralImpression: this.generalImpressionNotes,
            yellowFlags: this.yellowFlagsBitmask(),

            emotionalTrigger: this.emotionalTrigger,
            experienceWithOtherProviders: this.prevProvider,
            expectationsAndFears: this.fears,
            complianceIndex: Number(this.compliance || 0),
            personaClassification: Number(this.persona || 0),
            purchaseInfluencer: Number(this.purchaseInfluencer || 0),
            additionalBehavioralNotes: this.behavioralNotes,

            judgmentType: isWriteReport ? 0 : 1,

            generalOpinion: isWriteReport ? this.generalOpinion : null,
            diagnosisText: isWriteReport ? this.diagnosisText : null,
            injuryGrade: Number(this.diagnosisGrade || 0),
            injuryPhase: Number(this.diagnosisPhase || 0),
            clinicalNotes: this.clinicalNotes,
            therapeuticGoal: isWriteReport ? this.goalText : null,
            expectedDuration: this.expectedDuration,
            therapeuticGoalType: Number(this.goalType || 0)
        }).subscribe({
            next: () => { this.sessionSaving.set(false); this.go(nextStep); },
            error: (err: HttpErrorResponse) => {
                this.sessionSaving.set(false);
                this.sessionError.set(this.extractApiError(err) ?? 'Failed to save diagnosis');
            }
        });
    }

    /** HTML Step 5 (Athlete Report) → PUT /step/4. Only called when judgmentType=0 (WriteReport). */
    submitStep4(): void {
        const id = this.appointmentId();
        if (!id) { this.go(6); return; }

        const duration = this.rehabForm.get('programDuration')?.value;
        const programDuration = duration === 'custom'
            // ⚠ customSessionsPerWeek isn't in the documented step/4 schema —
            // folded into the free-text programDuration string until confirmed.
            ? `Custom Program - ${this.rehabForm.get('customSessionsPerWeek')?.value ?? 0} sessions/week`
            : (this.durationOptions.find(d => d.value === duration)?.label ?? `${duration} Weeks`);

        this.sessionSaving.set(true);
        this.sessionError.set(null);
        this.consultationSessionService.saveStep4(id, {
            recommendedServiceId: this.selectedServiceId,
            priorityLevel: Number(this.rehabForm.get('priorityLevel')?.value ?? 1),
            programDuration,
            planPhases: this.phasesArray.controls.map((group, idx) => ({
                id: group.get('id')?.value ?? null,
                phaseName: group.get('phaseName')?.value ?? '',
                goal: group.get('goal')?.value ?? '',
                transitionCriteria: group.get('transitionCriteria')?.value ?? '',
                sessions: Number(group.get('sessions')?.value ?? 0),
                order: idx + 1
            })),
            sportsRecommendations: this.rehabForm.get('sportsRecommendations')?.value ?? '',
            teamNotes: this.rehabForm.get('teamNotes')?.value ?? ''
        }).subscribe({
            next: () => { this.sessionSaving.set(false); this.go(6); },
            error: (err: HttpErrorResponse) => {
                this.sessionSaving.set(false);
                this.sessionError.set(this.extractApiError(err) ?? 'Failed to save Step 4');
            }
        });
    }

    /**
     * HTML Step 6 (Action / Confirmation) → POST /complete. Only wired for
     * entryType() !== 'reassess' — the reassessment paths (A–D) have no
     * documented endpoint yet (see the step-mapping doc's gap notes).
     */
    confirmAction(): void {
        if (this.entryType() === EntryType.Reassess) {
            // ⚠ No documented endpoint for the reassessment paths — local-only for now.
            this.actionDone.set(true);
            return;
        }

        const id = this.appointmentId();
        const path = this.selectedPath();
        if (!id || !path) return;

        // selectedPath 1/2/3 → decisionType 0 (Direct Blueprint) / 2 (Internal Measurements) / 1 (External Referral)
        const decisionTypeMap: Record<number, number> = { 1: 0, 2: 2, 3: 1 };
        const decisionType = decisionTypeMap[path];

        let payload: Parameters<ConsultationSessionService['complete']>[1] = {
            decisionType,
            notes: this.decisionNotes
        };

        if (decisionType === 1) {
            // ⚠ referralTest/referralRegion don't map 1:1 to referralSpecialty/
            // referralDescription — combined here until backend confirms the split.
            payload = {
                ...payload,
                referralSpecialty: this.referralSpecialty,
                referralDescription: `${this.referralTest} — ${this.referralRegion}`.trim(),
                referralNeedFollowUp: this.referralNeedFollowUp
            };
        } else if (decisionType === 2) {
            // ⚠ measurementType/measurementDate aren't in the documented complete
            // schema — folded into notes until backend confirms a dedicated field.
            payload = {
                ...payload,
                notes: `${this.decisionNotes} (Measurement: ${this.measurementType}${this.measurementDate ? ' on ' + this.measurementDate : ''})`.trim()
            };
        }

        this.sessionSaving.set(true);
        this.sessionError.set(null);
        this.consultationSessionService.complete(id, payload).subscribe({
            next: () => { this.sessionSaving.set(false); this.actionDone.set(true); },
            error: (err: HttpErrorResponse) => {
                this.sessionSaving.set(false);
                this.sessionError.set(this.extractApiError(err) ?? 'Failed to submit decision');
            }
        });
    }

    isStepCompleted(step: number): boolean {
        return step < this.currentStep();
    }

    isStepActive(step: number): boolean {
        return step === this.currentStep();
    }

    getDecisionConfirmVisible(): boolean {
        const t = this.entryType();
        if (t === EntryType.Reassess) return this.selectedReassessPath() !== null;
        return this.selectedPath() !== null;
    }

    trackById(_: number, item: Procedure): number {
        return item.id;
    }

    judgmentChoice = signal<'writeReport' | 'extraAssessment' | null>(null);

    setJudgmentChoice(choice: 'writeReport' | 'extraAssessment'): void {
        this.judgmentChoice.set(choice);
    }

    // Mirrors the old getDecisionConfirmVisible(), but branches on judgmentChoice()
    getJudgmentConfirmVisible(): boolean {
        if (this.judgmentChoice() === 'writeReport') {
            return !!this.generalOpinion?.trim()
                && !!this.diagnosisText?.trim()
                && !!this.goalText?.trim();
        }
        if (this.judgmentChoice() === 'extraAssessment') {
            return this.entryType() === EntryType.Reassess
                ? !!this.selectedReassessPath()
                : !!this.selectedPath();
        }
        return false;
    }






}

// ── Sidebar types ────────────────────────────────────────────────────────────
interface SidebarItem { color: string; text: string; }
interface SidebarData {
    title: string;
    items: SidebarItem[];
    history: SidebarItem[];
    ticketStatus: SidebarItem[];
    activeProtocol: { title: string; rows: { label: string; value: string }[] } | null;
}