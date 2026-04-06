import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth/auth';
import { RegisterRequest } from '../../../core/models/register-request';
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
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err.error?.errors?.[0]?.message) {
          this.errorMessage.set(err.error.errors[0].message);
        } else if (err.error?.message) {
          this.errorMessage.set(err.error.message);
        } else if (typeof err.error === 'string') {
          this.errorMessage.set(err.error);
        } else {
          this.errorMessage.set("Registration failed. Please try again.");
        }
      }
    })
  }
}
