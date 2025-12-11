export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export type AppRole = 'admin' | 'user';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export type ApartmentStatus = 'active' | 'inactive';

export type ApartmentRegion = 'kenya' | 'usa';

export interface Apartment {
  id: string;
  name: string;
  description: string | null;
  location_text: string | null;
  latitude: number | null;
  longitude: number | null;
  price_per_day: number;
  bedrooms: number;
  bathrooms: number;
  image_main_url: string | null;
  status: ApartmentStatus;
  amenities: string[] | null;
  region: ApartmentRegion;
  created_at: string;
}

export interface ApartmentImage {
  id: string;
  apartment_id: string;
  image_url: string;
  created_at: string;
}

export type BookingStatus = 'pending' | 'approved' | 'declined';

export interface Booking {
  id: string;
  user_id: string;
  apartment_id: string;
  date_start: string;
  date_end: string;
  total_price: number | null;
  status: BookingStatus;
  admin_message: string | null;
  created_at: string;
  apartment?: Apartment;
  profile?: Profile;
}
