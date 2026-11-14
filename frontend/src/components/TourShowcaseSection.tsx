import React from 'react';
import { Calendar, Bus, CheckCircle2, ArrowRight, Sparkles, MapPin, ShieldCheck, PlusCircle, Eye, ArrowUpRight } from 'lucide-react';
import { TourTrip } from '../types';

interface TourShowcaseSectionProps {
  trips: TourTrip[];
  isLoading?: boolean;
  onSelectTripToBook: (trip: TourTrip) => void;
  onViewTripDetails?: (trip: TourTrip) => void;
  onExploreAllTours?: () => void;
  onOrganizeTripClick?: () => void;
}

// Clean, high-performance skeleton loader
const TourCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between h-full animate-pulse">
    <div>
      <div className="relative h-52 bg-slate-200">
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="w-24 h-6 bg-slate-300 rounded-md" />
          <div className="w-28 h-6 bg-slate-300 rounded-md" />
        </div>
      </div>
      <div className="p-5 sm:p-6 space-y-4">
        <div className="w-3/4 h-7 bg-slate-200 rounded-md" />
        <div className="w-1/2 h-4 bg-slate-100 rounded" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-10 bg-slate-100 rounded-lg" />
        </div>
      </div>
    </div>
    <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
      <div className="w-24 h-8 bg-slate-200 rounded-md" />
      <div className="w-40 h-10 bg-slate-200 rounded-xl" />
    </div>
  </div>
);

export const TourShowcaseSection: React.FC<TourShowcaseSectionProps> = ({
  trips,
  isLoading = false,
  onSelectTripToBook,
  onViewTripDetails,
  onExploreAllTours,
  onOrganizeTripClick,
}) => {
  return (
    <section id="tours" className="py-10 sm:py-14 bg-slate-50/60 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Bold, Full Width & No Orphan Lines */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Sakinaka Tour Packages</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 font-serif-heading tracking-tight text-balance">
              Hamare Upcoming Tours & Yatras
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Family trips, spiritual pilgrimages, friends/boys group tours aur festive yatras — pure saal sabhi prakar ke verified tours yahan uplabdh hain. Apna manpasand safar chunein aur apni family ya group ke liye seats book karein.
            </p>
          </div>

          {onExploreAllTours && (
            <div className="shrink-0 flex items-center gap-3">
              <button
                type="button"
                onClick={onExploreAllTours}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all shadow-sm"
              >
                <span>View All Tours Catalog</span>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          )}
        </div>

        {/* Content Section: Skeleton OR Cards OR Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <TourCardSkeleton />
            <TourCardSkeleton />
          </div>
        ) : trips.length === 0 ? (
          <div className="max-w-md mx-auto text-center p-8 rounded-2xl border border-dashed border-slate-300 bg-white space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Bus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Filhaal Naye Tours Schedule Ho Rahe Hain
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sakinaka se agle yatra batches jald hi update honge. Custom group tour organize karne ke liye aaj hi contact karein.
            </p>
            {onOrganizeTripClick && (
              <button
                onClick={onOrganizeTripClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Organize / List Your Tour</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch notranslate" translate="no">
            {trips.map((trip) => {
              const lowestPrice = trip.buses.length > 0 
                ? Math.min(...trip.buses.map((b) => b.base_price))
                : 2500;
              const totalAvailableSeats = trip.buses.reduce((acc, b) => acc + b.available_seats_count, 0);

              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400 transition-colors duration-200 flex flex-col justify-between overflow-hidden group h-full"
                >
                  <div>
                    {/* Top Tour Banner / Image */}
                    <div className="relative h-48 sm:h-52 bg-slate-900 overflow-hidden shrink-0">
                      <img
                        src={trip.poster_image || '/Balaji_temple_in_ketkawla.jpg'}
                        alt={trip.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out opacity-95"
                        onError={(e) => {
                          e.currentTarget.src = "/Balaji_temple_in_ketkawla.jpg";
                        }}
                      />
                      
                      {/* Dark Gradient Overlay for High Contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/40" />

                      {/* Top Badges: Clear, Bold & Visible */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                        <span className="px-3 py-1 rounded-md bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                          {trip.month_label}
                        </span>

                        {totalAvailableSeats > 0 ? (
                          <button
                            type="button"
                            onClick={() => onSelectTripToBook(trip)}
                            className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer shadow"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                            <span>{totalAvailableSeats} Seats Available</span>
                          </button>
                        ) : (
                          <span className="px-3 py-1 rounded-md bg-rose-600 text-white text-xs font-bold shrink-0">
                            Fast Filling / Waitlist
                          </span>
                        )}
                      </div>

                      {/* Bottom Banner Location Pill */}
                      <div className="absolute bottom-3 left-3 right-3 z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/70 backdrop-blur-md text-slate-200 text-xs font-semibold border border-white/10">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Direct Departure: Sakinaka, Mumbai</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body: Prominent Typography & Strong Contrast */}
                    <div className="p-5 sm:p-6 space-y-4">
                      
                      {/* CRITICAL USER REQUIREMENT: Show who listed the tour (Admin or Partner) */}
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/80 border border-amber-200/80">
                        <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                          {(trip.operator_name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block leading-tight">
                            Listed by Tour Host:
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate block">
                            {trip.operator_name || 'Suresh Bhai (Official Sakinaka Admin)'}
                          </span>
                        </div>
                        <span title="Verified Tour Organizer">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </span>
                      </div>

                      {/* Trip Title: BOLD & PROMINENT */}
                      <div className="space-y-1.5">
                        <h3 
                          onClick={() => onViewTripDetails && onViewTripDetails(trip)}
                          className="text-xl sm:text-2xl font-black text-slate-900 font-serif-heading line-clamp-2 leading-tight group-hover:text-amber-700 transition-colors cursor-pointer"
                        >
                          {trip.title}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-700 pt-0.5">
                          <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                            <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                            {trip.start_date} – {trip.end_date}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600">
                            <Bus className="w-4 h-4 text-amber-700 shrink-0" />
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
                              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition-colors flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Bus className="w-4 h-4 text-amber-700 shrink-0" />
                                <span className="font-bold text-slate-900 truncate text-xs">{bus.name}</span>
                              </div>
                              <span className="font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md text-xs shrink-0 border border-emerald-300/80">
                                ₹{bus.base_price}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Package Inclusions: Bold Verified Chips */}
                      {trip.inclusions && trip.inclusions.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex flex-wrap gap-1.5">
                            {trip.inclusions.slice(0, 4).map((inc, i) => (
                              <span 
                                key={i} 
                                className="text-xs font-semibold text-slate-800 bg-amber-50/80 border border-amber-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="truncate max-w-[200px]">{inc}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Card Footer: Starting Price BOLD & Prominent Dual CTA Buttons */}
                  <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        All-Inclusive Fare
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-none mt-0.5">
                        ₹{lowestPrice.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-slate-500 ml-1">/ person</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onViewTripDetails && (
                        <button
                          type="button"
                          onClick={() => onViewTripDetails(trip)}
                          className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-white text-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                          <span>Tour Details</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSelectTripToBook(trip)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 shadow-sm"
                      >
                        <Bus className="w-4 h-4" />
                        <span>Select Seats</span>
                      </button>
                    </div>
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
