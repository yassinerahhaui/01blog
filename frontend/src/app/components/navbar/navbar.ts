import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  public isMenuCollapsed = true;
  router = inject(Router);

  onLogout() {
    localStorage.removeItem('token');
    console.log('Logged out successfully');
    this.router.navigate(['/login']);
    console.clear()
  }
}
