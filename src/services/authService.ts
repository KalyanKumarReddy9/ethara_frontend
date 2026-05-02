import api from '@/lib/axios';

export const authService = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),

  /** Admin: list members for assignment */
  getUsers: () => api.get('/auth/users')
};
