import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { NotFound } from './pages/not-found/not-found';
import { authGuard } from './core/guards/auth-guard';
import { notAuthGuard } from './core/guards/guest-guard';
import { Profile } from './pages/profile/profile';
import { Dashboard } from './pages/dashboard/dashboard';
import { adminGuard } from './core/guards/admin-guard';
import { PostCreate } from './components/post-create/post-create';

export const routes: Routes = [
  { path: '', component: Home, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'profile/:id', component: Profile, canActivate: [authGuard] },
  { path: 'post/create', component: PostCreate, canActivate: [authGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard, adminGuard] },
  { path: 'login', component: Login, canActivate: [notAuthGuard] },
  { path: 'register', component: Register, canActivate: [notAuthGuard] },
  { path: '**', component: NotFound },
];
