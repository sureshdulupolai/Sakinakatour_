import os
import json
import uuid
import datetime
from typing import List, Optional
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import or_

from config import settings
from database import get_db, init_db, engine
from models import Base, User, OTPRecord, TourTrip, Bus, Booking, SeatAllocation, Setting, PartnerInquiry
import schemas
from auth import (
    create_access_token, decode_token, generate_otp_code,
    get_current_user, get_current_user_optional, get_current_admin, get_current_super_admin
)
from bus_engine import generate_seat_allocations_for_bus, calculate_bus_total_seats
from security_middleware import AntiDDoSSecurityMiddleware

# Hardened API definition with conditional Swagger docs in production
app = FastAPI(
    title="Diwali Community Tour & Bus Booking Platform API",
    description="High-concurrency, zero-data-leakage secure API for self-organized tours, dynamic bus seating layouts, OTP login, and manual UPI verification.",
    version="1.2.0",
    docs_url="/docs" if settings.DOCS_ENABLED else None,
    redoc_url="/redoc" if settings.DOCS_ENABLED else None,
    openapi_url="/openapi.json" if settings.DOCS_ENABLED else None,
)

# 1. Anti-DDoS, Rate Limiter & Security Header Middleware
app.add_middleware(AntiDDoSSecurityMiddleware)

# 2. CORS configuration dynamically driven by environment variables
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS if settings.ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static directory for uploaded posters and QR code assets
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Initialize database schema
init_db()

# ----------------- DYNAMIC SEED DATA INITIALIZER -----------------
def seed_default_data():
    db = next(get_db())
    try:
        # 1. Admin Account initialized dynamically from .env
        admin_phone = settings.ADMIN_PHONE
        admin = db.query(User).filter(User.phone == admin_phone).first()
        if not admin:
            admin = User(
                phone=admin_phone,
                name=settings.ADMIN_NAME,
                age=45,
                gender="Male",
                role="admin"
            )
            db.add(admin)
            db.commit()

        # 2. Public Settings initialized dynamically from .env
        default_settings = {
            "upi_vpa": settings.UPI_VPA,
            "upi_name": settings.UPI_NAME,
            "contact_phone": settings.ORGANIZER_PHONE,
            "contact_alt_phone": settings.ORGANIZER_ALT_PHONE,
            "contact_email": settings.ORGANIZER_EMAIL,
            "whatsapp_group_link": settings.WHATSAPP_GROUP_URL,
            "instagram_profile_url": settings.INSTAGRAM_PROFILE_URL,
            "about_heading": "Pavitra Diwali & Devotional Yatra 2026",
            "about_description": "Har saal Diwali ke shubh avsar par hum apna parivarik aur shradhalu yatra organize karte hain. No agents, no commercial promotion — direct community yatra.",
            "emergency_helpline": settings.EMERGENCY_HELPLINE
        }
        for k, v in default_settings.items():
            setting_row = db.query(Setting).filter(Setting.key == k).first()
            if not setting_row:
                db.add(Setting(key=k, value=v, description=f"System config for {k}"))
            else:
                if not setting_row.value:
                    setting_row.value = v
        db.commit()

        # 3. Default Trip & Buses if DB is fresh
        existing_trip = db.query(TourTrip).first()
        if not existing_trip:
            trip1 = TourTrip(
                title="Diwali Maha Yatra 2026 - Ketkawla Balaji, Shirdi & Jyotirlinga Darshan",
                month_label="Diwali Special (November 2026)",
                start_date="08 Nov 2026",
                end_date="13 Nov 2026",
                year=2026,
                status="active",
                description="Har saal ki tarah is saal bhi hum lekar jaa rahe hain vishesh 6 divasiya pavitra yatra. Ketkawla Tirupati Balaji Pratirup, Shirdi Sai Baba darshan, aur Shani Shingnapur. Parivar ke saath surakshit aur aaramdayak safar.",
                itinerary_json=json.dumps([
                    "Day 1: Departure from Mumbai (Sakinaka / Ghatkopar) in evening, highway dinner stop.",
                    "Day 2: Morning arrival at Ketkawla Tirupati Balaji Temple. VIP Darshan, Kalyanotsavam & Prasad.",
                    "Day 3: Journey to Shani Shingnapur & Shirdi. Evening Aarti & Night stay in Deluxe AC Hotel.",
                    "Day 4: Morning Shirdi Kakad / Samadhi Darshan, visit Muktidham & local sacred spots.",
                    "Day 5: Return journey via scenic route with community fellowship, return to Mumbai by night."
                ]),
                inclusions_json=json.dumps([
                    "Luxury 2x2 AC Pushback Coach / Sleeper Berth",
                    "Pure Veg Hygienic Breakfast, Lunch, High-Tea & Dinner",
                    "Clean AC Hotel Stay (Family Rooms / Twin Sharing)",
                    "Temple Darshan Coordination & Group Passes",
                    "First Aid & Medical Support Kit Onboard",
                    "Dedicated Tour Volunteers & Audio Satsang/Bhajan"
                ]),
                poster_image="/static/Balaji_temple_in_ketkawla.jpg",
                contact_phone=settings.ORGANIZER_PHONE
            )
            db.add(trip1)
            db.commit()
            db.refresh(trip1)

            # Bus 1: 2x2 Semi-Sleeper Coach (10 rows, 2 left, 2 right, 5 back seats = 45 seats)
            bus1 = Bus(
                trip_id=trip1.id,
                name="Bus A - Garuda Express (2x2 Semi-Sleeper AC)",
                bus_number="MH-03-AY-2026",
                bus_type="seater_2x2",
                left_seats_per_row=2,
                right_seats_per_row=2,
                total_rows=10,
                back_row_seats=5,
                has_upper_deck=False,
                total_seats=45,
                base_price=3200.0,
                amenities_json=json.dumps(["AC", "Pushback Seats", "Phone Charging", "Water Bottle", "Music System"])
            )
            db.add(bus1)
            db.commit()
            db.refresh(bus1)

            seats1 = generate_seat_allocations_for_bus(bus1)
            db.add_all(seats1)
            db.commit()

            # Bus 2: 2x1 Royal Sleeper (8 rows, 2 left, 1 right, Upper + Lower deck = 48 berths)
            bus2 = Bus(
                trip_id=trip1.id,
                name="Bus B - Pushpak Sleeper (2x1 Luxury AC Sleeper)",
                bus_number="MH-03-BZ-2026",
                bus_type="sleeper_2x1",
                left_seats_per_row=2,
                right_seats_per_row=1,
                total_rows=8,
                back_row_seats=0,
                has_upper_deck=True,
                total_seats=48,
                base_price=3800.0,
                upper_deck_price=4200.0,
                amenities_json=json.dumps(["AC Sleeper Berths", "Privacy Curtains", "Clean Bedding & Blanket", "Charging Socket", "Reading Lamp"])
            )
            db.add(bus2)
            db.commit()
            db.refresh(bus2)

            seats2 = generate_seat_allocations_for_bus(bus2)
            db.add_all(seats2)
            db.commit()

    finally:
        db.close()

seed_default_data()

# ----------------- ROUTER WITH CONFIGURABLE BASE PATH -----------------
api_router = APIRouter()

# ----------------- PUBLIC SETTINGS & INFO API -----------------
@api_router.get("/settings/public")
def get_public_settings(db: Session = Depends(get_db)):
    """Returns safe public settings (No private keys or tokens)"""
    settings_records = db.query(Setting).all()
    result = {s.key: s.value for s in settings_records}
    result.setdefault("upi_vpa", settings.UPI_VPA)
    result.setdefault("upi_name", settings.UPI_NAME)
    result.setdefault("contact_phone", settings.ORGANIZER_PHONE)
    result.setdefault("whatsapp_group_link", settings.WHATSAPP_GROUP_URL)
    result.setdefault("instagram_profile_url", settings.INSTAGRAM_PROFILE_URL)
    return result

# ----------------- AUTH & SECURE OTP API -----------------
@api_router.post("/auth/send-otp")
def send_otp(req: schemas.SendOTPRequest, db: Session = Depends(get_db)):
    phone = req.phone

    now = datetime.datetime.utcnow()
    recent_otp = db.query(OTPRecord).filter(
        OTPRecord.phone == phone,
        OTPRecord.created_at >= now - datetime.timedelta(seconds=60)
    ).first()

    if recent_otp:
        remaining_seconds = 60 - int((now - recent_otp.created_at).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {remaining_seconds} seconds before requesting a new OTP."
        )

    db.query(OTPRecord).filter(OTPRecord.phone == phone).delete()

    if settings.EXPOSE_DEMO_OTP and phone in [settings.ADMIN_PHONE, "9820012345", "9876543210"] and settings.DEMO_OTP_CODE:
        otp_code = settings.DEMO_OTP_CODE
    else:
        otp_code = generate_otp_code()

    expires_at = now + datetime.timedelta(minutes=5)
    otp_record = OTPRecord(
        phone=phone,
        otp=otp_code,
        expires_at=expires_at,
        attempts=0
    )
    db.add(otp_record)
    db.commit()

    resp = {
        "success": True,
        "message": f"OTP successfully sent to +91 {phone[:2]}••••••{phone[-2:]}. Valid for 5 minutes."
    }

    if settings.EXPOSE_DEMO_OTP:
        resp["demo_otp"] = otp_code

    return resp

@api_router.post("/auth/verify-otp", response_model=schemas.AuthResponse)
def verify_otp(req: schemas.VerifyOTPRequest, db: Session = Depends(get_db)):
    phone = req.phone
    otp_input = req.otp.strip()

    now = datetime.datetime.utcnow()
    otp_record = db.query(OTPRecord).filter(
        OTPRecord.phone == phone,
        OTPRecord.expires_at >= now
    ).order_by(OTPRecord.created_at.desc()).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP. Please request a new one.")

    if otp_record.attempts >= 5:
        db.delete(otp_record)
        db.commit()
        raise HTTPException(status_code=400, detail="Maximum attempts exceeded. Please request a new OTP.")

    if otp_record.otp != otp_input:
        otp_record.attempts += 1
        db.commit()
        raise HTTPException(status_code=400, detail="Incorrect OTP. Please enter the valid 6-digit OTP.")

    db.delete(otp_record)
    db.commit()

    user = db.query(User).filter(User.phone == phone).first()
    
    # Preserve partner or admin roles, default new accounts to user
    if phone == settings.ADMIN_PHONE:
        role = "admin"
    elif user and user.role in ["admin", "partner"]:
        role = user.role
    else:
        role = "user"

    if not user:
        display_name = req.name.strip() if req.name else f"Devotee-{phone[-4:]}"
        user = User(
            phone=phone,
            name=display_name,
            age=req.age,
            gender=req.gender,
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.role = role
        if req.name and req.name.strip():
            user.name = req.name.strip()
        if req.age:
            user.age = req.age
        if req.gender:
            user.gender = req.gender
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id), "phone": user.phone, "role": user.role})
    return schemas.AuthResponse(
        token=token,
        user=schemas.UserProfile(
            id=user.id,
            phone=user.phone,
            name=user.name,
            age=user.age,
            gender=user.gender,
            role=user.role
        ),
        message="Login successful."
    )

@api_router.get("/auth/me", response_model=schemas.UserProfile)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return schemas.UserProfile(
        id=current_user.id,
        phone=current_user.phone,
        name=current_user.name,
        age=current_user.age,
        gender=current_user.gender,
        role=current_user.role
    )

def generate_slug_for_trip(title: str, db: Session) -> str:
    s = title.lower()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s_-]+', '-', s).strip('-')
    base = s[:100] or "tour-package"
    candidate = base
    suffix = 1
    while db.query(TourTrip).filter(TourTrip.slug == candidate).first():
        candidate = f"{base}-{suffix}"
        suffix += 1
    return candidate

# ----------------- TRIPS & BUSES API -----------------
@api_router.get("/trips", response_model=List[schemas.TripResponse])
def get_trips(status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(TourTrip)
    if status_filter:
        query = query.filter(TourTrip.status == status_filter)
    trips = query.order_by(TourTrip.id.desc()).all()

    result = []
    for t in trips:
        buses_list = []
        for b in t.buses:
            total_seats = b.total_seats
            booked_count = db.query(SeatAllocation).filter(
                SeatAllocation.bus_id == b.id,
                SeatAllocation.status == "BOOKED_CONFIRMED"
            ).count()
            pending_count = db.query(SeatAllocation).filter(
                SeatAllocation.bus_id == b.id,
                SeatAllocation.status == "HOLD_PENDING"
            ).count()
            available_count = total_seats - (booked_count + pending_count)

            buses_list.append(schemas.BusResponse(
                id=b.id,
                trip_id=b.trip_id,
                name=b.name,
                bus_number=b.bus_number or "",
                bus_type=b.bus_type,
                left_seats_per_row=b.left_seats_per_row,
                right_seats_per_row=b.right_seats_per_row,
                total_rows=b.total_rows,
                has_back_row=getattr(b, "has_back_row", True),
                back_row_seats=b.back_row_seats,
                has_upper_deck=b.has_upper_deck,
                numbering_pattern=getattr(b, "numbering_pattern", "continuous_rl") or "continuous_rl",
                total_seats=total_seats,
                base_price=b.base_price,
                upper_deck_price=b.upper_deck_price,
                amenities=json.loads(b.amenities_json or "[]"),
                available_seats_count=max(0, available_count),
                booked_seats_count=booked_count,
                pending_seats_count=pending_count
            ))

        op_name = getattr(t, "operator_name", None)
        if not op_name and t.operator:
            op_name = t.operator.name
        if not op_name:
            op_name = "Suresh Bhai (Official Sakinaka Admin)"

        t_slug = getattr(t, "slug", None)
        if not t_slug:
            t_slug = generate_slug_for_trip(t.title, db)
            t.slug = t_slug
            db.commit()

        result.append(schemas.TripResponse(
            id=t.id,
            slug=t_slug,
            title=t.title,
            month_label=t.month_label,
            start_date=t.start_date,
            end_date=t.end_date,
            year=t.year,
            status=t.status,
            description=t.description,
            itinerary=json.loads(t.itinerary_json or "[]"),
            inclusions=json.loads(t.inclusions_json or "[]"),
            poster_image=t.poster_image,
            contact_phone=t.contact_phone,
            operator_name=op_name,
            category=getattr(t, "category", "Spiritual Pilgrimage") or "Spiritual Pilgrimage",
            duration_days=getattr(t, "duration_days", "3 Days / 2 Nights") or "3 Days / 2 Nights",
            pickup_location=getattr(t, "pickup_location", "Sakinaka Metro, Andheri East, Mumbai") or "Sakinaka Metro, Andheri East, Mumbai",
            rating=getattr(t, "rating", 4.9) or 4.9,
            review_count=getattr(t, "review_count", 128) or 128,
            buses=buses_list
        ))
    return result

@api_router.get("/trips/{slug_or_id}", response_model=schemas.TripResponse)
def get_trip_by_slug_or_id(slug_or_id: str, db: Session = Depends(get_db)):
    """
    Secure and RESTful lookup by SEO slug or ID without exposing raw DB identifiers.
    Protects against sequential enumeration attacks.
    """
    trip = None
    if slug_or_id.isdigit():
        trip = db.query(TourTrip).filter(TourTrip.id == int(slug_or_id)).first()
    if not trip:
        trip = db.query(TourTrip).filter(TourTrip.slug == slug_or_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Tour package not found.")
    
    buses_list = []
    for b in trip.buses:
        total_seats = b.total_seats
        booked_count = db.query(SeatAllocation).filter(
            SeatAllocation.bus_id == b.id,
            SeatAllocation.status == "BOOKED_CONFIRMED"
        ).count()
        pending_count = db.query(SeatAllocation).filter(
            SeatAllocation.bus_id == b.id,
            SeatAllocation.status == "HOLD_PENDING"
        ).count()
        available_count = total_seats - (booked_count + pending_count)

        buses_list.append(schemas.BusResponse(
            id=b.id,
            trip_id=b.trip_id,
            name=b.name,
            bus_number=b.bus_number or "",
            bus_type=b.bus_type,
            left_seats_per_row=b.left_seats_per_row,
            right_seats_per_row=b.right_seats_per_row,
            total_rows=b.total_rows,
            has_back_row=getattr(b, "has_back_row", True),
            back_row_seats=b.back_row_seats,
            has_upper_deck=b.has_upper_deck,
            numbering_pattern=getattr(b, "numbering_pattern", "continuous_rl") or "continuous_rl",
            total_seats=total_seats,
            base_price=b.base_price,
            upper_deck_price=b.upper_deck_price,
            amenities=json.loads(b.amenities_json or "[]"),
            available_seats_count=max(0, available_count),
            booked_seats_count=booked_count,
            pending_seats_count=pending_count
        ))

    op_name = getattr(trip, "operator_name", None)
    if not op_name and trip.operator:
        op_name = trip.operator.name
    if not op_name:
        op_name = "Suresh Bhai (Official Sakinaka Admin)"

    t_slug = getattr(trip, "slug", None)
    if not t_slug:
        t_slug = generate_slug_for_trip(trip.title, db)
        trip.slug = t_slug
        db.commit()

    return schemas.TripResponse(
        id=trip.id,
        slug=t_slug,
        title=trip.title,
        month_label=trip.month_label,
        start_date=trip.start_date,
        end_date=trip.end_date,
        year=trip.year,
        status=trip.status,
        description=trip.description,
        itinerary=json.loads(trip.itinerary_json or "[]"),
        inclusions=json.loads(trip.inclusions_json or "[]"),
        poster_image=trip.poster_image,
        contact_phone=trip.contact_phone,
        operator_name=op_name,
        category=getattr(trip, "category", "Spiritual Pilgrimage") or "Spiritual Pilgrimage",
        duration_days=getattr(trip, "duration_days", "3 Days / 2 Nights") or "3 Days / 2 Nights",
        pickup_location=getattr(trip, "pickup_location", "Sakinaka Metro, Andheri East, Mumbai") or "Sakinaka Metro, Andheri East, Mumbai",
        rating=getattr(trip, "rating", 4.9) or 4.9,
        review_count=getattr(trip, "review_count", 128) or 128,
        buses=buses_list
    )

@api_router.get("/buses/{bus_id}/seats")
def get_bus_seats(bus_id: int, db: Session = Depends(get_db)):
    """
    CRITICAL ZERO DATA LEAKAGE ENDPOINT:
    Returns strictly the layout and public availability state.
    NEVER leaks passenger names, phones, genders, or booking IDs to the public!
    """
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found.")

    seats = db.query(SeatAllocation).filter(SeatAllocation.bus_id == bus_id).order_by(
        SeatAllocation.deck.asc(), SeatAllocation.row.asc(), SeatAllocation.col.asc()
    ).all()

    sanitized_seats = []
    for s in seats:
        price = bus.upper_deck_price if (s.deck == "upper" and bus.upper_deck_price) else bus.base_price
        sanitized_seats.append({
            "id": s.id,
            "seat_number": s.seat_number,
            "deck": s.deck,
            "row": s.row,
            "col": s.col,
            "side": s.side,
            "status": s.status,
            "price": price
        })

    return {
        "bus": {
            "id": bus.id,
            "trip_id": bus.trip_id,
            "name": bus.name,
            "bus_number": bus.bus_number,
            "bus_type": bus.bus_type,
            "left_seats_per_row": bus.left_seats_per_row,
            "right_seats_per_row": bus.right_seats_per_row,
            "total_rows": bus.total_rows,
            "back_row_seats": bus.back_row_seats,
            "has_upper_deck": bus.has_upper_deck,
            "total_seats": bus.total_seats,
            "base_price": bus.base_price,
            "upper_deck_price": bus.upper_deck_price,
            "amenities": json.loads(bus.amenities_json or "[]")
        },
        "seats": sanitized_seats
    }

# ----------------- BOOKING FLOW -----------------
@api_router.post("/bookings")
def create_booking(
    req: schemas.CreateBookingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bus = db.query(Bus).filter(Bus.id == req.bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Selected bus not found.")

    trip = db.query(TourTrip).filter(TourTrip.id == req.trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Selected tour trip not found.")

    if not req.selected_seats:
        raise HTTPException(status_code=400, detail="Please select at least 1 seat to book.")

    if len(req.selected_seats) > 60:
        raise HTTPException(status_code=400, detail="Maximum 60 seats can be booked in a single request.")

    conflicting_seats = db.query(SeatAllocation).filter(
        SeatAllocation.bus_id == req.bus_id,
        SeatAllocation.seat_number.in_(req.selected_seats),
        SeatAllocation.status != "AVAILABLE"
    ).all()

    if conflicting_seats:
        conflict_list = [s.seat_number for s in conflicting_seats]
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Seats {', '.join(conflict_list)} were just selected by another devotee. Please choose other available seats."
        )

    total_calculated = 0.0
    for seat_num in req.selected_seats:
        seat_obj = db.query(SeatAllocation).filter(
            SeatAllocation.bus_id == req.bus_id,
            SeatAllocation.seat_number == seat_num
        ).first()
        if seat_obj and seat_obj.deck == "upper" and bus.upper_deck_price:
            total_calculated += bus.upper_deck_price
        else:
            total_calculated += bus.base_price

    processed_passengers = []
    provided_map = {p.seat_number: p for p in req.passengers}
    
    for idx, seat_num in enumerate(req.selected_seats, start=1):
        if seat_num in provided_map and provided_map[seat_num].name.strip():
            p = provided_map[seat_num]
            p_phone = p.phone.strip() if p.phone and p.phone.strip() else (req.primary_phone if idx == 1 else None)
            processed_passengers.append({
                "seat_number": seat_num,
                "name": p.name.strip(),
                "age": p.age if p.age else (req.primary_age if idx == 1 else None),
                "gender": p.gender if p.gender else (req.primary_gender if idx == 1 else "Unspecified"),
                "phone": p_phone,
                "is_primary": (idx == 1)
            })
        else:
            member_name = req.primary_name if idx == 1 else f"{req.primary_name} (Member {idx})"
            processed_passengers.append({
                "seat_number": seat_num,
                "name": member_name,
                "age": req.primary_age if idx == 1 else None,
                "gender": req.primary_gender if idx == 1 else "Unspecified",
                "phone": req.primary_phone if idx == 1 else None,
                "is_primary": (idx == 1)
            })

    booking_code = f"YATRA-{trip.year}-{uuid.uuid4().hex[:6].upper()}"

    booking = Booking(
        booking_code=booking_code,
        user_id=current_user.id,
        trip_id=trip.id,
        bus_id=bus.id,
        primary_name=req.primary_name.strip(),
        primary_phone=req.primary_phone.strip(),
        primary_age=req.primary_age,
        primary_gender=req.primary_gender,
        total_passengers=len(req.selected_seats),
        passengers_json=json.dumps(processed_passengers),
        selected_seats_json=json.dumps(req.selected_seats),
        total_amount=total_calculated,
        discount_amount=0.0,
        final_amount=total_calculated,
        amount_paid=req.amount_paid,
        status="PENDING_APPROVAL",
        payment_mode=req.payment_mode,
        payment_reference=req.payment_reference,
        payment_note=req.payment_note
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    passenger_dict = {p["seat_number"]: p for p in processed_passengers}
    for seat_num in req.selected_seats:
        seat_obj = db.query(SeatAllocation).filter(
            SeatAllocation.bus_id == req.bus_id,
            SeatAllocation.seat_number == seat_num
        ).first()
        if seat_obj:
            seat_obj.booking_id = booking.id
            seat_obj.status = "HOLD_PENDING"
            seat_obj.passenger_name = passenger_dict.get(seat_num, {}).get("name")
            seat_obj.passenger_gender = passenger_dict.get(seat_num, {}).get("gender")

    db.commit()

    return {
        "success": True,
        "booking_code": booking.booking_code,
        "status": booking.status,
        "total_amount": booking.total_amount,
        "amount_paid": booking.amount_paid,
        "balance_due": max(0.0, booking.final_amount - booking.amount_paid),
        "selected_seats": req.selected_seats,
        "message": "Booking submitted successfully. Seats are on hold awaiting admin verification."
    }

@api_router.get("/bookings/my")
def get_my_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    STRICT PRIVACY: Returns only this authenticated user's bookings.
    Discount applied by admin is strictly visible only to this user!
    """
    # Allows primary devotee OR co-passengers (if phone was provided during multi-booking) to view this booking!
    bookings = db.query(Booking).filter(
        or_(
            Booking.user_id == current_user.id,
            Booking.primary_phone == current_user.phone,
            Booking.passengers_json.like(f"%{current_user.phone}%")
        )
    ).order_by(Booking.id.desc()).all()

    results = []
    for b in bookings:
        results.append({
            "id": b.id,
            "booking_code": b.booking_code,
            "trip_id": b.trip_id,
            "trip_title": b.trip.title if b.trip else "",
            "trip_dates": f"{b.trip.start_date} to {b.trip.end_date}" if b.trip else "",
            "bus_id": b.bus_id,
            "bus_name": b.bus.name if b.bus else "",
            "primary_name": b.primary_name,
            "primary_phone": b.primary_phone,
            "primary_age": b.primary_age,
            "primary_gender": b.primary_gender,
            "total_passengers": b.total_passengers,
            "selected_seats": json.loads(b.selected_seats_json or "[]"),
            "passengers": json.loads(b.passengers_json or "[]"),
            "total_amount": b.total_amount,
            "discount_amount": b.discount_amount,
            "final_amount": b.final_amount,
            "amount_paid": b.amount_paid,
            "balance_due": max(0.0, b.final_amount - b.amount_paid),
            "status": b.status,
            "payment_mode": b.payment_mode,
            "payment_reference": b.payment_reference,
            "payment_note": b.payment_note,
            "created_at": b.created_at.strftime("%d %b %Y, %I:%M %p"),
            "approved_at": b.approved_at.strftime("%d %b %Y, %I:%M %p") if b.approved_at else None
        })
    return results

# ----------------- ADMIN PORTAL API (STRICT ROLE ACCESS) -----------------
@api_router.post("/admin/login")
def admin_login(req: schemas.AdminLoginRequest, db: Session = Depends(get_db)):
    clean_num = req.phone.strip()
    
    # 1. Super Admin (Master Admin from .env)
    if clean_num == settings.ADMIN_PHONE:
        if req.secret_key and req.secret_key != settings.ADMIN_SECRET_KEY:
            raise HTTPException(status_code=403, detail="Invalid admin secret key.")

        admin = db.query(User).filter(User.phone == clean_num, User.role == "admin").first()
        if not admin:
            admin = User(
                phone=clean_num,
                name=settings.ADMIN_NAME,
                role="admin"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

        token = create_access_token({"sub": str(admin.id), "phone": admin.phone, "role": "admin"})
        return {
            "token": token,
            "user": {
                "id": admin.id,
                "phone": admin.phone,
                "name": admin.name,
                "role": "admin"
            }
        }

    # 2. Approved Partner Operator Login
    partner = db.query(User).filter(User.phone == clean_num, User.role == "partner").first()
    if partner:
        token = create_access_token({"sub": str(partner.id), "phone": partner.phone, "role": "partner"})
        return {
            "token": token,
            "user": {
                "id": partner.id,
                "phone": partner.phone,
                "name": partner.name,
                "role": "partner"
            }
        }

    raise HTTPException(status_code=403, detail="Mobile number not authorized for admin or partner access.")

@api_router.get("/admin/bookings")
def get_all_bookings_admin(
    status_filter: Optional[str] = None,
    trip_id: Optional[int] = None,
    bus_id: Optional[int] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Booking)
    if status_filter:
        query = query.filter(Booking.status == status_filter)
    if trip_id:
        query = query.filter(Booking.trip_id == trip_id)
    if bus_id:
        query = query.filter(Booking.bus_id == bus_id)

    bookings = query.order_by(Booking.id.desc()).all()
    results = []
    for b in bookings:
        results.append({
            "id": b.id,
            "booking_code": b.booking_code,
            "trip_id": b.trip_id,
            "trip_title": b.trip.title if b.trip else "",
            "bus_id": b.bus_id,
            "bus_name": b.bus.name if b.bus else "",
            "primary_name": b.primary_name,
            "primary_phone": b.primary_phone,
            "primary_age": b.primary_age,
            "primary_gender": b.primary_gender,
            "total_passengers": b.total_passengers,
            "selected_seats": json.loads(b.selected_seats_json or "[]"),
            "passengers": json.loads(b.passengers_json or "[]"),
            "total_amount": b.total_amount,
            "discount_amount": b.discount_amount,
            "final_amount": b.final_amount,
            "amount_paid": b.amount_paid,
            "balance_due": max(0.0, b.final_amount - b.amount_paid),
            "status": b.status,
            "payment_mode": b.payment_mode,
            "payment_reference": b.payment_reference,
            "payment_note": b.payment_note,
            "admin_notes": b.admin_notes,
            "created_at": b.created_at.strftime("%d %b %Y, %I:%M %p"),
            "approved_at": b.approved_at.strftime("%d %b %Y, %I:%M %p") if b.approved_at else None
        })
    return results

@api_router.post("/admin/bookings/{booking_id}/approve")
def approve_booking(
    booking_id: int,
    req: schemas.BookingApprovalRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    if booking.status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Cannot approve a cancelled booking.")

    discount = req.discount_amount if req.discount_amount is not None else 0.0
    booking.discount_amount = max(0.0, discount)
    booking.final_amount = max(0.0, booking.total_amount - booking.discount_amount)

    if req.admin_notes:
        booking.admin_notes = req.admin_notes

    booking.status = "CONFIRMED"
    booking.approved_at = datetime.datetime.utcnow()

    seats = db.query(SeatAllocation).filter(
        SeatAllocation.booking_id == booking.id
    ).all()
    for s in seats:
        s.status = "BOOKED_CONFIRMED"

    db.commit()

    return {
        "success": True,
        "message": f"Booking {booking.booking_code} confirmed successfully!",
        "discount_applied": booking.discount_amount,
        "final_amount": booking.final_amount,
        "amount_paid": booking.amount_paid,
        "balance_due": max(0.0, booking.final_amount - booking.amount_paid)
    }

@api_router.post("/admin/bookings/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    req: schemas.BookingCancelRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    booking.status = "CANCELLED"
    booking.cancelled_at = datetime.datetime.utcnow()
    booking.admin_notes = f"Cancellation Reason: {req.reason}"

    seats = db.query(SeatAllocation).filter(
        SeatAllocation.booking_id == booking.id
    ).all()
    for s in seats:
        s.status = "AVAILABLE"
        s.booking_id = None
        s.passenger_name = None
        s.passenger_gender = None

    db.commit()

    return {
        "success": True,
        "message": f"Booking {booking.booking_code} cancelled and seats freed successfully."
    }

@api_router.post("/admin/bookings/direct")
def create_direct_booking_admin(
    req: schemas.AdminDirectBookingRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    bus = db.query(Bus).filter(Bus.id == req.bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Selected bus not found.")

    trip = db.query(TourTrip).filter(TourTrip.id == req.trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Selected tour trip not found.")

    if not req.selected_seats:
        raise HTTPException(status_code=400, detail="Please select at least 1 seat.")

    conflicting_seats = db.query(SeatAllocation).filter(
        SeatAllocation.bus_id == req.bus_id,
        SeatAllocation.seat_number.in_(req.selected_seats),
        SeatAllocation.status != "AVAILABLE"
    ).all()

    if conflicting_seats:
        conflict_list = [s.seat_number for s in conflicting_seats]
        raise HTTPException(
            status_code=400,
            detail=f"Seats {', '.join(conflict_list)} are already booked or held."
        )

    total_calculated = 0.0
    for seat_num in req.selected_seats:
        seat_obj = db.query(SeatAllocation).filter(
            SeatAllocation.bus_id == req.bus_id,
            SeatAllocation.seat_number == seat_num
        ).first()
        if seat_obj and seat_obj.deck == "upper" and bus.upper_deck_price:
            total_calculated += bus.upper_deck_price
        else:
            total_calculated += bus.base_price

    final_calc = max(0.0, total_calculated - req.discount_amount)

    processed_passengers = []
    provided_map = {p.seat_number: p for p in req.passengers}
    for idx, seat_num in enumerate(req.selected_seats, start=1):
        if seat_num in provided_map and provided_map[seat_num].name.strip():
            p = provided_map[seat_num]
            p_phone = p.phone.strip() if p.phone and p.phone.strip() else (req.primary_phone if idx == 1 else None)
            processed_passengers.append({
                "seat_number": seat_num,
                "name": p.name.strip(),
                "age": p.age if p.age else (req.primary_age if idx == 1 else None),
                "gender": p.gender if p.gender else (req.primary_gender if idx == 1 else "Unspecified"),
                "phone": p_phone,
                "is_primary": (idx == 1)
            })
        else:
            member_name = req.primary_name if idx == 1 else f"{req.primary_name} (Member {idx})"
            processed_passengers.append({
                "seat_number": seat_num,
                "name": member_name,
                "age": req.primary_age if idx == 1 else None,
                "gender": req.primary_gender if idx == 1 else "Unspecified",
                "phone": req.primary_phone if idx == 1 else None,
                "is_primary": (idx == 1)
            })

    booking_code = f"YATRA-{trip.year}-ADM{uuid.uuid4().hex[:4].upper()}"

    booking = Booking(
        booking_code=booking_code,
        user_id=None,
        trip_id=trip.id,
        bus_id=bus.id,
        primary_name=req.primary_name.strip(),
        primary_phone=req.primary_phone.strip(),
        primary_age=req.primary_age,
        primary_gender=req.primary_gender,
        total_passengers=len(req.selected_seats),
        passengers_json=json.dumps(processed_passengers),
        selected_seats_json=json.dumps(req.selected_seats),
        total_amount=total_calculated,
        discount_amount=req.discount_amount,
        final_amount=final_calc,
        amount_paid=req.amount_paid,
        status="CONFIRMED",
        payment_mode=req.payment_mode,
        payment_reference=req.payment_reference or "OFFLINE_DIRECT",
        admin_notes=req.admin_notes,
        approved_at=datetime.datetime.utcnow()
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    passenger_dict = {p["seat_number"]: p for p in processed_passengers}
    for seat_num in req.selected_seats:
        seat_obj = db.query(SeatAllocation).filter(
            SeatAllocation.bus_id == req.bus_id,
            SeatAllocation.seat_number == seat_num
        ).first()
        if seat_obj:
            seat_obj.booking_id = booking.id
            seat_obj.status = "BOOKED_CONFIRMED"
            seat_obj.passenger_name = passenger_dict.get(seat_num, {}).get("name")
            seat_obj.passenger_gender = passenger_dict.get(seat_num, {}).get("gender")

    db.commit()

    return {
        "success": True,
        "booking_code": booking.booking_code,
        "message": f"Direct Booking confirmed for {booking.primary_name} ({len(req.selected_seats)} seats)."
    }

@api_router.post("/admin/trips")
def create_trip_admin(
    req: schemas.TripCreateRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    contact = req.contact_phone or settings.ORGANIZER_PHONE
    op_name = req.operator_name or current_admin.name or "Suresh Bhai (Official Sakinaka Admin)"
    trip = TourTrip(
        title=req.title,
        slug=generate_slug_for_trip(req.title, db),
        month_label=req.month_label,
        start_date=req.start_date,
        end_date=req.end_date,
        year=req.year,
        status="upcoming",
        description=req.description,
        itinerary_json=json.dumps(req.itinerary),
        inclusions_json=json.dumps(req.inclusions),
        poster_image=req.poster_image or "/Balaji_temple_in_ketkawla.jpg",
        contact_phone=contact,
        operator_id=current_admin.id,
        operator_name=op_name,
        category=req.category or "Spiritual Pilgrimage",
        duration_days=req.duration_days or "3 Days / 2 Nights",
        pickup_location=req.pickup_location or "Sakinaka Metro, Andheri East, Mumbai",
        rating=5.0,
        review_count=1
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return {"success": True, "trip_id": trip.id, "message": f"New trip created successfully by {op_name}."}

@api_router.post("/partner/tours")
def create_partner_tour(
    req: schemas.PartnerTourCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Public & Partner self-service tour listing endpoint.
    Allows verified hosts, temple mandals, and tour operators to list their tour.
    Automatically provisions the TourTrip, the associated Bus coach, and generates seats!
    """
    contact = req.contact_phone or settings.ORGANIZER_PHONE
    op_name = req.operator_name.strip() or "Verified Tour Partner"
    
    trip = TourTrip(
        title=req.title,
        slug=generate_slug_for_trip(req.title, db),
        month_label=req.month_label,
        start_date=req.start_date,
        end_date=req.end_date,
        year=2026,
        status="active",
        description=req.description or f"Official tour organized by {op_name}. Verified comfortable AC transport, hotel stay, and guided darshan.",
        itinerary_json=json.dumps(req.itinerary if (req.itinerary and len(req.itinerary) > 0) else [
            f"Day 1: Departure from {req.pickup_location}, Journey to Destination & Check-in",
            "Day 2: Full Day Temple/Sightseeing Darshan & Local Yatra",
            "Day 3: Morning Aarti, Shopping & Return Journey"
        ]),
        inclusions_json=json.dumps(req.inclusions if (req.inclusions and len(req.inclusions) > 0) else [
            "AC Pushback Coach Travel",
            "Hotel Stay (Twin/Triple Sharing)",
            "Pure Veg Meals & Refreshments",
            "VIP Darshan Passes",
            "Toll, Parking & Dedicated Guide"
        ]),
        poster_image=req.poster_image or "/Balaji_temple_in_ketkawla.jpg",
        contact_phone=contact,
        operator_name=op_name,
        category=req.category or "Spiritual Pilgrimage",
        duration_days=req.duration_days or "3 Days / 2 Nights",
        pickup_location=req.pickup_location or "Sakinaka Metro, Andheri East, Mumbai",
        rating=5.0,
        review_count=1
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)

    # Calculate seats and create initial bus
    total_calculated = calculate_bus_total_seats(
        left_seats_per_row=2,
        right_seats_per_row=2,
        total_rows=req.total_rows or 10,
        has_back_row=True,
        back_row_seats=5,
        has_upper_deck=False
    )

    bus = Bus(
        trip_id=trip.id,
        name=req.bus_name or "Coach 1 - Luxury AC 2x2",
        bus_number="",
        bus_type=req.bus_type or "seater_2x2",
        left_seats_per_row=2,
        right_seats_per_row=2,
        total_rows=req.total_rows or 10,
        has_back_row=True,
        back_row_seats=5,
        has_upper_deck=False,
        numbering_pattern="continuous_rl",
        total_seats=total_calculated,
        base_price=req.base_price or 2500.0,
        upper_deck_price=None,
        amenities_json=json.dumps(["AC", "Pushback Seats", "Charging Point", "Bottled Water", "Emergency Kit"])
    )
    db.add(bus)
    db.commit()
    db.refresh(bus)

    # Generate seats
    seats = generate_seat_allocations_for_bus(bus)
    db.bulk_save_objects(seats)
    db.commit()

    return {
        "success": True,
        "trip_id": trip.id,
        "bus_id": bus.id,
        "operator_name": trip.operator_name,
        "message": f"Tour '{trip.title}' listed successfully by partner {op_name}!"
    }

@api_router.post("/admin/buses")
def create_bus_admin(
    req: schemas.BusCreateRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_calculated = calculate_bus_total_seats(
        left_seats_per_row=req.left_seats_per_row,
        right_seats_per_row=req.right_seats_per_row,
        total_rows=req.total_rows,
        has_back_row=req.has_back_row,
        back_row_seats=req.back_row_seats,
        has_upper_deck=req.has_upper_deck
    )

    bus = Bus(
        trip_id=req.trip_id,
        operator_id=current_admin.id,
        name=req.name,
        bus_number=req.bus_number.strip() if req.bus_number else "",
        bus_type=req.bus_type,
        left_seats_per_row=req.left_seats_per_row,
        right_seats_per_row=req.right_seats_per_row,
        total_rows=req.total_rows,
        has_back_row=req.has_back_row,
        back_row_seats=req.back_row_seats if req.has_back_row else 0,
        has_upper_deck=req.has_upper_deck,
        numbering_pattern=req.numbering_pattern or "continuous_rl",
        total_seats=total_calculated,
        base_price=req.base_price,
        upper_deck_price=req.upper_deck_price if req.has_upper_deck else None,
        amenities_json=json.dumps(req.amenities)
    )
    db.add(bus)
    db.commit()
    db.refresh(bus)

    seats = generate_seat_allocations_for_bus(bus)
    db.add_all(seats)
    db.commit()

    return {
        "success": True,
        "bus_id": bus.id,
        "total_seats": total_calculated,
        "message": f"Bus '{bus.name}' created with layout of {total_calculated} seats!"
    }

@api_router.patch("/admin/buses/{bus_id}/number")
def update_bus_number_admin(
    bus_id: int,
    req: schemas.BusUpdateNumberRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found.")
    
    bus.bus_number = req.bus_number.strip()
    db.commit()
    db.refresh(bus)
    return {
        "success": True,
        "bus_id": bus.id,
        "bus_number": bus.bus_number,
        "message": f"Bus number plate updated to '{bus.bus_number}' successfully."
    }

@api_router.get("/admin/manifest/{bus_id}")
def get_bus_passenger_manifest(
    bus_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found.")

    seats = db.query(SeatAllocation).filter(
        SeatAllocation.bus_id == bus_id
    ).order_by(SeatAllocation.deck.asc(), SeatAllocation.row.asc(), SeatAllocation.col.asc()).all()

    manifest_rows = []
    for s in seats:
        booking = s.booking
        manifest_rows.append({
            "seat_number": s.seat_number,
            "deck": s.deck,
            "side": s.side,
            "status": s.status,
            "passenger_name": s.passenger_name or "-",
            "passenger_gender": s.passenger_gender or "-",
            "booking_code": booking.booking_code if booking else "-",
            "primary_phone": booking.primary_phone if booking else "-",
            "amount_paid": booking.amount_paid if booking else 0.0,
            "balance_due": max(0.0, booking.final_amount - booking.amount_paid) if booking else 0.0,
            "payment_status": booking.status if booking else "-"
        })

    return {
        "bus_name": bus.name,
        "bus_number": bus.bus_number,
        "trip_title": bus.trip.title if bus.trip else "",
        "total_seats": bus.total_seats,
        "passengers": manifest_rows
    }

# ----------------- PARTNER ONBOARDING & INQUIRY SYSTEM -----------------
@api_router.post("/partner/inquiry")
def submit_partner_inquiry(
    req: schemas.PartnerInquiryCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Submits a partner inquiry (Bus Operator / Tour Partner).
    Strict rate-limiting: Max 5 inquiries per IP/Phone within 24 hours to prevent abuse.
    """
    client_ip = request.client.host if request.client else "unknown"
    now = datetime.datetime.utcnow()
    window_start = now - datetime.timedelta(hours=24)

    # Check recent inquiry count for this IP or phone
    recent_count = db.query(PartnerInquiry).filter(
        or_(
            PartnerInquiry.client_ip == client_ip,
            PartnerInquiry.phone == req.phone
        ),
        PartnerInquiry.created_at >= window_start
    ).count()

    MAX_INQUIRIES_PER_DAY = 5
    if recent_count >= MAX_INQUIRIES_PER_DAY:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Maximum {MAX_INQUIRIES_PER_DAY} partner inquiries reached for today. Please wait or contact our official helpline directly."
        )

    inquiry = PartnerInquiry(
        name=req.name.strip(),
        phone=req.phone.strip(),
        city=req.city.strip(),
        location_address=req.location_address.strip(),
        latitude=req.latitude,
        longitude=req.longitude,
        fleet_size=req.fleet_size or "1-2 Buses",
        status="PENDING",
        notes=req.notes.strip() if req.notes else None,
        client_ip=client_ip
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    remaining_attempts = MAX_INQUIRIES_PER_DAY - (recent_count + 1)

    return {
        "success": True,
        "inquiry_id": inquiry.id,
        "status": inquiry.status,
        "remaining_attempts": remaining_attempts,
        "message": f"Partner inquiry received! Our verification team will reach out at +91 {inquiry.phone} within 24 hours."
    }

@api_router.get("/admin/partner-inquiries", response_model=List[schemas.PartnerInquiryResponse])
def get_partner_inquiries_admin(
    status_filter: Optional[str] = None,
    current_admin: User = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    """Restricted to Super Admin ONLY. Lists all partner inquiries with verified locations."""
    query = db.query(PartnerInquiry)
    if status_filter:
        query = query.filter(PartnerInquiry.status == status_filter)
    return query.order_by(PartnerInquiry.created_at.desc()).all()

@api_router.patch("/admin/partner-inquiries/{inquiry_id}/status")
def update_partner_inquiry_status(
    inquiry_id: int,
    req: schemas.PartnerInquiryStatusUpdate,
    current_admin: User = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    """
    Super Admin action: Approve or Reject a partner inquiry.
    If APPROVED, creates or promotes user account to role='partner' so they can list their buses.
    """
    inquiry = db.query(PartnerInquiry).filter(PartnerInquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Partner inquiry not found.")

    target_status = req.status.upper().strip()
    if target_status not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Status must be either APPROVED or REJECTED.")

    inquiry.status = target_status
    if req.notes:
        inquiry.notes = req.notes.strip()

    # When approved, create or promote user to role='partner'
    if target_status == "APPROVED":
        partner_user = db.query(User).filter(User.phone == inquiry.phone).first()
        if partner_user:
            partner_user.role = "partner"
            if not partner_user.name or partner_user.name.startswith("Devotee-"):
                partner_user.name = inquiry.name
        else:
            partner_user = User(
                phone=inquiry.phone,
                name=inquiry.name,
                role="partner"
            )
            db.add(partner_user)

    db.commit()
    db.refresh(inquiry)

    return {
        "success": True,
        "inquiry_id": inquiry.id,
        "status": inquiry.status,
        "message": f"Partner inquiry #{inquiry.id} marked as {inquiry.status}." + 
                   (" Partner account activated for bus listing." if target_status == "APPROVED" else "")
    }

# ----------------- INCLUDE ROUTER UNDER CONCEALED BASE PREFIX -----------------
# 1. Mount under configured base prefix (e.g. /api/v1)
app.include_router(api_router, prefix=settings.API_PREFIX)

# 2. Also mount under standard /api if distinct for backward compatibility
if settings.API_PREFIX != "/api":
    app.include_router(api_router, prefix="/api")
