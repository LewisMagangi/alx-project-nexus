import api from './api';

export const login = (data: { username: string; password: string }) =>
  api.post('/api/auth/login/', data);

export const register = (data: { email: string; password: string; username?: string; accepted_legal_policies?: boolean }) =>
  api.post('/api/auth/register/', { ...data, accepted_legal_policies: data.accepted_legal_policies ?? true });

export const logout = () =>
  api.post('/api/auth/logout/');
