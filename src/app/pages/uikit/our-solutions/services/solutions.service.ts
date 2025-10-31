import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Solution } from '../models/solutions';

@Injectable({
    providedIn: 'root'
})
export class SolutionsService {
    private readonly solutionsApiUrl = `${environment.apiUrlWebsite}Solutions`;

    constructor(private http: HttpClient) {}
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
