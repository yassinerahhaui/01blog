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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Slider,UserCard, PostCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  private postService = inject(Posts);
  posts = signal<Post[]>([]);
  isLoading = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  page = signal(0);

  // Scroll Throttling Subject
  private scrollSubject = new Subject<void>();

  ngOnInit(): void {
    // Setup scroll throttling
    this.scrollSubject.pipe(
      throttleTime(200)
    ).subscribe(() => {
      this.checkScroll();
    });

    this.loadPosts();
  }

  loadPosts() {
    if (this.isLoading() || !this.hasMore()) return;

    this.isLoading.set(true);

    this.postService.getFeed(this.page(), 20).subscribe({
      next: (res: ApiResponse<SliceResponse<Post>>) => {
        if (res.errors === null) {
          const newPosts = res.data.content;
          this.posts.update(current => [...current, ...newPosts]);
          this.page.update(p => p + 1);
          this.hasMore.set(!res.data.last);
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
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
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
