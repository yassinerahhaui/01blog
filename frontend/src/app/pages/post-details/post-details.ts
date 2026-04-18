import { CommonModule } from '@angular/common';
import { Component, computed, inject, SecurityContext, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Posts } from '../../core/services/posts/posts';
import { Post } from '../../core/models/post';
import { ApiResponse } from '../../core/models/api-response';
import { Comment } from '../../core/models/comment';
import { UserInfoCard } from '../../components/user-info-card/user-info-card';
import { renderMarkdown } from '../../core/utils/markdown';

@Component({
  selector: 'app-post-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './post-details.html',
  styleUrl: './post-details.scss',
})
export class PostDetails {
  private route = inject(ActivatedRoute);
  private postService = inject(Posts);
  private sanitizer = inject(DomSanitizer);

  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);
  isLoading = signal<boolean>(true);
  isLoadingComments = signal<boolean>(false);
  isSendingComment = signal<boolean>(false);
  isLiking = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  newCommentText = signal<string>('');
  commentFile = signal<File | null>(null);
  commentMediaPreview = signal<string | null>(null);
  renderedContent = computed(() => {
    const content = this.post()?.content ?? '';
    return this.sanitizer.sanitize(SecurityContext.HTML, renderMarkdown(content)) ?? '';
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const postId = params.get('id');

      if (!postId) {
        this.errorMessage.set('Post not found.');
        this.isLoading.set(false);
        return;
      }

      this.loadPost(postId);
      this.loadComments(postId);
    });
  }

  loadPost(postId: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.postService.getById(postId).subscribe({
      next: (res: ApiResponse<Post>) => {
        this.post.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load this post.');
        this.isLoading.set(false);
      },
    });
  }

  loadComments(postId: string) {
    this.isLoadingComments.set(true);

    this.postService.getPostComments(postId).subscribe({
      next: (res: ApiResponse<Comment[]>) => {
        this.comments.set(res.data);
        this.isLoadingComments.set(false);
      },
      error: () => {
        this.isLoadingComments.set(false);
      },
    });
  }

  onToggleLike() {
    const currentPost = this.post();
    if (!currentPost || this.isLiking()) return;

    const previousLiked = currentPost.isLikedByMe;
    const previousCount = currentPost.likesCount;

    this.isLiking.set(true);
    this.post.set({
      ...currentPost,
      isLikedByMe: !previousLiked,
      likesCount: previousLiked ? previousCount - 1 : previousCount + 1,
    });

    this.postService.toggleLike(currentPost.id).subscribe({
      next: () => {
        this.isLiking.set(false);
      },
      error: () => {
        this.post.set({
          ...currentPost,
          isLikedByMe: previousLiked,
          likesCount: previousCount,
        });
        this.isLiking.set(false);
      },
    });
  }

  submitComment() {
    const currentPost = this.post();
    const content = this.newCommentText().trim();

    if (!currentPost || !content || this.isSendingComment()) return;

    this.isSendingComment.set(true);

    this.postService.addComment(currentPost.id, content, this.commentFile()).subscribe({
      next: (res: ApiResponse<Comment>) => {
        this.comments.update((current) => [res.data, ...current]);
        this.post.set({
          ...currentPost,
          commentsCount: currentPost.commentsCount + 1,
        });
        this.newCommentText.set('');
        this.commentFile.set(null);
        this.commentMediaPreview.set(null);
        this.isSendingComment.set(false);
      },
      error: () => {
        this.isSendingComment.set(false);
      },
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
}
