import { api } from './api';
import type { User } from '../types';

interface AuthResponse {
  message: string;
  user: User;
}
interface LoginResult {
  message: string;
  user?: User;
  otpRequired?: boolean;
  email?: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResult, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
    verifyOtp: builder.mutation<AuthResponse, { email: string; code: string }>({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<AuthResponse, { name: string; email: string; password: string }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
    registerOwner: builder.mutation<AuthResponse, { name: string; email: string; password: string; phone?: string }>({
      query: (body) => ({ url: '/auth/register/owner', method: 'POST', body }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Auth'],
    }),
    getMe: builder.query<{ user: User }, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyOtpMutation,
  useRegisterMutation,
  useRegisterOwnerMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi;
