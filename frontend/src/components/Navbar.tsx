import React from 'react';
import { Ticket, User, ShieldCheck, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand: Krish Logo + Clean Wordmark */}
        <div 
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3.5 cursor-pointer select-none"
        >
          <div className="w-12 h-12 rounded-full ring-2 ring-amber-400/80 p-0.5 flex items-center justify-center overflow-hidden bg-slate-950">
            <img
              src="/krishh_logo_circle.png"
              alt="Krishh Logo"
              className="w-full h-full object-cover rounded-full transition-transform duration-300 ease-out hover:scale-125 cursor-pointer"
              onError={(e) => {
                e.currentTarget.src = "/krishh_logo.png";
              }}
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-serif-heading leading-tight">
              Sakinaka Tour
            </h1>
            <p className="text-[11px] font-semibold text-amber-800 tracking-wider uppercase">
              Tours, Yatras & Group Trips
            </p>
          </div>
        </div>

        {/* Clean, Dedicated Page Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <button
            onClick={() => onNavigate('/')}
            className={`transition-colors py-1 ${
              currentPath === '/' ? 'text-amber-800 font-bold border-b-2 border-amber-600' : 'hover:text-slate-900'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('/book')}
            className={`transition-colors py-1 ${
              currentPath === '/book' ? 'text-amber-800 font-bold border-b-2 border-amber-600' : 'hover:text-slate-900'
            }`}
          >
            Book Seats
          </button>

          <button
            onClick={() => onNavigate('/organize')}
            className={`transition-colors py-1 flex items-center gap-1.5 ${
              currentPath === '/organize' ? 'text-amber-800 font-bold border-b-2 border-amber-600' : 'hover:text-slate-900'
            }`}
          >
            <span>List Your Tour</span>
            <span className="text-[10px] uppercase font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">New</span>
          </button>
        </nav>

        {/* Right Clean Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Universal All-India Language Selector */}
          <LanguageSelector />

          {/* Mobile Book Button */}
          <button
            onClick={() => onNavigate('/book')}
            className={`md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentPath === '/book'
                ? 'bg-amber-800 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <span>Book</span>
          </button>

          {/* My Bookings Icon Button */}
          <button
            onClick={onOpenMyBookings}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-700 hover:bg-slate-100 transition-all border border-slate-200"
            title="View My Bookings"
          >
            <Ticket className="w-4 h-4 text-amber-700" />
            <span className="hidden lg:inline">My Bookings</span>
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
                  className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all flex items-center gap-1"
                  title="Organizer Admin Portal"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-800" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>

              <button
                onClick={onOpenAdminPortal}
                className="p-2 text-slate-400 hover:text-amber-800 hover:bg-slate-100 rounded-xl transition-colors"
                title="Admin Access"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
