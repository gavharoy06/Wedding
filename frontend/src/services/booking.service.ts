import type { Booking } from '../types';
import api from './axios';

interface CreateBookingData {
  venue_id: number;
  booking_date: string;
  additional_info?: string;
}

export const bookingService = {
  create: async (data: CreateBookingData): Promise<{ booking: Booking }> => {
    const res = await api.post('/bookings', data);
    return res.data;
  },

  getMyBookings: async (): Promise<{ bookings: Booking[] }> => {
    const res = await api.get('/bookings/my');
    return res.data;
  },

  // Owner uchun
  getOwnerBookings: async (): Promise<{ bookings: Booking[] }> => {
    const res = await api.get('/owner/bookings');
    return res.data;
  },

  updateStatus: async (
    id: number,
    status: 'Tasdiqlangan' | 'Bekor qilingan'
  ): Promise<{ booking: Booking }> => {
    const res = await api.put(`/owner/bookings/${id}`, { status });
    return res.data;
  },

  // Admin uchun
  getAllBookings: async (): Promise<{ bookings: Booking[] }> => {
    const res = await api.get('/admin/bookings');
    return res.data;
  },
};