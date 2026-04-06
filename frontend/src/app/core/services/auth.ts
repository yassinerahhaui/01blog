import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

// import models
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { ApiResponse } from '../models/api-response';
import { AuthResponse } from '../models/auth-response';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { CustomJwtPayload } from '../models/custom-jwt-payload';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = `http://localhost:8080/api/auth`;
  private platformId = inject(PLATFORM_ID);
  currentUser = signal<CustomJwtPayload | null>(null);

  constructor() {
    this.loadUserFromToken();
  }

  private loadUserFromToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<CustomJwtPayload>(token);
          this.currentUser.set(decoded);
        } catch (error) {
          this.currentUser.set(null);
        }
      }
    }
  }

  login(userData: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, userData).pipe(
      tap((response) => {
        if (response && response.status === 'success') {
          const token = response.data.token;
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', token);
            this.loadUserFromToken();
          }
        }
      }),
    );
  }

  register(userData: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        if (response && response.status === 'success') {
          const token = response.data.token;
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', token);
            this.loadUserFromToken();
          }
        }
      }),
    );
  }
}
