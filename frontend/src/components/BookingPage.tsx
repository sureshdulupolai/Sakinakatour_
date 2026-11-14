import React, { useState } from 'react';
import { 
  ArrowLeft, Bus, Compass, Sparkles, ShieldCheck, PhoneCall, 
  CheckCircle, ArrowRight, X, Utensils, Hotel, Check, Info,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { TourTrip, BusSummary, SeatItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { TripSelector } from './TripSelector';
import { BusCardSelector } from './BusCardSelector';
import { BusLayoutViewer } from './BusLayoutViewer';

interface BookingPageProps {
  trips: TourTrip[];
  selectedTripId: number;
  selectedBusId: number;
  busDetails: any;
  seats: SeatItem[];
  selectedSeatNumbers: string[];
  selectedTotalAmount?: number;
  onSelectTrip: (tripId: number) => void;
  onSelectBus: (busId: number) => void;
  onToggleSeat: (seatNumber: string) => void;
  onOpenBookingModal?: () => void;
  onBackToHome: () => void;
  onOpenSocialHelp: () => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  trips,
  selectedTripId,
  selectedBusId,
  busDetails,
  seats,
  selectedSeatNumbers,
  selectedTotalAmount = 0,
  onSelectTrip,
  onSelectBus,
  onToggleSeat,
  onOpenBookingModal,
  onBackToHome,
  onOpenSocialHelp,
}) => {
  const { t } = useLanguage();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isBusOpen, setIsBusOpen] = useState(false);

  const activeTrip = trips.find((tr) => tr.id === selectedTripId) || trips[0];
  const activeBus = activeTrip?.buses.find((b) => b.id === selectedBusId) || activeTrip?.buses[0];

  // Calculate total if not provided
  const computedTotal = selectedTotalAmount > 0 
    ? selectedTotalAmount 
    : selectedSeatNumbers.reduce((sum, seatNo) => {
        const found = seats.find((s) => s.seat_number === seatNo);
        return sum + (found ? found.price : (activeBus?.base_price || 2500));
      }, 0);

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 pb-28 animate-in fade-in duration-200">
      
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/80 transition-all mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('back')}</span>
          </button>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif-heading">
              Select Seats
            </h1>
            <span className="text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
              Live Coach Blueprint
            </span>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Pick your preferred coach seats with instant live confirmation.
          </p>
        </div>

        {/* Helpline quick widget */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSocialHelp}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
            <span>Booking Helpline</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Luxury Booking Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Configuration & Live Checkout Drawer) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Step 1: Tour Selector Collapsible Card */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setIsTourOpen((prev) => !prev)}
              className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  1
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Select Yatra / Tour
                  </h3>
                  {!isTourOpen && activeTrip && (
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      Selected: <strong className="text-slate-800">{activeTrip.title}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full hidden sm:inline">
                  {isTourOpen ? 'Close' : 'Change Tour'}
                </span>
                <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  {isTourOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </button>

            {isTourOpen && (
              <div className="px-5 pb-5 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
                <TripSelector
                  trips={trips}
                  selectedTripId={selectedTripId}
                  hideHeader={true}
                  onSelectTrip={(id) => {
                    onSelectTrip(id);
                    setIsTourOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Step 2: Coach Selector Collapsible Card */}
          {activeTrip && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setIsBusOpen((prev) => !prev)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Select Bus Coach
                    </h3>
                    {!isBusOpen && activeBus && (
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        Selected: <strong className="text-slate-800">{activeBus.name}</strong> <span className="text-amber-800 font-bold ml-1">(₹{activeBus.base_price.toLocaleString('en-IN')}/seat)</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full hidden sm:inline">
                    {isBusOpen ? 'Close' : 'Change Coach'}
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    {isBusOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {isBusOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
                  <BusCardSelector
                    buses={activeTrip.buses}
                    selectedBusId={selectedBusId}
                    hideHeader={true}
                    onSelectBus={(id) => {
                      onSelectBus(id);
                      setIsBusOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Live Seat & Fare Breakdown Drawer */}
          <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-black flex items-center justify-center">
                  3
                </span>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Reservation Summary
                </h3>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                selectedSeatNumbers.length > 0 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {selectedSeatNumbers.length} Seat{selectedSeatNumbers.length !== 1 ? 's' : ''} Selected
              </span>
            </div>

            {/* If seats ARE selected */}
            {selectedSeatNumbers.length > 0 ? (
              <div className="space-y-4">
                
                {/* Selected Seat Chips (Only seat numbers, no price) */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Selected Seats ({selectedSeatNumbers.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSeatNumbers.map((seatNo) => (
                      <span
                        key={seatNo}
                        className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-950 font-black text-xs px-2.5 py-1 rounded-xl"
                      >
                        <span>{seatNo}</span>
                        <button
                          type="button"
                          onClick={() => onToggleSeat(seatNo)}
                          className="hover:bg-amber-200 rounded p-0.5 text-amber-800 transition-colors"
                          title={`Remove Seat ${seatNo}`}
                        >
                          <X className="w-3 h-3 stroke-[3]" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Transparent Price Breakdown */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Selected Seats ({selectedSeatNumbers.length} seat{selectedSeatNumbers.length > 1 ? 's' : ''})</span>
                    <span className="font-bold text-slate-900">₹{computedTotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-200/80 leading-relaxed">
                    💡 Booking options: Pay full fare or pay token advance to lock seats (selectable at checkout).
                  </div>

                  {/* Total Highlight */}
                  <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Total Payable Fare
                      </span>
                      <span className="text-xl font-black text-slate-900">
                        ₹{computedTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      {selectedSeatNumbers.length} Seat{selectedSeatNumbers.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Dynamic Package Inclusions from Database */}
                {activeTrip?.inclusions && activeTrip.inclusions.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                      Package Inclusions
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {activeTrip.inclusions.map((inclusion, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{inclusion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primary Proceed Button */}
                {onOpenBookingModal && (
                  <button
                    type="button"
                    onClick={onOpenBookingModal}
                    className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 border-2 border-amber-600"
                  >
                    <span>Proceed to Confirm Booking (₹{computedTotal.toLocaleString('en-IN')})</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                )}

                {/* Trust Strip */}
                <div className="pt-2 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100% Family & Devotee Seating Guarantee</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Instant WhatsApp E-Ticket & Darshan Pass</span>
                  </div>
                </div>

              </div>
            ) : (
              /* If NO seats selected yet: Helpful guide prompt */
              <div className="py-6 px-4 text-center space-y-3 bg-slate-50/70 rounded-2xl border border-dashed border-slate-300">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto">
                  <Bus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Pick Your Preferred Coach Seats
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                    Tap on any white seat on the coach blueprint to select. Multiple seats can be selected for friends & family.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-4 text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-amber-600" />
                    <span>Pure Veg Meals</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Hotel className="w-3 h-3 text-amber-600" />
                    <span>Hotel Rooms</span>
                  </span>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column (Coach Seating Arena) */}
        <div className="lg:col-span-7">
          {activeBus ? (
            <BusLayoutViewer
              bus={busDetails || activeBus}
              seats={seats}
              selectedSeatNumbers={selectedSeatNumbers}
              onToggleSeat={onToggleSeat}
            />
          ) : (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
              No coach selected. Please choose a tour and bus from the left panel.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
