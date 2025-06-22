import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { Branch, Coach, Session } from '../models/coach';
import { ScheduelService } from '../services/scheduel.service';

@Component({
    selector: 'app-manage-scheduels',
    standalone: true,
    imports: [CommonModule, CheckboxModule, DatePickerModule, DialogModule, ButtonModule, FormsModule, InputNumberModule],
    templateUrl: './manage-scheduels.component.html',
    styleUrls: ['./manage-scheduels.component.css']
})
export class ManageScheduelsComponent implements OnInit {
    branches: Branch[] = [];
    selectedBranchId: string = '';
    filteredCoaches: Coach[] = [];
    coaches: Coach[] = [];
    editingCoach: Coach | null = null;
    selectedCoach: Coach | null = null;
    editScheduleDialog: boolean = false;
    detailedScheduleDialog: boolean = false;
    sessions: Session[] = [];

    constructor(private dataService: ScheduelService) {}

    ngOnInit() {
        this.dataService.getCoaches().subscribe((coaches: any) => {
            this.coaches = coaches;
            this.filteredCoaches = coaches;
        });

        this.dataService.getBranches().subscribe((branches: any) => {
            this.branches = branches;
        });

        this.dataService.getSessions().subscribe((sessions: any) => {
            this.sessions = sessions;
        });
    }

    //here is the function needed to get all coaches
    getAllCoaches(): void {}

    //here is the function needed to get all added branches
    getAllBranches(): void {}

    //here is the function needed that accept coach id to fetch all coach time slots for all days
    getAllDaysTimeSlots(): void {}

    //here is the function needed to fetch coachs based on the selected branch
    filterByBranch() {
        if (this.selectedBranchId) {
            const selectedBranch = this.branches.find((b) => b.id === this.selectedBranchId);
            this.filteredCoaches = selectedBranch ? selectedBranch.coaches : [];
        } else {
            this.filteredCoaches = this.coaches;
        }
    }

    //here is the function needed to edit the slots for each coach
    editSchedule(coach: Coach): void {
        this.editingCoach = { ...coach };
        this.editScheduleDialog = true;
    }

    //here is the function needed to show the full schedule for the selected coach
    viewDetailedSchedule(coach: Coach): void {
        this.selectedCoach = coach;
        this.detailedScheduleDialog = true;
    }

    // Cancel editing schedule
    cancelEditSchedule(): void {
        this.editScheduleDialog = false;
        this.editingCoach = null;
    }

    // Save schedule changes
    saveScheduleChanges(): void {
        if (this.editingCoach) {
            // Update the coach in the service
            const coachIndex = this.coaches.findIndex(c => c.id === this.editingCoach!.id);
            if (coachIndex !== -1) {
                this.coaches[coachIndex] = { ...this.editingCoach };
                this.filterByBranch(); // Refresh filtered list
            }
        }
        this.editScheduleDialog = false;
        this.editingCoach = null;
    }

    // Close detailed schedule view
    closeDetailedSchedule(): void {
        this.detailedScheduleDialog = false;
        this.selectedCoach = null;
    }

    // Get sessions for a specific day and coach
    getSessionsForDay(coachId: string, day: string): any[] {
        return this.sessions.filter(session => 
            session.coachId === coachId && 
            this.getDayFromDate(session.date) === day
        ).map(session => ({
            time: session.time,
            patientName: this.getPatientName(session.patientId),
            type: session.type
        }));
    }

    // Helper method to get day from date
    private getDayFromDate(date: Date): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    }

    // Helper method to get patient name
    private getPatientName(patientId: string): string {
        // This would typically come from a patient service
        const patientNames: { [key: string]: string } = {
            '1': 'John Smith',
            '2': 'Sarah Johnson',
            '3': 'Mike Davis'
        };
        return patientNames[patientId] || 'Unknown Patient';
    }

    // Calculate utilization rate
    getUtilizationRate(coach: Coach): number {
        const availableSlots = coach.availability.filter(slot => slot.isAvailable).length;
        const totalSlots = coach.availability.length;
        return availableSlots > 0 ? Math.round((coach.currentPatients / coach.maxPatients) * 100) : 0;
    }

    // Get available slots count
    getAvailableSlots(coach: Coach): number {
        return coach.maxPatients - coach.currentPatients;
    }
}
