import api from '@/lib/axios';

export const projectService = {
  getProjects: () => api.get('/projects'),

  getProjectById: (id: string) => api.get(`/projects/${id}`),

  createProject: (data: { name: string; description?: string; members?: string[] }) =>
    api.post('/projects', data),

  updateProject: (id: string, data: Partial<{ name: string; description: string; members: string[] }>) =>
    api.put(`/projects/${id}`, data),

  deleteProject: (id: string) => api.delete(`/projects/${id}`)
};
