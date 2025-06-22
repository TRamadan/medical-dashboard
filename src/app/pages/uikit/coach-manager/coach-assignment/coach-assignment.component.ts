import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Coach, Branch } from '../models/coach';
import { ScheduelService } from '../services/scheduel.service';

interface Patient {
    id: number;
    name: string;
    injury: string;
    severity: string;
    currentPlan: string;
    nextAppointment: string;
}

interface Assignment {
    id: string;
    coachName: string;
    sessionType: string;
    date: string;
    time: string;
}

@Component({
  selector: 'app-coach-assignment',
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule],
  standalone : true,
  templateUrl: './coach-assignment.component.html',
  styleUrl: './coach-assignment.component.scss'
})
export class CoachAssignmentComponent implements OnInit {
    patients: Patient[] = [];
    coaches: Coach[] = [];
    branches: Branch[] = [];
    filteredCoaches: Coach[] = [];
    
    selectedPatientId: string = '';
    selectedSessionType: string = '';
    selectedBranchId: string = '';
    selectedPatient: Patient | null = null;
    selectedCoachForAssignment: Coach | null = null;
    
    assignmentDialog: boolean = false;
    currentAssignments: Assignment[] = [];

    constructor(private scheduleService: ScheduelService) {}

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        // Load patients
        this.patients = [
            {
                id: 1,
                name: 'John Smith',
                injury: 'ACL Tear',
                severity: 'High',
                currentPlan: 'ACL Reconstruction Recovery Protocol',
                nextAppointment: '2024-06-08'
            },
            {
                id: 2,
                name: 'Sarah Johnson',
                injury: 'Shoulder Impingement',
                severity: 'Medium',
                currentPlan: 'Shoulder Mobility and Strengthening Program',
                nextAppointment: '2024-06-06'
            },
            {
                id: 3,
                name: 'Mike Davis',
                injury: 'Lower Back Pain',
                severity: 'Medium',
                currentPlan: 'Spinal Stabilization Protocol',
                nextAppointment: '2024-06-07'
            }
        ];

        // Load coaches and branches from service
        this.scheduleService.getCoaches().subscribe((coaches: any) => {
            this.coaches = coaches;
            this.filteredCoaches = coaches;
        });

        this.scheduleService.getBranches().subscribe((branches: any) => {
            this.branches = branches;
        });
    }

    onPatientChange() {
        if (this.selectedPatientId) {
            this.selectedPatient = this.patients.find(p => p.id.toString() === this.selectedPatientId) || null;
            this.filterCoaches();
        } else {
            this.selectedPatient = null;
            this.filteredCoaches = this.coaches;
        }
    }

    onSessionTypeChange() {
        this.filterCoaches();
    }

    onBranchChange() {
        this.filterCoaches();
    }

    filterCoaches() {
        let filtered = this.coaches;

        // Filter by branch
        if (this.selectedBranchId) {
            filtered = filtered.filter(coach => {
                const branch = this.branches.find(b => b.id === this.selectedBranchId);
                return branch && branch.coaches.some(c => c.id === coach.id);
            });
        }

        // Filter by session type (specialization)
        if (this.selectedSessionType) {
            filtered = filtered.filter(coach => 
                coach.specializations.some(spec => 
                    spec.toLowerCase().includes(this.selectedSessionType.toLowerCase())
                )
            );
        }

        // Filter by availability
        filtered = filtered.filter(coach => this.isCoachAvailable(coach));

        this.filteredCoaches = filtered;
    }

    isCoachAvailable(coach: Coach): boolean {
        return coach.currentPatients < coach.maxPatients;
    }

    isRecommendedCoach(coach: Coach): boolean {
        if (!this.selectedPatient) return false;
        
        // Check if coach specializes in the patient's injury type
        const injuryKeywords = this.selectedPatient.injury.toLowerCase().split(' ');
        return coach.specializations.some(spec => 
            injuryKeywords.some(keyword => spec.toLowerCase().includes(keyword))
        );
    }

    getInitials(name: string): string {
        if (!name) return '';
        const words = name.trim().split(' ');
        const initials = words.slice(0, 2).map((w) => w.charAt(0).toUpperCase());
        return initials.join('');
    }

    getWorkloadPercentage(coach: Coach): number {
        return Math.round((coach.currentPatients / coach.maxPatients) * 100);
    }

    assignCoach(coach: Coach) {
        this.selectedCoachForAssignment = coach;
        this.assignmentDialog = true;
    }

    viewCoachSchedule(coach: Coach) {
        // This would open a detailed schedule view
        console.log('Viewing schedule for:', coach.name);
    }

    cancelAssignment() {
        this.assignmentDialog = false;
        this.selectedCoachForAssignment = null;
    }

    confirmAssignment() {
        if (this.selectedCoachForAssignment && this.selectedPatient) {
            const assignment: Assignment = {
                id: Date.now().toString(),
                coachName: this.selectedCoachForAssignment.name,
                sessionType: this.selectedSessionType || 'General Session',
                date: new Date().toLocaleDateString(),
                time: '10:00 AM'
            };

            this.currentAssignments.push(assignment);
            
            // Update coach workload
            const coachIndex = this.coaches.findIndex(c => c.id === this.selectedCoachForAssignment!.id);
            if (coachIndex !== -1) {
                this.coaches[coachIndex].currentPatients++;
                this.filterCoaches(); // Refresh filtered list
            }

            this.assignmentDialog = false;
            this.selectedCoachForAssignment = null;
        }
    }

    rescheduleAssignment(assignment: Assignment) {
        // This would open a rescheduling dialog
        console.log('Rescheduling assignment:', assignment);
    }

    removeAssignment(assignment: Assignment) {
        const index = this.currentAssignments.findIndex(a => a.id === assignment.id);
        if (index !== -1) {
            this.currentAssignments.splice(index, 1);
            
            // Update coach workload
            const coachIndex = this.coaches.findIndex(c => c.name === assignment.coachName);
            if (coachIndex !== -1) {
                this.coaches[coachIndex].currentPatients--;
                this.filterCoaches(); // Refresh filtered list
            }
        }
    }
}
