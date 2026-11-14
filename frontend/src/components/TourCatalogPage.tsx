import React, { useState, useMemo } from 'react';
import { 
  Search, SlidersHorizontal, MapPin, Calendar, Bus, CheckCircle2, 
  ArrowRight, Sparkles, Star, UserCheck, ShieldCheck, Clock, 
  Filter, Tag, ChevronRight, Eye, PhoneCall, PlusCircle
} from 'lucide-react';
import { TourTrip } from '../types';

interface TourCatalogPageProps {
  trips: TourTrip[];
  isLoading?: boolean;
  onSelectTripToBook: (trip: TourTrip) => void;
  onViewTripDetails: (trip: TourTrip) => void;
  onNavigateToOrganize: () => void;
}

export const TourCatalogPage: React.FC<TourCatalogPageProps> = ({
  trips,
  isLoading = false,
  onSelectTripToBook,
  onViewTripDetails,
  onNavigateToOrganize,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'date'>('featured');
  const [hostFilter, setHostFilter] = useState<string>('all');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    trips.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return ['all', ...Array.from(set)];
  }, [trips]);

  // Extract unique hosts
  const hosts = useMemo(() => {
    const set = new Set<string>();
    trips.forEach((t) => {
      if (t.operator_name) set.add(t.operator_name);
    });
    return ['all', ...Array.from(set)];
  }, [trips]);

  // Filter and sort trips
  const filteredTrips = useMemo(() => {
    let result = [...trips];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.operator_name && t.operator_name.toLowerCase().includes(q)) ||
          (t.pickup_location && t.pickup_location.toLowerCase().includes(q)) ||
          (t.itinerary && t.itinerary.some((step) => step.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Host filter
    if (hostFilter !== 'all') {
      result = result.filter((t) => t.operator_name === hostFilter);
    }

    // Sorting
    if (sortBy === 'price_low') {
      result.sort((a, b) => {
        const pA = a.buses.length > 0 ? Math.min(...a.buses.map((bus) => bus.base_price)) : 0;
        const pB = b.buses.length > 0 ? Math.min(...b.buses.map((bus) => bus.base_price)) : 0;
        return pA - pB;
      });
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => {
        const pA = a.buses.length > 0 ? Math.max(...a.buses.map((bus) => bus.base_price)) : 0;
        const pB = b.buses.length > 0 ? Math.max(...b.buses.map((bus) => bus.base_price)) : 0;
        return pB - pA;
      });
    } else if (sortBy === 'date') {
      result.sort((a, b) => a.id - b.id);
    }

    return result;
  }, [trips, searchQuery, selectedCategory, hostFilter, sortBy]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner: E-Commerce Catalog style */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400 to-transparent pointer-events-none" />
        
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tour Marketplace & Packages</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-serif-heading tracking-tight leading-tight">
            Explore All Listed Tours & Yatras
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Sakinaka Mumbai se direct AC coaches, verified mandal organizers, transparent seat layouts aur darshan packages. Apni family ya group ke liye pasandeeda tour chunein.
          </p>
        </div>

        {/* Action bar inside banner */}
        <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
          <button
            onClick={onNavigateToOrganize}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List Your Own Tour (Partner Studio)</span>
          </button>
          <span className="text-xs text-slate-400">
            {trips.length} Verified tours live on platform
          </span>
        </div>
      </div>

      {/* Search, Filter & Sort Controls Ribbon */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        
        {/* Row 1: Search Bar + Sort dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by destination, temple name, city, or organizer..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-600">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="featured">Featured / Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="date">Upcoming Batches</option>
            </select>
          </div>

        </div>

        {/* Row 2: Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}

          {/* Host Filter if multiple */}
          {hosts.length > 2 && (
            <div className="ml-auto flex items-center gap-1 shrink-0 pl-2 border-l border-slate-200">
              <span className="text-[11px] font-bold text-slate-400">Host:</span>
              <select
                value={hostFilter}
                onChange={(e) => setHostFilter(e.target.value)}
                className="px-2 py-1 rounded border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="all">All Organizers</option>
                {hosts.filter((h) => h !== 'all').map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          )}
        </div>

      </div>

      {/* Results Count & Badges */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900">{filteredTrips.length}</strong> tours available for booking
        </span>
        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-amber-700 hover:underline font-bold"
          >
            Reset Category Filter
          </button>
        )}
      </div>

      {/* Main Grid: Tour Cards */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <Bus className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Koi Tour Match Nahi Hua</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Aapke search query &quot;{searchQuery}&quot; ke liye koi tour nahi mila. Dusra keyword search karein ya naya tour list karein.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setHostFilter('all');
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Filters Clear Karein
            </button>
            <button
              onClick={onNavigateToOrganize}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
            >
              List Your Tour
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          {filteredTrips.map((trip) => {
            const lowestPrice = trip.buses.length > 0
              ? Math.min(...trip.buses.map((b) => b.base_price))
              : 2500;
            const totalAvailableSeats = trip.buses.reduce((acc, b) => acc + b.available_seats_count, 0);
            const hostName = trip.operator_name || 'Suresh Bhai (Official Sakinaka Admin)';

            return (
              <div
                key={trip.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-amber-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group h-full"
              >
                <div>
                  
                  {/* Tour Banner with Badges */}
                  <div className="relative h-52 bg-slate-900 overflow-hidden shrink-0">
                    <img
                      src={trip.poster_image || '/Balaji_temple_in_ketkawla.jpg'}
                      alt={trip.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={(e) => {
                        e.currentTarget.src = '/Balaji_temple_in_ketkawla.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/40" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow">
                        {trip.month_label}
                      </span>

                      {totalAvailableSeats > 0 ? (
                        <button
                          type="button"
                          onClick={() => onSelectTripToBook(trip)}
                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1.5 shadow transition-all cursor-pointer"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                          <span>{totalAvailableSeats} Seats Available</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[11px] font-bold shadow">
                          Fast Filling
                        </span>
                      )}
                    </div>

                    {/* Bottom Specs Ribbon */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-10 text-[11px] text-white">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 font-bold">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{trip.duration_days || '3 Days / 2 Nights'}</span>
                      </div>

                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 font-bold text-amber-300">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{trip.rating || 4.9}</span>
                        <span className="text-slate-400">({trip.review_count || 128})</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-4">
                    
                    {/* CRITICAL USER REQUIREMENT: Show who listed the tour (Admin or Partner) */}
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/70 border border-amber-200/80">
                      <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                        {hostName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block leading-tight">
                          Listed by Tour Host:
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {hostName}
                          </span>
                          <span title="Verified Tour Organizer">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <h3 
                        onClick={() => onViewTripDetails(trip)}
                        className="text-lg font-black text-slate-950 font-serif-heading line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors cursor-pointer"
                      >
                        {trip.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>{trip.start_date} – {trip.end_date}</span>
                      </div>
                    </div>

                    {/* Departure Location */}
                    <div className="flex items-start gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{trip.pickup_location || 'Sakinaka Metro, Andheri East, Mumbai'}</span>
                    </div>

                    {/* Inclusions Chips */}
                    {trip.inclusions && trip.inclusions.length > 0 && (
                      <div className="pt-1">
                        <div className="flex flex-wrap gap-1.5">
                          {trip.inclusions.slice(0, 3).map((inc, i) => (
                            <span 
                              key={i} 
                              className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[140px]">{inc}</span>
                            </span>
                          ))}
                          {trip.inclusions.length > 3 && (
                            <span className="text-[11px] font-bold text-slate-400 self-center">
                              +{trip.inclusions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Prominent Live Available Seats Selector Ribbon */}
                    <div
                      onClick={() => onSelectTripToBook(trip)}
                      className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 transition-all cursor-pointer flex items-center justify-between gap-3 group/seat"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          <Bus className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 leading-tight">
                            Live Seating Status
                          </div>
                          <div className="text-xs font-black text-slate-900">
                            {totalAvailableSeats > 0 ? `${totalAvailableSeats} Seats Available` : 'Waitlist Only'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-emerald-800 bg-white border border-emerald-300 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 group-hover/seat:bg-emerald-700 group-hover/seat:text-white transition-colors">
                        <span>Select Seat</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                  </div>
                </div>

                {/* Card Footer: Pricing & Actions */}
                <div className="px-5 sm:px-6 py-4 bg-slate-50/90 border-t border-slate-100 flex flex-col gap-3">
                  
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        All-Inclusive Fare
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-black text-slate-950 tracking-tight">
                          ₹{lowestPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500 font-normal">/ seat</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      No Hidden Taxes
                    </span>
                  </div>

                  {/* Dual CTA: View Details & Book Seats */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onViewTripDetails(trip)}
                      className="px-3 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-white text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Tour Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectTripToBook(trip)}
                      className="px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                    >
                      <Bus className="w-3.5 h-3.5" />
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
  );
};

