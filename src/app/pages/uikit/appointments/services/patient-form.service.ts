import { Injectable, signal } from '@angular/core';

export interface PreviousInjury {
    name: string;
    date: string;
    description: string;
}

export interface Surgery {
    type: string;
    part: string;
    year: string;
    notes?: string;
}

export interface Medication {
    name: string;
    dose: string;
    reason: string;
    notes?: string;
}

export interface PatientForm {
    // Personal
    fullName: string;
    dateOfBirth: Date | null;
    address: string;
    gender: string | null;
    weight: number;
    height: number;
    phone: string;
    phoneConfirm: string;
    emergencyPhone: string;
    emergencyRelation: string;
    bookingForSelf: boolean | null;
    injuredRelation: string;
    fillerName: string;
    fillerRelation: string;
    decisionInfluencers: string[];
    // Athletic
    sport: string;
    position: string;
    club: string;
    team: string;
    center: string;
    role: string;
    practiceYears: number;
    topAchievement: string;
    competitiveLevel: string | null;
    goal90Days: string;
    activityLevel: string | null;
    // Injury
    painLocations: string;
    currentPain: number;
    maxPain: number;
    painEffectOnPerformance: number;
    painEffectOnSport: number;
    injuryDate: Date | null;
    injuryDescription: string;
    injuryCauses: string;
    timeOffFromSport: string;
    injuryCircumstances: string;
    injuryRelatedToSport: boolean | null;
    // Medical procedures
    wasExamined: boolean | null;
    diagnosis: string;
    doctorName: string;
    doctorContactMethod: string;
    procedureType: string | null;
    diagnosticMethods: string[];
    seenDoctor: boolean | null;
    previousTests: string[];
    previousTreatment: string[];
    avoidMovements: boolean | null;
    // Medical history
    chronicConditions: string[];
    familyHistory: string[];
    previousInjuries: PreviousInjury[];
    surgeries: Surgery[];
    regularMedications: Medication[];
    allergies: string;
    hasClientMedicalCondition: boolean | null;
    clientMedicalConditionDetails: string;
    hasParentsMedicalCondition: boolean | null;
    parentsMedicalConditionDetails: string;
    // Lifestyle / Social
    jobTitle: string;
    workNature: string;
    dailySittingHours: number;
    isMarried: boolean | null;
    hasChildren: boolean;
    habits: string[];
    highWorkStress: boolean | null;
    sleepQuality: string | null;
    usesKinesio: boolean | null;
    recoveryExpectation: number;
    // Consent
    dataConsent: boolean;
    consentFullName: string;
    consentDate: Date | null;
    performanceEngineer: string | null;
    selectedMuscles: string[];
}

const defaultForm: PatientForm = {
    fullName: '', dateOfBirth: null, address: '', gender: null,
    weight: 70, height: 170,
    phone: '', phoneConfirm: '',
    emergencyPhone: '', emergencyRelation: '',
    bookingForSelf: null, injuredRelation: '', fillerName: '', fillerRelation: '', decisionInfluencers: [],
    sport: '', position: '', club: '', team: '', center: '', role: '',
    practiceYears: 0, topAchievement: '', competitiveLevel: null,
    goal90Days: '', activityLevel: null,
    painLocations: '',
    currentPain: 0, maxPain: 0, painEffectOnPerformance: 0, painEffectOnSport: 0,
    injuryDate: null, injuryDescription: '', injuryCauses: '', timeOffFromSport: '',
    injuryCircumstances: '',
    injuryRelatedToSport: null,
    wasExamined: null, diagnosis: '', doctorName: '', doctorContactMethod: '',
    procedureType: null, diagnosticMethods: [],
    seenDoctor: null,
    previousTests: [], previousTreatment: [],
    avoidMovements: null,
    chronicConditions: [], familyHistory: [],
    previousInjuries: [],
    surgeries: [{ type: '', part: '', year: '', notes: '' }],
    regularMedications: [{ name: '', dose: '', reason: '', notes: '' }],
    allergies: '',
    hasClientMedicalCondition: null, clientMedicalConditionDetails: '',
    hasParentsMedicalCondition: null, parentsMedicalConditionDetails: '',
    jobTitle: '', workNature: '',
    dailySittingHours: 0, isMarried: null, hasChildren: false, habits: [],
    highWorkStress: null, sleepQuality: null,
    usesKinesio: null, recoveryExpectation: 5,
    dataConsent: false, consentFullName: '', consentDate: null,
    performanceEngineer: null,
    selectedMuscles: [],
};

@Injectable({ providedIn: 'root' })
export class PatientFormService {
    readonly form = signal<PatientForm>({ ...defaultForm });

    reset(): void {
        this.form.set({ ...defaultForm });
    }

    patch(partial: Partial<PatientForm>): void {
        this.form.update(current => ({ ...current, ...partial }));
    }
}