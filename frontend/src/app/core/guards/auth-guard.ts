import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(Auth);

  const platformId = inject(PLATFORM_ID);
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');
    if (token == null) {
      return router.createUrlTree(['/login']);
    }

    const isBlockedRoute = state.url.startsWith('/blocked');
    if (authService.isBlocked()) {
      return isBlockedRoute ? true : router.createUrlTree(['/blocked']);
    }

    if (isBlockedRoute) {
      return router.createUrlTree(['/']);
    }

    return true;
  }
  return true;
};
