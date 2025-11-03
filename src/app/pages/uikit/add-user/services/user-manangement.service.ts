import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UserManangementService {
    // I'll use a placeholder for your API URL.
    private apiUrl = 'http://localhost:5000/api/User/';

    constructor(private http: HttpClient) {}

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'An unknown error occurred!';
        if (error.error && error.error.error && Array.isArray(error.error.error.errors) && error.error.error.errors.length > 0) {
            // Extract the English error message from the backend response
            errorMessage = error.error.error.errors[0].errorEn;
        } else if (error.message) {
            // Fallback to the default error message
            errorMessage = error.message;
        }
        return throwError(() => new Error(errorMessage));
    }

    /**
     * A function that gets all added users
     * @returns An observable with the list of users.
     */
    getAllUsers(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + 'GetAll/GetAll').pipe(catchError(this.handleError));
    }

    /**
     * A function that gets the data for a specific user
     * @param id The ID of the user to fetch.
     * @returns An observable with the user data.
     */
    getUserById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}${'GetById/GetById?id='}${id}`).pipe(catchError(this.handleError));
    }

    /**
     * A function to add a new user
     * @param user The user data to create.
     * @returns An observable with the response.
     */
    addUser(user: any): Observable<any> {
        return this.http.post<any>(this.apiUrl + 'RegisterAppUser', user).pipe(catchError(this.handleError));
    }

    /**
     * A function to update the selected user
     * @param id The ID of the user to update.
     * @param user The updated user data.
     * @returns An observable with the response.
     */
    updateUser(id: string, user: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}${'Update/Update'}/${id}`, user).pipe(catchError(this.handleError));
    }

    /**
     * A function to delete the selected user
     * @param id The ID of the user to delete.
     * @returns An observable with the response.
     */
    deleteUser(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}${'Delete/Delete?id='}${id}`).pipe(catchError(this.handleError));
    }

    /**
     * A function that gets all added users
     * @returns An observable with the list of users.
     */
    getAllUserTypes(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + 'GetAllEmployeeTypes').pipe(catchError(this.handleError));
    }
}
