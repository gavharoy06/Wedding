export type Booking = {
  booking_id: number;
  venue_id: number; 
  booking_date: string;
  additional_info: string | null;
  guest_count: number;
  total_price: number;
  prepayment: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  created_at: string;
  venue_name: string;
  venue_district?: string;
  venue_price?: number;
}

export type BookingServicePayload ={
  extra_service_id: number;
  quantity: number;
}

export type CreateBookingPayload = {
  venue_id: number;
  booking_date: string;
  guest_count: number;
  additional_info?: string;
  services?: BookingServicePayload[];
  prepayment?: number;
}