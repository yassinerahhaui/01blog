import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response';
import { UserInfo } from '../../models/user-info';
import { Post } from '../../models/post';
import { AdminReport } from '../../models/admin-report';

@Injectable({
  providedIn: 'root',
})
export class Admin {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  getUsers(): Observable<ApiResponse<UserInfo[]>> {
    return this.http.get<ApiResponse<UserInfo[]>>(`${this.apiUrl}/users`);
  }

  updateUserAccess(userId: string, access: 'ENABLED' | 'BLOCKED'): Observable<ApiResponse<UserInfo>> {
    return this.http.put<ApiResponse<UserInfo>>(`${this.apiUrl}/users/${userId}/access`, { access });
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
  }

  getPosts(): Observable<ApiResponse<Post[]>> {
    return this.http.get<ApiResponse<Post[]>>(`${this.apiUrl}/posts`);
  }

  deletePost(postId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${postId}`);
  }

  hidePost(postId: string): Observable<ApiResponse<Post>> {
    return this.http.put<ApiResponse<Post>>(`${this.apiUrl}/posts/${postId}/hide`, {});
  }

  getReports(): Observable<ApiResponse<AdminReport[]>> {
    return this.http.get<ApiResponse<AdminReport[]>>(`${this.apiUrl}/reports`);
  }

  dismissReport(reportId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reports/${reportId}/dismiss`, {});
  }
}
