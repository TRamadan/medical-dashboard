import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SuccessStory } from '../models/successStory';

@Injectable({
    providedIn: 'root'
})
export class SuccessStoryService {
    baseUrl = environment.apiUrlWebsite;

    constructor(private http: HttpClient) {}

    // Create
    createSuccessStory(story: SuccessStory): Observable<SuccessStory> {
        return this.http.post<SuccessStory>(this.baseUrl + 'SuccessStory', story);
    }

    // Update
    updateSuccessStory(story: SuccessStory): Observable<SuccessStory> {
        return this.http.put<SuccessStory>(this.baseUrl + 'SuccessStory', story);
    }

    // Get all
    getAllSuccessStories(): Observable<SuccessStory[]> {
        return this.http.get<SuccessStory[]>(this.baseUrl + 'SuccessStory');
    }

    // Delete
    deleteSuccessStory(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}` + 'SuccessStory' + `/${id}`);
    }
}
