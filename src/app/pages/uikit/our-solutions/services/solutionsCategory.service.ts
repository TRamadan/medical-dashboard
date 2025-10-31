import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solutioncategories } from '../models/solutioncategories';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SolutionsCategoryService {
    private readonly solutionCategoriesApiUrl = `${environment.apiUrlWebsite}SolutionCategories`;

    constructor(private http: HttpClient) {}

    // Solution Categories CRUD
    getAllSolutionCategories(): Observable<Solutioncategories[]> {
        return this.http.get<Solutioncategories[]>(this.solutionCategoriesApiUrl);
    }

    createSolutionCategory(category: Omit<Solutioncategories, 'id'>): Observable<Solutioncategories> {
        return this.http.post<Solutioncategories>(this.solutionCategoriesApiUrl, category);
    }

    updateSolutionCategory(category: Solutioncategories): Observable<void> {
        return this.http.put<void>(`${this.solutionCategoriesApiUrl}`, category);
    }

    deleteSolutionCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.solutionCategoriesApiUrl}/${id}`);
    }
}
