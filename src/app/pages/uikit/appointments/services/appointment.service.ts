import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    apiUrl = environment.apiUrl;
    baseUrl = 'Appointments';
    constructor(private http: HttpClient) {}

    //here is the function needed to get all added apointments
    getAddedApointments() {
        return this.http.get(this.apiUrl + this.baseUrl);
    }
}
