import { inject, Injectable } from '@angular/core';

// import models
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { ApiResponse } from '../models/api-response';
import { AuthResponse } from '../models/auth-response';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = `http://localhost:8080/api/auth`;

  login(userData: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, userData).pipe(
      tap((response)=> {
        if (response && response.status === "success") {
          const token = response.data.token;
          localStorage.setItem("token", token);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, userData).pipe(
      tap((response)=> {
        if (response && response.status === "success") {
          const token = response.data.token;
          localStorage.setItem("token", token);
        }
      })
    );
  }
}
