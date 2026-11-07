import React, { useState, useEffect } from 'react';
import { soundFX } from '../utils/audio';
import { storage } from '../services/storage';
import { X, Lock, Phone, User, Gift, Eye, EyeOff, CheckCircle2, LogIn, UserPlus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (message?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loginTerm, setLoginTerm] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginTerm.trim() || !password.trim()) {
      setErrorMsg('ইউজারনেম/মোবাইল নম্বর এবং পাসওয়ার্ড দিন।');
      return;
    }

    const res = storage.login(loginTerm, password);
    if (res.success) {
      soundFX.playWin();
      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess(res.message);
        onClose();
      }, 450);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickDemoLogin = () => {
    soundFX.playClick();
    setErrorMsg('');
    setLoginTerm('t1206248521');
    setPassword('123456');
    const res = storage.login('t1206248521', '123456');
    if (res.success) {
      soundFX.playWin();
      setSuccessMsg('ডেমো প্লেয়ার অ্যাকাউন্টে লগইন সফল হয়েছে!');
      setTimeout(() => {
        onSuccess('ডেমো প্লেয়ার অ্যাকাউন্টে লগইন সফল হয়েছে!');
        onClose();
      }, 400);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !phone.trim() || !password.trim()) {
      setErrorMsg('সকল প্রয়োজনীয় ঘর পূরণ করুন।');
      return;
    }
    if (username.trim().length < 4) {
      setErrorMsg('ইউজারনেম কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }
    if (phone.trim().length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)।');
      return;
    }
    if (password.trim().length < 6) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setErrorMsg('দুটি পাসওয়ার্ড মেলেনি! আবার যাচাই করুন।');
      return;
    }

    const res = storage.registerUser(username, phone, password, inviteCode);
    if (res.success) {
      soundFX.playWin();
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess(res.message);
        onClose();
      }, 600);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleGoogleLogin = () => {
    soundFX.playClick();
    setErrorMsg('');
    const res = storage.loginWithGoogle('sakibhasanu3@gmail.com', 'Sakib Hasan');
    if (res.success) {
      soundFX.playWin();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess(res.message);
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto select-none">
      <div className="bg-gradient-to-b from-[#2e0508] via-[#1c0305] to-[#120103] text-white p-5 rounded-3xl border border-[#7a121c] max-w-sm w-full relative shadow-2xl my-auto">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white bg-black/40 hover:bg-black/70 p-1.5 rounded-full transition-colors cursor-pointer"
          title="বন্ধ করুন"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="text-2xl font-black italic text-yellow-400 drop-shadow">
            Live<span className="text-white">x</span><span className="text-red-500">Win</span>
          </div>
          <span className="text-xs text-gray-300 font-medium">
            {mode === 'login'
              ? 'আপনার অ্যাকাউন্টে লগইন করুন'
              : 'নতুন অ্যাকাউন্ট তৈরি করুন ও ৳৬০ বোনাস নিন'}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-black/50 p-1 rounded-xl mb-4 border border-[#500c13]">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn size={13} />
            <span>লগইন (Login)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setMode('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus size={13} />
            <span>নিবন্ধন (+৳৬০)</span>
          </button>
        </div>

        {/* Error & Success Alerts */}
        {errorMsg && (
          <div className="mb-3 p-2.5 bg-red-950/90 border border-red-500 rounded-xl text-red-200 text-xs text-center font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-3 p-2.5 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-200 text-xs text-center font-bold flex items-center justify-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-[11px] text-gray-300 font-bold block mb-1">
                ইউজারনেম বা মোবাইল নম্বর:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginTerm}
                  onChange={e => setLoginTerm(e.target.value)}
                  placeholder="t1206248521 অথবা 01712062485"
                  className="w-full bg-black/50 border border-[#500c13] rounded-xl py-2.5 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-300 font-bold block mb-1">
                পাসওয়ার্ড:
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড দিন"
                  className="w-full bg-black/50 border border-[#500c13] rounded-xl py-2.5 pl-8 pr-9 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <Lock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-300 pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-red-800 accent-amber-400"
                />
                <span>পাসওয়ার্ড মনে রাখুন</span>
              </label>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="text-amber-400 hover:underline font-bold cursor-pointer"
              >
                ওয়ান-ক্লিক ডেমো লগইন
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl text-xs shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              লগইন করুন (Login)
            </button>

            <div className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-[11px] text-gray-300 flex items-center justify-between">
              <div>
                <span className="text-gray-400 block text-[10px]">ডিফল্ট প্লেয়ার অ্যাকাউন্ট:</span>
                <span className="font-mono text-yellow-300 font-bold">ইউজার: t1206248521 | পাস: 123456</span>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black font-black rounded-lg text-[10px] shrink-0 cursor-pointer"
              >
                অটো লগইন
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-2.5">
            <div>
              <label className="text-[11px] text-gray-300 font-bold block mb-1">
                নতুন ইউজারনেম (কমপক্ষে ৪ অক্ষর):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="যেমন: sakib99"
                  className="w-full bg-black/50 border border-[#500c13] rounded-xl py-2 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-300 font-bold block mb-1">
                মোবাইল নম্বর (১১ ডিজিট):
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="01712062485"
                  maxLength={11}
                  className="w-full bg-black/50 border border-[#500c13] rounded-xl py-2 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-300 font-bold block mb-1">
                পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর):
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড দিন"
                  className="w-full bg-black/50 border border-[#500c13] rounded-xl py-2 pl-8 pr-9 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <Lock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-300 font-bold block mb-1">
                পাসওয়ার্ড নিশ্চিত করুন:
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="পুনরায় পাসওয়ার্ড দিন"
                  className="w-full bg-black/50 border border-[#500c13] rounded-xl py-2 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <Lock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-300 font-bold block mb-1">
                আমন্ত্রণ কোড (ঐচ্ছিক):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                  placeholder="INVITE99"
                  className="w-full bg-black/50 border border-[#500c13] rounded-xl py-2 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono uppercase"
                />
                <Gift size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-105 text-black font-black rounded-xl text-xs shadow-lg mt-2 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
            >
              <Gift size={14} />
              <span>নিবন্ধন সম্পন্ন করুন ও ৳৬০ বোনাস নিন</span>
            </button>
          </form>
        )}

        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-gray-400 font-bold uppercase">অথবা</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-3 bg-white hover:bg-gray-100 text-gray-800 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md border border-gray-200 active:scale-95 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>গুগল দিয়ে সাইন ইন করুন (Google Sign In)</span>
        </button>
      </div>
    </div>
  );
};
