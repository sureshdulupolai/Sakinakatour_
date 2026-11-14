import React from 'react';
import { ArrowLeft, Bus, Compass, Sparkles, ShieldCheck, PhoneCall } from 'lucide-react';
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
  onSelectTrip: (tripId: number) => void;
  onSelectBus: (busId: number) => void;
  onToggleSeat: (seatNumber: string) => void;
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
  onSelectTrip,
  onSelectBus,
  onToggleSeat,
  onBackToHome,
  onOpenSocialHelp,
}) => {
  const { t } = useLanguage();
  const activeTrip = trips.find((t) => t.id === selectedTripId) || trips[0];
  const activeBus = activeTrip?.buses.find((b) => b.id === selectedBusId) || activeTrip?.buses[0];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Back button and page title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3.5 py-1.5 rounded-xl transition-all mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('back')}</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-serif-heading">
              {t('brand_name')} • {t('nav_book')}
            </h1>
            <span className="hidden sm:inline text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
              Live Seating Grid
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t('select_seats_hint')}
          </p>
        </div>

        {/* Helpline quick widget */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSocialHelp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
            <span>Booking Helpline</span>
          </button>
        </div>
      </div>

      {/* Step 1: Trip Selector */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200">
        <TripSelector
          trips={trips}
          selectedTripId={selectedTripId}
          onSelectTrip={onSelectTrip}
        />
      </div>

      {/* Step 2: Bus Selector */}
      {activeTrip && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <BusCardSelector
            buses={activeTrip.buses}
            selectedBusId={selectedBusId}
            onSelectBus={onSelectBus}
          />
        </div>
      )}

      {/* Step 3: Interactive Bus Seat Grid */}
      {activeBus && (
        <div className="space-y-4">
          <BusLayoutViewer
            bus={busDetails || activeBus}
            seats={seats}
            selectedSeatNumbers={selectedSeatNumbers}
            onToggleSeat={onToggleSeat}
          />
        </div>
      )}

    </div>
  );
};

