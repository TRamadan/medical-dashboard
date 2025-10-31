import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/reporttemplates';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReportsCategoryService {
    private readonly apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}
    /**
     * Fetches all report categories.
     * @returns An Observable array of Categories.
     */
    getAllCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.apiUrl}/ReportCategories`);
    }

    /**
     * Creates a new report category.
     * @param category The category data to create.
     * @returns An Observable of the created Category.
     */
    createCategory(category: Category): Observable<Category> {
        return this.http.post<Category>(`${this.apiUrl}/ReportCategories`, category);
    }

    updateCategory(category: Category): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/ReportCategories/${category.id}`, category);
    }

    deleteCategory(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/ReportCategories/${id}`);
    }
}
