import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
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

  onRegister() {
    this.authService.register(this.registerData).subscribe({
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
