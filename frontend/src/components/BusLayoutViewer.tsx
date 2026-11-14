import React, { useState } from 'react';
import { Armchair, Bed, Clock, Lock, Check, Disc, Info } from 'lucide-react';
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
  maxSeats = 60,
}) => {
  const { t } = useLanguage();
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');

  if (!bus || seats.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
        Loading bus seating layout...
      </div>
    );
  }

  const hasUpper = bus.has_upper_deck;
  const isSleeper = hasUpper || bus.bus_type?.includes('sleeper');

  // Filter seats for the active deck
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

  // Identify back row (highest row number if side === 'back')
  const backRowNumber = bus.total_rows + 1;
  const backRowSeats = currentDeckSeats.filter((s) => s.side === 'back');
  const normalRowNumbers = rowNumbers.filter((r) => r !== backRowNumber);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">

      {/* Clean Header and Deck Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold text-slate-900">
              {bus.name}
            </h3>
            {bus.bus_number && bus.bus_number.trim() && bus.bus_number !== 'TBA' ? (
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200">
                {bus.bus_number}
              </span>
            ) : (
              <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg border border-amber-200">
                {t('plate_allotted_trip_day')}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {bus.left_seats_per_row}x{bus.right_seats_per_row} {isSleeper ? 'Sleeper Coach' : 'Pushback Coach'} • {t('select_seats_title')}
          </p>
        </div>

        {/* Deck Switcher for Upper/Lower deck buses */}
        {hasUpper && (
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveDeck('lower')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeDeck === 'lower'
                ? 'bg-white text-slate-900 border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Armchair className="w-4 h-4 text-amber-700" />
              <span>{t('lower_deck')}</span>
            </button>
            <button
              onClick={() => setActiveDeck('upper')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeDeck === 'upper'
                ? 'bg-white text-slate-900 border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Bed className="w-4 h-4 text-amber-700" />
              <span>{t('upper_deck')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Sleek Minimalist Legend Bar */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md border-2 border-slate-300 bg-white" />
          <span>{t('seat_available')}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-amber-600 text-white flex items-center justify-center">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
          <span className="font-bold text-amber-900">{t('seat_selected')}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-amber-100 border border-amber-300" />
          <span>{t('seat_hold')}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-slate-200 border border-slate-300" />
          <span>{t('seat_booked')}</span>
        </div>
      </div>

      {/* Coach Layout Display */}
      <div className="w-full max-w-[440px] mx-auto">
        <div className="relative bg-slate-50/80 p-5 sm:p-6 rounded-[32px] border-4 border-slate-200/90">

          {/* Front / Driver Area */}
          <div className="flex items-center justify-between pb-5 mb-5 border-b-2 border-dashed border-slate-300">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{t('front_door')}</span>
            </div>

            {/* Steering Wheel */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200 border border-slate-300 text-slate-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">{t('driver')}</span>
              <Disc className="w-4 h-4 text-slate-600" />
            </div>
          </div>

          {/* Regular Rows Grid */}
          <div className="space-y-3">
            {normalRowNumbers.map((rowNum) => {
              const rowSeats = rowsMap[rowNum] || [];
              const leftSeats = rowSeats.filter((s) => s.side === 'left');
              const rightSeats = rowSeats.filter((s) => s.side === 'right');

              return (
                <div key={rowNum} className="flex items-center justify-between gap-2">

                  {/* Left Side */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {leftSeats.map((seat) => renderSeatButton(seat))}
                  </div>

                  {/* Clean Empty Aisle Walkway (No row numbers) */}
                  <div className="w-5 sm:w-7 shrink-0" aria-hidden="true" />

                  {/* Right Side */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {rightSeats.map((seat) => renderSeatButton(seat))}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Rear Back Row */}
          {backRowSeats.length > 0 && (
            <div className="mt-5 pt-4 border-t-2 border-dashed border-slate-300">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">
                {t('rear_back_row')}
              </div>
              <div className="flex items-center justify-between gap-1 sm:gap-1.5">
                {backRowSeats.map((seat) => renderSeatButton(seat, true))}
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        {t('select_seats_hint')}
      </div>

    </div>
  );

  function renderSeatButton(seat: SeatItem, isBackRow = false) {
    const isSelected = selectedSeatNumbers.includes(seat.seat_number);
    const isAvailable = seat.status === 'AVAILABLE';
    const isPending = seat.status === 'HOLD_PENDING';
    const isBooked = seat.status === 'BOOKED_CONFIRMED' || seat.status === 'BLOCKED';

    let buttonClass = 'bg-white border-2 border-slate-300 text-slate-800 hover:border-amber-500 hover:scale-105';
    let icon = isSleeper ? <Bed className="w-4 h-4 text-slate-400" /> : <Armchair className="w-4 h-4 text-slate-400" />;

    if (isSelected) {
      buttonClass = 'bg-amber-600 border-2 border-amber-800 text-white scale-105 ring-2 ring-amber-400/40';
      icon = <Check className="w-4 h-4 stroke-[3] text-white" />;
    } else if (isPending) {
      buttonClass = 'bg-amber-100 border-2 border-amber-300 text-amber-900 cursor-not-allowed opacity-85';
      icon = <Clock className="w-4 h-4 text-amber-700" />;
    } else if (isBooked) {
      buttonClass = 'bg-slate-200 border-2 border-slate-300 text-slate-400 cursor-not-allowed opacity-60';
      icon = <Lock className="w-4 h-4 text-slate-400" />;
    }

    const widthClass = isSleeper
      ? 'w-16 sm:w-20 h-13 sm:h-15'
      : (isBackRow ? 'flex-1 min-w-[36px] h-13 sm:h-15' : 'w-12 sm:w-14 h-13 sm:h-15');

    return (
      <button
        key={seat.id}
        disabled={!isAvailable && !isSelected}
        onClick={() => onToggleSeat(seat.seat_number)}
        title={`Seat ${seat.seat_number} - ₹${seat.price}`}
        className={`${widthClass} rounded-2xl font-bold flex flex-col items-center justify-center p-1 transition-all ${buttonClass}`}
      >
        <span className="text-xs sm:text-sm font-black leading-none mb-1">{seat.seat_number}</span>
        {icon}
      </button>
    );
  }
};
