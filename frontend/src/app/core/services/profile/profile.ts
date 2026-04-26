import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { UserInfo } from '../../models/user-info';
import { ReportRequest } from '../../models/report-request';
import { ReportResponse } from '../../models/report-response';
import { SliceResponse } from '../../models/slice-response';

@Injectable({
  providedIn: 'root',
})
export class Profile {
  private http = inject(HttpClient);

  // Base URL for the profile controller in Spring Boot
  private apiUrl = `${environment.apiUrl}`;

  // Fetch basic user info (name, avatar, etc.)
  getUserInfo(userId: string): Observable<ApiResponse<UserInfo>> {
    return this.http.get<ApiResponse<UserInfo>>(`${this.apiUrl}/user/${userId}`);
  }

  // Toggle follow/unfollow status for a specific user
  toggleFollow(targetUserId: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/profile/${targetUserId}/follow`, {});
  }

  // Fetch the list of users following the specified user
  getFollowers(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${userId}/followers`);
  }

  // Fetch the list of users that the specified user is following
  getFollowing(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${userId}/following`);
  }

  searchUsers(query: string = '', page: number = 0, size: number = 20): Observable<ApiResponse<SliceResponse<UserInfo>>> {
    const params = new HttpParams()
      .set('q', query.trim())
      .set('page', String(page))
      .set('size', String(size));

    return this.http.get<ApiResponse<SliceResponse<UserInfo>>>(`${this.apiUrl}/user/search`, { params });
  }

  reportUser(targetUserId: string, payload: ReportRequest): Observable<ApiResponse<ReportResponse>> {
    return this.http.post<ApiResponse<ReportResponse>>(`${this.apiUrl}/profile/${targetUserId}/report`, payload);
  }
}
