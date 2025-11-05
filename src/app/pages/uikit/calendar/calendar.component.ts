import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CalendarService } from './services/calendar.service';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [CommonModule, TableModule],
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
    allEmployees: any[] = [];
    allAppointments: any[] = [];
    timeSlots: string[] = [];

    constructor(private _calendarService: CalendarService) {}

    ngOnInit(): void {
        this.getAllEmployees();
        this.getAllScheduels();
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date: 3/6/2025
     * Purpose: Fetch all added coaches
     */
    getAllEmployees(): void {
        this.allEmployees = [
            {
                id: 1,
                name: 'Dr. Sarah Johnson',
                img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
                specialty: 'Cardiology',
                type: 'doctor',
                phone: '+1 (555) 123-4567',
                email: 'sarah.johnson@hospital.com',
                experience: 12,
                workingHours: { start: '09:00', end: '17:00' },
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                department: 'Cardiology Department',
                qualifications: ['MD', 'FACC', 'Board Certified Cardiologist'],
                languages: ['English', 'Spanish']
            },
            {
                id: 2,
                name: 'Dr. Michael Chen',
                img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
                specialty: 'Pediatrics',
                type: 'doctor',
                phone: '+1 (555) 234-5678',
                email: 'michael.chen@hospital.com',
                experience: 8,
                workingHours: { start: '08:00', end: '16:00' },
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                department: 'Pediatrics Department',
                qualifications: ['MD', 'ABP', 'Pediatric Emergency Medicine'],
                languages: ['English', 'Mandarin', 'Cantonese']
            },
            {
                id: 4,
                name: 'Dr. James Wilson',
                img: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face',
                specialty: 'Orthopedics',
                type: 'doctor',
                phone: '+1 (555) 456-7890',
                email: 'james.wilson@hospital.com',
                experience: 20,
                workingHours: { start: '07:00', end: '15:00' },
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                department: 'Orthopedic Surgery',
                qualifications: ['MD', 'AAOS', 'Sports Medicine Fellowship'],
                languages: ['English']
            }
        ];
    }

    /**
     * Fetch schedules from API and map them into display format
     */
    getAllScheduels(): void {
        this._calendarService.getAllCalenderData().subscribe({
            next: (res: any) => {
                this.allAppointments = this.mapAppointments(res);
                this.timeSlots = this.extractTimeSlots(this.allAppointments);
            }
        });
    }

    /**
     * Map API data to UI structure
     */
    mapAppointments(apiData: any[]): any[] {
        return apiData.map((doctor) => ({
            id: doctor.doctorId,
            name: doctor.doctorNameAr || doctor.doctorNameEn || 'Unknown Doctor',
            schedule: doctor.slotTime
                .filter((slot: any) => !!slot.appointment)
                .reduce((acc: any, slot: any) => {
                    const appointment = slot.appointment;
                    const from = slot.from.slice(0, 5); // "08:30:00" → "08:30"

                    acc[from] = {
                        patient: appointment.patientNameAr || appointment.patientNameEn || 'Unknown Patient',
                        time: {
                            from,
                            to: slot.to.slice(0, 5)
                        },
                        service: appointment.serviceNameAr || appointment.serviceNameEn || 'Unknown Service',
                        status: this.mapStatus(appointment.status)
                    };
                    return acc;
                }, {})
        }));
    }

    /**
     * Extract unique time slots from mapped data
     */
    extractTimeSlots(mappedAppointments: any[]): string[] {
        const times = new Set<string>();

        mappedAppointments.forEach((doctor) => {
            Object.keys(doctor.schedule).forEach((time) => times.add(time));
        });

        // Sort times in ascending order
        return Array.from(times).sort((a, b) => (a > b ? 1 : -1));
    }

    /**
     * Convert numeric status to readable string
     */
    mapStatus(status: number): string {
        switch (status) {
            case 0:
                return 'scheduled';
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
            case 'confirmed':
                return 'bg-success text-white';
            case 'pending':
            case 'scheduled':
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
        console.log('Fetching slots for:', selectedEmployee.name);
        // TODO: Add real API call here to fetch time slots for the selected employee
    }
}
