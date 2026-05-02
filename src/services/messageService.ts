import api from '@/lib/axios';

export const messageService = {
  getMessages: (projectId: string) => api.get(`/messages/${projectId}`)
};
