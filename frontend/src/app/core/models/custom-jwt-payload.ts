export interface CustomJwtPayload {
  sub: string;
  role: string;
  access?: 'ENABLED' | 'BLOCKED';
  exp: number;
  iat: number;
  userId: string;
}
