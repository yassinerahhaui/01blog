export interface Notification {
  id: string;
  message: string;
  type: string;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}
