import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    apiUrl = environment.apiUrl;
    baseUrl = 'Appointments';
    constructor(private http: HttpClient) { }

    //here is the function needed to get all added apointments
    getAddedApointments() {
        return this.http.get(this.apiUrl + this.baseUrl);
    }

    //here is the functio needed to update the appointment status
    updateAppointmentStatus(appointmentId: number, newStatus: number) {
        const params = new HttpParams().set('appointmentId', appointmentId).set('newStatus', newStatus);
        return this.http.put(`${this.apiUrl}Appointments/ChangeAppointmentStatus`, {}, { params });
    }

    //here is the funtion needed to filter appointments 
    getFilteredAppointments(
        filters: {
            locationId?: number;
            doctorId?: number;
            fromDate?: string;
            toDate?: string;
            status?: string;
            isUrgent?: boolean;
        },
        pageNumber: number = 1,
        pageSize: number = 10
    ): Observable<any> {

        let params = new HttpParams()
            .set('PageNumber', pageNumber.toString())
            .set('PageSize', pageSize.toString());

        if (filters.locationId !== undefined) {
            params = params.set('LocationId', filters.locationId.toString());
        }

        if (filters.doctorId !== undefined) {
            params = params.set('DoctorId', filters.doctorId.toString());
        }

        if (filters.fromDate) {
            params = params.set('FromDate', filters.fromDate);
        }

        if (filters.toDate) {
            params = params.set('ToDate', filters.toDate);
        }

        if (filters.status) {
            params = params.set('Status', filters.status);
        }

        if (filters.isUrgent !== undefined) {
            params = params.set('IsUrgent', filters.isUrgent.toString());
        }

        return this.http.get(
            `${this.apiUrl}${this.baseUrl}/GetAppointmentsPaginated`,
            { params }
        );
    }

    //here is the function needed to get the appointments count based on each status 
    getAppointmentsCountByStatus(locationId: number): Observable<any> {
        return this.http.get(this.apiUrl + this.baseUrl + '/dashboard/status-summary/' + locationId);
    }

    /** POST /api/ConsultationProfile/{consultationProfileId}/mark-paid
     *  Toggles the isPaid flag on a consultation profile row. */
    markAsPaid(consultationProfileId: number): Observable<void> {
        return this.http.patch<void>(
            `${this.apiUrl}ConsultationProfile/${consultationProfileId}/mark-paid`,
            {}
        ).pipe(
            catchError((err: HttpErrorResponse) => throwError(() => err))
        );
    }
}
