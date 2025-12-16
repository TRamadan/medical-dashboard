import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

import { AccordionModule } from 'primeng/accordion';
import { DropdownModule } from 'primeng/dropdown';

@Component({
    selector: 'app-phases-protocol',
    imports: [CommonModule, FormsModule, CardModule, InputTextModule, InputTextarea, ButtonModule, CheckboxModule, AccordionModule, DropdownModule],
    standalone: true,
    templateUrl: './phases-protocol.component.html',
    styleUrl: './phases-protocol.component.scss'
})
export class PhasesProtocolComponent implements OnChanges {
    @Input() isTemplateSelected: boolean = false;

    @Input() phases: any[] = [];
    @Output() phasesChange = new EventEmitter<any[]>();

    coaches = [
        { label: 'Coach 1', value: '1' },
        { label: 'Coach 2', value: '2' },
        { label: 'Coach 3', value: '3' }
    ];

    getSections(phase: any, sessionNum: number) {
        if (!phase.sessionData) {
            phase.sessionData = {};
        }
        if (!phase.sessionData[sessionNum]) {
            phase.sessionData[sessionNum] = {
                sections: [
                    {
                        title: 'Section 1',
                        time: 12,
                        coach: null,
                        exercises: [this.createNewExercise(1)]
                    }
                ]
            };
        }
        return phase.sessionData[sessionNum].sections;
    }

    createNewExercise(id: number) {
        return {
            id: id,
            name: '',
            description: '',
            sets: '',
            reps: '',
            intensity: '',
            tempo: '',
            rest: ''
        };
    }

    addExercise(section: any) {
        section.exercises.push(this.createNewExercise(section.exercises.length + 1));
    }

    createDefaultMeasurements() {
        return {
            measurementCategories: [
                { label: 'Cat 1', selected: false, value: '' },
                { label: 'Cat 2', selected: false, value: '' },
                { label: 'Cat 3', selected: false, value: '' },
                { label: 'Cat 4', selected: false, value: '' }
            ],
            measurementItems: [
                { label: 'Range Of Motion', selected: false, value: '' },
                { label: 'Range Of Motion', selected: false, value: '' },
                { label: 'Range Of Motion', selected: false, value: '' }
            ],
            repeatMeasurement: false,
            repeatSessionNumber: '',
            activeSession: 1
        };
    }

    getSessionsRange(count: any): number[] {
        const num = parseInt(count, 10);
        if (isNaN(num) || num <= 0) return [];
        return Array.from({ length: num }, (_, i) => i + 1);
    }

    templatePhases = [
        {
            id: 1,
            title: 'Phase 1: Pain & Swelling Control',
            weeks: 12,
            sessions: 12,
            objective: 'Reduce inflammation, protect healing tissue, gentle ROM exercises',
            ...this.createDefaultMeasurements()
        },
        {
            id: 2,
            title: 'Phase 2: Range of Motion',
            weeks: 12,
            sessions: 12,
            objective: 'Restore full range of motion, begin strengthening',
            ...this.createDefaultMeasurements()
        },
        {
            id: 3,
            title: 'Phase 3: Strength Building',
            weeks: 12,
            sessions: 12,
            objective: 'Increase muscle strength, focus on functional movements',
            ...this.createDefaultMeasurements()
        }
    ];

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isTemplateSelected']) {
            this.updatePhases();
        }
    }

    emitChanges() {
        this.phasesChange.emit(this.phases);
    }

    updatePhases() {
        if (this.isTemplateSelected) {
            // Clone template phases to avoid reference issues
            // We need deep clone now because of nested arrays
            this.phases = JSON.parse(JSON.stringify(this.templatePhases));
        } else {
            // Reset to a single blank phase for custom creation
            this.phases = [
                {
                    id: 1,
                    title: 'Phase 1',
                    weeks: 0,
                    sessions: 0,
                    objective: '',
                    ...this.createDefaultMeasurements()
                }
            ];
        }
        this.emitChanges();
    }

    specializations = [
        { label: 'Physical Therapist', selected: false },
        { label: 'Strength & Conditioning Coach', selected: false },
        { label: 'Sports Massage Therapist', selected: false },
        { label: 'Nutritionist', selected: false }
    ];

    addPhase() {
        const nextId = this.phases.length + 1;
        this.phases.push({
            id: nextId,
            title: `Phase ${nextId}: New Phase`,
            weeks: 0,
            sessions: 0,
            objective: '',
            ...this.createDefaultMeasurements()
        });
        this.emitChanges();
    }

    removePhase(index: number) {
        if (index > 0) {
            this.phases.splice(index, 1);
            this.emitChanges();
        }
    }
}
