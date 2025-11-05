import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class CalendarService {
    apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    //here is the function needed to get all calender data
    getAllCalenderData() {
        return this.http.get('../../../../../assets/caldendardata.json');
    }
}
