import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';

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
    ngOnInit(): void {
        this.getAllEmployees();
        this.generateTimeSlots();
        this.getAllScheduels();
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 3/6/2025
     * Porpuse : this function is fetch all added coachs
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
            },
            {
                id: 5,
                name: 'Dr. Priya Patel',
                img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
                specialty: 'Neurology',
                type: 'doctor',
                phone: '+1 (555) 567-8901',
                email: 'priya.patel@hospital.com',
                experience: 10,
                workingHours: { start: '09:00', end: '17:00' },
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                department: 'Neurology Department',
                qualifications: ['MD', 'AAN', 'Epilepsy Specialist'],
                languages: ['English', 'Hindi', 'Gujarati']
            },
            {
                id: 6,
                name: 'Dr. Robert Thompson',
                img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
                specialty: 'Emergency Medicine',
                type: 'doctor',
                phone: '+1 (555) 678-9012',
                email: 'robert.thompson@hospital.com',
                experience: 18,
                workingHours: { start: '00:00', end: '23:59' }, // 24/7 coverage
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                department: 'Emergency Department',
                qualifications: ['MD', 'ABEM', 'Advanced Trauma Life Support'],
                languages: ['English', 'French']
            },
            {
                id: 7,
                name: 'Nurse Jennifer Martinez',
                img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=face',
                specialty: 'General Care',
                type: 'nurse',
                phone: '+1 (555) 789-0123',
                email: 'jennifer.martinez@hospital.com',
                experience: 7,
                workingHours: { start: '07:00', end: '19:00' },
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                department: 'General Medicine',
                qualifications: ['RN', 'BSN', 'CPR Certified'],
                languages: ['English', 'Spanish']
            },
            {
                id: 8,
                name: 'Nurse David Kim',
                img: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face',
                specialty: 'ICU Care',
                type: 'nurse',
                phone: '+1 (555) 890-1234',
                email: 'david.kim@hospital.com',
                experience: 12,
                workingHours: { start: '19:00', end: '07:00' }, // Night shift
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                department: 'Intensive Care Unit',
                qualifications: ['RN', 'CCRN', 'ACLS Certified'],
                languages: ['English', 'Korean']
            },
            {
                id: 9,
                name: 'Nurse Lisa Anderson',
                img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=face',
                specialty: 'Pediatric Care',
                type: 'nurse',
                phone: '+1 (555) 901-2345',
                email: 'lisa.anderson@hospital.com',
                experience: 9,
                workingHours: { start: '08:00', end: '16:00' },
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                department: 'Pediatrics',
                qualifications: ['RN', 'CPN', 'PALS Certified'],
                languages: ['English']
            },

            {
                id: 11,
                name: 'Nurse Carlos Gonzalez',
                img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
                specialty: 'Surgery Prep',
                type: 'nurse',
                phone: '+1 (555) 123-4560',
                email: 'carlos.gonzalez@hospital.com',
                experience: 6,
                workingHours: { start: '06:00', end: '14:00' },
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                department: 'Surgical Services',
                qualifications: ['RN', 'CNOR', 'Perioperative Certified'],
                languages: ['English', 'Spanish']
            },
            {
                id: 12,
                name: 'Dr. Kevin Chang',
                img: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face',
                specialty: 'Radiology',
                type: 'doctor',
                phone: '+1 (555) 234-5601',
                email: 'kevin.chang@hospital.com',
                experience: 11,
                workingHours: { start: '08:00', end: '16:00' },
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                department: 'Radiology Department',
                qualifications: ['MD', 'ABR', 'Interventional Radiology'],
                languages: ['English', 'Mandarin', 'Japanese']
            },
            {
                id: 13,
                name: 'Nurse Rebecca Taylor',
                img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=face',
                specialty: 'Emergency Care',
                type: 'nurse',
                phone: '+1 (555) 345-6012',
                email: 'rebecca.taylor@hospital.com',
                experience: 5,
                workingHours: { start: '12:00', end: '00:00' }, // Evening shift
                workingDays: ['Friday', 'Saturday', 'Sunday', 'Monday'],
                department: 'Emergency Department',
                qualifications: ['RN', 'CEN', 'TNCC Certified'],
                languages: ['English']
            },

            {
                id: 15,
                name: 'Nurse Thomas Brown',
                img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
                specialty: 'Cardiac Care',
                type: 'nurse',
                phone: '+1 (555) 567-8034',
                email: 'thomas.brown@hospital.com',
                experience: 13,
                workingHours: { start: '07:00', end: '19:00' },
                workingDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                department: 'Cardiac Unit',
                qualifications: ['RN', 'CCRN', 'Cardiac Rehabilitation Certified'],
                languages: ['English']
            }
        ];
    }

    getAllScheduels(): void {
        this.allAppointments = [
            {
                name: 'John Smith',
                id: 1,
                schedule: {
                    '15:30': {
                        patient: 'Client A',
                        time: { from: '15:30', to: '16:00' },
                        service: 'Consultation',
                        status: 'approved'
                    },
                    '17:00': {
                        patient: 'Client B',
                        time: { from: '17:00', to: '17:30' },
                        service: 'Follow-up',
                        status: 'pending'
                    },
                    '19:30': {
                        patient: 'Client C',
                        time: { from: '19:30', to: '20:00' },
                        service: 'Initial Meeting',
                        status: 'cancelled'
                    }
                }
            },
            {
                name: 'Sarah Johnson',
                id: 2,
                schedule: {
                    '16:00': {
                        patient: 'Internal',
                        time: { from: '16:00', to: '16:30' },
                        service: 'Project Review',
                        status: 'approved'
                    },
                    '18:30': {
                        patient: 'Team',
                        time: { from: '18:30', to: '19:00' },
                        service: 'Team Meeting',
                        status: 'pending'
                    },
                    '21:00': {
                        patient: 'Client D',
                        time: { from: '21:00', to: '21:30' },
                        service: 'Planning',
                        status: 'approved'
                    }
                }
            },
            {
                name: 'Mike Davis',
                id: 3,
                schedule: {
                    '15:00': {
                        patient: 'Client E',
                        time: { from: '15:00', to: '15:30' },
                        service: 'Assessment',
                        status: 'approved'
                    },
                    '20:00': {
                        patient: 'Client F',
                        time: { from: '20:00', to: '20:30' },
                        service: 'Consultation',
                        status: 'cancelled'
                    }
                }
            },
            {
                name: 'Emily Wilson',
                id: 4,
                schedule: {
                    '16:30': {
                        patient: 'Staff',
                        time: { from: '16:30', to: '17:00' },
                        service: 'Training Session',
                        status: 'approved'
                    },
                    '22:00': {
                        patient: 'Client G',
                        time: { from: '22:00', to: '22:30' },
                        service: 'Review',
                        status: 'pending'
                    }
                }
            },
            {
                name: 'David Brown',
                id: 5,
                schedule: {
                    '17:30': {
                        patient: 'Client H',
                        time: { from: '17:30', to: '18:00' },
                        service: 'Meeting',
                        status: 'approved'
                    },
                    '23:00': {
                        patient: 'Internal',
                        time: { from: '23:00', to: '23:30' },
                        service: 'End of Day Tasks',
                        status: 'approved'
                    }
                }
            }
        ];
    }

    generateTimeSlots() {
        const startHour = 15;
        const endHour = 24;
        for (let hour = startHour; hour < endHour; hour++) {
            this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
            this.timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }

    getAppointment(employee: any, time: string) {
        return employee.schedule[time] || null;
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'approved':
                return 'bg-success text-white'; // green
            case 'pending':
                return 'bg-warning text-dark'; // yellow
            case 'cancelled':
                return 'bg-danger text-white'; // red
            default:
                return 'bg-light';
        }
    }

    getCoachTimeSlots(selectedEmployee: any): void {
        //here is the function logic to get the time slots based on the choosed employee
    }
}
