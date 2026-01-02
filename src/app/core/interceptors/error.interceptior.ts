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

            // 1. Handle Client-Side / Network Errors
            if (error.error instanceof ErrorEvent) {
                errorMessage = `Network connection error: ${error.error.message}`;
            }
            // 2. Handle Server-Side Errors
            else {
                // Prioritize the message sent by your Spring Boot backend (if any)
                if (error.error && error.error.message) {
                    errorMessage = error.error.message;
                } else {
                    // Fallback based on Status Code
                    switch (error.status) {
                        case 401:
                            errorMessage = 'Session expired. Please log in again.';
                            // Your existing 401 logic
                            authService.logout();
                            router.navigate(['/login']);
                            break;
                        case 403:
                            errorMessage = 'Access Denied: You do not have permission.';
                            break;
                        case 404:
                            errorMessage = 'The requested resource was not found.';
                            break;
                        case 500:
                            errorMessage = 'Internal Server Error. Please contact support.';
                            break;
                        default:
                            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
                    }
                }
            }

            // 3. 🚨 GLOBAL ALERT
            // This replaces the need to write .subscribe({ error: (err) => alert(...) }) everywhere
            toast.show(errorMessage, 'error');

            // 4. Propagate the error 
            // This is important so specific components can still turn off loading spinners
            return throwError(() => error);
        })
    );
};