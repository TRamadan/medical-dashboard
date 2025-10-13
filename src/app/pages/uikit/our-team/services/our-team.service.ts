import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OurTeamService {
    private readonly baseUrl = environment.apiUrlWebsite;

    constructor(private http: HttpClient) {}

    /**
     * Get all Advisor Board members
     */
    getAll(apiUrl: string): Observable<any> {
        return this.http.get<any>(this.baseUrl + apiUrl);
    }

    /**
     * Create a new Advisor Board member
     * @param payload Member data
     */
    create(apiUrl: string, payload: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + apiUrl, payload);
    }

    /**
     * Update an existing Advisor Board member
     * @param payload Updated member data
     */
    update(apiUrl: string, payload: any): Observable<any> {
        return this.http.put<any>(this.baseUrl + apiUrl, payload);
    }

    /**
     * Delete an Advisor Board member
     * @param id Member ID
     */
    delete(apiUrl: string, id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}${apiUrl}/${id}`);
    }
}
