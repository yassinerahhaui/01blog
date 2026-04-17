export interface ReportResponse {
  id: string;
  targetId: string;
  targetType: 'POST' | 'USER';
  reason: string;
  details: string | null;
  status: 'OPEN' | 'REVIEWED';
}
