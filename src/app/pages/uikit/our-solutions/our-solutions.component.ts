import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '../../../shared/table/table.component';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SolutionsCategoryService } from './services/solutionsCategory.service';
import { Solutioncategories } from './models/solutioncategories';
import { environment } from '../../../../environments/environment';
import { SolutionsService } from './services/solutions.service';
import { SelectModule } from 'primeng/select';
import { Solution } from './models/solutions';

@Component({
    selector: 'app-our-solutions',
    standalone: true,
    imports: [CommonModule, TableComponent, CardModule, ToastModule, ConfirmDialogModule, ToolbarModule, ButtonModule, DialogModule, ReactiveFormsModule, SelectModule],
    templateUrl: './our-solutions.component.html',
    styleUrls: ['./our-solutions.component.css'],
    providers: [ConfirmationService, MessageService]
})
export class OurSolutionsComponent implements OnInit {
    public readonly imgUrl = environment.imgUrlWebsite;
    categories: Solutioncategories[] = [];
    cols: TableColumn[] = [];

    // Category Dialog
    categoryDialog: boolean = false;
    isEditMode: boolean = false;
    categoryForm!: FormGroup;
    selectedCategory: Solutioncategories | null = null;

    // Solution Dialog
    solutionDialog: boolean = false;
    isEditSolutionMode: boolean = false;
    solutionForm!: FormGroup;
    selectedSolution: Solution | null = null;

    private arabicCharsWithSpecialRegex = /^[\u0600-\u06FF\s\-_&.,!?'"]+$/;
    private englishCharsWithSpecialRegex = /^[a-zA-Z\s\-_&.,!?'"]+$/;
    private urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?(\?.*)?$/i;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private solutionsCategoryService: SolutionsCategoryService,
        private solutionsService: SolutionsService
    ) {}

    ngOnInit(): void {
        this.initForms();
        this.cols = [
            { field: 'nameAr', label: 'Category Ar' },
            { field: 'nameEn', label: 'Category En' }
        ];
        this.getAllCategories();
    }

    private initForms(): void {
        this.categoryForm = this.fb.group({
            id: [null],
            nameAr: ['', [Validators.required, Validators.pattern(this.arabicCharsWithSpecialRegex)]],
            nameEn: ['', [Validators.required, Validators.pattern(this.englishCharsWithSpecialRegex)]]
        });

        this.solutionForm = this.fb.group({
            id: [null],
            titleAr: ['', [Validators.required, Validators.pattern(this.arabicCharsWithSpecialRegex)]],
            titleEn: ['', [Validators.required, Validators.pattern(this.englishCharsWithSpecialRegex)]],
            descriptionAr: ['', [Validators.required, Validators.pattern(/^[\u0600-\u06FF0-9\s.,!?-]+$/)]],
            descriptionEn: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\s.,!?-]+$/)]],
            link: ['', [Validators.required, Validators.pattern(this.urlRegex)]],
            img: [null, Validators.required],
            solutionCategoryId: [null, Validators.required]
        });
    }

    // Categories CRUD
    getAllCategories(): void {
        this.solutionsCategoryService.getAllSolutionCategories().subscribe({
            next: (res) => (this.categories = res),
            error: (err) => this.messageService.add({ severity: 'error', detail: 'Error fetching solution categories' })
        });
    }

    openAddNewCategory(): void {
        this.isEditMode = false;
        this.categoryForm.reset();
        this.categoryDialog = true;
    }

    editCategory(category: Solutioncategories): void {
        this.isEditMode = true;
        this.selectedCategory = { ...category };
        this.categoryForm.patchValue(this.selectedCategory);
        this.categoryDialog = true;
    }

    deleteCategory(category: Solutioncategories): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${category.nameEn}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.solutionsCategoryService.deleteSolutionCategory(category.id).subscribe({
                    next: () => {
                        this.getAllCategories();
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Category Deleted', life: 3000 });
                    },
                    error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
                });
            }
        });
    }

    hideCategoryDialog(): void {
        this.categoryDialog = false;
        this.isEditMode = false;
        this.selectedCategory = null;
        this.categoryForm.reset();
    }

    submitCategory(): void {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }

        const categoryData = this.categoryForm.value;
        if (this.isEditMode) {
            this.solutionsCategoryService.updateSolutionCategory(categoryData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Category Updated', life: 3000 });
                    this.getAllCategories();
                    this.hideCategoryDialog();
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' })
            });
        } else {
            const { id, ...newCategoryData } = categoryData;
            this.solutionsCategoryService.createSolutionCategory(newCategoryData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Category Created', life: 3000 });
                    this.getAllCategories();
                    this.hideCategoryDialog();
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Create failed' })
            });
        }
    }

    // Solutions CRUD
    openAddNewSolution(category: Solutioncategories): void {
        this.isEditSolutionMode = false;
        this.solutionForm.reset();
        this.solutionForm.patchValue({ solutionCategoryId: category.id });
        this.solutionDialog = true;
    }

    hideSolutionDialog(): void {
        this.solutionDialog = false;
        this.solutionForm.reset();
    }

    editSolution(solution: Solution, category: Solutioncategories): void {
        this.isEditSolutionMode = true;
        this.solutionDialog = true;
        this.selectedSolution = { ...solution };
        this.solutionForm.patchValue(this.selectedSolution);
        this.solutionForm.get('img')?.clearValidators();
        this.solutionForm.get('img')?.updateValueAndValidity();
    }

    deleteSolution(solution: Solution): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${solution.titleEn}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.solutionsService.deleteSolution(solution.id).subscribe({
                    next: () => {
                        this.getAllCategories();
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Solution Deleted', life: 3000 });
                    },
                    error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
                });
            }
        });
    }

    submitSolution(): void {
        if (this.solutionForm.invalid) {
            this.solutionForm.markAllAsTouched();
            return;
        }

        const formData = new FormData();
        Object.keys(this.solutionForm.controls).forEach((key) => {
            const control = this.solutionForm.get(key);
            if (control) {
                formData.append(key, control.value);
            }
        });

        if (this.isEditSolutionMode && this.selectedSolution) {
            formData.append('id', this.selectedSolution.id.toString());
            // The service expects Solution, not FormData. Let's send an object.
            const solutionData = this.solutionForm.value;
            this.solutionsService.updateSolution(this.selectedSolution.id, solutionData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Solution Updated', life: 3000 });
                    this.getAllCategories();
                    this.hideSolutionDialog();
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' })
            });
        } else {
            // The service expects Solution, not FormData. Let's send an object.
            const { id, ...newSolutionData } = this.solutionForm.value;
            this.solutionsService.createSolution(newSolutionData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Solution Created', life: 3000 });
                    this.getAllCategories();
                    this.hideSolutionDialog();
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Create failed' })
            });
        }
    }
}
