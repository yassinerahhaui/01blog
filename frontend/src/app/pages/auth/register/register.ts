import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth/auth';
import { RegisterRequest } from '../../../core/models/register-request';
import { Toast } from '../../../core/services/toast/toast';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
  imports: [RouterLink,FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private authService = inject(Auth);
  private router = inject(Router);
  private toast = inject(Toast);
  registerData: RegisterRequest = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  };

  errorMessage = signal<string | null>(null);

  onRegister() {
    this.errorMessage.set(null);
    this.authService.register(this.registerData).subscribe({
      next: ()=> {
        this.toast.show({
          title: 'Account created',
          message: 'Welcome to 01blog! Your account is ready.',
          variant: 'success',
        });
        this.router.navigate(['/']);
      },
      error: (err) => {
        let message = '';
        if (err.error?.errors?.[0]?.message) {
          message = err.error.errors[0].message;
        } else if (err.error?.message) {
          message = err.error.message;
        } else if (typeof err.error === 'string') {
          message = err.error;
        } else {
          message = 'Registration failed. Please try again.';
        }
        this.errorMessage.set(message);
        this.toast.show({
          title: 'Registration failed',
          message,
          variant: 'danger',
        });
      }
    })
  }
}
