import datetime
import json
from typing import List, Optional
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(15), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)  # Male, Female, Other
    role = Column(String(20), default="user")  # "user", "admin"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    bookings = relationship("Booking", back_populates="user")


class OTPRecord(Base):
    __tablename__ = "otp_records"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(15), index=True, nullable=False)
    otp = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class TourTrip(Base):
    __tablename__ = "tour_trips"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(200), unique=True, index=True, nullable=True)
    title = Column(String(200), nullable=False)
    month_label = Column(String(50), nullable=False)  # e.g. "Diwali Special (Nov 2026)", "New Year (Jan 2027)"
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    year = Column(Integer, default=2026)
    status = Column(String(20), default="active")  # "upcoming", "active", "completed"
    description = Column(Text, nullable=True)
    itinerary_json = Column(Text, default="[]")  # List of day-by-day stops
    inclusions_json = Column(Text, default="[]")  # List of amenities provided in price
    poster_image = Column(String(500), nullable=True)
    contact_phone = Column(String(20), default="+91 9876543210")
    operator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    operator_name = Column(String(150), default="Suresh Bhai (Official Sakinaka Admin)")
    category = Column(String(100), default="Spiritual Pilgrimage")
    duration_days = Column(String(50), default="3 Days / 2 Nights")
    pickup_location = Column(String(200), default="Sakinaka Metro, Andheri East, Mumbai")
    rating = Column(Float, default=4.9)
    review_count = Column(Integer, default=128)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    buses = relationship("Bus", back_populates="trip", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="trip")
    operator = relationship("User", foreign_keys=[operator_id])


class Bus(Base):
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("tour_trips.id"), nullable=False)
    operator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(100), nullable=False)  # e.g. "Bus 1 - Luxury AC Coach"
    bus_number = Column(String(50), nullable=True, default="")  # e.g. "MH-03-BZ-2026" or empty (allotted on trip day)
    bus_type = Column(String(50), default="seater_2x2")  # "seater_2x2", "seater_3x2", "sleeper_2x1", "custom"
    
    # Seating layout parameters
    left_seats_per_row = Column(Integer, default=2)
    right_seats_per_row = Column(Integer, default=2)
    total_rows = Column(Integer, default=10)
    has_back_row = Column(Boolean, default=True)
    back_row_seats = Column(Integer, default=5)
    has_upper_deck = Column(Boolean, default=False)
    numbering_pattern = Column(String(50), default="continuous_rl")  # continuous_rl, continuous_lr, row_alpha_lr, row_alpha_rl
    
    total_seats = Column(Integer, default=45)
    base_price = Column(Float, nullable=False, default=2500.0)
    upper_deck_price = Column(Float, nullable=True, default=2800.0)
    
    amenities_json = Column(Text, default="[]")
    layout_json = Column(Text, default="{}")  # Auto-generated or custom layout grid
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    trip = relationship("TourTrip", back_populates="buses")
    bookings = relationship("Booking", back_populates="bus")
    seats = relationship("SeatAllocation", back_populates="bus", cascade="all, delete-orphan")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_code = Column(String(30), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    trip_id = Column(Integer, ForeignKey("tour_trips.id"), nullable=False)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=False)

    # Primary Contact details
    primary_name = Column(String(100), nullable=False)
    primary_phone = Column(String(15), nullable=False)
    primary_age = Column(Integer, nullable=True)
    primary_gender = Column(String(10), nullable=True)

    # Multiple Passenger breakdown
    total_passengers = Column(Integer, default=1)
    passengers_json = Column(Text, default="[]")  # list of {name, age, gender, seat_number}
    selected_seats_json = Column(Text, default="[]")  # e.g. ["1L-A", "1L-B"]

    # Financials
    total_amount = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)  # Only admin can add/update; visible to user
    final_amount = Column(Float, nullable=False)
    amount_paid = Column(Float, default=0.0)  # Token advance or full

    # Approval and Payment verification
    status = Column(String(30), default="PENDING_APPROVAL")  # "PENDING_APPROVAL", "CONFIRMED", "CANCELLED", "REJECTED"
    payment_mode = Column(String(30), default="UPI_QR")  # "UPI_QR", "CASH_OFFLINE", "BANK_TRANSFER"
    payment_reference = Column(String(100), nullable=True)  # UTR / UPI Ref ID
    payment_note = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)

    approved_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    trip = relationship("TourTrip", back_populates="bookings")
    bus = relationship("Bus", back_populates="bookings")
    allocated_seats = relationship("SeatAllocation", back_populates="booking")


class SeatAllocation(Base):
    __tablename__ = "seat_allocations"

    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    
    seat_number = Column(String(20), nullable=False)  # e.g. "R1-L1", "BACK-3", "U-R2-L1"
    deck = Column(String(10), default="lower")  # "lower", "upper"
    row = Column(Integer, default=1)
    col = Column(Integer, default=1)
    side = Column(String(10), default="left")  # "left", "right", "back"
    status = Column(String(20), default="AVAILABLE")  # "AVAILABLE", "HOLD_PENDING", "BOOKED_CONFIRMED", "BLOCKED"
    
    passenger_name = Column(String(100), nullable=True)
    passenger_gender = Column(String(10), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    bus = relationship("Bus", back_populates="seats")
    booking = relationship("Booking", back_populates="allocated_seats")


class Setting(Base):
    __tablename__ = "settings"

    key = Column(String(50), primary_key=True)
    value = Column(Text, nullable=False)
    description = Column(String(200), nullable=True)


class PartnerInquiry(Base):
    __tablename__ = "partner_inquiries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(15), index=True, nullable=False)
    city = Column(String(100), nullable=False)
    location_address = Column(Text, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    fleet_size = Column(String(50), default="1-2 Buses")  # "1-2 Buses", "3-5 Buses", "5+ Buses", "Tour Guide/Organizer"
    status = Column(String(30), default="PENDING")  # "PENDING", "APPROVED", "REJECTED"
    notes = Column(Text, nullable=True)
    client_ip = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


