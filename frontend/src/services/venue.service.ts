import type { Venue } from '../types';
import api from './axios';

interface VenueFilters {
  search?: string;
  region?: string;
  sort?: 'asc' | 'desc';
}

export const venueService = {
  getAll: async (filters: VenueFilters = {}): Promise<{ venues: Venue[] }> => {
    const res = await api.get('/venues', { params: filters });
    return res.data;
  },

  getById: async (id: number): Promise<{ venue: Venue; bookedDates: string[] }> => {
    const res = await api.get(`/venues/${id}`);
    return res.data;
  },

  // Admin uchun
  create: async (data: FormData): Promise<{ venue: Venue }> => {
    const res = await api.post('/admin/venues', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Venue>): Promise<{ venue: Venue }> => {
    const res = await api.put(`/admin/venues/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/venues/${id}`);
  },
};