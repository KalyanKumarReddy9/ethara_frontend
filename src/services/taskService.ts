import api from '@/lib/axios';

export const taskService = {
  getTasks: (params?: { projectId?: string; status?: string; assignedTo?: string }) =>
    api.get('/tasks', { params }),

  createTask: (data: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: string;
    status?: string;
    assignedTo?: string;
    projectId: string;
  }) => api.post('/tasks', data),

  updateTask: (id: string, data: Partial<{
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    status: string;
    assignedTo: string;
  }>) => api.put(`/tasks/${id}`, data),

  deleteTask: (id: string) => api.delete(`/tasks/${id}`)
};
