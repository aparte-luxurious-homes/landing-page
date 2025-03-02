export interface ApiError {
  data: {
    message?: string;
    errors?: Array<{ message: string }>;
  };
  status?: number;
}
