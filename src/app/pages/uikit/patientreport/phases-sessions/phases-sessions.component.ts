import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';

@Component({
    selector: 'app-phases-sessions',
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TableModule, AccordionModule, DividerModule, DropdownModule],
    templateUrl: './phases-sessions.component.html',
    styleUrl: './phases-sessions.component.scss'
})
export class PhasesSessionsComponent {
    @Input() phases: any[] = [];

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
                        time: 10,
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
            time: 10,
            coach: null,
            exercises: []
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
            rest: ''
        });
    }

    removeExercise(section: any, index: number) {
        section.exercises.splice(index, 1);
    }
}
