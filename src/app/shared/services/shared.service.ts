import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SharedService {
    private uploadUrl = environment.apiUrlWebsite + 'UploadFiles';
    private uploadUrlDashboard = environment.uploadUrl;
    constructor(private http: HttpClient) {}

    uploadFileService(file: File, folderName: string): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post(`${this.uploadUrl}?folderName=${folderName}`, formData);
    } 

    uploadFileServicePortal(file: File, folderName: string): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post(`${this.uploadUrlDashboard}?folderName=${folderName}`, formData);
    }
}
