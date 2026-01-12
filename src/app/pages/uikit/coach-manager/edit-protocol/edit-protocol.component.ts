import { Component, Input } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { TabViewModule } from 'primeng/tabview';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-edit-protocol',
    imports: [AccordionModule, TabViewModule, CommonModule, FormsModule, ButtonModule, TableModule, InputTextModule, DropdownModule, TooltipModule, InputNumberModule, TagModule],
    standalone: true,
    templateUrl: './edit-protocol.component.html',
    styleUrl: './edit-protocol.component.scss'
})
export class EditProtocolComponent {
    @Input() selectedPatient: any;

    coaches: any[] = [
        { label: 'Ahmed Coach', value: 'Ahmed Coach' },
        { label: 'Sarah Coach', value: 'Sarah Coach' }
    ];

    intensityOptions: any[] = [
        { label: 'Low', value: 'Low' },
        { label: 'Moderate', value: 'Moderate' },
        { label: 'High', value: 'High' }
    ];

    addSection(session: any) {
        if (!session.sections) {
            session.sections = [];
        }
        session.sections.push({
            name: 'New Section',
            time: 10,
            coachManager: null,
            exercises: []
        });
        // Add at least one exercise to the new section
        this.addExercise(session.sections[session.sections.length - 1]);
    }

    addExercise(section: any) {
        if (!section.exercises) {
            section.exercises = [];
        }
        section.exercises.push({
            name: '',
            description: '',
            sets: 3,
            reps: 10,
            intensity: 'Moderate',
            tempo: '2-0-2',
            rest: '60s',
            videoUrl: ''
        });
    }

    removeExercise(section: any, index: number) {
        section.exercises.splice(index, 1);
    }

    getSeverity(status: string | undefined) {
        switch (status) {
            case 'Low':
                return 'danger';
            case 'Moderate':
                return 'warn';
            case 'High':
                return 'success';
            default:
                return 'info';
        }
    }
}
