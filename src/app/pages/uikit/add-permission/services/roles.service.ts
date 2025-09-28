import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RolesService {
    private apiUrl = 'http://hamoudasw-001-site1.mtempurl.com/api/';

    constructor(private http: HttpClient) {}

    /**
     * A function to get all added roles
     * @returns An observable with the list of roles.
     */
    getAllRoles(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + 'Role/GetAll');
    }

    /**
     * A function to add a new role
     * @param role The role data to create.
     * @returns An observable with the response.
     */
    addRole(role: any): Observable<any> {
        return this.http.post<any>(this.apiUrl + 'Role/AddList', role);
    }

    /**
     * A function to update the selected role
     * @param id The ID of the role to update.
     * @param role The updated role data.
     * @returns An observable with the response.
     */
    updateRole(role: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}${'Role/Update'}`, role);
    }

    /**
     * A function to delete the selected role
     * @param id The ID of the role to delete.
     * @returns An observable with the response.
     */
    deleteRole(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}${'Role/Delete'}${id}`);
    }
}
