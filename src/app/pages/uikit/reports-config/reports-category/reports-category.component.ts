import { Component, OnInit } from '@angular/core';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TableColumn, TableComponent } from '../../../../shared/table/table.component';
import { Category } from '../models/reporttemplates';
import { ReportsCategoryService } from '../services/reportsCategory.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Card } from 'primeng/card';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-reports-category',
    templateUrl: './reports-category.component.html',
    styleUrls: ['./reports-category.component.css'],
    standalone: true,
    providers: [ConfirmationService, MessageService],
    imports: [Toast, ConfirmDialog, TableComponent, Card]
})
export class ReportsCategoryComponent implements OnInit {
    categories: Category[] = [];
    parsedCategories: any[] = [];
    cols: TableColumn[] = [];
    isEditMode: boolean = false;
    selectedCategory: Category | null = null;
    categoryForm!: FormGroup;
    categoryDialog: boolean = false;
    private arabicCharsRegex = /^[\u0600-\u06FF\s\-_&]+$/;
    private englishCharsRegex = /^[a-zA-Z\s\-_&]+$/;

    constructor(
        private _reportCategoryService: ReportsCategoryService,
        private messageService: MessageService,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.cols = [
            { field: 'nameAr', label: 'Category Ar' },
            { field: 'nameEn', label: 'Category En' }
        ];
        this.categoryForm = this.fb.group({
            id: [null],
            nameAr: ['', [Validators.required, Validators.pattern(this.arabicCharsRegex)]],
            nameEn: ['', [Validators.required, Validators.pattern(this.englishCharsRegex)]]
        });
    }

    getAllCategories(): void {
        this._reportCategoryService.getAllCategories().subscribe({
            next: (res: any) => {
                this.categories = res;
                this.parsedCategories = [];
                this.parsedCategories = res.map((element: any) => {
                    return {
                        id: element.id,
                        name: element.nameEn
                    };
                });
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', detail: 'There is an error on fetch education categories' });
            }
        });
    }

    editCategory(category: Category) {
        this.isEditMode = true;
        this.selectedCategory = { ...category };
        this.categoryForm.patchValue(this.selectedCategory);
        this.categoryDialog = true;
    }

    deleteCategory(category: Category) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${category.nameEn}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this._reportCategoryService.deleteCategory(category.id!).subscribe({
                    next: () => {
                        this.getAllCategories();
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Category Deleted', life: 3000 });
                    },
                    error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
                });
            }
        });
    }

    //here is the function needed to open the dialog for add a new category
    openAddCategoryDialog(): void {
        this.categoryDialog = true;
    }
}
