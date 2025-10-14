import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { LocationService } from './services/location.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableColumn, TableComponent } from '../../../shared/table/table.component';
import { Location } from './models/location';

@Component({
    selector: 'app-add-location',
    standalone: true,
    imports: [IconFieldModule, FloatLabelModule, CommonModule, TableModule, FormsModule, ButtonModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, CardModule, ReactiveFormsModule, ConfirmDialogModule, TableComponent],
    templateUrl: './add-location.component.html',
    styleUrls: ['./add-location.component.css'],
    providers: [MessageService, ConfirmationService]
})
export class AddLocationComponent implements OnInit {
    isEditService: boolean = false;
    isLocationDialog: boolean = false;
    selectedLocation: any = {};
    locations: Location[] = [];

    addLocationForm!: FormGroup;
    serviceCategoryForm!: FormGroup;

    tableColumns: TableColumn[] = [];

    constructor(
        private fb: FormBuilder,
        private locationService: LocationService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.initializeLocationForm();
        this.getAllAddedLocation();
        this.tableColumns = [
            { label: 'Name (AR)', field: 'nameAr', type: 'text', sortable: true },
            { label: 'Name (EN)', field: 'nameEn', type: 'text', sortable: true },
            { label: 'Address', field: 'addressAr', type: 'text', sortable: true },
            { label: 'Address', field: 'addressEn', type: 'text', sortable: true },
            { label: 'Phone', field: 'phoneNumber', type: 'text', sortable: true }
        ];
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Porpuse : this function is created to open a dialog to add a new location
     */
    openLocationDialog(): void {
        this.isEditService = false;
        this.addLocationForm.reset();
        this.isLocationDialog = true;
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Purpose : this function is created to initialize form controls for add location data
     */
    initializeLocationForm(): void {
        this.addLocationForm = this.fb.group({
            id: [null],
            nameAR: ['', [Validators.required, Validators.pattern(/^[\u0600-\u06FF\s\d\W]+$/)]],
            nameEN: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s\d\W]+$/)]],
            addressAr: ['', [Validators.required, Validators.pattern(/^[\u0600-\u06FF0-9\s,.-]+$/)]],
            addressEn: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s,.-]+$/)]],
            phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
        });
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Purpose : this function is created to call an api that responsible for adding or updating a location
     */
    addNewLocation(): void {
        if (this.addLocationForm.invalid) {
            this.addLocationForm.markAllAsTouched();
            return;
        }

        const locationData = this.addLocationForm.value;

        if (this.isEditService) {
            // Update existing location
            this.locationService.updateLocation(locationData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Location updated successfully' });
                    this.isLocationDialog = false;
                    this.getAllAddedLocation();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update location' })
            });
        } else {
            // Add new location
            this.locationService.addLocation(locationData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Location added successfully' });
                    this.isLocationDialog = false;
                    this.getAllAddedLocation();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add location' })
            });
        }
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Purpose : this function is responsible for fetch all added locations
     */
    getAllAddedLocation(): void {
        this.locationService.getLocations().subscribe({
            next: (data: any) => (this.locations = data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch locations' })
        });
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Purpose : this function is responsible for delete the selected location
     */
    deleteLocation(location: Location): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the location "${location.nameEn}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-danger',

            accept: () => {
                this.locationService.deleteLocation(location.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Location deleted successfully' });
                        this.getAllAddedLocation();
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete location' })
                });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Purpose : this function is responsible for set the data for the chosen location
     * @param chosedLocation
     */
    editLocation(location: Location): void {
        this.isEditService = true;
        this.isLocationDialog = true;
        this.addLocationForm.patchValue({
            id: location.id,
            nameAR: location.nameAr,
            nameEN: location.nameEn,
            addressAr: location.addressAr,
            addressEn: location.addressEn,
            phone: location.phone
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Porpuse : fetch accurate data by search in an input in the desired table
     * @param table
     * @param event
     */
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 4/6/2024
     * Purpose : Hides the dialog and resets the form state.
     */
    hideDialog() {
        this.isLocationDialog = false;
        this.isEditService = false;
        this.addLocationForm.reset();
    }
}
