export interface AdminReport {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'POST' | 'USER';
  reason: string;
  details: string | null;
  status: 'OPEN' | 'REVIEWED';
  createdAt: string;
}
