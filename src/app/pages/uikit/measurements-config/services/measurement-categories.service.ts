import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MeasurementCategoriesService {
    private apiUrl = 'http://localhost:5000/api/';

    constructor(private http: HttpClient) {}

    /**
     * A function to get all categories
     * @returns An observable with the list of categories.
     */
    getAllCategories(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + 'MeasurementCategories');
    }

    /**
     * A function to add a new category
     * @param category The category data to create.
     * @returns An observable with the response.
     */
    addCategory(category: { name: string; description: string; type: number }): Observable<any> {
        return this.http.post<any>(this.apiUrl + 'MeasurementCategories', category);
    }

    /**
     * A function to update the selected category
     * @param category The updated category data.
     * @returns An observable with the response.
     */
    updateCategory(category: any): Observable<any> {
        return this.http.put<any>(this.apiUrl + 'MeasurementCategories', category);
    }

    /**
     * A function to delete the selected category
     * @param id The ID of the category to delete.
     * @returns An observable with the response.
     */
    deleteCategory(id: string | number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}MeasurementCategories?id=${id}`);
    }

    // Subcategories

    /**
     * A function to get all subcategories
     * @returns An observable with the list of subcategories.
     */
    getAllSubCategories(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + 'MeasurementSubCategories');
    }

    /**
     * A function to add a new subcategory
     * @param subCategory The subcategory data to create.
     * @returns An observable with the response.
     */
    addSubCategory(subCategory: { categoryId: number; name: string; description: string }): Observable<any> {
        return this.http.post<any>(this.apiUrl + 'MeasurementSubCategories', subCategory);
    }

    /**
     * A function to update the selected subcategory
     * @param subCategory The updated subcategory data.
     * @returns An observable with the response.
     */
    updateSubCategory(subCategory: any): Observable<any> {
        return this.http.put<any>(this.apiUrl + 'MeasurementSubCategories', subCategory);
    }

    /**
     * A function to delete the selected subcategory
     * @param id The ID of the subcategory to delete.
     * @returns An observable with the response.
     */
    deleteSubCategory(id: string | number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}MeasurementSubCategories/${id}`);
    }

    // Measurements

    /**
     * A function to get all measurements by subcategoryId
     * @param subCategoryId The ID of the subcategory.
     * @returns An observable with the list of measurements.
     */
    getMeasurements(subCategoryId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}Measurements/BySubCategory/${subCategoryId}`);
    }

    /**
     * A function to add a new measurement
     * @param measurement The measurement data to create.
     * @returns An observable with the response.
     */
    addMeasurement(measurement: any): Observable<any> {
        return this.http.post<any>(this.apiUrl + 'Measurements', measurement);
    }

    /**
     * A function to update the selected measurement
     * @param measurement The updated measurement data.
     * @returns An observable with the response.
     */
    updateMeasurement(measurement: any): Observable<any> {
        return this.http.put<any>(this.apiUrl + 'Measurements', measurement);
    }

    /**
     * A function to delete the selected measurement
     * @param id The ID of the measurement to delete.
     * @returns An observable with the response.
     */
    deleteMeasurement(id: string | number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}Measurements?id=${id}`);
    }
}
