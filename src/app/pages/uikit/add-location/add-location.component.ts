import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TabsModule } from 'primeng/tabs';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { IconFieldModule } from 'primeng/iconfield';
import { Location } from './models/location';
@Component({
    selector: 'app-add-location',
    standalone: true,
    imports: [
        IconFieldModule,
        CascadeSelectModule,
        ToggleSwitchModule,
        TabsModule,
        FloatLabelModule,
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        SelectModule,
        InputNumberModule,
        DialogModule,
        InputIconModule,
        CardModule,
        ReactiveFormsModule
    ],
    templateUrl: './add-location.component.html',
    styleUrls: ['./add-location.component.css']
})
export class AddLocationComponent implements OnInit {
    isNewServiceSubCategory: boolean = false;
    isEditService: boolean = false;
    isEditServiceSubCategory: boolean = false;
    isLocationDialog: boolean = false;
    selectedLocation: any = {};
    locations: Location[] = [];

    addLocationForm!: FormGroup;
    serviceCategoryForm!: FormGroup;

    constructor(private fb: FormBuilder) { }

    ngOnInit() {
        this.initialiseServiceForm();
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Porpuse : this function is created to open a dialog to add a new location
     */
    openLocationDialog(): void {
        this.isLocationDialog = true;
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Porpuse : this function is created to inisialise form controls for add location data
     */
    initialiseServiceForm(): void {
        this.addLocationForm = this.fb.group({
            name: [null, Validators.required],
            phone: [null, Validators.required],
            address: [null, Validators.required]
        });
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Porpuse : this function is created to call an api that responsible for adding a new location
     */
    addNewLocation(): void {
        //logic goes here
        const body = this.addLocationForm.value;
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Porpuse : this function is responsible for fetch all added locations
     */
    getAllAddedLocation(): void { }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Porpuse : this function is responsible for update the selected location
     */
    updateSelectedLocation(): void { }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Porpuse : this function is responsible for delete the selected location
     */
    deleteLocation(location: Location): void { }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Porpuse : this function is responsible for set the data for the chosed location
     * @param chosedLocation
     */
    editLocation(location: Location): void {
        this.isEditService = true;
        this.isLocationDialog = true;
        this.addLocationForm.patchValue(location);
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
}
