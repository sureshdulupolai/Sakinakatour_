# 🪔 Shree Sakinaka Diwali & Devotional Tour Platform (2026)

A high-performance, secure, and production-grade fullstack web application designed for self-organized annual Diwali & multi-month devotional group tours. Built without commercial middlemen or agency overhead, offering direct family-first community travel.

---

## 🚀 Key Highlights & Architectural Features

### 1. 🚌 Dynamic Bus Layout Designer & Visualizer
- **Custom Seating Configurations**: Supports `2x2 Semi-Sleeper`, `3x2 Deluxe Seater`, `2x1 Luxury Sleeper`, and custom multi-deck configurations.
- **Dynamic Seating Engine**:
  - Configurable Left seats per row (1, 2, 3), Right seats per row (1, 2).
  - Configurable number of rows (e.g. 8 to 15 rows).
  - Configurable rear/back row seats (4, 5, or 6 seats spanning the rear).
  - **Upper & Lower Decks**: Interactive deck switcher for 2-tier sleeper buses.
  - Dynamically calculates total seats (e.g. 30, 45, 48, 55, 72 seats) and auto-generates exact grid positions.
- **Live Seat Availability Status**:
  - `AVAILABLE`: Crisp white with clean border & hover micro-interactions.
  - `SELECTED`: Vibrant Indigo / Amber gradient with checkmark badge.
  - `HOLD_PENDING`: Warm amber indicator with clock icon (locked during UPI verification).
  - `BOOKED_CONFIRMED`: Dark slate with lock icon.

### 2. 👨‍👩‍👧‍👦 Multi-Seat Family Booking & Smart Auto-Naming
- Book 1 to 60 seats in a single frictionless flow.
- **Primary Booker**: Full details (Name, Age, Gender, Indian Mobile).
- **Co-Passengers**: One-click **Auto-Fill Family Names** (`[Booker] (Member 2)`, `[Booker] (Member 3)`) or optional custom names/ages.
- Eliminates unnecessary paperwork while digitizing offline registers.

### 3. 📱 Secure Indian Mobile OTP System
- Strict validation for 10-digit Indian numbers (`^[6-9]\d{9}$`).
- **Rate Limiting**: 60-second cooldown timer between requests to prevent SMS spamming.
- Expiration within 5 minutes; max 5 failed attempts lockout.
- Test/Demo mode OTP displayed for seamless offline/local verification.

### 4. 💳 Static UPI QR Code & Flexible Payment Workflow
- Devotee scans the organizer's static UPI QR code via Google Pay, PhonePe, Paytm, or BHIM.
- **Advance vs Full Payment**: Devotees can pay a token advance (e.g. ₹1,000) or full payment.
- Devotee submits the 12-digit UPI UTR / Transaction Reference ID.
- Selected seats are placed on **HOLD_PENDING** immediately, preventing double-booking under high load.

### 5. 🛡️ Organizer Admin Master Portal
- **Verification & Approval**: Admin matches the devotee's UTR with bank SMS/account.
- **Devotee-Specific Custom Discount**: Admin can apply individual discounts upon approval; **visible only to that specific devotee** and the admin!
- **Strict Cancellation Policy**: Only the Tour Admin can cancel bookings and free up seats. Normal users cannot unilaterally cancel.
- **Direct Offline Booking**: Book for walk-ins or phone calls without QR codes; instantly confirmed with custom cash advance and discounts.
- **Dynamic Bus Creator**: Build and deploy new buses on the fly.
- **Multi-Month Tour Creator**: Add tours for any month (Diwali, Karthik Purnima, New Year, Holi).
- **Printable Passenger Manifest**: Export/print driver & conductor manifests with Seat Number, Name, Gender, Mobile, Paid Amount, and Balance Due.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python 3.13), Uvicorn (ASGI Async Loop), SQLite with WAL mode & high-concurrency transactions, SQLAlchemy ORM, Pydantic v2.
- **Security**: JWT Authentication (HS256), Phone Number Rate Limiting, CORS middleware, strict data sanitization.

---

## ⚡ How to Run

### Quick Start (Windows)
Double-click `start_dev.bat` or run in PowerShell:
```powershell
.\run_dev.ps1
```

### Manual Start

#### 1. Backend API (FastAPI)
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`

#### 2. Frontend (Vite + React + TS)
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🔑 Default Accounts (Seed Data)

- **Admin Account**:
  - Phone: `9999999999`
  - Demo OTP: `123456`
- **Devotee Test Account**:
  - Any valid 10-digit Indian number starting with 6, 7, 8, 9 (e.g., `9820012345`).

