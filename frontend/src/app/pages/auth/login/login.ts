import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginRequest } from '../../../core/models/login-request';
import { Auth } from '../../../core/services/auth/auth';
import { Toast } from '../../../core/services/toast/toast';
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
  private toast = inject(Toast);
  loginData: LoginRequest = {
    username: '',
    password: ''
  };
  errorMessage = signal<string | null>(null);

  onLogin() {
    this.errorMessage.set(null);
    this.authService.login(this.loginData).subscribe({
      next: ()=> {
        if (this.authService.isBlocked()) {
          this.toast.show({
            title: 'Account blocked',
            message: 'Your account is currently blocked. Contact support for help.',
            variant: 'warning',
          });
          this.router.navigate(['/blocked']);
          return;
        }

        this.toast.show({
          title: 'Signed in',
          message: 'Welcome back!',
          variant: 'success',
        });
        this.router.navigate(['/']);
      },
      error: (err) => {
        const message = err.error?.errors?.[0]?.message || 'Invalid email or password. Please try again!';
        this.errorMessage.set(message);
        this.toast.show({
          title: 'Login failed',
          message,
          variant: 'danger',
        });
      }
    })
  }
}
