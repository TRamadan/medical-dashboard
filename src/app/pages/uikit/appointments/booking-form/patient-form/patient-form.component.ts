import { Component, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ServiceslocationService } from '../location-service-form/services/serviceslocation.service';
import { BookingService } from './services/booking.service';

export interface PatientData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    emergencyContact: string;
    medicalHistory: string;
    favoriteSport: string;
}

export interface BookingData {
    patient?: PatientData;
    [key: string]: any;
}

@Component({
    selector: 'app-patient-form',
    standalone: true,
    imports: [NgSelectModule, FormsModule, ReactiveFormsModule, CommonModule],
    templateUrl: './patient-form.component.html',
    styleUrls: ['./patient-form.component.css']
})
export class PatientFormComponent implements OnInit {
    @Input() bookingData: BookingData = {};
    @Input() selectedSlot: any;
    @Output() bookingDataChange = new EventEmitter<BookingData>();
    @Output() createBooking = new EventEmitter<any>();
    @Input() selectedLocationAndService: any;

    services: any[] = [];

    isSubmitting = false;
    patientForm!: FormGroup;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private _services: ServiceslocationService,
        private _bookingService: BookingService
    ) {}

    ngOnInit(): void {
        this.initializeForm();

        console.log('here is the service', this.selectedLocationAndService);
        console.log('here is the slot', this.selectedSlot);

        this.getAllServices();
    }

    initializeForm(): void {
        this.patientForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]{10,}$/)]],
            dateOfBirth: ['', [Validators.required, this.ageValidator]],
            gender: ['', Validators.required],
            emergencyContact: [''],
            medicalHistory: [''],
            favoriteSport: [''],
            interestedServiceId: ['']
        });

        // Subscribe to form changes to update booking data
        this.patientForm.valueChanges.subscribe((value) => {
            this.updateBookingData(value);
        });
    }

    // Custom validator for age (must be at least 16 years old)
    ageValidator(control: any) {
        if (!control.value) return null;

        const today = new Date();
        const birthDate = new Date(control.value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age >= 16 ? null : { minAge: true };
    }

    updateBookingData(formValue: PatientData): void {
        const updatedBookingData = {
            ...this.bookingData,
            patient: formValue
        };
        this.bookingDataChange.emit(updatedBookingData);
    }

    onSubmit(): void {
        this.submitted = true;
        if (this.patientForm.invalid) {
            return;
        }
        const formValue = this.patientForm.value;
        const requestBody = {
            doctorId: this.selectedLocationAndService.isContainSubservices ? null : this.selectedSlot.doctorId,
            patientId: null,
            serviceId: this.selectedLocationAndService.serviceId || 0,
            locationId: this.selectedLocationAndService.locationId || 0,
            startTime: this.selectedSlot.from,
            endTime: this.selectedSlot.to,
            appointmentProfile: {
                firstName: formValue.firstName,
                lastName: formValue.lastName,
                email: formValue.email,
                phoneNumber: formValue.phoneNumber,
                emergencyPhoneNumber: formValue.emergencyContact,
                genderId: formValue.gender === 'male' ? 1 : 2,
                dateOfBirth: formValue.dateOfBirth,
                medicalHistory: formValue.medicalHistory,
                favoriteSport: formValue.favoriteSport,
                address: '',
                interestedServiceId: this.selectedLocationAndService.serviceId || 0
            },
            isAnonymousPatient: true
        };
        this.createBooking.emit(requestBody);
    }

    // Helper methods for template
    isFieldInvalid(fieldName: string): boolean {
        const field = this.patientForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
    }

    getFieldError(fieldName: string): string {
        const field = this.patientForm.get(fieldName);
        if (field && field.errors) {
            if (field.errors['required']) {
                return `${this.getFieldLabel(fieldName)} is required.`;
            }
            if (field.errors['minlength']) {
                return `${this.getFieldLabel(fieldName)} must be at least 2 characters long.`;
            }
            if (field.errors['email']) {
                return 'Please enter a valid email address.';
            }
            if (field.errors['pattern']) {
                return 'Please enter a valid phone number.';
            }
            if (field.errors['minAge']) {
                return 'You must be at least 16 years old.';
            }
        }
        return '';
    }

    private getFieldLabel(fieldName: string): string {
        const labels: { [key: string]: string } = {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email',
            phoneNumber: 'Phone Number',
            dateOfBirth: 'Date of Birth',
            gender: 'Gender'
        };
        return labels[fieldName] || fieldName;
    }

    get isFormValid(): boolean {
        return this.patientForm.valid;
    }

    //here is the function needed to get all added services
    getAllServices(): void {
        this._services.getServices().subscribe({
            next: (res: any) => {
                this.services = res.data;
            }
        });
    }
}
