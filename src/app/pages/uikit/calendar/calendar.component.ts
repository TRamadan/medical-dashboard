import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CalendarService } from './services/calendar.service';
import { UserManangementService } from '../add-user/services/user-manangement.service';
import { LocationService } from '../add-location/services/location.service';
import { signal, computed } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BookingFormComponent } from '../appointments/booking-form/booking-form.component';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [FormsModule, CommonModule, TableModule, DatePickerModule, ToolbarModule, DialogModule, ButtonModule, DropdownModule, CardModule, SelectButtonModule, ProgressSpinnerModule, BookingFormComponent],
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
    allLocations: any[] = [];
    filteredEmployees: any[] = [];
    originalAppointments = signal<any[]>([]);
    allAppointments = signal<any[]>([]);
    timeSlots = signal<string[]>([]);
    selectedEmployeeId = signal<number | null>(null);
    selectedLocation: any = null;
    displayNewAppointmentDialog: boolean = false;
    showPlaceholder: boolean = true;
    showNoResults: boolean = false;
    allEmployees: any[] = []

    // Filter states
    selectedLocationId = signal<number | null>(null);
    selectedView = signal<string>('daily');
    /** Writable value for SelectButton two-way binding; kept in sync with selectedView signal */
    viewValue: string = 'daily';
    viewOptions: any[] = [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' }
    ];

    /** Time-slot length options in minutes (shown as HH:mm from 00:05 to 24:00) */
    timeOptions: { label: string; value: number }[] = [];
    selectedSlotMinutes: number = 30; // default 30 minutes

    date: Date = new Date(); // Used when view preset (Daily/Weekly/Monthly) is applied
    /** Date range from picker; when set with location, triggers loading employees and appointments */
    dateRange: Date[] = [new Date(), new Date()];

    // Loading states for spinners
    loadingLocations = signal<boolean>(false);
    loadingSchedules = signal<boolean>(false);
    loadingEmployeeAppointments = signal<boolean>(false);
    loadingEmployees = signal<boolean>(false);

    totalSlots = computed(() => this.allAppointments().length);
    bookedSlots = computed(() => this.allAppointments().filter((a) => a.status?.toLowerCase() === 'booked').length);
    availableSlots = computed(() => this.allAppointments().filter((a) => a.status?.toLowerCase() === 'available').length);
    pendingSlots = computed(() => this.allAppointments().filter((a) => a.status?.toLowerCase() === 'pending').length);

    constructor(
        private _calendarService: CalendarService,
        private _userService: UserManangementService,
        private _locationService: LocationService // Added LocationService
    ) { }

    ngOnInit(): void {
        this.buildTimeOptions();
        this.getAllLocations();
    }

    /** Build time options from 00:05 to 24:00 in 5-minute steps */
    private buildTimeOptions(): void {
        const options: { label: string; value: number }[] = [];
        for (let minutes = 5; minutes <= 1440; minutes += 5) {
            const hoursPart = Math.floor(minutes / 60);
            const minsPart = minutes % 60;
            const label = `${hoursPart.toString().padStart(2, '0')}:${minsPart.toString().padStart(2, '0')}`;
            options.push({ label, value: minutes });
        }
        this.timeOptions = options;
    }

    /** Map UI view value to API period (daily = single day, weekly = +6 days, monthly = +1 month) */
    private getViewToDate(): string | undefined {
        const view = this.selectedView();
        if (view === 'weekly') {
            const end = new Date(this.date);
            end.setDate(end.getDate() + 6);
            return this.formatDate(end);
        }
        if (view === 'monthly') {
            const end = new Date(this.date);
            end.setMonth(end.getMonth() + 1);
            return this.formatDate(end);
        }
        return undefined; // daily = single day, no toDate
    }

    /** Start date for API: from dateRange if set, else from single date */
    private getFromDate(): string {
        if (this.dateRange?.length >= 1 && this.dateRange[0]) {
            return this.formatDate(this.dateRange[0]);
        }
        return this.formatDate(this.date);
    }

    /** End date for API: from dateRange if two dates, else single date or view-based */
    private getToDate(): string | undefined {
        if (this.dateRange?.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            return this.formatDate(this.dateRange[1]);
        }
        if (this.dateRange?.length === 1 && this.dateRange[0]) {
            return this.formatDate(this.dateRange[0]);
        }
        return this.getViewToDate();
    }

    /** True when we have both location and a date range to load appointments */
    hasLocationAndDateRange(): boolean {

        return !!this.selectedLocation && !!this.dateRange?.length && !!this.dateRange[0];
    }

    /** Display label for the selected date range (e.g. "2026-02-22" or "2026-02-22 to 2026-02-28") */
    getDateRangeLabel(): string {
        if (!this.dateRange?.length || !this.dateRange[0]) return this.date ? this.formatDate(this.date) : '';
        const from = this.dateRange[0];
        const to = this.dateRange.length === 2 && this.dateRange[1] ? this.dateRange[1] : from;
        const fromStr = this.formatDate(from);
        const toStr = this.formatDate(to);
        return fromStr === toStr ? fromStr : `${fromStr} to ${toStr}`;
    }

    /**
     * Load appointments (and optionally filter by employee). Call only when location + date range are set.
     */
    loadAppointmentsByLocationAndRange(doctorId?: number): void {
        if (!this.hasLocationAndDateRange()) return;
        const fromDate = this.getFromDate();
        const toDate = this.getToDate();
        const locationId = this.selectedLocationId() || undefined;

        this.loadingSchedules.set(true);
        if (doctorId) this.loadingEmployeeAppointments.set(true);

        this._calendarService.getAllCalenderData(fromDate, this.selectedSlotMinutes, doctorId, locationId, toDate).subscribe({
            next: (res: any) => {
                const data = Array.isArray(res) ? res : [];
                const mapped = this.mapAppointments(data);
                this.originalAppointments.set(mapped);
                this.allAppointments.set([...mapped]);
                const slots = this.extractTimeSlots(mapped);
                this.timeSlots.set(slots);
                this.fillMissingSlots(this.allAppointments(), this.timeSlots());
                this.loadingSchedules.set(false);
                if (doctorId) this.loadingEmployeeAppointments.set(false);
                this.updateNoResultsState();
            },
            error: (_err) => {
                console.error('Error fetching calendar data:', _err);
                this.originalAppointments.set([]);
                this.allAppointments.set([]);
                this.timeSlots.set([]);
                this.loadingSchedules.set(false);
                if (doctorId) this.loadingEmployeeAppointments.set(false);
                this.updateNoResultsState();
            }
        });
    }

    getAllScheduels(): void {
        const fromDate = this.getFromDate();
        const toDate = this.getToDate();
        const doctorId = this.selectedEmployeeId() || undefined;
        const locationId = this.selectedLocationId() || undefined;

        this.loadingSchedules.set(true);
        this._calendarService.getAllCalenderData(fromDate, this.selectedSlotMinutes, doctorId, locationId, toDate).subscribe({
            next: (res: any) => {
                const data = Array.isArray(res) ? res : [];
                const mapped = this.mapAppointments(data);
                this.originalAppointments.set(mapped);
                this.allAppointments.set([...mapped]);
                const slots = this.extractTimeSlots(mapped);
                this.timeSlots.set(slots);
                this.fillMissingSlots(this.allAppointments(), this.timeSlots());
                this.loadingSchedules.set(false);
            },
            error: (_err) => {
                console.error('Error fetching schedules:', _err);
                this.originalAppointments.set([]);
                this.allAppointments.set([]);
                this.timeSlots.set([]);
                this.loadingSchedules.set(false);
            }
        });
    }
    /**
     * Map API data to UI structure
     */
    mapAppointments(apiData: any[]): any[] {
        return apiData.map((doctor) => ({
            id: doctor.doctorId,
            name: doctor.doctorNameAr?.trim() || doctor.doctorNameEn?.trim() || 'Unknown Doctor',
            schedule: doctor.slotTime.reduce(
                (acc: any, slot: any) => {
                    const from = slot.from.slice(0, 5);
                    const to = slot.to.slice(0, 5);
                    const key = `${from} - ${to}`;
                    const appointment = slot.appointment;
                    const doctorLocationAr = slot.locationNameAr;
                    const doctorLocationEn = slot.locationNameAr;

                    acc[key] = appointment
                        ? {
                            patient: appointment.patientNameAr?.trim() || appointment.patientNameEn?.trim() || 'Unknown Patient',
                            time: { from, to },
                            service: appointment.serviceNameAr || 'Unknown Service',
                            serviceEn: appointment.serviceNameEn,
                            status: appointment.status,
                            price: `${appointment?.servicePrice} EGP`
                        }
                        : {
                            patient: null,
                            time: { from, to },
                            service: null,
                            locationAr: doctorLocationAr,
                            locationEn: doctorLocationEn,
                            price: null,
                            status: 'Available'
                        };

                    return acc;
                },

                {}
            )
        }));
    }

    /**
     * Extract unique time slots from mapped data
     */
    extractTimeSlots(mappedAppointments: any[]): string[] {
        const timesMap = new Map<string, string>();

        mappedAppointments.forEach((doctor) => {
            Object.values(doctor.schedule).forEach((slot: any) => {
                const key = slot.time.from + '-' + slot.time.to;
                timesMap.set(key, slot.time.from + ' - ' + slot.time.to);
            });
        });

        return Array.from(timesMap.values()).sort();
    }

    /**
     * Extract unique time slots from mapped data
     */
    fillMissingSlots(mappedAppointments: any[], allSlots: string[]) {
        mappedAppointments.forEach((doctor) => {
            allSlots.forEach((time) => {
                if (!doctor.schedule[time]) {
                    const [from, to] = time.split(' - ');
                    doctor.schedule[time] = {
                        patient: null,
                        service: null,
                        status: 'Available',
                        time: {
                            from,
                            to
                        }
                    };
                }
            });
        });
    }

    onDateSelect(): void {
        if (this.date && this.hasLocationAndDateRange()) {
            this.loadAppointmentsByLocationAndRange(this.selectedEmployeeId() || undefined);
        }
    }

    /** Called when user changes the slot length (time filter dropdown). */
    onSlotMinutesChange(): void {
        if (this.hasLocationAndDateRange()) {
            const selectedDoctor = this.selectedEmployeeId();
            this.loadAppointmentsByLocationAndRange(selectedDoctor || undefined);
        } else {
            this.getAllScheduels();
        }
    }

    fetchEmployeeData(date: string, employeeId: number): void {
        const toDate = this.getToDate();
        const locationId = this.selectedLocationId() || undefined;
        this.loadingEmployeeAppointments.set(true);
        this._calendarService.getAllCalenderData(date, this.selectedSlotMinutes, employeeId, locationId, toDate).subscribe({
            next: (res: any) => {
                const data = Array.isArray(res) ? res : [];
                const mapped = this.mapAppointments(data);
                this.allAppointments.set([...mapped]);
                const slots = this.extractTimeSlots(mapped);
                this.timeSlots.set(slots);
                this.fillMissingSlots(this.allAppointments(), this.timeSlots());
                this.updateNoResultsState();
                this.loadingEmployeeAppointments.set(false);
            },
            error: (_err) => {
                console.error('Error fetching employee appointments:', _err);
                this.allAppointments.set([]);
                this.timeSlots.set([]);
                this.updateNoResultsState();
                this.loadingEmployeeAppointments.set(false);
            }
        });
    }

    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Convert numeric status to readable string
     */
    mapStatus(status: number): string {
        switch (status) {
            case 0:
                return 'Scheduled';
            case 1:
                return 'confirmed';
            case 2:
                return 'completed';
            case 3:
                return 'cancelled';
            default:
                return 'unknown';
        }
    }

    /**
     * Get appointment object from schedule
     */
    getAppointment(employee: any, time: string) {
        return employee.schedule[time] || null;
    }

    /** Called when user clicks an available slot cell to create a new appointment */
    onEmptySlotClick(doctor: any, time: string): void {
        const appointment = this.getAppointment(doctor, time);
        if (appointment && appointment.patient) {
            return; // not available
        }
        this.openNewAppointmentDialog();
    }

    /**
     * Map status to CSS class
     */
    getStatusColor(status: string): string {
        switch (status) {
            case 'approved':
            case 'Confirmed':
                return 'bg-success text-white';
            case 'pending':
            case 'Scheduled':
                return 'bg-warning text-dark';
            case 'cancelled':
                return 'bg-danger text-white';
            case 'completed':
                return 'bg-primary text-white';
            default:
                return 'bg-light text-dark';
        }
    }

    /**
     * Get time slots for selected employee
     */

    getCoachTimeSlots(selectedEmployee: any): void {
        // If clicking the same employee -> reset filter
        if (this.selectedEmployeeId() === selectedEmployee.doctorId) {
            this.resetFilter();
            return;
        }

        // Select new employee
        this.selectedEmployeeId.set(selectedEmployee.doctorId);
        this.fetchEmployeeData(this.formatDate(this.date), selectedEmployee.doctorId);
    }

    /**
     * Reset filter to show all appointments for current location and date range
     */
    resetFilter(): void {
        this.selectedEmployeeId.set(null);
        if (this.hasLocationAndDateRange()) {
            this.loadAppointmentsByLocationAndRange();
        } else {
            this.allAppointments.set([]);
            this.timeSlots.set([]);
        }
    }

    openNewAppointmentDialog() {
        this.displayNewAppointmentDialog = true;
    }

    hideDialog() {
        this.displayNewAppointmentDialog = false;
    }

    onBookingSuccess() {
        this.displayNewAppointmentDialog = false;
        this.getAllScheduels();
    }

    getAllLocations(): void {
        this.loadingLocations.set(true);
        this._locationService.getLocations().subscribe({
            next: (res: any) => {
                const apiLocations = res?.data ?? (Array.isArray(res) ? res : []);
                this.allLocations = Array.isArray(apiLocations) ? apiLocations : [];
                this.loadingLocations.set(false);
            },
            error: (err) => {
                console.error('Error fetching locations:', err);
                this.allLocations = [];
                this.loadingLocations.set(false);
            }
        });
    }

    /** Called when user changes location, date, or view. Fetches appointments and filters employees. */
    applyFilters(): void {
        if (this.selectedLocation) {
            this.selectedLocationId.set(this.selectedLocation.id);
            this.filterEmployeesByLocation();
        } else {
            this.selectedLocationId.set(null);
            this.filteredEmployees = [...this.allEmployees];
        }
        this.getAllScheduels();
    }

    onLocationSelect(): void {
        if (this.selectedLocation) {
            this.selectedLocationId.set(this.selectedLocation.id);
            if (this.hasLocationAndDateRange()) {
                this.selectedEmployeeId.set(null);
                this.fetchDoctorsByLocation(
                    this.selectedLocation.id,
                    this.getFromDate(),
                    this.getToDate() || this.getFromDate()
                );
            } else {
                this.filterEmployeesByLocation();
            }
        } else {
            this.selectedLocationId.set(null);
            this.filteredEmployees = [...this.allEmployees];
            this.allAppointments.set([]);
            this.timeSlots.set([]);
        }
    }

    filterEmployeesByLocation(): void {
        if (!this.selectedLocation) {
            this.filteredEmployees = [...this.allEmployees];
            return;
        }

        // Filter employees who work at the selected location
        this.filteredEmployees = this.allEmployees.filter((emp: any) => {
            return emp.locations?.some((loc: any) => loc.id === this.selectedLocation.id);
        });

        // If currently selected coach is not in the filtered list, reset coach selection
        if (this.selectedEmployeeId()) {
            const isSelectedCoachInLocation = this.filteredEmployees.some(e => e.id === this.selectedEmployeeId());
            if (!isSelectedCoachInLocation) {
                this.selectedEmployeeId.set(null);
            }
        }
    }

    onCoachSelect(coach: any): void {
        if (this.selectedEmployeeId() === coach.doctorId) {
            this.selectedEmployeeId.set(null);
            if (this.hasLocationAndDateRange()) {
                this.loadAppointmentsByLocationAndRange();
            } else {
                this.allAppointments.set([]);
                this.timeSlots.set([]);
            }
            this.showNoResults = false;
        } else {
            this.selectedEmployeeId.set(coach.doctorId);
            if (this.hasLocationAndDateRange()) {
                this.loadAppointmentsByLocationAndRange(coach.doctorId);
            } else {
                this.fetchEmployeeData(this.getFromDate(), coach.doctorId);
            }
        }
    }

    updateNoResultsState(): void {
        this.showNoResults = this.selectedEmployeeId() !== null && this.allAppointments().length === 0;
    }
    parsedDates: any = {}
    onDateRangeSelect(): void {
        if (!this.dateRange?.length || !this.dateRange[0]) return;
        if (this.hasLocationAndDateRange()) {
            this.selectedEmployeeId.set(null);
            this.fetchDoctorsByLocation(
                this.selectedLocationId()!,
                this.getFromDate(),
                this.getToDate() || this.getFromDate()
            );
        }
    }

    /**
     * Fetch doctors for the given location and date range.
     * On success, updates filteredEmployees and then loads all calendar appointments.
     */
    fetchDoctorsByLocation(locationId: number, fromDate: string, toDate: string): void {
        this.loadingEmployees.set(true);
        this._calendarService.getDoctorsByLocation(locationId, fromDate, toDate).subscribe({
            next: (res: any) => {
                const apiDoctors = res?.data ?? (Array.isArray(res) ? res : []);
                if (Array.isArray(apiDoctors) && apiDoctors.length > 0) {
                    this.filteredEmployees = apiDoctors;
                } else {
                    // Fall back to client-side filter if API returns empty
                    this.filterEmployeesByLocation();
                }
                this.loadingEmployees.set(false);
                // After the doctors list is ready, load calendar appointments
                this.loadAppointmentsByLocationAndRange();
            },
            error: (_err) => {
                console.error('Error fetching doctors by location:', _err);
                // Fall back to client-side filter and still load appointments
                this.filterEmployeesByLocation();
                this.loadingEmployees.set(false);
                this.loadAppointmentsByLocationAndRange();
            }
        });
    }

    onViewChange(): void {
        this.selectedView.set(this.viewValue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (this.viewValue === 'daily') {
            this.dateRange = [new Date(today), new Date(today)];
        } else if (this.viewValue === 'weekly') {
            const end = new Date(today);
            end.setDate(end.getDate() + 6);
            this.dateRange = [new Date(today), end];
        } else {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            this.dateRange = [start, end];
        }
        if (this.hasLocationAndDateRange()) {
            this.selectedEmployeeId.set(null);
            this.loadAppointmentsByLocationAndRange();
        }
    }

    private formatLocalDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /** Returns up to two uppercase initials from a name string (first + last word). */
    getInitials(name: string): string {
        if (!name?.trim()) return 'DR';
        const words = name.trim().split(/\s+/).filter(w => w.length > 0);
        if (words.length === 1) return words[0][0].toUpperCase();
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }

}
