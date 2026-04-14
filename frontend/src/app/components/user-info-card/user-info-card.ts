import { Component, inject, OnInit, signal } from '@angular/core';
import { Auth } from '../../core/services/auth/auth';
import { Profile } from '../../core/services/profile/profile';
import { UserInfo } from '../../core/models/user-info';
import { ApiResponse } from '../../core/models/api-response';

@Component({
  selector: 'app-user-info-card',
  imports: [],
  templateUrl: './user-info-card.html',
  styleUrl: './user-info-card.scss',
})
export class UserInfoCard implements OnInit {
  private authService = inject(Auth);
  private profileService = inject(Profile);
  private user = this.authService.currentUser();
  userId = signal(this.user?.userId);
  info = signal<UserInfo | null>(null);
  isLoading = signal<boolean>(true);
  activeTab = signal<'followers' | 'following'>('followers');

  usersList = signal<any[]>([
    { id: '1', username: 'Ahmed Coder', profilePictureUrl: '' },
    { id: '2', username: 'Sara Dev', profilePictureUrl: '' },
    { id: '3', username: 'Moroccan Tech', profilePictureUrl: '' }
  ]);

  ngOnInit(): void {
    this.loadInfo();
  }

  loadInfo(): void {
    const userId = this.userId();

    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.profileService.getUserInfo(userId).subscribe({
      next: (res: ApiResponse<UserInfo>) => {
        this.info.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      }
    });
  }

  openFollowList(type: 'followers' | 'following') {
    this.activeTab.set(type);
  }

}

