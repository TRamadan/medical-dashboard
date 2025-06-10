export interface TreatmentPlan {
    id?: number;
    patientId?: number;
    description?: string;
    startDate?: string;
    totalNumberOfSessions?: number;
    sessions: Sessions[];
}

export interface Sessions {
    id?: number;
    sessionName?: string;
    sessionDate?: string;
    duration?: string;
    sessionStatus?: string;
    numberOfSessionsPerWeek?: number;
    numberOfSessionsPerMonth?: number;
}
