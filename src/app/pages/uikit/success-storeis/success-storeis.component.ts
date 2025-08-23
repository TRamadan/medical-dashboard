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
import { SuccessStory } from './models/successStory';
import { SuccessStoryService } from './services/successStory.service';
import { MessageService } from 'primeng/api';
import { SharedService } from '../../../shared/services/shared.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-success-storeis',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, DialogModule, TableModule, InputTextModule, ToolbarModule, FileUploadModule, TableComponent],
    templateUrl: './success-storeis.component.html',
    styleUrls: ['./success-storeis.component.css']
})
export class SuccessStoreisComponent implements OnInit {
    showAddDialog: boolean = false;
    addSuccessStoryForm!: FormGroup;
    selectedSuccessStory: any = {};
    allSuccessStories: SuccessStory[] = [];
    isEdit: boolean = false;
    isDelete: boolean = false;
    uploadResponse: any;

    tableHeaders: TableColumn[] = [
        { label: 'Title (Arabic)', field: 'titleAr', type: 'text' },
        { label: 'Title (English)', field: 'titleEn', type: 'text' },
        { label: 'Description (Arabic)', field: 'descriptionAr', type: 'text' },
        { label: 'Description (English)', field: 'descriptionEn', type: 'text' },
        { label: 'Is Success Story Video', field: 'isSuccessStoryVideo', type: 'boolean' },
        { label: 'Video url', field: 'videoUrl', type: 'text' },
        { label: 'Image', field: 'image', type: 'image' },
        { label: 'Name', field: 'name', type: 'text' },
        { label: 'Person Description (Arabic)', field: 'personDescriptionAr', type: 'text' },
        { label: 'Person Description (English)', field: 'personDescriptionEn', type: 'text' }
    ];
    constructor(
        private fb: FormBuilder,
        private _successStories: SuccessStoryService,
        private _messageService: MessageService,
        private _uploadFileService: SharedService
    ) {}

    ngOnInit() {
        this.addSuccessStoryForm = this.fb.group({
            titleAr: ['', Validators.required],
            titleEn: ['', Validators.required],
            descriptionAr: ['', Validators.required],
            descriptionEn: ['', Validators.required],
            isSuccessStoryVideo: [false],
            videoUrl: [''], // Will be required if isSuccessStoryVideo is true
            image: [''], // Will be required if isSuccessStoryVideo is false
            name: ['', Validators.required],
            personDescriptionAr: ['', Validators.required],
            personDescriptionEn: ['', Validators.required]
        });
        this.getAllSuccessStories();
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Open the dialog for adding/editing a success story
     */
    openServiceDialog(): void {
        this.addSuccessStoryForm.reset();
        this.isEdit = false;
        this.isDelete = false;
        this.showAddDialog = true;
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Fetch all partners from the backend
     */
    getAllSuccessStories(): void {
        this._successStories.getAllSuccessStories().subscribe({
            next: (res: any) => {
                this.allSuccessStories = res;
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', detail: 'There is an error on fetch all success story' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Add a new success story to the system
     */
    addNewSuccessStory(): void {
        const body = this.addSuccessStoryForm.getRawValue();
        this._successStories.createSuccessStory(body).subscribe({
            next: () => {
                this._messageService.add({ severity: 'success', summary: 'Success', detail: 'Success story added successfully' });
                this.showAddDialog = false;
                this.getAllSuccessStories();
            },
            error: (err: any) => {
                this._messageService.add({ severity: 'error', detail: 'There is an error on add a new partner' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Update the selected success story's information
     */
    updateSelectedSuccessStory(): void {
        const body = {};
        this._successStories.updateSuccessStory(body).subscribe({
            next: () => {
                this._messageService.add({ severity: 'success', detail: 'Success story updated successfully' });
                this.getAllSuccessStories();
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', detail: 'Failed to update success story' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Delete the selected partner from the system
     */
    deleteSelectedSuccessStory(): void {
        this._successStories.deleteSuccessStory(this.selectedSuccessStory.id).subscribe({
            next: (res) => {
                this._messageService.add({ severity: 'success', detail: 'Success story deleted successfully' });
                this.getAllSuccessStories();
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', detail: 'Failed to delete success story' });
            }
        });
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Open dialog and set data for the selected success story in the form
     * @param successStory The partner object to edit
     */
    editSuccessStory(successStory: SuccessStory): void {
        this.selectedSuccessStory = { ...successStory };
        this.addSuccessStoryForm.patchValue(this.selectedSuccessStory);
        this.isEdit = true;
        this.showAddDialog = true;
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : Open dialog to confirm success Story deletion
     * @param successStory The success Story object to delete
     */
    deleteSuccessStory(successStory: SuccessStory): void {
        this.selectedSuccessStory = successStory;
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
            this.uploadResponse = await firstValueFrom(this._uploadFileService.uploadFileService(file, 'Success stories'));
            return this.uploadResponse;
        } catch (error: any) {
            this._messageService.add({ severity: 'error', detail: 'Upload failed' });
        }
    }
}
