export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  access: string;
  followers: number;
  following: number;
  isFollowedByMe: boolean;
}
