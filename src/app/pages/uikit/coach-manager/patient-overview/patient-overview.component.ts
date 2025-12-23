import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-patient-overview',
    imports: [CommonModule, AccordionModule, TagModule, ButtonModule, TooltipModule, CardModule],
    standalone: true,
    templateUrl: './patient-overview.component.html',
    styleUrl: './patient-overview.component.scss'
})
export class PatientOverviewComponent {
    selectedPatient: any = null;

    patients: any[] = [
        {
            id: 'PT-202225',
            name: 'Ahmed Ali Hassan',
            age: '35 Years',
            gender: 'Male',
            mobile: '01010101010',
            email: 'ahmed.ali@gmail.com',
            address: '84 El-Tayraan street - Nasr City',
            bookingDate: '2025-12-15',
            service: 'Physiotherapy',
            bookingTime: '10:00 AM - 11:00 AM',
            status: 'VIP',
            level: 'High',
            injury: 'ACL Tear',
            sport: 'Football',
            acceptedReport: true,

            treatmentPlan: {
                planId: 'TP-2025-001',
                createdBy: 'Dr. Mohamed Ali',
                assignedDate: '2025-11-14',
                patientApproval: 'Approved',
                approvalDate: '2025-11-15',
                durationWeeks: 12,
                totalSessions: 36,
                sessionsPerWeek: 3,
                sessionsDone: 6,
                remaining: 30,
                currentPhase: 'Rehabilitation Phase',
                totalWeeks: 12,
                phases: [
                    {
                        phase: 'Phase 1: Pain & Swelling Control',
                        weeks: '1-2',
                        sessions: '1-6',
                        specializations: ['Physical Therapy'],
                        duration: 2
                    },
                    {
                        phase: 'Phase 2: Range of Motion',
                        weeks: '3-5',
                        sessions: '7-15',
                        specializations: ['Physical Therapy'],
                        duration: 3
                    },
                    {
                        phase: 'Phase 3: Strength Building',
                        weeks: '6-9',
                        sessions: '16-27',
                        specializations: ['Physical Therapy', 'Strength & Conditioning'],
                        duration: 4
                    },
                    {
                        phase: 'Phase 4: Functional Training',
                        weeks: '10-12',
                        sessions: '28-36',
                        specializations: ['Strength & Conditioning', 'Sports Performance'],
                        duration: null
                    }
                ]
            }
        }
    ];

    @Output() patientSelected = new EventEmitter<any>();

    selectPatient(patient: any) {
        this.selectedPatient = patient;
        this.patientSelected.emit(patient);
    }

    resetSelection() {
        this.selectedPatient = null;
        this.patientSelected.emit(null);
    }

    getSeverity(status: string | undefined) {
        switch (status) {
            case 'Low':
                return 'danger';
            case 'Moderate':
                return 'warn';
            case 'VIP':
                return 'success';
            default:
                return 'info';
        }
    }
}
