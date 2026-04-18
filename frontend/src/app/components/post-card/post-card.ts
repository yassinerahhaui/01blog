import { Component, effect, inject, input, OnInit, output, signal } from '@angular/core';
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
  commentFile = signal<File | null>(null);
  commentMediaPreview = signal<string | null>(null);
  reportReason = signal<string>('');
  reportDetails = signal<string>('');
  isSubmittingReport = signal<boolean>(false);
  reportFeedback = signal<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Edit state
  isEditing = signal<boolean>(false);
  editTitle = signal<string>('');
  editContent = signal<string>('');
  isSaving = signal<string | null>(null);
  editFile = signal<File | null>(null);
  editMediaPreview = signal<string | null>(null);
  removeMedia = signal<boolean>(false);

  // Delete state
  postDeleted = output<string>();
  isConfirmingDelete = signal<boolean>(false);
  isDeleting = signal<boolean>(false);

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

    this.postService.addComment(this.post().id, text, this.commentFile()).subscribe({
      next: (res: any) => {
        this.comments.update(current => [res.data, ...current]);
        this.post().commentsCount++;
        this.newCommentText.set('');
        this.commentFile.set(null);
        this.commentMediaPreview.set(null);
        this.isSendingComment.set(false);
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.isSendingComment.set(false);
      }
    });
  }

  handleCommentFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.commentFile.set(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.commentMediaPreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      this.commentMediaPreview.set(null);
    }
  }

  removeCommentMedia() {
    this.commentFile.set(null);
    this.commentMediaPreview.set(null);
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
    this.editTitle.set(this.post().title);
    this.editContent.set(this.post().content);
    this.editFile.set(null);
    this.editMediaPreview.set(this.post().mediaUrl ?? null);
    this.removeMedia.set(false);
    this.isSaving.set(null);
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editFile.set(null);
    this.editMediaPreview.set(null);
    this.removeMedia.set(false);
  }

  updateEditTitle(event: Event) {
    this.editTitle.set((event.target as HTMLInputElement).value);
  }

  updateEditContent(event: Event) {
    this.editContent.set((event.target as HTMLTextAreaElement).value);
  }

  handleFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.editFile.set(file);
    this.removeMedia.set(false);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.editMediaPreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      this.editMediaPreview.set(this.post().mediaUrl ?? null);
    }
  }

  removeEditMedia() {
    this.editFile.set(null);
    this.editMediaPreview.set(null);
    this.removeMedia.set(true);
  }

  saveEdit() {
    const title = this.editTitle().trim();
    const content = this.editContent().trim();
    if (!title || !content || this.isSaving() !== null) return;

    this.isSaving.set('saving');
    this.postService.updatePost(
      { id: this.post().id, title, content, removeMedia: this.removeMedia() },
      this.editFile()
    ).subscribe({
      next: (res: ApiResponse<Post>) => {
        const updated = res.data;
        (this.post() as any).title = updated.title;
        (this.post() as any).content = updated.content;
        (this.post() as any).mediaUrl = updated.mediaUrl;
        (this.post() as any).mediaType = updated.mediaType;
        this.isEditing.set(false);
        this.editFile.set(null);
        this.editMediaPreview.set(null);
        this.removeMedia.set(false);
        this.isSaving.set(null);
      },
      error: () => {
        this.isSaving.set(null);
      },
    });
  }

  confirmDelete() {
    this.isConfirmingDelete.set(true);
  }

  cancelDelete() {
    this.isConfirmingDelete.set(false);
  }

  deletePost() {
    if (this.isDeleting()) return;
    this.isDeleting.set(true);
    this.postService.deletePost(this.post().id).subscribe({
      next: () => {
        this.postDeleted.emit(this.post().id);
      },
      error: () => {
        this.isDeleting.set(false);
        this.isConfirmingDelete.set(false);
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
