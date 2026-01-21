import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { forkJoin, map, switchMap } from 'rxjs';
import { MeasurementTemplatesService } from '../services/measurement-templates.service';
import { MeasurementCategoriesService } from '../services/measurement-categories.service';

@Component({
    selector: 'app-measurement-templates',
    standalone: true,
    imports: [CommonModule, ToastModule, ToolbarModule, ButtonModule, CardModule, TabsModule, FormsModule, AccordionModule, CheckboxModule, InputTextModule, FloatLabelModule, TextareaModule],
    templateUrl: './measurement-templates.component.html',
    styleUrl: './measurement-templates.component.scss',
    providers: [MessageService]
})
export class MeasurementTemplatesComponent implements OnInit {
    templates: any[] = [];
    categories: any[] = [];
    filteredCategories: any[] = [];
    loading: boolean = false;

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
        this.loadCategoriesTree();
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

    loadCategoriesTree() {
        this.loading = true;
        this.measurementCategoriesService.getAllCategories().subscribe({
            next: (categories) => {
                this.categories = categories;

                // Check if subcategories are already nested or need fetching
                const needsSubFetching = !this.categories.some((cat) => cat.subCategories && cat.subCategories.length > 0);

                if (needsSubFetching) {
                    this.measurementCategoriesService.getAllSubCategories().subscribe({
                        next: (subCategories) => {
                            this.categories.forEach((cat) => {
                                // Use loose equality in case of string vs number IDs
                                cat.subCategories = subCategories.filter((sub) => (sub.categoryId || sub.categoryID) == cat.id);
                            });
                            this.fetchAllMeasurements();
                        },
                        error: (err) => {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load subcategories' });
                            this.loading = false;
                        }
                    });
                } else {
                    this.fetchAllMeasurements();
                }
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' });
                this.loading = false;
            }
        });
    }

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
            name: this.newTemplate.name,
            description: this.newTemplate.description,
            measurements: this.selectedMeasurementIds.map((id, index) => ({
                measurementId: id,
                order: index + 1
            }))
        };

        this.measurementTemplatesService.addTemplate(payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Template created successfully' });
                this.resetForm();
                this.loadTemplates();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create template' });
                console.error(err);
            }
        });
    }

    resetForm() {
        this.newTemplate = {
            name: '',
            description: '',
            measurements: []
        };
        this.selectedMeasurementIds = [];
    }

    editItems(template: any) {
        console.log('Edit items for', template);
    }

    editTemplate(template: any) {
        console.log('Edit template', template);
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

        // Apply search filter
        if (this.searchQuery && this.searchQuery.trim() !== '') {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter((cat) => {
                // Search in category name
                if (cat.name.toLowerCase().includes(query)) {
                    return true;
                }
                // Search in subcategories
                if (cat.subCategories) {
                    return cat.subCategories.some((sub: any) => {
                        if (sub.name.toLowerCase().includes(query)) {
                            return true;
                        }
                        // Search in measurements
                        if (sub.measurements) {
                            return sub.measurements.some((m: any) => m.name.toLowerCase().includes(query));
                        }
                        return false;
                    });
                }
                return false;
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
        console.log('toggleSubCategory called with ID:', subCategoryId);

        const index = this.expandedSubCategories.indexOf(subCategoryId);
        if (index > -1) {
            this.expandedSubCategories.splice(index, 1);
            console.log('Subcategory collapsed:', subCategoryId);
        } else {
            this.expandedSubCategories.push(subCategoryId);
            console.log('Subcategory expanded:', subCategoryId);

            // Find the subcategory and load measurements if not already loaded
            for (const category of this.categories) {
                if (category.subCategories) {
                    const subCategory = category.subCategories.find((sub: any) => sub.id === subCategoryId);
                    if (subCategory) {
                        console.log('Found subcategory:', subCategory.name);

                        if (!subCategory.measurements) {
                            console.log('Fetching measurements for subcategory ID:', subCategoryId);

                            // Fetch measurements for this subcategory
                            this.measurementCategoriesService.getSubCategoryById(subCategoryId).subscribe({
                                next: (data) => {
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
}
