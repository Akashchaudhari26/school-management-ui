import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    // Clone the request (requests are immutable) and add the header
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return next(cloned);
  }

  // If no token, just send the original request (e.g., login page)
  return next(req);
};
