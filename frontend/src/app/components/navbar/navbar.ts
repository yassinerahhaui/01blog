import { Component } from '@angular/core';
import { NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [NgbCollapseModule, NgbDropdownModule, CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  public isMenuCollapsed = true;

  onLogout() {
    localStorage.removeItem('token');
    console.log('Logged out successfully');
  }
}
