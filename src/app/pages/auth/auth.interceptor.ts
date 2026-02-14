import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();
    if (token) {
        const clonedReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });

        return next(clonedReq).pipe(
            catchError((error: any) => {
                if (error.status === 401) {

                    authService.logout();
                    router.navigate(['/auth/login']);
                }

                return throwError(() => error);
            })
        );
    }

    return next(req).pipe(
        catchError((error) => {
            if (error.status === 401) {
                router.navigate(['/auth/login']);
            }

            return throwError(() => error);
        })
    );
};