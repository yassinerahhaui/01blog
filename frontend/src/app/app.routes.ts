import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { NotFound } from './pages/not-found/not-found';
import { authGuard } from './core/guards/auth-guard';
import { notAuthGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  { path: '', component: Home, canActivate: [authGuard] },
  { path: 'login', component: Login, canActivate: [notAuthGuard] },
  { path: 'register', component: Register, canActivate: [notAuthGuard] },
  { path: '**', component: NotFound },
];
