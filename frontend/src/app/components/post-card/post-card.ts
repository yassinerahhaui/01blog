import { Component, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { Post } from '../../core/models/post';
import { Comment } from '../../core/models/comment';
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/services/auth/auth';
import { Posts } from '../../core/services/posts/posts';
import { ApiResponse } from '../../core/models/api-response';
import { RouterLink } from "@angular/router";
import { ReportResponse } from '../../core/models/report-response';
import { Toast } from '../../core/services/toast/toast';

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
  private toast = inject(Toast);

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
  reportReasonOptions: string[] = [
    'Spam or misleading content',
    'Harassment or hate speech',
    'Violence or dangerous behavior',
    'Sexual or explicit content',
    'Copyright infringement',
    'Scam or fraud',
    'Other',
  ];

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
    const nowLiked = !currentlyLiked;

    // Optimistic update; revert if the request fails.
    this.isLiked.set(!currentlyLiked);
    this.likesCount.set(currentlyLiked ? currentCount - 1 : currentCount + 1);

    this.postService.toggleLike(this.post().id).subscribe({
      next: (res: ApiResponse<any>) => {
        console.log('Reaction toggled:', res.data);
        this.toast.show({
          title: nowLiked ? 'Post liked' : 'Like removed',
          message: nowLiked ? 'You liked this post.' : 'You unliked this post.',
          variant: 'success',
        });
      },
      error: (err) => {
        console.error('Error toggling like:', err);
        this.isLiked.set(currentlyLiked);
        this.likesCount.set(currentCount);
        const message = err?.error?.errors?.[0]?.message || 'Failed to update like.';
        this.toast.show({
          title: 'Like failed',
          message,
          variant: 'danger',
        });
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
        this.toast.show({
          title: 'Comments failed',
          message: 'Unable to load comments right now.',
          variant: 'danger',
        });
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
        this.toast.show({
          title: 'Comment posted',
          message: 'Your comment is now live.',
          variant: 'success',
        });
      },
      error: (err) => {
        const message = err?.error?.errors?.[0]?.message || 'Failed to post this comment.';
        this.toast.show({
          title: 'Comment failed',
          message,
          variant: 'danger',
        });
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
    const inputElement = event.target as HTMLSelectElement;
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
        this.toast.show({
          title: 'Post updated',
          message: 'Your changes have been saved.',
          variant: 'success',
        });
      },
      error: (err) => {
        const message = err?.error?.errors?.[0]?.message || 'Failed to update this post.';
        this.toast.show({
          title: 'Update failed',
          message,
          variant: 'danger',
        });
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
        this.toast.show({
          title: 'Post deleted',
          message: 'Your post has been removed.',
          variant: 'danger',
        });
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.isConfirmingDelete.set(false);
        const message = err?.error?.errors?.[0]?.message || 'Failed to delete this post.';
        this.toast.show({
          title: 'Delete failed',
          message,
          variant: 'danger',
        });
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
          this.reportReason.set('');
          this.reportDetails.set('');
          this.isSubmittingReport.set(false);
          this.closeReportModal();
          this.toast.show({
            title: 'Report sent',
            message: 'Thanks for letting us know. Our team will review this post.',
            variant: 'success',
          });
        },
        error: (err) => {
          const message = err?.error?.errors?.[0]?.message || 'Failed to submit this report.';
          this.toast.show({
            title: 'Report failed',
            message,
            variant: 'danger',
          });
          this.reportFeedback.set({ type: 'danger', message });
          this.isSubmittingReport.set(false);
        },
      });
  }

  private closeReportModal() {
    if (typeof window === 'undefined') return;

    const modalElement = document.getElementById(`reportPostModal-${this.post().id}`);
    if (!modalElement) return;

    const bootstrapApi = (window as any).bootstrap;
    if (bootstrapApi?.Modal) {
      const instance = bootstrapApi.Modal.getOrCreateInstance(modalElement);
      instance.hide();
      return;
    }

    const dismissButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLButtonElement | null;
    dismissButton?.click();
  }
}
