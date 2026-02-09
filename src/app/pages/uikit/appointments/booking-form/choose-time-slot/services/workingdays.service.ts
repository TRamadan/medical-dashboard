import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class WorkingdaysService {
  private apiUrl =
    'https://portalapi.thesportsdoctorlab.com/api/Appointments/GetAvailableSlotsWithinMoth';
  private slotsUrl = 'https://portalapi.thesportsdoctorlab.com/api/Appointments/GetAvailableSlots';

  constructor(private http: HttpClient) { }

  //here is the function needed to update the calendar
  getWorkingDaysWithinMonth(
    locationId: number,
    serviceId: number,
    MonthNumber: number
  ): Observable<any> {
    const params = {
      locationId: locationId.toString(),
      serviceId: serviceId.toString(),
      MonthNumber: MonthNumber.toString(),
    };
    return this.http
      .get(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  //here is the function needed to get the current slots based on the date
  getAvailableSlots(
    locationId: number,
    serviceId: number,
    dayOfWeek: any
  ): Observable<any> {
    const params = {
      locationId: locationId,
      serviceId: serviceId,
      DateofDay: dayOfWeek,
    };
    return this.http
      .get(this.slotsUrl, { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Something bad happened; please try again later.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      errorMessage = `Server returned code ${error.status}: ${error.error || error.statusText
        }`;
    }

    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      allowOutsideClick: false,
      text: errorMessage,
    });

    // Return an observable with a user-facing error message.
    return throwError(() => new Error(errorMessage));
  }
}
