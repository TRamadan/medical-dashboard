import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-report-preview',
    imports: [CommonModule, CardModule, ButtonModule, AccordionModule, TableModule, TagModule, PanelModule, FieldsetModule, InputTextModule, DropdownModule, FormsModule],
    standalone: true,
    templateUrl: './report-preview.component.html',
    styleUrl: './report-preview.component.scss'
})
export class ReportPreviewComponent {
    @Input() data: any;
    @Output() back = new EventEmitter<void>();

    onBack() {
        this.back.emit();
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

    getExercises(phase: any, sessionNum: number) {
        if (phase.sessionData && phase.sessionData[sessionNum]) {
            // Flatten sections to get all exercises
            const sections = phase.sessionData[sessionNum].sections || [];
            return sections;
        }
        return [];
    }
}
