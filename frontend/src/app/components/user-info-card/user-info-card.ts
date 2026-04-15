import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { Auth } from '../../core/services/auth/auth';
import { Profile } from '../../core/services/profile/profile';
import { UserInfo } from '../../core/models/user-info';
import { ApiResponse } from '../../core/models/api-response';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-info-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-info-card.html',
  styleUrl: './user-info-card.scss',
})
export class UserInfoCard implements OnInit {
  private authService = inject(Auth);
  private profileService = inject(Profile);

  currentUser = this.authService.currentUser()?.userId;
  userId = input<string | undefined>();

  info = signal<UserInfo | null>(null);
  isLoading = signal<boolean>(true);

  activeTab = signal<'followers' | 'following'>('followers');
  isFollowingLoading = signal<boolean>(false);
  isLoadingModal = signal<boolean>(false);
  usersList = signal<any[]>([]);

  followersCount = signal<number>(0);
  isFollowing = signal<boolean>(false);

  // constructor() {
  //   effect(() => {});
  // }

  ngOnInit(): void {
    this.loadInfo();
  }

  loadInfo(): void {
    const targetId = this.userId();

    if (!targetId) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);

    this.profileService.getUserInfo(targetId).subscribe({
      next: (res: ApiResponse<UserInfo>) => {
        this.info.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
    const profile = this.info();
    if (profile) {
      this.isFollowing.set(profile.isFollowedByMe);
      this.followersCount.set(profile.followers);
    }
  }

  openFollowList(type: 'followers' | 'following') {
    this.activeTab.set(type);
    const targetId = this.userId();

    if (!targetId) return;

    this.usersList.set([]);
    this.isLoadingModal.set(true);

    const request$ =
      type === 'followers'
        ? this.profileService.getFollowers(targetId)
        : this.profileService.getFollowing(targetId);

    request$.subscribe({
      next: (res: any) => {
        this.usersList.set(res.data);
        this.isLoadingModal.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoadingModal.set(false);
      },
    });
  }

  onToggleFollow() {
    const targetId = this.userId();
    if (!targetId) return;

    const currentlyFollowing = this.isFollowing();
    const currentCount = this.followersCount();

    this.isFollowing.set(!currentlyFollowing);
    this.followersCount.set(currentlyFollowing ? currentCount - 1 : currentCount + 1);

    this.profileService.toggleFollow(targetId).subscribe({
      next: () => {},
      error: (err) => {
        console.error(err);
        this.isFollowing.set(currentlyFollowing);
        this.followersCount.set(currentCount);
      },
    });
  }
}
