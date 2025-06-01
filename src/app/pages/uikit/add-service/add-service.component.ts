import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
@Component({
    selector: 'app-add-service',
    standalone: true,
    imports: [
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
        CardModule
    ],
    templateUrl: './add-service.component.html',
    styleUrls: ['./add-service.component.css']
})
export class AddServiceComponent implements OnInit {
    isNewServiceSubCategory: boolean = false;
    isEditService: boolean = false;
    isEditServiceSubCategory: boolean = false;
    isServiceDialog: boolean = false;

    constructor() {}

    ngOnInit() {}

    /**
     * Developer: Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Porpuse : this function is created to open a dialog to add a new service
     */
    openServiceDialog(): void {
        this.isServiceDialog = true;
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
