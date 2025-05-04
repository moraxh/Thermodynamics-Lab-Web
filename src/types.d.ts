export interface PaginatedResponse {
  status: number;
  message?: string;
  info?: {
    total: number; 
    page: number; 
    size: number; 
    limit: number;
  },
}

export interface CommonResponse {
  status: number;
  message?: string;
}