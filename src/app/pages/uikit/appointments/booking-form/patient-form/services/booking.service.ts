import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  apiUrl: string = 'http://localhost:5000/api/Appointments';
  constructor(private http: HttpClient) {}

  makeAnAppointment(bookingBody: any): any {
    return this.http.post(this.apiUrl, bookingBody);
  }
}
