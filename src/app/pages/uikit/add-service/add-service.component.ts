import { Component, OnInit, signal, ViewChild } from '@angular/core';
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
import { Services } from './models/services';
import { TabsModule } from 'primeng/tabs';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CascadeSelectModule } from 'primeng/cascadeselect';

@Component({
    selector: 'app-add-service',
    standalone: true,
    imports: [
        CascadeSelectModule,
        ToggleSwitchModule,
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
        ReactiveFormsModule
    ],
    templateUrl: './add-service.component.html',
    styleUrls: ['./add-service.component.css']
})
export class AddServiceComponent implements OnInit {
    isNewServiceSubCategory: boolean = false;
    isEditService: boolean = false;
    isEditServiceSubCategory: boolean = false;
    isServiceDialog: boolean = false;
    selectedService: Services = {};

    addServiceForm!: FormGroup;
    serviceCategoryForm!: FormGroup;

    headers: TableColumn[] = [
        { label: 'Category Name', field: 'name', type: 'text', sortable: true },
        { label: 'No.of services', field: 'numberOfsubCatrgories', type: 'text', sortable: false },
    ];
    data: Services[] = [
        // Example data, replace with real data
        { id: 1, name: 'Physiotherapy', numberOfsubCatrgories: 3 },
        { id: 2, name: 'Dentistry', numberOfsubCatrgories: 2 },
    ];

    constructor(private fb: FormBuilder) { }

    ngOnInit() {
        this.initialiseServiceForm();
        this.getAllAddedServices();

    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Porpuse : this function is created to open a dialog to add a new service
     */
    openServiceDialog(): void {
        this.isServiceDialog = true;
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Porpuse : this function is created to inisialise form controls for add service
     */
    initialiseServiceForm(): void {
        this.addServiceForm = this.fb.group({
            name: [null, Validators.required]
        });
        this.serviceCategoryForm = this.fb.group({
            detailsForm: this.fb.group({
                subCategoryName: [null, Validators.required]
            }),
            configurationForm: this.fb.group({
                duration: [null, Validators.required],
                price: [null, Validators.required],
                bufferTimeBefore: [null, Validators.required],
                bufferTimeAfter: [null, Validators.required],
                minCapacity: [null, Validators.required],
                maxCapacity: [null, Validators.required],
                minimumTimeRequiredBeforeCancelation: [null, Validators.required],
                minimumTimeRequiredBeforeBooking: [null, Validators.required],
                minimumTimeRequiredBeforeReschedueling: [null, Validators.required],
                isShowWebsite: [false],
                isAppointmentRecurring: [false]
            })
        });
    }

    /**
     *
     * @param chosedService
     */
    addServiceCategory(chosedService: Services): void {
        this.isServiceDialog = true;
        this.isNewServiceSubCategory = true;
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Porpuse : this function is created to call an api that responsible for adding a new service
     */
    addNewCategory(): void {
        //logic goes here
        const body = {
            name: this.addServiceForm.controls['name'].value
        };
        this.data.push(body)
        this.hideDialog()

    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Porpuse : this function is responsible for fetch all added services by it's added categories
     */
    getAllAddedServices(): void {
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Porpuse : this function is responsible for update the selected service
     */
    updateSelectedService(): void { }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Porpuse : this function is responsible for delete the selected service
     */
    deleteSeletedService(): void { }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Porpuse : this function is responsible for set the data for the chosed service and it's category
     * @param chosedService
     */
    editSelectedService(chosedService: Services): void {
        this.isEditService = true;
    }

    /**
    * Developer : Eng/Tarek Ahmed Ramadan
    * Created Date : 1/6/2025
    * Porpuse : this function is responsible for close the dialog  
    */
    hideDialog(): void {
        this.isEditService = false;
        this.isNewServiceSubCategory = false;
        this.isServiceDialog = false
    }


    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * porpuse : this function is responsible for fetch an api that show the added service per each chosed category
     * @param ev this is the selected category needed to show the added services for it
     */
    showServicesForSelectedCategory(ev: any): void {
        //api implementation goes here
    }


    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Porpuse : fetch accurate data by search in an input in the desired table
     * @param table
     * @param event
     */
    // onGlobalFilter(table: TableComponent, event: Event) {
    //     table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    // }
}
