import { api } from './api';
import type { Booking } from '../types';

interface CreateBookingBody {
  venue_id: number;
  booking_date: string;
  guest_count: number;
  additional_info?: string;
  services?: { extra_service_id: number; quantity: number }[];
}

export const bookingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation<{ message: string; booking: Booking; total_price: number; prepayment: number }, CreateBookingBody>({
      query: (body) => ({ url: '/bookings', method: 'POST', body }),
      invalidatesTags: ['Booking', 'Venue'],
    }),
    getMyBookings: builder.query<{ bookings: Booking[] }, void>({
      query: () => '/bookings/my',
      providesTags: ['Booking'],
    }),
    cancelBooking: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/bookings/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: ['Booking', 'Venue'],
    }),
  }),
});

export const { useCreateBookingMutation, useGetMyBookingsQuery, useCancelBookingMutation } = bookingApi;
