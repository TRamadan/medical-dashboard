import { Component, ElementRef, EventEmitter, OnInit, ViewChild, Output, OnDestroy } from '@angular/core';
import { LocationServiceFormComponent } from './location-service-form/location-service-form.component';
import { ChooseTimeSlotComponent } from './choose-time-slot/choose-time-slot.component';
import { PatientFormComponent } from './patient-form/patient-form.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { from, Subscription } from 'rxjs';
import { BookingService } from './patient-form/services/booking.service';
import Swal from 'sweetalert2';

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    experience: number;
    image: string;
}

export interface Patient {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    emergencyContact: string;
    medicalHistory: string;
}

export interface BookingData {
    location: string;
    area: string;
    doctor: Doctor | null;
    injuryType: string;
    appointmentDate: string;
    appointmentTime: string;
    patient: Patient | null;
}

@Component({
    standalone: true,
    imports: [LocationServiceFormComponent, ChooseTimeSlotComponent, PatientFormComponent, ConfirmationComponent],
    selector: 'app-booking-form',
    templateUrl: './booking-form.component.html',
    styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit, OnDestroy {
    @Output() back = new EventEmitter<void>();
    @Output() bookingSuccess = new EventEmitter<void>();
    currentStep: number = 1;
    totalSteps: number = 3;
    showBookingFormFlag: boolean = false;
    @ViewChild(PatientFormComponent) patientFormComponent!: PatientFormComponent;

    selectedTimeSlot: any;
    selectedServiceAndLocation: any;
    confirmationData: any;

    bookingData: BookingData = {
        location: '',
        area: '',
        doctor: null,
        injuryType: '',
        appointmentDate: '',
        appointmentTime: '',
        patient: null
    };

    steps: string[] = [];

    constructor(
        public elementRef: ElementRef,
        private bookingService: BookingService
    ) {}

    ngOnInit() {
        this.updateSteps();
    }

    ngOnDestroy() {}

    private updateSteps(): void {
        this.steps = ['Location & Service', 'Choose Time Slot', 'Patient Information'];
    }

    get progress(): number {
        return (this.currentStep / this.totalSteps) * 100;
    }

    get progressRounded(): number {
        return Math.round(this.progress);
    }

    handleNext(): void {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    handlePrevious(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    handleNextOrSubmit(): void {
        if (this.currentStep === 3) {
            this.patientFormComponent.onSubmit();
        } else {
            this.handleNext();
        }
    }

    // 🔹 Disable or enable the "Next" button based on step validity
    canProceed(): boolean {
        switch (this.currentStep) {
            case 1:
                // Step 1: Must select location + service
                return !!this.selectedServiceAndLocation;
            case 2:
                // Step 2: Must select a time slot
                return !!this.selectedTimeSlot;
            case 3:
                // Step 3: Patient form handles validation internally
                return true;
            default:
                return true;
        }
    }

    isStepActive(stepIndex: number): boolean {
        return stepIndex + 1 <= this.currentStep;
    }

    updateBookingData(data: Partial<BookingData>): void {
        this.bookingData = { ...this.bookingData, ...data };
    }

    confirmBooking(bookingPayload: any): void {
        Swal.fire({
            title: 'Booking in Progress...',
            text: 'Please wait while we create your appointment.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            target: this.elementRef.nativeElement
        });

        this.bookingService.makeAnAppointment(bookingPayload).subscribe({
            next: (response: any) => {
                debugger;
                this.confirmationData = response.data;
                Swal.fire({
                    target: this.elementRef.nativeElement,
                    html: `
                        <div class="container-fluid p-3 text-start">
                            <div class="row justify-content-center">
                                <div class="col-12">
                                    <div class="text-center mb-4">
                                        <h2 class="h3 fw-bold text-dark mb-2">Booking Confirmed!</h2>
                                        <p class="text-muted">Your appointment has been successfully booked.</p>
                                    </div>
                                    <div class="card shadow-sm mb-4">
                                        <div class="card-header bg-white">
                                            <h5 class="card-title mb-0 d-flex align-items-center">
                                                Appointment Details
                                            </h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="row g-4">
                                                                         <div class="col-12 col-md-6>
                                                                <p class="text-muted small mb-1">Service</p>
                                                    <p class="fw-semibold mb-0">${this.confirmationData.appointmentDetails.serviceNameEn} - ${this.confirmationData.appointmentDetails.to}</p>

                                            </div>
                                                <div class="col-12 col-md-6">
                                                    <p class="text-muted small mb-1">Time</p>
                                                    <p class="fw-semibold mb-0">${this.confirmationData.appointmentDetails.from} - ${this.confirmationData.appointmentDetails.to}</p>
                                                </div>
                                            </div>

                                            <div class="row">
                   <div class="col-12 col-md-6">
                                                    <p class="text-muted small mb-1">Location</p>
                                                    <p class="fw-semibold mb-0">${this.confirmationData.appointmentDetails.locationNameEn}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card shadow-sm mb-4">
                                        <div class="card-header bg-white"><h5 class="card-title mb-0">Patient Information</h5></div>
                                        <div class="card-body">
                                        <div class="row g-4">
                                        <div class="col-md-6">
                                        <p class="text-muted small mb-1">Name</p>
                                            <p class="fw-semibold">${this.confirmationData.patientInfo.name}</p>
                                        </div>

                                        <div class="col-md-6">
                                        <p class="text-muted small mb-1">Date of Birth</p>
                                        <p class="fw-semibold">${this.confirmationData.patientInfo.dateOfBirth}</p>
                                        </div>
                                        </div>

                                           <div class="row g-4">
                                        <div class="col-md-6">
                                        <p class="text-muted small mb-1">Mobile</p>
                                            <p class="fw-semibold">${this.confirmationData.patientInfo.mobile}</p>
                                        </div>

                                        <div class="col-md-6">
                                        <p class="text-muted small mb-1"></p>
                                        <p class="fw-semibold"></p>
                                        </div>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`,
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    width: '800px'
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.bookingSuccess.emit();
                    }
                });
            },
            error: (error: any) => {
                console.error('Booking failed', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Booking Failed',
                    text: 'There was an error processing your booking. Please try again.',
                    confirmButtonText: 'OK',
                    target: this.elementRef.nativeElement
                });
            }
        });
    }

    onShowBookingForm(show: boolean) {
        this.showBookingFormFlag = show;
    }

    onServiceLocationSelected(locationService: any) {
        this.selectedServiceAndLocation = locationService;
        this.updateBookingData({
            location: locationService.locationName,
            area: locationService.serviceName // adjust based on your data structure
        });
    }

    onTimeSlotSelected(slot: any) {
        this.selectedTimeSlot = slot;
        this.updateBookingData({
            appointmentDate: slot.date,
            appointmentTime: slot.time
        });
    }

    // 🔹 Step 3: user submitted booking
    createBooking(bookingPayload: any): void {
        this.confirmBooking(bookingPayload);
    }
}
