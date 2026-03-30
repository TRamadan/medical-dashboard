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
import { MeasurementTemplatesService } from '../measurements-config/services/measurement-templates.service';
import { OnInit } from '@angular/core';

@Component({
    selector: 'app-phases-sessions',
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, InputTextarea, TableModule, AccordionModule, DividerModule, DropdownModule, CardModule, TagModule, TooltipModule],
    templateUrl: './phases-sessions.component.html',
    styleUrl: './phases-sessions.component.scss'
})
export class PhasesSessionsComponent implements OnInit {
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
                {
                    id: 1,
                    title: 'Phase 1: Foundation',
                    weeksCount: 4,
                    sessionsPerWeek: 3,
                    selectedSessionTab: 1,
                    selectedSessions: [1, 5, 10]
                },
                {
                    id: 2,
                    title: 'Phase 2: Strength Building',
                    weeksCount: 6,
                    sessionsPerWeek: 3,
                    selectedSessionTab: 1,
                    selectedSessions: [2, 8]
                },
                {
                    id: 3,
                    title: 'Phase 3: Advanced Training',
                    weeksCount: 2,
                    sessionsPerWeek: 2,
                    selectedSessionTab: 1,
                    selectedSessions: []
                }
            ]
        },

        {
            id: 'PT-202227',
            name: 'Sara Ahmed',
            age: '42 Years',
            gender: 'Female',
            mobile: '01030303030',
            email: 'sara.ahmed@gmail.com',
            address: '25 Heliopolis - Cairo',
            bookingDate: '2025-12-17',
            service: 'Physiotherapy',
            bookingTime: '03:00 PM - 04:00 PM',
            status: 'VIP',
            level: 'High',
            injury: 'Shoulder Injury',
            sport: 'Swimming',
            acceptedReport: true,
            reportPhases: [
                {
                    id: 1,
                    title: 'Phase 1: Initial Assessment',
                    weeksCount: 2,
                    sessionsPerWeek: 2,
                    selectedSessionTab: 1,
                    selectedSessions: [1, 4]
                },
                {
                    id: 2,
                    title: 'Phase 2: Progressive Training',
                    weeksCount: 4,
                    sessionsPerWeek: 3,
                    selectedSessionTab: 1,
                    selectedSessions: [3, 7]
                },
                {
                    id: 3,
                    title: 'Phase 3: Performance',
                    weeksCount: 4,
                    sessionsPerWeek: 2,
                    selectedSessionTab: 1,
                    selectedSessions: []
                }
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

    availableTemplates: any[] = [];

    constructor(private measurementTemplatesService: MeasurementTemplatesService) {}

    ngOnInit() {
        this.measurementTemplatesService.getAllTemplates().subscribe({
            next: (data) => {
                this.availableTemplates = data;
            },
            error: (err) => console.error('Failed to load measurement templates', err)
        });
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

    selectedCoach: string | null = null;

    coaches = [
        { label: 'Coach 1', value: '1' },
        { label: 'Coach 2', value: '2' },
        { label: 'Coach 3', value: '3' }
    ];

    getSelectedCoachLabel(): string {
        const coach = this.coaches.find(c => c.value === this.selectedCoach);
        return coach ? coach.label : '';
    }

    getSessionsRange(count: any): number[] {
        const num = parseInt(count, 10);
        if (isNaN(num) || num <= 0) return [];
        return Array.from({ length: num }, (_, i) => i + 1);
    }

    ensureSessionData(phase: any, sessionNum: number) {
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
    }

    getSessionMode(phase: any, sessionNum: number): 'exercises' | 'measurements' {
        this.ensureSessionData(phase, sessionNum);
        
        if (!phase.sessionData[sessionNum].mode) {
            const isMeasurement = this.isSessionPredefined(phase, sessionNum);
            phase.sessionData[sessionNum].mode = isMeasurement ? 'measurements' : 'exercises';
        }
        
        return phase.sessionData[sessionNum].mode;
    }

    /**
     * Returns true if the session was pre-defined as a measurement session
     * from the Plan Configuration step. When true, the toggle should be locked/disabled.
     */
    isSessionPredefined(phase: any, sessionNum: number): boolean {
        return (phase.selectedSessions && phase.selectedSessions.includes(sessionNum)) ||
               (phase.measurementSessions && phase.measurementSessions.includes(sessionNum));
    }

    setSessionMode(phase: any, sessionNum: number, mode: 'exercises' | 'measurements') {
        this.ensureSessionData(phase, sessionNum);
        phase.sessionData[sessionNum].mode = mode;
    }

    setSessionMeasurementTemplate(phase: any, sessionNum: number, template: any) {
        this.ensureSessionData(phase, sessionNum);
        if (phase.sessionData[sessionNum].measurementTemplate?.id === template.id) {
            phase.sessionData[sessionNum].measurementTemplate = null;
        } else {
            phase.sessionData[sessionNum].measurementTemplate = template;
        }
    }

    getSections(phase: any, sessionNum: number) {
        this.ensureSessionData(phase, sessionNum);
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
                    tool: '',
                    description: '',
                    sets: '1',
                    reps: [''],
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
            tool: '',
            description: '',
            sets: '1',
            reps: [''],
            intensity: '',
            tempo: '',
            rest: '',
            videoUrl: ''
        });
    }

    getRepArray(ex: any): number[] {
        const numSets = parseInt(ex.sets, 10);
        const count = isNaN(numSets) || numSets <= 0 ? 1 : Math.min(numSets, 10);
        
        if (!Array.isArray(ex.reps)) ex.reps = [ex.reps || ''];
        
        while (ex.reps.length < count) ex.reps.push('');
        
        return Array.from({length: count}, (_, i) => i);
    }

    removeExercise(section: any, index: number) {
        section.exercises.splice(index, 1);
    }

    // Validation method to check if section can be saved
    isSectionValid(section: any): boolean {
        // Check if section has at least one exercise
        if (!section.exercises || section.exercises.length === 0) {
            return false;
        }

        // Check if all exercises have required fields filled
        return section.exercises.every((exercise: any) => {
            const hasReps = Array.isArray(exercise.reps) ? exercise.reps.some((r: any) => r && r.toString().trim() !== '') : exercise.reps && exercise.reps.toString().trim() !== '';
            return exercise.name && exercise.name.trim() !== '' && exercise.sets && exercise.sets.toString().trim() !== '' && hasReps;
        });
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
