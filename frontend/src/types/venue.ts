// Bitta to'yxona (ro'yxatda ham, detail sahifada ham asosiy maydonlar)
export type Venue = {
  venue_id: number;
  name: string;
  district_id: number;
  district_name: string;
  price: number;
  seats: number;
  address?: string;
  description?: string;
  phone?: string;           
  status: string;
  primary_image: string | null;
  created_at: string;
};

// Venue rasmi
export type VenueImage = {
  image_id: number;
  image_url: string;
  is_primary: boolean;
}

// Qo'shimcha xizmat (catering, dekoratsiya va h.k.)
export type ExtraService = {
  extra_service_id: number;
  service_type: string;
  service_name: string;
  service_price: number;
  service_desc: string;
  image_url: string | null;
  is_available: boolean;
}

// GET /venues/:id javobi to'liq shakli
export type VenueDetail = {
  venue: Venue;
  images: VenueImage[];
  services: ExtraService[];
  bookedDates: string[];
}
