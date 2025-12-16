import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
    selector: 'app-report-preview',
    imports: [CommonModule, CardModule, ButtonModule, AccordionModule, TableModule, TagModule, PanelModule, FieldsetModule],
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

    getSessionsRange(count: any): number[] {
        const num = parseInt(count, 10);
        if (isNaN(num) || num <= 0) return [];
        return Array.from({ length: num }, (_, i) => i + 1);
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
