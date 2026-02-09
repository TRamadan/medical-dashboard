import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    console.log('%c🔍 INTERCEPTOR CALLED', 'background: #222; color: #bada55; font-size: 14px; font-weight: bold');
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);

    const authService = inject(AuthService);
    const token = authService.getToken();

    console.log('%c🔑 TOKEN CHECK', 'background: #222; color: #ffcc00; font-size: 14px; font-weight: bold');
    if (token) {
        console.log('Token found:', token.substring(0, 30) + '...');
    } else {
        console.log('❌ NO TOKEN FOUND IN LOCALSTORAGE');
    }

    if (token) {
        // Use headers.set() instead of setHeaders
        const clonedReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });

        console.log('%c✅ HEADER ADDED', 'background: #222; color: #00ff00; font-size: 14px; font-weight: bold');
        console.log('Authorization header:', clonedReq.headers.get('Authorization')?.substring(0, 40) + '...');
        console.log('All headers:', clonedReq.headers.keys());
        console.log('Has Authorization?:', clonedReq.headers.has('Authorization'));

        return next(clonedReq);
    }

    console.log('%c⚠️ NO TOKEN - PROCEEDING WITHOUT AUTH', 'background: #222; color: #ff6600; font-size: 14px; font-weight: bold');
    return next(req);
};