import api from './api';

export const getUser = (id: string) => api.get(`/users/${id}/`);
export const updateUser = (id: string, data: any) => api.put(`/users/${id}/`, data);
export const deleteUser = (id: string) => api.delete(`/users/${id}/`);
export const listUsers = () => api.get('/users/');
