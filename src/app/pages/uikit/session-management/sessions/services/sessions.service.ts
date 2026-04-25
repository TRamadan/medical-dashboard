import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  /**
   * Fetch all doctors that work at the given location within the specified date range.
   * @param locationId  ID of the selected location
   * @param fromDate    Start date (YYYY-MM-DD)
   * @param toDate      End date (YYYY-MM-DD)
   */
  getAllCalenderData(date: string, slotMinutes: number = 15, doctorId?: number, locationId?: number, endDate?: string) {
    let params = new HttpParams()
      .set('DateFrom', date)
      .set('SlotMinutes', slotMinutes);

    if (doctorId) {
      params = params.set('DoctorId', doctorId);
    }

    if (locationId) {
      params = params.set('LocationId', locationId);
    }

    if (endDate) {
      params = params.set('DateTo', endDate);
    }

    return this.http.get(`${this.apiUrl}Appointments/Calendar`, { params });
  }
}
