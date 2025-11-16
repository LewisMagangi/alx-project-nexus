import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token to requests
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

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/api/auth/login/', credentials),

  register: (data: { username: string; email: string; password: string }) =>
    api.post('/api/auth/register/', data),

  logout: () => api.post('/api/auth/logout/'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/api/users/'),
  getById: (id: number) => api.get(`/api/users/${id}/`),
  update: (id: number, data: Partial<{ username: string; email: string }>) =>
    api.put(`/api/users/${id}/`, data),
  delete: (id: number) => api.delete(`/api/users/${id}/`),
};

// Posts API
export const postsAPI = {
  getAll: () => api.get('/api/posts/'),
  getById: (id: number) => api.get(`/api/posts/${id}/`),
  create: (data: { content: string }) => api.post('/api/posts/', data),
  update: (id: number, data: { content: string }) =>
    api.put(`/api/posts/${id}/`, data),
  delete: (id: number) => api.delete(`/api/posts/${id}/`),
};

// Likes API
export const likesAPI = {
  getAll: () => api.get('/api/likes/'),
  create: (postId: number) => api.post('/api/likes/', { post: postId }),
  delete: (id: number) => api.delete(`/api/likes/${id}/`),
};

// Follows API
export const followsAPI = {
  getAll: () => api.get('/api/follows/'),
  create: (followingId: number) =>
    api.post('/api/follows/', { following_id: followingId }),
  delete: (id: number) => api.delete(`/api/follows/${id}/`),
};

export default api;
