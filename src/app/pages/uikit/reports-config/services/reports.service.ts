import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Category, Reporttemplates } from '../models/reporttemplates';

@Injectable({
    providedIn: 'root'
})
export class ReportsService {
    private readonly apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    /**
     * Fetches all reports.
     * @returns An Observable array of Reporttemplates.
     */
    getAllReports(): Observable<Reporttemplates[]> {
        return this.http.get<Reporttemplates[]>(`${this.apiUrl}/ReportTemplates`);
    }

    /**
     * Creates a new report.
     * @param report The report data to create.
     * @returns An Observable of the created Report.
     */
    createReport(report: any): Observable<Reporttemplates> {
        return this.http.post<Reporttemplates>(`${this.apiUrl}/ReportTemplates`, report);
    }

    /**
     * Updates an existing report.
     * @param report The report data to update.
     * @returns An Observable of the server response.
     */
    updateReport(report: Reporttemplates): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/ReportTemplates/${report.id}`, report);
    }

    deleteReport(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/ReportTemplates/${id}`);
    }
}
