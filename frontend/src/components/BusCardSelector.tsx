import React from 'react';
import { Bus, Armchair, Bed, Shield, Sparkles, Check } from 'lucide-react';
import { BusSummary } from '../types';

interface BusCardSelectorProps {
  buses: BusSummary[];
  selectedBusId: number;
  onSelectBus: (busId: number) => void;
}

export const BusCardSelector: React.FC<BusCardSelectorProps> = ({
  buses,
  selectedBusId,
  onSelectBus,
}) => {
  if (buses.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
        No buses configured for this tour yet. Admin can add buses from the Admin Portal.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          2. Select Bus Coach
        </h3>
        <span className="text-xs text-slate-400">
          {buses.length} Coaches available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buses.map((bus) => {
          const isSelected = bus.id === selectedBusId;
          const isSleeper = bus.has_upper_deck || bus.bus_type.includes('sleeper');

          return (
            <div
              key={bus.id}
              onClick={() => onSelectBus(bus.id)}
              className={`cursor-pointer p-5 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-600 bg-white ring-1 ring-amber-600/30'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {bus.bus_number}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 flex items-center gap-1">
                    {isSleeper ? <Bed className="w-3 h-3 text-amber-700" /> : <Armchair className="w-3 h-3 text-amber-700" />}
                    {bus.left_seats_per_row}x{bus.right_seats_per_row} {isSleeper ? 'Sleeper' : 'Seater'}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900">{bus.name}</h4>

                {/* Available seats indicator */}
                <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-600">
                    Total: <span className="font-semibold">{bus.total_seats} Seats</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    {bus.available_seats_count} Available
                  </div>
                </div>

                {/* Amenities pills */}
                {bus.amenities && bus.amenities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {bus.amenities.slice(0, 3).map((am, i) => (
                      <span key={i} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {am}
                      </span>
                    ))}
                    {bus.amenities.length > 3 && (
                      <span className="text-[11px] font-medium text-slate-400 self-center">
                        +{bus.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Price footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase">Base Price</span>
                  <div className="text-lg font-extrabold text-slate-900">
                    ₹{bus.base_price.toLocaleString('en-IN')}
                    <span className="text-xs text-slate-400 font-normal"> / seat</span>
                  </div>
                </div>
                {bus.upper_deck_price && (
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 uppercase">Upper Deck</span>
                    <div className="text-sm font-bold text-amber-700">
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

