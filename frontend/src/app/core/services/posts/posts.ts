import { ApiResponse } from './../../models/api-response';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Post } from '../../models/post';

@Injectable({
  providedIn: 'root',
})
export class Posts {
  private http = inject(HttpClient);
  private apiUrl = `http://localhost:8080/api`;

  getAll(): Observable<ApiResponse<Post[]>> {
    return this.http.get<ApiResponse<Post[]>>(`${this.apiUrl}/post/all`);
  }
  createPost(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}
