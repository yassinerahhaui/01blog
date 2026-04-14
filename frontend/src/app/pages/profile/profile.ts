import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { Posts } from '../../core/services/posts/posts';
import { Post } from '../../core/models/post';
import { ApiResponse } from '../../core/models/api-response';
import { SliceResponse } from '../../core/models/slice-response';
import { CommonModule } from '@angular/common';
import { PostCard } from '../../components/post-card/post-card';
import { UserInfoCard } from '../../components/user-info-card/user-info-card';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, PostCard, UserInfoCard],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private postService = inject(Posts);
  posts = signal<Post[]>([]);
  isLoading = signal<boolean>(true);
  hasMore = signal<boolean>(true);
  page = signal(0);

  ngOnInit(): void {
    this.loadPosts();
  }
  loadPosts() {
    if (!this.isLoading() || !this.hasMore()) return;
    this.isLoading.set(true);
    this.postService.getMyPosts(this.page()).subscribe({
      next: (res: ApiResponse<SliceResponse<Post>>)=> {
        if (res.errors === null) {
          const newPosts = res.data.content;
          this.posts.update(current => [...current, ...newPosts]);
          this.page.update(p=> p + 1);
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

  @HostListener('window:scroll', [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
      this.loadPosts();
    }
  }
}
