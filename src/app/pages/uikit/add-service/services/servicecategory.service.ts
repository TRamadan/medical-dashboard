import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servicecategory } from '../models/servicecategory';

@Injectable({
    providedIn: 'root'
})
export class ServicecategoryService {
    private apiUrl = 'https://portalapi.thesportsdoctorlab.com/api/ServiceCategories';

    constructor(private http: HttpClient) { }

    /**
     * CREATE: Adds a new service category to the backend.
     */
    addServiceCategory(category: Servicecategory): Observable<Servicecategory> {
        return this.http.post<Servicecategory>(this.apiUrl, category);
    }

    /**
     * READ: Retrieves all service categories from the backend.
     */
    getServiceCategories(): Observable<Servicecategory[]> {
        return this.http.get<Servicecategory[]>(this.apiUrl);
    }

    /**
     * UPDATE: Updates an existing service category by its ID.
     */
    updateServiceCategory(categoryUpdate: Partial<Servicecategory>): Observable<Servicecategory> {
        return this.http.put<Servicecategory>(`${this.apiUrl}`, categoryUpdate);
    }

    /**
     * DELETE: Deletes a service category by its ID.
     */
    deleteServiceCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    /**
     * GET: Retrieves the remaining duration for a service by its ID.
     */
    getRestOfDuration(serviceId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/GetRestOfDuration/${serviceId}`);
    }
}
