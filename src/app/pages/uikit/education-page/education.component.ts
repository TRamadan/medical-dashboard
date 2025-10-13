import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableComponent, TableColumn } from '../../../shared/table/table.component';
import { EducationalContentService } from './services/educationalContent.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Category, Education, Researches } from './models/educationcontent';
import { environment } from '../../../../environments/environment';
import { SharedService } from '../../../shared/services/shared.service';
import { TabsModule } from 'primeng/tabs';
import { ResearchesComponent } from './researches/researches.component';
import { ExerciesComponent } from './exercies/exercies.component';
import { Exercise } from '../treatment-plan/models/treatmnetplan';
import { TagModule } from 'primeng/tag';
@Component({
    selector: 'app-education',
    standalone: true,
    imports: [TagModule, TabsModule, SelectModule, CommonModule, ReactiveFormsModule, ToastModule, ToolbarModule, ButtonModule, CardModule, TableComponent, DialogModule, InputTextModule, ConfirmDialogModule, ResearchesComponent, ExerciesComponent],
    templateUrl: './education.component.html',
    styleUrls: ['./education-page.component.css'],
    providers: [ConfirmationService, MessageService] // Add if not provided globally
})
export class EducationComponent implements OnInit {
    chooseConfigType: any;
    public readonly imgUrl = environment.imgUrlWebsite;
    categories: Category[] = [];
    allResearches: Researches[] = [];
    allExercises: Exercise[] = [];
    cols: TableColumn[] = [];
    isDeleteMode: boolean = false;
    parsedCategories: any[] = [];

    // Dialog and form state
    categoryDialog: boolean = false;
    isEditMode: boolean = false;
    categoryForm!: FormGroup;
    selectedCategory: Category | null = null;

    @ViewChild(ResearchesComponent) researchesComponent!: ResearchesComponent;
    @ViewChild(ExerciesComponent) exercisesComponent!: ExerciesComponent;

    // Education Dialog and form state
    educationDialog: boolean = false;
    isEditEducationMode: boolean = false;
    educationForm!: FormGroup;
    userData: any;
    selectedContentType: string | null = null;

    configArr: any[] = [
        {
            id: 1,
            name: 'Categories config'
        },
        {
            id: 2,
            name: 'Content config'
        }
    ];

    knwolegdeHubContent: any[] = [
        {
            id: 1,
            name: 'Articles'
        },
        {
            id: 2,
            name: 'Videos'
        },
        {
            id: 3,
            name: 'Researches'
        },
        {
            id: 4,
            name: 'Exercises'
        }
    ];

    // Regular expressions for validation
    private arabicCharsRegex = /^[\u0600-\u06FF\s\-_&]+$/;
    private englishCharsRegex = /^[a-zA-Z\s\-_&]+$/;
    private urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?(\?.*)?$/i;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private _educationService: EducationalContentService,
        private _uploadFileService: SharedService
    ) {}

    ngOnInit(): void {
        this.userData = JSON.parse(localStorage.getItem('userData')!);
        this.categoryForm = this.fb.group({
            id: [null],
            nameAr: ['', [Validators.required, Validators.pattern(this.arabicCharsRegex)]],
            nameEn: ['', [Validators.required, Validators.pattern(this.englishCharsRegex)]]
        });

        this.educationForm = this.fb.group({
            id: [null],
            categoryId: [null, Validators.required],
            title: ['', [Validators.required, Validators.pattern(this.arabicCharsRegex)]],
            titleEn: ['', [Validators.required, Validators.pattern(this.englishCharsRegex)]],
            description: ['', [Validators.required, Validators.pattern(/^[\u0600-\u06FF\s.,!?-]+$/)]],
            descriptionEn: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\s.,!?-]+$/)]],
            img: [''],
            imageUrl: [null],
            isArticle: [false],
            videoUrl: [''],
            link: [''],
            file: [null]
        });

        // Define columns for the shared table component
        this.cols = [
            { field: 'nameAr', label: 'Category Ar' },
            { field: 'nameEn', label: 'Category En' }
        ];

        this.getAllCategories();
    }
    getAllCategories(): void {
        this._educationService.getAllCategories().subscribe({
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

    selectContentType(type: string) {
        this.selectedContentType = type;
        if (type === 'Articles') {
            this.educationForm.get('isArticle')?.setValue(true);
        } else {
            this.educationForm.get('isArticle')?.setValue(false);
        }

        if (type === 'Researches') {
            this.educationForm.get('link')?.setValidators([Validators.required, Validators.pattern(this.urlRegex)]);
        }

        if (type === 'Exercises') {
            this.educationForm.get('file')?.setValidators([Validators.required]);
        } else {
            this.educationForm.get('file')?.clearValidators();
        }
    }

    backToSelection() {
        this.educationForm.reset();
        this.selectedContentType = null;
    }

    // Opens the confirmation dialog to delete an item
    deleteCategory(category: Category) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${category.nameEn}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this._educationService.deleteCategory(category.id!).subscribe({
                    next: () => {
                        this.getAllCategories();
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Category Deleted', life: 3000 });
                    },
                    error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
                });
            }
        });
    }

    // Opens the dialog to edit an existing item
    editCategory(category: Category) {
        this.isEditMode = true;
        this.selectedCategory = { ...category };
        this.categoryForm.patchValue(this.selectedCategory);
        this.categoryDialog = true;
    }

    // Hides the main add/edit dialog
    hideDialog() {
        this.categoryDialog = false;
        this.isEditMode = false;
        this.isDeleteMode = false;
        this.categoryForm.reset();
    }

    //here is the function needed to show the inputs or forms to make or add new data
    selecteConfigType(choosedConfig: any): void {
        this.chooseConfigType = choosedConfig;

        if (choosedConfig.name === 'Categories config') {
            this.categoryDialog = true;
        } else {
            this.educationDialog = true;
        }
    }

    submitCategory(): void {
        if (this.isEditMode) {
            this.updateExistingCategory();
        } else {
            this.createNewCategory();
        }
    }

    private createNewCategory() {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }
        const categoryData = this.categoryForm.value;
        // The backend should handle the ID, so we don't send it.
        const { id, ...newCategoryData } = categoryData;
        this._educationService.createCategory(newCategoryData).subscribe({
            next: () => {
                this.getAllCategories();
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Category Created', life: 3000 });
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Create failed' })
        });

        this.hideDialog();
    }

    private updateExistingCategory() {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }
        const categoryData = this.categoryForm.value;
        this._educationService.updateCategory(categoryData).subscribe({
            next: () => {
                this.getAllCategories();
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Category Updated', life: 3000 });
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' })
        });

        this.hideDialog();
    }

    openEditResearchDialog(research: any) {
        this.isEditEducationMode = true;
        this.selectedContentType = 'Researches';

        this.educationForm.patchValue({
            id: research.id,
            title: research.titleAr,
            titleEn: research.titleEn,
            description: research.descriptionAr,
            descriptionEn: research.descriptionEn,
            link: research.link
        });
        this.educationDialog = true;
    }

    openEditExerciseDialog(exercise: any) {
        this.isEditEducationMode = true;
        this.selectedContentType = 'Exercises';

        this.educationForm.patchValue({
            id: exercise.id,
            title: exercise.titleAr,
            titleEn: exercise.titleEn,
            file: exercise.file
        });
        this.educationDialog = true;
    }

    hideEducationDialog() {
        this.educationForm.reset();
        this.educationDialog = false;
        this.isEditEducationMode = false;
        this.selectedContentType = null; // Reset on close
    }

    editEducation(education: Education, category: Category) {
        this.isEditEducationMode = true;
        this.selectedContentType = education.isArticle ? 'Articles' : 'Videos';

        this.educationForm.patchValue({
            id: education.id,
            categoryId: category.id,
            title: education.title,
            titleEn: education.titleEn,
            description: education.description,
            descriptionEn: education.descriptionEn,
            img: education.img,
            isArticle: education.isArticle,
            videoUrl: education.videoUrl
        });

        this.educationDialog = true;
    }

    deleteEducation(education: Education) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${education.titleEn}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this._educationService.deleteEducationalContent('Education', education.id!).subscribe({
                    next: () => {
                        this.getAllCategories(); // Refresh the data
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Content Deleted', life: 3000 });
                    },
                    error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
                });
            }
        });
    }

    getEndpointByContentType(contentType: string): string {
        switch (contentType) {
            case 'Articles':
                return 'Education';
            case 'Videos':
                return 'Education';
            case 'Researches':
                return 'Researchs';
            case 'Exercises':
                return 'ExercisePrograms';
            default:
                throw new Error(`Unsupported content type: ${contentType}`);
        }
    }

    getRequestBody(): any {
        const form = this.educationForm.value;
        const isEdit = this.isEditEducationMode;
        switch (this.selectedContentType) {
            case 'Articles':
                return {
                    ...(isEdit && { id: form.id }),
                    title: form.title,
                    titleEn: form.titleEn,
                    description: form.description,
                    descriptionEn: form.descriptionEn,
                    img: form.img,
                    createdBy: 'Test writer',
                    isArticle: true,
                    videoUrl: '',
                    categoryId: form.categoryId
                };

            case 'Videos':
                return {
                    ...(isEdit && { id: form.id }),
                    title: form.title,
                    titleEn: form.titleEn,
                    description: form.description,
                    descriptionEn: form.descriptionEn,
                    img: '',
                    createdBy: 'Test writer',
                    isArticle: false,
                    videoUrl: form.videoUrl,
                    categoryId: form.categoryId
                };

            case 'Researches':
                return {
                    ...(isEdit && { id: form.id }),
                    titleAr: form.title,
                    titleEn: form.titleEn,
                    descriptionAr: form.description,
                    descriptionEn: form.descriptionEn,
                    link: form.link
                };

            case 'Exercises':
                return {
                    ...(isEdit && { id: form.id }),
                    titleAr: form.title,
                    titleEn: form.titleEn,
                    file: form.file
                };

            default:
                return null;
        }
    }

    saveContent() {
        const body = this.getRequestBody();
        let contentType: any = this.selectedContentType;
        let returnedEndpointName = this.getEndpointByContentType(contentType);

        if (this.isEditEducationMode) {
            // Handle Update
            this._educationService.updateEducationalContent(returnedEndpointName, body).subscribe({
                next: (res: any) => {
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Content Updated', life: 3000 });
                    if (this.selectedContentType === 'Researches' && this.researchesComponent) {
                        this.researchesComponent.getAllResearchs();
                    } else if (this.selectedContentType === 'Exercises' && this.exercisesComponent) {
                        this.exercisesComponent.getAllExercies();
                    } else if (this.selectedContentType === 'Articles' || this.selectedContentType === 'Videos') {
                        this.getAllCategories();
                    }
                    this.hideEducationDialog();
                },
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' })
            });
        } else {
            // Create logic
            this._educationService.createEducationalContent(returnedEndpointName, body).subscribe({
                next: (res: any) => {
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Content Created', life: 3000 });
                    if (this.selectedContentType === 'Researches' && this.researchesComponent) {
                        this.researchesComponent.getAllResearchs();
                    } else if (this.selectedContentType === 'Exercises' && this.exercisesComponent) {
                        this.exercisesComponent.getAllExercies();
                    } else {
                        this.getAllCategories();
                    }
                    this.hideEducationDialog();
                },
                error: (error: any) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Create failed' });
                }
            });
        }
    }

    onImageUpload(event: any): void {
        const file = event.target.files[0];
        let folderName = 'Education';
        if (file) {
            this._uploadFileService.uploadFileService(file, folderName).subscribe({
                next: (res: any) => {
                    this.educationForm.patchValue({
                        img: res.filePath
                    });

                    // Show preview (optional)
                    const reader = new FileReader();
                    reader.onload = (e: any) => {
                        this.educationForm.patchValue({
                            imageUrl: e.target.result
                        });
                    };
                    reader.readAsDataURL(file);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Image uploaded successfully.'
                    });
                },
                error: (err: any) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Upload Failed',
                        detail: 'Could not upload image. Please try again.'
                    });
                }
            });
        }
    }

    onFileUpload(event: any): void {
        const file = event.target.files[0];
        let folderName = 'Education';
        if (file) {
            this._uploadFileService.uploadFileService(file, folderName).subscribe({
                next: (res: any) => {
                    this.educationForm.patchValue({
                        file: res.filePath
                    });

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'File uploaded successfully.'
                    });
                },
                error: (err: any) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Upload Failed',
                        detail: 'Could not upload file. Please try again.'
                    });
                }
            });
        }
    }
}
