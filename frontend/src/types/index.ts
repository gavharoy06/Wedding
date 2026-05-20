export type UserRole = 'user' | 'owner' | 'admin';

export interface User {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Venue {
  venue_id: number;
  name: string;
  region: string;
  seats: number;
  price: number;
  description?: string;
  image_url?: string;
  owner_id: number;
  created_at: string;
}

export interface Booking {
  booking_id: number;
  user_id: number;
  venue_id: number;
  booking_date: string;
  additional_info?: string;
  status: 'Kutilmoqda' | 'Tasdiqlangan' | 'Bekor qilingan';
  created_at: string;
  // JOIN dan keladigan qo'shimcha maydonlar
  venue_name?: string;
  venue_region?: string;
  venue_price?: number;
  venue_image?: string;
  user_name?: string;
  user_email?: string;
}

export interface VenueDetail extends Venue {
  bookedDates: string[];
}

// API response uchun
export interface ApiResponse<T> {
  message?: string;
  data?: T;
}