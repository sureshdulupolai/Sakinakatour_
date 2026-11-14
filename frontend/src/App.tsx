import React, { useState, useEffect } from 'react';
import {
  Bus, Ticket, ShieldCheck, PhoneCall, Sparkles, CheckCircle2,
  ArrowRight, HeartHandshake, Compass, Users
} from 'lucide-react';
import { TourTrip, BusSummary, SeatItem, PublicSettings } from './types';
import { fetchTrips, fetchBusSeats, fetchPublicSettings } from './services/api';
import { useAuth } from './context/AuthContext';
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
import { CustomToast, ToastMessage } from './components/CustomToast';

export function App() {
  const { user } = useAuth();

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
              onSelectTripToBook={(tripId) => {
                handleSelectTrip(tripId);
                navigate('/book');
              }}
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
            onSelectTrip={handleSelectTrip}
            onSelectBus={handleSelectBus}
            onToggleSeat={handleToggleSeat}
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

      {/* Sleek Minimalist Floating Selection Pill Dock */}
      {selectedSeatNumbers.length > 0 && activeBus && currentPath === '/book' && (
        <div className="fixed bottom-4 inset-x-0 z-40 px-3 sm:px-4 pointer-events-none">
          <div className="max-w-xl mx-auto pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white py-2.5 px-4 sm:px-5 rounded-2xl border border-slate-700 flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200">

            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <div className="truncate">
                <span className="text-xs font-mono font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded">
                  {selectedSeatNumbers.length} Seat{selectedSeatNumbers.length > 1 ? 's' : ''}: {selectedSeatNumbers.join(', ')}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-white ml-2">
                  ₹{selectedTotalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="shrink-0 px-4 sm:px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5"
            >
              <span>Proceed to Book</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full ring-1 ring-amber-400/80 p-0.5 flex items-center justify-center overflow-hidden bg-slate-950">
              <img
                src="/krishh_logo_circle.png"
                alt="Krish Emblem"
                className="w-full h-full object-cover rounded-full transition-transform duration-300 ease-out hover:scale-125 cursor-pointer"
                onError={(e) => {
                  e.currentTarget.src = "/krishh_logo.png";
                }}
              />
            </div>
            <div>
              <span className="font-bold text-slate-200 text-sm">Sakinaka Tour & Group Trips</span>
              <div className="text-[11px] text-slate-500">Official Community Tour, Yatra & Listing Platform</div>
            </div>
          </div>
          <div className="text-center sm:text-right text-slate-500">
            © 2026 Sakinaka Tour. Har parivar aur group ke saath pavitra v vishwasniya safar.
          </div>
        </div>
      </footer>

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
