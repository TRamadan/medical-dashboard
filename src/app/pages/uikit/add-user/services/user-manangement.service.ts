import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserManangementService {
    // I'll use a placeholder for your API URL.
    private apiUrl = 'http://localhost:5000/api/User/';

    constructor(private http: HttpClient) {}

    /**
     * A function that gets all added users
     * @returns An observable with the list of users.
     */
    getAllUsers(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + 'GetAll/GetAll');
    }

    /**
     * A function that gets the data for a specific user
     * @param id The ID of the user to fetch.
     * @returns An observable with the user data.
     */
    getUserById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}${'GetById/GetById?id='}${id}`);
    }

    /**
     * A function to add a new user
     * @param user The user data to create.
     * @returns An observable with the response.
     */
    addUser(user: any): Observable<any> {
        return this.http.post<any>(this.apiUrl + 'RegisterAppUser', user);
    }

    /**
     * A function to update the selected user
     * @param id The ID of the user to update.
     * @param user The updated user data.
     * @returns An observable with the response.
     */
    updateUser(id: string, user: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}${'Update/Update'}/${id}`, user);
    }

    /**
     * A function to delete the selected user
     * @param id The ID of the user to delete.
     * @returns An observable with the response.
     */
    deleteUser(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}${'Delete/Delete?id='}${id}`);
    }
}
