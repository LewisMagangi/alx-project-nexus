import axios, { AxiosInstance } from 'axios';

type PaginationParams = { search?: string; limit?: number; offset?: number };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    accepted_legal_policies: boolean;
  }) => api.post('/api/auth/register/', data),

  login: (data: { username: string; password: string }) =>
    api.post('/api/auth/login/', data),

  logout: () => api.post('/api/auth/logout/'),

  getTokenPair: (data: { username: string; password: string }) =>
    api.post('/api/auth/jwt/create/', data),

  refreshToken: (refresh: string) =>
    api.post('/api/auth/jwt/refresh/', { refresh }),
};

// ============================================
// POSTS API
// ============================================
export const postsAPI = {
  getAll: async (params?: { search?: string; limit?: number; offset?: number }) => {
    const response = await api.get('/api/posts/', { params });
    // If paginated, return results; else, return as array or empty array
    if (Array.isArray(response.data)) {
      return { data: response.data };
    } else if (Array.isArray(response.data.results)) {
      return { data: response.data.results };
    } else {
      return { data: [] };
    }
  },

  getById: (id: number) => api.get(`/api/posts/${id}/`),

  create: (data: { content: string; parent_post?: number | null; quote_of?: number | null }) =>
    api.post('/api/posts/', data),

  update: (id: number, data: { content: string }) =>
    api.patch(`/api/posts/${id}/`, data),

  delete: (id: number) => api.delete(`/api/posts/${id}/`),

  getHomeFeed: () => api.get('/api/posts/home/'),

  getUserPosts: (userId: number) => api.get(`/api/posts/user/${userId}/`),

  // --- Advanced/Thread/Retweet/Hashtag/Mention ---
  retweet: (postId: number) =>
    api.post(`/api/posts/${postId}/retweet/`),

  unretweet: (postId: number) =>
    api.post(`/api/posts/${postId}/unretweet/`),

  getThread: (postId: number) =>
    api.get(`/api/posts/${postId}/thread/`),

  getTrendingHashtags: () =>
    api.get(`/api/posts/trending_hashtags/`),

  getByHashtag: (tag: string, params?: PaginationParams) =>
    api.get(`/api/posts/`, { params: { ...params, hashtag: tag } }),

  getByMention: (username: string, params?: PaginationParams) =>
    api.get(`/api/posts/`, { params: { ...params, mention: username } }),
};

// ============================================
// LIKES API
// ============================================
export const likesAPI = {
  getAll: (params?: { limit?: number; offset?: number }) =>
    api.get('/api/likes/', { params }),

  create: (postId: number) => api.post('/api/likes/', { post: postId }),

  delete: (id: number) => api.delete(`/api/likes/${id}/`),
};

// ============================================
// FOLLOWS API
// ============================================
export const followsAPI = {
  getAll: (params?: { limit?: number; offset?: number }) =>
    api.get('/api/follows/', { params }),

  create: (followingId: number) => {
    console.log('Creating follow with data:', { following: followingId });
    return api.post('/api/follows/', { following: followingId });
  },

  delete: (id: number) => api.delete(`/api/follows/${id}/`),
};

// ============================================
// BOOKMARKS API
// ============================================
export const bookmarksAPI = {
  getAll: (params?: { limit?: number; offset?: number }) =>
    api.get('/api/bookmarks/', { params }),

  create: (postId: number) =>
    api.post('/api/bookmarks/', { post_id: postId }),

  delete: (id: number) => api.delete(`/api/bookmarks/${id}/`),
};

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsAPI = {
  getAll: (params?: { limit?: number; offset?: number }) =>
    api.get('/api/notifications/', { params }),

  markAsRead: (id: number) =>
    api.post(`/api/notifications/mark-read/${id}/`),
};

// ============================================
// MESSAGES API
// ============================================
export const messagesAPI = {
  getConversation: (userId: number) =>
    api.get(`/api/messages/${userId}/`),

  sendMessage: (userId: number, content: string) =>
    api.post(`/api/messages/${userId}/`, { content }),
};

// ============================================
// COMMUNITIES API
// ============================================
export const communitiesAPI = {
  getAll: (params?: { limit?: number; offset?: number }) =>
    api.get('/api/communities/', { params }),

  create: (data: { name: string; description?: string }) =>
    api.post('/api/communities/', data),

  join: (communityId: number) =>
    api.post(`/api/communities/${communityId}/join/`),

  getPosts: (communityId: number, params?: { limit?: number; offset?: number }) =>
    api.get(`/api/communities/${communityId}/posts/`, { params }),

  createPost: (communityId: number, content: string) =>
    api.post(`/api/communities/${communityId}/posts/`, { content }),
};

// ============================================
// SEARCH API
// ============================================
export const searchAPI = {
  search: (query: string) => api.get('/api/search/', { params: { q: query } }),
};

// ============================================
// ACCOUNT API
// ============================================
export const accountAPI = {
  update: (data: { username?: string; email?: string }) =>
    api.put('/api/account/update/', data),

  updateProfile: (data: {
    bio?: string;
    location?: string;
    website?: string;
    avatar_url?: string;
    header_url?: string;
  }) => api.patch('/api/account/profile/', data),

  getProfile: () => api.get('/api/account/profile/'),

  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post('/api/account/password/', data),

  deactivate: () => api.delete('/api/account/delete/'),
};

// ============================================
// USERS API
// ============================================
export const usersAPI = {
  getAll: (params?: { search?: string; limit?: number; offset?: number }) =>
    api.get('/api/users/', { params }),

  getById: (id: number) => api.get(`/api/users/${id}/`),

  getByUsername: (username: string) => api.get(`/api/users/${username}/`),

  update: (id: number, data: { username?: string; email?: string }) =>
    api.patch(`/api/users/${id}/`, data),

  delete: (id: number) => api.delete(`/api/users/${id}/`),
};

export default api;
