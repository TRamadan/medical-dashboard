import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  apiUrl: string = 'https://portalapi.thesportsdoctorlab.com/api/Appointments';
  constructor(private http: HttpClient) { }

  makeAnAppointment(bookingBody: any): any {
    return this.http.post(this.apiUrl, bookingBody);
  }
}
