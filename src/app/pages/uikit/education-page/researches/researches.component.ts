import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TableColumn, TableComponent } from '../../../../shared/table/table.component';
import { EducationalContentService } from '../services/educationalContent.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-researches',
    standalone: true,
    providers: [MessageService, ConfirmationService],
    templateUrl: './researches.component.html',
    styleUrls: ['./researches.component.css'],
    imports: [TableComponent, ConfirmDialogModule, ToastModule]
})
export class ResearchesComponent implements OnInit {
    allResearchs: any[] = [];
    cols: TableColumn[] = [];
    @Output() edit = new EventEmitter<any>();
    constructor(
        private _educationalContentService: EducationalContentService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.getAllResearchs();
        this.cols = [
            { field: 'titleAr', label: 'Title Ar' },
            { field: 'titleEn', label: 'Title En' },
            { field: 'descriptionAr', label: 'Description Ar' },
            { field: 'descriptionEn', label: 'Description En' },
            { field: 'link', label: 'Link', type: 'link' }
        ];
    }

    //here is the function needed to get all added exercies
    getAllResearchs(): void {
        this._educationalContentService.getAllEducationalContent('Researchs').subscribe({
            next: (res: any) => {
                this.allResearchs = res;
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', detail: 'There is an error on fetch education categories' });
            }
        });
    }

    //here is the function needed to edit the selected research
    editResearch(ev: any): void {
        this.edit.emit(ev);
    }

    //here is the function needed to delete the selected research
    deleteSelectedResearch(ev: any): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${ev.titleEn}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this._educationalContentService.deleteEducationalContent('Researchs', ev.id).subscribe({
                    next: () => {
                        this.getAllResearchs();
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Research Deleted', life: 3000 });
                    },
                    error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
                });
            }
        });
    }
}
