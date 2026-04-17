import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Admin } from '../../core/services/admin/admin';
import { Auth } from '../../core/services/auth/auth';
import { UserInfo } from '../../core/models/user-info';
import { Post } from '../../core/models/post';
import { AdminReport } from '../../core/models/admin-report';

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

    return source.filter((report) =>
      [report.reason, report.details, report.status, report.targetId, report.reporterId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  });

  filteredPostReports = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const source = this.postReports();
    if (!term) return source;

    return source.filter((report) =>
      [report.reason, report.details, report.status, report.targetId, report.reporterId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
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

  toggleUserAccess(user: UserInfo) {
    const nextAccess = user.access === 'BLOCKED' ? 'ENABLED' : 'BLOCKED';
    const actionLabel = nextAccess === 'BLOCKED' ? 'ban' : 'unban';

    if (typeof window !== 'undefined' && !window.confirm(`Do you want to ${actionLabel} @${user.username}?`)) {
      return;
    }

    this.processingUserId.set(user.id);
    this.adminService.updateUserAccess(user.id, nextAccess).subscribe({
      next: (response) => {
        this.users.update((current) =>
          current.map((item) => (item.id === user.id ? { ...item, ...response.data } : item)),
        );
        this.processingUserId.set(null);
      },
      error: () => {
        this.processingUserId.set(null);
      },
    });
  }

  deleteUser(user: UserInfo) {
    if (typeof window !== 'undefined' && !window.confirm(`Delete @${user.username} and their account data?`)) {
      return;
    }

    this.deletingUserId.set(user.id);
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.users.update((current) => current.filter((item) => item.id !== user.id));
        this.deletingUserId.set(null);
      },
      error: () => {
        this.deletingUserId.set(null);
      },
    });
  }

  deletePost(post: Post) {
    if (typeof window !== 'undefined' && !window.confirm(`Remove the post "${post.title}"?`)) {
      return;
    }

    this.deletingPostId.set(post.id);
    this.adminService.deletePost(post.id).subscribe({
      next: () => {
        this.posts.update((current) => current.filter((item) => item.id !== post.id));
        this.deletingPostId.set(null);
      },
      error: () => {
        this.deletingPostId.set(null);
      },
    });
  }

  hidePost(post: Post) {
    if (typeof window !== 'undefined' && !window.confirm(`${post.isHidden ? 'Unhide' : 'Hide'} the post "${post.title}"?`)) {
      return;
    }

    this.hidingPostId.set(post.id);
    this.adminService.hidePost(post.id).subscribe({
      next: (res) => {
        this.posts.update((current) =>
          current.map((item) => (item.id === post.id ? { ...item, isHidden: res.data.isHidden } : item)),
        );
        this.hidingPostId.set(null);
      },
      error: () => {
        this.hidingPostId.set(null);
      },
    });
  }

  dismissReport(report: AdminReport) {
    if (typeof window !== 'undefined' && !window.confirm(`Dismiss this report?`)) {
      return;
    }

    this.adminService.dismissReport(report.id).subscribe({
      next: () => {
        this.reports.update((current) =>
          current.map((item) => (item.id === report.id ? { ...item, status: 'REVIEWED' } : item)),
        );
      },
      error: () => {
        // Handle error
      },
    });
  }

  banUserFromReport(report: AdminReport) {
    const user = this.users().find((u) => u.id === report.targetId);
    if (user && user.access !== 'BLOCKED') {
      this.toggleUserAccess(user);
    } else if (!user) {
      alert('User not found.');
    }
  }

  getPost(postId: string): Post | undefined {
    return this.posts().find((p) => p.id === postId);
  }

  deletePostFromReport(report: AdminReport) {
    const post = this.posts().find((p) => p.id === report.targetId);
    if (post) {
      this.deletePost(post);
    } else {
      alert('Post not found or already deleted.');
    }
  }

  hidePostFromReport(report: AdminReport) {
    const post = this.posts().find((p) => p.id === report.targetId);
    if (post) {
      this.hidePost(post);
    } else {
      alert('Post not found.');
    }
  }
}
