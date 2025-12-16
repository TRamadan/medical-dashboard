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
