import { Request } from 'express';

export type UserRole = 'user' | 'owner' | 'admin';

export type User= {
  user_id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
}

export type Venue= {
  venue_id: number;
  name: string;
  region: string;
  seats: number;
  price: number;
  description?: string;
  image_url?: string;
  owner_id: number;
  created_at: Date;
}

export type Booking ={
  booking_id: number;
  user_id: number;
  venue_id: number;
  booking_date: string;
  additional_info?: string;
  status: 'Kutilmoqda' | 'Tasdiqlangan' | 'Bekor qilingan';
  created_at: Date;
}

// JWT payload type
export type JwtPayload ={
  user_id: number;
  role: UserRole;
}

// Request ga user qo'shish uchun
export type AuthRequest =  Request &{
  user?: JwtPayload;
}