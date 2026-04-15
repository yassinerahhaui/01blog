import { Component, effect, inject, input, OnInit, signal } from '@angular/core'; // 👈 ضروري تزيد effect
import { Post } from '../../core/models/post';
import { Comment } from '../../core/models/comment';
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/services/auth/auth';
import { Posts } from '../../core/services/posts/posts';
import { ApiResponse } from '../../core/models/api-response';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard implements OnInit {
  // Services
  authService = inject(Auth);
  postService = inject(Posts);

  // Inputs & User State
  currentUser = signal(this.authService.currentUser());
  post = input.required<Post>();

  // Likes State Signals (Optimistic UI)
  isLiked = signal<boolean>(false);
  likesCount = signal<number>(0);

  // Comments State Signals
  comments = signal<Comment[]>([]);
  isLoadingComments = signal<boolean>(false);
  isSendingComment = signal<boolean>(false);
  newCommentText = signal<string>('');

  constructor() {
    effect(() => {
      const p = this.post();
      if (p) {
        this.isLiked.set(p.isLikedByMe);
        this.likesCount.set(p.likesCount);
      }
    });
  }

  ngOnInit(): void {}

  onToggleLike() {
    const currentlyLiked = this.isLiked();
    const currentCount = this.likesCount();

    this.isLiked.set(!currentlyLiked);
    this.likesCount.set(currentlyLiked ? currentCount - 1 : currentCount + 1);

    this.postService.toggleLike(this.post().id).subscribe({
      next: (res: ApiResponse<any>) => {
        console.log('Reaction toggled:', res.data);
      },
      error: (err) => {
        console.error('Error toggling like:', err);
        this.isLiked.set(currentlyLiked);
        this.likesCount.set(currentCount);
      }
    });
  }

  loadComments() {
    this.isLoadingComments.set(true);

    this.postService.getPostComments(this.post().id).subscribe({
      next: (res: ApiResponse<Comment[]>) => {
        this.comments.set(res.data);
        console.log(this.comments());
        this.isLoadingComments.set(false);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.isLoadingComments.set(false);
      }
    });
  }

  submitComment() {
    const text = this.newCommentText().trim();
    if (!text) return;

    this.isSendingComment.set(true);

    this.postService.addComment(this.post().id, text).subscribe({
      next: (res: any) => {
        this.comments.update(current => [res.data, ...current]);
        this.post().commentsCount++;
        this.newCommentText.set('');
        this.isSendingComment.set(false);
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.isSendingComment.set(false);
      }
    });
  }

  updateCommentText(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.newCommentText.set(inputElement.value);
  }
}
