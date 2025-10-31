import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workinghours } from '../models/workinghours';

@Injectable({
    providedIn: 'root'
})
export class WorkinghoursService {
    private apiUrl = 'http://localhost:5000/api/WorkingHours';

    constructor(private http: HttpClient) {}

    /**
     * CREATE: Adds a new working hours to the backend.
     * @param workingHours An array of working hour objects.
     */
    addWorkingHours(workingHours: Workinghours[]): Observable<Workinghours[]> {
        return this.http.post<Workinghours[]>(this.apiUrl + '/AddList', workingHours);
    }

    /**
     * READ: Retrieves all working hours from the backend.
     */
    getWorkingHours(): Observable<Workinghours[]> {
        return this.http.get<Workinghours[]>(this.apiUrl);
    }

    /**
     * UPDATE: Updates an existing working hour by its ID.
     */
    updateWorkingHour(workingHour: Partial<Workinghours>): Observable<Workinghours> {
        return this.http.put<Workinghours>(`${this.apiUrl}`, workingHour);
    }

    /**
     * DELETE: Deletes a working hour by its ID.
     */
    deleteWorkingHour(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
