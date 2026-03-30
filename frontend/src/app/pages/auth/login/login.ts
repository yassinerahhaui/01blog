import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginRequest } from '../../../core/models/login-request';
import { Auth } from '../../../core/services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterLink,FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(Auth);
  private router = inject(Router);
  loginData: LoginRequest = {
    username: '',
    password: ''
  };
  errorMessage = signal<string | null>(null);

  onLogin() {
    this.errorMessage.set(null);
    this.authService.login(this.loginData).subscribe({
      next: ()=> {
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err.error?.errors?.[0]?.message) {
            this.errorMessage.set(err.error.errors[0].message);
        } else {
            this.errorMessage.set("Invalid email or password. Please try again!");
        }
      }
    })
  }
}
