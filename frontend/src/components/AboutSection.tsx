import React from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Utensils, 
  Hotel, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Bus, 
  CalendarCheck,
  MapPin,
  Check
} from 'lucide-react';
import { TourTrip } from '../types';

interface AboutSectionProps {
  currentTrip?: TourTrip;
}

interface FacilityItem {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DEFAULT_FACILITIES: FacilityItem[] = [
  {
    title: 'AC Bus Travel',
    desc: 'Verified 2x2 Pushback & 2x1 Luxury Sleeper coaches with experienced highway captains.',
    icon: Bus,
  },
  {
    title: 'Pure Veg Meals (Breakfast, Lunch, Dinner)',
    desc: '100% Shuddh satvik breakfast, afternoon lunch, evening tea, and wholesome dinner.',
    icon: Utensils,
  },
  {
    title: 'Comfortable Hotel Stay',
    desc: 'Clean, sanitized AC deluxe family hotel rooms with hot water & elevator facilities.',
    icon: Hotel,
  },
  {
    title: 'Temple Entry Coordination',
    desc: 'Hassle-free darshan passes, VIP queue assistance, and group pooja coordination.',
    icon: Sparkles,
  },
];

const DEFAULT_ITINERARY = [
  {
    dayNumber: 'Day 01',
    title: 'Friday Night Departure from Mumbai',
    highlight: 'Central Assembly & Night Travel',
    description: 'Assemble at Sakinaka Junction, Mumbai. AC Coach boarding, initial briefing, and smooth overnight highway travel towards the holy shrines.',
    badge: 'Departure: 9:00 PM',
  },
  {
    dayNumber: 'Day 02',
    title: 'Morning Nashik Trimbakeshwar Abhishek & Shirdi Arrival',
    highlight: 'Sacred Jyotirlinga Darshan & Hotel Check-in',
    description: 'Morning arrival in Nashik, fresh-up & sattvik breakfast. Holy Trimbakeshwar Jyotirlinga Abhishek & darshan, followed by afternoon scenic drive & hotel check-in at Shirdi.',
    badge: 'Pavitra Snan & Abhishek',
  },
  {
    dayNumber: 'Day 03',
    title: 'Shirdi Sai Darshan & Evening Return to Mumbai',
    highlight: 'Samadhi Mandir Darshan & Journey Back',
    description: 'Morning auspicious Kakad/Samadhi darshan at Shirdi Sai Temple, local temple visits, lunch and evening departure back to Sakinaka, Mumbai with blessed memories.',
    badge: 'Return by Night',
  },
];

export const AboutSection: React.FC<AboutSectionProps> = ({ currentTrip }) => {
  // Map inclusions dynamically if present or use standard package facilities
  const facilities: FacilityItem[] = (currentTrip?.inclusions && currentTrip.inclusions.length > 0)
    ? currentTrip.inclusions.map((inc) => {
        const lower = inc.toLowerCase();
        let Icon = CheckCircle2;
        let desc = 'Admin dwara nirdharit certified facility package ke sath.';
        if (lower.includes('bus') || lower.includes('coach') || lower.includes('travel') || lower.includes('sleeper')) {
          Icon = Bus;
          desc = 'Verified luxury pushback/sleeper coach travel with professional highway captains.';
        } else if (lower.includes('meal') || lower.includes('food') || lower.includes('veg') || lower.includes('dinner') || lower.includes('breakfast')) {
          Icon = Utensils;
          desc = 'Fresh satvik breakfast, lunch, high-tea & dinner throughout the yatra.';
        } else if (lower.includes('hotel') || lower.includes('stay') || lower.includes('room')) {
          Icon = Hotel;
          desc = 'Clean, sanitized family AC rooms with 24/7 hot water & elevator.';
        } else if (lower.includes('darshan') || lower.includes('temple') || lower.includes('entry') || lower.includes('pass')) {
          Icon = Sparkles;
          desc = 'VIP entry coordination & smooth darshan assistance for families.';
        }
        return {
          title: inc,
          desc,
          icon: Icon,
        };
      })
    : DEFAULT_FACILITIES;

  // Map itinerary items dynamically or use default timeline
  const itineraryItems = (currentTrip?.itinerary && currentTrip.itinerary.length > 0)
    ? currentTrip.itinerary.map((item, idx) => {
        // e.g. "Day 1: Friday night departure from Mumbai."
        const match = item.match(/Day\s*(\d+)[:\s-]*(.*)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          return {
            dayNumber: `Day ${num < 10 ? '0' + num : num}`,
            title: match[2].trim(),
            highlight: `Stage ${idx + 1} of Yatra`,
            description: item,
            badge: `Day ${num}`,
          };
        }
        return {
          dayNumber: `Day 0${idx + 1}`,
          title: item,
          highlight: `Stage ${idx + 1} of Yatra`,
          description: item,
          badge: `Day ${idx + 1}`,
        };
      })
    : DEFAULT_ITINERARY;

  return (
    <section id="about" className="py-16 sm:py-20 bg-white border-y border-slate-200/80 notranslate" translate="no">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-100/70 border border-amber-300/80 text-amber-950 text-xs font-bold uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Sakinaka Tour Story & Heritage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-serif-heading tracking-tight">
            Kyu Yatri Sakinaka Tour Ke Sath Safar Karte Hain?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Sakinaka Tour koi commercial travel agency ya commission broker nahi hai. Har yatra hum khud aayojit karte hain jisme sabhi parivar ek saath darshan, shubh aashirwad aur anandmay safar ka anubhav karte hain.
          </p>
        </div>

        {/* 4 Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-5 sm:p-6 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-3 hover:border-amber-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Direct No-Agent Yatra</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bina kisi middleman ya commission ke direct booking. Har seat ka transparent hisab aur direct UPI confirmation.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-3 hover:border-emerald-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-800 flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">100% Shuddh Sattvik Bhojan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Yatra ke dauran subah ka nashta, dophar ka swadisht shuddh shakahari khana, shaam ki chai aur raat ka bhojan shamil.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-xl bg-blue-50/50 border border-blue-200/70 space-y-3 hover:border-blue-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 text-blue-800 flex items-center justify-center font-bold">
              <Hotel className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">AC Deluxe Family Stay</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Swachh aur surakshit AC hotel rooms parivar ke liye. Mahilaon aur buzurgon ki suvidha ka poora dhyan.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-xl bg-purple-50/50 border border-purple-200/70 space-y-3 hover:border-purple-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-purple-500/15 text-purple-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Darshan & Emergency Help</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              VIP darshan passes ka aayojan, bus mein prathmik chikitsa kit, aur samay par safar ki jimmedari.
            </p>
          </div>

        </div>

        {/* Professional Package Facilities & Day-by-Day Itinerary Container */}
        <div className="mt-14 rounded-2xl bg-slate-50/80 border border-slate-200 overflow-hidden">
          
          {/* Header Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Package Facilities</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-serif-heading tracking-tight">
                Yatra Package Mein Kya-Kya Shamil Hai?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Har yatra ke sath shamil sabhi suvidhayein pre-arranged aur verified rehti hain.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Admin Dwara Nirdharit Sabhi Suvidhayein Shamil</span>
            </div>
          </div>

          {/* 1. Facilities Grid (Crisp, High-End Cards) */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {facilities.map((facility, index) => {
                const IconComponent = facility.icon;
                return (
                  <div 
                    key={index} 
                    className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 transition-colors flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {facility.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">
                          {facility.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>Verified Inclusion</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Professional Day-by-Day Timeline */}
          <div className="p-6 sm:p-8 pt-0 border-t border-slate-200/70 mt-2">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 font-serif-heading">
                    Day-by-Day Yatra Itinerary
                  </h4>
                  <p className="text-xs text-slate-500">
                    Samay anusar nirdharit darshan aur aaramdayak yatra ka poora schedule.
                  </p>
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 before:hidden md:before:block">
              {itineraryItems.map((step, idx) => (
                <div 
                  key={idx} 
                  className="relative flex flex-col md:flex-row items-start md:items-center gap-4 p-4 sm:p-5 rounded-xl bg-white border border-slate-200 hover:border-amber-300 transition-colors"
                >
                  {/* Left: Day Node Badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="w-10 h-10 rounded-lg bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider">
                      {step.dayNumber}
                    </span>
                  </div>

                  {/* Center: Details */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <h5 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {step.title}
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Right: Badge / Status */}
                  <div className="shrink-0 self-start md:self-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      <span>{step.badge}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
