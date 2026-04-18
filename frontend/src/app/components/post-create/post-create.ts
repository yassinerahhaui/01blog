import { Posts } from './../../core/services/posts/posts';
import { Component, computed, inject, OnDestroy, PLATFORM_ID, SecurityContext, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { renderMarkdown } from '../../core/utils/markdown';
import { Auth } from '../../core/services/auth/auth';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-create.html',
  styleUrl: './post-create.scss',
})
export class PostCreate implements OnDestroy {

  private postService = inject(Posts);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(Auth);
  private platformId = inject(PLATFORM_ID);
  private objectUrl: string | null = null;

  title = signal('');
  content = signal('');
  isSubmitting = signal(false);
  selectedFile = signal<File | null>(null);
  mediaPreviewUrl = signal<string | null>(null);
  mediaPreviewType = signal<'IMAGE' | 'VIDEO' | null>(null);
  selectedFileName = computed(() => this.selectedFile()?.name ?? null);
  isMediaVideo = computed(() => this.mediaPreviewType() === 'VIDEO');
  previewAuthor = computed(() => this.authService.currentUser()?.sub ?? 'your_username');
  previewReadMinutes = computed(() => {
    const words = this.content().trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 180));
  });
  renderedPreview = computed(() =>
    this.sanitizer.sanitize(SecurityContext.HTML, renderMarkdown(this.content())) ?? ''
  );

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    if (!file) return;

    this.setSelectedMedia(file);
  }

  triggerMediaPicker(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  removeSelectedMedia(fileInput?: HTMLInputElement) {
    this.selectedFile.set(null);
    this.mediaPreviewType.set(null);
    this.clearPreviewUrl();

    if (fileInput) {
      fileInput.value = '';
    }
  }

  private setSelectedMedia(file: File) {
    this.selectedFile.set(file);
    this.mediaPreviewType.set(file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE');
    this.createPreviewUrl(file);
  }

  private createPreviewUrl(file: File) {
    this.clearPreviewUrl();

    if (!isPlatformBrowser(this.platformId) || typeof URL === 'undefined') {
      return;
    }

    this.objectUrl = URL.createObjectURL(file);
    this.mediaPreviewUrl.set(this.objectUrl);
  }

  private clearPreviewUrl() {
    if (this.objectUrl && isPlatformBrowser(this.platformId) && typeof URL !== 'undefined') {
      URL.revokeObjectURL(this.objectUrl);
    }

    this.objectUrl = null;
    this.mediaPreviewUrl.set(null);
  }

  ngOnDestroy() {
    this.clearPreviewUrl();
  }

  onSubmit() {
    if (!this.title() || !this.content()) return;

    this.isSubmitting.set(true);

    const formData = new FormData();

    const postDto = {
      title: this.title(),
      content: this.content(),
    };

    formData.append('data', new Blob([JSON.stringify(postDto)], {
      type: 'application/json'
    }));

    if (this.selectedFile()) {
      formData.append('file', this.selectedFile() as Blob);
    }

    this.postService.createPost(formData).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error creating post', err);
        this.isSubmitting.set(false);
      }
    });
  }
}
