import { ApiResponse } from './../../models/api-response';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Post } from '../../models/post';
import { SliceResponse } from '../../models/slice-response';
import { environment } from '../../../../environments/environment';
import { Comment } from '../../models/comment';
import { Like } from '../../models/like';
import { ReportRequest } from '../../models/report-request';
import { ReportResponse } from '../../models/report-response';

@Injectable({
  providedIn: 'root',
})
export class Posts {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  getAll(): Observable<ApiResponse<Post[]>> {
    return this.http.get<ApiResponse<Post[]>>(`${this.apiUrl}/post/all`);
  }

  getFeed(page: number = 0, size: number = 5): Observable<ApiResponse<SliceResponse<Post>>> {
    return this.http.get<ApiResponse<SliceResponse<Post>>>(
      `${this.apiUrl}/post/feed?page=${page}&size=${size}`
    );
  }

  getById(postId: string): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(`${this.apiUrl}/post/${postId}`);
  }

  createPost(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/post/create`, formData);
  }

  getUserPosts(targetId: string, page: number = 0, size: number = 5): Observable<ApiResponse<SliceResponse<Post>>> {
    return this.http.get<ApiResponse<SliceResponse<Post>>>(
      `${this.apiUrl}/profile/${targetId}/posts?page=${page}&size=${size}`,
    );
  }

  // Fetch comments for a specific post
  getPostComments(postId: string): Observable<ApiResponse<Comment[]>> {
    return this.http.get<ApiResponse<Comment[]>>(`${this.apiUrl}/post/${postId}/comments`);
  }

  // Add a new comment to a post
  addComment(postId: string, content: string, file?: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify({ content })], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }
    return this.http.post(`${this.apiUrl}/post/${postId}/comments`, formData);
  }

  toggleLike(postId: string): Observable<ApiResponse<Like>> {
    return this.http.post<ApiResponse<Like>>(`${this.apiUrl}/post/${postId}/like`, {});
  }

  reportPost(postId: string, payload: ReportRequest): Observable<ApiResponse<ReportResponse>> {
    return this.http.post<ApiResponse<ReportResponse>>(`${this.apiUrl}/post/${postId}/report`, payload);
  }

  updatePost(post: { id: string; title: string; content: string; removeMedia?: boolean }, file?: File | null): Observable<ApiResponse<Post>> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(post)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }
    return this.http.put<ApiResponse<Post>>(`${this.apiUrl}/post/update`, formData);
  }

  deletePost(postId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/post/${postId}`);
  }
}
