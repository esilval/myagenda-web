import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  let request = req;
  
  console.log('Interceptor processing request:', req.url);
  
  // Solo excluir /login, pero incluir token en todas las demás rutas
  if (!req.url.endsWith('/login') && !req.url.endsWith('/users')) {
    const token = auth.token;
    console.log('Token available:', !!token, 'for URL:', req.url);
    
    if (token) {
      request = req.clone({ 
        setHeaders: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      });
      console.log('Request headers set:', request.headers.keys());
    } else {
      console.warn('No token found for request:', req.url);
    }
  }

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      console.error('HTTP Error:', err.status, err.url, err.error);
      if (err.status === 401) {
        console.error('401 Unauthorized:', err);
        auth.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => err);
    })
  );
};


