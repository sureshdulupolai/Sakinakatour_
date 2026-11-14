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
import { TourCatalogPage } from './components/TourCatalogPage';
import { TourDetailsPage } from './components/TourDetailsPage';
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

  // Generate or return clean, URL-safe slug for tour package
  const getTripSlug = (trip?: TourTrip): string => {
    if (!trip) return '';
    return (
      trip.slug ||
      trip.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/(^-|-$)/g, '') ||
      String(trip.id)
    );
  };

  // Helper to normalize path into clean top-level views
  const normalizeRoute = (pathname: string): 'home' | 'packages' | 'package-details' | 'booking' | 'partner' => {
    if (pathname === '/book' || pathname === '/booking' || pathname.startsWith('/booking/')) {
      return 'booking';
    }
    if (pathname === '/packages' || pathname === '/tours' || pathname === '/catalog') {
      return 'packages';
    }
    if (pathname.startsWith('/packages/') || pathname.startsWith('/tours/')) {
      return 'package-details';
    }
    if (pathname === '/partner' || pathname.startsWith('/partner') || pathname === '/organize') {
      return 'partner';
    }
    return 'home';
  };

  // Extract slug or identifier from path or query (prevents exposing raw IDs in URLs)
  const extractTourIdentifier = (path: string): string | null => {
    try {
      const search = window.location.search;
      if (search) {
        const params = new URLSearchParams(search);
        const q = params.get('package') || params.get('tour') || params.get('trip') || params.get('tripId') || params.get('id');
        if (q) return q.trim();
      }
      // Check /booking/:slug/seats or /booking/:slug
      const bookingMatch = path.match(/\/booking\/([^/]+)/);
      if (bookingMatch && bookingMatch[1] && bookingMatch[1] !== 'seats') {
        return decodeURIComponent(bookingMatch[1]).trim();
      }
      // Check /packages/:slug or /tours/:slug
      const packageMatch = path.match(/\/(?:packages|tours)\/([^/]+)/);
      if (packageMatch && packageMatch[1]) {
        return decodeURIComponent(packageMatch[1]).trim();
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  // Navigation path routing: clean state with slug tracking
  const [currentPath, setCurrentPath] = useState<'home' | 'packages' | 'package-details' | 'booking' | 'partner'>(() => {
    return normalizeRoute(window.location.pathname);
  });
  const [activeTourSlug, setActiveTourSlug] = useState<string | null>(() => extractTourIdentifier(window.location.pathname));

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

  // Find trip by slug OR by id (secure lookup, no sequential ID exposure)
  const findTrip = (slugOrId: string | number | null): TourTrip | undefined => {
    if (!slugOrId) return undefined;
    const clean = String(slugOrId).toLowerCase().trim();
    return trips.find((t) => (t.slug && t.slug.toLowerCase() === clean) || String(t.id) === clean);
  };

  // Browser navigation popstate handler
  useEffect(() => {
    const handlePopState = () => {
      const norm = normalizeRoute(window.location.pathname);
      setCurrentPath(norm);
      const ident = extractTourIdentifier(window.location.pathname);
      if (ident) {
        setActiveTourSlug(ident);
        const found = findTrip(ident);
        if (found) {
          handleSelectTrip(found);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [trips]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    const norm = normalizeRoute(path.split('?')[0]);
    setCurrentPath(norm);
    const ident = extractTourIdentifier(path);
    if (ident) {
      setActiveTourSlug(ident);
      const found = findTrip(ident);
      if (found) {
        handleSelectTrip(found);
      }
    }
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
        const urlIdent = extractTourIdentifier(window.location.pathname);
        const initialTrip =
          (urlIdent &&
            tripsData.find(
              (t) =>
                (t.slug && t.slug.toLowerCase() === urlIdent.toLowerCase()) ||
                String(t.id) === urlIdent
            )) ||
          tripsData[0];

        setSelectedTripId(initialTrip.id);
        setActiveTourSlug(initialTrip.slug || String(initialTrip.id));
        if (initialTrip.buses.length > 0) {
          const firstBus = initialTrip.buses[0];
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
  const handleSelectTrip = (tripIdOrObj: number | TourTrip) => {
    const trip = typeof tripIdOrObj === 'object' ? tripIdOrObj : trips.find((t) => t.id === tripIdOrObj);
    if (!trip) return;
    setSelectedTripId(trip.id);
    setActiveTourSlug(trip.slug || String(trip.id));
    if (trip.buses.length > 0) {
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

  // Active items resolved safely by slug or state
  const activeTrip = (activeTourSlug && findTrip(activeTourSlug)) || trips.find((t) => t.id === selectedTripId) || trips[0];
  const activeBus = activeTrip?.buses.find((b) => b.id === selectedBusId) || activeTrip?.buses[0];
  const currentDetailedTrip = (activeTourSlug && findTrip(activeTourSlug)) || activeTrip;

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
        currentPath={window.location.pathname}
        onNavigate={navigate}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onScrollToSection={scrollToSection}
      />

      <main className="flex-1">
        {/* ROUTE 1: HOME PAGE */}
        {currentPath === 'home' && (
          <div>
            {/* Hero Section */}
            <HeroSection
              currentTrip={activeTrip}
              onBookNowClick={() => {
                if (activeTrip) {
                  handleSelectTrip(activeTrip);
                  navigate('/booking/' + getTripSlug(activeTrip) + '/seats');
                } else {
                  navigate('/packages');
                }
              }}
              onOpenSocialClick={() => scrollToSection('social')}
              onViewToursClick={() => navigate('/packages')}
              onOrganizeTripClick={() => navigate('/partner/list-tour')}
            />

            {/* Tour Showcase Packages */}
            <TourShowcaseSection
              trips={trips}
              isLoading={loading}
              onSelectTripToBook={(trip) => {
                handleSelectTrip(trip);
                navigate('/booking/' + getTripSlug(trip) + '/seats');
              }}
              onViewTripDetails={(trip) => {
                setActiveTourSlug(getTripSlug(trip));
                navigate('/packages/' + getTripSlug(trip));
              }}
              onExploreAllTours={() => navigate('/packages')}
              onOrganizeTripClick={() => navigate('/partner/list-tour')}
            />

            {/* About Sakinaka Tour Heritage */}
            <AboutSection currentTrip={activeTrip} />

            {/* Social Community & Helplines */}
            <SocialConnect settings={publicSettings} />
          </div>
        )}

        {/* ROUTE 2: E-COMMERCE TOUR CATALOG (LIST PAGE) */}
        {currentPath === 'packages' && (
          <TourCatalogPage
            trips={trips}
            isLoading={loading}
            onSelectTripToBook={(trip) => {
              handleSelectTrip(trip);
              navigate('/booking/' + getTripSlug(trip) + '/seats');
            }}
            onViewTripDetails={(trip) => {
              setActiveTourSlug(getTripSlug(trip));
              navigate('/packages/' + getTripSlug(trip));
            }}
            onNavigateToOrganize={() => navigate('/partner/list-tour')}
          />
        )}

        {/* ROUTE 3: E-COMMERCE TOUR DETAILS (PRODUCT DETAILS PAGE) */}
        {currentPath === 'package-details' && currentDetailedTrip && (
          <TourDetailsPage
            trip={currentDetailedTrip}
            settings={publicSettings}
            onBackToCatalog={() => navigate('/packages')}
            onSelectTripToBook={(trip, busId) => {
              handleSelectTrip(trip);
              if (busId) handleSelectBus(busId);
              navigate('/booking/' + getTripSlug(trip) + '/seats');
            }}
          />
        )}

        {/* ROUTE 4: DEDICATED SEATING & BOOKING PAGE (/booking/:slug/seats or /book) */}
        {currentPath === 'booking' && (
          <BookingPage
            trips={trips}
            selectedTripId={selectedTripId}
            selectedBusId={selectedBusId}
            busDetails={busDetails}
            seats={seats}
            selectedSeatNumbers={selectedSeatNumbers}
            selectedTotalAmount={selectedTotalAmount}
            onSelectTrip={(id) => handleSelectTrip(id)}
            onSelectBus={handleSelectBus}
            onToggleSeat={handleToggleSeat}
            onOpenBookingModal={() => setIsBookingModalOpen(true)}
            onBackToHome={() => navigate('/')}
            onBackToCatalog={() => navigate('/packages')}
            onOpenSocialHelp={() => {
              navigate('/');
              setTimeout(() => scrollToSection('social'), 150);
            }}
          />
        )}

        {/* ROUTE 5: DEDICATED PARTNER LISTING STUDIO */}
        {currentPath === 'partner' && (
          <OrganizePage
            settings={publicSettings}
            onBackToHome={() => navigate('/')}
            onNavigateToBook={(tripId) => {
              if (tripId) {
                const found = trips.find((tr) => tr.id === tripId);
                if (found) {
                  handleSelectTrip(found);
                  navigate('/booking/' + getTripSlug(found) + '/seats');
                  return;
                }
              }
              navigate('/packages');
            }}
            onNavigateToCatalog={() => navigate('/packages')}
            onTourCreated={() => loadInitialData()}
          />
        )}
      </main>

      {/* World-Class Fixed Bottom Action Bar (100% Solid Opaque, High-Contrast) */}
      {selectedSeatNumbers.length > 0 && activeBus && currentPath === 'booking' && (
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
