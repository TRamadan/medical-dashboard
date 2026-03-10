import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DaysOff } from '../models/days-off';

@Injectable({
    providedIn: 'root'
})
export class DaysOffService {
    // Note: Update this API URL to match your actual backend endpoint routing for Days Off
    private apiUrl = 'https://portalapi.thesportsdoctorlab.com/api/DaysOff';

    constructor(private http: HttpClient) { }

    /**
     * CREATE: Adds a new Days Off record to the backend.
     * @param daysOff The days off object to be created.
     * @returns An observable containing the created Days Off record.
     */
    addDaysOff(daysOff: DaysOff): Observable<DaysOff> {
        return this.http.post<DaysOff>(this.apiUrl, daysOff);
    }

    /**
     * READ ALL: Retrieves all Days Off records from the backend.
     * @returns An observable containing an array of Days Off records.
     */
    getAllDaysOff(): Observable<DaysOff[]> {
        return this.http.get<DaysOff[]>(this.apiUrl);
    }

    /**
     * READ ONE: Retrieves a specific Days Off record by its ID.
     * @param id The unique identifier of the Days Off record.
     * @returns An observable containing the requested Days Off record.
     */
    getDaysOffById(id: number | string): Observable<DaysOff> {
        return this.http.get<DaysOff>(`${this.apiUrl}/${id}`);
    }

    /**
     * UPDATE: Updates an existing Days Off record by its ID.
     * @param id The unique identifier of the Days Off record to update.
     * @param daysOff The updated days off object data.
     * @returns An observable containing the updated Days Off record.
     */
    updateDaysOff(id: number | string, daysOff: Partial<DaysOff>): Observable<DaysOff> {
        return this.http.put<DaysOff>(`${this.apiUrl}/${id}`, daysOff);
    }

    /**
     * DELETE: Deletes a specific Days Off record by its ID.
     * @param id The unique identifier of the Days Off record to delete.
     * @returns An observable that completes when the deletion is successful.
     */
    deleteDaysOff(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
