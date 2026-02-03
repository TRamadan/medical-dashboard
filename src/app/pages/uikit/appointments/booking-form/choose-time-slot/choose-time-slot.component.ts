import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { WorkingdaysService } from './services/workingdays.service';

interface BookingData {
    location?: string;
    area?: string;
    doctor?: any;
    appointmentDate?: string;
    appointmentTime?: string;
}

interface TimeSlot {
    from: string;
    to: string;
}

@Component({
    standalone: true,
    imports: [FormsModule, CommonModule, HttpClientModule],
    selector: 'app-choose-time-slot',
    templateUrl: './choose-time-slot.component.html',
    styleUrls: ['./choose-time-slot.component.css']
})
export class ChooseTimeSlotComponent implements OnInit, OnDestroy {
    @Input() bookingData: BookingData = {};
    @Output() bookingDataChange = new EventEmitter<BookingData>();
    @Output() timeSlotSelected = new EventEmitter<any>();

    @Input() choosedLocationService: any;
    private languageSubscription?: Subscription;
    currentSlideIndex = 0;
    mobileSlides: any[][] = [];
    direction: 'ltr' | 'rtl' = 'ltr';

    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    years: number[] = [];
    dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    selectedMonth = new Date().getMonth() + 1;
    selectedYear = new Date().getFullYear();
    calendarDays: any[] = [];
    selectedDate: string | null = null;

    availableDays: string[] = [];

    availableTimesForSelectedDate: any[] = [];

    selectedTimeSlot: TimeSlot | null = null;
    desktopSlides: any[][] = [];
    desktopSlideIndex = 0;

    constructor(private _workingDaysService: WorkingdaysService) {}

    ngOnInit() {
        const currentYear = new Date().getFullYear();
        for (let y = currentYear - 5; y <= currentYear + 5; y++) {
            this.years.push(y);
        }

        this.fetchAvailableDays();
    }

    // Fetch available days from API
    fetchAvailableDays() {
        this._workingDaysService.getWorkingDaysWithinMonth(this.choosedLocationService.locationId, this.choosedLocationService.serviceId, this.selectedMonth).subscribe({
            next: (res: any) => {
                this.availableDays = res?.data || [];
                this.generateCalendar();
            },
            error: (err: any) => {
                this.availableDays = [];
                this.generateCalendar();
            }
        });
    }

    formatDateLocal(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    generateCalendar() {
        const jsMonth = this.selectedMonth - 1;
        const firstDay = new Date(this.selectedYear, jsMonth, 1);
        const lastDay = new Date(this.selectedYear, jsMonth + 1, 0);
        const days: any[] = [];

        const startDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        // Previous month's days
        for (let i = 0; i < startDay; i++) {
            const date = new Date(this.selectedYear, jsMonth, -(startDay - 1 - i));
            const dateString = this.formatDateLocal(date);
            days.push({
                day: date.getDate(),
                dateString,
                isCurrentMonth: false,
                isAvailable: false
            });
        }

        // Current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(this.selectedYear, jsMonth, i);
            const dateString = this.formatDateLocal(date);
            days.push({
                day: i,
                dateString,
                isCurrentMonth: true,
                isAvailable: this.availableDays.includes(dateString)
            });
        }

        // Next month's days
        const remaining = 7 - (days.length % 7);
        if (remaining < 7) {
            for (let i = 1; i <= remaining; i++) {
                const date = new Date(this.selectedYear, jsMonth + 1, i);
                const dateString = this.formatDateLocal(date);
                days.push({
                    day: date.getDate(),
                    dateString,
                    isCurrentMonth: false,
                    isAvailable: false
                });
            }
        }

        this.calendarDays = days;
    }

    updateCalendar() {
        this.fetchAvailableDays();
    }

    prevMonth() {
        if (this.selectedMonth === 1) {
            this.selectedMonth = 12;
            this.selectedYear--;
        } else {
            this.selectedMonth--;
        }
        this.fetchAvailableDays();
    }

    nextMonth() {
        if (this.selectedMonth === 12) {
            this.selectedMonth = 1;
            this.selectedYear++;
        } else {
            this.selectedMonth++;
        }
        this.fetchAvailableDays();
    }

    selectDate(day: any) {
        if (!day.isAvailable || !day.isCurrentMonth) return;
        this.selectedDate = day.dateString;
        this.selectedTimeSlot = null;
        this.getSlots();
        this.bookingData.appointmentDate = day.dateString;
        this.bookingData.appointmentTime = undefined;
        this.bookingDataChange.emit(this.bookingData);
    }

    //here is the function needed to get the slots per the selected date
    getSlots(): void {
        this._workingDaysService.getAvailableSlots(this.choosedLocationService.locationId, this.choosedLocationService.serviceId, this.selectedDate).subscribe({
            next: (response: any) => {
                if (response?.isSuccess && Array.isArray(response.data)) {
                    this.availableTimesForSelectedDate = response.data.map((slot: any) => ({
                        ...slot,
                        fromFormatted: this.formatTime(slot.from),
                        toFormatted: this.formatTime(slot.to)
                    }));
                }
                this.generateMobileSlides(this.availableTimesForSelectedDate);
            },
            error: (error: any) => {
                //error handling goes here
            }
        });
    }

    generateMobileSlides(slots: any[]): void {
        const perSlide = 3;
        this.mobileSlides = [];
        for (let i = 0; i < slots.length; i += perSlide) {
            this.mobileSlides.push(slots.slice(i, i + perSlide));
            this.desktopSlides.push(slots.slice(i, i + perSlide));
        }
    }

    formatTime(dateTime: string): string {
        ;
        const date = new Date(dateTime);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    isTimeSelected(slot: any): boolean {
        return this.selectedTimeSlot?.from === slot.from && this.selectedTimeSlot?.to === slot.to;
    }

    onTimeSelect(slot: TimeSlot): void {
        this.selectedTimeSlot = slot;
        this.bookingData.appointmentTime = `${slot.from} - ${slot.to}`;
        this.timeSlotSelected.emit(slot);
    }

    nextSlide(): void {
        if (this.currentSlideIndex < this.mobileSlides.length - 1) {
            this.currentSlideIndex++;
        }
    }

    prevSlide(): void {
        if (this.currentSlideIndex > 0) {
            this.currentSlideIndex--;
        }
    }

    nextDesktopSlide() {
        if (this.desktopSlideIndex < this.desktopSlides.length - 1) {
            this.desktopSlideIndex++;
        }
    }

    prevDesktopSlide() {
        if (this.desktopSlideIndex > 0) {
            this.desktopSlideIndex--;
        }
    }

    ngOnDestroy() {
        this.languageSubscription?.unsubscribe();
    }
}
