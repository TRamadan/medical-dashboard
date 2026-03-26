import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    selector: 'app-plan-cofig',
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, InputTextarea, CheckboxModule],
    standalone: true,
    templateUrl: './plan-cofig.component.html',
    styleUrl: './plan-cofig.component.scss'
})
export class PlanCofigComponent implements OnInit {
    @Input() phases: any[] = [];
    @Output() phasesChange = new EventEmitter<any[]>();

    isTemplateSelected: boolean = false;

    useTemplate: boolean = false;
    selectedTemplate: any = null;

    specializationsOptions = [
        { label: 'Physical Therapist', selected: false },
        { label: 'Strength & Conditioning Coach', selected: false },
        { label: 'Sports Massage Therapist', selected: false },
        { label: 'Nutritionist', selected: false }
    ];

    createDefaultSpecializations() {
        return this.specializationsOptions.map((s) => ({ ...s, selected: false }));
    }

    templatePhases = [
        {
            id: 1,
            title: 'Phase 1: Pain & Swelling Control',
            weeks: 12,
            sessions: 12,
            objective: 'Reduce inflammation, protect healing tissue, gentle ROM exercises',
            specializations: this.createDefaultSpecializations(),
            ...this.createDefaultMeasurements()
        },
        {
            id: 2,
            title: 'Phase 2: Range of Motion',
            weeks: 12,
            sessions: 12,
            objective: 'Restore full range of motion, begin strengthening',
            specializations: this.createDefaultSpecializations(),
            ...this.createDefaultMeasurements()
        },
        {
            id: 3,
            title: 'Phase 3: Strength Building',
            weeks: 12,
            sessions: 12,
            objective: 'Increase muscle strength, focus on functional movements',
            specializations: this.createDefaultSpecializations(),
            ...this.createDefaultMeasurements()
        }
    ];

    templates = [
        {
            id: 1,
            title: 'ACL Reconstruction Protocol',
            subtitle: 'ACL Tear',
            description: 'Standard post-surgical ACL rehabilitation',
            duration: '12 weeks',
            frequency: '3x/week',
            phases: '4 phases'
        },
        {
            id: 2,
            title: 'Rotator Cuff Recovery',
            subtitle: 'Shoulder Injury',
            description: 'Non-surgical rotator cuff rehabilitation',
            duration: '10 weeks',
            frequency: '2x/week',
            phases: '3 phases'
        },
        {
            id: 3,
            title: 'Hamstring Strain Protocol',
            subtitle: 'Hamstring Injury',
            description: 'Grade 2 hamstring strain recovery',
            duration: '8 weeks',
            frequency: '3x/week',
            phases: '3 phases'
        }
    ];

    @Input() planConfig: any = { weeks: null, sessions: null, template: null };
    @Output() planConfigChange = new EventEmitter<any>();

    onConfigChange() {
        this.planConfigChange.emit(this.planConfig);
    }

    emitPhasesChange() {
        this.phasesChange.emit(this.phases);
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

    updatePhases() {
        if (this.isTemplateSelected) {
            // Deep clone to avoid reference issues with nested arrays
            this.phases = JSON.parse(JSON.stringify(this.templatePhases));
        } else {
            this.phases = [
                {
                    id: 1,
                    title: 'Phase 1',
                    weeks: 0,
                    sessions: 0,
                    objective: '',
                    specializations: this.createDefaultSpecializations(),
                    ...this.createDefaultMeasurements()
                }
            ];
        }

        this.emitPhasesChange();
    }

    addPhase() {
        const nextId = this.phases.length + 1;
        this.phases.push({
            id: nextId,
            title: `Phase ${nextId}: New Phase`,
            weeks: 0,
            sessions: 0,
            objective: '',
            specializations: this.createDefaultSpecializations(),
            ...this.createDefaultMeasurements()
        });

        this.emitPhasesChange();
    }

    removePhase(index: number) {
        if (index > 0) {
            this.phases.splice(index, 1);
            this.emitPhasesChange();
        }
    }

    selectTemplate(template: any) {
        this.selectedTemplate = template;
        this.planConfig.template = template;

        // Extract number of weeks from duration string (e.g. "12 weeks" -> 12)
        const weeks = parseInt(template.duration);
        this.planConfig.weeks = isNaN(weeks) ? null : weeks;

        // Extract frequency per week (e.g. "3x/week" -> 3)
        const frequencyMatch = template.frequency.match(/(\d+)x/);
        const frequency = frequencyMatch ? parseInt(frequencyMatch[1]) : 0;

        // Calculate total sessions
        if (this.planConfig.weeks && frequency) {
            this.planConfig.sessions = this.planConfig.weeks * frequency;
        } else {
            this.planConfig.sessions = null;
        }

        this.isTemplateSelected = true;
        this.updatePhases();
        this.onConfigChange();
    }

    onToggleTemplate() {
        if (!this.useTemplate) {
            this.selectedTemplate = null;
            this.planConfig.template = null;
            this.planConfig.weeks = null;
            this.planConfig.sessions = null;

            this.isTemplateSelected = false;
            this.updatePhases();
            this.onConfigChange();
        }
    }

    ngOnInit() {
        this.normalizePhases();
    }

    private normalizePhases() {
        if (!Array.isArray(this.phases)) return;
        for (const phase of this.phases) {
            if (!phase.specializations) {
                phase.specializations = this.createDefaultSpecializations();
            }
        }
    }
}
