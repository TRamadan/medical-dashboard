import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { forkJoin, map } from 'rxjs';
import { MeasurementTemplatesService } from '../services/measurement-templates.service';
import { MeasurementCategoriesService } from '../services/measurement-categories.service';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ViewMeasurementTemplateComponent } from '../view-measurement-template/view-measurement-template.component';

export enum InputType {
    Number = 1,
    Boolean = 2,
    Scale = 3,
    Text = 4
}

interface Measurement {
    inputType: InputType;
    minValue: number;
    maxValue: number;
}

@Component({
    selector: 'app-measurement-templates',
    standalone: true,
    imports: [
        DialogModule,
        InputIconModule,
        IconFieldModule,
        TagModule,
        TooltipModule,
        SelectButtonModule,
        CommonModule,
        ToastModule,
        ToolbarModule,
        ButtonModule,
        CardModule,
        TabsModule,
        FormsModule,
        AccordionModule,
        CheckboxModule,
        InputTextModule,
        FloatLabelModule,
        TextareaModule,
        ViewMeasurementTemplateComponent
    ],
    templateUrl: './measurement-templates.component.html',
    styleUrl: './measurement-templates.component.scss',
    providers: [MessageService]
})
export class MeasurementTemplatesComponent implements OnInit {
    templates: any[] = [];
    categories: any[] = [];
    filteredCategories: any[] = [];
    templateMeasurementDetails: any[] = [];
    editingTemplateId: any;
    visible: boolean = false;
    loading: boolean = false;
    isDeleteTemplate: boolean = false;
    isEditTemplate: boolean = false;
    isViewTemplateEntries: boolean = false;
    activeTabValue: string = '0';

    newTemplate = {
        name: '',
        description: '',
        measurements: [] as any[]
    };

    selectedMeasurementIds: number[] = [];

    // Search and filter properties
    searchQuery: string = '';
    selectedCategoryFilter: 'all' | 'objective' | 'subjective' = 'all';

    // Expansion state
    expandedCategories: number[] = [];
    expandedSubCategories: number[] = [];

    constructor(
        private measurementTemplatesService: MeasurementTemplatesService,
        private measurementCategoriesService: MeasurementCategoriesService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadTemplates();
        this.loadCategories();
        // this.loadCategoriesTree();
    }

    loadTemplates() {
        this.measurementTemplatesService.getAllTemplates().subscribe({
            next: (data) => {
                this.templates = data;
                // Mock tags for design if needed, or assume backend sends them
            },
            error: (err) => {}
        });
    }

    choosedTemplateId: number = 0;
    deleteTemplate(id: number) {
        this.choosedTemplateId = id;
        this.isDeleteTemplate = true;
        this.isViewTemplateEntries = false;
        this.visible = true;
    }

    confirmDeleteTemplate(): void {
        this.measurementTemplatesService.deleteTemplate(this.choosedTemplateId).subscribe({
            next: () => {
                ;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Template deleted successfully' });
                this.loadTemplates();
                this.isDeleteTemplate = false;
                this.visible = false;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete template' });
                this.isDeleteTemplate = false;
            }
        });
    }

    loadCategories(): void {
        this.measurementCategoriesService.getAllCategories().subscribe({
            next: (data) => {
                this.categories = data;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' });
                console.error(err);
            }
        });
    }

    // loadCategoriesTree() {
    //     this.loading = true;
    //     this.measurementCategoriesService.getAllCategories().subscribe({
    //         next: (categories) => {
    //             ;
    //             this.categories = categories;

    //             // Check if subcategories are already nested or need fetching
    //             const needsSubFetching = !this.categories.some((cat) => cat.subCategories && cat.subCategories.length > 0);

    //             if (needsSubFetching) {
    //                 this.measurementCategoriesService.getAllSubCategories().subscribe({
    //                     next: (subCategories) => {
    //                         this.categories.forEach((cat) => {
    //                             // Use loose equality in case of string vs number IDs
    //                             cat.subCategories = subCategories.filter((sub) => (sub.categoryId || sub.categoryID) == cat.id);
    //                         });
    //                         this.fetchAllMeasurements();
    //                     },
    //                     error: (err) => {
    //                         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load subcategories' });
    //                         this.loading = false;
    //                     }
    //                 });
    //             } else {
    //                 this.fetchAllMeasurements();
    //             }
    //         },
    //         error: (err) => {
    //             this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' });
    //             this.loading = false;
    //         }
    //     });
    // }

    fetchAllMeasurements() {
        const obs = [];
        for (const cat of this.categories) {
            if (cat.subCategories) {
                for (const sub of cat.subCategories) {
                    obs.push(
                        this.measurementCategoriesService.getMeasurements(sub.id).pipe(
                            map((measurements) => {
                                sub.measurements = measurements;
                                return measurements;
                            })
                        )
                    );
                }
            }
        }

        if (obs.length > 0) {
            forkJoin(obs).subscribe({
                next: () => {
                    this.loading = false;
                    this.applyFilters();
                },
                error: (err) => {
                    console.error('Error fetching measurements', err);
                    this.loading = false;
                    this.applyFilters();
                }
            });
        } else {
            this.loading = false;
            this.applyFilters();
        }
    }

    saveTemplate() {
        
        if (!this.newTemplate.name) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please enter a template name' });
            return;
        }

        if (this.selectedMeasurementIds.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select at least one measurement' });
            return;
        }

        const payload = {
            ...(this.editingTemplateId !== null && { id: this.editingTemplateId }),
            name: this.newTemplate.name,
            description: this.newTemplate.description,
            measurements: this.selectedMeasurementIds.map((id, index) => ({
                measurementId: id,
                order: index + 1
            }))
        };

        const isEditing = this.editingTemplateId !== null;

        const action$ = isEditing ? this.measurementTemplatesService.updateTemplate(payload , this.editingTemplateId) : this.measurementTemplatesService.addTemplate(payload);

        action$.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: isEditing ? 'Template updated successfully' : 'Template created successfully'
                });
                this.resetForm();
                this.loadTemplates();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: isEditing ? 'Failed to update template' : 'Failed to create template'
                });
                console.error(err);
            }
        });
    }

    getInputTypeIcon(inputType: InputType): string {
        const iconMap: Record<InputType, string> = {
            [InputType.Number]: 'pi pi-hashtag',
            [InputType.Boolean]: 'pi pi-check-square',
            [InputType.Scale]: 'pi pi-sliders-h',
            [InputType.Text]: 'pi pi-align-left'
        };
        return iconMap[inputType] ?? 'pi pi-question-circle';
    }

    getInputTypeText(measurement: Measurement): string {
        ;
        if ((measurement.minValue !== 0 || measurement.maxValue !== 0) && (measurement.minValue !== null || measurement.maxValue !== null)) {
            return `${measurement.minValue} - ${measurement.maxValue}`;
        } else if (measurement.minValue === null || measurement.maxValue === null) {
            return `Yes/No question`;
        }

        const typeMap: Record<InputType, string> = {
            [InputType.Number]: 'Number',
            [InputType.Boolean]: 'Yes or No question',
            [InputType.Scale]: 'Scale',
            [InputType.Text]: 'Text'
        };

        return typeMap[measurement.inputType] ?? '';
    }

    resetForm() {
        this.newTemplate = {
            name: '',
            description: '',
            measurements: []
        };
        this.selectedMeasurementIds = [];
    }

    editItems(template: any) {}

    editTemplate(template: any) {
        this.isEditTemplate = true;

        this.newTemplate.name = template.name;
        this.newTemplate.description = template.description;
        this.selectedMeasurementIds = template.measurements ? template.measurements.map((m: any) => m.measurementId) : [];
        this.activeTabValue = '1';
        this.editingTemplateId = template.id
    }

    // Search and filter methods
    onSearchChange() {
        this.applyFilters();
    }

    filterByCategory(filter: 'all' | 'objective' | 'subjective') {
        this.selectedCategoryFilter = filter;
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.categories];

        // Apply category type filter
        if (this.selectedCategoryFilter !== 'all') {
            filtered = filtered.filter((cat) => {
                const categoryType = this.getCategoryType(cat);
                return categoryType === this.selectedCategoryFilter;
            });
        }

        this.filteredCategories = filtered;
    }

    // Expansion methods
    toggleCategory(categoryId: number) {
        const index = this.expandedCategories.indexOf(categoryId);
        if (index > -1) {
            this.expandedCategories.splice(index, 1);
        } else {
            this.expandedCategories.push(categoryId);
        }
    }

    toggleSubCategory(subCategoryId: number) {
        const index = this.expandedSubCategories.indexOf(subCategoryId);
        if (index > -1) {
            this.expandedSubCategories.splice(index, 1);
        } else {
            this.expandedSubCategories.push(subCategoryId);

            // Find the subcategory and load measurements if not already loaded
            for (const category of this.categories) {
                ;
                if (category.subCategories) {
                    const subCategory = category.subCategories.find((sub: any) => sub.id === subCategoryId);
                    if (subCategory) {
                        console.log('Found subcategory:', subCategory.name);

                        if (subCategory.measurements) {
                            console.log('Fetching measurements for subcategory ID:', subCategoryId);

                            // Fetch measurements for this subcategory
                            this.measurementCategoriesService.getSubCategoryById(subCategoryId).subscribe({
                                next: (data) => {
                                    ;
                                    console.log('Received data from API:', data);
                                    subCategory.measurements = data.measurements || [];
                                    console.log('Assigned measurements:', subCategory.measurements.length, 'items');
                                    // Update filtered categories as well
                                    this.applyFilters();
                                },
                                error: (err) => {
                                    console.error('Error loading measurements for subcategory', err);
                                    this.messageService.add({
                                        severity: 'error',
                                        summary: 'Error',
                                        detail: 'Failed to load measurements'
                                    });
                                }
                            });
                            break;
                        } else {
                            console.log('Measurements already loaded:', subCategory.measurements.length, 'items');
                        }
                    }
                }
            }
        }
    }

    // UI Helper methods
    getCategoryType(category: any): 'objective' | 'subjective' {
        // Determine category type based on name or a type property
        const name = category.name.toLowerCase();
        if (name.includes('subjective') || name.includes('question')) {
            return 'subjective';
        }
        return 'objective';
    }

    getCategoryIcon(category: any): string {
        const type = this.getCategoryType(category);
        return type === 'subjective' ? 'pi pi-comments' : 'pi pi-chart-line';
    }

    getCategoryIconColor(category: any): string {
        const type = this.getCategoryType(category);
        return type === 'subjective' ? '#a855f7' : '#3b82f6';
    }

    getCategoryBackgroundColor(category: any): string {
        const type = this.getCategoryType(category);
        const isExpanded = this.expandedCategories.includes(category.id);

        if (type === 'subjective') {
            return isExpanded ? '#f3e8ff' : '#faf5ff';
        }
        return isExpanded ? '#eff6ff' : '#f9fafb';
    }

    getCategoryDescription(category: any): string {
        const type = this.getCategoryType(category);
        if (type === 'subjective') {
            return 'Yes/No questions';
        }

        // Generate description based on category name
        const name = category.name.toLowerCase();
        if (name.includes('pain')) {
            return 'Yes/No questions about pain';
        } else if (name.includes('mobility') || name.includes('function')) {
            return 'Yes/No questions about mobility';
        } else if (name.includes('activities') || name.includes('daily living')) {
            return 'Yes/No questions about daily activities';
        }
        return 'Measurement items';
    }

    getCategoryBadge(category: any): string | null {
        const type = this.getCategoryType(category);
        if (type === 'subjective') {
            return 'Yes/No';
        }
        return null;
    }

    getCategoryBadgeColor(category: any): string {
        const type = this.getCategoryType(category);
        return type === 'subjective' ? '#e9d5ff' : '#dbeafe';
    }

    getCategoryBadgeTextColor(category: any): string {
        const type = this.getCategoryType(category);
        return type === 'subjective' ? '#7c3aed' : '#1e40af';
    }

    viewTemplateDataEntry(choosedTemplate: any): void {
        this.measurementTemplatesService.getSpecificTemplateData(choosedTemplate.id).subscribe({
            next: (res: any) => {
                this.isViewTemplateEntries = true;
                this.visible = true;
                this.templateMeasurementDetails = res.measurements;
            },
            error: (error: any) => {
                this.visible = true;
                this.isViewTemplateEntries = false;
                console.log(error);
            }
        });
    }
}
