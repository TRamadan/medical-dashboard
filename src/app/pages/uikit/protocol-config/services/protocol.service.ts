import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, forkJoin } from 'rxjs';
import { Protocol, ProtocolKind, TreatmentPlanFilter, Phase, Week, Session, Exercise, Section, SetData, PhaseCriteria, TransitionCriterion, ExerciseType, ManualType, TreatmentPlanRequest, TreatmentPlanPhase, TreatmentPlanSession, TreatmentPlanSection, TreatmentPlanExercise, TreatmentPlanSet, TreatmentPlanCriterion, CoachManagerOption } from '../models/protocol.model';
import { environment } from '../../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';

/** Result of one plan during an Excel import. */
export interface PlanImportResult {
    planKey: string;
    name: string;
    status: 'pending' | 'success' | 'failed' | 'skipped';
    /** Fields that were empty in the sheet (the plan is then forced to saveAsDraft = true). */
    missing: string[];
    error?: string;
}

interface ParsedPlan {
    key: string;
    body: TreatmentPlanRequest;
    missing: string[];
}

@Injectable({ providedIn: 'root' })
export class ProtocolService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;
    readonly isEditMode = computed(() => this.stepperMode() === 'edit');

    // ── API state signals ─────────────────────────────────────────────────────
    readonly savingDraft = signal(false);
    readonly saveDraftError = signal<string | null>(null);
    readonly loadingProtocols = signal(false);

    // ── Excel import state ────────────────────────────────────────────────────
    readonly importing = signal(false);
    readonly importError = signal<string | null>(null);
    readonly importResults = signal<PlanImportResult[]>([]);

    // ── State ────────────────────────────────────────────────────────────────
    readonly protocols = signal<Protocol[]>([]);

    constructor() {
        this.fetchProtocols();
    }

    /**
     * Fetches treatment plans from the API using filter parameters
     * (defaults to TreatmentPlans?kind=Drafted&status=Draft&isTemplate=false)
     * and maps them to the local Protocol model.
     */
    fetchProtocols(filter?: TreatmentPlanFilter): void {
        this.loadingProtocols.set(true);
        let params = new HttpParams();

        const activeFilter: TreatmentPlanFilter = filter ?? {
            kind: 'Drafted',
            status: 'Draft',
            isTemplate: false,
        };

        if (activeFilter.kind !== undefined && activeFilter.kind !== null) {
            params = params.set('kind', activeFilter.kind);
        }
        if (activeFilter.status !== undefined && activeFilter.status !== null) {
            params = params.set('status', activeFilter.status);
        }
        if (activeFilter.isTemplate !== undefined && activeFilter.isTemplate !== null) {
            params = params.set('isTemplate', String(activeFilter.isTemplate));
        }
        if (activeFilter.patientId !== undefined && activeFilter.patientId !== null) {
            params = params.set('patientId', String(activeFilter.patientId));
        }

        this.http.get<any>(this.apiUrl + 'TreatmentPlans', { params }).subscribe({
            next: (data: any) => {
                const rawList = data?.data ?? (Array.isArray(data) ? data : []);
                const mappedProtocols = rawList.map((item: any) => this.mapToProtocol(item));
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
     * Returns an Observable of treatment plans using filter parameters
     * (defaults to TreatmentPlans?kind=Drafted&status=Draft&isTemplate=false).
     */
    getTreatmentPlans(filter?: TreatmentPlanFilter): Observable<Protocol[]> {
        let params = new HttpParams();
        const activeFilter: TreatmentPlanFilter = filter ?? {
            kind: 'Drafted',
            status: 'Draft',
            isTemplate: false,
        };

        if (activeFilter.kind !== undefined && activeFilter.kind !== null) {
            params = params.set('kind', activeFilter.kind);
        }
        if (activeFilter.status !== undefined && activeFilter.status !== null) {
            params = params.set('status', activeFilter.status);
        }
        if (activeFilter.isTemplate !== undefined && activeFilter.isTemplate !== null) {
            params = params.set('isTemplate', String(activeFilter.isTemplate));
        }
        if (activeFilter.patientId !== undefined && activeFilter.patientId !== null) {
            params = params.set('patientId', String(activeFilter.patientId));
        }

        return this.http.get<any>(this.apiUrl + 'TreatmentPlans', { params }).pipe(
            map((data: any) => {
                const rawList = data?.data ?? (Array.isArray(data) ? data : []);
                return rawList.map((item: any) => this.mapToProtocol(item));
            })
        );
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
        const detectedKind: ProtocolKind = apiData.kind ?? (
            apiData.status === 'Draft'
                ? 'Drafted'
                : (apiData.patientId != null && !apiData.isTemplate ? 'Published' : 'Template')
        );

        return {
            id: apiData.id || 0,
            name: apiData.name || '',
            status: apiData.status,
            kind: detectedKind,
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
            isTemplate: apiData.isTemplate ?? (detectedKind === 'Template'),
            numberOfPhases: apiData.numberOfPhases,
            phases: (apiData.phases || []).map((p: any) => this.mapToPhase(p)),
            contraindications: (apiData.contraindications || []).map((c: any, idx: number) => ({
                id: typeof c === 'object' && c?.id ? c.id : 0,
                description: typeof c === 'string' ? c : (c?.description ?? c?.contraindication ?? c?.name ?? c?.text ?? ''),
                order: typeof c === 'object' && c?.order ? c.order : idx + 1,
            })),
            doctorNameAr: apiData.doctorNameAr || null,
            doctorNameEn: apiData.doctorNameEn || null,
            doctorId: apiData.doctorId || null,
            patientId: apiData.patientId || null,
            patientNameEn: apiData.patientNameEn || null,
            patientNameAr: apiData.patientNameAr || null,
            coachManagerId: apiData.coachManagerId ?? null,
            coachManagerNameEn: apiData.coachManagerNameEn || null,
            coachManagerNameAr: apiData.coachManagerNameAr || null,
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
    readonly stepperMode = signal<'create' | 'view' | 'edit' | 'assignment'>('create');
    readonly isAssigningToPatient = signal(false);

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
                this.isAssigningToPatient.set(false);
                this.currentStep.set(1);
                this.showStepper.set(true);
            },
            error: (err) => console.error('Failed to fetch protocol details:', err)
        });
    }

    assignProtocol(protocol: Protocol): void {
        this.getTreatmentPlanById(protocol.id).subscribe({
            next: (fullProtocol) => {
                this.activeProtocol.set(fullProtocol);
                this.stepperMode.set('assignment');
                this.isAssigningToPatient.set(true);
                this.currentStep.set(1);
                this.showStepper.set(true);
            },
            error: (err) => console.error('Failed to fetch protocol for assignment:', err)
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
    createTreatmentPlan(
        saveAsDraft: boolean = true,
        patientId?: number | string | null,
        doctorId?: string | null,
        medicalReportId?: number | null,
        consultationDecisionId?: number | null,
        notifyPatient?: boolean,
        saveAsNewTemplate?: boolean,
        newTemplateName?: string
    ): Observable<any> {
        const proto = this.activeProtocol();
        if (!proto) {
            throw new Error('No active protocol to save.');
        }

        const body = this.mapProtocolToRequest(
            proto,
            saveAsDraft,
            patientId,
            doctorId,
            medicalReportId,
            consultationDecisionId,
            notifyPatient,
            saveAsNewTemplate,
            newTemplateName
        );
        return this.http.post<any>(this.apiUrl + 'TreatmentPlans', body);
    }

    /**
     * Maps the active Protocol signal to the TreatmentPlans API request body
     * and sends a PUT request to update an existing treatment plan.
     *
     * @param id - The ID of the treatment plan to update.
     * @param saveAsDraft - when true the record is saved as a draft on the server.
     */
    updateTreatmentPlan(
        id: number,
        saveAsDraft?: boolean,
        patientId?: number | string | null,
        doctorId?: string | null,
        medicalReportId?: number | null,
        consultationDecisionId?: number | null,
        notifyPatient?: boolean,
        saveAsNewTemplate?: boolean,
        newTemplateName?: string
    ): Observable<unknown> {
        const proto = this.activeProtocol();
        if (!proto) {
            throw new Error('No active protocol to update.');
        }

        // Selected protocol update must be published (saveAsDraft: false)
        const calculatedSaveAsDraft = saveAsDraft !== undefined
            ? saveAsDraft
            : false;

        const body = this.mapProtocolToRequest(
            proto,
            calculatedSaveAsDraft,
            patientId,
            doctorId,
            medicalReportId,
            consultationDecisionId,
            notifyPatient,
            saveAsNewTemplate,
            newTemplateName
        );
        return this.http.put<unknown>(`${this.apiUrl}TreatmentPlans/${id}`, body);
    }

    private mapProtocolToRequest(
        proto: Protocol,
        saveAsDraft: boolean,
        patientId?: number | string | null,
        doctorId?: string | null,
        medicalReportId?: number | null,
        consultationDecisionId?: number | null,
        notifyPatient?: boolean,
        saveAsNewTemplate?: boolean,
        newTemplateName?: string
    ): TreatmentPlanRequest {
        const totalWeeks = proto.phases.reduce((sum, p) => sum + (p.totalWeeks ?? 0), 0);
        const avgSessionsPerWeek = proto.phases.length
            ? Math.round(proto.phases.reduce((sum, p) => sum + (p.sessionsPerWeek ?? 0), 0) / proto.phases.length)
            : 0;

        let finalPatientId: number | null = null;
        const candidatePatientId = patientId !== undefined ? patientId : proto.patientId;
        if (candidatePatientId !== undefined && candidatePatientId !== null && candidatePatientId !== '') {
            const num = Number(candidatePatientId);
            finalPatientId = !isNaN(num) ? num : null;
        }
        const finalDoctorId = doctorId ?? (proto.doctorId ? String(proto.doctorId) : null);

        const request: TreatmentPlanRequest = {
            name: proto.name,
            injuryCondition: proto.injuryCondition || '',
            primaryGoal: proto.primaryGoal || '',
            totalWeeks,
            sessionsPerWeek: avgSessionsPerWeek,
            numberOfPhases: proto.phases.length,
            targetAthleteLevel: proto.targetAthleteLevel || '',
            saveAsDraft,
            notifyPatient: notifyPatient ?? false,
            patientId: finalPatientId,
            doctorId: finalDoctorId,
            medicalReportId: medicalReportId ?? null,
            consultationDecisionId: consultationDecisionId ?? null,
            protocolServiceIds: (proto.services ?? []).map(s => s.id),
            contraindications: (proto.contraindications || [])
                .map((c: any) => {
                    if (typeof c === 'string') return c.trim();
                    return (c?.description ?? c?.contraindication ?? c?.name ?? c?.text ?? '').trim();
                })
                .filter((desc: string) => desc.length > 0),
            phases: proto.phases.map((phase, phaseIdx) => this.mapPhase(phase, phaseIdx)),
        };

        if (saveAsNewTemplate !== undefined) {
            request.saveAsNewTemplate = saveAsNewTemplate;
        }
        if (newTemplateName !== undefined && newTemplateName !== null && newTemplateName.trim() !== '') {
            request.newTemplateName = newTemplateName.trim();
        }

        return request;
    }



    getCoachManagers(): Observable<CoachManagerOption[]> {
        return this.http.get<any>(this.apiUrl + 'TreatmentPlans/coach-managers').pipe(
            map(res => res.data ?? [])
        );
    }

    assignCoachManager(planId: number, coachManagerId: number): Observable<Protocol> {
        return this.http.put<any>(`${this.apiUrl}TreatmentPlans/${planId}/coach-manager`, { coachManagerId }).pipe(
            map(res => this.mapToProtocol(res.data))
        );
    }

    // ── Excel import ──────────────────────────────────────────────────────────
    /**
     * Reads the uploaded workbook and saves every plan as its OWN request
     * (one POST to TreatmentPlans per row of the 'Plans' sheet), in ExecutionOrder.
     *
     *  - The file is fully parsed first: a bad workbook sends nothing at all.
     *  - Plans are sent one after another. The first failed request stops the import;
     *    every later plan is marked 'skipped' and is never sent.
     *  - patientId, consultationDecisionId and medicalReportId are always null.
     *  - A plan with any empty field (except name) is sent with saveAsDraft = true.
     */
    async importTreatmentPlansFromExcel(
        file: File,
        doctorId?: string | null
    ): Promise<PlanImportResult[]> {
        this.importing.set(true);
        this.importError.set(null);
        this.importResults.set([]);

        try {
            let plans: ParsedPlan[];
            try {
                plans = await this.parseTreatmentPlansExcel(file, doctorId);
            } catch (e: any) {
                this.importError.set(e?.message ?? 'Failed to read the Excel file.');
                return [];
            }

            const results: PlanImportResult[] = plans.map(p => ({
                planKey: p.key,
                name: p.body.name,
                status: 'pending',
                missing: p.missing,
            }));
            this.importResults.set([...results]);

            for (let i = 0; i < plans.length; i++) {
                try {
                    await this.saveImportedPlan(plans[i].body);
                    results[i] = { ...results[i], status: 'success' };
                    this.importResults.set([...results]);
                } catch (err: any) {
                    results[i] = {
                        ...results[i],
                        status: 'failed',
                        error: err?.error?.message ?? err?.error?.title ?? err?.message ?? 'Request failed',
                    };
                    // never send the remaining plans
                    for (let j = i + 1; j < results.length; j++) {
                        results[j] = { ...results[j], status: 'skipped' };
                    }
                    this.importResults.set([...results]);
                    break;
                }
            }

            if (results.some(r => r.status === 'success')) {
                this.fetchProtocols(); // refresh the list
            }
            return results;
        } finally {
            this.importing.set(false);
        }
    }

    /** Saves ONE imported plan (a single POST). Throws if the request fails. */
    private async saveImportedPlan(body: TreatmentPlanRequest): Promise<unknown> {
        const res: any = await firstValueFrom(this.http.post<any>(this.apiUrl + 'TreatmentPlans', body));
        if (res && res.success === false) {
            throw new Error(res.message ?? 'The server rejected the plan.');
        }
        return res;
    }

    /** Rebuilds one TreatmentPlanRequest per row of the 'Plans' sheet. */
    private async parseTreatmentPlansExcel(file: File, doctorId?: string | null): Promise<ParsedPlan[]> {
        const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });

        const required = ['Plans', 'Phases', 'Criteria', 'Sessions', 'Sections', 'Exercises', 'Sets', 'Contraindications'];
        const absent = required.filter(n => !wb.Sheets[n]);
        if (absent.length) throw new Error(`Missing sheet(s): ${absent.join(', ')}`);

        const rows = (n: string) => XLSX.utils.sheet_to_json<any>(wb.Sheets[n], { defval: null });
        const plans = rows('Plans');
        const phases = rows('Phases');
        const criteria = rows('Criteria');
        const sessions = rows('Sessions');
        const sections = rows('Sections');
        const exercises = rows('Exercises');
        const sets = rows('Sets');
        const contra = rows('Contraindications');

        const blank = (v: any) => v === null || v === undefined || String(v).trim() === '';
        const num = (v: any, d = 0) => (blank(v) || isNaN(Number(v)) ? d : Number(v));
        const str = (v: any) => (blank(v) ? '' : String(v).trim());
        const bool = (v: any) => v === true || v === 1 || ['true', '1'].includes(String(v).toLowerCase());
        // the app's own UI uses the symbols ≥ / ≤, so accept >= / <= from Excel too
        const op = (v: any) => {
            const s = str(v);
            return s === '>=' ? '≥' : s === '<=' ? '≤' : s;
        };
        const at = (r: any, pk: string, ph?: number, ses?: number, sec?: number, ex?: number) =>
            r.PlanKey === pk &&
            (ph === undefined || r.PhaseOrder === ph) &&
            (ses === undefined || r.SessionNumber === ses) &&
            (sec === undefined || r.SectionOrder === sec) &&
            (ex === undefined || r.ExerciseOrder === ex);

        // the workbook has pre-filled formula rows: ignore rows without a PlanKey
        const planRows = plans.filter(r => !blank(r.PlanKey));
        if (!planRows.length) throw new Error("The 'Plans' sheet has no rows.");

        return [...planRows]
            .sort((a, b) => num(a.ExecutionOrder) - num(b.ExecutionOrder))
            .map(p => {
                const pk = p.PlanKey;

                // 'name' is the only mandatory field: a draft still needs a name
                if (blank(p.name)) throw new Error(`${pk}: 'name' is required.`);

                // Every other empty field is collected here and forces saveAsDraft = true
                const missing: string[] = [];
                const need = (ok: boolean, label: string) => { if (!ok) missing.push(label); };

                need(!blank(p.injuryCondition), 'injuryCondition');
                need(!blank(p.primaryGoal), 'primaryGoal');
                need(!blank(p.targetAthleteLevel), 'targetAthleteLevel');

                const serviceIds = str(p.protocolServiceIds)
                    .split(',').map(s => s.trim()).filter(Boolean).map(Number).filter(n => !isNaN(n));
                need(serviceIds.length > 0, 'protocolServiceIds');

                const planPhases = phases
                    .filter(x => x.PlanKey === pk)
                    .sort((a, b) => num(a.PhaseOrder) - num(b.PhaseOrder));
                need(planPhases.length > 0, 'phases');

                const phaseDtos: TreatmentPlanPhase[] = planPhases.map(ph => {
                    const pl = `Phase ${num(ph.PhaseOrder)}`;
                    need(!blank(ph.phaseName), `${pl}: phaseName`);
                    need(num(ph.weeks) > 0, `${pl}: weeks`);
                    need(num(ph.sessionsPerWeek) > 0, `${pl}: sessionsPerWeek`);
                    need(!blank(ph.phaseObjective), `${pl}: phaseObjective`);

                    const crit: TreatmentPlanCriterion[] = criteria
                        .filter(c => at(c, pk, ph.PhaseOrder))
                        .map((c, ci) => {
                            need(!blank(c.criterionType) && !blank(c.operator) && !blank(c.value) && !blank(c.unit),
                                `${pl} > Criterion ${ci + 1}`);
                            return {
                                criterionType: str(c.criterionType),
                                operator: op(c.operator),
                                value: num(c.value),
                                unit: str(c.unit),
                            } as TreatmentPlanCriterion;
                        });
                    need(crit.length > 0, `${pl}: criteria`);

                    const sess: TreatmentPlanSession[] = sessions
                        .filter(s => at(s, pk, ph.PhaseOrder))
                        .sort((a, b) => num(a.SessionNumber) - num(b.SessionNumber))
                        .map(s => {
                            const sl = `${pl} > Session ${num(s.SessionNumber)}`;
                            const isMeasurement = bool(s.isMeasurementSession);
                            if (isMeasurement) need(!blank(s.measurementTemplateId), `${sl}: measurementTemplateId`);

                            // like mapSession: measurement sessions carry no sections
                            const secDtos: TreatmentPlanSection[] = isMeasurement ? [] : sections
                                .filter(x => at(x, pk, ph.PhaseOrder, s.SessionNumber))
                                .sort((a, b) => num(a.SectionOrder) - num(b.SectionOrder))
                                .map(sec => {
                                    const cl = `${sl} > Section ${num(sec.SectionOrder)}`;
                                    need(!blank(sec.sectionName), `${cl}: sectionName`);
                                    need(num(sec.durationMinutes) > 0, `${cl}: durationMinutes`);

                                    const exDtos: TreatmentPlanExercise[] = exercises
                                        .filter(e => at(e, pk, ph.PhaseOrder, s.SessionNumber, sec.SectionOrder))
                                        .sort((a, b) => num(a.ExerciseOrder) - num(b.ExerciseOrder))
                                        .map(e => {
                                            const el = `${cl} > Exercise ${num(e.ExerciseOrder)}`;
                                            const type = str(e.exerciseType).toLowerCase();
                                            const isManual = type === 'manual';
                                            need(type === 'exercise' || isManual, `${el}: exerciseType`);
                                            need(!blank(e.exerciseName), `${el}: exerciseName`);
                                            need(!blank(e.exerciseId), `${el}: exerciseId`);

                                            let setDtos: TreatmentPlanSet[] = [];
                                            if (isManual) {
                                                need(!blank(e.videoUrl), `${el}: videoUrl`);
                                            } else {
                                                need(!blank(e.equipment), `${el}: equipment`);
                                                need(!blank(e.contractionType), `${el}: contractionType`);
                                                need(!blank(e.intensityMethod), `${el}: intensityMethod`);
                                                setDtos = sets
                                                    .filter(t => at(t, pk, ph.PhaseOrder, s.SessionNumber, sec.SectionOrder, e.ExerciseOrder))
                                                    .sort((a, b) => num(a.setNumber) - num(b.setNumber))
                                                    .map(t => {
                                                        const tl = `${el} > Set ${num(t.setNumber)}`;
                                                        need(num(t.reps) > 0, `${tl}: reps`);
                                                        need(!blank(t.intensity), `${tl}: intensity`);
                                                        need(!blank(t.tempo), `${tl}: tempo`);
                                                        need(!blank(t.restSeconds), `${tl}: restSeconds`);
                                                        return {
                                                            setNumber: num(t.setNumber),
                                                            reps: num(t.reps),
                                                            intensity: str(t.intensity),
                                                            tempo: str(t.tempo),
                                                            restSeconds: num(t.restSeconds),
                                                        };
                                                    });
                                                need(setDtos.length > 0, `${el}: sets`);
                                            }

                                            // mirrors mapExercise: manual = video only, exercise = equipment + sets
                                            return {
                                                exerciseType: type as TreatmentPlanExercise['exerciseType'],
                                                order: num(e.ExerciseOrder),
                                                exerciseId: num(e.exerciseId),
                                                equipment: isManual ? '' : str(e.equipment),
                                                contractionType: isManual ? '' : str(e.contractionType),
                                                intensityMethod: isManual ? '' : str(e.intensityMethod),
                                                sets: setDtos,
                                                exerciseName: str(e.exerciseName),
                                                description: str(e.description),
                                                videoUrl: isManual ? str(e.videoUrl) : '',
                                                progressionTitle: str(e.progressionTitle),
                                                incrementAmount: num(e.incrementAmount),
                                                progressionCondition: str(e.progressionCondition),
                                            };
                                        });
                                    need(exDtos.length > 0, `${cl}: exercises`);

                                    return {
                                        sectionName: str(sec.sectionName),
                                        durationMinutes: num(sec.durationMinutes),
                                        order: num(sec.SectionOrder),
                                        exercises: exDtos,
                                    };
                                });
                            if (!isMeasurement) need(secDtos.length > 0, `${sl}: sections`);

                            return {
                                sessionNumber: num(s.SessionNumber),
                                isMeasurementSession: isMeasurement,
                                measurementTemplateId: num(s.measurementTemplateId), // blank -> 0, like mapSession
                                sections: secDtos,
                            };
                        });
                    need(sess.length > 0, `${pl}: sessions`);

                    return {
                        phaseName: str(ph.phaseName),
                        phaseOrder: num(ph.PhaseOrder),
                        weeks: num(ph.weeks),
                        sessionsPerWeek: num(ph.sessionsPerWeek),
                        phaseObjective: str(ph.phaseObjective),
                        criteria: crit,
                        sessions: sess,
                    };
                });

                const body: TreatmentPlanRequest = {
                    name: str(p.name),
                    injuryCondition: str(p.injuryCondition),
                    primaryGoal: str(p.primaryGoal),
                    // same calculation as mapProtocolToRequest
                    totalWeeks: phaseDtos.reduce((sum, ph) => sum + ph.weeks, 0),
                    sessionsPerWeek: phaseDtos.length
                        ? Math.round(phaseDtos.reduce((sum, ph) => sum + ph.sessionsPerWeek, 0) / phaseDtos.length)
                        : 0,
                    numberOfPhases: phaseDtos.length,
                    targetAthleteLevel: str(p.targetAthleteLevel),
                    // The sheet's saveAsDraft column is a formula (TRUE when anything is missing).
                    // This is a second safeguard: anything missing -> always a draft.
                    saveAsDraft: missing.length > 0 ? true : (blank(p.saveAsDraft) ? true : bool(p.saveAsDraft)),
                    notifyPatient: false,
                    patientId: null,
                    doctorId: doctorId ?? null,
                    medicalReportId: null,
                    consultationDecisionId: null,
                    protocolServiceIds: serviceIds,
                    contraindications: contra.filter(c => c.PlanKey === pk && !blank(c.contraindication)).map(c => str(c.contraindication)),
                    phases: phaseDtos,
                };

                if (!blank(p.saveAsNewTemplate)) body.saveAsNewTemplate = bool(p.saveAsNewTemplate);
                if (!blank(p.newTemplateName)) body.newTemplateName = str(p.newTemplateName);

                return { key: pk, body, missing };
            });
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