import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class CalendarService {
    apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    //here is the function needed to get all calender data
    getAllCalenderData(date: string, slotMinutes: number = 30, doctorId?: number) {
        let params = new HttpParams()
            .set('date', date)
            .set('slotMinutes', slotMinutes);

        if (doctorId) {
            params = params.set('doctorId', doctorId);
        }

        return this.http.get(`${this.apiUrl}Appointments/Calendar`, { params });
    }
}
