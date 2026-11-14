import React, { useState } from 'react';
import { 
  ArrowLeft, Calendar, MapPin, Bus, ShieldCheck, CheckCircle2, 
  XCircle, Clock, Users, PhoneCall, MessageCircle, Star, Sparkles, 
  Share2, AlertCircle, HeartHandshake, Check, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react';
import { TourTrip, PublicSettings } from '../types';

interface TourDetailsPageProps {
  trip: TourTrip;
  settings: PublicSettings;
  onBackToCatalog: () => void;
  onSelectTripToBook: (trip: TourTrip, busId?: number) => void;
}

export const TourDetailsPage: React.FC<TourDetailsPageProps> = ({
  trip,
  settings,
  onBackToCatalog,
  onSelectTripToBook,
}) => {
  const [selectedBusIndex, setSelectedBusIndex] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeBus = trip.buses[selectedBusIndex] || trip.buses[0];
  const lowestPrice = trip.buses.length > 0 
    ? Math.min(...trip.buses.map((b) => b.base_price)) 
    : 2500;
  const totalAvailableSeats = trip.buses.reduce((acc, b) => acc + b.available_seats_count, 0);
  const hostName = trip.operator_name || 'Suresh Bhai (Official Sakinaka Admin)';
  const contactPhone = trip.contact_phone || settings.contact_phone || '+91 98200 45678';
  const cleanPhone = contactPhone.replace(/[^0-9]/g, '');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: trip.title,
        text: `Check out ${trip.title} organized by ${hostName} on Sakinaka Tour!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Standard exclusions for devotional & group tours
  const defaultExclusions = [
    'Personal shopping, pooja samagri & individual donations',
    'Extra room service or laundry at hotels',
    'Any entry ticket or ride not specified in the package',
    'Emergency medical expenses (first aid provided on coach)',
  ];

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
          <button
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-1.5 text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl font-bold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Packages</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 hidden sm:inline">{trip.category || 'Tours'}</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-slate-900 truncate max-w-[200px] sm:max-w-[320px] font-bold">
            {trip.title}
          </span>
        </div>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-all shadow-sm"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Share Tour</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Details on Left (8 cols), Sticky Buy Box on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* Left Column (8 cols): Deep Tour Details */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Hero Banner & Badges */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
            <div className="relative h-64 sm:h-80 md:h-96">
              <img
                src={trip.poster_image || '/Balaji_temple_in_ketkawla.jpg'}
                alt={trip.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/Balaji_temple_in_ketkawla.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-900/40" />

              {/* Floating Top Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow">
                  {trip.month_label}
                </span>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{trip.rating || 4.9}</span>
                    <span className="text-slate-300">({trip.review_count || 128} Reviews)</span>
                  </span>
                </div>
              </div>

              {/* Title & Dates Overlaid at bottom */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10 space-y-2 text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-400/30 text-xs font-black tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{trip.category || 'Spiritual Pilgrimage Yatra'}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black font-serif-heading tracking-tight leading-tight">
                  {trip.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200 pt-1">
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    {trip.start_date} – {trip.end_date}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Clock className="w-4 h-4 text-amber-400" />
                    {trip.duration_days || '3 Days / 2 Nights'}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    Boarding: Sakinaka, Mumbai
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* CRITICAL USER REQUIREMENT: Verified Organizer / Host Profile Card */}
          <div className="bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 rounded-3xl p-6 sm:p-7 border border-amber-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white shrink-0">
                  {hostName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                      Tour Host & Organizer
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Verified Partner
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-950 font-serif-heading mt-1">
                    {hostName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Official Tour Conductor & Sakinaka Yatra Management
                  </p>
                </div>
              </div>

              {/* Direct Host Contact Actions */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                  <span>Call Host</span>
                </a>
                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Namaste ${hostName}! Mujhe ${trip.title} ke baare mein jankari chahiye.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Host Trust Badges */}
            <div className="pt-3 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% On-Ground Yatra Support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sakinaka Fixed Boarding Point</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Family & Seniors Safe Environment</span>
              </div>
            </div>
          </div>

          {/* Tour Overview / Description */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Tour Highlights & Overview</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {trip.description || 'Yeh yatra vishesh roop se Sakinaka Mumbai aur aas-paas ke parivaron aur bhakton ke liye arrange ki gayi hai. Comfortable AC buses, samay par VIP darshan, aur swachh shakahari bhojan ki vyavastha shamil hai.'}
            </p>

            {/* Boarding Point Detailed Box */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Primary Boarding & Departure Location
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  {trip.pickup_location || 'Sakinaka Metro Station / 90 Feet Road, Andheri East, Mumbai'}
                </p>
                <p className="text-[11px] text-amber-800 font-semibold mt-1">
                  *Reporting time is 30 minutes before coach departure. Exact bus coordinates WhatsApp group mein share kiye jayenge.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Day-Wise Itinerary */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span>Day-by-Day Detailed Itinerary</span>
              </h2>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                {trip.itinerary && trip.itinerary.length > 0 ? `${trip.itinerary.length} Days Plan` : 'Full Schedule'}
              </span>
            </div>

            <div className="space-y-3">
              {(trip.itinerary && trip.itinerary.length > 0 ? trip.itinerary : [
                'Day 1: Departure from Sakinaka Mumbai, Highway breakfast stop, arrive at Ketkawla Balaji Temple, evening Aarti & hotel check-in.',
                'Day 2: Early morning darshan at Prati Balaji & Prati Shirdi, temple mahaprasad lunch, local sightseeing and spiritual bhajan sandhya.',
                'Day 3: Shirdi Sai Baba Samadhi darshan, shopping at Shirdi market, and comfortable return journey to Sakinaka Mumbai.'
              ]).map((dayText, index) => {
                const isExpanded = expandedDay === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedDay(isExpanded ? null : index)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/70 hover:bg-slate-100/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          D{index + 1}
                        </div>
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {dayText.split(':')[0] || `Day ${index + 1}`}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-white text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100">
                        {dayText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inclusions & Exclusions: E-Commerce Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Inclusions */}
            <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-black text-slate-900">What&apos;s Included</h3>
              </div>
              <ul className="space-y-2.5">
                {(trip.inclusions && trip.inclusions.length > 0 ? trip.inclusions : [
                  'AC Luxury Pushback Bus Transport',
                  'Clean Hotel Accommodation',
                  'Pure Veg Breakfast & Meals',
                  'VIP Darshan Entry Passes',
                  'Toll, Parking & Driver Charges',
                  'Dedicated Tour Coordinator',
                ]).map((inc, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusions */}
            <div className="bg-rose-50/50 rounded-3xl p-6 border border-rose-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-700" />
                <h3 className="text-base font-black text-slate-900">What&apos;s Not Included</h3>
              </div>
              <ul className="space-y-2.5">
                {defaultExclusions.map((exc, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                    <span className="w-4 h-4 text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Available Coach Layouts on this Tour */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Bus className="w-5 h-5 text-amber-600" />
              <span>Available Coaches & Layout Options</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trip.buses.map((bus, idx) => (
                <div
                  key={bus.id}
                  onClick={() => setSelectedBusIndex(idx)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    selectedBusIndex === idx
                      ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-sm">{bus.name}</span>
                      <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                        ₹{bus.base_price}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div>Type: {bus.bus_type.replace('_', ' ').toUpperCase()}</div>
                      <div>Total Seats: {bus.total_seats}</div>
                      <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{bus.available_seats_count} Seats Remaining</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Layout: 2x2 Pushback</span>
                    <span className="font-bold text-amber-700">
                      {selectedBusIndex === idx ? '✓ Selected Coach' : 'Click to Select'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Sticky E-Commerce Buy Box */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-400/80 shadow-xl space-y-6">
            
            {/* Price Header */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Starting All-Inclusive Fare
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  ₹{(activeBus?.base_price || lowestPrice).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500">/ devotee seat</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                ✓ Includes AC Bus + Meals + Hotel Stay + Darshan Pass
              </p>
            </div>

            {/* Inventory Status Indicator */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-900 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Live Seat Availability
                </span>
                <span className="text-slate-900">
                  {activeBus?.available_seats_count || totalAvailableSeats} Left
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(15, ((activeBus?.booked_seats_count || 1) / (activeBus?.total_seats || 45)) * 100))}%`
                  }}
                />
              </div>
            </div>

            {/* Selected Coach Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Choose Bus / Coach:
              </label>
              <select
                value={selectedBusIndex}
                onChange={(e) => setSelectedBusIndex(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {trip.buses.map((bus, idx) => (
                  <option key={bus.id} value={idx}>
                    {bus.name} — ₹{bus.base_price} ({bus.available_seats_count} seats left)
                  </option>
                ))}
              </select>
            </div>

            {/* PRIMARY USER REQUIREMENT: Direct /book or /booking link */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => onSelectTripToBook(trip, activeBus?.id)}
                className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm tracking-wide transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-amber-400"
              >
                <span>Select Seats & Book Now</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <p className="text-[11px] text-center text-slate-500">
                Opens the interactive live bus seat selector on <strong className="text-slate-700">/book</strong>
              </p>
            </div>

            {/* Helpline and Organizer Direct Line */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Need Help with Booking?
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Organizer Helpline:</span>
                <a href={`tel:${cleanPhone}`} className="text-amber-800 font-bold hover:underline">
                  {contactPhone}
                </a>
              </div>
            </div>

          </div>

          {/* Safe Booking Guarantee Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <HeartHandshake className="w-4 h-4 text-amber-600" />
              <span>Sakinaka Tour Devotee Assurance</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Every tour listed on this platform is verified for driver license, bus permit, hotel sanitization, and on-ground devotee safety.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

