import { Posts } from './../../core/services/posts/posts';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-create.html'
})
export class PostCreate {

  private postService = inject(Posts);
  private router = inject(Router);

  // Signals الأساسية
  title = signal('');
  content = signal('');
  isSubmitting = signal(false);

  // Signals الجديدة ديال الميديا
  mediaUrl = signal('');
  mediaType = signal(''); // 'IMAGE', 'VIDEO', etc.
  selectedFile = signal<File | null>(null);

  // ميثود باش نشدو الملف ملي اليوزر يعزلو من البيسي
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
      // يلا ختار ملف، كنخويو الرابط الخارجي باش مايصيفطهمش بجوج
      this.mediaUrl.set('');
    }
  }

  onSubmit() {
    if (!this.title() || !this.content()) return;

    this.isSubmitting.set(true);

    // 1. كنصاوبو FormData
    const formData = new FormData();

    // 2. كنصاوبو DTO ديالنا كيما كيتسناه Spring Boot
    const postDto = {
      title: this.title(),
      content: this.content(),
    };

    // 3. السحر ديال الربط: كنصيفطو الـ DTO كـ JSON Blob
    formData.append('data', new Blob([JSON.stringify(postDto)], {
      type: 'application/json'
    }));

    // 4. يلا كان شي ملف، كنزيدوه
    if (this.selectedFile()) {
      formData.append('file', this.selectedFile() as Blob);
    }

    // 5. كنصيفطو الريكويست للسيرفيس
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
