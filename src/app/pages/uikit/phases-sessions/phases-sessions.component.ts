import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-phases-sessions',
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, InputTextarea, TableModule, AccordionModule, DividerModule, DropdownModule, CardModule, TagModule, TooltipModule],
    templateUrl: './phases-sessions.component.html',
    styleUrl: './phases-sessions.component.scss'
})
export class PhasesSessionsComponent {
    @Input() phases: any[] = [];

    selectedPatient: any = null;

    patients = [
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
            reportPhases: [
                { id: 1, title: 'Initial Recovery Phase', weeks: 4, sessions: 12, weeksCount: undefined, sessionsPerWeek: undefined, selectedSessionTab: 1 },
                { id: 2, title: 'Strengthening Phase', weeks: 6, sessions: 18, weeksCount: undefined, sessionsPerWeek: undefined, selectedSessionTab: 1 },
                { id: 3, title: 'Return to Sport Phase', weeks: 4, sessions: 12, weeksCount: undefined, sessionsPerWeek: undefined, selectedSessionTab: 1 }
            ]
        },
        {
            id: 'PT-202226',
            name: 'Sarah Mohamed',
            age: '28 Years',
            gender: 'Female',
            mobile: '01020202020',
            email: 'sarah.mohamed@gmail.com',
            address: '15 Tahrir Square - Cairo',
            bookingDate: '2025-12-16',
            service: 'Consultation',
            bookingTime: '01:00 PM - 02:00 PM',
            status: 'Moderate',
            level: 'Moderate',
            injury: 'Ankle Sprain',
            sport: 'Tennis',
            acceptedReport: true,
            reportPhases: [
                { id: 1, title: 'Acute Phase', weeks: 2, sessions: 6, weeksCount: undefined, sessionsPerWeek: undefined, selectedSessionTab: 1 },
                { id: 2, title: 'Rehabilitation Phase', weeks: 4, sessions: 12, weeksCount: undefined, sessionsPerWeek: undefined, selectedSessionTab: 1 }
            ]
        },

        {
            id: 'PT-202228',
            name: 'Sarah Mohamed',
            age: '28 Years',
            gender: 'Female',
            mobile: '01020202020',
            email: 'sarah.mohamed@gmail.com',
            address: '15 Tahrir Square - Cairo',
            bookingDate: '2025-12-16',
            service: 'Consultation',
            bookingTime: '01:00 PM - 02:00 PM',
            // status missing in original, defaulting
            status: 'Moderate',
            level: 'Low',
            injury: 'Muscle Strain',
            sport: 'Running',
            acceptedReport: true,
            reportPhases: [
                { id: 1, title: 'Recovery Phase', weeks: 3, sessions: 9, weeksCount: undefined, sessionsPerWeek: undefined, selectedSessionTab: 1 },
                { id: 2, title: 'Progressive Loading Phase', weeks: 3, sessions: 9, weeksCount: undefined, sessionsPerWeek: undefined, selectedSessionTab: 1 }
            ]
        }
    ];

    selectPatient(patient: any) {
        this.selectedPatient = patient;
    }

    resetSelection() {
        this.selectedPatient = null;
    }

    selectedPhase: any = null;

    selectPhase(phase: any) {
        this.selectedPhase = phase;
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

    coaches = [
        { label: 'Coach 1', value: '1' },
        { label: 'Coach 2', value: '2' },
        { label: 'Coach 3', value: '3' }
    ];

    getSessionsRange(count: any): number[] {
        const num = parseInt(count, 10);
        if (isNaN(num) || num <= 0) return [];
        return Array.from({ length: num }, (_, i) => i + 1);
    }

    getSections(phase: any, sessionNum: number) {
        if (!phase.sessionData) {
            phase.sessionData = {};
        }
        if (!phase.sessionData[sessionNum]) {
            phase.sessionData[sessionNum] = {
                sections: [
                    {
                        title: 'Warm Up',
                        time: '',
                        coach: null,
                        exercises: []
                    }
                ]
            };
        }
        return phase.sessionData[sessionNum].sections;
    }

    addSection(phase: any, sessionNum: number) {
        const sections = this.getSections(phase, sessionNum);
        sections.push({
            title: 'New Section',
            time: '',
            coach: null,
            exercises: [
                {
                    name: '',
                    description: '',
                    sets: '',
                    reps: '',
                    intensity: '',
                    tempo: '',
                    rest: '',
                    videoUrl: ''
                }
            ]
        });
    }

    removeSection(phase: any, sessionNum: number, index: number) {
        const sections = this.getSections(phase, sessionNum);
        sections.splice(index, 1);
    }

    addExercise(section: any) {
        section.exercises.push({
            name: '',
            description: '',
            sets: '',
            reps: '',
            intensity: '',
            tempo: '',
            rest: '',
            videoUrl: ''
        });
    }

    removeExercise(section: any, index: number) {
        section.exercises.splice(index, 1);
    }

    // Helper methods for week/session calculations
    getWeeksRange(weeksCount: any): number[] {
        const num = parseInt(weeksCount, 10);
        if (isNaN(num) || num <= 0) return [];
        return Array.from({ length: num }, (_, i) => i + 1);
    }

    getTotalSessions(weeksCount: any, sessionsPerWeek: any): number {
        const weeks = parseInt(weeksCount, 10);
        const sessions = parseInt(sessionsPerWeek, 10);
        if (isNaN(weeks) || isNaN(sessions)) return 0;
        return weeks * sessions;
    }

    getSessionNumber(weekNum: number, sessionInWeek: number, sessionsPerWeek: any): number {
        const perWeek = parseInt(sessionsPerWeek, 10);
        return (weekNum - 1) * perWeek + sessionInWeek;
    }

    getWeekForSession(sessionNum: number, sessionsPerWeek: any): number {
        const perWeek = parseInt(sessionsPerWeek, 10);
        if (isNaN(perWeek) || perWeek <= 0) return 1;
        return Math.ceil(sessionNum / perWeek);
    }

    selectSessionTab(phase: any, sessionNum: number) {
        phase.selectedSessionTab = sessionNum;
    }

    updateTotalSessions(phase: any) {
        const total = this.getTotalSessions(phase.weeksCount, phase.sessionsPerWeek);
        phase.sessions = total;
        // Reset selected tab if it's beyond the new total
        if (phase.selectedSessionTab > total) {
            phase.selectedSessionTab = 1;
        }
    }

    getSessionsInWeekRange(sessionsPerWeek: any): number[] {
        const num = parseInt(sessionsPerWeek, 10);
        if (isNaN(num) || num <= 0) return [];
        return Array.from({ length: num }, (_, i) => i + 1);
    }
}
