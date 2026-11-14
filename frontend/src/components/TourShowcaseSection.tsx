import React from 'react';
import { Calendar, MapPin, Bus, CheckCircle2, ArrowRight, Sparkles, Clock, Bed } from 'lucide-react';
import { TourTrip } from '../types';

interface TourShowcaseSectionProps {
  trips: TourTrip[];
  onSelectTripToBook: (tripId: number) => void;
}

export const TourShowcaseSection: React.FC<TourShowcaseSectionProps> = ({
  trips,
  onSelectTripToBook,
}) => {
  return (
    <section id="tours" className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Sakinaka Tour Packages</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-serif-heading">
            Hamare Upcoming Tours & Yatras
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Family trips, spiritual pilgrimages, friends/boys group tours aur festive yatras — pure saal sabhi prakar ke verified tours yahan uplabdh hain. 
            Apna manpasand safar chunein aur apni family ya group ke liye seats book karein.
          </p>
        </div>

        {/* Tour Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {trips.map((trip) => {
            // Find lowest base price among buses
            const lowestPrice = trip.buses.length > 0 
              ? Math.min(...trip.buses.map((b) => b.base_price))
              : 2500;
            const totalAvailableSeats = trip.buses.reduce((acc, b) => acc + b.available_seats_count, 0);

            return (
              <div
                key={trip.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Top Tour Banner / Image */}
                  <div className="relative h-56 bg-slate-900 overflow-hidden">
                    <img
                      src={trip.poster_image || '/Balaji_temple_in_ketkawla.jpg'}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                      onError={(e) => {
                        e.currentTarget.src = "/Balaji_temple_in_ketkawla.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                    
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                        {trip.month_label}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                        {totalAvailableSeats} Seats Available
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold font-serif-heading line-clamp-1">
                        {trip.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-amber-200 mt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {trip.start_date} to {trip.end_date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Bus className="w-3.5 h-3.5" />
                          {trip.buses.length} Buses Configured
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {trip.description}
                    </p>

                    {/* Buses overview */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Available Coach Types
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {trip.buses.map((bus) => (
                          <div key={bus.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Bus className="w-3.5 h-3.5 text-amber-700" />
                              <span className="font-semibold text-slate-800 line-clamp-1">{bus.name}</span>
                            </div>
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                              ₹{bus.base_price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Inclusions pills */}
                    {trip.inclusions && trip.inclusions.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Package Highlights Included
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {trip.inclusions.slice(0, 4).map((inc, i) => (
                            <span key={i} className="text-xs font-medium text-slate-700 bg-amber-50/80 border border-amber-200/60 px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>{inc}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Price & Book CTA */}
                <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Starting Price</span>
                    <div className="text-xl font-black text-slate-900">
                      ₹{lowestPrice.toLocaleString('en-IN')}
                      <span className="text-xs text-slate-400 font-normal"> / seat</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTripToBook(trip.id)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all hover:scale-[1.02]"
                  >
                    <span>View Bus & Book Seats</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

