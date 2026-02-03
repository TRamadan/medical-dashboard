import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MeasurementTemplatesService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    /**
     * Get all measurement templates
     * @returns An observable with the list of templates.
     */
    getAllTemplates(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + 'MeasurementTemplates');
    }

    /**
     * Add a new measurement template
     * @param template The template data to create.
     * @returns An observable with the response.
     */
    addTemplate(template: { name: string; description: string; measurements: { measurementId: number; order: number }[] }): Observable<any> {
        return this.http.post<any>(this.apiUrl + 'MeasurementTemplates', template);
    }

    /**
     * Update an existing measurement template
     * @param template The updated template data.
     * @returns An observable with the response.
     */
    updateTemplate(template: any, templateId : number): Observable<any> {
        return this.http.put<any>(this.apiUrl + 'MeasurementTemplates/'+ templateId, template);
    }

    /**
     * Delete a measurement template
     * @param id The ID of the template to delete.
     * @returns An observable with the response.
     */
    deleteTemplate(id: string | number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}MeasurementTemplates/${id}`);
    } 

       /**
     * Get all measurement templates
     * @returns An observable with the list of templates.
     */
    getSpecificTemplateData(templateId : number): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + 'MeasurementTemplates/' + templateId);
    }
}
