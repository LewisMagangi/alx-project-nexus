export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
}

export interface Post {
  id: number;
  user_id: number;
  username?: string;
  content: string;
  created_at: string;
  likes_count?: number;
  is_liked?: boolean;
}

export interface Like {
  id: number;
  user_id: number;
  post_id: number;
  created_at: string;
}

export interface Follow {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
  follower_username?: string;
  following_username?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
