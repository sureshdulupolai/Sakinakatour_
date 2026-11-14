import React from 'react';
import { Ticket, User, ShieldCheck, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenMyBookings: () => void;
  onOpenAdminPortal: () => void;
  onOpenLoginModal: () => void;
  onScrollToSection?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenMyBookings,
  onOpenAdminPortal,
  onOpenLoginModal,
}) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand: Krish Logo + Clean Wordmark */}
        <div 
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-full ring-2 ring-amber-400/80 p-0.5 flex items-center justify-center overflow-hidden bg-slate-950 shrink-0">
            <img
              src="/krishh_logo_circle.png"
              alt="Krishh Logo"
              className="w-full h-full object-cover rounded-full transition-transform duration-300 ease-out hover:scale-115 cursor-pointer"
              onError={(e) => {
                e.currentTarget.src = "/krishh_logo.png";
              }}
            />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 font-serif-heading leading-tight">
              {t('brand_name')}
            </h1>
            <p className="text-[10px] font-semibold text-amber-800 tracking-wider uppercase">
              {t('brand_tagline')}
            </p>
          </div>
        </div>

        {/* Clean, Dedicated Page Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-600">
          <button
            onClick={() => onNavigate('/')}
            className={`transition-colors py-1 ${
              currentPath === '/' ? 'text-amber-800 font-bold border-b-2 border-amber-600' : 'hover:text-slate-900'
            }`}
          >
            {t('nav_home')}
          </button>

          <button
            onClick={() => onNavigate('/book')}
            className={`transition-colors py-1 ${
              currentPath === '/book' ? 'text-amber-800 font-bold border-b-2 border-amber-600' : 'hover:text-slate-900'
            }`}
          >
            {t('nav_book')}
          </button>

          <button
            onClick={() => onNavigate('/organize')}
            className={`transition-colors py-1 flex items-center gap-1.5 ${
              currentPath === '/organize' ? 'text-amber-800 font-bold border-b-2 border-amber-600' : 'hover:text-slate-900'
            }`}
          >
            <span>{t('nav_organize')}</span>
            <span className="text-[10px] uppercase font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">New</span>
          </button>
        </nav>

        {/* Right Clean Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Universal All-India Language Selector */}
          <LanguageSelector />

          {/* Mobile Book Button */}
          <button
            onClick={() => onNavigate('/book')}
            className={`md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentPath === '/book'
                ? 'bg-amber-800 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <span>{t('nav_book')}</span>
          </button>

          {/* My Bookings Icon Button */}
          <button
            onClick={onOpenMyBookings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg text-slate-700 hover:bg-slate-100 transition-all border border-slate-200"
            title="View My Bookings"
          >
            <Ticket className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden lg:inline">{t('nav_my_bookings')}</span>
          </button>

          {/* User state / Profile */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-tight">
                  +91 {user.phone.slice(-4)}
                </span>
              </div>

              {/* Admin Portal shortcut if admin */}
              {user.role === 'admin' && (
                <button
                  onClick={onOpenAdminPortal}
                  className="px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all flex items-center gap-1"
                  title="Organizer Admin Portal"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                  <span className="hidden sm:inline">{t('nav_admin')}</span>
                </button>
              )}

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('nav_login')}</span>
              </button>

              <button
                onClick={onOpenAdminPortal}
                className="p-1.5 text-slate-400 hover:text-amber-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Admin Access"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
