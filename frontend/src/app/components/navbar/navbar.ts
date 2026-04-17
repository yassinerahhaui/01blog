import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Theme } from '../../core/services/theme/theme';
import { Auth } from '../../core/services/auth/auth';
import { Notifications } from '../../core/services/notifications/notifications';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  public isMenuCollapsed = true;
  public notifOpen = false;

  router = inject(Router);
  themeService = inject(Theme);
  authService = inject(Auth);
  notifService = inject(Notifications);

  ngOnInit(): void {
    if (this.authService.currentUser()) {
      this.notifService.refresh();
    }
  }

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  onToggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleNotifications() {
    this.notifOpen = !this.notifOpen;
    if (this.notifOpen) {
      this.notifService.refresh();
    }
  }

  closeNotifications() {
    this.notifOpen = false;
  }

  markAsRead(id: string) {
    this.notifService.markAsRead(id).subscribe({
      next: () => {
        this.notifService.items.update((items) =>
          items.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
        this.notifService.unreadCount.update((c) => Math.max(0, c - 1));
      },
    });
  }

  markAllAsRead() {
    this.notifService.markAllAsRead().subscribe({
      next: () => {
        this.notifService.items.update((items) => items.map((n) => ({ ...n, isRead: true })));
        this.notifService.unreadCount.set(0);
      },
    });
  }

  deleteNotification(event: Event, id: string) {
    event.stopPropagation();
    this.notifService.delete(id).subscribe({
      next: () => {
        this.notifService.items.update((items) => items.filter((n) => n.id !== id));
      },
    });
  }

  navigateToPost(notif: any) {
    if (notif.referenceId) {
      this.router.navigate(['/post', notif.referenceId]);
      this.closeNotifications();
    }
  }
}
