import React, { useState, useEffect } from 'react';
import {
  Bus, Ticket, ShieldCheck, PhoneCall, Sparkles, CheckCircle2,
  ArrowRight, HeartHandshake, Compass, Users
} from 'lucide-react';
import { TourTrip, BusSummary, SeatItem, PublicSettings } from './types';
import { fetchTrips, fetchBusSeats, fetchPublicSettings } from './services/api';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { SocialConnect } from './components/SocialConnect';
import { TourShowcaseSection } from './components/TourShowcaseSection';
import { OrganizePage } from './components/OrganizePage';
import { BookingPage } from './components/BookingPage';
import { FamilyBookingModal } from './components/FamilyBookingModal';
import { BookingConfirmationCard } from './components/BookingConfirmationCard';
import { MyBookingsModal } from './components/MyBookingsModal';
import { AdminPortal } from './components/AdminPortal';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';
import { CustomToast, ToastMessage } from './components/CustomToast';

export function App() {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Navigation path routing: '/' for Home Showcase, '/book' for Dedicated Seating Grid, '/organize' for Listing
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    return ['/book', '/organize'].includes(path) ? path : '/';
  });

  // App data state
  const [trips, setTrips] = useState<TourTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number>(0);
  const [selectedBusId, setSelectedBusId] = useState<number>(0);
  const [busDetails, setBusDetails] = useState<any>(null);
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [publicSettings, setPublicSettings] = useState<PublicSettings>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Seat selection state
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<string[]>([]);

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Toast notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Browser navigation popstate handler
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname === '/book' ? '/book' : '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initial Data Load
  const loadInitialData = async () => {
    try {
      const [tripsData, settingsData] = await Promise.all([
        fetchTrips(),
        fetchPublicSettings(),
      ]);
      setTrips(tripsData);
      setPublicSettings(settingsData);

      if (tripsData.length > 0) {
        const firstTrip = tripsData[0];
        setSelectedTripId(firstTrip.id);
        if (firstTrip.buses.length > 0) {
          const firstBus = firstTrip.buses[0];
          setSelectedBusId(firstBus.id);
          loadSeatsForBus(firstBus.id);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Data Load Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSeatsForBus = async (busId: number) => {
    try {
      const data = await fetchBusSeats(busId);
      setBusDetails(data.bus);
      setSeats(data.seats);
      setSelectedSeatNumbers([]);
    } catch (err: any) {
      showToast('error', 'Bus Layout Error', err.message);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handlers for switching Trip and Bus
  const handleSelectTrip = (tripId: number) => {
    setSelectedTripId(tripId);
    const trip = trips.find((t) => t.id === tripId);
    if (trip && trip.buses.length > 0) {
      setSelectedBusId(trip.buses[0].id);
      loadSeatsForBus(trip.buses[0].id);
    } else {
      setSelectedBusId(0);
      setSeats([]);
      setBusDetails(null);
    }
  };

  const handleSelectBus = (busId: number) => {
    setSelectedBusId(busId);
    loadSeatsForBus(busId);
  };

  // Toggle seat selection
  const handleToggleSeat = (seatNumber: string) => {
    if (selectedSeatNumbers.includes(seatNumber)) {
      setSelectedSeatNumbers(selectedSeatNumbers.filter((s) => s !== seatNumber));
    } else {
      if (selectedSeatNumbers.length >= 60) {
        showToast('info', 'Limit Reached', 'Aap ek bar mein 60 seats tak select kar sakte hain.');
        return;
      }
      setSelectedSeatNumbers([...selectedSeatNumbers, seatNumber]);
    }
  };

  // Scroll helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Active items
  const activeTrip = trips.find((t) => t.id === selectedTripId) || trips[0];
  const activeBus = activeTrip?.buses.find((b) => b.id === selectedBusId) || activeTrip?.buses[0];

  // Selected total amount
  const selectedTotalAmount = selectedSeatNumbers.reduce((sum, seatNum) => {
    const sObj = seats.find((s) => s.seat_number === seatNum);
    const price = sObj?.deck === 'upper' && activeBus?.upper_deck_price ? activeBus.upper_deck_price : (activeBus?.base_price || 0);
    return sum + price;
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-800">

      {/* Navbar with Krish Logo & Sakinaka Tour Branding */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onScrollToSection={scrollToSection}
      />

      <main className="flex-1">
        {/* ROUTE 1: HOME PAGE SHOWCASE (Information, Heritage, Tour Packages & Social) */}
        {/* ROUTE 1: HOME PAGE */}
        {currentPath === '/' && (
          <div>
            {/* Hero Section */}
            <HeroSection
              currentTrip={activeTrip}
              onBookNowClick={() => navigate('/book')}
              onOpenSocialClick={() => scrollToSection('social')}
              onViewToursClick={() => navigate('/book')}
              onOrganizeTripClick={() => navigate('/organize')}
            />

            {/* Tour Showcase Packages (Clean overview without seating grid clutter) */}
            <TourShowcaseSection
              trips={trips}
              isLoading={loading}
              onSelectTripToBook={(tripId) => {
                handleSelectTrip(tripId);
                navigate('/book');
              }}
              onOrganizeTripClick={() => navigate('/organize')}
            />

            {/* About Sakinaka Tour Heritage */}
            <AboutSection currentTrip={activeTrip} />

            {/* Social Community & Helplines */}
            <SocialConnect settings={publicSettings} />
          </div>
        )}

        {/* ROUTE 2: DEDICATED SEATING & BOOKING PAGE */}
        {currentPath === '/book' && (
          <BookingPage
            trips={trips}
            selectedTripId={selectedTripId}
            selectedBusId={selectedBusId}
            busDetails={busDetails}
            seats={seats}
            selectedSeatNumbers={selectedSeatNumbers}
            selectedTotalAmount={selectedTotalAmount}
            onSelectTrip={handleSelectTrip}
            onSelectBus={handleSelectBus}
            onToggleSeat={handleToggleSeat}
            onOpenBookingModal={() => setIsBookingModalOpen(true)}
            onBackToHome={() => navigate('/')}
            onOpenSocialHelp={() => {
              navigate('/');
              setTimeout(() => scrollToSection('social'), 150);
            }}
          />
        )}

        {/* ROUTE 3: DEDICATED TOUR ORGANIZERS & LISTING PAGE */}
        {currentPath === '/organize' && (
          <OrganizePage
            settings={publicSettings}
            onBackToHome={() => navigate('/')}
            onNavigateToBook={() => navigate('/book')}
          />
        )}
      </main>

      {/* World-Class Fixed Bottom Action Bar (100% Solid Opaque, High-Contrast) */}
      {selectedSeatNumbers.length > 0 && activeBus && currentPath === '/book' && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-slate-950 border-t border-slate-800 animate-in slide-in-from-bottom duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
            
            {/* Left Column: Selected Seat Tags with counts */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Selected Seats ({selectedSeatNumbers.length})
                </span>
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  {selectedSeatNumbers.map((sn) => (
                    <span
                      key={sn}
                      className="inline-flex items-center gap-1 font-mono text-xs font-black bg-slate-900 text-amber-400 border border-amber-500/50 px-2.5 py-1 rounded-lg"
                    >
                      <span>{sn}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle / Right Column: Live Fare & Primary Proceed CTA */}
            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block leading-tight">
                  Total Payable
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    ₹{selectedTotalAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    All-Inclusive
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="px-6 sm:px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm transition-all flex items-center gap-2 border-2 border-amber-400 shadow-none shrink-0"
              >
                <span>{t('proceed_to_book')}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Professional Real-World Footer */}
      <Footer
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
        onScrollToSection={scrollToSection}
        settings={publicSettings}
      />

      {/* Family Booking Modal */}
      {activeTrip && activeBus && (
        <FamilyBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          trip={activeTrip}
          bus={activeBus}
          selectedSeats={selectedSeatNumbers}
          seatObjects={seats}
          settings={publicSettings}
          onBookingSuccess={(res) => {
            setBookingResult(res);
            loadSeatsForBus(activeBus.id);
          }}
          showToast={showToast}
        />
      )}

      {/* Booking Confirmation Pass / Card */}
      {bookingResult && (
        <BookingConfirmationCard
          bookingData={bookingResult}
          onClose={() => setBookingResult(null)}
          onViewMyBookings={() => {
            setBookingResult(null);
            setIsMyBookingsOpen(true);
          }}
        />
      )}

      {/* My Bookings Modal */}
      <MyBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Admin Portal Modal */}
      <AdminPortal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
        trips={trips}
        onDataChanged={() => {
          loadInitialData();
          if (activeBus) loadSeatsForBus(activeBus.id);
        }}
        showToast={showToast}
      />

      {/* Devotee Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        showToast={showToast}
      />

      {/* Custom Toast Card Notification System */}
      <CustomToast toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
