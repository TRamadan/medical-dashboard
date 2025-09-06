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
import { FloatLabelModule } from 'primeng/floatlabel';
import { Benefits } from './models/benefits';
import { BenefitsService } from './services/benefits.service';
import { MessageService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { environment } from '../../../../environments/environment';
import { SharedService } from '../../../shared/services/shared.service';
@Component({
    selector: 'app-benefits',
    templateUrl: './benefits.component.html',
    providers: [MessageService],
    styleUrls: ['./benefits.component.css'],
    standalone: true,
    imports: [ToastModule, SelectModule, TextareaModule, FloatLabelModule, CommonModule, ReactiveFormsModule, ButtonModule, DialogModule, TableModule, InputTextModule, ToolbarModule, FileUploadModule, TableComponent]
})
export class BenefitsComponent implements OnInit {
    allBenefits: Benefits[] = [];
    icons: any[] = [];
    showAddDialog: boolean = false;
    addBenefitForm!: FormGroup;
    choosedBenefit: Benefits = {};
    isEdit: boolean = false;
    isDelete: boolean = false;
    uploadResponse: any;
    public readonly imgUrl = environment.imgUrl;

    constructor(
        private fb: FormBuilder,
        private _benefitsService: BenefitsService,
        private _messageService: MessageService,
        private __uploadFileService: SharedService
    ) {
        this.addBenefitForm = this.fb.group({
            id: [null],
            title: [null, Validators.required],
            titleEn: [null, Validators.required],
            description: [null, Validators.required],
            descriptionEn: [null, Validators.required],
            icon: [null]
        });
    }

    ngOnInit() {
        this.getAllBenefits();
    }

    tableHeaders: TableColumn[] = [
        {
            label: 'title',
            field: 'title'
        },
        {
            label: 'title (En)',
            field: 'titleEn'
        },
        {
            label: 'Description',
            field: 'description'
        },
        {
            label: 'Description (En)',
            field: 'descriptionEn'
        },
        {
            label: 'icon',
            field: 'icon',
            type: 'image'
        }
    ];

    //here is the function needed to open the dialog needed to add
    openBenefitsDialog(): void {
        this.showAddDialog = true;
    }

    //here is the function needed to set the choosed benefit
    editBenefit(selectedBenefit: Benefits): void {
        this.choosedBenefit = { ...selectedBenefit };
        this.addBenefitForm.patchValue(this.choosedBenefit);
        this.showAddDialog = true;
        this.isEdit = true;
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Open dialog to confirm partner deletion
     * @param benefit The partner object to delete
     */
    deleteBenefit(benefit: Benefits): void {
        this.choosedBenefit = { ...benefit };
        this.isDelete = true;
        this.showAddDialog = true;
    }
    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Fetch all benefits from the backend
     */
    getAllBenefits(): void {
        this._benefitsService.getAllBenefits().subscribe({
            next: (res: any) => {
                this.allBenefits = res;
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', detail: 'There is an error on fetch all benefits' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Add a new benefit to the system
     */
    addNewBenefit(): void {
        let body = this.addBenefitForm.getRawValue();
        this._benefitsService.saveNewBenefit(body).subscribe({
            next: () => {
                this._messageService.add({ severity: 'success', summary: 'Success', detail: 'New benefit added successfully' });
                this.showAddDialog = false;
                this.addBenefitForm.reset();
                this.getAllBenefits();
            },
            error: (err: any) => {
                this._messageService.add({ severity: 'error', detail: 'There is an error on add a new benefit' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Update the selected benefit's information
     */
    updateSelectedBenefit(): void {
        let body = this.addBenefitForm.getRawValue();
        this._benefitsService.updateBenefit(body).subscribe({
            next: () => {
                this._messageService.add({ severity: 'success', detail: 'Benefit updated successfully' });
                this.getAllBenefits();
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', detail: 'Failed to update benefit' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Delete the selected benefit from the system
     */
    deleteSelectedBenefit(): void {
        this._benefitsService.deleteBenefit(this.choosedBenefit.id).subscribe({
            next: (res) => {
                this._messageService.add({ severity: 'success', detail: 'Benefit deleted successfully' });
                this.showAddDialog = false;
                this.isDelete = false;
                this.getAllBenefits();
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', detail: 'Failed to delete benefit' });
            }
        });
    }

    onImageUpload(event: any): void {
        const file = event.target.files[0];
        let folderName = 'Benefits section';
        if (file) {
            this.__uploadFileService.uploadFileService(file, folderName).subscribe({
                next: (res: any) => {
                    this.addBenefitForm.patchValue({
                        icon: res.filePath
                    });

                    const reader = new FileReader();
                    reader.onload = (e: any) => {
                        this.addBenefitForm.patchValue({
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
