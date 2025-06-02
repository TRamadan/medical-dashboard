import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
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
        TableModule,
        FormsModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
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

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        this.initialiseServiceForm();
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
    addServiceCategory(chosedService?: Services): void {
        this.isServiceDialog = true;
        this.isNewServiceSubCategory = true;
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Porpuse : this function is created to call an api that responsible for adding a new service
     */
    addNewService(): void {
        //logic goes here
        const body = {
            name: this.addServiceForm.controls['name'].value
        };
    }

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Porpuse : this function is responsible for fetch all added services by it's added categories
     */
    getAllAddedServices(): void {}

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Porpuse : this function is responsible for update the selected service
     */
    updateSelectedService(): void {}

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 2/6/2025
     * Porpuse : this function is responsible for delete the selected service
     */
    deleteSeletedService(): void {}

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
     * Porpuse : fetch accurate data by search in an input in the desired table
     * @param table
     * @param event
     */
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
