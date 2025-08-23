import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SharedService {
    config = environment.apiUrl;
    constructor(private http: HttpClient) {}

    uploadFileService(file: File, folderName: string): any {
        if (!file) {
            return;
        }
        const formData = new FormData();
        formData.append('file', file, file.name);
        return this.http.post(this.config + `UploadFiles?folderName=${folderName}`, formData);
    }
}
