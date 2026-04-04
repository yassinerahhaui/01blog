import { inject, Injectable, PLATFORM_ID } from '@angular/core';

// import models
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { ApiResponse } from '../models/api-response';
import { AuthResponse } from '../models/auth-response';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = `http://localhost:8080/api/auth`;
  private platformId = inject(PLATFORM_ID);

  login(userData: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, userData).pipe(
      tap((response)=> {
        if (response && response.status === "success") {
          const token = response.data.token;
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem("token", token);
          }
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, userData).pipe(
      tap((response)=> {
        if (response && response.status === "success") {
          const token = response.data.token;
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem("token", token);
          }
        }
      })
    );
  }
}
