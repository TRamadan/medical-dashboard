import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class CalendarService {
    apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    //here is the function needed to get all calender data
    getAllCalenderData(date: string, slotMinutes: number = 30, doctorId?: number, locationId?: number, endDate?: string) {
        let params = new HttpParams()
            .set('date', date)
            .set('slotMinutes', slotMinutes);

        if (doctorId) {
            params = params.set('doctorId', doctorId);
        }

        if (locationId) {
            params = params.set('locationId', locationId);
        }

        if (endDate) {
            params = params.set('toDate', endDate);
        }

        return this.http.get(`${this.apiUrl}Appointments/Calendar`, { params });
    }

    getAvailableDoctors(locationId: number, fromDate: string, toDate: string) {
        let params = new HttpParams()
            .set('locationId', locationId)
            .set('fromDate', fromDate)
            .set('toDate', toDate);

        return this.http.get(`${this.apiUrl}WorkingHours/available-doctors`, { params });
    }
}
