import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth'; // Import your Auth service

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(Auth);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {

            // Check for 403 (Forbidden) or 401 (Unauthorized)
            if (error.status === 401) {

                // 1. Clear any stored tokens (clean up local storage)
                authService.logout();

                // 2. Redirect to Login Page
                // Optional: Pass the return URL so they go back to where they were after logging in
                router.navigate(['/login']);
            }

            // Propagate the error so specific components can still handle it if needed
            return throwError(() => error);
        })
    );
};