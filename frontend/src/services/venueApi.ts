import { api } from './api';
import type { Venue, VenueDetail } from '../types';

export const venueApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVenues: builder.query<{ venues: Venue[] }, { search?: string; district_id?: number; sort?: string } | void>({
      query: (params) => ({ url: '/venues', params: params || {} }),
      providesTags: ['Venue'],
    }),
    getVenueById: builder.query<VenueDetail, number | string>({
      query: (id) => `/venues/${id}`,
      providesTags: ['Venue'],
    }),
  }),
});

export const { useGetVenuesQuery, useGetVenueByIdQuery } = venueApi;
