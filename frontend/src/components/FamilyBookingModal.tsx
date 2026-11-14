import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, ShieldCheck, Copy, Check, Users, 
  ArrowRight, ArrowLeft, Clock, Phone, Sparkles, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SeatItem, TourTrip, BusSummary, PassengerDetail, PublicSettings } from '../types';
import { sendOtp, verifyOtp, createBooking } from '../services/api';

interface FamilyBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TourTrip;
  bus: BusSummary;
  selectedSeats: string[];
  seatObjects: SeatItem[];
  settings?: PublicSettings;
  onBookingSuccess: (bookingResult: any) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const FamilyBookingModal: React.FC<FamilyBookingModalProps> = ({
  isOpen,
  onClose,
  trip,
  bus,
  selectedSeats,
  seatObjects,
  settings,
  onBookingSuccess,
  showToast,
}) => {
  const { user, loginWithToken } = useAuth();
  const { t } = useLanguage();

  // Wizard Steps: 1: Auth -> 2: Passengers -> 3: Payment
  const [step, setStep] = useState<number>(user ? 2 : 1);

  // Auth form state
  const [phone, setPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState<string>('');
  const [userGender, setUserGender] = useState<string>('Male');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [authLoading, setAuthLoading] = useState(false);

  // Passengers form state
  const [passengers, setPassengers] = useState<PassengerDetail[]>([]);

  // Payment state
  const [paymentType, setPaymentType] = useState<'advance' | 'full' | 'custom'>('advance');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Calculate total price based on selected seats
  const totalAmount = selectedSeats.reduce((sum, seatNum) => {
    const sObj = seatObjects.find((s) => s.seat_number === seatNum);
    const price = sObj?.deck === 'upper' && bus.upper_deck_price ? bus.upper_deck_price : bus.base_price;
    return sum + price;
  }, 0);

  // Default token advance (₹500 per seat or min ₹1,000)
  const defaultAdvance = Math.min(totalAmount, Math.max(1000, selectedSeats.length * 500));

  useEffect(() => {
    if (user) {
      setStep(2);
      setPhone(user.phone);
      setUserName(user.name);
      if (user.age) setUserAge(user.age.toString());
      if (user.gender) setUserGender(user.gender);
    }
  }, [user]);

  useEffect(() => {
    if (selectedSeats.length > 0) {
      const primaryName = user ? user.name : (userName || 'Primary Devotee');
      const primaryAge = user?.age || (userAge ? parseInt(userAge) : undefined);
      const primaryGender = user?.gender || userGender;
      const primaryPhone = user?.phone || phone;

      const newPassengers: PassengerDetail[] = selectedSeats.map((seatNum, idx) => {
        if (idx === 0) {
          return {
            seat_number: seatNum,
            name: primaryName,
            age: primaryAge,
            gender: primaryGender,
            phone: primaryPhone,
            is_primary: true,
          };
        }
        return {
          seat_number: seatNum,
          name: '',
          phone: '',
          age: undefined,
          gender: 'Unspecified',
          is_primary: false,
        };
      });
      setPassengers(newPassengers);
    }
  }, [selectedSeats, user]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.length !== 10 || !['6', '7', '8', '9'].includes(cleanPhone[0])) {
      showToast('error', 'Invalid Phone', 'Kripya 10-digit valid Indian mobile number dalein.');
      return;
    }
    if (!userName.trim()) {
      showToast('error', 'Name Required', 'Kripya apna shubh naam dalein.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await sendOtp(cleanPhone);
      setOtpSent(true);
      setCountdown(60);
      if (res.demo_otp) {
        setDemoOtpHint(res.demo_otp);
        setOtpInput(res.demo_otp);
      }
      showToast('success', 'OTP Sent', res.message);
    } catch (err: any) {
      showToast('error', 'OTP Error', err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      showToast('error', 'Invalid OTP', 'Kripya 6-digit OTP code dalein.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await verifyOtp({
        phone: phone.replace(/[^\d]/g, ''),
        otp: otpInput.trim(),
        name: userName.trim(),
        age: userAge ? parseInt(userAge) : undefined,
        gender: userGender,
      });
      loginWithToken(res.token, res.user);
      showToast('success', 'Verified', `Swagatam, ${res.user.name}!`);
      setStep(2);
    } catch (err: any) {
      showToast('error', 'Verification Failed', err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdatePassenger = (index: number, field: keyof PassengerDetail, value: any) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleAutoFillFamily = () => {
    const primaryName = passengers[0]?.name || user?.name || 'Devotee';
    const updated = passengers.map((p, idx) => {
      if (idx === 0) return p;
      return {
        ...p,
        name: `${primaryName} (Family ${idx + 1})`,
      };
    });
    setPassengers(updated);
    showToast('info', 'Names Auto-filled', 'Co-passengers ke naam auto-set kar diye gaye hain.');
  };

  const handleProceedToStep3 = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name || !p.name.trim()) {
        showToast('error', 'Name Required', `Kripya Seat ${p.seat_number} ke yatri ka shubh naam dalein.`);
        return;
      }
      if (p.phone && p.phone.trim()) {
        const cleanP = p.phone.replace(/[^\d]/g, '');
        if (cleanP.length !== 10) {
          showToast('error', 'Invalid Mobile', `Seat ${p.seat_number} ka 10-digit valid mobile number dalein (ya blank chhodein).`);
          return;
        }
      }
    }
    setStep(3);
  };

  const activeUpiVpa = settings?.upi_vpa || (import.meta.env.VITE_DEFAULT_UPI_VPA as string) || 'sakinakadiwali@upi';
  const activeUpiName = settings?.upi_name || 'Sakinaka Tour Yatra';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(activeUpiVpa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
    showToast('info', 'Copied', `${activeUpiVpa} copied`);
  };

  let effectivePaidAmount = defaultAdvance;
  if (paymentType === 'full') {
    effectivePaidAmount = totalAmount;
  } else if (paymentType === 'custom') {
    effectivePaidAmount = parseFloat(customAmount) || 0;
  }

  const handleSubmitBooking = async () => {
    if (!paymentRef.trim()) {
      showToast('error', 'Required', 'Kripya UPI Transaction UTR / Ref No dalein.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        trip_id: trip.id,
        bus_id: bus.id,
        primary_name: passengers[0]?.name || user?.name || 'Devotee',
        primary_phone: user?.phone || phone,
        primary_age: passengers[0]?.age || (userAge ? parseInt(userAge) : undefined),
        primary_gender: passengers[0]?.gender || userGender,
        selected_seats: selectedSeats,
        passengers: passengers,
        amount_paid: effectivePaidAmount,
        payment_mode: 'UPI_QR',
        payment_reference: paymentRef.trim(),
        payment_note: paymentNote.trim() || undefined,
      };

      const result = await createBooking(payload);
      showToast('success', 'Seats Held!', 'Booking submitted. Admin will verify and confirm.');
      onBookingSuccess(result);
      onClose();
    } catch (err: any) {
      showToast('error', 'Booking Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
              {step}
            </span>
            <div className="leading-tight">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                {step === 1 && 'Step 1: Contact Details'}
                {step === 2 && 'Step 2: Passenger Details'}
                {step === 3 && 'Step 3: Advance Payment'}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-[11px] font-bold text-slate-500">
                  {selectedSeats.length} Seats:
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  {selectedSeats.map((s) => (
                    <span key={s} className="font-mono text-[10px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                      {s}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-black text-slate-900 ml-1">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 max-h-[78vh] overflow-y-auto space-y-4">

          {/* STEP 1: MOBILE OTP AUTH */}
          {step === 1 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('full_name')} *
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Jaise: Suresh Bhai Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('mobile_number')} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-semibold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98200XXXXX"
                      disabled={otpSent}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {t('age')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={userAge}
                      onChange={(e) => setUserAge(e.target.value)}
                      placeholder="45"
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {t('gender')}
                    </label>
                    <select
                      value={userGender}
                      onChange={(e) => setUserGender(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* OTP Form */}
              {otpSent && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 uppercase">Enter 6-Digit OTP</span>
                    {countdown > 0 ? (
                      <span className="text-amber-700 font-semibold">{countdown}s</span>
                    ) : (
                      <button onClick={handleSendOtp} className="text-amber-700 font-bold hover:underline">
                        Resend
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="• • • • • •"
                    className="w-full tracking-widest text-center text-lg font-bold py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  {demoOtpHint && (
                    <div className="text-[10px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 text-center">
                      Auto-filled OTP: <strong>{demoOtpHint}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-1">
                {!otpSent ? (
                  <button
                    onClick={handleSendOtp}
                    disabled={authLoading}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{t('send_otp')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleVerifyOtp}
                    disabled={authLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{t('verify_otp')}</span>
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PASSENGERS */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                    Passenger Details ({passengers.length} Yatri)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Name is required. Mobile no is optional (allows login later).
                  </span>
                </div>
                {passengers.length > 1 && (
                  <button
                    type="button"
                    onClick={handleAutoFillFamily}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Auto-fill Family</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {passengers.map((p, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-2xl border transition-all ${
                      p.is_primary ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-slate-950 text-amber-400 px-2 py-0.5 rounded-md">
                          Seat {p.seat_number}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {p.is_primary ? 'Primary Contact (Main Devotee)' : `Co-Passenger ${index + 1}`}
                        </span>
                      </div>
                      {p.is_primary && (
                        <span className="text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {/* Name & Mobile Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => handleUpdatePassenger(index, 'name', e.target.value)}
                            placeholder={p.is_primary ? 'Main Devotee Name' : `Passenger ${index + 1} Name`}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                            Mobile No {p.is_primary ? '*' : '(Optional for Login)'}
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-xs font-semibold text-slate-400">
                              +91
                            </span>
                            <input
                              type="tel"
                              maxLength={10}
                              value={p.phone || (p.is_primary ? (user?.phone || phone) : '')}
                              disabled={p.is_primary}
                              onChange={(e) => handleUpdatePassenger(index, 'phone', e.target.value.replace(/[^\d]/g, ''))}
                              placeholder={p.is_primary ? phone : '98200XXXXX'}
                              className={`w-full pl-9 pr-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-500 ${
                                p.is_primary ? 'bg-slate-100 text-slate-600 cursor-not-allowed' : 'bg-white text-slate-900'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Age & Gender */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                            Age (Optional)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={p.age || ''}
                            onChange={(e) => handleUpdatePassenger(index, 'age', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="Jaise: 38"
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-amber-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                            Gender
                          </label>
                          <select
                            value={p.gender || 'Unspecified'}
                            onChange={(e) => handleUpdatePassenger(index, 'gender', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Unspecified">Unspecified</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>{t('back')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToStep3}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>{t('modal_step3')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT VIA UPI QR */}
          {step === 3 && (
            <div className="space-y-3">
              {/* Payment Type Selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('advance')}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    paymentType === 'advance'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-slate-500">{t('token_advance')}</div>
                  <div className="text-sm font-black text-amber-900">₹{defaultAdvance.toLocaleString('en-IN')}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('full')}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    paymentType === 'full'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-slate-500">{t('full_fare')}</div>
                  <div className="text-sm font-black text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</div>
                </button>
              </div>

              {/* QR and UPI in compact side-by-side */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-1 rounded-lg border border-slate-200 shrink-0 flex items-center justify-center">
                  <img
                    src="/upi_qr.png"
                    alt="UPI QR Code"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.src = "/wa_qr.png"; }}
                  />
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-slate-900 truncate">
                    {activeUpiName}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 truncate select-all">
                      {activeUpiVpa}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-amber-800 shrink-0"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {t('scan_upi_qr')}
                  </div>
                </div>
              </div>

              {/* UTR Input Form */}
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('upi_utr_label')} *
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="e.g. 432109876543 (12-digit UTR)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Optional note (e.g. Sent from Suresh PhonePe)"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-[11px]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setStep(2)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>{t('back')}</span>
                </button>

                <button
                  onClick={handleSubmitBooking}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>{t('confirm_hold_seats')}</span>
                      <CheckCircle className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
