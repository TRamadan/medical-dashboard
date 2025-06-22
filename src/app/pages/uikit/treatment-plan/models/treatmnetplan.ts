export interface TreatmentPlan {
    id?: number;
    patientId?: number;
    patientName?: string;
    injuryType?: string;
    injuryDescription?: string;
    diagnosis?: string;
    doctorId?: number;
    doctorName?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    totalNumberOfSessions?: number;
    status?: 'draft' | 'active' | 'completed' | 'paused';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    progressPhases: ProgressPhase[];
    assignedCoaches: AssignedCoach[];
    medicalNotes?: string;
    contraindications?: string[];
    expectedOutcome?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProgressPhase {
    id?: number;
    phaseName: string;
    phaseNumber: number;
    description: string;
    duration: number; // in weeks
    goals: string[];
    milestones: string[];
    sessions: Session[];
    status: 'pending' | 'active' | 'completed';
    startDate?: string;
    endDate?: string;
}

export interface Session {
    id?: number;
    sessionName: string;
    sessionDate: string;
    duration: number; // in minutes
    sessionStatus: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    numberOfSessionsPerWeek: number;
    numberOfSessionsPerMonth: number;
    exercises: Exercise[];
    notes?: string;
    coachId?: number;
    coachName?: string;
}

export interface Exercise {
    id?: number;
    name: string;
    description: string;
    sets: number;
    reps: number;
    duration: number; // in minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    equipment?: string[];
    instructions: string;
    precautions?: string;
}

export interface AssignedCoach {
    id: number;
    name: string;
    specialization: string;
    assignedSessions: number;
    maxSessions: number;
    availability: string[];
    notes?: string;
}

export interface Patient {
    id: number;
    name: string;
    age: number;
    phone: string;
    email: string;
    injuryType: string;
    injuryDescription: string;
    diagnosis: string;
    medicalHistory: string;
    currentMedications: string[];
    allergies: string[];
    emergencyContact: string;
}

export interface Coach {
    id: number;
    name: string;
    specialization: string;
    experience: number;
    availability: string[];
    currentWorkload: number;
    maxWorkload: number;
    rating: number;
    certifications: string[];
}
