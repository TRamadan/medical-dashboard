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

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [FormsModule, CommonModule, TableModule, DatePickerModule, ToolbarModule, DialogModule, ButtonModule, DropdownModule, CardModule],
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
    allEmployees: any[] = [];
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

    date: Date = new Date(); // Initialize with today's date

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
        this.getAllLocations();
        this.getAllEmployees();
    }

    getAllEmployees(): void {
        this._userService.getAllUsers().subscribe({
            next: (res: any) => {
                this.allEmployees = res.data;
            },
            error: (err) => {
                console.error('Error fetching employees:', err);
            }
        });
    }

    getAllScheduels(date: string): void {
        this._calendarService.getAllCalenderData(date).subscribe({
            next: (res: any) => {
                const mapped = this.mapAppointments(res);
                console.log(mapped);
                this.originalAppointments.set(mapped);
                this.allAppointments.set([...mapped]);
                const slots = this.extractTimeSlots(mapped);
                this.timeSlots.set(slots);
                this.fillMissingSlots(this.allAppointments(), this.timeSlots());
            },

            error: (err) => {
                console.error('Error fetching calendar data:', err);
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
        if (this.date) {
            const formattedDate = this.formatDate(this.date);

            if (this.selectedEmployeeId()) {
                this.fetchEmployeeData(formattedDate, this.selectedEmployeeId()!);
            } else {
                this.getAllScheduels(formattedDate);
            }
        }
    }

    fetchEmployeeData(date: string, employeeId: number): void {
        this._calendarService.getAllCalenderData(date, 30, employeeId).subscribe({
            next: (res: any) => {
                const mapped = this.mapAppointments(res);
                this.allAppointments.set([...mapped]);
                const slots = this.extractTimeSlots(mapped);
                this.timeSlots.set(slots);
                this.fillMissingSlots(this.allAppointments(), this.timeSlots());
                this.updateNoResultsState();
            },
            error: (err) => {
                console.error('Error loading employee calendar:', err);
                this.updateNoResultsState();
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
        if (this.selectedEmployeeId() === selectedEmployee.id) {
            this.resetFilter();
            return;
        }

        // Select new employee
        this.selectedEmployeeId.set(selectedEmployee.id);
        this.fetchEmployeeData(this.formatDate(this.date), selectedEmployee.id);
    }

    /**
     * Reset filter to show all appointments
     */
    resetFilter(): void {
        this.selectedEmployeeId.set(null);
        this.getAllScheduels(this.formatDate(this.date));
    }

    openNewAppointmentDialog() {
        this.displayNewAppointmentDialog = true;
    }

    hideDialog() {
        this.displayNewAppointmentDialog = false;
    }

    onBookingSuccess() {
        this.displayNewAppointmentDialog = false;
        this.getAllScheduels(this.formatDate(this.date));
    }

    getAllLocations(): void {
        this._locationService.getLocations().subscribe({
            next: (res: any) => {
                this.allLocations = res.data || res;
            },
            error: (err) => {
                console.error('Error fetching locations:', err);
            }
        });
    }

    onLocationSelect(): void {
        if (this.selectedLocation) {
            this.showPlaceholder = false;
            this.filterEmployeesByLocation();
        } else {
            this.showPlaceholder = true;
            this.filteredEmployees = [];
            this.allAppointments.set([]);
            this.selectedEmployeeId.set(null);
        }
    }

    filterEmployeesByLocation(): void {
        if (!this.selectedLocation) {
            this.filteredEmployees = [];
            return;
        }

        // Filter employees who work at the selected location
        this.filteredEmployees = this.allEmployees.filter((emp: any) => {
            return emp.locations?.some((loc: any) => loc.id === this.selectedLocation.id);
        });

        // Reset selection
        this.selectedEmployeeId.set(null);
        this.allAppointments.set([]);
        this.showNoResults = false;
    }

    onCoachSelect(coach: any): void {
        if (this.selectedEmployeeId() === coach.id) {
            // Deselect if clicking the same coach
            this.selectedEmployeeId.set(null);
            this.allAppointments.set([]);
            this.showNoResults = false;
        } else {
            // Select new coach and fetch appointments
            this.selectedEmployeeId.set(coach.id);
            this.fetchEmployeeData(this.formatDate(this.date), coach.id);
        }
    }

    updateNoResultsState(): void {
        this.showNoResults = this.selectedEmployeeId() !== null && this.allAppointments().length === 0;
    }
}
