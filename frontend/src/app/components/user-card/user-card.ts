import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../core/services/auth/auth';
import { RouterLink } from "@angular/router";


@Component({
  selector: 'app-user-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-card.html',
  styleUrl: './user-card.scss',
})
export class UserCard {
  authService = inject(Auth);
  user = signal(this.authService.currentUser());
}
