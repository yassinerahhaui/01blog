import { Posts } from './../../core/services/posts/posts';
import { Component, computed, inject, SecurityContext, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { renderMarkdown } from '../../core/utils/markdown';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-create.html'
})
export class PostCreate {

  private postService = inject(Posts);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  title = signal('');
  content = signal('');
  isSubmitting = signal(false);
  selectedFile = signal<File | null>(null);
  renderedPreview = computed(() =>
    this.sanitizer.sanitize(SecurityContext.HTML, renderMarkdown(this.content())) ?? ''
  );

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (file) {
      this.selectedFile.set(file);
    }
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
