import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { Posts } from '../../core/services/posts/posts';
import { Auth } from '../../core/services/auth/auth';
import { Post } from '../../core/models/post';
import { ApiResponse } from '../../core/models/api-response';
import { SliceResponse } from '../../core/models/slice-response';
import { CommonModule } from '@angular/common';
import { PostCard } from '../../components/post-card/post-card';
import { UserInfoCard } from '../../components/user-info-card/user-info-card';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, PostCard, UserInfoCard],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  // Services
  private postService = inject(Posts);
  private route = inject(ActivatedRoute);
  private authService = inject(Auth);

  // State Signals
  posts = signal<Post[]>([]);
  isLoading = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  page = signal(0);

  // User Identifiers
  profileOwnerId = signal<string | undefined>(undefined);
  myUserId = signal<string | undefined>(undefined);

  // Scroll Throttling Subject (Performance Optimization)
  private scrollSubject = new Subject<void>();

  ngOnInit(): void {
    // 1. Fetch current logged-in user ID
    const currentUser = this.authService.currentUser();
    this.myUserId.set(currentUser?.userId);

    // 2. Setup scroll throttling (trigger checkScroll once every 200ms)
    this.scrollSubject.pipe(
      throttleTime(200)
    ).subscribe(() => {
      this.checkScroll();
    });

    // 3. Listen to URL parameters to handle dynamic routing (/profile vs /profile/:id)
    this.route.paramMap.subscribe(params => {
      const idFromUrl = params.get('id');

      if (idFromUrl) {
        // Visiting someone else's profile
        this.profileOwnerId.set(idFromUrl);
      } else {
        // Visiting our own profile
        this.profileOwnerId.set(this.myUserId());
      }

      // Reset state when switching profiles
      this.posts.set([]);
      this.page.set(0);
      this.hasMore.set(true);

      // Load posts for the resolved profile owner
      this.loadPosts();
    });
  }

  loadPosts() {
    // Prevent duplicate requests while loading or if no more posts exist
    if (this.isLoading() || !this.hasMore()) return;

    const targetId = this.profileOwnerId();
    if (!targetId) return; // Guard clause to ensure ID exists

    this.isLoading.set(true);

    // Fetch posts for the specific user
    this.postService.getUserPosts(targetId, this.page()).subscribe({
      next: (res: ApiResponse<SliceResponse<Post>>) => {
        if (res.errors === null) {
          const newPosts = res.data.content;

          // Append new posts to the existing list
          this.posts.update(current => [...current, ...newPosts]);

          // Increment page counter and update 'hasMore' flag
          this.page.update(p => p + 1);
          this.hasMore.set(!res.data.last);

          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading profile posts:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Check if the user has scrolled near the bottom of the page
  checkScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
      this.loadPosts();
    }
  }

  // Emit scroll event to the subject (throttled to save CPU)
  @HostListener('window:scroll', [])
  onScroll(): void {
    this.scrollSubject.next();
  }

  onPostDeleted(postId: string) {
    this.posts.update(current => current.filter(p => p.id !== postId));
  }
}
