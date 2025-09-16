import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { CommonModule } from '@angular/common';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TableComponent, TableColumn } from '../../../shared/table/table.component';
import { FileUploadModule } from 'primeng/fileupload';
import { Superstars } from './models/superstars';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox';
import { SuperstarsService } from './service/superstars.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../environments/environment';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-super-stars',
    templateUrl: './super-stars.component.html',
    styleUrls: ['./super-stars.component.css'],
    standalone: true,
    providers: [MessageService],
    imports: [CardModule, ToastModule, CheckboxModule, InputIconModule, IconFieldModule, CommonModule, ToolbarModule, ReactiveFormsModule, ButtonModule, DialogModule, FileUploadModule, TableModule, InputTextModule, TableComponent, FloatLabelModule]
})
export class SuperStarsComponent implements OnInit {
    public readonly imgUrl = environment.imgUrl;
    showAddDialog: boolean = false;
    addSuperStarForm: FormGroup;
    selectedSuperStar: Superstars = {};
    superStars: Superstars[] = [];
    isEdit: boolean = false;
    isDelete: boolean = false;
    tableHeaders: TableColumn[] = [
        { label: 'Name', field: 'name' },
        { label: 'Sport (AR)', field: 'sport' },
        { label: 'Sport (EN)', field: 'sportEn' },
        { label: 'Achievement (AR)', field: 'achievement' },
        { label: 'Achievement (EN)', field: 'achievementEn' },
        { label: 'Description (AR)', field: 'description' },
        { label: 'Description (EN)', field: 'descriptionEn' },
        { label: 'Athelte image', field: 'image', type: 'image' },
        {
            label: 'Is Elite',
            field: 'isElite'
        }
    ];

    constructor(
        private fb: FormBuilder,
        private _superStarsService: SuperstarsService,
        private _messageService: MessageService
    ) {
        this.addSuperStarForm = this.fb.group({
            id: [null],
            name: ['', [Validators.required, Validators.pattern(/^[\p{L}\s]+$/u)]],
            sport: ['', [Validators.required, Validators.pattern(/^[\u0621-\u064A\s]+$/)]],
            sportEn: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
            achievement: ['', [Validators.required, Validators.pattern(/^[\u0621-\u064A\s]+$/)]],
            achievementEn: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
            description: ['', [Validators.required, Validators.pattern(/^[\u0621-\u064A0-9\s\.\،\-]+$/)]],
            descriptionEn: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\s\.\,\-]+$/)]],
            image: [''],
            isElite: [false]
        });
    }

    ngOnInit() {
        this.getAllSuperStars();
    }

    openServiceDialog(): void {
        this.addSuperStarForm.reset();
        this.isEdit = false;
        this.isDelete = false;
        this.showAddDialog = true;
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Porpuse : this function is responsible for fetching and endpoint that fetch all added super stars
     */
    getAllSuperStars(): void {
        this._superStarsService.getAllSuperStars().subscribe({
            next: (res: any) => {
                this.superStars = res;
            },
            error: (err: any) => {
                this._messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong. Please try again later.'
                });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Porpuse : this function is responsible for fetching and endpoint that to add a new super stars
     */
    addNewSuperStar(): void {
        this.addSuperStarForm.removeControl('id');
        if (this.addSuperStarForm.invalid) return;

        const payload: Superstars = this.addSuperStarForm.value;

        this._superStarsService.addNewSuperStar(payload).subscribe({
            next: (res) => {
                this.getAllSuperStars();
                this.showAddDialog = false;
                this.addSuperStarForm.reset({ isElite: false });
                this._messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'New Athelete is addedd successfully.'
                });
            },
            error: (err) => {
                this._messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong. Please try again later.'
                });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Porpuse : this function is responsible for fetching and endpoint that to update the selected super stars
     */
    updateSelectedSuperStar(): void {
        if (!this.selectedSuperStar) return;

        const payload: Superstars = {
            ...this.selectedSuperStar,
            ...this.addSuperStarForm.value
        };

        this._superStarsService.updateSelectedSuperStar(payload).subscribe({
            next: (res) => {
                console.log('Super star updated successfully:', res);
                this.getAllSuperStars();
                this.isEdit = false;
                this.showAddDialog = false;
                this.addSuperStarForm.reset({ isElite: false });
                this._messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Selected athelete is updated successfully.'
                });
            },
            error: (err) => {
                this._messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong. Please try again later.'
                });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Porpuse : this function is responsible for fetching and endpoint that to update the delete selected super stars
     */
    deleteSelectedSuperStar(): void {
        let id = this.addSuperStarForm.controls['id'].value;
        this._superStarsService.deleteSelectedSuperStar(id).subscribe({
            next: () => {
                this.isDelete = false;
                this.showAddDialog = false;
                this.getAllSuperStars();
                this._messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Selected Athelete deleted successfully.'
                });
            },
            error: (err) => {
                this._messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong. Please try again later.'
                });
            }
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
     * Created Date : 10/6/2025
     * Porpuse : open a dialog and set the data for the selected super star in the form
     * @param ev
     */
    editSuperStar(ev: any): void {
        this.selectedSuperStar = { ...ev };
        this.addSuperStarForm.patchValue({ ...this.selectedSuperStar });
        this.isEdit = true;
        this.showAddDialog = true;
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Porpuse : open a dialog that confirm delete a super star
     * @param ev
     */
    deleteSuperStar(ev: any): void {
        this.addSuperStarForm.controls['id'].setValue(ev.id);
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
        let folderName = this.addSuperStarForm.controls['isElite'].value == true ? 'Ordinarysuperstars' : 'Elitesuperstars';
        if (file) {
            this._superStarsService.uploadFile(file, folderName).subscribe({
                next: (res: any) => {
                    this.addSuperStarForm.patchValue({
                        image: res.filePath
                    });

                    // Show preview (optional)
                    const reader = new FileReader();
                    reader.onload = (e: any) => {
                        this.addSuperStarForm.patchValue({
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
