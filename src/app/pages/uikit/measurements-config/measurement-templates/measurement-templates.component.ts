import { Component, OnInit } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { MeasurementTemplatesService } from '../services/measurement-templates.service';

@Component({
    selector: 'app-measurement-templates',
    standalone: true,
    imports: [CommonModule, ToastModule, ToolbarModule, ButtonModule, CardModule],
    templateUrl: './measurement-templates.component.html',
    styleUrl: './measurement-templates.component.scss',
    providers: [MessageService]
})
export class MeasurementTemplatesComponent implements OnInit {
    templates: any[] = [];

    constructor(
        private measurementTemplatesService: MeasurementTemplatesService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadTemplates();
    }

    loadTemplates() {
        this.measurementTemplatesService.getAllTemplates().subscribe({
            next: (data) => {
                this.templates = data;
                // Mock tags for design if needed, or assume backend sends them
                this.templates.forEach((t) => {
                    if (!t.previewItems) t.previewItems = [];
                });
            },
            error: (err) => {
                console.error('Error loading templates', err);
                // Mock data for display verification if backend is down
                this.templates = [
                    {
                        id: 1,
                        name: 'Shoulder Assessment Form',
                        description: 'Comprehensive shoulder evaluation including patient info, self-evaluation, ROM, signs, and instability tests based on HSAM ZIDAN clinical form.',
                        date: 'Jan 1, 2026',
                        itemsCount: 89,
                        previewItems: ['Unknown', 'Unknown', 'Unknown', 'Unknown']
                    },
                    {
                        id: 2,
                        name: 'test',
                        description: 'sgsgsgsg',
                        date: 'Jan 11, 2026',
                        itemsCount: 5,
                        previewItems: ['Shoulder Flexion', 'Shoulder Extension', 'Shoulder Abduction', 'Does pain occur at rest?']
                    }
                ];
            }
        });
    }

    deleteTemplate(id: number) {
        this.measurementTemplatesService.deleteTemplate(id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Template deleted successfully' });
                this.loadTemplates();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete template' });
                console.error(err);
            }
        });
    }

    // Placeholder for editing items (green button)
    editItems(template: any) {
        console.log('Edit items for', template);
    }

    // Placeholder for editing template metadata (pencil)
    editTemplate(template: any) {
        console.log('Edit template', template);
    }
}
