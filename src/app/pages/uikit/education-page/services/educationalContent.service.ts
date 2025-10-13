import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Education } from '../models/educationcontent';

@Injectable({
    providedIn: 'root'
})
export class EducationalContentService {
    private readonly categoryUrl = environment.apiUrlWebsite + 'EducationCategory';
    private readonly educationUrl = environment.apiUrlWebsite;

    constructor(private http: HttpClient) {}

    /**
     * Fetches all educational content categories from the API.
     * @returns An observable of an array of Category objects.
     */
    getAllCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.categoryUrl);
    }

    /**
     * Fetches a single educational content category by its ID.
     * @param id The ID of the category to fetch.
     * @returns An observable of the Category object.
     */
    getCategoryById(id: number): Observable<Category> {
        return this.http.get<Category>(`${this.categoryUrl}/${id}`);
    }

    /**
     * Creates a new educational content category.
     * @param category The category data to create.
     * @returns An observable of the created Category object.
     */
    createCategory(category: Category): Observable<Category> {
        return this.http.post<Category>(this.categoryUrl, category);
    }

    /**
     * Updates an existing educational content category.
     * @param id The ID of the category to update.
     * @param category The updated category data.
     * @returns An observable of the updated Category object.
     */
    updateCategory(category: Category): Observable<Category> {
        return this.http.put<Category>(`${this.categoryUrl}`, category);
    }

    /**
     * Deletes an educational content category.
     * @param id The ID of the category to delete.
     * @returns An observable of the HTTP response.
     */
    deleteCategory(id: number): Observable<unknown> {
        return this.http.delete(`${this.categoryUrl}/${id}`);
    }

    /**
     * Fetches all educational content (articles and videos).
     * @returns An observable of an array of Education objects.
     */
    getAllEducationalContent(endPointName: string): Observable<Education[]> {
        return this.http.get<Education[]>(this.educationUrl + endPointName);
    }

    /**
     * Fetches a single educational content item by its ID.
     * @param id The ID of the content to fetch.
     * @returns An observable of the Education object.
     */
    getEducationalContentById(id: number): Observable<Education> {
        return this.http.get<Education>(`${this.educationUrl}/${id}`);
    }

    /**
     * Fetches educational content filtered by a specific category ID.
     * @param categoryId The ID of the category to filter by.
     * @returns An observable of an array of Education objects.
     */
    getEducationalContentByCategory(categoryId: number): Observable<Education[]> {
        const params = new HttpParams().set('categoryId', categoryId.toString());
        return this.http.get<Education[]>(`${this.educationUrl}/ByCategory`, { params });
    }

    /**
     * Creates a new educational content item.
     * @param education The content data to create.
     * @returns An observable of the created Education object.
     */
    createEducationalContent(endPointName: string, education: Education): Observable<Education> {
        return this.http.post<Education>(this.educationUrl + endPointName, education);
    }

    /**
     * Updates an existing educational content item.
     * @param id The ID of the content to update.
     * @param education The updated content data.
     * @returns An observable of the updated Education object.
     */
    updateEducationalContent(endPointName: string, education: Education): Observable<Education> {
        return this.http.put<Education>(`${this.educationUrl}` + `${endPointName}`, education);
    }

    /**
     * Deletes an educational content item.
     * @param id The ID of the content to delete.
     * @returns An observable of the HTTP response.
     */
    deleteEducationalContent(endPointName: string, id: number): Observable<unknown> {
        return this.http.delete(`${this.educationUrl}` + `${endPointName}/` + `${id}`);
    }
}
