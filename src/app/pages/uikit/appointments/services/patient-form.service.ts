import { Injectable, signal } from '@angular/core';

export interface PreviousInjury {
    area: string;
    type: string;
    date: string;
    healed?: string;
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
    gender: string | null;
    weight: number;
    height: number;
    phone: string;
    phoneConfirm: string;
    emergencyPhone: string;
    emergencyRelation: string;
    bookingForSelf: boolean | null;
    decisionInfluencers: string[];
    // Athletic
    sport: string;
    club: string;
    team: string;
    center: string;
    role: string;
    practiceYears: number;
    competitiveLevel: string | null;
    goal90Days: string;
    activityLevel: string | null;
    // Injury
    currentPain: number;
    maxPain: number;
    painEffectOnSport: number;
    injuryDate: Date | null;
    injuryCircumstances: string;
    injuryRelatedToSport: boolean | null;
    seenDoctor: boolean | null;
    previousTests: string[];
    previousTreatment: string[];
    avoidMovements: boolean | null;
    // Medical
    chronicConditions: string[];
    familyHistory: string[];
    previousInjuries: PreviousInjury[];
    surgeries: Surgery[];
    regularMedications: Medication[];
    allergies: string;
    // Lifestyle
    jobTitle: string;
    workNature: string;
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
    fullName: '', dateOfBirth: null, gender: null,
    weight: 70, height: 170,
    phone: '', phoneConfirm: '',
    emergencyPhone: '', emergencyRelation: '',
    bookingForSelf: null, decisionInfluencers: [],
    sport: '', club: '', team: '', center: '', role: '',
    practiceYears: 0, competitiveLevel: null,
    goal90Days: '', activityLevel: null,
    currentPain: 0, maxPain: 0, painEffectOnSport: 0,
    injuryDate: null, injuryCircumstances: '',
    injuryRelatedToSport: null, seenDoctor: null,
    previousTests: [], previousTreatment: [],
    avoidMovements: null,
    chronicConditions: [], familyHistory: [],
    previousInjuries: [{ area: '', type: '', date: '', healed: '' }],
    surgeries: [{ type: '', part: '', year: '', notes: '' }],
    regularMedications: [{ name: '', dose: '', reason: '', notes: '' }],
    allergies: '',
    jobTitle: '', workNature: '',
    highWorkStress: null, sleepQuality: null,
    usesKinesio: null, recoveryExpectation: 5,
    dataConsent: false, consentFullName: '', consentDate: null,
    performanceEngineer: null,
    selectedMuscles: []
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
