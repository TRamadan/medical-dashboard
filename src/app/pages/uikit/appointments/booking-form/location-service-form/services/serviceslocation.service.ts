import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Servicecategory } from '../models/servicecategory';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Services } from '../models/services';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class ServiceslocationService {
  private apiUrl = 'https://portalapi.thesportsdoctorlab.com/api/ServiceCategories';
  private ServicesApiUrl = 'https://portalapi.thesportsdoctorlab.com/api/Serivces';
  constructor(private http: HttpClient) { }

  /**
   * READ: Retrieves all service categories from the backend.
   */
  getServiceCategories(): Observable<Servicecategory[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  /**
   * READ: Retrieves all services from the backend.
   */
  getServices(): Observable<Services[]> {
    return this.http
      .get<Services[]>(this.ServicesApiUrl)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Something bad happened; please try again later.';
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
      errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
      errorMessage = `Server returned code ${error.status}: ${error.error || error.statusText
        }`;
    }
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      allowOutsideClick: false,
      text: errorMessage,
    });
    return throwError(() => new Error(errorMessage));
  }
}
