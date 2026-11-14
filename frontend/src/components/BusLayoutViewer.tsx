import React, { useState } from 'react';
import { Armchair, Bed, Clock, Lock, Check, Disc, Info, ShieldCheck, DoorOpen, Sparkles } from 'lucide-react';
import { SeatItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface BusLayoutViewerProps {
  bus: any;
  seats: SeatItem[];
  selectedSeatNumbers: string[];
  onToggleSeat: (seatNumber: string) => void;
  maxSeats?: number;
}

export const BusLayoutViewer: React.FC<BusLayoutViewerProps> = ({
  bus,
  seats,
  selectedSeatNumbers,
  onToggleSeat,
}) => {
  const { t } = useLanguage();
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');

  if (!bus || seats.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-700">Loading coach seating blueprint...</p>
      </div>
    );
  }

  const hasUpper = bus.has_upper_deck;
  const isSleeper = hasUpper || bus.bus_type?.includes('sleeper');

  // Filter seats for active deck
  const currentDeckSeats = seats.filter((s) => s.deck === activeDeck);

  // Group seats by row
  const rowsMap: { [row: number]: SeatItem[] } = {};
  currentDeckSeats.forEach((s) => {
    if (!rowsMap[s.row]) rowsMap[s.row] = [];
    rowsMap[s.row].push(s);
  });

  const rowNumbers = Object.keys(rowsMap)
    .map(Number)
    .sort((a, b) => a - b);

  // Identify back row
  const backRowNumber = bus.total_rows + 1;
  const backRowSeats = currentDeckSeats.filter((s) => s.side === 'back');
  const normalRowNumbers = rowNumbers.filter((r) => r !== backRowNumber);

  // Tally counts for current deck
  const availableCount = currentDeckSeats.filter((s) => s.status === 'AVAILABLE').length;
  const bookedCount = currentDeckSeats.filter((s) => s.status === 'BOOKED_CONFIRMED' || s.status === 'BLOCKED').length;
  const holdCount = currentDeckSeats.filter((s) => s.status === 'HOLD_PENDING').length;

  const hasValidPlate = Boolean(
    bus.bus_number &&
    bus.bus_number.trim() &&
    bus.bus_number !== 'TBA' &&
    bus.bus_number !== 'null' &&
    bus.bus_number !== 'undefined'
  );

  const coachCategoryLabel = bus.bus_type
    ? bus.bus_type.replace(/_/g, ' ').toUpperCase()
    : (isSleeper ? 'EXECUTIVE AC SLEEPER' : 'AIR-SUSPENSION AC COACH');

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 space-y-6">

      {/* Top Coach Header */}
      <div className="border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {bus.name}
          </h3>
          {hasValidPlate ? (
            <span className="font-mono text-[11px] font-black bg-slate-900 text-amber-400 px-2 py-0.5 rounded-md border border-slate-700 whitespace-nowrap">
              {bus.bus_number}
            </span>
          ) : (
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 whitespace-nowrap">
              Vehicle Plate on Trip Day
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          {bus.left_seats_per_row}x{bus.right_seats_per_row} {isSleeper ? 'Executive AC Sleeper' : 'Air-Suspension Pushback AC Coach'} • {t('select_seats_title')}
        </p>
      </div>

      {/* Sleek Compact Segmented Deck Switcher */}
      {hasUpper && (
        <div className="flex justify-center">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveDeck('lower')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeDeck === 'lower'
                  ? 'bg-white text-slate-900 border border-slate-200/80 shadow-none'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Armchair className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>{t('lower_deck')}</span>
              <span className="text-[10px] font-normal text-slate-400">
                ({seats.filter((s) => s.deck === 'lower').length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDeck('upper')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeDeck === 'upper'
                  ? 'bg-white text-slate-900 border border-slate-200/80 shadow-none'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Bed className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>{t('upper_deck')}</span>
              <span className="text-[10px] font-normal text-slate-400">
                ({seats.filter((s) => s.deck === 'upper').length})
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Modern High-Contrast Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <div className="w-3.5 h-3.5 rounded border-2 border-slate-300 bg-white shrink-0" />
          <span className="text-slate-700 font-semibold">{t('seat_available')} ({availableCount})</span>
        </div>

        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <div className="w-3.5 h-3.5 rounded border-2 border-amber-500 bg-white flex flex-col items-center justify-between p-0.5 shrink-0">
            <div className="w-full h-0.5 bg-amber-500 rounded-full" />
          </div>
          <span className="font-bold text-amber-950">{t('seat_selected')} ({selectedSeatNumbers.length})</span>
        </div>

        {holdCount > 0 && (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <div className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300 shrink-0" />
            <span className="text-amber-900 font-medium">{t('seat_hold')} ({holdCount})</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300 shrink-0" />
          <span className="text-slate-500 font-medium">{t('seat_booked')} ({bookedCount})</span>
        </div>
      </div>

      {/* Realistic Luxury Coach Blueprint Container */}
      <div className="w-full max-w-[440px] mx-auto">
        <div className="relative bg-slate-50/70 p-4 sm:p-6 rounded-t-[44px] rounded-b-[28px] border-4 border-slate-300">

          {/* Aerodynamic Windscreen & Cabin Top */}
          <div className="mb-4">
            {/* Front Bumper with Headlight Accents */}
            <div className="flex items-center justify-between px-6 pb-2">
              <span className="w-3.5 h-1.5 rounded-full bg-amber-400 border border-amber-500" title="Left LED Headlight" />
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                {coachCategoryLabel}
              </span>
              <span className="w-3.5 h-1.5 rounded-full bg-amber-400 border border-amber-500" title="Right LED Headlight" />
            </div>

            {/* Tinted Windscreen Glass Header */}
            <div className="h-10 rounded-t-[32px] bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
                Front Windscreen
              </span>
            </div>

            {/* Driver Cockpit & Passenger Entrance Divider */}
            <div className="mt-2 flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
              {/* Passenger Entrance (Left side boarding) */}
              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <DoorOpen className="w-3 h-3 text-emerald-600" />
                <span>Passenger Entry</span>
              </div>

              {/* Driver Console (Right side driving) */}
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                <span>Driver Cabin</span>
                <Disc className="w-3.5 h-3.5 text-slate-700" />
              </div>
            </div>
          </div>

          {/* Regular Rows Seating Grid with Walkway Runner */}
          <div className="space-y-2.5 relative">
            {normalRowNumbers.map((rowNum) => {
              const rowSeats = rowsMap[rowNum] || [];
              const leftSeats = rowSeats.filter((s) => s.side === 'left');
              const rightSeats = rowSeats.filter((s) => s.side === 'right');

              return (
                <div key={rowNum} className="flex items-center justify-between gap-2">

                  {/* Left Side Seats */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {leftSeats.map((seat) => renderSeatButton(seat))}
                  </div>

                  {/* Central Aisle Walkway with dashed guideline */}
                  <div className="flex-1 flex flex-col items-center justify-center py-1">
                    <div className="h-6 w-px border-r border-dashed border-slate-300" />
                  </div>

                  {/* Right Side Seats */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {rightSeats.map((seat) => renderSeatButton(seat))}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Rear Back Row Seats (if configured) */}
          {backRowSeats.length > 0 && (
            <div className="mt-4 pt-3 border-t-2 border-dashed border-slate-300">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center mb-1.5">
                {t('rear_back_row')}
              </div>
              <div className="flex items-center justify-between gap-1 sm:gap-1.5">
                {backRowSeats.map((seat) => renderSeatButton(seat, true))}
              </div>
            </div>
          )}

          {/* Rear Coach Safety Bumper */}
          <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Speed Governor & GPS</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-red-400/80 border border-red-500" title="Rear Taillight" />
              <span className="w-3 h-1.5 rounded-full bg-red-400/80 border border-red-500" title="Rear Taillight" />
            </div>
          </div>

        </div>
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        💡 {t('select_seats_hint')}
      </div>

    </div>
  );

  function renderSeatButton(seat: SeatItem, isBackRow = false) {
    const isSelected = selectedSeatNumbers.includes(seat.seat_number);
    const isAvailable = seat.status === 'AVAILABLE';
    const isPending = seat.status === 'HOLD_PENDING';
    const isBooked = seat.status === 'BOOKED_CONFIRMED' || seat.status === 'BLOCKED';

    let buttonClass = 'bg-white border-2 border-slate-300 text-slate-800 hover:border-amber-400 hover:bg-amber-50/20 transition-all duration-300 ease-out';
    let iconClass = 'text-slate-400 transition-colors duration-300 ease-out';

    if (isSelected) {
      // Background remains white, crisp flat border with zero shadow or ring, smooth animation
      buttonClass = 'bg-white border-2 border-amber-500 text-amber-950 scale-[1.03] font-black transition-all duration-300 ease-out';
      // The seat icon is NOT replaced by a checkmark; instead it smoothly turns vibrant amber
      iconClass = 'text-amber-600 stroke-[2.2] transition-colors duration-300 ease-out';
    } else if (isPending) {
      buttonClass = 'bg-amber-50 border-2 border-amber-200 text-amber-900 cursor-not-allowed opacity-80';
      iconClass = 'text-amber-700';
    } else if (isBooked) {
      buttonClass = 'bg-slate-100 border-2 border-slate-300 text-slate-400 cursor-not-allowed opacity-60';
      iconClass = 'text-slate-400';
    }

    const icon = isBooked ? (
      <Lock className="w-3.5 h-3.5 text-slate-400" />
    ) : isPending ? (
      <Clock className="w-3.5 h-3.5 text-amber-700" />
    ) : isSleeper ? (
      <Bed className={`w-3.5 h-3.5 ${iconClass}`} />
    ) : (
      <Armchair className={`w-3.5 h-3.5 ${iconClass}`} />
    );

    const widthClass = isSleeper
      ? 'w-16 sm:w-20 h-12 sm:h-14'
      : (isBackRow ? 'flex-1 min-w-[34px] h-12 sm:h-14' : 'w-12 sm:w-14 h-12 sm:h-14');

    return (
      <button
        key={seat.id}
        type="button"
        disabled={!isAvailable && !isSelected}
        onClick={() => onToggleSeat(seat.seat_number)}
        title={`Seat ${seat.seat_number} - ₹${seat.price.toLocaleString('en-IN')}`}
        className={`${widthClass} rounded-2xl font-bold flex flex-col items-center justify-between p-1.5 active:scale-95 relative group shadow-none ${buttonClass}`}
      >
        {/* Animated Headrest cushion contour - fills with amber on select with smooth slide animation */}
        <div className="w-3/4 h-1 rounded-full bg-slate-200 overflow-hidden relative">
          <div
            className={`h-full bg-amber-500 rounded-full transition-all duration-300 ease-out ${
              isSelected ? 'w-full opacity-100' : 'w-0 opacity-0'
            }`}
          />
        </div>

        <span className="text-xs sm:text-sm font-black leading-none my-0.5">
          {seat.seat_number}
        </span>

        {icon}
      </button>
    );
  }
};
