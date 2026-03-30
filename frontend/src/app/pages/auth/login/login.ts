import { Component, inject } from '@angular/core';
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

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: ()=> {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error("Server Error: ", err.status);
        if (err.error && err.error.errors) {
            console.error("Validation details: ", err.error.errors);
        }
      }
    })
  }
}
