import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

import { ApiResponse } from '../../core/models/api-response';
import { SliceResponse } from '../../core/models/slice-response';
import { UserInfo } from '../../core/models/user-info';
import { Auth } from '../../core/services/auth/auth';
import { Profile } from '../../core/services/profile/profile';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  private readonly PAGE_SIZE = 20;
  private readonly SCROLL_THRESHOLD_PX = 120;

  private authService = inject(Auth);
  private profileService = inject(Profile);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  users = signal<UserInfo[]>([]);
  searchTerm = signal('');
  page = signal(0);
  hasMore = signal(true);
  isLoading = signal(false);

  private scrollSubject = new Subject<void>();

  ngOnInit(): void {
    if (!this.authService.currentUser()?.userId) {
      this.hasMore.set(false);
      return;
    }

    this.scrollSubject
      .pipe(throttleTime(200), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.checkScroll());

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const q = (params.get('q') ?? '').trim();

      this.searchTerm.set(q);
      this.users.set([]);
      this.page.set(0);
      this.hasMore.set(true);

      this.loadUsers();
    });
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  submitSearch(event: Event): void {
    event.preventDefault();

    const q = this.searchTerm().trim();
    this.router.navigate(['/users'], {
      queryParams: q ? { q } : {},
    });
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.router.navigate(['/users']);
  }

  loadUsers(): void {
    if (this.isLoading() || !this.hasMore()) {
      return;
    }

    this.isLoading.set(true);

    this.profileService.searchUsers(this.searchTerm(), this.page(), this.PAGE_SIZE).subscribe({
      next: (res: ApiResponse<SliceResponse<UserInfo>>) => {
        if (res.errors === null) {
          const existingIds = new Set(this.users().map((user) => user.id));
          const newUsers = res.data.content.filter((user) => !existingIds.has(user.id));

          this.users.update((current) => [...current, ...newUsers]);
          this.page.update((p) => p + 1);
          this.hasMore.set(!res.data.last);

          if (this.hasMore()) {
            setTimeout(() => this.checkScroll(), 0);
          }
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.isLoading.set(false);
      },
    });
  }

  checkScroll(): void {
    const currentBottom = window.innerHeight + window.scrollY;
    const pageHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

    if (currentBottom >= pageHeight - this.SCROLL_THRESHOLD_PX) {
      this.loadUsers();
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.scrollSubject.next();
  }
}
