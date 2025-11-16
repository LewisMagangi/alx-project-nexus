import api from './api';

export const getProjects = () => api.get('/projects/');
export const getProject = (id: string) => api.get(`/projects/${id}/`);
export const createProject = (data: any) => api.post('/projects/', data);
export const updateProject = (id: string, data: any) => api.put(`/projects/${id}/`, data);
export const deleteProject = (id: string) => api.delete(`/projects/${id}/`);
