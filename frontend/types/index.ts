// ========== BASIC USER SHAPE ==========
export interface UserMini {
  id: number;
  username: string;
}

// ========== FULL USER ==========
export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
}

// ========== POST ==========
export interface Post {
  id: number;
  content: string;
  created_at: string;

  // User info - backend returns 'user' as ID and 'user_data' as object
  user: number;  // User ID from backend
  user_id?: number;  // Legacy support
  username: string;
  user_data?: UserMini;  // Full user object from backend

  // Counts
  likes_count?: number;  // Legacy
  like_count?: number;   // New backend field
  reply_count: number;
  retweet_count: number;
  quote_count: number;
  bookmark_count?: number;

  // User interactions
  is_liked?: boolean;
  is_bookmarked?: boolean;
  is_liked_by_user?: boolean;
  is_bookmarked_by_user?: boolean;
  is_retweeted_by_user?: boolean;

  // Thread support
  parent_post?: number | null;
  root_post?: number | null;

  // Retweet support
  retweet_of?: number | Post | null;
  retweet_of_data?: Post | null;
  is_quote_tweet: boolean;
  is_retweet: boolean;
  is_reply: boolean;

  // Rich content
  hashtags?: Array<{id: number; tag: string}>;
  mentions?: Array<{id: number; username: string}>;
  
  // Metadata
  updated_at?: string;
  is_deleted?: boolean;
}

// ========== BOOKMARK ==========
export interface Bookmark {
  id: number;
  created_at: string;
  post?: Post | null;
  post_id?: number;
}

// ========== LIKE ==========
export interface Like {
  id: number;
  user_id: number;
  post_id: number;
  created_at: string;
}

// ========== FOLLOW ==========
export interface Follow {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;

  follower_username?: string;
  following_username?: string;
}

// ========== NOTIFICATION ==========
export interface Notification {
  id: number;

  // Who receives it
  user_id: number;

  // Who triggered it (like, follow)
  actor_id?: number;
  actor_username?: string;

  verb: string; // "liked_post", "followed_you"

  // Optional target reference (post, user, community)
  target_id?: number;
  target_type?: string;

  is_read: boolean;
  created_at: string;
}

// ========== AUTH ==========
export interface AuthResponse {
  token: string;
  user: User;
}

// ========== ERROR FORMAT ==========
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
