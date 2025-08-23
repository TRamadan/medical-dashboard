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
import { Herosection } from './models/herosection';
import { HerosectionService } from './services/herosection.service';
import { MessageService } from 'primeng/api';
import { SharedService } from '../../../shared/services/shared.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { firstValueFrom } from 'rxjs';
import { TextareaModule } from 'primeng/textarea';
@Component({
    selector: 'app-hero-section-config',
    templateUrl: './hero-section-config.component.html',
    styleUrls: ['./hero-section-config.component.css'],
    providers: [MessageService],
    imports: [TextareaModule, FloatLabelModule, CommonModule, ReactiveFormsModule, ButtonModule, DialogModule, TableModule, InputTextModule, ToolbarModule, FileUploadModule, TableComponent]
})
export class HeroSectionConfigComponent implements OnInit {
    showAddDialog: boolean = false;
    addHeroSectionConfig!: FormGroup;
    selectedHeroSectionConfig: Herosection = {};
    allHeroSections: Herosection[] = [];
    isEdit: boolean = false;
    isDelete: boolean = false;
    uploadResponse: any;
    constructor(
        private fb: FormBuilder,
        private _partnerService: HerosectionService,
        private _messageService: MessageService,
        private _uploadFileService: SharedService
    ) {}

    tableHeaders: TableColumn[] = [
        { label: 'Title', field: 'title', type: 'text' },
        { label: 'Title (En)', field: 'titleEn' },
        { label: 'Sub title', field: 'subtitle', type: 'text' },
        { label: 'Sub title (En)', field: 'subtitleEn' },
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
            field: 'img'
        }
    ];

    ngOnInit() {
        this.addHeroSectionConfig = this.fb.group({
            id: [null],
            title: [null, Validators.required],
            titleEn: [null, Validators.required],
            descriptionEn: [null, Validators.required],
            description: [null, Validators.required]
        });
    }

    openHeroSectionConfig(): void {
        this.showAddDialog = true;
    }

    edtiHeroSectionConfig(heroSectionConfig: Herosection): void {
        this.isEdit = true;
        this.showAddDialog = true;
        this.selectedHeroSectionConfig = { ...heroSectionConfig };
        this.addHeroSectionConfig.patchValue({
            id: heroSectionConfig.id,
            title: heroSectionConfig.title,
            titleEn: heroSectionConfig.titleEn,
            description: heroSectionConfig.description,
            descriptionEn: heroSectionConfig.descriptionEn,
            image: heroSectionConfig.image
        });
    }

    getAllHeroSectionConfig(): void {
        this._partnerService.getAllHeroSectionConfig().subscribe({
            next: (res: any) => {
                this.allHeroSections = res;
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', detail: 'There is an error on fetch hero section config' });
            }
        });
    }

    updateHeroSectionConfig(): void {
        const body = {};

        this._partnerService.updateHeroSectionConfig(body).subscribe({
            next: () => {
                this._messageService.add({ severity: 'success', detail: 'hero section config updated successfully' });
                this.getAllHeroSectionConfig();
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', detail: 'Failed to update hero section config' });
            }
        });
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
