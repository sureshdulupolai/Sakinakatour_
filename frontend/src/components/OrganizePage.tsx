import React, { useState } from 'react';
import { 
  Bus, Sparkles, CheckCircle2, MessageCircle, PhoneCall, ArrowLeft, 
  Send, ShieldCheck, Laptop, Users, Calendar, MapPin, Check
} from 'lucide-react';
import { PublicSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface OrganizePageProps {
  settings: PublicSettings;
  onBackToHome: () => void;
  onNavigateToBook: () => void;
}

export const OrganizePage: React.FC<OrganizePageProps> = ({
  settings,
  onBackToHome,
  onNavigateToBook,
}) => {
  const { t } = useLanguage();
  const whatsappUrl = settings.whatsapp_group_link || 'https://chat.whatsapp.com/G51k2L4x9diwaliYatraGroup';
  const organizerPhone = settings.contact_phone || '+91 98200 45678';

  // Form State
  const [formData, setFormData] = useState({
    organizerName: '',
    phone: '',
    destination: '',
    tripCategory: 'Family Yatra',
    busType: '2x2 Deluxe Pushback',
    seatCapacity: '48 Seats',
    travelMonth: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organizerName || !formData.phone || !formData.destination) {
      alert('Kripya Organizer Name, Mobile Number aur Destination zaroor bharein.');
      return;
    }

    setSubmitted(true);

    // Prepare WhatsApp message string
    const message = encodeURIComponent(
      `*Namaste Sakinaka Tour Team! Mera Naya Tour List Karwana Hai:*\n\n` +
      `👤 *Organizer Name:* ${formData.organizerName}\n` +
      `📱 *Contact Phone:* ${formData.phone}\n` +
      `📍 *Destination:* ${formData.destination}\n` +
      `🏷️ *Category:* ${formData.tripCategory}\n` +
      `🚌 *Bus Type:* ${formData.busType}\n` +
      `💺 *Capacity:* ${formData.seatCapacity}\n` +
      `🗓️ *Travel Month/Date:* ${formData.travelMonth || 'Not Decided'}\n` +
      `📝 *Notes:* ${formData.notes || 'None'}\n\n` +
      `Kripya hamari bus ka seating chart setup karke booking link generate karein.`
    );

    // Open WhatsApp after a short delay
    const cleanPhone = organizerPhone.replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(waLink, '_blank');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-300">
      
      {/* Top Header & Breadcrumb */}
      <div className="border-b border-slate-200/80 pb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3.5 py-1.5 rounded-xl transition-all mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('back')}</span>
        </button>

        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Tour Organizers & Group Leaders Platform</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 font-serif-heading tracking-tight leading-tight">
            {t('organize_hero_title')}
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            {t('organize_hero_desc')}
          </p>
        </div>
      </div>

      {/* Main Grid: Form on Left, Features & FAQ on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Interactive Listing Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200">
          <div className="border-b border-slate-100 pb-5 mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bus className="w-5 h-5 text-amber-600" />
              <span>Tour Details Application Form</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Yeh form bhar kar submit karein — hamari team turant aapke trip ka seating chart live karegi.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-4">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Aapki Details Submit Ho Gayi Hain!</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Aapka WhatsApp chat open kar diya gaya hai jisse aap hamare organizer helpline se seedha connect ho sakein.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Dusra Tour List Karein
                </button>
                <button
                  onClick={onNavigateToBook}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-all"
                >
                  Live Seating Chart Dekhein
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organizer / Mandal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil / Yuva Mitra Mandal"
                    value={formData.organizerName}
                    onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trip Destination *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shirdi, Goa, Balaji, Mahabaleshwar"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trip Category
                  </label>
                  <select
                    value={formData.tripCategory}
                    onChange={(e) => setFormData({ ...formData, tripCategory: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Family Yatra">Family Yatra / Pilgrimage</option>
                    <option value="Friends & Boys Group">Friends / Boys Group Trip</option>
                    <option value="Weekend Getaway">Weekend Getaway / Picnic</option>
                    <option value="Mandal / Society Tour">Mandal / Society Annual Tour</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bus Layout Type
                  </label>
                  <select
                    value={formData.busType}
                    onChange={(e) => setFormData({ ...formData, busType: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="2x2 Deluxe Pushback">2x2 Deluxe Pushback (Comfortable)</option>
                    <option value="3x2 Economy Seater">3x2 Economy Seater (High Capacity)</option>
                    <option value="2x1 AC Sleeper Coach">2x1 AC Sleeper Coach (Long Journey)</option>
                    <option value="Mini Bus / Traveller">Mini Bus / Tempo Traveller (17-26)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Approx Total Seats
                  </label>
                  <select
                    value={formData.seatCapacity}
                    onChange={(e) => setFormData({ ...formData, seatCapacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="30 Seats">30 Seats</option>
                    <option value="45 Seats">45 Seats</option>
                    <option value="48-49 Seats">48 - 49 Seats (Standard Deluxe)</option>
                    <option value="55 Seats">55 Seats</option>
                    <option value="72 Seats">72 Seats (Double Deck / Large)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Travel Month / Dates
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diwali Week, December Holidays, or March 2027"
                  value={formData.travelMonth}
                  onChange={(e) => setFormData({ ...formData, travelMonth: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Notes / Food / Stay Requirements (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Khana, hotel stay ya special stop halts ke bare me kuch batana chahein..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit & Connect On WhatsApp</span>
                </button>
              </div>

            </form>
          )}
        </div>

        {/* Right Column: Platform Benefits & Quick Helpline */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
              Why List On Sakinaka Tour?
            </span>

            <h3 className="text-xl font-bold font-serif-heading">
              Aapko Kya-Kya Suvidha Milegi?
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Zero Website & Hosting Cost</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Website developer ya server ka koi kharcha nahi. Sab kuch Sakinaka platform par live hota hai.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Dynamic Visual Seating Chart</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Aapki bus layout ke according (2x2, 3x2, sleeper, 30-72 seats) online booking chart banta hai.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Dedicated Organizer Admin Panel</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Yatriyon ki payment verify karein, custom discount de, aur 1-click printable passenger list nikalen.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Family Multi-Ticket Booking</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Ek primary number se pure parivar ki 1 se 60 seats tak ek sath book hoti hain bina har kisi ka number maange.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Direct WhatsApp Chat</span>
              </a>
            </div>
          </div>

          {/* Quick Helpline Card */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-600" />
              <span>Organizer Direct Helpline</span>
            </h4>
            <p className="text-xs text-slate-600">
              Agar aap direct baat karke tour list karwana chahte hain, toh humein call karein:
            </p>
            <div className="text-base font-black text-amber-900 font-mono">
              {organizerPhone}
            </div>
            <div className="text-[11px] text-slate-500">
              Timings: Subah 9:00 AM se Raat 10:00 PM tak
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

