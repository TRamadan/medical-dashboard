import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TableColumn, TableComponent } from '../../../../shared/table/table.component';
import { Exercises } from '../models/educationcontent';
import { EducationalContentService } from '../services/educationalContent.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-exercies',
    standalone: true,
    providers: [MessageService, ConfirmationService],
    templateUrl: './exercies.component.html',
    styleUrls: ['./exercies.component.css'],
    imports: [TableComponent, ConfirmDialogModule, ToastModule]
})
export class ExerciesComponent implements OnInit {
    @Input() allExercies: Exercises[] = [];
    @Output() edit = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<void>();
    cols: TableColumn[] = [];
    constructor(
        private _educationalContentService: EducationalContentService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.cols = [
            { field: 'titleAr', label: 'Title Ar' },
            { field: 'titleEn', label: 'Title En' },
            { field: 'file', label: 'File', type: 'link' }
        ];
        this.getAllExercies();
    }

    //here is the function needed to edit the selected exercise
    editExercies(exercise: Exercises): void {
        this.edit.emit(exercise);
    }

    //here is the function needed to get all exercies
    getAllExercies(): void {
        this._educationalContentService.getAllEducationalContent('ExercisePrograms').subscribe({
            next: (res: any) => {
                this.allExercies = res;
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', detail: 'There is an error on fetch needed exercies' });
            }
        });
    }

    //here is the function needed to delete the selected exercise
    deleteExercise(exercise: Exercises): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${exercise.titleEn}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this._educationalContentService.deleteEducationalContent('ExercisePrograms', exercise.id).subscribe(
                    () => {
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Exercise Deleted', life: 3000 });
                        this.getAllExercies();
                    },
                    (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
                );
            }
        });
    }
}
