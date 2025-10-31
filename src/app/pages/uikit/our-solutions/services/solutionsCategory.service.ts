import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solution, Solutioncategories } from '../models/solutioncategories';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SolutionsCategoryService {
    private readonly solutionCategoriesApiUrl = `${environment.apiUrl}SolutionCategories`;
    private readonly solutionsApiUrl = `${environment.apiUrl}Solutions`;

    constructor(private http: HttpClient) {}

    // Solution Categories CRUD
    getAllSolutionCategories(): Observable<Solutioncategories[]> {
        return this.http.get<Solutioncategories[]>(this.solutionCategoriesApiUrl);
    }

    createSolutionCategory(category: Solutioncategories): Observable<Solutioncategories> {
        return this.http.post<Solutioncategories>(this.solutionCategoriesApiUrl, category);
    }

    updateSolutionCategory(category: Solutioncategories): Observable<void> {
        return this.http.put<void>(`${this.solutionCategoriesApiUrl}/${category.id}`, category);
    }

    deleteSolutionCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.solutionCategoriesApiUrl}/${id}`);
    }

    // Solutions CRUD
    getAllSolutions(): Observable<Solution[]> {
        return this.http.get<Solution[]>(this.solutionsApiUrl);
    }

    getSolutionsByCategoryId(categoryId: number): Observable<Solution[]> {
        return this.http.get<Solution[]>(`${this.solutionsApiUrl}/ByCategoryId/${categoryId}`);
    }

    createSolution(solution: Solution): Observable<Solution> {
        return this.http.post<Solution>(this.solutionsApiUrl, solution);
    }

    updateSolution(id: number, solution: Solution): Observable<void> {
        return this.http.put<void>(`${this.solutionsApiUrl}/${id}`, solution);
    }

    deleteSolution(id: number): Observable<void> {
        return this.http.delete<void>(`${this.solutionsApiUrl}/${id}`);
    }
}
