import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Protocol, Phase, Week, Session, Exercise, Section, SetData, PhaseCriteria, TransitionCriterion, ExerciseType, ManualType, TreatmentPlanRequest, TreatmentPlanPhase, TreatmentPlanSession, TreatmentPlanSection, TreatmentPlanExercise, TreatmentPlanSet, TreatmentPlanCriterion } from '../models/protocol.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProtocolService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;
    readonly isEditMode = computed(() => this.stepperMode() === 'edit');

    // ── API state signals ─────────────────────────────────────────────────────
    readonly savingDraft = signal(false);
    readonly saveDraftError = signal<string | null>(null);
    readonly loadingProtocols = signal(false);

    // ── State ────────────────────────────────────────────────────────────────
    readonly protocols = signal<Protocol[]>([]);

    constructor() {
        this.fetchProtocols();
    }

    /**
     * Fetches all treatment plans from the API and maps them to the local Protocol model.
     */
    fetchProtocols(): void {
        this.loadingProtocols.set(true);
        this.http.get<any>(this.apiUrl + 'TreatmentPlans').subscribe({
            next: (data: any) => {
                const mappedProtocols = data.data.map((item: any) => this.mapToProtocol(item));
                this.protocols.set(mappedProtocols);
                this.loadingProtocols.set(false);
            },
            error: (err) => {
                console.error('Failed to fetch protocols:', err);
                this.loadingProtocols.set(false);
            }
        });
    }

    /**
     * Fetches detailed treatment plan by ID.
     */
    getTreatmentPlanById(id: number): Observable<Protocol> {
        return this.http.get<any>(`${this.apiUrl}TreatmentPlans/${id}`).pipe(
            map(res => this.mapToProtocol(res.data))
        );
    }

    private mapToProtocol(apiData: any): Protocol {
        return {
            id: apiData.id || 0,
            name: apiData.name || '',
            status: apiData.status,
            injuryCondition: apiData.injuryCondition,
            primaryGoal: apiData.primaryGoal,
            targetAthleteLevel: apiData.targetAthleteLevel,
            services: (apiData.protocolTypes || []).map((s: any) => ({
                id: s.serviceId,
                serviceNameEn: s.serviceNameEn,
                serviceNameAr: s.serviceNameAr,
                selected: true
            })),
            weeks: apiData.totalWeeks,
            totalSessions: apiData.totalSessions,
            template: apiData.template,
            numberOfPhases: apiData.numberOfPhases,
            phases: (apiData.phases || []).map((p: any) => this.mapToPhase(p)),
            contraindications: apiData.contraindications || [],
            doctorNameAr: apiData.doctorNameAr || null,
            doctorNameEn: apiData.doctorNameEn || null,
            doctorId: apiData.doctorId || null,
            patientId: apiData.patientId || null,
        };
    }

    private mapToPhase(apiPhase: any): Phase {
        const sessionsPerWeek = apiPhase.sessionsPerWeek || 0;
        const totalWeeks = apiPhase.weeks || 0;
        const phase: Phase = {
            id: String(apiPhase.id || apiPhase.phaseOrder),
            name: apiPhase.phaseName || '',
            totalWeeks: totalWeeks,
            sessionsPerWeek: sessionsPerWeek,
            objective: apiPhase.phaseObjective || '',
            criteria: {
                progressionCriteria: '',
                regressionCriteria: '',
                precautions: '',
                transitionCriteria: (apiPhase.criteria || []).map((c: any, idx: number) => ({
                    id: idx,
                    metric: c.criterionType,
                    operator: c.operator as any,
                    value: c.value,
                    unit: c.unit
                }))
            },
            weeks: [],
            measurementSessionNums: (apiPhase.sessions || [])
                .filter((s: any) => s.isMeasurementSession)
                .map((s: any) => s.sessionNumber)
        };

        // Reconstruct weeks and sessions
        for (let w = 1; w <= totalWeeks; w++) {
            const week: Week = {
                weekNumber: w,
                sessions: []
            };

            for (let s = 1; s <= sessionsPerWeek; s++) {
                const sessionNum = (w - 1) * sessionsPerWeek + s;
                const apiSession = (apiPhase.sessions || []).find((as: any) => as.sessionNumber === sessionNum);

                if (apiSession) {
                    week.sessions.push({
                        sessionNumber: sessionNum,
                        measurementTemplateId: apiSession.measurementTemplateId,
                        sections: (apiSession.sections || []).map((sec: any) => ({
                            sectionName: sec.sectionName,
                            time: String(sec.durationMinutes) + ' min',
                            exercises: (sec.exercises || []).map((ex: any) => this.mapToExercise(ex))
                        }))
                    });
                } else {
                    // Initialize empty session
                    const isMeasurement = phase.measurementSessionNums.includes(sessionNum);
                    week.sessions.push({
                        sessionNumber: sessionNum,
                        measurementTemplateId: null,
                        sections: isMeasurement ? [] : [
                            {
                                sectionName: 'Warm Up',
                                time: '10 min',
                                exercises: []
                            }
                        ]
                    });
                }
            }
            phase.weeks.push(week);
        }

        return phase;
    }

    private mapToExercise(apiEx: any): Exercise {
        const type = String(apiEx.exerciseType || '').toLowerCase() as 'exercise' | 'manual';
        const base: any = {
            id: apiEx.id,
            type: type,
            name: apiEx.exerciseName,
            description: apiEx.description,
            progressionRule: {
                title: apiEx.progressionTitle,
                incrementAmount: apiEx.incrementAmount,
                progressionCondition: apiEx.progressionCondition
            }
        };

        if (type === 'exercise') {
            return {
                ...base,
                equipment: apiEx.equipment,
                contractionType: apiEx.contractionType,
                intensityMethod: apiEx.intensityMethod,
                sets: (apiEx.sets || []).map((s: any) => ({
                    repetitions: s.reps,
                    intensity: s.intensity,
                    tempo: s.tempo,
                    rest: String(s.restSeconds) + 's'
                }))
            } as ExerciseType;
        } else {
            return {
                ...base,
                videoUrl: apiEx.videoUrl
            } as ManualType;
        }
    }

    readonly showStepper = signal(false);
    readonly activeProtocol = signal<Protocol | null>(null);
    readonly currentStep = signal(1);
    readonly stepperMode = signal<'create' | 'view' | 'edit'>('create');

    /** Bump this whenever nested object properties are mutated via ngModel
     *  so any computed() that reads it will re-run. */
    readonly protocolRevision = signal(0);
    notifyChange(): void {
        this.protocolRevision.update(v => v + 1);
    }

    readonly protocolCount = computed(() => this.protocols().length);

    // ── Protocol CRUD ────────────────────────────────────────────────────────
    startNewProtocol(): void {
        const newProtocol: Protocol = {
            id: Date.now(),
            name: '',
            status: 'Draft',
            services: [],
            weeks: null,
            totalSessions: null,
            template: null,
            phases: [this.createPhase(1)],
        };
        this.activeProtocol.set(newProtocol);
        this.stepperMode.set('create');
        this.currentStep.set(1);
        this.showStepper.set(true);
    }

    viewProtocol(protocol: Protocol): void {
        this.getTreatmentPlanById(protocol.id).subscribe({
            next: (fullProtocol) => {
                this.activeProtocol.set(fullProtocol);
                this.stepperMode.set('view');
                this.currentStep.set(1);
                this.showStepper.set(true);
            },
            error: (err) => console.error('Failed to fetch protocol details:', err)
        });
    }

    editProtocol(protocol: Protocol): void {
        this.getTreatmentPlanById(protocol.id).subscribe({
            next: (fullProtocol) => {
                this.activeProtocol.set(fullProtocol);
                this.stepperMode.set('edit');
                this.currentStep.set(1);
                this.showStepper.set(true);
            },
            error: (err) => console.error('Failed to fetch protocol details:', err)
        });
    }

    finaliseProtocol(): void {
        const proto = this.activeProtocol();
        if (!proto) return;
        proto.status = 'Published';
        this.protocols.update(list => [...list, proto]);
        this.activeProtocol.set(null);
        this.showStepper.set(false);
        this.stepperMode.set('create');
        this.currentStep.set(1);
    }

    saveProtocolAsDraft(): void {
        const proto = this.activeProtocol();
        if (!proto) return;
        proto.status = 'Draft';
        this.protocols.update(list => [...list, proto]);
        this.activeProtocol.set(null);
        this.showStepper.set(false);
        this.stepperMode.set('create');
        this.currentStep.set(1);
    }

    // ── API: Create Treatment Plan ────────────────────────────────────────────
    /**
     * Maps the active Protocol signal to the TreatmentPlans API request body
     * and sends a POST request to create a new treatment plan.
     *
     * @param saveAsDraft - when true the record is saved as a draft on the server.
     */
    createTreatmentPlan(saveAsDraft: boolean = true, patientId?: string | null, doctorId?: string | null): Observable<unknown> {
        const proto = this.activeProtocol();
        if (!proto) {
            throw new Error('No active protocol to save.');
        }

        const body = this.mapProtocolToRequest(proto, saveAsDraft, patientId, doctorId);
        return this.http.post<unknown>(this.apiUrl + 'TreatmentPlans', body);
    }

    /**
     * Maps the active Protocol signal to the TreatmentPlans API request body
     * and sends a PUT request to update an existing treatment plan.
     *
     * @param id - The ID of the treatment plan to update.
     * @param saveAsDraft - when true the record is saved as a draft on the server.
     */
    updateTreatmentPlan(id: number, saveAsDraft?: boolean, patientId?: string | null, doctorId?: string | null): Observable<unknown> {
        const proto = this.activeProtocol();
        if (!proto) {
            throw new Error('No active protocol to update.');
        }

        // If status is 'Published', we don't want to revert it to 'Draft'
        const calculatedSaveAsDraft = saveAsDraft !== undefined
            ? saveAsDraft
            : (proto.status !== 'Published');

        const body = this.mapProtocolToRequest(proto, calculatedSaveAsDraft, patientId, doctorId);
        return this.http.put<unknown>(`${this.apiUrl}TreatmentPlans/${id}`, body);
    }

    private mapProtocolToRequest(proto: Protocol, saveAsDraft: boolean, patientId?: string | null, doctorId?: string | null): TreatmentPlanRequest {
        const totalWeeks = proto.phases.reduce((sum, p) => sum + (p.totalWeeks ?? 0), 0);
        const avgSessionsPerWeek = proto.phases.length
            ? Math.round(proto.phases.reduce((sum, p) => sum + (p.sessionsPerWeek ?? 0), 0) / proto.phases.length)
            : 0;

        return {
            name: proto.name,
            injuryCondition: proto.injuryCondition || '',
            primaryGoal: proto.primaryGoal || '',
            totalWeeks,
            sessionsPerWeek: avgSessionsPerWeek,
            numberOfPhases: proto.phases.length,
            targetAthleteLevel: proto.targetAthleteLevel || '',
            saveAsDraft,
            patientId: patientId || null,
            doctorId: doctorId || null,
            protocolServiceIds: (proto.services ?? []).map(s => s.id),
            contraindications: (proto.contraindications || []).map(c => c.description),
            phases: proto.phases.map((phase, phaseIdx) => this.mapPhase(phase, phaseIdx)),
        };
    }

    getAthletes(): Observable<any[]> {
        return this.http.get<any>(this.apiUrl + 'Athletes').pipe(map(res => res.data));
    }

    private mapPhase(phase: Phase, phaseIdx: number): TreatmentPlanPhase {
        const allSessions = phase.weeks.flatMap(w => w.sessions);
        return {
            phaseName: phase.name,
            phaseOrder: phaseIdx + 1,
            weeks: phase.totalWeeks,
            sessionsPerWeek: phase.sessionsPerWeek,
            phaseObjective: phase.objective ?? '',
            criteria: (phase.criteria.transitionCriteria ?? []).map(tc => ({
                criterionType: tc.metric,
                operator: tc.operator,
                value: tc.value ?? 0,
                unit: tc.unit,
            } satisfies TreatmentPlanCriterion)),
            sessions: allSessions.map(session => this.mapSession(session, phase)),
        };
    }

    private mapSession(session: Session, phase: Phase): TreatmentPlanSession {
        const isMeasurement = phase.measurementSessionNums.includes(session.sessionNumber);
        return {
            sessionNumber: session.sessionNumber,
            isMeasurementSession: isMeasurement,
            measurementTemplateId: session.measurementTemplateId ?? 0,
            sections: isMeasurement ? [] : session.sections.map((sec, secIdx) => this.mapSection(sec, secIdx)),
        };
    }

    private mapSection(section: Section, sectionIdx: number): TreatmentPlanSection {
        return {
            sectionName: section.sectionName,
            durationMinutes: this.parseDurationMinutes(section.time),
            order: sectionIdx + 1,
            exercises: section.exercises.map((ex, exIdx) => this.mapExercise(ex, exIdx)),
        };
    }

    private mapExercise(ex: Exercise, exIdx: number): TreatmentPlanExercise {
        const isExercise = ex.type === 'exercise';
        const exerciseEx = isExercise ? (ex as ExerciseType) : null;
        return {
            exerciseType: ex.type,
            order: exIdx + 1,
            exerciseId: ex.id ?? 0,
            equipment: exerciseEx?.equipment ?? '',
            contractionType: exerciseEx?.contractionType ?? '',
            intensityMethod: exerciseEx?.intensityMethod ?? '',
            sets: (exerciseEx?.sets ?? []).map((set, setIdx) => ({
                setNumber: setIdx + 1,
                reps: set.repetitions,
                intensity: set.intensity,
                tempo: set.tempo,
                restSeconds: this.parseRestSeconds(set.rest),
            } satisfies TreatmentPlanSet)),
            exerciseName: ex.name,
            description: ex.description ?? '',
            videoUrl: ex.type === 'manual' ? (ex as import('../models/protocol.model').ManualType).videoUrl ?? '' : '',
            progressionTitle: ex.progressionRule?.title ?? '',
            incrementAmount: ex.progressionRule?.incrementAmount ?? 0,
            progressionCondition: ex.progressionRule?.progressionCondition ?? '',
        };
    }

    /** Converts rest strings like '60s', '1m', '90' to seconds. */
    private parseRestSeconds(rest: string): number {
        if (!rest) return 0;
        const minMatch = rest.match(/(\d+(?:\.\d+)?)\s*m/i);
        if (minMatch) return Math.round(parseFloat(minMatch[1]) * 60);
        const secMatch = rest.match(/(\d+(?:\.\d+)?)/i);
        if (secMatch) return Math.round(parseFloat(secMatch[1]));
        return 0;
    }

    /** Converts duration strings like '10 min', '1h', '60' to minutes. */
    private parseDurationMinutes(time: string | undefined): number {
        if (!time) return 0;
        const hourMatch = time.match(/(\d+(?:\.\d+)?)\s*h/i);
        if (hourMatch) return Math.round(parseFloat(hourMatch[1]) * 60);
        const minMatch = time.match(/(\d+(?:\.\d+)?)/i);
        if (minMatch) return Math.round(parseFloat(minMatch[1]));
        return 0;
    }


    cancelProtocol(): void {
        this.activeProtocol.set(null);
        this.showStepper.set(false);
        this.stepperMode.set('create');
        this.currentStep.set(1);
    }

    // ── Phase helpers ────────────────────────────────────────────────────────
    createPhase(id: number): Phase {
        return {
            id: id.toString(),
            name: `Phase ${id}: New Phase`,
            totalWeeks: 0,
            sessionsPerWeek: 0,
            objective: '',
            criteria: this.createCriteria(1),
            weeks: [],
            measurementSessionNums: []
        };
    }

    createCriteria(id: number): PhaseCriteria {
        return {
            progressionCriteria: '',
            regressionCriteria: '',
            precautions: '',
            transitionCriteria: []
        };
    }

    // ── Transition Criteria helpers ──────────────────────────────────────────
    addTransitionCriterion(phase: Phase): void {
        if (!phase.criteria.transitionCriteria) phase.criteria.transitionCriteria = [];
        phase.criteria.transitionCriteria.push({
            id: Date.now(),
            metric: '',
            operator: '≥',
            value: null,
            unit: ''
        });
    }

    removeTransitionCriterion(phase: Phase, index: number): void {
        phase.criteria.transitionCriteria.splice(index, 1);
    }

    // ── Section helpers ──────────────────────────────────────────────────────
    createSection(): Section {
        return {
            sectionName: '',
            time: '',
            exercises: [this.createExercise()]
        };
    }

    // ── Exercise helpers ─────────────────────────────────────────────────────
    createExercise(): Exercise {
        return {
            type: 'exercise',
            name: '',
            equipment: '',
            description: '',
            contractionType: 'Eccentric',
            intensityMethod: 'kg/lb',
            sets: [{ repetitions: 0, intensity: '', tempo: '', rest: '' }],
            progressionRule: {
                title: '',
                incrementAmount: 0,
                progressionCondition: ''
            }
        } as ExerciseType;
    }

    // ── Set-data sync ────────────────────────────────────────────────────────


    // ── Range helpers ────────────────────────────────────────────────────────
    getRange(count: number | string): number[] {
        const num = parseInt(String(count), 10);
        if (isNaN(num) || num <= 0) return [];
        return Array.from({ length: num }, (_, i) => i + 1);
    }

    getTotalSessions(weeks: number | string, perWeek: number | string): number {
        const w = parseInt(String(weeks), 10);
        const s = parseInt(String(perWeek), 10);
        if (isNaN(w) || isNaN(s)) return 0;
        return w * s;
    }

    getSessionNumber(weekNum: number, sessionInWeek: number, perWeek: number | string): number {
        return (weekNum - 1) * parseInt(String(perWeek), 10) + sessionInWeek;
    }

    syncSetData(ex: Exercise): number[] {
        if (ex.type !== 'exercise') return [];
        const exerciseEx = ex as ExerciseType;
        const sets = exerciseEx.sets;

        // Ensure we have at least 1 and at most 20 sets
        if (sets.length < 1) sets.length = 1;
        if (sets.length > 20) sets.length = 20;

        // Fill any holes (e.g. if ngModel increased the length)
        for (let i = 0; i < sets.length; i++) {
            if (!sets[i]) {
                const prev = sets[i - 1];
                sets[i] = {
                    repetitions: prev?.repetitions ?? 0,
                    intensity: prev?.intensity ?? '',
                    tempo: prev?.tempo ?? '',
                    rest: prev?.rest ?? ''
                };
            }
        }

        return Array.from({ length: sets.length }, (_, i) => i);
    }


    ensureSessionData(phase: Phase, sessionNum: number): void {
        const weekIndex = Math.floor((sessionNum - 1) / phase.sessionsPerWeek);
        const sessionIndex = (sessionNum - 1) % phase.sessionsPerWeek;

        if (!phase.weeks[weekIndex]) {
            phase.weeks[weekIndex] = {
                weekNumber: weekIndex + 1,
                sessions: []
            };
        }

        const week = phase.weeks[weekIndex];

        if (!week.sessions[sessionIndex]) {
            const isMeasurement = phase.measurementSessionNums.includes(sessionNum);
            week.sessions[sessionIndex] = {
                sessionNumber: sessionNum,
                sections: isMeasurement ? [] : [
                    {
                        sectionName: '',
                        time: '',
                        exercises: []
                    }
                ]
            };
        }
    }
}
