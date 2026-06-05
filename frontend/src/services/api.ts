import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include', // httpOnly cookie yuborilishi uchun
  }),
  tagTypes: ['Venue', 'Booking', 'Service', 'Auth'],
  endpoints: () => ({}),
});
