import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { Auth } from '../../core/services/auth/auth';
import { Profile } from '../../core/services/profile/profile';
import { UserInfo } from '../../core/models/user-info';
import { ApiResponse } from '../../core/models/api-response';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportResponse } from '../../core/models/report-response';

@Component({
  selector: 'app-user-info-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-info-card.html',
  styleUrl: './user-info-card.scss',
})
export class UserInfoCard implements OnInit {
  private authService = inject(Auth);
  private profileService = inject(Profile);

  currentUser = signal(this.authService.currentUser());
  userId = input<string | undefined>();

  info = signal<UserInfo | null>(null);
  isLoading = signal<boolean>(true);

  activeTab = signal<'followers' | 'following'>('followers');
  isFollowingLoading = signal<boolean>(false);
  isLoadingModal = signal<boolean>(false);
  usersList = signal<any[]>([]);

  followersCount = signal<number>(0);
  followingCount = signal<number>(0);
  isFollowing = signal<boolean>(false);
  reportReason = signal<string>('');
  reportDetails = signal<string>('');
  isSubmittingReport = signal<boolean>(false);
  reportFeedback = signal<{ type: 'success' | 'danger'; message: string } | null>(null);
  reportReasonOptions: string[] = [
    'Harassment or bullying',
    'Impersonation',
    'Spam behavior',
    'Hate speech',
    'Scam or fraud',
    'Inappropriate profile content',
    'Other',
  ];

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

        this.isFollowing.set(res.data.isFollowedByMe || false);
        this.followersCount.set(res.data.followersCount || 0);
        this.followingCount.set(res.data.followingCount || 0);
        this.isFollowing.set(res.data.isFollowedByMe || false);
        console.log(res.data.isFollowedByMe);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
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

  updateReportReason(event: Event) {
    const inputElement = event.target as HTMLSelectElement;
    this.reportReason.set(inputElement.value);
  }

  updateReportDetails(event: Event) {
    const inputElement = event.target as HTMLTextAreaElement;
    this.reportDetails.set(inputElement.value);
  }

  submitReport() {
    const targetId = this.userId();
    const reason = this.reportReason().trim();
    const details = this.reportDetails().trim();

    if (!targetId || !reason || this.isSubmittingReport()) return;

    this.isSubmittingReport.set(true);
    this.reportFeedback.set(null);

    this.profileService
      .reportUser(targetId, {
        reason,
        details: details || null,
      })
      .subscribe({
        next: (res: ApiResponse<ReportResponse>) => {
          this.reportFeedback.set({ type: 'success', message: 'User report submitted for review.' });
          this.reportReason.set('');
          this.reportDetails.set('');
          this.isSubmittingReport.set(false);
          this.closeReportModal();
          this.reportFeedback.set(null);
        },
        error: (err) => {
          const message = err?.error?.errors?.[0]?.message || 'Failed to submit this report.';
          this.reportFeedback.set({ type: 'danger', message });
          this.isSubmittingReport.set(false);
        },
      });
  }

  private closeReportModal() {
    if (typeof window === 'undefined') return;

    const modalElement = document.getElementById('userReportModal');
    if (!modalElement) return;

    const bootstrapApi = (window as any).bootstrap;
    if (bootstrapApi?.Modal) {
      const instance = bootstrapApi.Modal.getOrCreateInstance(modalElement);
      instance.hide();
      return;
    }

    const dismissButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLButtonElement | null;
    dismissButton?.click();
  }
}
