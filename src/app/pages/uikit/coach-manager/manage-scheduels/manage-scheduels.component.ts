import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-manage-scheduels',
    standalone: true,
    imports: [CommonModule, CheckboxModule, DatePickerModule, DialogModule, ButtonModule, FormsModule],
    templateUrl: './manage-scheduels.component.html',
    styleUrls: ['./manage-scheduels.component.css']
})
export class ManageScheduelsComponent implements OnInit {
    branches: any[] = [];
    coaches: any[] = [];
    filteredCoaches: any[] = [];
    isAllSchedulesDialog: boolean = false;
    isEditScheduleDialog: boolean = false;
    selectedCoach: any;
    editingCoach: any;
    selectedBranchId: any;
    weekDays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    constructor() {}

    ngOnInit() {
        this.getAllBranches();
        this.getAllCoaches();
    }

    //here is the function needed to get all added branches
    getAllBranches(): void {
        this.branches = [
            {
                id: '1',
                name: 'Downtown Branch',
                location: '123 Main St, Downtown'
            },
            {
                id: '2',
                name: 'Northside Branch',
                location: '456 Oak Ave, Northside'
            }
        ];
    }

    //here is the function needed to get all coaches
    getAllCoaches(): void {
        this.filteredCoaches = [];
        this.coaches = [
            {
                id: '1',
                name: 'Dr. Emily Rodriguez',
                email: 'emily.rodriguez@clinic.com',
                specializations: ['Knee Rehabilitation', 'Sports Medicine', 'ACL Recovery'],
                branch: 'Downtown',
                availability: [
                    { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
                    { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
                    { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
                    { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
                    { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
                ],
                currentPatients: 8,
                maxPatients: 12,
                experience: 5
            },
            {
                id: '2',
                name: 'James Thompson',
                email: 'james.thompson@clinic.com',
                specializations: ['Shoulder Rehabilitation', 'Upper Body Therapy'],
                branch: 'Downtown',
                availability: [
                    { day: 'Monday', startTime: '10:00', endTime: '18:00', isAvailable: true },
                    { day: 'Tuesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
                    { day: 'Wednesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
                    { day: 'Thursday', startTime: '10:00', endTime: '18:00', isAvailable: true },
                    { day: 'Friday', startTime: '10:00', endTime: '18:00', isAvailable: true }
                ],
                currentPatients: 6,
                maxPatients: 10,
                experience: 3
            },
            {
                id: '3',
                name: 'Lisa Chen',
                email: 'lisa.chen@clinic.com',
                specializations: ['Spine Therapy', 'Core Strengthening', 'Posture Correction'],
                branch: 'Northside',
                availability: [
                    { day: 'Monday', startTime: '08:00', endTime: '16:00', isAvailable: true },
                    { day: 'Tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
                    { day: 'Wednesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
                    { day: 'Thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
                    { day: 'Friday', startTime: '08:00', endTime: '16:00', isAvailable: true }
                ],
                currentPatients: 9,
                maxPatients: 12,
                experience: 7
            }
        ];
        this.filteredCoaches = this.coaches;
    }

    //here is the function needed to calculate the working percentage
    getWorkloadPercentage(coach: any): number {
        return Math.round((coach.currentPatients / coach.maxPatients) * 100);
    }

    //here is the function needed to edit the selected coach schedule
    editSchedule(coach: any) {
        this.editingCoach = { ...coach };
        this.isEditScheduleDialog = true;
    }

    isDayAvailable(day: string): boolean {
        if (!this.editingCoach) return false;
        return this.editingCoach.availability.some((slot: any) => slot.day === day && slot.isAvailable);
    }

    getDayStartTime(day: string): string {
        if (!this.editingCoach) return '';
        const slot = this.editingCoach.availability.find((s: any) => s.day === day);
        return slot ? slot.startTime : '09:00';
    }

    getDayEndTime(day: string): string {
        if (!this.editingCoach) return '';
        const slot = this.editingCoach.availability.find((s: any) => s.day === day);
        return slot ? slot.endTime : '17:00';
    }

    toggleDayAvailability(day: string, event: any) {
        if (!this.editingCoach) return;

        const isChecked = event.checked;
        const existingSlotIndex = this.editingCoach.availability.findIndex((s: any) => s.day === day);

        if (isChecked) {
            if (existingSlotIndex === -1) {
                this.editingCoach.availability.push({
                    day,
                    startTime: '09:00',
                    endTime: '17:00',
                    isAvailable: true
                });
            } else {
                this.editingCoach.availability[existingSlotIndex].isAvailable = true;
            }
        } else {
            if (existingSlotIndex !== -1) {
                this.editingCoach.availability[existingSlotIndex].isAvailable = false;
            }
        }
    }

    updateDayStartTime(day: string, event: any) {
        if (!this.editingCoach) return;

        const slot = this.editingCoach.availability.find((s: any) => s.day === day);
        if (slot) {
            slot.startTime = event.target.value;
        }
    }

    updateDayEndTime(day: string, event: any) {
        if (!this.editingCoach) return;

        const slot = this.editingCoach.availability.find((s: any) => s.day === day);
        if (slot) {
            slot.endTime = event.target.value;
        }
    }

    updateMaxPatients(event: any) {
        if (!this.editingCoach) return;
        this.editingCoach.maxPatients = parseInt(event.target.value, 10);
    }
    //here is the function needed to filter the coaches based on the location
    filterByBranch() {}

    //here is the functuon needed to open a dialog needed to show all time slots for the selected coach
    showFullCoachSchedule(coach: any): void {
        debugger;
        this.selectedCoach = coach;
        this.isAllSchedulesDialog = true;
    }

    private formatTime(d: Date): string {
        return d.toTimeString().slice(0, 5);
    }

    //here is the function needed to get schedule for day based on coach
    getDetailedScheduleForDay(coach: any | null, day: string, slotMinutes = 30): any[] {
        if (!coach) return [];

        const block = coach.availability.find((a: any) => a.day === day);
        if (!block || !block.isAvailable) {
            return [{ timeSlot: '', status: 'off' }];
        }

        const slots: any[] = [];

        const [startH, startM] = block.startTime.split(':').map(Number);
        const [endH, endM] = block.endTime.split(':').map(Number);

        const startTime = new Date(0, 0, 0, startH, startM);
        const endTime = new Date(0, 0, 0, endH, endM);

        let current = new Date(startTime);

        while (current < endTime) {
            const next = new Date(current.getTime() + slotMinutes * 60 * 1000); // new instance
            const label = `${this.formatTime(current)} – ${this.formatTime(next)}`;

            slots.push({ timeSlot: label, status: 'available' });
            current = next; // advance safely
        }

        return slots;
    }
}
