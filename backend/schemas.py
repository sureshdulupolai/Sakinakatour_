import re
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, field_validator

class SendOTPRequest(BaseModel):
    phone: str = Field(..., description="10-digit Indian mobile number")

    @field_validator("phone")
    @classmethod
    def validate_indian_phone(cls, v: str) -> str:
        clean_num = re.sub(r"[^\d]", "", v)
        if len(clean_num) == 12 and clean_num.startswith("91"):
            clean_num = clean_num[2:]
        if len(clean_num) != 10 or clean_num[0] not in "6789":
            raise ValueError("Please provide a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).")
        return clean_num

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None  # Male, Female, Other

class AdminLoginRequest(BaseModel):
    phone: str
    secret_key: Optional[str] = None

class UserProfile(BaseModel):
    id: int
    phone: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    role: str

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    token: str
    user: UserProfile
    message: str

class PassengerDetail(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    seat_number: str
    is_primary: bool = False

class CreateBookingRequest(BaseModel):
    trip_id: int
    bus_id: int
    primary_name: str
    primary_phone: str
    primary_age: Optional[int] = None
    primary_gender: Optional[str] = None
    selected_seats: List[str]
    passengers: List[PassengerDetail]
    amount_paid: float = Field(0.0, description="Advance or full amount paid via UPI")
    payment_mode: str = "UPI_QR"
    payment_reference: Optional[str] = Field(None, description="UPI Ref No / UTR / Transaction ID")
    payment_note: Optional[str] = None

class AdminDirectBookingRequest(BaseModel):
    trip_id: int
    bus_id: int
    primary_name: str
    primary_phone: str
    primary_age: Optional[int] = None
    primary_gender: Optional[str] = None
    selected_seats: List[str]
    passengers: List[PassengerDetail]
    amount_paid: float = 0.0
    discount_amount: float = 0.0
    payment_mode: str = "CASH_OFFLINE"
    payment_reference: Optional[str] = None
    admin_notes: Optional[str] = None

class BookingApprovalRequest(BaseModel):
    discount_amount: Optional[float] = 0.0
    admin_notes: Optional[str] = None

class BookingCancelRequest(BaseModel):
    reason: str = "Cancelled by Tour Organizer"

class SeatPublicInfo(BaseModel):
    id: int
    seat_number: str
    deck: str
    row: int
    col: int
    side: str
    status: str
    price: float

class BusCreateRequest(BaseModel):
    trip_id: int
    name: str
    bus_number: Optional[str] = ""
    bus_type: str = "seater_2x2"
    left_seats_per_row: int = 2
    right_seats_per_row: int = 2
    total_rows: int = 10
    has_back_row: bool = True
    back_row_seats: int = 5
    has_upper_deck: bool = False
    numbering_pattern: str = "continuous_rl"  # continuous_rl, continuous_lr, row_alpha_lr, row_alpha_rl
    base_price: float = 2500.0
    upper_deck_price: Optional[float] = 2800.0
    amenities: List[str] = []

class BusUpdateNumberRequest(BaseModel):
    bus_number: str

class BusResponse(BaseModel):
    id: int
    trip_id: int
    name: str
    bus_number: Optional[str] = ""
    bus_type: str
    left_seats_per_row: int
    right_seats_per_row: int
    total_rows: int
    has_back_row: Optional[bool] = True
    back_row_seats: int
    has_upper_deck: bool
    numbering_pattern: Optional[str] = "continuous_rl"
    total_seats: int
    base_price: float
    upper_deck_price: Optional[float] = None
    amenities: List[str]
    available_seats_count: int
    booked_seats_count: int
    pending_seats_count: int

    class Config:
        from_attributes = True

class TripCreateRequest(BaseModel):
    title: str
    month_label: str
    start_date: str
    end_date: str
    year: int = 2026
    description: Optional[str] = None
    itinerary: List[str] = []
    inclusions: List[str] = []
    poster_image: Optional[str] = None
    contact_phone: Optional[str] = None
    operator_name: Optional[str] = "Suresh Bhai (Official Sakinaka Admin)"
    category: Optional[str] = "Spiritual Pilgrimage"
    duration_days: Optional[str] = "3 Days / 2 Nights"
    pickup_location: Optional[str] = "Sakinaka Metro, Andheri East, Mumbai"

class PartnerTourCreateRequest(BaseModel):
    title: str
    category: str = "Spiritual Pilgrimage"
    month_label: str
    start_date: str
    end_date: str
    duration_days: str = "3 Days / 2 Nights"
    pickup_location: str = "Sakinaka Metro, Andheri East, Mumbai"
    operator_name: str
    contact_phone: str
    description: Optional[str] = None
    itinerary: List[str] = []
    inclusions: List[str] = []
    poster_image: Optional[str] = None
    bus_name: str = "Coach 1 - AC Deluxe Pushback"
    bus_type: str = "seater_2x2"
    total_rows: int = 10
    base_price: float = 2500.0

class TripResponse(BaseModel):
    id: int
    slug: Optional[str] = None
    title: str
    month_label: str
    start_date: str
    end_date: str
    year: int
    status: str
    description: Optional[str]
    itinerary: List[str]
    inclusions: List[str]
    poster_image: Optional[str]
    contact_phone: Optional[str]
    operator_name: Optional[str] = "Suresh Bhai (Official Sakinaka Admin)"
    category: Optional[str] = "Spiritual Pilgrimage"
    duration_days: Optional[str] = "3 Days / 2 Nights"
    pickup_location: Optional[str] = "Sakinaka Metro, Andheri East, Mumbai"
    rating: Optional[float] = 4.9
    review_count: Optional[int] = 128
    buses: List[BusResponse] = []

    class Config:
        from_attributes = True

class PartnerInquiryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., description="10-digit Indian mobile number")
    city: str = Field(..., min_length=2, max_length=100)
    location_address: str = Field(..., min_length=3)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    fleet_size: Optional[str] = "1-2 Buses"
    notes: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean_num = re.sub(r"[^\d]", "", v)
        if len(clean_num) == 12 and clean_num.startswith("91"):
            clean_num = clean_num[2:]
        if len(clean_num) != 10 or clean_num[0] not in "6789":
            raise ValueError("Please provide a valid 10-digit Indian mobile number.")
        return clean_num

class PartnerInquiryResponse(BaseModel):
    id: int
    name: str
    phone: str
    city: str
    location_address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    fleet_size: Optional[str] = "1-2 Buses"
    status: str
    notes: Optional[str] = None
    created_at: Any

    class Config:
        from_attributes = True

class PartnerInquiryStatusUpdate(BaseModel):
    status: str = Field(..., description="APPROVED or REJECTED")
    notes: Optional[str] = None

