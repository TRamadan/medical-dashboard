
export interface SetData {
    repetitions: number;
    intensity: string;
    tempo: string;
    rest: string;
}

export interface ProgressionRule {
    title: string;
    incrementAmount: number;
    progressionCondition: string;
}


export interface BaseExercise {
    id?: number;
    type: 'exercise' | 'manual';
    name: string;
    description: string;
    progressionRule: ProgressionRule;
}

export interface ExerciseType extends BaseExercise {
    type: 'exercise';
    equipment: string;
    contractionType: string;
    intensityMethod: string;
    sets: SetData[];
}

export interface ManualType extends BaseExercise {
    type: 'manual';
    videoUrl: string;
}

export type Exercise = ExerciseType | ManualType;


export interface Section {
    sectionName: string;
    time?: string;
    exercises: Exercise[];
}


export interface Session {
    id?: string;
    sessionNumber: number;
    sections: Section[];
    measurementTemplateId?: number | null;
}



export interface Week {
    id?: string;
    weekNumber: number;
    sessions: Session[];
}


export interface TransitionCriterion {
    id: number;
    metric: string;
    operator: '≤' | '≥' | '=' | '>' | '<';
    value: number | null;
    unit: string;
}

export interface PhaseCriteria {
    progressionCriteria: string;
    regressionCriteria: string;
    precautions: string;
    transitionCriteria: TransitionCriterion[];
}


export interface Phase {
    id: string;
    name: string;
    totalWeeks: number;
    sessionsPerWeek: number;
    objective: string;
    criteria: PhaseCriteria;
    weeks: Week[];
    measurementSessionNums: number[];
    selectedSessionTab?: number;
}


export interface Protocol {
    id: number;
    name: string;
    status: 'Draft' | 'Published' | 'Archived';
    injuryCondition?: string;
    primaryGoal?: string;
    targetAthleteLevel?: string;
    services: ServiceItem[];
    weeks: number | null;
    totalSessions: number | null;
    template: ProtocolTemplate | null;
    phases: Phase[];
    numberOfPhases?: number;
    contraindications?: { id: number; description: string; order: number; }[];
    createdAt?: string;
    createdBy?: CreatedBy;
}


export interface CreatedBy {
    id: number;
    name: string;
    role: string;
}

export interface ServiceItem {
    id: number;
    serviceNameEn: string;
    serviceNameAr: string;
    selected: boolean;
}

export interface ProtocolTemplate {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    duration: string;
    frequency: string;
    phases: string;
}

export interface FittVpCard {
    letter: string;
    titleEn: string;
    titleAr: string;
    description: string;
    complete: boolean;
    color: string;
}

export interface CertItem {
    id: string;
    nameAr: string;
    tag: string;
    checked: boolean;
}


export const getPhaseSessionCount = (phase: Phase): number =>
    phase.totalWeeks * phase.sessionsPerWeek;


export const getProtocolWeeks = (protocol: Protocol): number =>
    protocol.phases.reduce((sum, p) => sum + p.totalWeeks, 0);


export const getProtocolSessions = (protocol: Protocol): number =>
    protocol.phases.reduce((sum, p) => sum + getPhaseSessionCount(p), 0);


export const isMeasurementSession = (
    phase: Phase,
    sessionNumber: number,
): boolean => phase.measurementSessionNums.includes(sessionNumber);


export const toAbsoluteWeek = (
    protocol: Protocol,
    phaseIndex: number,
    relativeWeekNumber: number,
): number => {
    const offset = protocol.phases
        .slice(0, phaseIndex)
        .reduce((sum, p) => sum + p.totalWeeks, 0);
    return offset + relativeWeekNumber;
};

// ── API Request Body Types (TreatmentPlans endpoint) ─────────────────────────

export interface TreatmentPlanSet {
    setNumber: number;
    reps: number;
    intensity: string;
    tempo: string;
    restSeconds: number;
}

export interface TreatmentPlanExercise {
    exerciseType: string;
    order: number;
    exerciseId: number;
    equipment: string;
    contractionType: string;
    intensityMethod: string;
    sets: TreatmentPlanSet[];
    exerciseName: string;
    description: string;
    videoUrl: string;
    progressionTitle: string;
    incrementAmount: number;
    progressionCondition: string;
}

export interface TreatmentPlanSection {
    sectionName: string;
    durationMinutes: number;
    order: number;
    exercises: TreatmentPlanExercise[];
}

export interface TreatmentPlanSession {
    sessionNumber: number;
    isMeasurementSession: boolean;
    measurementTemplateId: number;
    sections: TreatmentPlanSection[];
}

export interface TreatmentPlanCriterion {
    criterionType: string;
    operator: string;
    value: number;
    unit: string;
}

export interface TreatmentPlanPhase {
    phaseName: string;
    phaseOrder: number;
    weeks: number;
    sessionsPerWeek: number;
    phaseObjective: string;
    criteria: TreatmentPlanCriterion[];
    sessions: TreatmentPlanSession[];
}

export interface TreatmentPlanRequest {
    name: string;
    injuryCondition: string;
    primaryGoal: string;
    totalWeeks: number;
    sessionsPerWeek: number;
    numberOfPhases: number;
    targetAthleteLevel: string;
    doctorId?: string;
    saveAsDraft: boolean;
    protocolServiceIds: number[];
    contraindications?: { id: number; description: string; order: number; }[];
    phases: TreatmentPlanPhase[];
}
