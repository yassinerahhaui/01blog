export interface Comment {
  id: string;
  content: string;
  username: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'EMPTY';
}
