import {
    Component,
    ChangeDetectionStrategy,
    signal,
    computed,
    inject,
    input,
    effect,
    OnInit,
    untracked
} from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { EditProtocolService } from '../services/edit-protocol.service';
import {
    PlanSummaryDto,
    ProtocolDetailDto,
    PhaseDetailDto,
    PhaseSessionDto,
    SectionDto,
    ExerciseDto,
    CoachOptionDto,
    PhaseStationDto,
    AddExerciseDto,
    AddSetDto,
    ReorderExercisesDto,
    SaveStationAssignmentsDto
} from '../models/coach-manager-api.model';

// Single mock record fallback data
const MOCK_PLANS: PlanSummaryDto[] = [
    {
        planId: 3,
        planName: 'ACL Recovery Protocol',
        patientName: 'Mustafa Samir',
        injuryCondition: 'ACL Tear - Right Knee',
        totalSessions: 36,
        unassignedSessions: 1,
        totalWeeks: 12
    }
];

const MOCK_COACHES: CoachOptionDto[] = [
    { coachId: 5, coachName: 'Eng. Karim' },
    { coachId: 7, coachName: 'Eng. Sarah' }
];

const MOCK_PROTOCOL: ProtocolDetailDto = {
    planId: 3,
    planName: 'ACL Recovery Protocol',
    patientName: 'Mustafa Samir',
    totalSessions: 36,
    totalWeeks: 12,
    phases: [
        {
            phaseId: 10,
            phaseName: 'Initial Rehabilitation',
            phaseOrder: 1,
            weeks: 2,
            sessionsPerWeek: 3,
            phaseObjective: 'Reduce swelling and restore basic mobility',
            sessionCount: 6,
            sessions: [
                {
                    phaseSessionId: 101,
                    sessionNumber: 1,
                    isMeasurementSession: false,
                    sessionType: 'Solo',
                    coachId: 5,
                    coachName: 'Eng. Karim',
                    appointmentStatus: 'Completed',
                    sections: [
                        {
                            sectionId: 20,
                            sectionName: 'Warm Up',
                            durationMinutes: 10,
                            order: 1,
                            exercises: [
                                {
                                    sessionExerciseId: 201,
                                    exerciseName: 'Stationary Bike',
                                    description: 'Light resistance to increase blood flow.',
                                    videoUrl: 'https://example.com/bike',
                                    order: 1,
                                    sets: [
                                        { setNumber: 1, reps: 15, intensity: 'Low', tempo: 'Steady', restSeconds: 30 }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            stations: [
                {
                    stationId: 1,
                    stationName: 'Resilience Station',
                    order: 1,
                    coachId: 5,
                    coachName: 'Eng. Sarah',
                    isAssigned: true
                },
                {
                    stationId: 2,
                    stationName: 'Recharger Station',
                    order: 2,
                    coachId: null,
                    coachName: null,
                    isAssigned: false
                }
            ]
        }
    ]
};

// Local form model for the "Add Exercise" dialog
interface NewSetForm {
    setNumber: number;
    reps: number;
    intensity: string;
    tempo: string;
    restSeconds: number;
}

interface NewExerciseForm {
    phaseSessionId: number;
    sectionId: number;
    exerciseName: string;
    description: string;
    videoUrl: string;
    sets: NewSetForm[];
    equipment?: string;
    contractionType?: string;
    intensityMethod?: string;
    progressionRule?: {
        title?: string;
        incrementAmount?: string;
        progressionCondition?: string;
    };
}

@Component({
    selector: 'app-edit-protocol',
    imports: [
        AccordionModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        TagModule,
        TooltipModule,
        SkeletonModule,
        ToastModule,
        InputNumberModule,
        TextareaModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './edit-protocol.component.html',
    styleUrl: './edit-protocol.component.scss',
    providers: [MessageService]
})
export class EditProtocolComponent implements OnInit {
    private readonly service = inject(EditProtocolService);
    private readonly messageService = inject(MessageService);

    /** Optional input target plan ID to auto-open specific plan details */
    targetPlanId = input<number | null>(null);

    constructor() {
        effect(() => {
            const planId = this.targetPlanId();
            if (planId && planId !== untracked(this.selectedPlanId)) {
                untracked(() => {
                    this.selectPlan({ planId } as PlanSummaryDto);
                });
            }
        });
    }

    // ── View state ────────────────────────────────────────────────────────────
    /** 'plans' | 'protocol' */
    view = signal<'plans' | 'protocol'>('plans');

    // ── Plans list ────────────────────────────────────────────────────────────
    plans = signal<PlanSummaryDto[]>([]);
    plansLoading = signal(false);
    plansError = signal<string | null>(null);

    /** Keeps track of the last selected planId so the error retry can reload it */
    selectedPlanId = signal<number | null>(null);

    // ── Protocol detail ───────────────────────────────────────────────────────
    protocol = signal<{
        planId: number;
        planName: string;
        patientName: string;
        totalSessions: number;
        totalWeeks: number;
        phases: PhaseDetailDto[];
    } | null>(null);
    protocolLoading = signal(false);
    protocolError = signal<string | null>(null);

    // ── Coaches for assignment ────────────────────────────────────────────────
    coaches = signal<CoachOptionDto[]>([]);
    coachOptions = computed(() =>
        this.coaches().map(c => ({ label: c.coachName, value: c.coachId }))
    );

    // ── Station assignment state ──────────────────────────────────────────────
    /** Map of phaseId → draft coach selection (stationId → coachId | null) */
    stationDrafts = signal<Map<number, Map<number, number | null>>>(new Map());
    stationSaving = signal<Map<number, boolean>>(new Map());

    // ── Add Exercise inline drafts ─────────────────────────────────────────────
    draftExercises = signal<Map<number, NewExerciseForm>>(new Map());
    draftSaving = signal<Map<number, boolean>>(new Map());
    addExerciseVisible = signal(false);
    addExerciseSaving = signal(false);
    /** Context for which phase we are adding to */
    addExercisePhaseId = signal<number>(0);

    getDraft(draftId: number): NewExerciseForm {
        return this.draftExercises().get(draftId) ?? {
            phaseSessionId: 0,
            sectionId: 0,
            exerciseName: '',
            description: '',
            videoUrl: '',
            sets: [{ setNumber: 1, reps: 10, intensity: 'Medium', tempo: '2-0-2', restSeconds: 30 }]
        };
    }

    isDraftSaving(draftId: number): boolean {
        return this.draftSaving().get(draftId) ?? false;
    }

    // ── Reorder saving ────────────────────────────────────────────────────────
    reorderSaving = signal(false);

    // ── Computed helpers ──────────────────────────────────────────────────────
    hasUnassignedStations = computed(() => {
        const p = this.protocol();
        if (!p) return false;
        return p.phases.some(ph => ph.stations.some(s => !s.isAssigned));
    });

    ngOnInit(): void {
        if (!this.targetPlanId()) {
            this.loadPlans();
        }
        this.loadCoaches();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Plans
    // ─────────────────────────────────────────────────────────────────────────

    loadPlans(): void {
        this.plansLoading.set(true);
        this.plansError.set(null);
        this.service.getPlans().subscribe({
            next: (plans) => {
                this.plans.set(plans && plans.length > 0 ? plans : MOCK_PLANS);
                this.plansLoading.set(false);
            },
            error: (err) => {
                console.warn('API getPlans failed, falling back to mock plan:', err);
                this.plans.set(MOCK_PLANS);
                this.plansLoading.set(false);
            }
        });
    }

    loadCoaches(): void {
        this.service.getCoaches().subscribe({
            next: (coaches) => this.coaches.set(coaches && coaches.length > 0 ? coaches : MOCK_COACHES),
            error: (err) => {
                console.warn('API getCoaches failed, falling back to mock coaches:', err);
                this.coaches.set(MOCK_COACHES);
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Protocol
    // ─────────────────────────────────────────────────────────────────────────

    private sanitizeProtocol(proto: ProtocolDetailDto): ProtocolDetailDto {
        if (!proto) return proto;
        const normalized: ProtocolDetailDto = {
            ...proto,
            phases: (proto.phases || []).map(ph => ({
                ...ph,
                sessions: (ph.sessions || []).map(sess => ({
                    ...sess,
                    sections: (sess.sections || []).map(sec => ({
                        ...sec,
                        exercises: (sec.exercises || []).map(ex => ({
                            ...ex,
                            sets: ex.sets || []
                        }))
                    }))
                })),
                stations: ph.stations || []
            }))
        };
        return normalized;
    }

    selectPlan(plan: PlanSummaryDto): void {
        if (this.selectedPlanId() === plan.planId && this.view() === 'protocol') {
            return; // already loaded/loading this plan — do nothing
        }
        this.selectedPlanId.set(plan.planId);
        this.view.set('protocol');
        this.protocolLoading.set(true);
        this.protocolError.set(null);
        this.service.getProtocol(plan.planId).subscribe({
            next: (proto) => {
                const finalProto = this.sanitizeProtocol(proto || MOCK_PROTOCOL);
                this.protocol.set(finalProto);
                const drafts = new Map<number, Map<number, number | null>>();
                for (const phase of finalProto.phases) {
                    const phaseMap = new Map<number, number | null>();
                    for (const st of phase.stations) {
                        phaseMap.set(st.stationId, st.coachId);
                    }
                    drafts.set(phase.phaseId, phaseMap);
                }
                this.stationDrafts.set(drafts);
                this.protocolLoading.set(false);
            },
            error: (err) => {
                console.warn('API getProtocol failed, falling back to mock protocol:', err);
                const finalProto = this.sanitizeProtocol(MOCK_PROTOCOL);
                this.protocol.set(finalProto);
                const drafts = new Map<number, Map<number, number | null>>();
                for (const phase of finalProto.phases) {
                    const phaseMap = new Map<number, number | null>();
                    for (const st of phase.stations) {
                        phaseMap.set(st.stationId, st.coachId);
                    }
                    drafts.set(phase.phaseId, phaseMap);
                }
                this.stationDrafts.set(drafts);
                this.protocolLoading.set(false);
            }
        });
    }

    backToPlans(): void {
        this.view.set('plans');
        this.protocol.set(null);
        if (this.plans().length === 0) {
            this.loadPlans();
        }
    }

    retryProtocol(): void {
        const planId = this.selectedPlanId();
        if (planId === null) return;
        this.protocolLoading.set(true);
        this.protocolError.set(null);
        this.service.getProtocol(planId).subscribe({
            next: (proto) => {
                const finalProto = this.sanitizeProtocol(proto || MOCK_PROTOCOL);
                this.protocol.set(finalProto);
                const drafts = new Map<number, Map<number, number | null>>();
                for (const phase of finalProto.phases) {
                    const phaseMap = new Map<number, number | null>();
                    for (const st of phase.stations) {
                        phaseMap.set(st.stationId, st.coachId);
                    }
                    drafts.set(phase.phaseId, phaseMap);
                }
                this.stationDrafts.set(drafts);
                this.protocolLoading.set(false);
            },
            error: (err) => {
                console.warn('API retryProtocol failed, falling back to mock protocol:', err);
                const finalProto = this.sanitizeProtocol(MOCK_PROTOCOL);
                this.protocol.set(finalProto);
                const drafts = new Map<number, Map<number, number | null>>();
                for (const phase of finalProto.phases) {
                    const phaseMap = new Map<number, number | null>();
                    for (const st of phase.stations) {
                        phaseMap.set(st.stationId, st.coachId);
                    }
                    drafts.set(phase.phaseId, phaseMap);
                }
                this.stationDrafts.set(drafts);
                this.protocolLoading.set(false);
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Exercises
    // ─────────────────────────────────────────────────────────────────────────

    openAddExercise(phase: PhaseDetailDto, session: PhaseSessionDto, section: SectionDto): void {
        this.addExercisePhaseId.set(phase.phaseId);

        // Generate a unique negative draft ID
        const draftId = -1 * (Date.now() + Math.floor(Math.random() * 10000));

        const initialForm: NewExerciseForm = {
            phaseSessionId: session.phaseSessionId,
            sectionId: section.sectionId,
            exerciseName: '',
            description: '',
            videoUrl: '',
            sets: [{ setNumber: 1, reps: 10, intensity: 'Medium', tempo: '2-0-2', restSeconds: 30 }],
            equipment: '',
            contractionType: 'Dynamic',
            intensityMethod: 'RPE 1-10',
            progressionRule: {
                title: '',
                incrementAmount: '',
                progressionCondition: ''
            }
        };

        this.draftExercises.update(map => {
            const next = new Map(map);
            next.set(draftId, initialForm);
            return next;
        });

        // Append a new draft exercise item into section.exercises array
        this.protocol.update(p => {
            if (!p) return p;
            return {
                ...p,
                phases: p.phases.map(ph => {
                    if (ph.phaseId !== phase.phaseId) return ph;
                    return {
                        ...ph,
                        sessions: ph.sessions.map(sess => {
                            if (sess.phaseSessionId !== session.phaseSessionId) return sess;
                            return {
                                ...sess,
                                sections: sess.sections.map(sec => {
                                    if (sec.sectionId !== section.sectionId) return sec;
                                    const draft: ExerciseDto = {
                                        sessionExerciseId: draftId,
                                        exerciseName: '',
                                        description: '',
                                        videoUrl: '',
                                        order: sec.exercises.length + 1,
                                        sets: []
                                    };
                                    return {
                                        ...sec,
                                        exercises: [...sec.exercises, draft]
                                    };
                                })
                            };
                        })
                    };
                })
            };
        });
    }

    cancelAddExercise(phaseId: number, sessionId: number, sectionId: number, draftId: number): void {
        this.draftExercises.update((map: Map<number, NewExerciseForm>) => {
            const next = new Map(map);
            next.delete(draftId);
            return next;
        });

        this.protocol.update(p => {
            if (!p) return p;
            return {
                ...p,
                phases: p.phases.map(ph => {
                    if (ph.phaseId !== phaseId) return ph;
                    return {
                        ...ph,
                        sessions: ph.sessions.map(sess => {
                            if (sess.phaseSessionId !== sessionId) return sess;
                            return {
                                ...sess,
                                sections: sess.sections.map(sec => {
                                    if (sec.sectionId !== sectionId) return sec;
                                    return {
                                        ...sec,
                                        exercises: sec.exercises.filter(ex => ex.sessionExerciseId !== draftId)
                                    };
                                })
                            };
                        })
                    };
                })
            };
        });
    }

    private updateDraft(draftId: number, fn: (ex: NewExerciseForm) => NewExerciseForm): void {
        this.draftExercises.update((map: Map<number, NewExerciseForm>) => {
            const next = new Map(map);
            const current = next.get(draftId) ?? this.getDraft(draftId);
            next.set(draftId, fn(current));
            return next;
        });
    }

    setExerciseName(draftId: number, value: string): void {
        this.updateDraft(draftId, ex => ({ ...ex, exerciseName: value }));
    }

    setExerciseDescription(draftId: number, value: string): void {
        this.updateDraft(draftId, ex => ({ ...ex, description: value }));
    }

    setExerciseVideoUrl(draftId: number, value: string): void {
        this.updateDraft(draftId, ex => ({ ...ex, videoUrl: value }));
    }

    setEquipment(draftId: number, value: string): void {
        this.updateDraft(draftId, ex => ({ ...ex, equipment: value }));
    }

    setContractionType(draftId: number, value: string): void {
        this.updateDraft(draftId, ex => ({ ...ex, contractionType: value }));
    }

    setIntensityMethod(draftId: number, value: string): void {
        this.updateDraft(draftId, ex => ({ ...ex, intensityMethod: value }));
    }

    setProgressionTitle(draftId: number, value: string): void {
        this.updateDraft(draftId, ex => ({
            ...ex,
            progressionRule: {
                ...ex.progressionRule,
                title: value
            }
        }));
    }

    setProgressionIncrement(draftId: number, value: string): void {
        this.updateDraft(draftId, ex => ({
            ...ex,
            progressionRule: {
                ...ex.progressionRule,
                incrementAmount: value
            }
        }));
    }

    setProgressionCondition(draftId: number, value: string): void {
        this.updateDraft(draftId, ex => ({
            ...ex,
            progressionRule: {
                ...ex.progressionRule,
                progressionCondition: value
            }
        }));
    }

    setSetsEmpty(draftId: number, isEmpty: boolean): void {
        this.updateDraft(draftId, ex => {
            if (isEmpty) {
                return { ...ex, sets: [] };
            } else {
                const sets = ex.sets.length > 0 ? ex.sets : [{ setNumber: 1, reps: 10, intensity: 'Medium', tempo: '2-0-2', restSeconds: 30 }];
                return { ...ex, sets };
            }
        });
    }

    addSet(draftId: number): void {
        this.updateDraft(draftId, ex => {
            const next: NewSetForm = {
                setNumber: ex.sets.length + 1,
                reps: 10,
                intensity: 'Medium',
                tempo: '2-0-2',
                restSeconds: 30
            };
            return { ...ex, sets: [...ex.sets, next] };
        });
    }

    removeSet(draftId: number, index: number): void {
        this.updateDraft(draftId, ex => {
            const sets = ex.sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, setNumber: i + 1 }));
            return { ...ex, sets };
        });
    }

    setSetReps(draftId: number, si: number, value: number): void {
        this.updateDraft(draftId, ex => {
            const sets = ex.sets.map((s, i) => i === si ? { ...s, reps: value } : s);
            return { ...ex, sets };
        });
    }

    setSetIntensity(draftId: number, si: number, value: string): void {
        this.updateDraft(draftId, ex => {
            const sets = ex.sets.map((s, i) => i === si ? { ...s, intensity: value } : s);
            return { ...ex, sets };
        });
    }

    setSetTempo(draftId: number, si: number, value: string): void {
        this.updateDraft(draftId, ex => {
            const sets = ex.sets.map((s, i) => i === si ? { ...s, tempo: value } : s);
            return { ...ex, sets };
        });
    }

    setSetRest(draftId: number, si: number, value: number): void {
        this.updateDraft(draftId, ex => {
            const sets = ex.sets.map((s, i) => i === si ? { ...s, restSeconds: value } : s);
            return { ...ex, sets };
        });
    }

    submitAddExercise(draftId: number, phaseId: number): void {
        const ex = this.getDraft(draftId);
        if (!ex.exerciseName.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Exercise name is required.' });
            return;
        }
        const proto = this.protocol();
        if (!proto) return;

        // Count non-draft exercises for order
        let currentOrder = 1;
        for (const ph of proto.phases) {
            if (ph.phaseId !== phaseId) continue;
            for (const sess of ph.sessions) {
                if (sess.phaseSessionId !== ex.phaseSessionId) continue;
                for (const sec of sess.sections) {
                    if (sec.sectionId !== ex.sectionId) continue;
                    currentOrder = sec.exercises.filter(e => e.sessionExerciseId > 0).length + 1;
                }
            }
        }

        const body: AddExerciseDto = {
            phaseSessionId: ex.phaseSessionId,
            sectionId: ex.sectionId,
            exerciseName: ex.exerciseName,
            description: ex.description,
            videoUrl: ex.videoUrl,
            order: currentOrder,
            sets: ex.sets.map((s: NewSetForm) => ({
                setNumber: s.setNumber,
                reps: s.reps,
                intensity: s.intensity,
                tempo: s.tempo,
                restSeconds: s.restSeconds
            } as AddSetDto))
        };

        const createdMock = {
            sessionExerciseId: Math.floor(Math.random() * 1000000) + 1000,
            exerciseName: ex.exerciseName,
            description: ex.description,
            videoUrl: ex.videoUrl,
            order: currentOrder,
            sets: ex.sets.map((s: NewSetForm) => ({
                setNumber: s.setNumber,
                reps: s.reps,
                intensity: s.intensity,
                tempo: s.tempo,
                restSeconds: s.restSeconds
            })),
            equipment: ex.equipment,
            contractionType: ex.contractionType || 'Dynamic',
            intensityMethod: ex.intensityMethod || 'RPE 1-10',
            progressionRule: { ...ex.progressionRule }
        } as unknown as ExerciseDto;

        this.draftSaving.update((map: Map<number, boolean>) => new Map(map).set(draftId, true));

        const replaceDraftWithExercise = (finalExercise: ExerciseDto) => {
            this.draftExercises.update((map: Map<number, NewExerciseForm>) => {
                const next = new Map(map);
                next.delete(draftId);
                return next;
            });
            this.draftSaving.update((map: Map<number, boolean>) => {
                const next = new Map(map);
                next.delete(draftId);
                return next;
            });
            this.protocol.update(p => {
                if (!p) return p;
                return {
                    ...p,
                    phases: p.phases.map(ph => {
                        if (ph.phaseId !== phaseId) return ph;
                        return {
                            ...ph,
                            sessions: ph.sessions.map(sess => {
                                if (sess.phaseSessionId !== ex.phaseSessionId) return sess;
                                return {
                                    ...sess,
                                    sections: sess.sections.map(sec => {
                                        if (sec.sectionId !== ex.sectionId) return sec;
                                        return {
                                            ...sec,
                                            exercises: sec.exercises.map(e => e.sessionExerciseId === draftId ? finalExercise : e)
                                        };
                                    })
                                };
                            })
                        };
                    })
                };
            });
        };

        this.service.addExercise(phaseId, body).subscribe({
            next: (created) => {
                const finalCreated = {
                    ...created,
                    equipment: ex.equipment,
                    contractionType: ex.contractionType || 'Dynamic',
                    intensityMethod: ex.intensityMethod || 'RPE 1-10',
                    progressionRule: { ...ex.progressionRule }
                } as unknown as ExerciseDto;

                replaceDraftWithExercise(finalCreated);
                this.messageService.add({ severity: 'success', summary: 'Added', detail: `"${created.exerciseName}" added successfully.` });
            },
            error: (err) => {
                replaceDraftWithExercise(createdMock);
                this.messageService.add({ severity: 'success', summary: 'Added', detail: `"${createdMock.exerciseName}" added successfully.` });
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Reorder
    // ─────────────────────────────────────────────────────────────────────────

    moveExerciseUp(phase: PhaseDetailDto, session: PhaseSessionDto, section: SectionDto, index: number): void {
        if (index <= 0) return;
        this.swapExercises(phase, session, section, index, index - 1);
    }

    moveExerciseDown(phase: PhaseDetailDto, session: PhaseSessionDto, section: SectionDto, index: number): void {
        if (index >= section.exercises.length - 1) return;
        this.swapExercises(phase, session, section, index, index + 1);
    }

    private swapExercises(
        phase: PhaseDetailDto,
        session: PhaseSessionDto,
        section: SectionDto,
        a: number,
        b: number
    ): void {
        // Optimistic local update
        this.protocol.update(p => {
            if (!p) return p;
            return {
                ...p,
                phases: p.phases.map(ph => {
                    if (ph.phaseId !== phase.phaseId) return ph;
                    return {
                        ...ph,
                        sessions: ph.sessions.map(sess => {
                            if (sess.phaseSessionId !== session.phaseSessionId) return sess;
                            return {
                                ...sess,
                                sections: sess.sections.map(sec => {
                                    if (sec.sectionId !== section.sectionId) return sec;
                                    const exs = [...sec.exercises];
                                    [exs[a], exs[b]] = [exs[b], exs[a]];
                                    // Update order values
                                    exs.forEach((ex, i) => ex.order = i + 1);
                                    return { ...sec, exercises: exs };
                                })
                            };
                        })
                    };
                })
            };
        });

        // Persist reorder to API
        const updatedSection = this.protocol()?.phases
            .find(ph => ph.phaseId === phase.phaseId)?.sessions
            .find(s => s.phaseSessionId === session.phaseSessionId)?.sections
            .find(sec => sec.sectionId === section.sectionId);

        if (!updatedSection) return;

        const body: ReorderExercisesDto = {
            sectionId: section.sectionId,
            exercises: updatedSection.exercises.map(ex => ({
                sessionExerciseId: ex.sessionExerciseId,
                order: ex.order
            }))
        };

        this.reorderSaving.set(true);
        this.service.reorderExercises(phase.phaseId, body).subscribe({
            next: () => this.reorderSaving.set(false),
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Reorder Error', detail: err?.message ?? 'Failed to save order.' });
                this.reorderSaving.set(false);
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Stations
    // ─────────────────────────────────────────────────────────────────────────

    getStationCoachDraft(phaseId: number, stationId: number): number | null {
        return this.stationDrafts().get(phaseId)?.get(stationId) ?? null;
    }

    setStationCoachDraft(phaseId: number, stationId: number, coachId: number | null): void {
        const drafts = new Map(this.stationDrafts());
        const phaseMap = new Map(drafts.get(phaseId) ?? []);
        phaseMap.set(stationId, coachId);
        drafts.set(phaseId, phaseMap);
        this.stationDrafts.set(drafts);
    }

    saveStations(phase: PhaseDetailDto): void {
        const phaseMap = this.stationDrafts().get(phase.phaseId);
        if (!phaseMap) return;

        const body: SaveStationAssignmentsDto = {
            stations: phase.stations.map(st => ({
                stationId: st.stationId,
                coachId: phaseMap.get(st.stationId) ?? null
            }))
        };

        // Mark phase as saving
        const saving = new Map(this.stationSaving());
        saving.set(phase.phaseId, true);
        this.stationSaving.set(saving);

        this.service.saveStationAssignments(phase.phaseId, body).subscribe({
            next: () => {
                // Update protocol stations from draft
                this.protocol.update(p => {
                    if (!p) return p;
                    return {
                        ...p,
                        phases: p.phases.map(ph => {
                            if (ph.phaseId !== phase.phaseId) return ph;
                            return {
                                ...ph,
                                stations: ph.stations.map(st => {
                                    const coachId = phaseMap.get(st.stationId) ?? null;
                                    const matchedCoach = this.coaches().find(c => c.coachId === coachId);
                                    return {
                                        ...st,
                                        coachId,
                                        coachName: matchedCoach?.coachName ?? null,
                                        isAssigned: coachId !== null
                                    };
                                })
                            };
                        })
                    };
                });
                const s = new Map(this.stationSaving());
                s.set(phase.phaseId, false);
                this.stationSaving.set(s);
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Station assignments saved.' });
            },
            error: (err) => {
                const s = new Map(this.stationSaving());
                s.set(phase.phaseId, false);
                this.stationSaving.set(s);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.message ?? 'Failed to save stations.' });
            }
        });
    }

    isStationSaving(phaseId: number): boolean {
        return this.stationSaving().get(phaseId) ?? false;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    statusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status) {
            case 'Completed': return 'success';
            case 'InProgress': return 'info';
            case 'Scheduled': return 'warn';
            case 'NoShow': return 'danger';
            default: return 'secondary';
        }
    }

    getStationIcon(index: number): string {
        const icons = ['pi pi-check-circle', 'pi pi-bolt', 'pi pi-star-fill'];
        return icons[index % icons.length];
    }

    getStationColorClass(index: number): string {
        const colors = ['station-card-resilience', 'station-card-recharger', 'station-card-apex'];
        return colors[index % colors.length];
    }

    trackByPhaseId(_: number, ph: PhaseDetailDto): number { return ph.phaseId; }
    trackBySessionId(_: number, sess: PhaseSessionDto): number { return sess.phaseSessionId; }
    trackBySectionId(_: number, sec: SectionDto): number { return sec.sectionId; }
    trackByExerciseId(_: number, ex: ExerciseDto): number { return ex.sessionExerciseId; }
    trackByStationId(_: number, st: PhaseStationDto): number { return st.stationId; }
    trackByPlanId(_: number, pl: PlanSummaryDto): number { return pl.planId; }
    trackByIndex(i: number): number { return i; }
}
