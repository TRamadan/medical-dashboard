import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RoleGroupService {
    private apiUrl = 'http://localhost:5000/api/RoleGroupe';

    constructor(private http: HttpClient) {}

    /**
     * Adds a list of role-group associations.
     * @param roleGroupData The data for the role-group associations.
     * @returns An observable with the response.
     */
    addRoleGroup(roleGroupData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/AddList`, roleGroupData);
    }

    /**
     * Updates a role-group association.
     * @param roleGroupData The updated role-group data.
     * @returns An observable with the response.
     */
    updateRoleGroup(roleGroupData: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/Update`, roleGroupData);
    }

    /**
     * Gets a role-group association by its ID.
     * @param id The ID of the role-group to retrieve.
     * @returns An observable with the role-group data.
     */
    getRoleGroupById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/GetById?id=${id}`);
    }

    /**
     * Deletes a role-group association by its ID.
     * @param id The ID of the role-group to delete.
     * @returns An observable with the response.
     */
    deleteRoleGroup(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/Delete?id=${id}`);
    }
}
