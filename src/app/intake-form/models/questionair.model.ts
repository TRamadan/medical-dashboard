// src/app/models/questionnaire.model.ts

export enum VisitObjective {
    ReturnToSports = 1,
    ChronicPain = 2,
    ImprovedPerformance = 3,
    Prevention = 4,
    Other = 5
}

export enum ProblemDuration {
    LessThan2Weeks = 1,
    TwoWeeksToMonth = 2,
    OneToThreeMonths = 3,
    MoreThan3Months = 4,
    NoProblem = 5
}

export enum ReferralSource {
    Instagram = 1,
    Facebook = 2,
    TikTok = 3,
    Friend = 4,
    Doctor = 5,
    Google = 6,
    Other = 7
}

export interface QuestionnaireAnswers {
    objective: VisitObjective;
    objectiveOther: string | null;
    sport: string | null;
    duration: ProblemDuration;
    hasPreviousTreatment: boolean;
    referralSource: ReferralSource;
    referralSourceOther: string | null;
}

export interface QuestionnaireGetDTO {
    appointmentId: number;
    appointmentDate: string;   // "Saturday, August 15 2026"
    appointmentTime: string;   // "09:00 AM"
    serviceName: string;
    patientName: string;
    isAlreadyAnswered: boolean;
    existing: QuestionnaireAnswers | null;
}

export interface QuestionnaireSubmitResponse {
    message: string;
}