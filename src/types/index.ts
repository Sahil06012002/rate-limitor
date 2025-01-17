export interface User {
  id: string;
  api_key: string;
  created_at: string;
}

export interface App {
  id: string;
  user_id: string;
  name: string;
  base_url: string;
  rate_limit: number;
  time_window: number;
  created_at: string;
}

export interface RateLimitConfig {
  strategy: 'token-bucket' | 'sliding-window';
  requestCount: number;
  timeWindow: number; // in seconds
}

export interface QueuedRequest {
  id: string;
  appId: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body: any;
  timestamp: number;
}
declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}