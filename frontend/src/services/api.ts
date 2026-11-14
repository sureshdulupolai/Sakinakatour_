import { TourTrip, SeatItem, BookingRecord, PublicSettings, UserProfile } from '../types';

const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api';
const BASE_HOST = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = `${BASE_HOST}${API_PREFIX}`;

function getSecurityHeaders(): Record<string, string> {
  const token = localStorage.getItem('diwali_token');
  const clientKey = import.meta.env.VITE_CLIENT_ACCESS_KEY || 'yatra_prod_sec_token_99x88';
  const headers: Record<string, string> = {
    'X-App-Client-Key': clientKey,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchPublicSettings(): Promise<PublicSettings> {
  const res = await fetch(`${API_BASE}/settings/public`, {
    headers: getSecurityHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function fetchTrips(): Promise<TourTrip[]> {
  const res = await fetch(`${API_BASE}/trips`, {
    headers: getSecurityHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch tour trips');
  return res.json();
}

export async function fetchBusSeats(busId: number): Promise<{ bus: any; seats: SeatItem[] }> {
  const res = await fetch(`${API_BASE}/buses/${busId}/seats`, {
    headers: getSecurityHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch bus seating layout');
  return res.json();
}

export async function sendOtp(phone: string): Promise<{ success: boolean; message: string; demo_otp?: string }> {
  const res = await fetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getSecurityHeaders(),
    },
    body: JSON.stringify({ phone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Could not send OTP');
  return data;
}

export async function verifyOtp(params: {
  phone: string;
  otp: string;
  name?: string;
  age?: number;
  gender?: string;
}): Promise<{ token: string; user: UserProfile; message: string }> {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getSecurityHeaders(),
    },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to verify OTP');
  return data;
}

export async function getMyProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getSecurityHeaders(),
  });
  if (!res.ok) throw new Error('Not logged in');
  return res.json();
}

export async function createBooking(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getSecurityHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Booking request failed');
  return data;
}

export async function fetchMyBookings(): Promise<BookingRecord[]> {
  const res = await fetch(`${API_BASE}/bookings/my`, {
    headers: getSecurityHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch your bookings');
  return res.json();
}

// ---------------- ADMIN API ----------------
export async function adminLogin(phone: string, secretKey?: string): Promise<{ token: string; user: UserProfile }> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getSecurityHeaders(),
    },
    body: JSON.stringify({ phone, secret_key: secretKey }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Admin login failed');
  return data;
}

export async function fetchAdminBookings(statusFilter?: string): Promise<BookingRecord[]> {
  const url = statusFilter ? `${API_BASE}/admin/bookings?status_filter=${statusFilter}` : `${API_BASE}/admin/bookings`;
  const res = await fetch(url, {
    headers: getSecurityHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch all bookings');
  return res.json();
}

export async function approveBooking(bookingId: number, discountAmount: number = 0, adminNotes: string = ''): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getSecurityHeaders(),
    },
    body: JSON.stringify({ discount_amount: discountAmount, admin_notes: adminNotes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Approval failed');
  return data;
}

export async function cancelBooking(bookingId: number, reason: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getSecurityHeaders(),
    },
    body: JSON.stringify({ reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Cancellation failed');
  return data;
}

export async function createDirectBookingAdmin(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/bookings/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getSecurityHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Direct booking creation failed');
  return data;
}

export async function createBusAdmin(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/buses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getSecurityHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Bus creation failed');
  return data;
}

export async function createTripAdmin(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getSecurityHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Trip creation failed');
  return data;
}

export async function updateBusNumberAdmin(busId: number, busNumber: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/buses/${busId}/number`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getSecurityHeaders(),
    },
    body: JSON.stringify({ bus_number: busNumber }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update bus number plate');
  return data;
}

export async function fetchManifest(busId: number): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/manifest/${busId}`, {
    headers: getSecurityHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch manifest');
  return res.json();
}
