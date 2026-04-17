export interface UserInfo {
  id: string;
  fullName?: string | null;
  username: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  access: string;
  followersCount: number;
  followingCount: number;
  isFollowedByMe: boolean;
}
