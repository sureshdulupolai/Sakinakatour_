import React from 'react';
import { Calendar, Bus, CheckCircle2, ArrowRight, Sparkles, MapPin, ShieldCheck, PlusCircle, Clock } from 'lucide-react';
import { TourTrip } from '../types';

interface TourShowcaseSectionProps {
  trips: TourTrip[];
  isLoading?: boolean;
  onSelectTripToBook: (tripId: number) => void;
  onOrganizeTripClick?: () => void;
}

// Clean, high-performance skeleton loader with matching refined geometry (rounded-xl)
const TourCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between h-full animate-pulse">
    <div>
      {/* Top Banner Skeleton */}
      <div className="relative h-56 sm:h-60 bg-slate-200">
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="w-24 h-6 bg-slate-300 rounded-md" />
          <div className="w-28 h-6 bg-slate-300 rounded-md" />
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="w-40 h-5 bg-slate-300 rounded-md" />
        </div>
      </div>

      {/* Body Skeleton */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="space-y-2">
          <div className="w-3/4 h-6 bg-slate-200 rounded-md" />
          <div className="w-1/2 h-4 bg-slate-100 rounded" />
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="w-full h-3 bg-slate-100 rounded" />
          <div className="w-4/5 h-3 bg-slate-100 rounded" />
        </div>

        {/* Coach Skeleton */}
        <div className="space-y-2 pt-2">
          <div className="w-32 h-3 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="h-10 bg-slate-100 rounded-lg" />
            <div className="h-10 bg-slate-100 rounded-lg" />
          </div>
        </div>

        {/* Highlights Skeleton */}
        <div className="flex flex-wrap gap-2 pt-1">
          <div className="w-24 h-5 bg-slate-100 rounded-md" />
          <div className="w-24 h-5 bg-slate-100 rounded-md" />
          <div className="w-20 h-5 bg-slate-100 rounded-md" />
        </div>
      </div>
    </div>

    {/* Footer Skeleton */}
    <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
      <div className="space-y-1">
        <div className="w-16 h-3 bg-slate-200 rounded" />
        <div className="w-24 h-6 bg-slate-200 rounded-md" />
      </div>
      <div className="w-36 h-9 bg-slate-200 rounded-lg" />
    </div>
  </div>
);

export const TourShowcaseSection: React.FC<TourShowcaseSectionProps> = ({
  trips,
  isLoading = false,
  onSelectTripToBook,
  onOrganizeTripClick,
}) => {
  return (
    <section id="tours" className="py-14 sm:py-18 bg-slate-50/50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-100/70 border border-amber-300/80 text-amber-950 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Sakinaka Tour Packages</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-serif-heading tracking-tight">
            Hamare Upcoming Tours & Yatras
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Family trips, spiritual pilgrimages, friends/boys group tours aur festive yatras — pure saal sabhi prakar ke verified tours yahan uplabdh hain. Apna manpasand safar chunein aur apni family ya group ke liye seats book karein.
          </p>
        </div>

        {/* Content Section: Skeleton OR Cards OR Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <TourCardSkeleton />
            <TourCardSkeleton />
          </div>
        ) : trips.length === 0 ? (
          <div className="max-w-xl mx-auto text-center p-8 sm:p-10 rounded-xl border border-dashed border-slate-300 bg-white space-y-4">
            <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Bus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Filhaal Naye Tours Schedule Ho Rahe Hain
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Sakinaka se agle yatra batches jald hi update honge. Agar aapko apni family ya dosto ke group ke liye customize trip organize karni hai, toh aaj hi humse contact karein.
            </p>
            {onOrganizeTripClick && (
              <button
                onClick={onOrganizeTripClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Organize / List Your Tour</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch notranslate" translate="no">
            {trips.map((trip) => {
              const lowestPrice = trip.buses.length > 0 
                ? Math.min(...trip.buses.map((b) => b.base_price))
                : 2500;
              const totalAvailableSeats = trip.buses.reduce((acc, b) => acc + b.available_seats_count, 0);

              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-amber-400 transition-colors duration-200 flex flex-col justify-between overflow-hidden group h-full"
                >
                  <div>
                    {/* Top Tour Banner / Image */}
                    <div className="relative h-56 sm:h-64 bg-slate-900 overflow-hidden shrink-0">
                      <img
                        src={trip.poster_image || '/Balaji_temple_in_ketkawla.jpg'}
                        alt={trip.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out opacity-95"
                        onError={(e) => {
                          e.currentTarget.src = "/Balaji_temple_in_ketkawla.jpg";
                        }}
                      />
                      
                      {/* Subtle Dark Bottom Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                      {/* Top Badges: Clean, Refined & Compact */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                        <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wide">
                          {trip.month_label}
                        </span>

                        {totalAvailableSeats > 0 ? (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-700/90 text-white text-xs font-semibold shrink-0 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                            {totalAvailableSeats} Seats Available
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-rose-700 text-white text-xs font-semibold shrink-0">
                            Fast Filling
                          </span>
                        )}
                      </div>

                      {/* Bottom Banner Location Pill */}
                      <div className="absolute bottom-3 left-3 right-3 z-10">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/75 backdrop-blur-sm text-slate-200 text-xs font-medium border border-white/10">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Direct Departure: Sakinaka, Mumbai</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6 space-y-4">
                      
                      {/* Title & Metadata */}
                      <div className="space-y-1.5">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif-heading line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors">
                          {trip.title}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 pt-0.5">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            {trip.start_date} to {trip.end_date}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                            <Bus className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            {trip.buses.length} Verified Coaches
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                        {trip.description || 'Verified devotional and family group tour with verified AC coaches, clean hotel accommodations, and dedicated yatra management.'}
                      </p>

                      {/* Coach Options & Fare Preview */}
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Coach Layouts & Fares</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {trip.buses.map((bus) => (
                            <div 
                              key={bus.id} 
                              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Bus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span className="font-semibold text-slate-800 truncate">{bus.name}</span>
                              </div>
                              <span className="font-bold text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded text-[11px] shrink-0 border border-emerald-200/60">
                                ₹{bus.base_price}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Package Inclusions */}
                      {trip.inclusions && trip.inclusions.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex flex-wrap gap-1.5">
                            {trip.inclusions.slice(0, 4).map((inc, i) => (
                              <span 
                                key={i} 
                                className="text-[11px] font-medium text-slate-700 bg-slate-100/80 border border-slate-200/60 px-2.5 py-0.5 rounded-md flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3 text-amber-600 shrink-0" />
                                <span className="truncate max-w-[200px]">{inc}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Card Footer: Starting Price & Clean Action Button */}
                  <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Starting Fare
                      </span>
                      <div className="text-xl font-extrabold text-slate-900 leading-none">
                        ₹{lowestPrice.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-slate-500 ml-1">/ seat</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectTripToBook(trip.id)}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition-colors shrink-0"
                    >
                      <span>View Coaches & Book</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
