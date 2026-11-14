import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, CheckCircle2, Clock, AlertTriangle, Users, 
  Bus, PlusCircle, Printer, Sparkles, Filter, ChevronRight, DollarSign, Calendar
} from 'lucide-react';
import { BookingRecord, TourTrip, BusSummary } from '../types';
import { 
  fetchAdminBookings, approveBooking, cancelBooking, 
  createDirectBookingAdmin, createBusAdmin, createTripAdmin, fetchManifest, adminLogin,
  updateBusNumberAdmin
} from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: TourTrip[];
  onDataChanged: () => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  trips,
  onDataChanged,
  showToast,
}) => {
  const { user, loginWithToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'direct' | 'addBus' | 'addTrip' | 'manifest'>('bookings');

  // Admin Auth Login Gate
  const [adminPhoneInput, setAdminPhoneInput] = useState('');
  const [adminSecretInput, setAdminSecretInput] = useState('');
  const [adminLoggingIn, setAdminLoggingIn] = useState(false);

  // Bookings list state
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_APPROVAL');
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Approval modal state
  const [selectedBookingForApproval, setSelectedBookingForApproval] = useState<BookingRecord | null>(null);
  const [approvalDiscount, setApprovalDiscount] = useState<string>('0');
  const [adminApprovalNotes, setAdminApprovalNotes] = useState<string>('');
  const [approving, setApproving] = useState(false);

  // Cancel modal state
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<BookingRecord | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Cancelled by Tour Organizer');
  const [cancelling, setCancelling] = useState(false);

  // Dynamic Bus Creator state
  const [busTripId, setBusTripId] = useState<number>(trips[0]?.id || 1);
  const [busName, setBusName] = useState<string>('Bus C - Sai Krupa Luxury');
  const [busNumber, setBusNumber] = useState<string>('');
  const [busType, setBusType] = useState<string>('seater_2x2');
  const [leftSeats, setLeftSeats] = useState<number>(2);
  const [rightSeats, setRightSeats] = useState<number>(2);
  const [totalRows, setTotalRows] = useState<number>(11);
  const [hasBackRow, setHasBackRow] = useState<boolean>(true);
  const [backRowSeats, setBackRowSeats] = useState<number>(5);
  const [numberingPattern, setNumberingPattern] = useState<string>('continuous_rl');
  const [hasUpperDeck, setHasUpperDeck] = useState<boolean>(false);
  const [targetSeatsInput, setTargetSeatsInput] = useState<string>('49');
  const [basePrice, setBasePrice] = useState<number>(3000);
  const [upperDeckPrice, setUpperDeckPrice] = useState<number>(3500);
  const [amenitiesInput, setAmenitiesInput] = useState<string>('AC, Pushback Seats, Water Bottle, Blanket');
  const [creatingBus, setCreatingBus] = useState(false);

  // Bus Plate Quick Edit state
  const [editingBusId, setEditingBusId] = useState<number | null>(null);
  const [newPlateInput, setNewPlateInput] = useState<string>('');
  const [updatingPlate, setUpdatingPlate] = useState(false);

  // Direct Booking state
  const [directTripId, setDirectTripId] = useState<number>(trips[0]?.id || 1);
  const [directBusId, setDirectBusId] = useState<number>(trips[0]?.buses[0]?.id || 1);
  const [directName, setDirectName] = useState('');
  const [directPhone, setDirectPhone] = useState('');
  const [directAge, setDirectAge] = useState('');
  const [directGender, setDirectGender] = useState('Male');
  const [directSeatsInput, setDirectSeatsInput] = useState('');
  const [directAmountPaid, setDirectAmountPaid] = useState<string>('1000');
  const [directDiscount, setDirectDiscount] = useState<string>('0');
  const [directNotes, setDirectNotes] = useState('Direct Walk-in / Phone booking');
  const [creatingDirect, setCreatingDirect] = useState(false);

  // Add Trip state
  const [tripTitle, setTripTitle] = useState('');
  const [tripMonthLabel, setTripMonthLabel] = useState('January 2027 Special');
  const [tripStartDate, setTripStartDate] = useState('15 Jan 2027');
  const [tripEndDate, setTripEndDate] = useState('18 Jan 2027');
  const [tripDesc, setTripDesc] = useState('');
  const [tripItinerary, setTripItinerary] = useState('Day 1: Departure\nDay 2: Temple Darshan\nDay 3: Return journey');
  const [tripInclusions, setTripInclusions] = useState('AC Bus, Pure Veg Meals, Hotel Stay');
  const [creatingTrip, setCreatingTrip] = useState(false);

  // Manifest state
  const [manifestBusId, setManifestBusId] = useState<number>(trips[0]?.buses[0]?.id || 1);
  const [manifestData, setManifestData] = useState<any>(null);
  const [loadingManifest, setLoadingManifest] = useState(false);

  // Calculate live preview of total seats for dynamic bus creator
  const effectiveBackSeats = hasBackRow ? backRowSeats : 0;
  const seatsPerRow = leftSeats + rightSeats;
  const calculatedLowerSeats = (seatsPerRow * totalRows) + effectiveBackSeats;
  const calculatedUpperSeats = hasUpperDeck ? ((seatsPerRow * totalRows) + effectiveBackSeats) : 0;
  const calculatedTotalSeats = calculatedLowerSeats + calculatedUpperSeats;

  // Real-time helper: when target seats is entered, calculate rows
  const handleTargetSeatsCalculate = (targetVal: number) => {
    if (!targetVal || targetVal <= 0) return;
    const perDeckBack = hasBackRow ? backRowSeats : 0;
    const totalBack = hasUpperDeck ? perDeckBack * 2 : perDeckBack;
    const remainingForRows = targetVal - totalBack;
    const rowCapacity = hasUpperDeck ? seatsPerRow * 2 : seatsPerRow;
    if (remainingForRows > 0 && rowCapacity > 0) {
      const computedRows = Math.max(1, Math.round(remainingForRows / rowCapacity));
      setTotalRows(computedRows);
    }
  };

  // Load Bookings
  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await fetchAdminBookings(statusFilter || undefined);
      setBookings(data);
    } catch (err: any) {
      showToast('error', 'Failed to load bookings', err.message);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadBookings();
    }
  }, [isOpen, statusFilter]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPhoneInput.trim()) {
      showToast('error', 'Phone Required', 'Please enter registered admin mobile number.');
      return;
    }
    setAdminLoggingIn(true);
    try {
      const res = await adminLogin(adminPhoneInput.trim(), adminSecretInput.trim() || undefined);
      loginWithToken(res.token, res.user);
      showToast('success', 'Admin Authenticated', `Welcome, ${res.user.name}`);
      loadBookings();
    } catch (err: any) {
      showToast('error', 'Admin Access Denied', err.message);
    } finally {
      setAdminLoggingIn(false);
    }
  };

  if (!isOpen) return null;

  // STRICT ACCESS CONTROL: If not authenticated as admin, show secure Admin Login Gate
  if (!user || user.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Organizer Master Access</h3>
                <p className="text-xs text-slate-500">Restricted to Tour Administrators only</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Registered Mobile *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={adminPhoneInput}
                onChange={(e) => setAdminPhoneInput(e.target.value)}
                placeholder="9999999999"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Security Passphrase / Secret Key
              </label>
              <input
                type="password"
                value={adminSecretInput}
                onChange={(e) => setAdminSecretInput(e.target.value)}
                placeholder="Configured in .env"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Security key is configured in backend environment variables.
              </p>
            </div>

            <button
              type="submit"
              disabled={adminLoggingIn}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              {adminLoggingIn ? <span>Authenticating...</span> : <span>Unlock Admin Portal</span>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Handler for Approve
  const handleApprove = async () => {
    if (!selectedBookingForApproval) return;
    setApproving(true);
    try {
      const discount = parseFloat(approvalDiscount) || 0;
      await approveBooking(selectedBookingForApproval.id, discount, adminApprovalNotes);
      showToast('success', 'Booking Confirmed!', `Booking ${selectedBookingForApproval.booking_code} approved with discount ₹${discount}`);
      setSelectedBookingForApproval(null);
      loadBookings();
      onDataChanged();
    } catch (err: any) {
      showToast('error', 'Approval failed', err.message);
    } finally {
      setApproving(false);
    }
  };

  // Handler for Cancel
  const handleCancel = async () => {
    if (!selectedBookingForCancel) return;
    setCancelling(true);
    try {
      await cancelBooking(selectedBookingForCancel.id, cancelReason);
      showToast('info', 'Booking Cancelled', `Seats freed and booking marked cancelled.`);
      setSelectedBookingForCancel(null);
      loadBookings();
      onDataChanged();
    } catch (err: any) {
      showToast('error', 'Cancellation failed', err.message);
    } finally {
      setCancelling(false);
    }
  };

  // Handler for Dynamic Bus Creator
  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingBus(true);
    try {
      const amenities = amenitiesInput.split(',').map((s) => s.trim()).filter(Boolean);
      await createBusAdmin({
        trip_id: busTripId,
        name: busName,
        bus_number: busNumber.trim() || undefined,
        bus_type: busType,
        left_seats_per_row: leftSeats,
        right_seats_per_row: rightSeats,
        total_rows: totalRows,
        has_back_row: hasBackRow,
        back_row_seats: hasBackRow ? backRowSeats : 0,
        has_upper_deck: hasUpperDeck,
        numbering_pattern: numberingPattern,
        base_price: basePrice,
        upper_deck_price: hasUpperDeck ? upperDeckPrice : null,
        amenities: amenities,
      });
      showToast('success', 'Bus Added!', `Bus created with ${calculatedTotalSeats} seats using ${numberingPattern} numbering.`);
      onDataChanged();
      setActiveTab('bookings');
    } catch (err: any) {
      showToast('error', 'Bus Creation Error', err.message);
    } finally {
      setCreatingBus(false);
    }
  };

  // Handler for Quick Number Plate Update
  const handleUpdateBusPlate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusId) return;
    setUpdatingPlate(true);
    try {
      await updateBusNumberAdmin(editingBusId, newPlateInput.trim());
      showToast('success', 'Plate Updated', `Bus number plate set to '${newPlateInput.trim() || 'Allotted on Trip Day'}'`);
      setEditingBusId(null);
      onDataChanged();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    } finally {
      setUpdatingPlate(false);
    }
  };

  // Handler for Direct Offline Booking
  const handleCreateDirectBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directName.trim() || !directPhone.trim() || !directSeatsInput.trim()) {
      showToast('error', 'Missing Fields', 'Name, Mobile and Seat numbers are required.');
      return;
    }

    const seatsList = directSeatsInput.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    if (seatsList.length === 0) {
      showToast('error', 'No Seats', 'Please enter at least one seat number (e.g. 1A, 1B).');
      return;
    }

    setCreatingDirect(true);
    try {
      const passengers = seatsList.map((st, idx) => ({
        seat_number: st,
        name: idx === 0 ? directName.trim() : `${directName.trim()} (Guest ${idx + 1})`,
        age: idx === 0 && directAge ? parseInt(directAge) : undefined,
        gender: directGender,
        is_primary: idx === 0,
      }));

      await createDirectBookingAdmin({
        trip_id: directTripId,
        bus_id: directBusId,
        primary_name: directName.trim(),
        primary_phone: directPhone.trim(),
        primary_age: directAge ? parseInt(directAge) : undefined,
        primary_gender: directGender,
        selected_seats: seatsList,
        passengers: passengers,
        amount_paid: parseFloat(directAmountPaid) || 0,
        discount_amount: parseFloat(directDiscount) || 0,
        payment_mode: 'CASH_OFFLINE',
        payment_reference: 'CASH_DIRECT_RECEIPT',
        admin_notes: directNotes,
      });

      showToast('success', 'Direct Booking Confirmed!', `Booked ${seatsList.length} seats for ${directName}.`);
      setDirectName('');
      setDirectPhone('');
      setDirectSeatsInput('');
      onDataChanged();
      setActiveTab('bookings');
    } catch (err: any) {
      showToast('error', 'Direct Booking Error', err.message);
    } finally {
      setCreatingDirect(false);
    }
  };

  // Handler for New Trip
  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripTitle.trim()) {
      showToast('error', 'Title Required', 'Please enter Tour Trip Title.');
      return;
    }

    setCreatingTrip(true);
    try {
      await createTripAdmin({
        title: tripTitle.trim(),
        month_label: tripMonthLabel.trim(),
        start_date: tripStartDate.trim(),
        end_date: tripEndDate.trim(),
        year: 2026,
        description: tripDesc.trim(),
        itinerary: tripItinerary.split('\n').filter(Boolean),
        inclusions: tripInclusions.split(',').map((s) => s.trim()).filter(Boolean),
        poster_image: '/Balaji_temple_in_ketkawla.jpg',
        contact_phone: '+91 98200 45678',
      });
      showToast('success', 'Tour Trip Created!', 'New multi-month trip added.');
      setTripTitle('');
      onDataChanged();
      setActiveTab('bookings');
    } catch (err: any) {
      showToast('error', 'Trip Error', err.message);
    } finally {
      setCreatingTrip(false);
    }
  };

  // Handler for Manifest
  const handleLoadManifest = async (bId: number) => {
    setManifestBusId(bId);
    setLoadingManifest(true);
    try {
      const data = await fetchManifest(bId);
      setManifestData(data);
    } catch (err: any) {
      showToast('error', 'Manifest Error', err.message);
    } finally {
      setLoadingManifest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Top Organizer Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                  Tour Organizer Master Portal
                </span>
                <span className="text-xs text-emerald-400 font-semibold">• Live Admin</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-serif-heading">
                Suresh Bhai - Sakinaka Yatra Control Center
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'bookings' ? 'bg-white text-slate-900 border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Booking Approvals & UTR</span>
          </button>

          <button
            onClick={() => setActiveTab('direct')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'direct' ? 'bg-white text-slate-900 border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Direct Offline Booking</span>
          </button>

          <button
            onClick={() => setActiveTab('addBus')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'addBus' ? 'bg-white text-slate-900 border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bus className="w-4 h-4 text-blue-600" />
            <span>Dynamic Bus Layout Designer</span>
          </button>

          <button
            onClick={() => setActiveTab('addTrip')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'addTrip' ? 'bg-white text-slate-900 border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Add New Month Tour</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('manifest');
              if (trips[0]?.buses[0]) {
                handleLoadManifest(trips[0].buses[0].id);
              }
            }}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'manifest' ? 'bg-white text-slate-900 border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Passenger Manifest Chart</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: BOOKING APPROVALS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              
              {/* Filter bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 uppercase">Status:</span>
                  <div className="flex items-center gap-1.5">
                    {['PENDING_APPROVAL', 'CONFIRMED', 'CANCELLED', ''].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          statusFilter === st
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st === '' ? 'All Bookings' : st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={loadBookings}
                  className="text-xs font-semibold text-amber-700 hover:underline"
                >
                  Refresh List
                </button>
              </div>

              {/* Bookings Table / Cards */}
              {loadingBookings ? (
                <div className="p-12 text-center text-xs text-slate-400">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
                  Is status mein koi booking nahi hai.
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              {b.booking_code}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {b.primary_name} ({b.primary_phone})
                            </span>
                            <span className="text-[11px] text-slate-400">{b.created_at}</span>
                          </div>
                          <div className="text-xs text-amber-800 font-medium mt-0.5">
                            {b.trip_title} • {b.bus_name}
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              b.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.status === 'PENDING_APPROVAL'
                                ? 'bg-amber-100 text-amber-900 animate-pulse'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                      </div>

                      {/* Detail row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400">Seats:</span>
                          <div className="font-bold text-slate-900">{b.selected_seats.join(', ')} ({b.total_passengers} Yatri)</div>
                        </div>

                        <div>
                          <span className="text-slate-400">Total / Paid:</span>
                          <div className="font-semibold text-slate-800">
                            ₹{b.total_amount} / <strong className="text-emerald-700">₹{b.amount_paid}</strong>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400">UPI Ref / UTR:</span>
                          <div className="font-mono font-bold text-amber-900 select-all">{b.payment_reference || 'N/A'}</div>
                        </div>

                        <div>
                          <span className="text-slate-400">Special Discount:</span>
                          <div className="font-bold text-emerald-700">
                            {b.discount_amount > 0 ? `₹${b.discount_amount} (Applied)` : 'None'}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons (Approve / Cancel) */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        {b.status === 'PENDING_APPROVAL' && (
                          <button
                            onClick={() => {
                              setSelectedBookingForApproval(b);
                              setApprovalDiscount('0');
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verify UPI & Approve Booking</span>
                          </button>
                        )}

                        {b.status !== 'CANCELLED' && (
                          <button
                            onClick={() => setSelectedBookingForCancel(b)}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Cancel Booking</span>
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: DIRECT OFFLINE BOOKING */}
          {activeTab === 'direct' && (
            <form onSubmit={handleCreateDirectBooking} className="space-y-5 max-w-2xl">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Paper to Digital Direct Booking</span>
                </div>
                <p>
                  Jo log phone par ya aamne-saamne book karne aate hain unke liye direct book karein. 
                  Isme QR code nahi dikhega, booking seedhe <strong>CONFIRMED</strong> ho jayegi aur custom discount lagaya ja sakta hai.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Tour Trip *
                  </label>
                  <select
                    value={directTripId}
                    onChange={(e) => {
                      const tId = parseInt(e.target.value);
                      setDirectTripId(tId);
                      const matchingTrip = trips.find((t) => t.id === tId);
                      if (matchingTrip && matchingTrip.buses[0]) {
                        setDirectBusId(matchingTrip.buses[0].id);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>{t.title} ({t.month_label})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Bus Coach *
                  </label>
                  <select
                    value={directBusId}
                    onChange={(e) => setDirectBusId(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {trips.find((t) => t.id === directTripId)?.buses.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.available_seats_count} Seats Free)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Devotee Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    placeholder="Suresh Bhai Sharma"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={directPhone}
                    onChange={(e) => setDirectPhone(e.target.value)}
                    placeholder="98200XXXXX"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Seat Numbers to Allot (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={directSeatsInput}
                  onChange={(e) => setDirectSeatsInput(e.target.value)}
                  placeholder="Jaise: 1A, 1B, 1C"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cash / Advance Collected (₹)
                  </label>
                  <input
                    type="number"
                    value={directAmountPaid}
                    onChange={(e) => setDirectAmountPaid(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Special Discount (₹) (Devotee-specific)
                  </label>
                  <input
                    type="number"
                    value={directDiscount}
                    onChange={(e) => setDirectDiscount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-amber-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingDirect}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Confirm Direct Offline Booking</span>
              </button>
            </form>
          )}

          {/* TAB 3: DYNAMIC BUS DESIGNER */}
          {activeTab === 'addBus' && (
            <form onSubmit={handleCreateBus} className="space-y-5 max-w-2xl">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Bus className="w-4 h-4 text-blue-700" />
                  <span>Dynamic Bus Layout Configuration Engine</span>
                </div>
                <p>
                  Admin yahan kisi bhi type ki bus add kar sakta hai: 2x2 Semi-Sleeper, 3x2 Seater, ya 2x1 Sleeper with Upper Deck.
                  Aap rows aur columns chunenge, system poora grid aur seats khud calculate kar dega!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assign to Tour Trip *
                  </label>
                  <select
                    value={busTripId}
                    onChange={(e) => setBusTripId(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bus Coach Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={busName}
                    onChange={(e) => setBusName(e.target.value)}
                    placeholder="Bus C - Luxury Pushback"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bus Number Plate <span className="text-slate-400 font-normal lowercase">(optional - can be assigned on trip day)</span>
                  </label>
                  <input
                    type="text"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    placeholder="e.g. MH-03-BZ-2026 (or leave blank)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Agar transporter trip wale din plate allot karega toh ise khali chhod dein.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Coach Category
                  </label>
                  <select
                    value={busType}
                    onChange={(e) => setBusType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="seater_2x2">2x2 Semi-Sleeper AC</option>
                    <option value="seater_3x2">3x2 Deluxe Seater</option>
                    <option value="sleeper_2x1">2x1 Luxury Sleeper</option>
                    <option value="custom">Custom Layout</option>
                  </select>
                </div>
              </div>

              {/* Numbering Scheme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Seat Numbering Pattern *
                </label>
                <select
                  value={numberingPattern}
                  onChange={(e) => setNumberingPattern(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="continuous_rl">
                    Continuous Numeric (Right to Left) - Luxury Tourist Bus Standard (Col 4 = 1, Col 3 = 2, Col 2 = 3, Col 1 = 4...)
                  </option>
                  <option value="continuous_lr">
                    Continuous Numeric (Left to Right) (Col 1 = 1, Col 2 = 2, Col 3 = 3, Col 4 = 4...)
                  </option>
                  <option value="row_alpha_lr">
                    Row + Alpha (Left to Right): 1A, 1B, 1C, 1D...
                  </option>
                  <option value="row_alpha_rl">
                    Row + Alpha (Right to Left): 1D, 1C, 1B, 1A...
                  </option>
                </select>
              </div>

              {/* Dynamic Seating Layout Parameters */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Seating Grid Parameters & Rear Back Row
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Left Seats / Row
                    </label>
                    <select
                      value={leftSeats}
                      onChange={(e) => setLeftSeats(parseInt(e.target.value))}
                      className="w-full px-2 py-2 rounded-lg border border-slate-300 text-xs font-bold bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value={1}>1 (Single)</option>
                      <option value={2}>2 (Double)</option>
                      <option value={3}>3 (Triple)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Right Seats / Row
                    </label>
                    <select
                      value={rightSeats}
                      onChange={(e) => setRightSeats(parseInt(e.target.value))}
                      className="w-full px-2 py-2 rounded-lg border border-slate-300 text-xs font-bold bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value={1}>1 (Single)</option>
                      <option value={2}>2 (Double)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Number of Rows
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={totalRows}
                      onChange={(e) => setTotalRows(parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Back Row Toggle & Count */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasBackRowCheck"
                      checked={hasBackRow}
                      onChange={(e) => setHasBackRow(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="hasBackRowCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Has Back Row (Rear aisle-spanning seats/berths)
                    </label>
                  </div>
                  {hasBackRow && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-600">Back Seats Count:</span>
                      <input
                        type="number"
                        min={1}
                        max={7}
                        value={backRowSeats}
                        onChange={(e) => setBackRowSeats(parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-center"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="upperDeckCheck"
                    checked={hasUpperDeck}
                    onChange={(e) => setHasUpperDeck(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="upperDeckCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Has Upper Deck (Double Decker / 2-Tier Sleeper Coach)
                  </label>
                </div>

                {/* Real-time Math & Target Seats Calculator */}
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      Target Capacity Calculator
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-amber-800">Set Target:</span>
                      <input
                        type="number"
                        placeholder="e.g. 49"
                        value={targetSeatsInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTargetSeatsInput(val);
                          handleTargetSeatsCalculate(parseInt(val));
                        }}
                        className="w-20 px-2 py-1 rounded-lg border border-amber-300 bg-white text-xs font-black text-amber-950 text-center"
                      />
                    </div>
                  </div>

                  <div className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-amber-200 text-amber-900 leading-relaxed">
                    <div>
                      <strong>Formula:</strong> {totalRows} Rows × {seatsPerRow} Seats/Row = <strong>{totalRows * seatsPerRow} Regular Seats</strong>
                      {hasBackRow ? ` + ${effectiveBackSeats} Back Seats` : ' (No Back Row)'}
                      {hasUpperDeck ? ` (plus Upper Deck)` : ''} = <strong className="text-sm font-black text-amber-950">{calculatedTotalSeats} Seats Total</strong>
                    </div>
                    {hasBackRow && (
                      <div className="text-[10px] text-amber-700 mt-1">
                        ✓ Math: Back row {effectiveBackSeats} seats deducted first ➔ {totalRows * seatsPerRow} regular seats divided across Left ({leftSeats}) & Right ({rightSeats}) into {totalRows} rows.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Base Price per Seat (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>

                {hasUpperDeck && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Upper Deck Price (₹)
                    </label>
                    <input
                      type="number"
                      value={upperDeckPrice}
                      onChange={(e) => setUpperDeckPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Amenities (Comma-separated)
                </label>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={creatingBus}
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Bus & Generate {calculatedTotalSeats} Seats</span>
              </button>
            </form>
          )}

          {/* TAB 4: ADD NEW MONTH TOUR */}
          {activeTab === 'addTrip' && (
            <form onSubmit={handleCreateTrip} className="space-y-5 max-w-2xl">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-700" />
                  <span>Create Tour for Any Month (Multi-Month Support)</span>
                </div>
                <p>
                  Diwali ke alawa naye mahine ka trip (e.g. New Year Yatra, Karthik Purnima, Holi Yatra) yahan se schedule karein.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tour Trip Title *
                </label>
                <input
                  type="text"
                  required
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  placeholder="Jaise: Magh Mela & Somnath Jyotirlinga Yatra 2027"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Month Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={tripMonthLabel}
                    onChange={(e) => setTripMonthLabel(e.target.value)}
                    placeholder="January 2027"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={tripStartDate}
                    onChange={(e) => setTripStartDate(e.target.value)}
                    placeholder="15 Jan 2027"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={tripEndDate}
                    onChange={(e) => setTripEndDate(e.target.value)}
                    placeholder="18 Jan 2027"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={tripDesc}
                  onChange={(e) => setTripDesc(e.target.value)}
                  placeholder="Yatra ke bare mein jankari..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Day-by-Day Itinerary (One day per line)
                </label>
                <textarea
                  rows={3}
                  value={tripItinerary}
                  onChange={(e) => setTripItinerary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Inclusions Provided in Price (Comma-separated)
                </label>
                <input
                  type="text"
                  value={tripInclusions}
                  onChange={(e) => setTripInclusions(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={creatingTrip}
                className="w-full py-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create & Publish Tour Trip</span>
              </button>
            </form>
          )}

          {/* TAB 5: PASSENGER MANIFEST CHART */}
          {activeTab === 'manifest' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Official Bus Passenger Manifest
                  </h4>
                  <p className="text-xs text-slate-500">
                    Bus driver aur tour conductor ke liye printable passenger chart
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={manifestBusId}
                    onChange={(e) => handleLoadManifest(parseInt(e.target.value))}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {trips.flatMap((t) => t.buses).map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Chart</span>
                  </button>
                </div>
              </div>

              {/* Vehicle Number Plate Assignment Bar */}
              {(() => {
                const selectedManifestBus = trips.flatMap((t) => t.buses).find((b) => b.id === manifestBusId);
                return (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Vehicle Number Plate:</span>
                      {selectedManifestBus?.bus_number && selectedManifestBus.bus_number.trim() && selectedManifestBus.bus_number !== 'TBA' ? (
                        <span className="font-mono text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-300 text-slate-900">
                          {selectedManifestBus.bus_number}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-medium">
                          Allotted on Trip Day (TBA)
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBusId(manifestBusId);
                        setNewPlateInput(selectedManifestBus?.bus_number || '');
                      }}
                      className="text-xs font-bold text-amber-800 bg-white border border-amber-300 hover:bg-amber-50 px-3 py-1 rounded-lg transition-colors"
                    >
                      {selectedManifestBus?.bus_number ? 'Update Plate Number' : 'Assign Plate Number'}
                    </button>
                  </div>
                );
              })()}

              {loadingManifest ? (
                <div className="p-12 text-center text-xs text-slate-400">Loading chart...</div>
              ) : manifestData ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                      <tr>
                        <th className="p-3">Seat</th>
                        <th className="p-3">Deck</th>
                        <th className="p-3">Passenger Name</th>
                        <th className="p-3">Gender</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Booking Code</th>
                        <th className="p-3">Paid (₹)</th>
                        <th className="p-3">Due (₹)</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {manifestData.passengers?.map((row: any, i: number) => (
                        <tr key={i} className={row.status === 'AVAILABLE' ? 'text-slate-400' : 'font-medium text-slate-900 bg-amber-50/20'}>
                          <td className="p-3 font-mono font-bold">{row.seat_number}</td>
                          <td className="p-3 capitalize">{row.deck}</td>
                          <td className="p-3 font-semibold">{row.passenger_name}</td>
                          <td className="p-3">{row.passenger_gender}</td>
                          <td className="p-3">{row.primary_phone}</td>
                          <td className="p-3 font-mono text-[11px]">{row.booking_code}</td>
                          <td className="p-3 text-emerald-700 font-bold">₹{row.amount_paid}</td>
                          <td className="p-3 text-amber-800 font-bold">₹{row.balance_due}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.status === 'BOOKED_CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )}

        </div>

        {/* MODAL: APPROVE WITH CUSTOM DISCOUNT */}
        {selectedBookingForApproval && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Approve & Verify Booking</span>
                </h4>
                <button onClick={() => setSelectedBookingForApproval(null)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div>Devotee: <strong>{selectedBookingForApproval.primary_name}</strong></div>
                <div>Code: <strong className="font-mono">{selectedBookingForApproval.booking_code}</strong></div>
                <div>Seats: <strong>{selectedBookingForApproval.selected_seats.join(', ')}</strong></div>
                <div>Total: <strong>₹{selectedBookingForApproval.total_amount}</strong> | Paid: <strong>₹{selectedBookingForApproval.amount_paid}</strong></div>
                <div>UTR: <strong className="font-mono text-amber-900">{selectedBookingForApproval.payment_reference}</strong></div>
              </div>

              {/* Custom Discount input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom Discount (₹) (Devotee-Specific)
                </label>
                <input
                  type="number"
                  value={approvalDiscount}
                  onChange={(e) => setApprovalDiscount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-emerald-700"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Yeh discount sirf is devotee ke panel mein dikhega.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Admin Notes
                </label>
                <input
                  type="text"
                  value={adminApprovalNotes}
                  onChange={(e) => setAdminApprovalNotes(e.target.value)}
                  placeholder="Verified via GPay Bank SMS"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedBookingForApproval(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
                >
                  {approving ? 'Confirming...' : 'Confirm Approval'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CANCEL BOOKING */}
        {selectedBookingForCancel && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 space-y-4">
              <div className="flex items-center justify-between text-rose-700">
                <h4 className="text-base font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Cancel Booking</span>
                </h4>
                <button onClick={() => setSelectedBookingForCancel(null)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Booking <strong>{selectedBookingForCancel.booking_code}</strong> cancel karne se iski sabhi seats ({selectedBookingForCancel.selected_seats.join(', ')}) wapas AVAILABLE ho jayengi.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Cancellation
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedBookingForCancel(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: UPDATE BUS PLATE NUMBER */}
        {editingBusId && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  Assign Vehicle Number Plate
                </h4>
                <button onClick={() => setEditingBusId(null)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleUpdateBusPlate} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Registration Plate Number
                  </label>
                  <input
                    type="text"
                    value={newPlateInput}
                    onChange={(e) => setNewPlateInput(e.target.value)}
                    placeholder="e.g. MH-03-BZ-2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 uppercase"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Trip ke din transporter se bus number milne par yahan update karein.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingBusId(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingPlate}
                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                  >
                    {updatingPlate ? 'Saving...' : 'Save Plate Number'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

