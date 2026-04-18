import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth/auth';

export const notAuthGuard: CanActivateFn = (route, _state) => {
  const router = inject(Router);
  const authService = inject(Auth);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');
    if (token) {
      if (authService.isBlocked()) {
        return route.routeConfig?.path === 'login' ? true : router.createUrlTree(['/blocked']);
      }

      return router.createUrlTree(['/']);
    } else {
      return true;
    }
  }

  return true;
};
