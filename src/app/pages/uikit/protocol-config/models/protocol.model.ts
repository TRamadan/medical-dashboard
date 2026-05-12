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
    sessionNumber: number;
    applyMeasurements: boolean;
    sections: Section[];
}

export interface Week {
    weekNumber: number;
    sessions: Session[];
}

export interface PhaseCriteria {
    progressionCriteria: string;
    regressionCriteria: string;
    precautions: string;
    transitionCriteria: TransitionCriterion[];
}

export interface TransitionCriterion {
    id: number;
    metric: string;
    operator: '≤' | '≥' | '=' | '>' | '<';
    value: number | null;
    unit: string;
}

export interface Phase {
    id?: number;
    name: string;
    selectedSessionTab?: number;
    totalWeeks: number;
    totalSessions: number;
    sessionsPerWeek: number;
    objective: string;
    criteria: PhaseCriteria;
    weeks: Week[];
    /** Session numbers (1-based) that should default to Measurements mode */
    measurementSessionNums?: number[];
}

export interface CreatedBy {
    id: number;
    name: string;
    role: string;
}

export interface ServiceItem {
    id: number;
    nameEn: string;
    nameAr: string;
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

export interface Protocol {
    id: number;
    name: string;
    status: 'draft' | 'active' | 'archived';
    services: ServiceItem[];
    weeks: number | null;
    totalSessions: number | null;
    template: ProtocolTemplate | null;
    phases: Phase[];
    createdAt: string;
    createdBy: CreatedBy;
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