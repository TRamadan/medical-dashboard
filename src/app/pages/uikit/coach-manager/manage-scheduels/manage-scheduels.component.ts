import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
@Component({
    selector: 'app-manage-scheduels',
    standalone: true,
    imports: [DialogModule, ButtonModule, FormsModule],
    templateUrl: './manage-scheduels.component.html',
    styleUrls: ['./manage-scheduels.component.css']
})
export class ManageScheduelsComponent implements OnInit {
    branches: any[] = [];
    coaches: any[] = [];
    filteredCoaches: any[] = [];
    isAllSchedulesDialog: boolean = false;
    isEditScheduleDialog: boolean = false;
    editingCoach: any;
    selectedBranchId: any;
    weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

    //here is the function needed to filter the coaches based on the location
    filterByBranch() {}

    //here is the functuon needed to open a dialog needed to show all time slots for the selected coach
    showFullCoachSchedule(coach: any): void {}
}
