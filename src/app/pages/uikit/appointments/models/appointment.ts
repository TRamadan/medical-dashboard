export interface Appointment {
    id: number;
    doctorNameAr?: string;
    doctorNameEn?: string;
    patientNameAr?: string;
    patientNameEn?: string;
    serviceNameAr?: string;
    serviceNameEn?: string;
    locationNameAr?: string;
    locationNameEn?: string;
    servicePrice?: number;
    startTime: string;
    endTime: string;
    status: number;
    appointmentProfileId?: number;
    appointmentProfile?: AppointmentProfile;
    isAnonymousPatient?: boolean;
    parentAppointmentId?: number;
    subAppointment?: SubAppointment[];
    showDetails?: boolean;
}

export interface AppointmentProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    emergencyPhoneNumber?: string;
    genderId?: number;
    genderName?: string;
    dateOfBirth?: string;
    medicaHistory?: string;
}

export interface SubAppointment {
    doctorNameAr?: string;
    doctorNameEn?: string;
    serviceNameAr?: string;
    serviceNameEn?: string;
    locationNameAr?: string;
    locationNameEn?: string;
    startTime: string;
    endTime: string;
    status: number;
}
export interface ConsultationProfileRequest {
    personalData: {
        fullName: string;
        dateOfBirth: string;       // 'YYYY-MM-DD'
        address: string;
        phoneNumber: string;
        emergencyPhone: string;
        emergencyRelation: string;
        bookingForSelf: boolean;
    };
    sportsData: {
        sport: string;
        playCenter: string;
        yearsOfPractice: number;
        clubName: string;
        highestAchievement: string;
    };
    injuryData: {
        bodyMapData: string;
        painLevel: number;
        functionalLevel: number;
        dailyActivityLevel: number;
        injuryDescription: string;
        injuryName: string;
        injurySide: number;
        injuryDate: string;
        inactivityDurationValue: number;
        inactivityDurationUnit: number;
        isSportRelated: boolean;
        seenSpecialist: boolean;
        prescribedTreatments: number;
        hadDiagnosticTests: boolean;
    };
    injuryHistory: {
        previousInjuries: {
            id: number;
            description: string;
            bodyPart: string;
            injuryDate: string;
            treatmentReceived: string;
        }[];
        previousSurgeries: {
            id: number;
            description: string;
            surgeryType: string;
            surgeryDate: string;
        }[];
    };
    medicalHistory: {
        currentConditions: number;
        otherConditions: string;
        medications: { id: number; name: string; dose: string; frequency: string }[];
        knownAllergies: string;
        hadCovid: boolean;
        covidVaccinated: boolean;
        fatherConditions: number;
        fatherOtherConditions: string;
        motherConditions: number;
        motherOtherConditions: string;
    };
    socialProfile: {
        occupation: string;
        workNature: number;
        dailySittingHours: number;
        maritalStatus: number;
        habits: number;
        isWorkStressful: boolean;
    };
}
