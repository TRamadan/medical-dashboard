import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

export interface AppointmentDetails {
    locationNameAr: string;
    locationNameEn: string;
    from: string;
    to: string;
}

export interface PatientInfo {
    name: string;
    dateOfBirth: string;
    email: string;
    phone: string;
}

export interface BookingData {
    appointmentDetails: AppointmentDetails;
    patientInfo: PatientInfo;
}

@Component({
    selector: 'app-confirmation',
    standalone: true,
    imports: [],
    templateUrl: './confirmation.component.html',
    styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent {
    @Input() confirmationData!: any;
    private languageSubscription?: Subscription;

    bookingReference: string;

    constructor() {
        this.bookingReference = 'BK-' + Date.now().toString().slice(-6);
    }

    formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    downloadApp(): void {
        // Handle app download
        console.log('Download app');
    }
}
