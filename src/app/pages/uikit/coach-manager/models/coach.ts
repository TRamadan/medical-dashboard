export interface Coach {
    id: string;
    name: string;
    email: string;
    specializations: string[];
    branch: string;
    availability: TimeSlot[];
    currentPatients: number;
    maxPatients: number;
    experience: number;
}

export interface TimeSlot {
    day: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    sessionId?: string;
}

export interface ScheduleSlot {
    day: string;
    timeSlot: string;
    status: 'available' | 'booked' | 'unavailable';
    sessionId?: string;
    patientName?: string;
}

export interface Session {
    id: string;
    patientId: string;
    coachId: string;
    date: Date;
    time: string;
    duration: number;
    type: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    notes?: string;
}

export interface Branch {
    id: string;
    name: string;
    location: string;
    coaches: Coach[];
}
