import { ApiResponse } from './../../models/api-response';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Post } from '../../models/post';
import { SliceResponse } from '../../models/slice-response';
import { environment } from '../../../../environments/environment';

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

  getMyPosts(page: number = 0): Observable<ApiResponse<SliceResponse<Post>>> {
    return this.http.get<ApiResponse<SliceResponse<Post>>>(`${this.apiUrl}/profile/posts?page=${page}`);
  }
}
