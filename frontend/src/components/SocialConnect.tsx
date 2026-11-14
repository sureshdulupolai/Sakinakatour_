import React from 'react';
import { MessageCircle, Instagram, PhoneCall, Mail, MapPin, ExternalLink, QrCode } from 'lucide-react';
import { PublicSettings } from '../types';

interface SocialConnectProps {
  settings: PublicSettings;
}

export const SocialConnect: React.FC<SocialConnectProps> = ({ settings }) => {
  const whatsappUrl = settings.whatsapp_group_link || 'https://chat.whatsapp.com/G51k2L4x9diwaliYatraGroup';
  const instagramUrl = settings.instagram_profile_url || 'https://instagram.com/sakinakadiwalitour';
  const primaryPhone = settings.contact_phone || '+91 98200 45678';
  const altPhone = settings.contact_alt_phone || '+91 98200 12345';
  const email = settings.contact_email || 'sakinakadiwalitour@gmail.com';
  const emergencyPhone = settings.emergency_helpline || '+91 98200 99999';

  return (
    <section id="social" className="py-10 sm:py-14 bg-slate-50/50 border-b border-slate-200 notranslate" translate="no">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - Full Responsive Width & No Orphan Lines */}
        <div className="text-center max-w-4xl lg:max-w-5xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-md">
            Devotee Community & Support
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-serif-heading tracking-tight text-balance">
            Humse Sampark Karein & Parivar Se Judein
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Tour updates, photo sharing, live location aur darshan timings ke liye WhatsApp Group aur Instagram se judein.
          </p>
        </div>

        {/* 3 Main Action Cards: Balanced, Prominent & High Contrast */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          
          {/* Card 1: WhatsApp Group */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-200 hover:border-emerald-400 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Official Group
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  Official WhatsApp Group
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Yatra announcements, boarding alerts, lunch halts aur daily schedule ke liye join karein.
                </p>
              </div>

              {/* Prominent, Centered QR Scanner */}
              <div className="my-3 p-4 bg-slate-50/90 rounded-xl border border-slate-200/90 flex flex-col items-center justify-center">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 ring-1 ring-emerald-500/20">
                  <img
                    src="/wa_qr.png"
                    alt="WhatsApp QR Code"
                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600 mt-2.5 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Scan with Phone Camera to Join</span>
                </span>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all hover:scale-[1.01] shrink-0"
            >
              <span>Join WhatsApp Group</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Card 2: Instagram Community */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-rose-200 hover:border-rose-400 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-rose-500/15 text-rose-700 flex items-center justify-center shrink-0">
                  <Instagram className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Photos & Reels
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  Instagram Community
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Pichle saalon ki yatra photos, darshan videos, aarti reels aur upcoming posters dekhein.
                </p>
              </div>

              {/* Prominent, Centered QR Scanner */}
              <div className="my-3 p-4 bg-slate-50/90 rounded-xl border border-slate-200/90 flex flex-col items-center justify-center">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 ring-1 ring-rose-500/20">
                  <img
                    src="/insta_qr.png"
                    alt="Instagram QR Code"
                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600 mt-2.5 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-rose-600" />
                  <span>Scan with Instagram to Follow</span>
                </span>
              </div>
            </div>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm transition-all hover:scale-[1.01] shrink-0"
            >
              <span>Follow on Instagram</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Card 3: Direct Organizer Contact */}
          <div id="contact" className="bg-white rounded-2xl p-5 sm:p-6 border border-amber-200 hover:border-amber-400 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Direct Organizers
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  Direct Contact & Listing
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Tour jaankari, customized group trip organize karne ya booking ke liye hume call karein.
                </p>
              </div>

              <div className="space-y-2.5 pt-1 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Yatra Pramukh / Organizer</div>
                  <a href={`tel:${primaryPhone.replace(/\s+/g, '')}`} className="text-base font-black text-slate-950 hover:text-amber-700 block mt-0.5">
                    {primaryPhone}
                  </a>
                  <div className="text-xs text-slate-500">{altPhone}</div>
                </div>

                <div className="p-2.5 bg-rose-50/70 rounded-xl border border-rose-200/70">
                  <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">24x7 Emergency Yatra Helpline</div>
                  <a href={`tel:${emergencyPhone.replace(/\s+/g, '')}`} className="text-sm font-black text-rose-950 block mt-0.5">
                    {emergencyPhone}
                  </a>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Sakinaka Junction, Andheri East, Mumbai 400072</span>
                </div>
              </div>
            </div>

            <a
              href={`tel:${primaryPhone.replace(/\s+/g, '')}`}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all hover:scale-[1.01] shrink-0"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Organizer Now</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
