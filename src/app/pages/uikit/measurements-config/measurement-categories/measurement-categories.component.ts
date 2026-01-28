import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { RippleModule } from 'primeng/ripple';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MessageService } from 'primeng/api';

import { MeasurementCategoriesService } from '../services/measurement-categories.service';

import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { MeasurementTemplatesComponent } from '../measurement-templates/measurement-templates.component';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
@Component({
    selector: 'app-measurement-categories',
    imports: [
        ReactiveFormsModule,
        CardModule,
        TagModule,
        CommonModule,
        FormsModule,
        ButtonModule,
        ToolbarModule,
        ToastModule,
        SelectButtonModule,
        AccordionModule,
        RippleModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        DropdownModule,
        InputNumberModule,
        TooltipModule,
        MeasurementTemplatesComponent
    ],
    templateUrl: './measurement-categories.component.html',
    styleUrl: './measurement-categories.component.scss',
    providers: [MessageService]
})
export class MeasurementCategoriesComponent {
    // ... options and value ...
    options = [
        { label: 'Templates', value: 'templates', icon: 'pi pi-file' },
        { label: 'Categories & Items', value: 'categories', icon: 'pi pi-database' }
    ];

    value: string = 'categories';

    form!: FormGroup;

    categories: any[] = [];
    displayDialog: boolean = false;
    displaySubCategoryDialog: boolean = false;
    displayMeasurementDialog: boolean = false;
    isEditingCategory: boolean = false;

    newCategory: { id?: number; name: string; description: string; type: number } = { name: '', description: '', type: 1 };
    newSubCategory: { id?: number; name: string; description: string; categoryId: number } = { name: '', description: '', categoryId: 0 };
    newMeasurement: any = this.getEmptyMeasurement(); // Helper to initialize

    selectedParentCategory: any = null;
    selectedSubCategory: any = null;
    isEditingSubCategory: boolean = false;
    isEditingMeasurement: boolean = false;

    types = [
        { label: 'Numeric', value: 1 },
        { label: 'Yes/No', value: 2 }
    ];

    inputTypes = [
        { label: 'Number', value: 1 },
        { label: 'Boolean', value: 2 },
        { label: 'Scale', value: 3 },
        { label: 'Text', value: 4 }
    ];

    subjectiveAnswerTypes = [
        { label: 'YesNo', value: 1 },
        { label: 'Radio', value: 2 },
        { label: 'Checkbox', value: 3 }
    ];

    constructor(
        private measurementCategoriesService: MeasurementCategoriesService,
        private messageService: MessageService,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.loadCategories();
        this.form = this.fb.group({
            options: this.fb.array([this.createOption()]) // ✅ initial input
        });
    }

    neededMeasurementOptions: any[] = [];
    get measurementOptions(): FormArray {
        return this.form.get('options') as FormArray;
    }

    createOption(): any {
        return this.fb.control('', Validators.required);
    }

    addOption() {
        this.measurementOptions.push(this.createOption());
    }

    removeOption(index: number) {
        debugger;
        if (this.measurementOptions.length > 1) {
            this.measurementOptions.removeAt(index);
        }
    }

    loadCategories() {
        this.measurementCategoriesService.getAllCategories().subscribe((data) => {
            this.categories = data;
            this.categories.forEach((c) => {
                if (c.type === 1) {
                    // Objective
                    c.icon = 'pi pi-chart-line';
                    c.iconBg = 'bg-blue-100';
                    c.iconColor = 'text-blue-500';
                } else {
                    // Subjective
                    c.icon = 'pi pi-comments';
                    c.iconBg = 'bg-purple-100';
                    c.iconColor = 'text-purple-500';
                }
            });

            // Load subcategories and nest them under categories
            this.measurementCategoriesService.getAllSubCategories().subscribe({
                next: (subCategories) => {
                    this.categories.forEach((category) => {
                        // Filter subcategories that belong to this category
                        category.subCategories = subCategories.filter((sub) => sub.categoryId === category.id || sub.category?.id === category.id);
                    });
                },
                error: (err) => {
                    console.error('Error loading subcategories', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load subcategories'
                    });
                }
            });
        });
    }

    getEmptyMeasurement() {
        return {
            subCategoryId: 0,
            name: '',
            inputType: 1,
            unit: '',
            minValue: 0,
            maxValue: 0,
            step: 0,
            normalRangeHint: '',
            question: '',
            answerType: 1
        };
    }

    // ... existing ...

    showDialog() {
        this.newCategory = { name: '', description: '', type: 1 };
        this.isEditingCategory = false;
        this.displayDialog = true;
    }

    openEditCategory(category: any) {
        this.newCategory = { ...category };
        this.isEditingCategory = true;
        this.displayDialog = true;
    }

    saveCategory() {
        if (this.isEditingCategory) {
            this.measurementCategoriesService.updateCategory(this.newCategory).subscribe({
                next: (res) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Category updated successfully' });
                    this.displayDialog = false;
                    this.loadCategories();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update category' });
                    console.error('Error updating category', err);
                }
            });
        } else {
            this.measurementCategoriesService.addCategory(this.newCategory).subscribe({
                next: (res) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Category added successfully' });
                    this.displayDialog = false;
                    this.loadCategories();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add category' });
                    console.error('Error adding category', err);
                }
            });
        }
    }

    // Sub-Categories

    openAddSubCategory(category: any) {
        this.selectedParentCategory = category;
        this.newSubCategory = { name: '', description: '', categoryId: category.id };
        this.isEditingSubCategory = false;
        this.displaySubCategoryDialog = true;
    }

    openEditSubCategory(subCategory: any, parentId: number) {
        this.newSubCategory = { ...subCategory, categoryId: parentId };
        this.isEditingSubCategory = true;
        this.displaySubCategoryDialog = true;
    }

    saveSubCategory() {
        if (!this.newSubCategory.name || !this.newSubCategory.description) return;

        if (this.isEditingSubCategory) {
            this.measurementCategoriesService.updateSubCategory(this.newSubCategory).subscribe({
                next: (res) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Subcategory updated successfully' });
                    this.displaySubCategoryDialog = false;
                    this.loadCategories();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update subcategory' });
                    console.error('Error updating subcategory', err);
                }
            });
        } else {
            this.measurementCategoriesService.addSubCategory(this.newSubCategory).subscribe({
                next: (res) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Subcategory added successfully' });
                    this.displaySubCategoryDialog = false;
                    this.loadCategories();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add subcategory' });
                    console.error('Error adding subcategory', err);
                }
            });
        }
    }

    deleteSubCategory(id: number) {
        this.measurementCategoriesService.deleteSubCategory(id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Subcategory deleted successfully' });
                this.loadCategories();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete subcategory' });
                console.error('Error deleting subcategory', err);
            }
        });
    }

    // Measurements Logic

    toggleSubCategory(subCategory: any) {
        subCategory.expanded = !subCategory.expanded;

        // Load measurements when expanding and if not already loaded
        if (subCategory.expanded && subCategory.measurements) {
            this.measurementCategoriesService.getSubCategoryById(subCategory.id).subscribe({
                next: (data) => {
                    // The API returns the subcategory object with measurements array
                    subCategory.measurements = data.measurements || [];
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load measurements'
                    });
                }
            });
        }
    }

    openAddMeasurement(subCategory: any) {
        this.selectedSubCategory = subCategory;
        this.newMeasurement = this.getEmptyMeasurement();
        this.newMeasurement.subCategoryId = subCategory.id;
        this.isEditingMeasurement = false;
        this.displayMeasurementDialog = true;
    }

    openEditMeasurement(measurement: any, subCategoryId: number) {
        this.newMeasurement = { ...measurement, subCategoryId: subCategoryId };
        this.isEditingMeasurement = true;
        this.displayMeasurementDialog = true;
    }

    saveMeasurement() {
        let payload = { ...this.newMeasurement };

        // Find parent category to check type
        const parentCategory = this.categories.find((c) => c.subCategories && c.subCategories.some((s: any) => s.id === payload.subCategoryId));

        if (parentCategory) {
            if (parentCategory.type === 1) {
                // Objective: Remove subjective fields
                delete payload.answerType;
                payload.inputType != 2 ? delete payload.question : null;
            } else if (parentCategory.type === 2) {
                // Subjective: Remove objective fields
                delete payload.inputType;
                delete payload.unit;
                delete payload.minValue;
                delete payload.maxValue;
                delete payload.step;
                delete payload.normalRangeHint;
            }
        }

        if (this.isEditingMeasurement) {
            this.measurementCategoriesService.updateMeasurement(payload).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Measurement updated successfully' });
                    this.displayMeasurementDialog = false;
                    // Refresh list logic
                    this.refreshMeasurements(this.newMeasurement.subCategoryId);
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update measurement' });
                    console.error(err);
                }
            });
        } else {
            this.measurementCategoriesService.addMeasurement(payload).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Measurement added successfully' });
                    this.displayMeasurementDialog = false;
                    this.refreshMeasurements(this.newMeasurement.subCategoryId);
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add measurement' });
                    console.error(err);
                }
            });
        }
    }

    deleteMeasurement(id: number, subCategoryId: number) {
        this.measurementCategoriesService.deleteMeasurement(id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Measurement deleted successfully' });
                this.refreshMeasurements(subCategoryId);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete measurement' });
                console.error(err);
            }
        });
    }

    refreshMeasurements(subCategoryId: number) {
        // Find the category/subcategory in the list and reload its measurements
        this.measurementCategoriesService.getMeasurements(subCategoryId).subscribe((data) => {
            for (let cat of this.categories) {
                if (cat.subCategories) {
                    let sub = cat.subCategories.find((s: any) => s.id === subCategoryId);
                    if (sub) {
                        sub.measurements = data;
                        break;
                    }
                }
            }
        });
    }

    isSubjective(subCategoryId: number): boolean {
        const parentCategory = this.categories.find((c) => c.subCategories && c.subCategories.some((s: any) => s.id === subCategoryId));
        return parentCategory ? parentCategory.type === 2 : false;
    }
}
