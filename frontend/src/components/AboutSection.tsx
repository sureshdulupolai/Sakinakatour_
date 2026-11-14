import React from 'react';
import { HeartHandshake, ShieldCheck, Utensils, Hotel, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { TourTrip } from '../types';

interface AboutSectionProps {
  currentTrip?: TourTrip;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ currentTrip }) => {
  return (
    <section id="about" className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Sakinaka Tour Story & Heritage</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif-heading tracking-tight">
            Kyu Yatri Sakinaka Tour Ke Sath Safar Karte Hain?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Sakinaka Tour koi commercial travel agency ya commission broker nahi hai. Har yatra hum khud aayojit karte hain jisme sabhi parivar ek saath darshan, shubh aashirwad aur anandmay safar ka anubhav karte hain.
          </p>
        </div>

        {/* 4 Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-100/80 card-hover-lift space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Direct No-Agent Yatra</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Bina kisi middleman ya commission ke direct booking. Har seat ka transparent hisab aur direct UPI confirmation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-50/40 border border-emerald-100/80 card-hover-lift space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">100% Shuddh Sattvik Bhojan</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Yatra ke dauran subah ka nashta, dophar ka swadisht shuddh shakahari khana, shaam ki chai aur raat ka bhojan shamil.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-blue-50/40 border border-blue-100/80 card-hover-lift space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold">
              <Hotel className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AC Deluxe Family Stay</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Swachh aur surakshit AC hotel rooms parivar ke liye. Mahilaon aur buzurgon ki suvidha ka poora dhyan.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-purple-50/40 border border-purple-100/80 card-hover-lift space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Darshan & Emergency Help</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              VIP darshan passes ka aayojan, bus mein prathmik chikitsa kit, aur samay par safar ki jimmedari.
            </p>
          </div>

        </div>

        {/* What is Included in this year's Package */}
        {currentTrip && currentTrip.inclusions && (
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6 mb-6">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Package Facilities
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif-heading mt-1">
                  Yatra Package Mein Kya-Kya Shamil Hai?
                </h3>
              </div>
              <div className="text-xs text-slate-400">
                Admin dwara nirdharit sabhi suvidhayein shamil
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTrip.inclusions.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-200">{item}</span>
                </div>
              ))}
            </div>

            {/* Daily Itinerary summary */}
            {currentTrip.itinerary && currentTrip.itinerary.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Day-by-Day Yatra Itinerary</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentTrip.itinerary.map((day, idx) => (
                    <div key={idx} className="text-xs sm:text-sm text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};

