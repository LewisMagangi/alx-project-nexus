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

  // Ownership
  user?: UserMini | null;
  user_id: number;
  username?: string;

  // Likes
  likes_count: number;
  is_liked?: boolean;

  // Bookmarks
  is_bookmarked?: boolean;

  // Replies
  parent_post?: Post | null;
  replies_count?: number;
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
