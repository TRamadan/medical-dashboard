import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-patient-info',
    imports: [CardModule, CommonModule, AccordionModule, TagModule, ButtonModule],
    standalone: true,
    templateUrl: './patient-info.component.html',
    styleUrl: './patient-info.component.scss'
})
export class PatientInfoComponent {
    patients = [
        {
            id: 'PT-202225',
            name: 'Ahmed Ali Hassan',
            age: '35 Years',
            gender: 'Male',
            mobile: '01010101010',
            email: 'ahmed.ali@gmail.com',
            address: '84 El-Tayraan street - Nasr City',
            bookingDate: '2025-12-15',
            service: 'Physiotherapy',
            bookingTime: '10:00 AM - 11:00 AM',
            status: 'VIP',
            level: 'High',
            injury: 'ACL Tear',
            sport: 'Football'
        },
        {
            id: 'PT-202226',
            name: 'Sarah Mohamed',
            age: '28 Years',
            gender: 'Female',
            mobile: '01020202020',
            email: 'sarah.mohamed@gmail.com',
            address: '15 Tahrir Square - Cairo',
            bookingDate: '2025-12-16',
            service: 'Consultation',
            bookingTime: '01:00 PM - 02:00 PM',
            status: 'Moderate',
            level: 'Moderate',
            injury: 'Ankle Sprain',
            sport: 'Tennis'
        },
        {
            id: 'PT-202227',
            name: 'Sarah Mohamed',
            age: '28 Years',
            gender: 'Female',
            mobile: '01020202020',
            email: 'sarah.mohamed@gmail.com',
            address: '15 Tahrir Square - Cairo',
            bookingDate: '2025-12-16',
            service: 'Consultation',
            bookingTime: '01:00 PM - 02:00 PM',
            status: 'Low',
            level: 'Low',
            injury: 'Shoulder Dislocation',
            sport: 'Swimming'
        },
        {
            id: 'PT-202228',
            name: 'Sarah Mohamed',
            age: '28 Years',
            gender: 'Female',
            mobile: '01020202020',
            email: 'sarah.mohamed@gmail.com',
            address: '15 Tahrir Square - Cairo',
            bookingDate: '2025-12-16',
            service: 'Consultation',
            bookingTime: '01:00 PM - 02:00 PM',
            // status missing in original, defaulting
            status: 'Moderate',
            level: 'Low',
            injury: 'Muscle Strain',
            sport: 'Running'
        }
    ];

    @Output() onPatientSelect = new EventEmitter<any>();

    selectedPatient: any = null;

    selectPatient(patient: any) {
        this.selectedPatient = patient;
        this.onPatientSelect.emit(this.selectedPatient);
    }

    resetSelection() {
        this.selectedPatient = null;
        this.onPatientSelect.emit(null);
    }

    getSeverity(status: string | undefined) {
        switch (status) {
            case 'Low':
                return 'danger';
            case 'Moderate':
                return 'warn';
            case 'VIP':
                return 'success';
            default:
                return 'info';
        }
    }
}
