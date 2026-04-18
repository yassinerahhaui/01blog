import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const authService = inject(Auth);
  const isBrowser = isPlatformBrowser(platformId);
  const isAuthRequest = req.url.includes('/api/auth/');

  let requestToSend = req;

  if (isBrowser && !isAuthRequest) {
    const token = localStorage.getItem('token');

    if (token) {
      requestToSend = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  return next(requestToSend).pipe(
    catchError((error) => {
      const message = error?.error?.errors?.[0]?.message;
      const isBlockedResponse =
        error?.status === 403 && typeof message === 'string' && message.toLowerCase().includes('blocked');

      if (isBrowser && isBlockedResponse) {
        authService.markCurrentUserBlocked();
        router.navigate(['/blocked']);
        return throwError(() => error);
      }

      return throwError(() => error);
    }),
  );
};
