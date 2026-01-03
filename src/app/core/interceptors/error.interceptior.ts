import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';
import { ToastService } from '../services/toast';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(Auth);
    const toast = inject(ToastService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An unexpected error occurred. Please try again.';

            // 1. Determine the Error Message
            if (error.error instanceof ErrorEvent) {
                // Client-side / Network error
                errorMessage = `Network connection error: ${error.error.message}`;
            }
            else if (error.error && error.error.message) {
                // Backend sent a specific error message (e.g., "Jwt expired")
                errorMessage = error.error.message;
            }
            else {
                // Fallback messages if backend sent no specific message
                switch (error.status) {
                    case 401: errorMessage = 'Session expired. Please log in again.'; break;
                    case 403: errorMessage = 'Access Denied: You do not have permission.'; break;
                    case 404: errorMessage = 'The requested resource was not found.'; break;
                    case 500: errorMessage = 'Internal Server Error. Please contact support.'; break;
                    default: errorMessage = `Error Code: ${error.status}`;
                }
            }

            // 2. 🚨 Handle Critical Status Codes (Side Effects)
            // We check this OUTSIDE the message logic so it always runs
            if (error.status === 401) {
                authService.logout(); // ✅ This will now run even if backend sent a message
                router.navigate(['/login']);
            }

            // 3. Show Toast
            toast.show(errorMessage, 'error');

            // 4. Propagate the error
            return throwError(() => error);
        })
    );
};