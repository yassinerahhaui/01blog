export interface SliceResponse<T> {
  content: T[];
  last: boolean;
  first: boolean;
  number: number;
  size: number;
  numberOfElements: number;
}
