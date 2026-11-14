import React from 'react';
import { Bus, Armchair, Bed, Sparkles, Check, Wind, Zap } from 'lucide-react';
import { BusSummary } from '../types';

interface BusCardSelectorProps {
  buses: BusSummary[];
  selectedBusId: number;
  onSelectBus: (busId: number) => void;
  hideHeader?: boolean;
}

export const BusCardSelector: React.FC<BusCardSelectorProps> = ({
  buses,
  selectedBusId,
  onSelectBus,
  hideHeader = false,
}) => {
  if (buses.length === 0) {
    return (
      <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
        No coaches configured for this tour yet. Contact Sakinaka Tour helpline for private bookings.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-black flex items-center justify-center">
              2
            </span>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Select Bus Coach
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {buses.length} Fleet Coach{buses.length > 1 ? 'es' : ''}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5">
        {buses.map((bus) => {
          const isSelected = bus.id === selectedBusId;
          const isSleeper = bus.has_upper_deck || bus.bus_type?.includes('sleeper');
          const hasValidPlate = Boolean(
            bus.bus_number &&
            bus.bus_number.trim() &&
            bus.bus_number !== 'TBA' &&
            bus.bus_number !== 'null' &&
            bus.bus_number !== 'undefined'
          );

          return (
            <div
              key={bus.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectBus(bus.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectBus(bus.id);
              }}
              className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative flex flex-col justify-between shadow-none ${
                isSelected
                  ? 'border-amber-600 bg-amber-50/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-2 pr-6">
                  {hasValidPlate ? (
                    <span className="font-mono text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700 whitespace-nowrap">
                      {bus.bus_number}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                      Vehicle Plate on Trip Day
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center gap-1 whitespace-nowrap">
                    {isSleeper ? (
                      <Bed className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                    ) : (
                      <Armchair className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                    )}
                    <span>{bus.left_seats_per_row}x{bus.right_seats_per_row} {isSleeper ? 'Sleeper' : 'Pushback'} AC</span>
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-black text-slate-900 leading-snug">
                    {bus.name}
                  </h4>
                </div>

                {/* Capacity & Live Availability Strip */}
                <div className="mt-2.5 flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-600">
                    Coach Capacity: <strong className="text-slate-900">{bus.total_seats} Seats</strong>
                  </span>
                  <span className="text-[11px] font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-lg border border-emerald-300/80">
                    {bus.available_seats_count} Seats Available
                  </span>
                </div>

                {/* Coach Amenities */}
                {bus.amenities && bus.amenities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {bus.amenities.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                    {bus.amenities.length > 3 && (
                      <span className="text-[10px] font-bold text-slate-400 self-center">
                        +{bus.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Price footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Base Ticket Fare
                  </span>
                  <div className="text-base font-black text-slate-900">
                    ₹{bus.base_price.toLocaleString('en-IN')}
                    <span className="text-[11px] text-slate-400 font-normal"> / person</span>
                  </div>
                </div>

                {bus.upper_deck_price && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Upper Deck
                    </span>
                    <div className="text-xs font-black text-amber-700">
                      ₹{bus.upper_deck_price.toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
