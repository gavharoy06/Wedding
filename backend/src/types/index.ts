import { Request } from 'express';

export type UserRole = 'client' | 'owner' | 'admin';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type VenueStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type User = {
  user_id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  is_verified: boolean;
  created_at: Date;
};

export type Venue = {
  venue_id: number;
  name: string;
  district_id: number;
  seats: number;
  price: number;
  description?: string;
  address?: string;
  phone?: string;
  status: VenueStatus;
  owner_id: number;
  created_at: Date;
};

export type Booking = {
  booking_id: number;
  user_id: number;
  venue_id: number;
  booking_date: string;
  additional_info?: string;
  guest_count?: number;
  total_price?: number;
  prepayment?: number;
  status: BookingStatus;
  created_at: Date;
};

export type JwtPayload = {
  user_id: number;
  role: UserRole;
};

export type AuthRequest = Request & {
  user?: JwtPayload;
};
