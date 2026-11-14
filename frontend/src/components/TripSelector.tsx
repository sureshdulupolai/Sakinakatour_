import React from 'react';
import { Calendar, Compass, Check, MapPin } from 'lucide-react';
import { TourTrip } from '../types';

interface TripSelectorProps {
  trips: TourTrip[];
  selectedTripId: number;
  onSelectTrip: (tripId: number) => void;
  hideHeader?: boolean;
}

export const TripSelector: React.FC<TripSelectorProps> = ({
  trips,
  selectedTripId,
  onSelectTrip,
  hideHeader = false,
}) => {
  if (trips.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-black flex items-center justify-center">
              1
            </span>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Select Yatra / Tour
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {trips.length} Tour{trips.length > 1 ? 's' : ''} Listed
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5">
        {trips.map((trip) => {
          const isSelected = trip.id === selectedTripId;
          return (
            <button
              key={trip.id}
              type="button"
              onClick={() => onSelectTrip(trip.id)}
              className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all relative shadow-none ${
                isSelected
                  ? 'border-amber-600 bg-amber-50/40'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                      isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {trip.month_label}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    {trip.buses.length} Luxury Coach{trip.buses.length > 1 ? 'es' : ''}
                  </span>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <div className="font-bold text-slate-900 text-sm line-clamp-1">
                {trip.title}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1.5 font-medium">
                <span className="flex items-center gap-1 text-slate-700">
                  <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>{trip.start_date} – {trip.end_date}</span>
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>Sakinaka Departure</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
