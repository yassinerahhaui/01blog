import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response';
import { Notification } from '../../models/notification';

@Injectable({
  providedIn: 'root',
})
export class Notifications {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  items = signal<Notification[]>([]);
  unreadCount = signal(0);

  /** Fetch all notifications for the current user */
  getAll(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(this.apiUrl);
  }

  /** Mark a single notification as read */
  markAsRead(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  /** Mark all notifications as read */
  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {});
  }

  /** Delete a notification */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Load notifications and update signals */
  refresh(): void {
    this.getAll().subscribe({
      next: (res) => {
        this.items.set(res.data || []);
        this.unreadCount.set((res.data || []).filter((n) => !n.isRead).length);
      },
      error: () => {
        // Silently fail — user might not be logged in
      },
    });
  }
}
