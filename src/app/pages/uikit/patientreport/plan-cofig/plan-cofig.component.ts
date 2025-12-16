import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    selector: 'app-plan-cofig',
    imports: [CommonModule, FormsModule, CardModule, InputTextModule, CheckboxModule],
    standalone: true,
    templateUrl: './plan-cofig.component.html',
    styleUrl: './plan-cofig.component.scss'
})
export class PlanCofigComponent {
    @Output() templateChange = new EventEmitter<boolean>();
    useTemplate: boolean = false;
    selectedTemplate: any = null;

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

    numberOfWeeks: number | null = null;
    numberOfSessions: number | null = null;

    @Input() planConfig: any = { weeks: null, sessions: null, template: null };
    @Output() planConfigChange = new EventEmitter<any>();

    selectTemplate(template: any) {
        this.selectedTemplate = template;
        this.planConfig.template = template;

        // Extract number of weeks from duration string (e.g. "12 weeks" -> 12)
        const weeks = parseInt(template.duration);
        this.numberOfWeeks = isNaN(weeks) ? null : weeks;
        this.planConfig.weeks = this.numberOfWeeks;

        // Extract frequency per week (e.g. "3x/week" -> 3)
        const frequencyMatch = template.frequency.match(/(\d+)x/);
        const frequency = frequencyMatch ? parseInt(frequencyMatch[1]) : 0;

        // Calculate total sessions
        if (this.numberOfWeeks && frequency) {
            this.numberOfSessions = this.numberOfWeeks * frequency;
            this.planConfig.sessions = this.numberOfSessions;
        } else {
            this.numberOfSessions = null;
            this.planConfig.sessions = null;
        }

        this.templateChange.emit(true);
        this.planConfigChange.emit(this.planConfig);
    }

    onToggleTemplate() {
        if (!this.useTemplate) {
            this.selectedTemplate = null;
            this.numberOfWeeks = null;
            this.numberOfSessions = null;

            this.planConfig.template = null;
            this.planConfig.weeks = null;
            this.planConfig.sessions = null;

            this.templateChange.emit(false);
            this.planConfigChange.emit(this.planConfig);
        }
    }
}
