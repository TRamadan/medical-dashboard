import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../pages/auth/services/auth.service';

// Helper function to add the token to the request
const addTokenHeader = (request: HttpRequest<any>, token: string) => {
    return request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const authRefreshInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const messageService = inject(MessageService);

    // Add token to requests
    const token = authService.getToken();
    if (token) {
        req = addTokenHeader(req, token);
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (req.url.includes('auth/login') || req.url.includes('UserAuth/RefreshToken')) {
                return throwError(() => error);
            }
            if (error.status === 401) {
                return handle401Error(req, next, authService, router, messageService);
            }

            return throwError(() => error);
        })
    );
};

const handle401Error = (request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService, router: Router, messageService: MessageService): Observable<HttpEvent<any>> => {
    if (!authService.getIsRefreshing()) {
        authService.setIsRefreshing(true);
        authService.getRefreshTokenSubject().next(null);

        const refreshToken = authService.getRefreshToken();

        if (refreshToken) {
            return authService.refreshToken(refreshToken).pipe(
                switchMap((response: any) => {
                    authService.setIsRefreshing(false);

                    const newToken = response?.token || response?.accessToken;
                    if (!newToken) {
                        throw new Error('No access token returned from refresh API.');
                    }

                    authService.saveToken(newToken);
                    authService.getRefreshTokenSubject().next(newToken);

                    return next(addTokenHeader(request, newToken));
                }),
                catchError((err) => {
                    authService.setIsRefreshing(false);
                    authService.logout().subscribe();
                    router.navigate(['/auth/login']);
                    messageService.add({
                        severity: 'error',
                        summary: 'Session expired',
                        detail: 'Please log in again.'
                    });
                    return throwError(() => err);
                })
            );
        } else {
            authService.setIsRefreshing(false);
            authService.logout().subscribe();
            router.navigate(['/auth/login']);
            messageService.add({
                severity: 'error',
                summary: 'Unauthorized',
                detail: 'Your session has expired. Please log in again.'
            });
            return throwError(() => new Error('No refresh token available.'));
        }
    } else {
        return authService.getRefreshTokenSubject().pipe(
            filter((token) => token != null),
            take(1),
            switchMap((token) => next(addTokenHeader(request, token!)))
        );
    }
};
