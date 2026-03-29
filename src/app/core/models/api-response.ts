interface ErrorItem {
  message: string
}

export interface ApiResponse<T> {
  data: T;
  errors: ErrorItem[] | null;
  status: string;
}
