import React from 'react';
import { Calendar, MapPin, Users, ArrowRight, CheckCircle2, Sparkles, PlusCircle } from 'lucide-react';
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
    <section id="hero" className="relative pt-10 pb-16 overflow-hidden bg-white">
      {/* Subtle clean background lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Clean, short single badge */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{t('hero_badge')}</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Clean Copy & Action */}
          <div className="lg:col-span-7 space-y-6">

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.1] font-serif-heading">
                {t('brand_name')}
              </h1>
              <p className="text-lg sm:text-2xl font-bold text-amber-800">
                {t('hero_subtitle')}
              </p>
            </div>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              {t('hero_desc')}
            </p>

            {/* Featured Tour Card */}
            {currentTrip && (
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider bg-amber-100/80 px-2.5 py-0.5 rounded">
                    {currentTrip.month_label}
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200/60">
                    {currentTrip.buses.length} Coaches Ready
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentTrip.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-200/60">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    {currentTrip.start_date} - {currentTrip.end_date}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-amber-700" />
                    Mumbai Departure
                  </span>
                </div>
              </div>
            )}

            {/* Clean CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onBookNowClick}
                className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>{t('book_seats_now')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOrganizeTripClick || onViewToursClick}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-sm border border-amber-200 transition-all"
              >
                <PlusCircle className="w-4 h-4 text-amber-700" />
                <span>{t('list_tour_cta')}</span>
              </button>
            </div>

            {/* 3 Simple Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
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

          {/* Right Column: Visual Poster with Official Krishh Logo */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">

              <div className="relative rounded-3xl overflow-hidden border-4 border-white bg-slate-950 group">
                <img
                  src="/Balaji_temple_in_ketkawla.jpg"
                  alt="Ketkawla Balaji Temple"
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80";
                  }}
                />

                {/* Sakinaka Tour Brand Badge (Official brand label removed as requested) */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-amber-500/30">
                  <img
                    src="/krishh_logo_circle.png"
                    alt="Krishh Travels"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-400/40"
                    onError={(e) => {
                      e.currentTarget.src = "/krishh_logo.png";
                    }}
                  />
                  <span className="text-xs sm:text-sm font-bold text-amber-400 tracking-wider uppercase font-serif-heading">
                    Sakinaka Tour
                  </span>
                </div>

                {/* Dark Gradient Overlay with Temple Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white pointer-events-none">
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                    Ketkawla Pratirup Tirupati Balaji
                  </span>
                  <h4 className="text-xl font-bold font-serif-heading">
                    Pavitra Kalyanotsavam & Darshan
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
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
