import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workinghours } from '../models/workinghours';

@Injectable({
    providedIn: 'root'
})
export class WorkinghoursService {
    private apiUrl = 'https://portalapi.thesportsdoctorlab.com/api/WorkingHours';

    constructor(private http: HttpClient) { }

    /**
     * CREATE: Adds a new working hours to the backend.
     * @param workingHours An array of working hour objects.
     */
    addWorkingHours(workingHours: Workinghours): Observable<any> {
        return this.http.post<any>(this.apiUrl + '/AddBulkWorkingHoursAsync', workingHours);
    }

    /**
     * READ: Retrieves all working hours from the backend.
     */
    getWorkingHours(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    /**
     * READ BY USER ID: Retrieves all working hours for a specific user.
     */
    getWorkingHoursByUserId(userId: string | number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/GetDoctorWorkingHours/${userId}`);
    }

    /**
     * UPDATE: Updates an existing working hour by its ID.
     */
    updateWorkingHour(workingHour: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}`, workingHour);
    }

    /**
     * DELETE: Deletes a working hour by its ID.
     */
    deleteWorkingHour(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    /**
     * READ BY USER ID: Retrieves all assigned services for a specific user.
     */
    getAssignedServicesForUser(userId: string | number): Observable<any[]> {
        return this.http.get<any[]>(`https://portalapi.thesportsdoctorlab.com/api/Serivces/user/${userId}/services`);
    }
}
