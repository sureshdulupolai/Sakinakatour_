import React from 'react';
import { CheckCircle2, Clock, Ticket, MessageCircle, PhoneCall, Copy, ArrowRight, ShieldCheck } from 'lucide-react';

interface BookingConfirmationCardProps {
  bookingData: any;
  onClose: () => void;
  onViewMyBookings: () => void;
}

export const BookingConfirmationCard: React.FC<BookingConfirmationCardProps> = ({
  bookingData,
  onClose,
  onViewMyBookings,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    if (bookingData?.booking_code) {
      navigator.clipboard.writeText(bookingData.booking_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 text-center space-y-6">
        
        {/* Top Icon Badge */}
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-3 py-1 rounded-full">
            Seats Reserved on Hold
          </span>
          <h3 className="text-2xl font-bold text-slate-900 mt-2 font-serif-heading">
            Booking Request Darj Ho Gayi Hai!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Aapki chuni hui seats ab hold par hain. Admin aapka UPI UTR check karke jaldi hi confirm karega.
          </p>
        </div>

        {/* Booking Code Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Booking Reference Code
            </span>
            <button
              onClick={handleCopyCode}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="text-xl font-mono font-extrabold text-slate-900 tracking-wider">
            {bookingData?.booking_code}
          </div>

          <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500">Reserved Seats:</span>
              <div className="font-bold text-amber-900">
                {bookingData?.selected_seats?.join(', ') || '-'}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Advance Paid:</span>
              <div className="font-bold text-emerald-700">
                ₹{bookingData?.amount_paid?.toLocaleString('en-IN') || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            Admin approval ke baad aapka status <strong>CONFIRMED</strong> ho jayega. Koi bhi discount admin approval ke samay apply karega toh woh aapko hi dikhega.
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onViewMyBookings}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            <span>Check My Bookings Status</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

