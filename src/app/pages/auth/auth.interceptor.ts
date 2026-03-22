import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

let isSessionDialogShowing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const authService = inject(AuthService);
    const router = inject(Router);
    const confirmationService = inject(ConfirmationService);
    const token = authService.getToken();

    const handleSessionExpired = () => {
        authService.logout();
        
        // Prevent multiple dialogs from stacking if multiple parallel requests fail with 401
        if (!isSessionDialogShowing) {
            isSessionDialogShowing = true;
            confirmationService.confirm({
                key: 'sessionExpired',
                header: 'Session Expired',
                message: 'Your session has ended. Please login again to continue.',
                icon: 'pi pi-exclamation-triangle text-orange-500',
                acceptLabel: 'Login',
                rejectLabel: 'Cancel',
                acceptButtonStyleClass: 'p-button-primary',
                rejectButtonStyleClass: 'p-button-secondary',
                accept: () => {
                    isSessionDialogShowing = false;
                    router.navigate(['/auth/login']);
                },
                reject: () => {
                    isSessionDialogShowing = false;
                    router.navigate(['/auth/login']);
                }
            });
        }
    };

    if (token) {
        const clonedReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });

        return next(clonedReq).pipe(
            catchError((error: any) => {
                if (error.status === 401) {
                    handleSessionExpired();
                }

                return throwError(() => error);
            })
        );
    }

    return next(req).pipe(
        catchError((error) => {
            if (error.status === 401) {
                handleSessionExpired();
            }

            return throwError(() => error);
        })
    );
};