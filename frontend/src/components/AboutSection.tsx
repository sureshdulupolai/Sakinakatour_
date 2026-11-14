import React from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Utensils, 
  Hotel, 
  Sparkles, 
  Bus, 
  CalendarCheck,
  MapPin,
  Check,
  CheckCircle2,
  Clock
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
    desc: 'Verified 2x2 Pushback & 2x1 Sleeper coaches with experienced highway captains.',
    icon: Bus,
  },
  {
    title: 'Pure Veg Meals (Breakfast, Lunch, Dinner)',
    desc: '100% Shuddh satvik breakfast, afternoon lunch, evening tea & dinner included.',
    icon: Utensils,
  },
  {
    title: 'Comfortable Hotel Stay',
    desc: 'Clean, sanitized AC deluxe family hotel rooms with hot water & elevator.',
    icon: Hotel,
  },
  {
    title: 'Temple Entry Coordination',
    desc: 'Hassle-free darshan passes, VIP queue assistance & group coordination.',
    icon: Sparkles,
  },
];

const DEFAULT_ITINERARY = [
  {
    dayNumber: 'DAY 01',
    stage: 'Stage 1 • Departure',
    title: 'Friday Night Departure from Mumbai',
    description: 'Assemble at Sakinaka Junction, Mumbai. AC Coach boarding, initial briefing, and smooth overnight highway travel towards the holy shrines.',
    badge: 'Departure: 9:00 PM',
  },
  {
    dayNumber: 'DAY 02',
    stage: 'Stage 2 • Darshan & Stay',
    title: 'Nashik Trimbakeshwar Abhishek & Shirdi Arrival',
    description: 'Morning Jyotirlinga Abhishek & darshan, followed by afternoon scenic drive & hotel check-in at Shirdi with fresh satvik meals.',
    badge: 'Holy Snan & Abhishek',
  },
  {
    dayNumber: 'DAY 03',
    stage: 'Stage 3 • Samadhi & Return',
    title: 'Shirdi Sai Darshan & Evening Return to Mumbai',
    description: 'Morning auspicious Kakad/Samadhi darshan at Shirdi Sai Temple, local temple visits, lunch and blessed return to Sakinaka by night.',
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
          desc = 'Verified luxury pushback/sleeper coach travel with highway captains.';
        } else if (lower.includes('meal') || lower.includes('food') || lower.includes('veg') || lower.includes('dinner') || lower.includes('breakfast')) {
          Icon = Utensils;
          desc = 'Fresh satvik breakfast, lunch, high-tea & dinner throughout yatra.';
        } else if (lower.includes('hotel') || lower.includes('stay') || lower.includes('room')) {
          Icon = Hotel;
          desc = 'Clean, sanitized family AC rooms with 24/7 hot water & elevator.';
        } else if (lower.includes('darshan') || lower.includes('temple') || lower.includes('entry') || lower.includes('pass')) {
          Icon = Sparkles;
          desc = 'VIP entry coordination & smooth darshan passes for families.';
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
        const match = item.match(/Day\s*(\d+)[:\s-]*(.*)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          return {
            dayNumber: `DAY 0${num}`,
            stage: `Stage ${num} of Yatra`,
            title: match[2].trim(),
            description: item,
            badge: `Day ${num}`,
          };
        }
        return {
          dayNumber: `DAY 0${idx + 1}`,
          stage: `Stage ${idx + 1} of Yatra`,
          title: item,
          description: item,
          badge: `Day ${idx + 1}`,
        };
      })
    : DEFAULT_ITINERARY;

  return (
    <section id="about" className="py-10 sm:py-14 bg-white border-y border-slate-200/80 notranslate" translate="no">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header: Full Width & No Orphan Lines */}
        <div className="text-center max-w-4xl lg:max-w-5xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-bold uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Sakinaka Tour Heritage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-serif-heading tracking-tight text-balance">
            Kyu Yatri Sakinaka Tour Ke Sath Safar Karte Hain?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Sakinaka Tour koi commercial travel agency ya commission broker nahi hai. Har yatra hum khud aayojit karte hain jisme sabhi parivar ek saath darshan, shubh aashirwad aur anandmay safar ka anubhav karte hain.
          </p>
        </div>

        {/* 4 Feature Pillars: Compact & High Visual Contrast */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 sm:p-5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2 hover:border-amber-400 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Direct No-Agent Yatra</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bina kisi middleman ya commission ke direct booking. Har seat ka transparent hisab aur direct UPI confirmation.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2 hover:border-emerald-400 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-800 flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">100% Satvik Bhojan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Subah ka nashta, dophar ka shuddh shakahari khana, shaam ki chai aur raat ka bhojan shamil.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-2 hover:border-blue-400 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-800 flex items-center justify-center shrink-0">
              <Hotel className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">AC Deluxe Family Stay</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Swachh aur surakshit AC hotel rooms parivar ke liye. Mahilaon aur buzurgon ki suvidha ka poora dhyan.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-2 hover:border-purple-400 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-purple-500/15 text-purple-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Darshan & Help</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              VIP darshan passes ka aayojan, bus mein prathmik medical kit, aur time par yatra ki poori jimmedari.
            </p>
          </div>

        </div>

        {/* SECTION 1: Package Facilities (Big, Bold & Eye-Catching Cards) */}
        <div className="rounded-2xl bg-slate-50/80 border border-slate-200 overflow-hidden">
          
          <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Package Facilities</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-serif-heading tracking-tight mt-0.5 text-balance">
                Yatra Package Mein Kya-Kya Shamil Hai?
              </h3>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Admin Dwara Nirdharit Sabhi Suvidhayein Shamil</span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {facilities.map((facility, index) => {
                const IconComponent = facility.icon;
                return (
                  <div 
                    key={index} 
                    className="p-5 rounded-xl bg-white border border-slate-200/90 hover:border-amber-400 transition-colors flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
                        <IconComponent className="w-6 h-6 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {facility.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">
                          {facility.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      <span>100% Guaranteed Inclusion</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* SECTION 2: Day-by-Day Yatra Itinerary (Bold 3-Card Journey Track) */}
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          
          <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 font-serif-heading tracking-tight">
                  Day-by-Day Yatra Itinerary
                </h3>
                <p className="text-xs text-slate-500">
                  Samay anusar nirdharit darshan aur aaramdayak yatra ka poora schedule.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
              3 Days / 2 Nights Sacred Tour
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
              {itineraryItems.map((step, idx) => (
                <div 
                  key={idx} 
                  className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-amber-400 transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Bold Day Badge & Stage */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-lg bg-amber-600 text-white font-black text-xs tracking-wider">
                        {step.dayNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {step.stage}
                      </span>
                    </div>

                    {/* Step Title: Bold & Prominent */}
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {step.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom Milestone Badge */}
                  <div className="pt-3 border-t border-slate-200/80 flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                    <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>{step.badge}</span>
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
