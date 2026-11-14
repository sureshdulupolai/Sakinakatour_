import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Clock, CheckCircle, ArrowRight, User } from 'lucide-react';
import { sendOtp, verifyOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, showToast }) => {
  const { loginWithToken } = useAuth();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.length !== 10 || !['6', '7', '8', '9'].includes(cleanPhone[0])) {
      showToast('error', 'Invalid Phone', 'Kripya 10-digit valid Indian mobile number dalein (starts with 6-9).');
      return;
    }
    if (!name.trim()) {
      showToast('error', 'Name Required', 'Kripya apna shubh naam dalein.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(cleanPhone);
      setOtpSent(true);
      setCountdown(60);
      if (res.demo_otp) {
        setDemoOtp(res.demo_otp);
        setOtpInput(res.demo_otp);
      }
      showToast('success', 'OTP Sent!', res.message);
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      showToast('error', 'Invalid OTP', 'Kripya 6-digit OTP code dalein.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({
        phone: phone.replace(/[^\d]/g, ''),
        otp: otpInput.trim(),
        name: name.trim(),
        age: age ? parseInt(age) : undefined,
        gender: gender,
      });
      loginWithToken(res.token, res.user);
      showToast('success', 'Login Successful', `Swagatam, ${res.user.name}!`);
      onClose();
    } catch (err: any) {
      showToast('error', 'Verification Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 space-y-5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Devotee Mobile Login
              </h3>
              <p className="text-xs text-slate-500">
                Fast OTP login for booking & ticket status
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Aapka Shubh Naam (Full Name) *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Suresh Bhai Sharma"
              disabled={otpSent}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Indian Mobile Number *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98200XXXXX"
                disabled={otpSent}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Age
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="45"
                disabled={otpSent}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={otpSent}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {otpSent && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="• • • • • •"
                className="w-full text-center tracking-widest text-lg font-bold py-2.5 rounded-xl border border-slate-300 bg-white"
              />
              {demoOtp && (
                <div className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 flex items-center justify-between">
                  <span>Demo OTP: <strong>{demoOtp}</strong></span>
                  <span className="text-[10px] text-amber-600">Auto-filled</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-slate-500">
                {countdown > 0 ? (
                  <span>Resend in {countdown}s</span>
                ) : (
                  <button onClick={handleSendOtp} className="text-amber-700 font-bold hover:underline">
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Get OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Verify & Login</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

