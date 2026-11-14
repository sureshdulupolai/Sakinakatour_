import React from 'react';
import { Calendar, Compass } from 'lucide-react';
import { TourTrip } from '../types';

interface TripSelectorProps {
  trips: TourTrip[];
  selectedTripId: number;
  onSelectTrip: (tripId: number) => void;
}

export const TripSelector: React.FC<TripSelectorProps> = ({
  trips,
  selectedTripId,
  onSelectTrip,
}) => {
  if (trips.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          1. Select Tour Package
        </h3>
        <span className="text-xs text-slate-400">Choose departure month</span>
      </div>

      <div className="flex flex-wrap gap-3">
        {trips.map((trip) => {
          const isSelected = trip.id === selectedTripId;
          return (
            <button
              key={trip.id}
              onClick={() => onSelectTrip(trip.id)}
              className={`flex-1 min-w-[260px] text-left p-4 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-amber-600 bg-amber-50/60 ring-1 ring-amber-600/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {trip.month_label}
                </span>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  {trip.buses.length} Buses
                </span>
              </div>

              <div className="font-bold text-slate-900 text-sm line-clamp-1">
                {trip.title}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{trip.start_date} to {trip.end_date}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

