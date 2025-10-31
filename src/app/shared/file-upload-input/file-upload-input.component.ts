import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SharedService } from '../../shared/services/shared.service';
import { MessageService } from 'primeng/api';

@Component({
    standalone: true,
    selector: 'app-file-upload-input',
    templateUrl: './file-upload-input.component.html',
    styleUrls: ['./file-upload-input.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FileUploadInputComponent),
            multi: true
        }
    ]
})
export class FileUploadInputComponent {
    @Input() label: string = 'Image';
    @Input() folderName: string = 'General'; // هنا بنحدد الفولدر اللي يترفع فيه

    previewUrl: string | null = null;
    disabled: boolean = false;
    private innerValue: string | null = null;
    onChange: any = () => {};
    onTouched: any = () => {};
    constructor(
        private _uploadFileService: SharedService,
        private _messageService: MessageService
    ) {}

    writeValue(value: string | null): void {
        this.innerValue = value;
        this.previewUrl = value ? value : null;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (!file) return;

        this._uploadFileService.uploadFileService(file, this.folderName).subscribe({
            next: (res: any) => {
                this.innerValue = res.filePath;
                this.onChange(res.filePath);
                this.onTouched();

                // preview
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.previewUrl = e.target.result;
                };
                reader.readAsDataURL(file);

                this._messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Image uploaded successfully.'
                });
            },
            error: () => {
                this._messageService.add({
                    severity: 'error',
                    summary: 'Upload Failed',
                    detail: 'Could not upload image. Please try again.'
                });
            }
        });
    }
}
