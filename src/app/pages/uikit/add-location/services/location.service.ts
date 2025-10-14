import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    // Replace with your actual backend API endpoint
    private apiUrl = 'http://localhost:5000/api/Locations';

    constructor(private http: HttpClient) {}

    // CREATE: Add a new location
    addLocation(location: Location): Observable<Location> {
        return this.http.post<Location>(this.apiUrl, location);
    }

    // READ: Get all locations
    getLocations(): Observable<Location[]> {
        return this.http.get<Location[]>(this.apiUrl);
    }

    // UPDATE: Update an existing location
    updateLocation(location: Location): Observable<Location> {
        return this.http.put<Location>(`${this.apiUrl}`, location);
    }

    // DELETE: Delete a location by its ID
    deleteLocation(id: any): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
