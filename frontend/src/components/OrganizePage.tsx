import React, { useState } from 'react';
import { 
  Bus, Sparkles, CheckCircle2, MessageCircle, PhoneCall, ArrowLeft, 
  Send, ShieldCheck, Laptop, Users, Calendar, MapPin, Check, 
  DollarSign, Tag, Clock, Eye, AlertCircle, PlusCircle, ArrowRight
} from 'lucide-react';
import { PublicSettings, PartnerTourPayload } from '../types';
import { createPartnerTour } from '../services/api';

interface OrganizePageProps {
  settings: PublicSettings;
  onBackToHome: () => void;
  onNavigateToBook: (tripId?: number) => void;
  onNavigateToCatalog: () => void;
  onTourCreated?: () => void;
}

export const OrganizePage: React.FC<OrganizePageProps> = ({
  settings,
  onBackToHome,
  onNavigateToBook,
  onNavigateToCatalog,
  onTourCreated,
}) => {
  const whatsappUrl = settings.whatsapp_group_link || 'https://chat.whatsapp.com/G51k2L4x9diwaliYatraGroup';
  const organizerPhone = settings.contact_phone || '+91 98200 45678';

  // Tabs: 'create' for self-service listing studio, 'inquiry' for contact
  const [activeTab, setActiveTab] = useState<'create' | 'benefits'>('create');

  // Form State for listing a tour
  const [formData, setFormData] = useState({
    title: '',
    category: 'Spiritual Pilgrimage',
    operator_name: '',
    contact_phone: '',
    month_label: 'Dec 2026 Special Batch',
    start_date: '15 Dec 2026',
    end_date: '17 Dec 2026',
    duration_days: '3 Days / 2 Nights',
    pickup_location: 'Sakinaka Metro, Andheri East, Mumbai',
    base_price: 2500,
    bus_name: 'Coach 1 - Luxury AC 2x2',
    bus_type: 'seater_2x2',
    total_rows: 10,
    description: '',
    itinerary_day1: 'Day 1: Departure from Sakinaka Mumbai, breakfast stop, journey to temple destination & hotel check-in.',
    itinerary_day2: 'Day 2: Morning VIP Darshan, temple prasad lunch, local sightseeing and spiritual bhajan sandhya.',
    itinerary_day3: 'Day 3: Morning Aarti, local shopping, and comfortable return journey back to Sakinaka Mumbai.',
    inclusions: [
      'AC Pushback Seating Bus',
      'Hotel Stay (Twin/Triple Sharing)',
      'Pure Veg Meals & Bottled Water',
      'VIP Darshan Passes',
      'Toll, Parking & Dedicated Guide',
    ],
  });

  const [loading, setLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle inclusion toggle
  const toggleInclusion = (inc: string) => {
    if (formData.inclusions.includes(inc)) {
      setFormData({
        ...formData,
        inclusions: formData.inclusions.filter((item) => item !== inc),
      });
    } else {
      setFormData({
        ...formData,
        inclusions: [...formData.inclusions, inc],
      });
    }
  };

  const handlePublishTour = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim()) {
      setErrorMessage('Kripya Tour Title zaroor enter karein.');
      return;
    }
    if (!formData.operator_name.trim()) {
      setErrorMessage('Kripya apna Partner / Mandal / Host Name zaroor bharein (yeh tour card par show hoga).');
      return;
    }
    if (!formData.contact_phone.trim()) {
      setErrorMessage('Kripya Contact Mobile Number zaroor dalein.');
      return;
    }

    setLoading(true);
    try {
      const payload: PartnerTourPayload = {
        title: formData.title,
        category: formData.category,
        month_label: formData.month_label,
        start_date: formData.start_date,
        end_date: formData.end_date,
        duration_days: formData.duration_days,
        pickup_location: formData.pickup_location,
        operator_name: formData.operator_name,
        contact_phone: formData.contact_phone,
        description: formData.description || `Special group tour organized by ${formData.operator_name} departing from ${formData.pickup_location}. Includes comfortable AC travel, hotel stay, and guided darshan.`,
        itinerary: [
          formData.itinerary_day1,
          formData.itinerary_day2,
          formData.itinerary_day3,
        ].filter(Boolean),
        inclusions: formData.inclusions,
        bus_name: formData.bus_name,
        bus_type: formData.bus_type,
        total_rows: Number(formData.total_rows) || 10,
        base_price: Number(formData.base_price) || 2500,
        poster_image: '/Balaji_temple_in_ketkawla.jpg',
      };

      const res = await createPartnerTour(payload);
      setCreatedResult(res);
      if (onTourCreated) {
        onTourCreated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Tour list karne mein error aayi. Kripya check karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-300">
      
      {/* Top Header & Breadcrumb */}
      <div className="border-b border-slate-200/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-3xl space-y-3">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3.5 py-1.5 rounded-xl transition-all mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/90 text-amber-950 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Tour Partners & Organizers Studio</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 font-serif-heading tracking-tight leading-tight">
            Apna Khud Ka Tour List Karein
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            Agar aap koi Mandal, travel agency, bus operator ya group organizer hain, toh yahan apna tour list karein. Aapka naam show hoga aur devotees online bus seating select karke book kar sakenge.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'create'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            List Tour Studio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('benefits')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'benefits'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Partner Benefits & FAQ
          </button>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION STATE */}
      {createdResult ? (
        <div className="bg-emerald-50 rounded-3xl p-8 sm:p-12 border-2 border-emerald-300 max-w-2xl mx-auto text-center space-y-6 shadow-lg animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-3 py-1 rounded-full">
              Tour Successfully Published!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif-heading">
              Aapka Tour Platform Par Live Ho Gaya Hai!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Organized by <strong className="text-slate-900">{createdResult.operator_name}</strong>. Bus seating layout aur pricing live set ho chuki hai.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigateToBook(createdResult.trip_id)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <Bus className="w-4 h-4" />
              <span>Open Live Seat Selector (/book)</span>
            </button>

            <button
              onClick={onNavigateToCatalog}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>View in Tour Catalog</span>
            </button>

            <button
              onClick={() => {
                setCreatedResult(null);
                setFormData({
                  ...formData,
                  title: '',
                  operator_name: '',
                  contact_phone: '',
                });
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-bold"
            >
              + Dusra Tour List Karein
            </button>
          </div>
        </div>
      ) : activeTab === 'create' ? (
        
        /* SELF-SERVICE LISTING STUDIO */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Bus className="w-5 h-5 text-amber-600" />
                <span>Tour Partner Listing Form</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Yeh form bhar kar submit karein — aapka tour turant catalog aur seating chart par live ho jayega.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handlePublishTour} className="space-y-5">
              
              {/* Row 1: Tour Title */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                  Tour Title / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nashik Trimbakeshwar & Shirdi Special Maha Yatra"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                />
              </div>

              {/* Row 2: Host Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Organizer / Host Name * (Card par show hoga)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil / Shree Balaji Travels"
                    value={formData.operator_name}
                    onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Tour Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Spiritual Pilgrimage">Spiritual Pilgrimage / Yatra</option>
                    <option value="Family Special">Family Special Tour</option>
                    <option value="Weekend Getaway">Weekend Getaway</option>
                    <option value="Festive Special">Festive / Diwali Special</option>
                    <option value="Hill Station & Leisure">Hill Station & Leisure</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Contact Phone & Fare */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Contact Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9820045678"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Base Fare per Seat (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    step={50}
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Row 4: Travel Dates & Month Label */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Batch Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dec 2026 Batch"
                    value={formData.month_label}
                    onChange={(e) => setFormData({ ...formData, month_label: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Dec 2026"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 17 Dec 2026"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Row 5: Boarding Location & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Boarding & Pickup Point
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sakinaka Metro Station, Andheri East"
                    value={formData.pickup_location}
                    onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Days / 2 Nights"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Row 6: Bus Coach Configuration */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                    Bus Seating Layout Setup (Auto-Generated 2x2 Pushback)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Coach Name / Description
                    </label>
                    <input
                      type="text"
                      value={formData.bus_name}
                      onChange={(e) => setFormData({ ...formData, bus_name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Total Rows (10 rows = 45 seats)
                    </label>
                    <select
                      value={formData.total_rows}
                      onChange={(e) => setFormData({ ...formData, total_rows: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    >
                      <option value={8}>8 Rows (37 Seats 2x2)</option>
                      <option value={10}>10 Rows (45 Seats 2x2 Standard)</option>
                      <option value={11}>11 Rows (49 Seats 2x2)</option>
                      <option value={12}>12 Rows (53 Seats 2x2)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 7: Package Inclusions */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Package Inclusions (Select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    'AC Pushback Seating Bus',
                    'Hotel Stay (Twin/Triple Sharing)',
                    'Pure Veg Meals & Bottled Water',
                    'VIP Darshan Passes',
                    'Toll, Parking & Dedicated Guide',
                    'Morning Tea & Breakfast',
                  ].map((inc) => (
                    <label
                      key={inc}
                      className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.inclusions.includes(inc)}
                        onChange={() => toggleInclusion(inc)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-semibold text-slate-800">{inc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span>Publishing Tour & Seating Chart...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Publish & List This Tour Live</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Live Real-time Card Preview (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>Live Tour Card Preview (Devotee View)</span>
            </div>

            {/* Preview Card */}
            <div className="bg-white rounded-3xl border-2 border-amber-400 overflow-hidden shadow-lg space-y-4">
              <div className="relative h-48 bg-slate-900">
                <img
                  src="/Balaji_temple_in_ketkawla.jpg"
                  alt="Tour Preview"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40" />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[11px] font-black uppercase">
                    {formData.month_label || 'Special Batch'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold">
                    45 Seats Available
                  </span>
                </div>
                <div className="absolute bottom-2 left-3 text-[11px] text-white font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{formData.pickup_location}</span>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-3">
                {/* Host Badge */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-black text-xs">
                    {(formData.operator_name || 'H').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-extrabold uppercase text-amber-800 block">
                      Listed by Partner:
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {formData.operator_name || 'Aapka Host/Mandal Name'}
                    </span>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>

                <h3 className="font-black text-slate-900 text-base leading-snug line-clamp-2">
                  {formData.title || 'Aapka Tour Title Yahan Aayega'}
                </h3>

                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>{formData.start_date} – {formData.end_date}</span>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {formData.inclusions.slice(0, 3).map((inc, i) => (
                    <span key={i} className="text-[10px] font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      ✓ {inc}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Fare per Seat</span>
                    <span className="text-2xl font-black text-slate-950">
                      ₹{formData.base_price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                    Seating Chart Enabled
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block">How Devotees Book:</span>
              <p>
                Aapke list karne ke baad, devotees tour card par click karenge aur <strong className="text-slate-800">http://localhost:5173/book</strong> khulega jahan se wo apni pasandeeda seat number select karenge.
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* PARTNER BENEFITS & HOW IT WORKS */
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Digital Seating Software</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aapko pen-paper par seat allocate karne ki zaroorat nahi. Hamari visual 2x2 seating grid se devotees khud seat choose karte hain.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Zero Commission Setup</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Platform par listing 100% free hai. Devotees ka direct advance payment aapke UPI VPA par collect hota hai.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Sakinaka Community Reach</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sakinaka, Andheri, Ghatkopar, aur Kurla ke hazaron bhakt aur parivar seedha aapke tour se judte hain.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => setActiveTab('create')}
              className="px-6 py-3 rounded-xl bg-amber-600 text-white font-black text-sm hover:bg-amber-700 transition-all shadow-md"
            >
              List Your Tour Now in Studio
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
