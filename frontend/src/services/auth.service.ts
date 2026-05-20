import type { User } from '../types';
import api from './axios';


interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  user: User;
}

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};