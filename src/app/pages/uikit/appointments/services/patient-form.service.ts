import { Injectable, signal } from '@angular/core';

export interface PreviousInjury {
    name: string;
    date: string;
    description: string;
}

export interface Doctor {
    name: string;
    specialty: string;
    contactMethod: string;
    diagnosis: string;
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
    duration: string;
    reason?: string;
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
    fillerPhone: string;
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
    doctors: Doctor[];
    prescribedTreatments: string[];
    prescribedTreatmentOtherText: string;
    hadDiagnosticTests: boolean | null;
    diagnosticTests: string[];
    diagnosticTestsOtherText: string;
    seenDoctor: boolean | null;
    previousTests: string[];
    previousTreatment: string[];
    avoidMovements: boolean | null;
    // Medical history
    chronicConditions: string[];
    chronicConditionsOtherText: string;
    fatherConditions: string[];
    fatherConditionsOtherText: string;
    motherConditions: string[];
    motherConditionsOtherText: string;
    previousInjuries: PreviousInjury[];
    surgeries: Surgery[];
    regularMedications: Medication[];
    allergies: string;
    hadCovid: boolean | null;
    covidTimes: number | null;
    hadCovidVaccine: boolean | null;
    covidVaccineType: string;
    covidVaccineDoses: number | null;
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
    bookingForSelf: null, injuredRelation: '', fillerName: '', fillerRelation: '', fillerPhone: '', decisionInfluencers: [],
    sport: '', position: '', club: '', team: '', center: '', role: '',
    practiceYears: 0, topAchievement: '', competitiveLevel: null,
    goal90Days: '', activityLevel: null,
    painLocations: '',
    currentPain: 0, maxPain: 0, painEffectOnPerformance: 0, painEffectOnSport: 0,
    injuryDate: null, injuryDescription: '', injuryCauses: '', timeOffFromSport: '',
    injuryCircumstances: '',
    injuryRelatedToSport: null,
    wasExamined: null, doctors: [],
    prescribedTreatments: [], prescribedTreatmentOtherText: '',
    hadDiagnosticTests: null, diagnosticTests: [], diagnosticTestsOtherText: '',
    seenDoctor: null,
    previousTests: [], previousTreatment: [],
    avoidMovements: null,
    chronicConditions: [], chronicConditionsOtherText: '',
    fatherConditions: [], fatherConditionsOtherText: '',
    motherConditions: [], motherConditionsOtherText: '',
    previousInjuries: [],
    surgeries: [],
    regularMedications: [],
    allergies: '',
    hadCovid: null, covidTimes: null,
    hadCovidVaccine: null, covidVaccineType: '', covidVaccineDoses: null,
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