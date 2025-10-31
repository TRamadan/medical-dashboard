import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableComponent, TableColumn } from '../../../shared/table/table.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Servicecategory } from './models/servicecategory';
import { TabsModule } from 'primeng/tabs';
import { ServicecategoryService } from './services/servicecategory.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ServicesService } from './services/services.service';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { LocationService } from '../add-location/services/location.service';
@Component({
    selector: 'app-add-service',
    standalone: true,
    imports: [
        MultiSelectModule,
        SelectModule,
        TabsModule,
        FloatLabelModule,
        CommonModule,
        TableComponent,
        FormsModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        InputNumberModule,
        DialogModule,
        InputIconModule,
        IconFieldModule,
        CardModule,
        ReactiveFormsModule,
        ConfirmDialogModule
    ],
    templateUrl: './add-service.component.html',
    styleUrls: ['./add-service.component.css'],
    providers: [MessageService, ConfirmationService]
})
export class AddServiceComponent implements OnInit {
    isNewServiceSubCategory: boolean = false;
    isEditMode: boolean = false;
    isDeleteMode: boolean = false;
    isEditServiceMode: boolean = false;
    isServiceDialog: boolean = false;
    selectedService: Servicecategory = {};
    selectedCategoryForService: Servicecategory | null = null;

    addServiceForm!: FormGroup;
    serviceCategoryForm!: FormGroup;
    locations: Location[] = [];

    headers: TableColumn[] = [
        { label: 'Category Name (AR)', field: 'nameAr', type: 'text' },
        { label: 'Category Name (EN)', field: 'nameEn', type: 'text' }
    ];
    subHeaders: TableColumn[] = [
        { label: 'Service Name (EN)', field: 'nameEn', type: 'text' },
        { label: 'Price', field: 'price', type: 'text' }
    ];
    data: Servicecategory[] = [];
    durationOptions: { label: string; value: string }[] = [];

    constructor(
        private fb: FormBuilder,
        private serviceCategoryService: ServicecategoryService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private servicesService: ServicesService,
        private locationService: LocationService
    ) {}

    ngOnInit() {
        this.getAllCategories();
        this.initialiseServiceForm();
        this.generateDurationOptions();
        this.getAllLocations();
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Purpose : this function is created to open a dialog to add a new service category
     */
    openServiceDialog(): void {
        this.isEditMode = false;
        this.isDeleteMode = false;
        this.isNewServiceSubCategory = false;
        this.addServiceForm.reset();
        this.isServiceDialog = true;
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Purpose : this function is created to initialize form controls for add service
     */
    initialiseServiceForm(): void {
        this.addServiceForm = this.fb.group({
            id: [null],
            nameEn: [null, [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
            nameAr: [null, [Validators.required, Validators.pattern(/^[\u0600-\u06FF\s]*$/)]]
        });
        this.serviceCategoryForm = this.fb.group({
            id: [null],
            nameAr: [null, Validators.required], // for service
            nameEn: [null, Validators.required], // for service
            duration: [null, Validators.required], // for service
            price: [null, Validators.required], // for service
            idealtimeBefore: [null, Validators.required], // for service
            idealtimeAfter: [null, Validators.required], // for service
            serviceCategoryId: [null], // for service
            locationIds: [[], Validators.required], // for service
            parentServiceId: [null],
            orderInParent: [null]
        });
    }

    private generateDurationOptions(): void {
        this.durationOptions = [];
        const maxMinutes = 24 * 60; // 24 hours in minutes

        for (let i = 30; i <= maxMinutes; i += 30) {
            const hours = Math.floor(i / 60);
            const minutes = i % 60;

            let label = '';
            if (hours > 0) {
                label += `${hours} hour${hours > 1 ? 's' : ''}`;
            }
            if (minutes > 0) {
                label += ` ${minutes}min`;
            }

            // value بصيغة HH:MM
            const formattedValue = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

            this.durationOptions.push({
                label: label.trim(),
                value: formattedValue
            });
        }
    }

    getAllLocations(): void {
        this.locationService.getLocations().subscribe({
            next: (res: any) => {
                this.locations = res.map((element: any) => {
                    return {
                        id: element.id,
                        name: element.nameEn
                    };
                });
            },
            error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to fetch locations'
                });
            }
        });
    }

    /**
     *
     * @param chosenService
     */
    addServiceCategory(chosenService: Servicecategory): void {
        this.selectedCategoryForService = { ...chosenService };
        this.isServiceDialog = true;
        this.isNewServiceSubCategory = true;
        this.isEditServiceMode = false;
        this.serviceCategoryForm.reset();
        this.serviceCategoryForm.patchValue({
            serviceCategoryId: this.selectedCategoryForService.id
        });
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Purpose : This function acts as a router to save either a category or a service based on the dialog mode.
     */
    addNewCategory(): void {
        if (this.addServiceForm.invalid) {
            this.addServiceForm.markAllAsTouched();
            return;
        }

        if (this.isEditMode) {
            this.updateCategory();
        } else {
            this.createCategory();
        }
    }

    saveService(): void {
        if (this.serviceCategoryForm.invalid) {
            this.serviceCategoryForm.markAllAsTouched();
            return;
        }
        this.serviceCategoryForm.removeControl('id');
        const serviceData = this.serviceCategoryForm.value;

        if (this.isEditServiceMode) {
            this.updateService(serviceData);
        } else {
            this.createService(serviceData);
        }
    }

    private createCategory(): void {
        this.serviceCategoryService.addServiceCategory(this.addServiceForm.value).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Category Created'
                });
                this.getAllCategories();
                this.hideDialog();
            },
            error: () =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Create Failed'
                })
        });
    }

    private updateCategory(): void {
        this.serviceCategoryService.updateServiceCategory(this.addServiceForm.value).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Category Updated'
                });
                this.getAllCategories();
                this.hideDialog();
            },
            error: () =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Update Failed'
                })
        });
    }

    private createService(serviceData: any): void {
        this.servicesService.addService(serviceData).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Service Created'
                });
                this.getAllCategories();
                this.hideDialog();
            },
            error: () =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Create Failed'
                })
        });
    }

    private updateService(serviceData: any): void {
        this.servicesService.updateService(serviceData.id, serviceData).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Service Updated'
                });
                this.getAllCategories();
                this.hideDialog();
            },
            error: () =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Update Failed'
                })
        });
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Purpose : this function is responsible for fetching all added service categories
     */
    getAllCategories(): void {
        this.serviceCategoryService.getServiceCategories().subscribe({
            next: (response: any) => {
                this.data = response;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to fetch categories'
                });
            }
        });
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Purpose : this function is responsible for deleting the selected service category
     */
    deleteCategory(category: Servicecategory): void {
        this.isDeleteMode = true; // Not strictly needed for dialog, but as requested
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${category.nameEn}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.serviceCategoryService.deleteServiceCategory(category.id!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Category Deleted'
                        });
                        this.getAllCategories();
                        this.isDeleteMode = false;
                    },
                    error: () =>
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Delete Failed'
                        })
                });
            },
            reject: () => {
                this.isDeleteMode = false;
            }
        });
    }

    deleteSubService(service: any): void {
        this.isDeleteMode = true;
        this.confirmationService.confirm({
            message: `Are you sure you want to delete service "${service.nameEn}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.servicesService.deleteService(service.id!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Service Deleted'
                        });
                        this.getAllCategories();
                        this.isDeleteMode = false;
                    },
                    error: () =>
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Delete Failed'
                        })
                });
            },
            reject: () => {
                this.isDeleteMode = false;
            }
        });
    }
    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Purpose : this function is responsible for setting the data for the chosen service category for editing
     * @param chosenService
     */
    editCategory(category: Servicecategory): void {
        this.isEditMode = true;
        this.isDeleteMode = false;
        this.isNewServiceSubCategory = false;
        this.addServiceForm.patchValue(category);
        this.isServiceDialog = true;
    }

    editSubService(service: any, category: Servicecategory): void {
        this.isEditServiceMode = true;
        this.isNewServiceSubCategory = true;
        this.selectedCategoryForService = category;
        this.serviceCategoryForm.patchValue(service);
        this.isServiceDialog = true;
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Purpose : this function is responsible for closing the dialog
     */
    hideDialog(): void {
        this.isEditMode = false;
        this.isDeleteMode = false;
        this.isEditServiceMode = false;
        this.isNewServiceSubCategory = false;
        this.isServiceDialog = false;
        this.addServiceForm.reset();
        this.serviceCategoryForm.reset();
        this.selectedCategoryForService = null;
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * purpose : this function is responsible for fetching an api that shows the added service per each chosen category
     * @param ev this is the selected category needed to show the added services for it
     */
    showServicesForSelectedCategory(ev: any): void {
        //api implementation goes here
    }
}
