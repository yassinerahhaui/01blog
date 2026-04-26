import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { Slider } from '../../components/slider/slider';
import { UserCard } from '../../components/user-card/user-card';
import { Posts } from '../../core/services/posts/posts';
import { Post } from '../../core/models/post';
import { PostCard } from '../../components/post-card/post-card';
import { ApiResponse } from '../../core/models/api-response';
import { SliceResponse } from '../../core/models/slice-response';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { Auth } from '../../core/services/auth/auth';
import { Profile } from '../../core/services/profile/profile';

interface FollowingUserSummary {
  id: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Slider,UserCard, PostCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly PAGE_SIZE = 5;
  private readonly SCROLL_THRESHOLD_PX = 120;

  private postService = inject(Posts);
  private authService = inject(Auth);
  private profileService = inject(Profile);

  posts = signal<Post[]>([]);
  isLoading = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  page = signal(0);
  isFeedContextReady = signal<boolean>(false);
  shouldFilterFeedByFollowing = signal<boolean>(false);
  visibleAuthorIds = signal<Set<string>>(new Set());

  // Scroll Throttling Subject
  private scrollSubject = new Subject<void>();

  ngOnInit(): void {
    // Setup scroll throttling
    this.scrollSubject.pipe(
      throttleTime(200)
    ).subscribe(() => {
      this.checkScroll();
    });

    this.loadFeedContextAndPosts();
  }

  private loadFeedContextAndPosts(): void {
    const currentUserId = this.authService.currentUser()?.userId;

    if (!currentUserId) {
      this.isFeedContextReady.set(true);
      this.hasMore.set(false);
      return;
    }

    this.profileService.getFollowing(currentUserId).subscribe({
      next: (res: ApiResponse<FollowingUserSummary[]>) => {
        const allowedAuthorIds = new Set<string>([currentUserId]);

        for (const user of res.data ?? []) {
          if (user?.id) {
            allowedAuthorIds.add(user.id);
          }
        }

        this.visibleAuthorIds.set(allowedAuthorIds);
        this.shouldFilterFeedByFollowing.set(true);
        this.isFeedContextReady.set(true);
        this.loadPosts();
      },
      error: (err) => {
        console.error('Error loading following users:', err);
        this.shouldFilterFeedByFollowing.set(false);
        this.visibleAuthorIds.set(new Set());
        this.isFeedContextReady.set(true);
        this.loadPosts();
      },
    });
  }

  private canDisplayPost(post: Post): boolean {
    if (!this.shouldFilterFeedByFollowing()) {
      return true;
    }

    return this.visibleAuthorIds().has(post.userId);
  }

  loadPosts() {
    if (!this.isFeedContextReady() || this.isLoading() || !this.hasMore()) return;

    this.isLoading.set(true);

    this.postService.getFeed(this.page(), this.PAGE_SIZE).subscribe({
      next: (res: ApiResponse<SliceResponse<Post>>) => {
        if (res.errors === null) {
          const newPosts = res.data.content.filter((post) => !post.isHidden && this.canDisplayPost(post));
          this.posts.update(current => [...current, ...newPosts]);
          this.page.update(p => p + 1);
          this.hasMore.set(!res.data.last);

          if (this.hasMore()) {
            // Continue loading if viewport is still near the bottom after render.
            setTimeout(() => this.checkScroll(), 0);
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading feed:', err);
        this.isLoading.set(false);
      }
    });
  }

  checkScroll() {
    const currentBottom = window.innerHeight + window.scrollY;
    const pageHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

    if (currentBottom >= pageHeight - this.SCROLL_THRESHOLD_PX) {
      this.loadPosts();
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.scrollSubject.next();
  }

  onPostDeleted(postId: string) {
    this.posts.update(current => current.filter(p => p.id !== postId));
  }
}
