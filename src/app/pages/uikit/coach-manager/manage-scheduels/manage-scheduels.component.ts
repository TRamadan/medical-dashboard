import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { Branch, Coach } from '../models/coach';
import { ScheduelService } from '../services/scheduel.service';
@Component({
    selector: 'app-manage-scheduels',
    standalone: true,
    imports: [CommonModule, CheckboxModule, DatePickerModule, DialogModule, ButtonModule, FormsModule],
    templateUrl: './manage-scheduels.component.html',
    styleUrls: ['./manage-scheduels.component.css']
})
export class ManageScheduelsComponent implements OnInit {
    branches: Branch[] = [];
    selectedBranchId: string = '';
    filteredCoaches: Coach[] = [];
    coaches: Coach[] = [];
    editingCoach: Coach | null = null;

    constructor(private dataService: ScheduelService) {}

    ngOnInit() {
        this.dataService.getCoaches().subscribe((coaches: any) => {
            this.coaches = coaches;
            this.filteredCoaches = coaches;
        });

        this.dataService.getBranches().subscribe((branches: any) => {
            this.branches = branches;
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
    }

    //here is the function needed to show the full schedule for the selected coach
    viewDetailedSchedule(coach: Coach): void {}
}
