import React from 'react';
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Heart, 
  Bus, 
  CheckCircle2, 
  ArrowRight, 
  Lock,
  Utensils,
  CreditCard
} from 'lucide-react';
import { PublicSettings } from '../types';

interface FooterProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenMyBookings: () => void;
  onOpenAdminPortal?: () => void;
  onScrollToSection?: (id: string) => void;
  settings?: PublicSettings;
}

export const Footer: React.FC<FooterProps> = ({
  currentPath,
  onNavigate,
  onOpenMyBookings,
  onOpenAdminPortal,
  onScrollToSection,
  settings,
}) => {
  const contactPhone = settings?.contact_phone || '+91 98200 00000';
  const cleanPhone = contactPhone.replace(/[^0-9]/g, '');
  const upiId = settings?.upi_vpa || 'sakinakatour@upi';

  const handleSectionClick = (sectionId: string) => {
    if (currentPath !== '/') {
      onNavigate('/');
      setTimeout(() => {
        if (onScrollToSection) {
          onScrollToSection(sectionId);
        } else {
          const el = document.getElementById(sectionId);
          el?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      if (onScrollToSection) {
        onScrollToSection(sectionId);
      } else {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 overflow-hidden notranslate" translate="no">
      
      {/* 1. Real-World Trust Strip / Guarantees - Compact */}
      <div className="border-b border-slate-900 bg-slate-950/60 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Bus className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-slate-200 font-bold text-xs">Verified AC Coaches</h4>
                <p className="text-[11px] text-slate-500 leading-tight">Pushback 2x2 & Luxury 2x1 Sleeper layouts with tested safety.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Utensils className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-slate-200 font-bold text-xs">100% Pure Veg Meals</h4>
                <p className="text-[11px] text-slate-500 leading-tight">Fresh breakfast, tea, and satvik family dining during trips.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-slate-200 font-bold text-xs">Direct Transparent UPI</h4>
                <p className="text-[11px] text-slate-500 leading-tight">Zero commission or hidden charges. Pay directly to organizer.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-slate-200 font-bold text-xs">Direct Sakinaka Pickup</h4>
                <p className="text-[11px] text-slate-500 leading-tight">Central departure & drop from Sakinaka Junction, Mumbai.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Main Footer Multi-Column Grid - Space Efficient */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand & Mission (Col 1 - 5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full ring-2 ring-amber-400/80 p-0.5 flex items-center justify-center overflow-hidden bg-slate-900 shrink-0">
                <img
                  src="/krishh_logo_circle.png"
                  alt="Krishh Logo"
                  className="w-full h-full object-cover rounded-full hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/krishh_logo.png";
                  }}
                />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-100 text-base tracking-tight font-serif-heading">
                  SAKINAKA TOUR
                </h3>
                <p className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase">
                  Krishh Travels • Official Platform
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Sakinaka, Mumbai se sabhi prakar ke verified devotional yatras, family vacations, friends group trips aur seasonal darshan tours ki direct booking aur custom listing platform.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-900 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Pickup Hub: Sakinaka Junction, Andheri East, Mumbai 400072</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Helpline: </span>
                <a 
                  href={`tel:${cleanPhone}`} 
                  className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
                >
                  {contactPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Platform Pages (Col 2 - 2 cols) - ONLY REAL VALID PATHS */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Platform Pages
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className={`hover:text-amber-400 transition-colors text-left ${
                    currentPath === '/' ? 'text-amber-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/packages')}
                  className={`hover:text-amber-400 transition-colors text-left ${
                    currentPath.startsWith('/packages') || currentPath.startsWith('/tours') ? 'text-amber-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  All Tour Packages
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/partner/list-tour')}
                  className={`hover:text-amber-400 transition-colors text-left ${
                    currentPath.startsWith('/partner') || currentPath === '/organize' ? 'text-amber-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  Partner Studio (List Your Tour)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenMyBookings}
                  className="hover:text-amber-400 transition-colors text-slate-400 text-left"
                >
                  My Bookings Status
                </button>
              </li>
            </ul>
          </div>

          {/* Explore Sections (Col 3 - 2 cols) - VALID ON-PAGE HIGHLIGHTS */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Explore Tours
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => handleSectionClick('tours')}
                  className="hover:text-amber-400 transition-colors text-slate-400 text-left"
                >
                  Upcoming Packages
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleSectionClick('about')}
                  className="hover:text-amber-400 transition-colors text-slate-400 text-left"
                >
                  Heritage & Story
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleSectionClick('social')}
                  className="hover:text-amber-400 transition-colors text-slate-400 text-left"
                >
                  Community & Helplines
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleSectionClick('contact')}
                  className="hover:text-amber-400 transition-colors text-slate-400 text-left"
                >
                  Official Contact Details
                </button>
              </li>
            </ul>
          </div>

          {/* Real Yatra Guidelines & Direct Actions (Col 4 - 3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Verified Guarantees
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Family-first seating allocations & clean verified AC buses.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Direct organizer coordination with zero middleman markup.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Instant booking slip & WhatsApp seat approval updates.</span>
              </li>
            </ul>

            {/* Quick Action Button */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanPhone}?text=Namaste%20Sakinaka%20Tour,%20mujhe%20upcoming%20tour%20ke%20baare%20mein%20jaankari%20chahiye.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Copyright & Admin Access */}
      <div className="border-t border-slate-900 bg-slate-950 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Sakinaka Tour • Krishh Travels, Mumbai. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Non-Commercial Devotional & Family Group Travel</span>
            {onOpenAdminPortal && (
              <button
                type="button"
                onClick={onOpenAdminPortal}
                className="flex items-center gap-1 text-slate-600 hover:text-amber-400 transition-colors"
                title="Organizer Portal Login"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

    </footer>
  );
};

