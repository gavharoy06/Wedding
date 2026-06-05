export type UserRole = 'user' | 'owner' | 'admin';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type VenueStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ServiceType = 'SINGER' | 'KARNAY' | 'MENU' | 'CAR' | 'OTHER';

export type User = {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  is_verified?: boolean;
  created_at?: string;
}

export type  District = {
  district_id: number;
  district_name: string;
}

export type VenueImage = {
  image_id: number;
  image_url: string;
  is_primary: boolean;
}

export type ExtraService = {
  extra_service_id: number;
  venue_id: number;
  service_type: ServiceType;
  service_name: string;
  service_price: number;
  service_desc?: string;
  image_url?: string;
  is_available: boolean;
}

export type Venue ={
  venue_id: number;
  name: string;
  district_id: number;
  district_name?: string;
  seats: number;
  price: number;
  description?: string;
  address?: string;
  phone?: string;
  status: VenueStatus;
  owner_id: number;
  owner_name?: string;
  owner_email?: string;
  primary_image?: string;
  created_at?: string;
}

export type VenueDetail ={
  venue: Venue;
  images: VenueImage[];
  services: ExtraService[];
  bookedDates: string[];
}

export type Booking= {
  booking_id: number;
  user_id: number;
  venue_id: number;
  booking_date: string;
  additional_info?: string;
  guest_count?: number;
  total_price?: number;
  prepayment?: number;
  status: BookingStatus;
  created_at?: string;
  venue_name?: string;
  venue_district?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}
