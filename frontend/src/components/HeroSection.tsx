import React from 'react';
import { Calendar, MapPin, ArrowRight, CheckCircle2, PlusCircle } from 'lucide-react';
import { TourTrip } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HeroSectionProps {
  currentTrip?: TourTrip;
  onBookNowClick: () => void;
  onOpenSocialClick: () => void;
  onViewToursClick: () => void;
  onOrganizeTripClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentTrip,
  onBookNowClick,
  onOpenSocialClick,
  onViewToursClick,
  onOrganizeTripClick,
}) => {
  const { t } = useLanguage();

  return (
    <section 
      id="hero" 
      className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 lg:py-16 overflow-hidden bg-white"
    >
      {/* Warm Ambient Background Lighting */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-amber-200/25 via-amber-100/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* Main Full-Viewport Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* Left Column: Authoritative Brand & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-7">

            {/* Top Clean Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/90 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>{t('hero_badge')}</span>
            </div>

            {/* Brand Title & Grand Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[1.08] font-serif-heading text-balance">
                {t('brand_name')}
              </h1>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-800 text-balance">
                {t('hero_subtitle')}
              </p>
            </div>

            {/* Story & Value Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              {t('hero_desc')}
            </p>

            {/* Featured Active Tour Card */}
            {currentTrip && (
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-md">
                    {currentTrip.month_label}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200/60">
                    {currentTrip.buses.length} Coaches Ready
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {currentTrip.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-700 pt-2 border-t border-slate-200">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                    {currentTrip.start_date} – {currentTrip.end_date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                    Direct Sakinaka Departure
                  </span>
                </div>
              </div>
            )}

            {/* Commanding Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={onBookNowClick}
                className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm sm:text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{t('book_seats_now')}</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                onClick={onOrganizeTripClick || onViewToursClick}
                className="flex items-center gap-2.5 px-7 py-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-sm sm:text-base border border-amber-200 transition-all"
              >
                <PlusCircle className="w-5 h-5 text-amber-700" />
                <span>{t('list_tour_cta')}</span>
              </button>
            </div>

            {/* 3 Prominent Trust Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/80 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>100% Pure Veg Meals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Verified AC Coaches</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Direct Transparent UPI</span>
              </div>
            </div>

          </div>

          {/* Right Column: Majestic Visual Poster (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-lg lg:max-w-none">

              <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-950 group h-[460px] sm:h-[500px] lg:h-[530px]">
                <img
                  src="/Balaji_temple_in_ketkawla.jpg"
                  alt="Ketkawla Balaji Temple"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80";
                  }}
                />

                {/* Sakinaka Tour Official Brand Badge */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-amber-500/40">
                  <img
                    src="/krishh_logo_circle.png"
                    alt="Krishh Travels"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-400/50"
                    onError={(e) => {
                      e.currentTarget.src = "/krishh_logo.png";
                    }}
                  />
                  <span className="text-xs sm:text-sm font-black text-amber-400 tracking-wider uppercase font-serif-heading">
                    Sakinaka Tour
                  </span>
                </div>

                {/* Dark Gradient Overlay with Temple Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white pointer-events-none">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-widest mb-1">
                    Ketkawla Pratirup Tirupati Balaji
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black font-serif-heading leading-tight">
                    Pavitra Kalyanotsavam & Darshan
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                    Special spiritual darshan passes, clean AC hotel family rooms & pushback/sleeper coaches.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
