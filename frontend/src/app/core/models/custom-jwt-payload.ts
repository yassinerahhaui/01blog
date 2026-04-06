export interface CustomJwtPayload {
  sub: string;
  role: string;
  exp: number;
  iat: number;
}
