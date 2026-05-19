import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Admin } from '../../core/services/admin/admin';
import { Auth } from '../../core/services/auth/auth';
import { UserInfo } from '../../core/models/user-info';
import { Post } from '../../core/models/post';
import { AdminReport } from '../../core/models/admin-report';
import { Popup } from '../../core/services/popup/popup';
import { Toast } from '../../core/services/toast/toast';

type SidebarSection = 'overview' | 'users' | 'posts' | 'user-reports' | 'post-reports';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private adminService = inject(Admin);
  private authService = inject(Auth);
  private popup = inject(Popup);
  private toast = inject(Toast);

  activeSection = signal<SidebarSection>('overview');
  sidebarOpen = signal(false);
  searchTerm = signal('');
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  users = signal<UserInfo[]>([]);
  posts = signal<Post[]>([]);
  reports = signal<AdminReport[]>([]);

  processingUserId = signal<string | null>(null);
  deletingUserId = signal<string | null>(null);
  deletingPostId = signal<string | null>(null);
  hidingPostId = signal<string | null>(null);
  dismissingReportId = signal<string | null>(null);

  currentUserId = computed(() => this.authService.currentUser()?.userId ?? null);
  totalOpenReports = computed(() => this.reports().filter((report) => report.status === 'OPEN').length);
  blockedUsersCount = computed(() => this.users().filter((user) => user.access === 'BLOCKED').length);
  enabledUsersCount = computed(() => this.users().filter((user) => user.access === 'ENABLED').length);
  adminUsersCount = computed(() => this.users().filter((user) => user.role === 'ADMIN').length);

  userReports = computed(() => this.reports().filter((r) => r.targetType === 'USER'));
  postReports = computed(() => this.reports().filter((r) => r.targetType === 'POST'));
  openUserReports = computed(() => this.userReports().filter((r) => r.status === 'OPEN').length);
  openPostReports = computed(() => this.postReports().filter((r) => r.status === 'OPEN').length);

  filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.users();

    return this.users().filter((user) =>
      [user.fullName, user.username, user.email, user.role, user.access]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  });

  filteredPosts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.posts();

    return this.posts().filter((post) =>
      [post.title, post.content, post.username, post.userId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  });

  filteredUserReports = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const source = this.userReports();
    if (!term) return source;

    return source.filter((report) => {
      const reporter = this.getReporterUser(report);

      return [
        report.reason,
        report.details,
        report.status,
        report.targetId,
        report.reporterId,
        reporter?.username,
        reporter?.fullName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  });

  filteredPostReports = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const source = this.postReports();
    if (!term) return source;

    return source.filter((report) => {
      const reporter = this.getReporterUser(report);

      return [
        report.reason,
        report.details,
        report.status,
        report.targetId,
        report.reporterId,
        reporter?.username,
        reporter?.fullName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      users: this.adminService.getUsers(),
      posts: this.adminService.getPosts(),
      reports: this.adminService.getReports(),
    }).subscribe({
      next: ({ users, posts, reports }) => {
        this.users.set(users.data);
        this.posts.set(posts.data);
        this.reports.set(reports.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load moderation data.');
        this.isLoading.set(false);
      },
    });
  }

  setActiveSection(section: SidebarSection) {
    this.activeSection.set(section);
    this.searchTerm.set('');
    this.sidebarOpen.set(false);
  }

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  async toggleUserAccess(user: UserInfo) {
    const nextAccess = user.access === 'BLOCKED' ? 'ENABLED' : 'BLOCKED';
    const actionLabel = nextAccess === 'BLOCKED' ? 'ban' : 'unban';

    const confirmed = await this.popup.confirm({
      title: `${actionLabel === 'ban' ? 'Ban' : 'Unban'} user`,
      message: `Do you want to ${actionLabel} @${user.username}?`,
      confirmText: actionLabel === 'ban' ? 'Ban user' : 'Unban user',
      confirmVariant: actionLabel === 'ban' ? 'warning' : 'success',
    });

    if (!confirmed) {
      return;
    }

    this.processingUserId.set(user.id);
    this.adminService.updateUserAccess(user.id, nextAccess).subscribe({
      next: (response) => {
        this.users.update((current) =>
          current.map((item) => (item.id === user.id ? { ...item, ...response.data } : item)),
        );
        this.processingUserId.set(null);
        const actionVerb = nextAccess === 'BLOCKED' ? 'banned' : 'unbanned';
        this.toast.show({
          title: `User ${actionVerb}`,
          message: `@${user.username} has been ${actionVerb}.`,
          variant: nextAccess === 'BLOCKED' ? 'warning' : 'success',
        });
      },
      error: (err) => {
        this.processingUserId.set(null);
        const message = err?.error?.errors?.[0]?.message || 'Failed to update user access.';
        this.toast.show({
          title: 'Action failed',
          message,
          variant: 'danger',
        });
      },
    });
  }

  async deleteUser(user: UserInfo) {
    const confirmed = await this.popup.confirm({
      title: 'Delete user',
      message: `Delete @${user.username} and their account data?`,
      confirmText: 'Delete user',
      confirmVariant: 'danger',
    });

    if (!confirmed) {
      return;
    }

    this.deletingUserId.set(user.id);
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.users.update((current) => current.filter((item) => item.id !== user.id));
        this.deletingUserId.set(null);
        this.toast.show({
          title: 'User deleted',
          message: `@${user.username} has been deleted.`,
          variant: 'danger',
        });
      },
      error: (err) => {
        this.deletingUserId.set(null);
        const message = err?.error?.errors?.[0]?.message || 'Failed to delete this user.';
        this.toast.show({
          title: 'Delete failed',
          message,
          variant: 'danger',
        });
      },
    });
  }

  async deletePost(post: Post) {
    const confirmed = await this.popup.confirm({
      title: 'Delete post',
      message: `Remove the post "${post.title}"?`,
      confirmText: 'Delete post',
      confirmVariant: 'danger',
    });

    if (!confirmed) {
      return;
    }

    this.deletingPostId.set(post.id);
    this.adminService.deletePost(post.id).subscribe({
      next: () => {
        this.posts.update((current) => current.filter((item) => item.id !== post.id));
        this.deletingPostId.set(null);
        this.toast.show({
          title: 'Post deleted',
          message: `"${post.title}" has been deleted.`,
          variant: 'danger',
        });
      },
      error: (err) => {
        this.deletingPostId.set(null);
        const message = err?.error?.errors?.[0]?.message || 'Failed to delete this post.';
        this.toast.show({
          title: 'Delete failed',
          message,
          variant: 'danger',
        });
      },
    });
  }

  async hidePost(post: Post) {
    const isUnhide = post.isHidden;
    const confirmed = await this.popup.confirm({
      title: isUnhide ? 'Unhide post' : 'Hide post',
      message: `${isUnhide ? 'Unhide' : 'Hide'} the post "${post.title}"?`,
      confirmText: isUnhide ? 'Unhide post' : 'Hide post',
      confirmVariant: isUnhide ? 'success' : 'warning',
    });

    if (!confirmed) {
      return;
    }

    this.hidingPostId.set(post.id);
    this.adminService.hidePost(post.id).subscribe({
      next: (res) => {
        this.posts.update((current) =>
          current.map((item) => (item.id === post.id ? { ...item, isHidden: res.data.isHidden } : item)),
        );
        this.hidingPostId.set(null);
        this.toast.show({
          title: isUnhide ? 'Post unhidden' : 'Post hidden',
          message: `"${post.title}" has been ${isUnhide ? 'unhidden' : 'hidden'}.`,
          variant: isUnhide ? 'success' : 'warning',
        });
      },
      error: (err) => {
        this.hidingPostId.set(null);
        const message = err?.error?.errors?.[0]?.message || 'Failed to update post visibility.';
        this.toast.show({
          title: 'Action failed',
          message,
          variant: 'danger',
        });
      },
    });
  }

  async dismissReport(report: AdminReport, removeFromQueue = false) {
    const confirmed = await this.popup.confirm({
      title: removeFromQueue ? 'Remove report' : 'Dismiss report',
      message: removeFromQueue ? 'Remove this report from the moderation queue?' : 'Dismiss this report?',
      confirmText: removeFromQueue ? 'Remove report' : 'Dismiss report',
      confirmVariant: removeFromQueue ? 'secondary' : 'warning',
    });

    if (!confirmed) {
      return;
    }

    this.dismissingReportId.set(report.id);
    this.adminService.dismissReport(report.id).subscribe({
      next: () => {
        this.reports.update((current) => {
          if (removeFromQueue) {
            return current.filter((item) => item.id !== report.id);
          }

          return current.map((item) => (item.id === report.id ? { ...item, status: 'REVIEWED' } : item));
        });
        this.dismissingReportId.set(null);
        this.toast.show({
          title: removeFromQueue ? 'Report removed' : 'Report dismissed',
          message: removeFromQueue
            ? 'The report has been removed from the queue.'
            : 'The report has been marked as reviewed.',
          variant: removeFromQueue ? 'secondary' : 'success',
        });
      },
      error: (err) => {
        this.dismissingReportId.set(null);
        const message = err?.error?.errors?.[0]?.message || 'Failed to update this report.';
        this.toast.show({
          title: 'Action failed',
          message,
          variant: 'danger',
        });
      },
    });
  }

  getReportedUser(report: AdminReport): UserInfo | undefined {
    return this.users().find((user) => user.id === report.targetId);
  }

  getReporterUser(report: AdminReport): UserInfo | undefined {
    return this.users().find((user) => user.id === report.reporterId);
  }

  canModerateUser(user: UserInfo): boolean {
    return this.currentUserId() !== user.id && user.role !== 'ADMIN';
  }

  canModerateUserFromReport(report: AdminReport): boolean {
    const user = this.getReportedUser(report);
    return !!user && this.canModerateUser(user);
  }

  isUpdatingUserFromReport(report: AdminReport): boolean {
    const user = this.getReportedUser(report);
    return !!user && this.processingUserId() === user.id;
  }

  isDeletingUserFromReport(report: AdminReport): boolean {
    const user = this.getReportedUser(report);
    return !!user && this.deletingUserId() === user.id;
  }

  async toggleUserAccessFromReport(report: AdminReport) {
    const user = this.getReportedUser(report);

    if (!user) {
      this.toast.show({
        title: 'User unavailable',
        message: 'User not found or already deleted.',
        variant: 'warning',
      });
      return;
    }

    if (!this.canModerateUser(user)) {
      this.toast.show({
        title: 'Action not allowed',
        message: 'This account is protected and cannot be moderated.',
        variant: 'warning',
      });
      return;
    }

    await this.toggleUserAccess(user);
  }

  async deleteUserFromReport(report: AdminReport) {
    const user = this.getReportedUser(report);

    if (!user) {
      this.toast.show({
        title: 'User unavailable',
        message: 'User not found or already deleted.',
        variant: 'warning',
      });
      return;
    }

    if (!this.canModerateUser(user)) {
      this.toast.show({
        title: 'Action not allowed',
        message: 'This account is protected and cannot be moderated.',
        variant: 'warning',
      });
      return;
    }

    await this.deleteUser(user);
  }

  async removeUserReport(report: AdminReport) {
    await this.dismissReport(report, true);
  }

  getPost(postId: string): Post | undefined {
    return this.posts().find((p) => p.id === postId);
  }

  async deletePostFromReport(report: AdminReport) {
    const post = this.posts().find((p) => p.id === report.targetId);
    if (post) {
      await this.deletePost(post);
    } else {
      this.toast.show({
        title: 'Post unavailable',
        message: 'Post not found or already deleted.',
        variant: 'warning',
      });
    }
  }

  async hidePostFromReport(report: AdminReport) {
    const post = this.posts().find((p) => p.id === report.targetId);
    if (post) {
      await this.hidePost(post);
    } else {
      this.toast.show({
        title: 'Post unavailable',
        message: 'Post not found.',
        variant: 'warning',
      });
    }
  }
}
