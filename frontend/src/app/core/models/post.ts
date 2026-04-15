export interface Post {
  id: string;
  title: string;
  content: string;
  mediaUrl: string;
  mediaType: string;
  userId: string;
  commentsCount: number;
  likesCount: number;
  isLikedByMe: boolean;
}
