import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Theme } from '../../core/services/theme/theme';
import { Auth } from '../../core/services/auth/auth';
import { Notifications } from '../../core/services/notifications/notifications';
import { Toast } from '../../core/services/toast/toast';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  public isMenuCollapsed = true;

  router = inject(Router);
  themeService = inject(Theme);
  authService = inject(Auth);
  notifService = inject(Notifications);
  toast = inject(Toast);
  private destroyRef = inject(DestroyRef);

  currentUser = this.authService.currentUser;

  ngOnInit(): void {
    if (this.currentUser()) {
      this.notifService.refresh();
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.isMenuCollapsed = true;
    this.toast.show({
      title: 'Signed out',
      message: 'You have been logged out.',
      variant: 'secondary',
    });
  }

  onToggleTheme() {
    this.themeService.toggleTheme();
    this.isMenuCollapsed = true;
  }


  markAsRead(id: string) {
    this.notifService.markAsRead(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifService.items.update((items) =>
            items.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
          );
          this.notifService.unreadCount.update((c) => Math.max(0, c - 1));
          this.toast.show({
            title: 'Marked as read',
            message: 'Notification updated.',
            variant: 'success',
          });
        },
        error: (err) => {
          const message = err?.error?.errors?.[0]?.message || 'Failed to update notification.';
          this.toast.show({
            title: 'Update failed',
            message,
            variant: 'danger',
          });
        },
      });
  }

  markAllAsRead() {
    this.notifService.markAllAsRead()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifService.items.update((items) => items.map((n) => ({ ...n, isRead: true })));
          this.notifService.unreadCount.set(0);
          this.toast.show({
            title: 'All read',
            message: 'All notifications are marked as read.',
            variant: 'success',
          });
        },
        error: (err) => {
          const message = err?.error?.errors?.[0]?.message || 'Failed to update notifications.';
          this.toast.show({
            title: 'Update failed',
            message,
            variant: 'danger',
          });
        },
      });
  }

  deleteNotification(event: Event, id: string) {
    event.stopPropagation();

    const notification = this.notifService.items().find(n => n.id === id);
    const wasUnread = notification && !notification.isRead;

    this.notifService.delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifService.items.update((items) => items.filter((n) => n.id !== id));
          if (wasUnread) {
            this.notifService.unreadCount.update((c) => Math.max(0, c - 1));
          }
          this.toast.show({
            title: 'Notification removed',
            message: 'The notification was deleted.',
            variant: 'success',
          });
        },
        error: (err) => {
          const message = err?.error?.errors?.[0]?.message || 'Failed to delete notification.';
          this.toast.show({
            title: 'Delete failed',
            message,
            variant: 'danger',
          });
        },
      });
  }

  navigateToPost(notif: any) {
    if (notif.referenceId) {
      this.router.navigate(['/post', notif.referenceId]);
      this.isMenuCollapsed = true;
    }
  }
}
