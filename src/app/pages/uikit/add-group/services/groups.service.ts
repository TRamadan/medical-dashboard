import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Group } from '../models/group';

@Injectable({
    providedIn: 'root'
})
export class GroupsService {
    private apiUrl = 'http://localhost:5000/api/';

    constructor(private http: HttpClient) {}
    /**
     * A function to get all added groups
     * @returns An observable with the list of groups.
     */
    getAllGroups(): Observable<Group[]> {
        return this.http.get<Group[]>(this.apiUrl + 'Groupe/GetAll');
    }

    /**
     * A function to add a new group
     * @param group The group data to create.
     * @returns An observable with the response.
     */
    addGroup(group: any): Observable<any> {
        return this.http.post<any>(this.apiUrl + 'Groupe/AddList', group);
    }

    /**
     * A function to update the selected group
     * @param group The updated group data.
     * @returns An observable with the response.
     */
    updateGroup(group: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}${'Groupe/Update'}`, group);
    }

    /**
     * A function to delete the selected group
     * @param id The ID of the group to delete.
     * @returns An observable with the response.
     */
    deleteGroup(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}${'Groupe/Delete?id='}${id}`);
    }
}
