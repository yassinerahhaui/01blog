import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(Auth);
  if (authService.currentUser()?.role != "ADMIN") {
    router.navigate(["/"]);
    return false;
  }
  return true;
};
