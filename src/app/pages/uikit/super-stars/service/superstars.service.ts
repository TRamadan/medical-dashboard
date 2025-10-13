import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SuperstarsService {
    private baseUrl = environment.apiUrlWebsite + 'SuperstarAthlete';

    constructor(private http: HttpClient) {}

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : this function is responsible for fetching an endpoint that fetch all added super stars
     */
    getAllSuperStars(): Observable<any> {
        return this.http.get(this.baseUrl);
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : this function is responsible for fetching an endpoint that to add a new super star
     */
    addNewSuperStar(payload: any): Observable<any> {
        return this.http.post(this.baseUrl, payload);
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : this function is responsible for fetching an endpoint that to update the selected super star
     */
    updateSelectedSuperStar(payload: any): Observable<any> {
        return this.http.put(this.baseUrl, payload);
    }

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 10/6/2025
     * Purpose : this function is responsible for fetching an endpoint that to delete the selected super star
     */
    deleteSelectedSuperStar(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`);
    }
}
