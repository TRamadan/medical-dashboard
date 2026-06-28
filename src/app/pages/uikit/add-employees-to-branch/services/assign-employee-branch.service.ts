import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { Branch, Employee, EmployeeType } from '../models/assign-employee-branch';

@Injectable({
    providedIn: 'root'
})
export class AssignEmployeeBranchService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    // Signals for managing component state
    private readonly _branchEmployees = signal<Employee[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    public readonly branchEmployees = this._branchEmployees.asReadonly();
    public readonly loading = this._loading.asReadonly();
    public readonly error = this._error.asReadonly();

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An error occurred while routing your request.';
        if (error.error && error.error.errors && typeof error.error.errors === 'object') {
            const errors = error.error.errors;
            const messages: string[] = [];
            for (const key in errors) {
                if (Object.prototype.hasOwnProperty.call(errors, key)) {
                    messages.push(...errors[key]);
                }
            }
            if (messages.length > 0) {
                errorMessage = messages.join('\n');
            }
        } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        return throwError(() => new Error(errorMessage));
    }

    /**
     * POST: Assign an employee to a branch
     * branches/branchId/employees/userId
     */
    assignEmployeeToBranch(branchId: string | number, userId: string | number): Observable<unknown> {
        this._loading.set(true);
        this._error.set(null);
        return this.http.post<unknown>(`${this.apiUrl}branches/${branchId}/employees/${userId}`, {}).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err)),
            finalize(() => this._loading.set(false))
        );
    }

    /**
     * GET: Fetch employees of a branch by identifier and optionally filter by employeeTypeId
     * branches/branchId/employees?employeeTypeId
     */
    getBranchEmployees(branchId: string | number, employeeTypeId?: string | number): Observable<Employee[]> {
        this._loading.set(true);
        this._error.set(null);

        let url = `${this.apiUrl}branches/${branchId}/employees`;
        if (employeeTypeId !== undefined && employeeTypeId !== '') {
            url += `?employeeTypeId=${employeeTypeId}`;
        }

        return this.http.get<Employee[]>(url).pipe(
            tap((employees) => {
                this._branchEmployees.set(employees);
            }),
            catchError((err: HttpErrorResponse) => {
                this._error.set(err.message || 'Failed to fetch branch employees.');
                return this.handleError(err);
            }),
            finalize(() => this._loading.set(false))
        );
    }

    /**
     * GET: Get all branches (locations are used as branches in this application)
     */
    getBranches(): Observable<Branch[]> {
        return this.http.get<Branch[]>(`${this.apiUrl}Locations`).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    /**
     * GET: Get employee types (roles)
     */
    getEmployeeTypes(): Observable<EmployeeType[]> {
        return this.http.get<EmployeeType[]>(`${this.apiUrl}EmployeeTypes`).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    /**
     * GET: Get all system employees
     * @param pageNumber The page number to fetch (default: 1).
     * @param pageSize The number of items per page (default: 20).
     * @param search Optional search term to filter app users.
     * @returns An observable with the list of app users.
     */
    getAppUsers(pageNumber: number = 1, pageSize: number = 20, search: string = ''): Observable<any> {
        const params: Record<string, string | number> = { PageNumber: pageNumber, PageSize: pageSize };
        if (search.trim()) {
            params['Search'] = search.trim();
        }
        return this.http.get<any>(this.apiUrl + 'User/GetAppUsers', { params }).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }
}