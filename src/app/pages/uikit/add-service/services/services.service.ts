import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Services } from '../models/services';

@Injectable({
    providedIn: 'root'
})
export class ServicesService {
    private apiUrl = 'https://portalapi.thesportsdoctorlab.com/api/Serivces';

    constructor(private http: HttpClient) { }

    /**
     * CREATE: Adds a new service to the backend.
     */
    addService(service: Services): Observable<Services> {
        return this.http.post<Services>(this.apiUrl, service);
    }

    /**
     * READ: Retrieves all services from the backend.
     */
    getServices(): Observable<Services[]> {
        return this.http.get<Services[]>(this.apiUrl);
    }

    /**
     * UPDATE: Updates an existing service by its ID.
     */
    updateService(serviceUpdate: Services): Observable<Services> {
        return this.http.put<Services>(`${this.apiUrl}`, serviceUpdate);
    }

    /**
     * DELETE: Deletes a service by its ID.
     */
    deleteService(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
