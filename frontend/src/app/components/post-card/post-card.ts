import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { Post } from '../../core/models/post';
import { Comment } from '../../core/models/comment';
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/services/auth/auth';
import { Posts } from '../../core/services/posts/posts';
import { ApiResponse } from '../../core/models/api-response';
import { RouterLink } from "@angular/router";
import { ReportResponse } from '../../core/models/report-response';

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
  reportReason = signal<string>('');
  reportDetails = signal<string>('');
  isSubmittingReport = signal<boolean>(false);
  reportFeedback = signal<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Edit state
  isEditing = signal<boolean>(false);
  editTitle = signal<string>('');
  editContent = signal<string>('');
  isSaving = signal<boolean>(false);

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

  updateReportReason(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.reportReason.set(inputElement.value);
  }

  updateReportDetails(event: Event) {
    const inputElement = event.target as HTMLTextAreaElement;
    this.reportDetails.set(inputElement.value);
  }

  startEdit() {
    this.isEditing.set(true);
    this.editTitle.set(this.post().title);
    this.editContent.set(this.post().content);
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  updateEditTitle(event: Event) {
    this.editTitle.set((event.target as HTMLInputElement).value);
  }

  updateEditContent(event: Event) {
    this.editContent.set((event.target as HTMLTextAreaElement).value);
  }

  saveEdit() {
    const title = this.editTitle().trim();
    const content = this.editContent().trim();
    if (!title || !content || this.isSaving()) return;

    this.isSaving.set(true);
    this.postService.updatePost({ id: this.post().id, title, content }).subscribe({
      next: () => {
        // Update the post card display locally
        (this.post() as any).title = title;
        (this.post() as any).content = content;
        this.isEditing.set(false);
        this.isSaving.set(false);
      },
      error: () => {
        this.isSaving.set(false);
      },
    });
  }

  submitReport() {
    const reason = this.reportReason().trim();
    const details = this.reportDetails().trim();

    if (!reason || this.isSubmittingReport()) return;

    this.isSubmittingReport.set(true);
    this.reportFeedback.set(null);

    this.postService
      .reportPost(this.post().id, {
        reason,
        details: details || null,
      })
      .subscribe({
        next: (res: ApiResponse<ReportResponse>) => {
          this.reportFeedback.set({ type: 'success', message: 'Report submitted for review.' });
          this.reportReason.set('');
          this.reportDetails.set('');
          this.isSubmittingReport.set(false);
        },
        error: (err) => {
          const message = err?.error?.errors?.[0]?.message || 'Failed to submit this report.';
          this.reportFeedback.set({ type: 'danger', message });
          this.isSubmittingReport.set(false);
        },
      });
  }
}
