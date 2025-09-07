import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { TableComponent, TableColumn } from '../../../shared/table/table.component';
import { Methodology } from './models/methodology';
import { MethodologyService } from './services/methodology.service';
import { MessageService } from 'primeng/api';
import { SharedService } from '../../../shared/services/shared.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-methodology',
    templateUrl: './methodology.component.html',
    styleUrls: ['./methodology.component.css'],
    standalone: true,
    providers: [MessageService],
    imports: [CardModule, ToastModule, ToggleSwitchModule, SelectModule, TextareaModule, FloatLabelModule, CommonModule, ReactiveFormsModule, ButtonModule, DialogModule, TableModule, InputTextModule, ToolbarModule, FileUploadModule, TableComponent]
})
export class MethodologyComponent implements OnInit {
    showAddDialog: boolean = false;
    public readonly imgUrl = environment.imgUrl;
    addMethodologiesConfig!: FormGroup;
    selectedMethodologiesConfig: Methodology = {};
    allMethodologies: Methodology[] = [];
    icons: any[] = [];
    isEdit: boolean = false;
    isDelete: boolean = false;
    uploadResponse: any;

    constructor(
        private fb: FormBuilder,
        private _methodologyService: MethodologyService,
        private _messageService: MessageService,
        private _uploadFileService: SharedService
    ) {}

    tableHeaders: TableColumn[] = [
        { label: 'Title', field: 'title', type: 'text' },
        { label: 'Title (En)', field: 'titleEn' },
        {
            label: 'Description',
            field: 'description'
        },
        {
            label: 'Description (En)',
            field: 'descriptionEn'
        },
        {
            label: 'image',
            field: 'icon',
            type: 'image'
        },
        {
            label: 'Is ctting edge technology',
            field: 'isCuttingEdgeTechnology',
            type: 'boolean'
        }
    ];

    ngOnInit() {
        this.addMethodologiesConfig = this.fb.group({
            id: [null],
            title: [null, Validators.required],
            titleEn: [null, Validators.required],
            descriptionEn: [null, Validators.required],
            description: [null, Validators.required],
            isCuttingEdgeTechnology: [false, Validators.required],
            icon: ['']
        });
        this.getAllMethodologies();
    }

    openNewMethodologySection(): void {
        this.showAddDialog = true;
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Fetch all methodologies from the backend
     */
    getAllMethodologies(): void {
        this._methodologyService.getAllMethodologies().subscribe({
            next: (res: any) => {
                this.allMethodologies = res;
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', detail: 'There is an error on fetch all partners' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Add a new methodology to the system
     */
    addNewMethodology(): void {
        let body = this.addMethodologiesConfig.getRawValue();
        this._methodologyService.saveNewMethodology(body).subscribe({
            next: () => {
                this._messageService.add({ severity: 'success', summary: 'Success', detail: 'Methodology added successfully' });
                this.showAddDialog = false;
                this.getAllMethodologies();
            },
            error: (err: any) => {
                this._messageService.add({ severity: 'error', detail: 'There is an error on add a new methodology' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Update the selected methodology's information
     */
    updatedMethodology(): void {
        const payload: Methodology = {
            ...this.selectedMethodologiesConfig,
            ...this.addMethodologiesConfig.value
        };
        this._methodologyService.updateMethodology(payload).subscribe({
            next: () => {
                this._messageService.add({ severity: 'success', detail: 'Methodology updated successfully' });
                this.getAllMethodologies();
                this.showAddDialog = false;
                this.isEdit = false;
            },
            error: (err: any) => {
                this._messageService.add({ severity: 'error', detail: 'Failed to update methodology' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Delete the selected methodology from the system
     */
    deleteSelectedMethodology(): void {
        this._methodologyService.deleteMethodology(this.selectedMethodologiesConfig.id).subscribe({
            next: (res) => {
                this._messageService.add({ severity: 'success', detail: 'Methodology deleted successfully' });
                this.getAllMethodologies();
                this.showAddDialog = false;
                this.isDelete = false;
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', detail: 'Failed to delete methodology' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Open dialog and set data for the selected partner in the form
     * @param methodology The methodology object to edit
     */
    editMethodology(methodology: Methodology): void {
        this.selectedMethodologiesConfig = { ...methodology };
        this.addMethodologiesConfig.patchValue(this.selectedMethodologiesConfig);
        this.isEdit = true;
        this.showAddDialog = true;
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Open dialog to confirm methodology deletion
     * @param methodology The methodology object to delete
     */
    deleteMethodology(methodology: Methodology): void {
        this.addMethodologiesConfig.controls['id'].setValue(methodology.id);
        this.selectedMethodologiesConfig = methodology;
        this.isDelete = true;
        this.showAddDialog = true;
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Handle image upload and preview
     * @param event The file upload event
     */
    onImageUpload(event: any): void {
        const file = event.target.files[0];
        let folderName = this.addMethodologiesConfig.controls['isCuttingEdgeTechnology'].value == true ? 'CuttingEdgeTechnology' : 'Methodology';
        if (file) {
            this._uploadFileService.uploadFileService(file, folderName).subscribe({
                next: (res: any) => {
                    this.addMethodologiesConfig.patchValue({
                        icon: res.filePath
                    });

                    // Show preview (optional)
                    const reader = new FileReader();
                    reader.onload = (e: any) => {
                        this.addMethodologiesConfig.patchValue({
                            imageUrl: e.target.result
                        });
                    };
                    reader.readAsDataURL(file);

                    this._messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Image uploaded successfully.'
                    });
                },
                error: (err: any) => {
                    this._messageService.add({
                        severity: 'error',
                        summary: 'Upload Failed',
                        detail: 'Could not upload image. Please try again.'
                    });
                }
            });
        }
    }
}
