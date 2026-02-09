import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoginRequest, LoginResponse } from '../services/auth.model';
import { ApiService } from '../../service/api.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiService = inject(ApiService);

    private baseUrl = 'https://portalapi.thesportsdoctorlab.com/api/UserAuth/';
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    constructor(private http: HttpClient) { }

    /**
     * Logs in a user using the provided credentials and user type.
     * Saves the access and refresh tokens upon successful authentication.
     *
     * @param type - The user type (e.g., 1 for admin, 2 for normal user, etc.)
     * @param loginData - The user's login credentials (username, password, etc.)
     * @returns Observable<LoginResponse> - Emits the login response from the backend.
     */
    login(type: number, loginData: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}Login?type=${type}`, loginData).pipe(
            tap((response) => {
                this.saveToken(response.token);
                localStorage.setItem('userData', JSON.stringify(response.user));

                this.saveSideRoutes(response.user.sideRouts);

                if (response.refreshToken) {
                    this.saveRefreshToken(response.refreshToken);
                }
            })
        );
    }

    /**
     * Logs out the current user and clears authentication data from local storage.
     * Optionally calls the backend logout endpoint if the API expects it.
     *
     * @returns Observable<any> - Emits the logout response or a simple success observable.
     */
    logout(): Observable<any> {
        const refreshToken = this.getRefreshToken();
        this.clearAuthData();

        if (refreshToken) {
            return this.http.post(`${this.baseUrl}LogOut`, { refreshToken });
        } else {
            return of(true);
        }
    }

    /**
     * Requests a new access token using the existing refresh token.
     * Updates the stored tokens and notifies subscribers when successful.
     *
     * @param refreshToken - The current refresh token stored for the user.
     * @returns Observable<LoginResponse> - Emits the new access and refresh tokens.
     */
    refreshToken(refreshToken: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}RefreshToken?token=${refreshToken}`, {}).pipe(
            tap((response) => {
                if (response) {
                    this.saveToken(response.token);
                    if (response.refreshToken) {
                        this.saveRefreshToken(response.refreshToken);
                    }
                }

                this.refreshTokenSubject.next(response.token);
            })
        );
    }

    /**
     * Retrieves the current access token from local storage.
     *
     * @returns string | null - The stored access token or null if not found.
     */
    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    /**
     * Retrieves the current refresh token from local storage.
     *
     * @returns string | null - The stored refresh token or null if not found.
     */
    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    /**
     * Saves the access token to local storage.
     *
     * @param token - The access token to store.
     */
    saveToken(token: string): void {
        localStorage.setItem('access_token', token);
    }

    /**
     * Saves the assigned side routes for the logined user
     * @param sideRoutes
     */
    saveSideRoutes(sideRoutes: any): void {
        localStorage.setItem('sideRoutes', JSON.stringify(sideRoutes));
    }

    /**
     * Saves the refresh token to local storage.
     *
     * @param refreshToken - The refresh token to store.
     */
    saveRefreshToken(refreshToken: string): void {
        localStorage.setItem('refresh_token', refreshToken);
    }

    /**
     * Removes the stored access token from local storage.
     */
    removeToken(): void {
        localStorage.removeItem('access_token');
    }

    /**
     * Removes the stored refresh token from local storage.
     */
    removeRefreshToken(): void {
        localStorage.removeItem('refresh_token');
    }

    /**
     * Clears both access and refresh tokens from local storage.
     */
    clearAuthData(): void {
        this.removeToken();
        this.removeRefreshToken();
        this.removeSideRoutes();
    }

    /**
     * Gets the current state indicating whether a token refresh is in progress.
     *
     * @returns boolean - True if a refresh is ongoing, false otherwise.
     */
    getIsRefreshing(): boolean {
        return this.isRefreshing;
    }

    /**
     * Updates the refresh state flag to indicate whether a refresh is in progress.
     *
     * @param value - True if refreshing, false otherwise.
     */
    setIsRefreshing(value: boolean): void {
        this.isRefreshing = value;
    }

    /**
     * Returns the BehaviorSubject used to broadcast new tokens after a refresh.
     *
     * @returns BehaviorSubject<string | null> - Emits the new token after a refresh completes.
     */
    getRefreshTokenSubject(): BehaviorSubject<string | null> {
        return this.refreshTokenSubject;
    }

    /**
     * This function is needed to remove the side routes for the logined user
     */
    removeSideRoutes(): void {
        localStorage.removeItem('sideRoutes');
    }
}
