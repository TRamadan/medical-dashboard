import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { TableComponent, TableColumn } from '../../../shared/table/table.component';
import { Partners } from './models/partners';
import { PartnersService } from './services/partners.service';
import { MessageService } from 'primeng/api';
import { SharedService } from '../../../shared/services/shared.service';
import { firstValueFrom } from 'rxjs';
@Component({
    selector: 'app-partners',
    templateUrl: './partners.component.html',
    styleUrls: ['./partners.component.css'],
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, DialogModule, TableModule, InputTextModule, ToolbarModule, FileUploadModule, TableComponent]
})
export class PartnersComponent implements OnInit {
    showAddDialog: boolean = false;
    addPartnerForm: FormGroup;
    selectedPartner: Partners = {};
    partners: Partners[] = [];
    isEdit: boolean = false;
    isDelete: boolean = false;
    uploadResponse: any;

    tableHeaders: TableColumn[] = [{ label: 'Partner Image', field: 'imageUrl', type: 'image' }];

    constructor(
        private fb: FormBuilder,
        private _partnerService: PartnersService,
        private _messageService: MessageService,
        private _uploadFileService: SharedService
    ) {
        this.addPartnerForm = this.fb.group({
            id: [null],
            logo: [null]
        });
    }

    ngOnInit() {
        this.getAllPartners();
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Open the dialog for adding/editing a partner
     */
    openServiceDialog(): void {
        this.addPartnerForm.reset();
        this.isEdit = false;
        this.isDelete = false;
        this.showAddDialog = true;
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Fetch all partners from the backend
     */
    getAllPartners(): void {
        this._partnerService.getAllPartners().subscribe({
            next: (res: any) => {
                this.partners = res;
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', detail: 'There is an error on fetch all partners' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Add a new partner to the system
     */
    addNewPartner(): void {
        let body = {
            logo: this.uploadResponse.filePath
        };
        this._partnerService.saveNewPartner(body).subscribe({
            next: () => {
                this._messageService.add({ severity: 'success', summary: 'Success', detail: 'Partner added successfully' });
                this.showAddDialog = false;
                this.getAllPartners();
            },
            error: (err: any) => {
                this._messageService.add({ severity: 'error', detail: 'There is an error on add a new partner' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Update the selected partner's information
     */
    updateSelectedPartner(): void {
        const body = {
            id: this.selectedPartner.id,
            logo: this.uploadResponse ? this.uploadResponse.filePath : this.selectedPartner.logo
        };

        this._partnerService.updatePartner(body).subscribe({
            next: () => {
                this._messageService.add({ severity: 'success', detail: 'Partner updated successfully' });
                this.getAllPartners();
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', detail: 'Failed to update partner' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Delete the selected partner from the system
     */
    deleteSelectedPartner(): void {
        this._partnerService.deletePartner(this.selectedPartner.id).subscribe({
            next: (res) => {
                this._messageService.add({ severity: 'success', detail: 'Partner deleted successfully' });
                this.getAllPartners();
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', detail: 'Failed to delete partner' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Open dialog and set data for the selected partner in the form
     * @param partner The partner object to edit
     */
    editPartner(partner: Partners): void {
        this.selectedPartner = { ...partner };
        this.addPartnerForm.patchValue(this.selectedPartner);
        this.isEdit = true;
        this.showAddDialog = true;
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Open dialog to confirm partner deletion
     * @param partner The partner object to delete
     */
    deletePartner(partner: Partners): void {
        this.selectedPartner = partner;
        this.isDelete = true;
        this.showAddDialog = true;
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Handle image upload and preview
     * @param event The file upload event
     */
    async onImageUpload(event: any): Promise<any> {
        const file = event.files?.[0];
        if (!file) return;
        try {
            this.uploadResponse = await firstValueFrom(this._uploadFileService.uploadFileService(file, 'Partners'));
            return this.uploadResponse;
        } catch (error: any) {
            this._messageService.add({ severity: 'error', detail: 'Upload failed' });
        }
    }
}
