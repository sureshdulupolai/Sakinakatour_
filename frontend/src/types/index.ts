export interface UserProfile {
  id: number;
  phone: string;
  name: string;
  age?: number;
  gender?: string;
  role: 'user' | 'admin';
}

export interface BusSummary {
  id: number;
  trip_id: number;
  name: string;
  bus_number: string;
  bus_type: string;
  left_seats_per_row: number;
  right_seats_per_row: number;
  total_rows: number;
  has_back_row?: boolean;
  back_row_seats: number;
  has_upper_deck: boolean;
  numbering_pattern?: string;
  total_seats: number;
  base_price: number;
  upper_deck_price?: number;
  amenities: string[];
  available_seats_count: number;
  booked_seats_count: number;
  pending_seats_count: number;
}

export interface TourTrip {
  id: number;
  title: string;
  month_label: string;
  start_date: string;
  end_date: string;
  year: number;
  status: string;
  description?: string;
  itinerary: string[];
  inclusions: string[];
  poster_image?: string;
  contact_phone: string;
  buses: BusSummary[];
}

export interface SeatItem {
  id: number;
  seat_number: string;
  deck: 'lower' | 'upper';
  row: number;
  col: number;
  side: 'left' | 'right' | 'back';
  status: 'AVAILABLE' | 'HOLD_PENDING' | 'BOOKED_CONFIRMED' | 'BLOCKED';
  price: number;
  passenger_gender?: string;
}

export interface PassengerDetail {
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  seat_number: string;
  is_primary?: boolean;
}

export interface BookingRecord {
  id: number;
  booking_code: string;
  trip_id: number;
  trip_title: string;
  trip_dates?: string;
  bus_id: number;
  bus_name: string;
  primary_name: string;
  primary_phone: string;
  primary_age?: number;
  primary_gender?: string;
  total_passengers: number;
  selected_seats: string[];
  passengers: PassengerDetail[];
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  amount_paid: number;
  balance_due: number;
  status: 'PENDING_APPROVAL' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED';
  payment_mode: string;
  payment_reference?: string;
  payment_note?: string;
  admin_notes?: string;
  created_at: string;
  approved_at?: string;
}

export interface PublicSettings {
  upi_vpa?: string;
  upi_name?: string;
  contact_phone?: string;
  contact_alt_phone?: string;
  contact_email?: string;
  whatsapp_group_link?: string;
  instagram_profile_url?: string;
  about_heading?: string;
  about_description?: string;
  emergency_helpline?: string;
}

