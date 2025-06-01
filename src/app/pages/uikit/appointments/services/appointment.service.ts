import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    baseUrl = '';
    constructor(private http: HttpClient) {}

    /**
     * Developer : Eng/Tarek Ahmed Ramadan
     * Created Date : 1/6/2025
     * Purpose : This funcion call an endpoint that fetch all added appointments
     */
    getAllAppointments() {
        return this.http.get('');
    }
}
