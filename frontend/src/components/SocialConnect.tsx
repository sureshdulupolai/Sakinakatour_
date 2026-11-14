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
    <section id="social" className="py-16 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
            Devotee Community & Support
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif-heading">
            Humse Sampark Karein & Parivar Se Judein
          </h2>
          <p className="text-sm text-slate-600">
            Tour updates, photo sharing, live location aur darshan timings ke liye WhatsApp Group aur Instagram se judein.
          </p>
        </div>

        {/* 3 Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: WhatsApp Group Card */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-200/80 card-hover-lift flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                  Official Group
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">Official WhatsApp Group</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Yatra announcements, boarding point alerts, lunch halts aur daily schedule ke liye yahan join karein.
              </p>

              {/* QR Code preview */}
              <div className="my-5 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                <img
                  src="/wa_qr.png"
                  alt="WhatsApp QR Code"
                  className="w-36 h-36 object-contain rounded-xl bg-white p-1 border border-slate-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-emerald-600" />
                  Scan to join group directly
                </span>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
            >
              <span>Join WhatsApp Group</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Card 2: Instagram Community Card */}
          <div className="bg-white rounded-3xl p-6 border border-rose-200/80 card-hover-lift flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Instagram className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">
                  Photos & Reels
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">Instagram Community</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Pichle saalon ki yatra photos, darshan videos, aarti reels aur upcoming tour posters dekhein.
              </p>

              {/* QR Code preview */}
              <div className="my-5 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                <img
                  src="/insta_qr.png"
                  alt="Instagram QR Code"
                  className="w-36 h-36 object-contain rounded-xl bg-white p-1 border border-slate-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-rose-600" />
                  Scan with Camera or Insta
                </span>
              </div>
            </div>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-sm transition-all"
            >
              <span>Follow on Instagram</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Card 3: Organizer Contact & Emergency Helpline */}
          <div id="contact" className="bg-white rounded-3xl p-6 border border-amber-200/80 card-hover-lift flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <PhoneCall className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                  Direct Organizers
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Direct Contact & Tour Listing</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Kissi bhi jaankari, apna tour ya group trip list karwane ya booking ke liye hume call ya WhatsApp karein.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Yatra Pramukh / Organizer</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{primaryPhone}</div>
                  <div className="text-xs text-slate-500">{altPhone}</div>
                </div>

                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                  <div className="text-[11px] font-bold text-rose-700 uppercase">24x7 Emergency Yatra Helpline</div>
                  <div className="text-sm font-bold text-rose-950 mt-0.5">{emergencyPhone}</div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                  <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{email}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sakinaka & Ghatkopar, Mumbai, Maharashtra</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={`tel:${primaryPhone.replace(/\s+/g, '')}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Organizer Now</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

