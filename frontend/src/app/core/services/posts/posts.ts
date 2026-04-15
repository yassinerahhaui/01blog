import { ApiResponse } from './../../models/api-response';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Post } from '../../models/post';
import { SliceResponse } from '../../models/slice-response';
import { environment } from '../../../../environments/environment';
import { Comment } from '../../models/comment';
import { Like } from '../../models/like';

@Injectable({
  providedIn: 'root',
})
export class Posts {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  getAll(): Observable<ApiResponse<Post[]>> {
    return this.http.get<ApiResponse<Post[]>>(`${this.apiUrl}/post/all`);
  }
  createPost(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/post/create`, formData);
  }

  getUserPosts(targetId: string, page: number = 0): Observable<ApiResponse<SliceResponse<Post>>> {
    return this.http.get<ApiResponse<SliceResponse<Post>>>(
      `${this.apiUrl}/profile/${targetId}/posts?page=${page}`,
    );
  }

  // Fetch comments for a specific post
  getPostComments(postId: string): Observable<ApiResponse<Comment[]>> {
    return this.http.get<ApiResponse<Comment[]>>(`${this.apiUrl}/post/${postId}/comments`);
  }

  // Add a new comment to a post
  addComment(postId: string, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/post/${postId}/comments`, { content });
  }

  toggleLike(postId: string): Observable<ApiResponse<Like>> {
    return this.http.post<ApiResponse<Like>>(`${this.apiUrl}/post/${postId}/like`, {});
  }
}
