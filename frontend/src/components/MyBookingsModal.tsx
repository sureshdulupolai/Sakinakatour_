import React, { useState, useEffect } from 'react';
import { X, Ticket, Clock, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, PhoneCall } from 'lucide-react';
import { BookingRecord } from '../types';
import { fetchMyBookings } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal: () => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  onOpenLoginModal,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      loadBookings();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 overflow-hidden my-auto animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('my_bookings_title')}
              </h3>
              <p className="text-xs text-slate-500">
                Real-time booking status & official verification pass
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={loadBookings}
                className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {!user ? (
            <div className="p-8 text-center space-y-4">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <h4 className="text-base font-bold text-slate-900">Login Required</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Apni chuni hui seats aur approval status dekhne ke liye kripya apne mobile number se login karein.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenLoginModal();
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-all"
              >
                Login with Mobile OTP
              </button>
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Loading your bookings...
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {error}
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Abhi tak koi booking nahi hai</h4>
              <p className="text-xs text-slate-500">
                Aap home page par jakar apni pasandeeda bus ki seats book kar sakte hain.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => {
                const isConfirmed = b.status === 'CONFIRMED';
                const isPending = b.status === 'PENDING_APPROVAL';
                const isCancelled = b.status === 'CANCELLED';

                return (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-4"
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {b.booking_code}
                          </span>
                          <span className="text-xs text-slate-400">{b.created_at}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {b.trip_title}
                        </h4>
                        <div className="text-xs text-amber-800 font-semibold mt-0.5">
                          {b.bus_name}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isConfirmed && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Confirmed</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Awaiting Verification</span>
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                            <span>Cancelled by Admin</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Seats & Passengers Breakdown */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Booked Seats:</span>
                        <span className="font-bold text-slate-900">
                          {b.selected_seats.join(', ')} ({b.total_passengers} Seats)
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                        <span className="font-semibold text-slate-700">Yatri: </span>
                        {b.passengers.map((p, idx) => (
                          <span key={idx}>
                            {p.name} ({p.seat_number}){idx < b.passengers.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Financial details & Exclusive Discount */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs border-t border-slate-100">
                      <div>
                        <span className="text-slate-400">Total Price:</span>
                        <div className="font-semibold text-slate-800">₹{b.total_amount.toLocaleString('en-IN')}</div>
                      </div>

                      {/* Custom Discount (visible only to this user!) */}
                      <div>
                        <span className="text-slate-400">Special Discount:</span>
                        <div className="font-bold text-emerald-700">
                          {b.discount_amount > 0 ? (
                            <span className="flex items-center gap-0.5">
                              <Sparkles className="w-3 h-3" />
                              -₹{b.discount_amount.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400">Amount Paid:</span>
                        <div className="font-bold text-slate-900">₹{b.amount_paid.toLocaleString('en-IN')}</div>
                      </div>

                      <div>
                        <span className="text-slate-400">Balance Due:</span>
                        <div className="font-bold text-amber-800">
                          {b.balance_due > 0 ? `₹${b.balance_due.toLocaleString('en-IN')}` : 'Full Paid'}
                        </div>
                      </div>
                    </div>

                    {/* Notice */}
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>UPI Ref: {b.payment_reference || '-'}</span>
                      <span className="text-slate-400 italic">Cancel sirf organizer kar sakte hain</span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

