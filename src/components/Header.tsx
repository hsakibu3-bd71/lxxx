import React, { useState } from 'react';
import { UserProfile } from '../types';
import { soundFX } from '../utils/audio';
import { X, RefreshCw, LogOut } from 'lucide-react';
import { LivexWinLogo } from './LivexWinLogo';
import { storage } from '../services/storage';

interface HeaderProps {
  user: UserProfile | null;
  onRefreshBalance: () => void;
  onOpenDeposit: () => void;
  onOpenMember: () => void;
  onOpenAppDownload: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onRefreshBalance,
  onOpenMember,
  onOpenAppDownload,
  onOpenAuth,
  onLogout,
}) => {
  const [showAppBanner, setShowAppBanner] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [siteAssets, setSiteAssets] = useState(storage.getSiteAssets());

  React.useEffect(() => {
    const handleUpdate = () => {
      setSiteAssets(storage.getSiteAssets());
    };
    window.addEventListener('livexwin_assets_updated', handleUpdate);
    return () => window.removeEventListener('livexwin_assets_updated', handleUpdate);
  }, []);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    setIsRefreshing(true);
    onRefreshBalance();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1e0205] shadow-lg border-b border-[#4d080e]">
      {/* 1. Top App Download Bar */}
      {showAppBanner && (
        <div className="bg-[#2e0508] border-b border-[#5a0c12] px-3 py-1 flex items-center justify-between text-xs max-w-lg mx-auto">
          {/* Logo + Rating */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-amber-500 to-red-700 p-0.5 shadow flex items-center justify-center">
              <span className="text-[11px] font-black text-yellow-200 leading-none text-center">
                LXW
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-[11px] leading-tight tracking-wider">
                LivexWin APP
              </span>
              <div className="flex text-amber-400 text-[10px] leading-tight">
                ★★★★★
              </div>
            </div>
          </div>

          {/* Download Button + Close */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenAppDownload();
              }}
              className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black px-3 py-1 rounded-full text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              অ্যাপ ডাউনলোড
            </button>
            <button
              onClick={() => setShowAppBanner(false)}
              className="w-5 h-5 rounded-full border border-gray-400 text-gray-300 hover:text-white flex items-center justify-center text-xs ml-0.5 cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <div className="px-3 py-2 flex items-center justify-between max-w-lg mx-auto">
        {/* Left: 3 White Horizontal Bars + LivexWin Logo */}
        <div className="flex items-center gap-2.5">
          {/* 3 Horizontal Bars Hamburger */}
          <button
            onClick={() => {
              soundFX.playClick();
              if (user) {
                onOpenMember();
              } else {
                onOpenAuth('login');
              }
            }}
            className="text-white hover:text-amber-400 p-0.5 focus:outline-none flex flex-col justify-center gap-1 w-6 h-5 cursor-pointer"
            title="মেনু"
          >
            <span className="w-5 h-0.5 bg-white rounded-full block" />
            <span className="w-5 h-0.5 bg-white rounded-full block" />
            <span className="w-5 h-0.5 bg-white rounded-full block" />
          </button>

          {/* LivexWin Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer flex items-center select-none active:scale-95 transition-transform"
            title="LivexWin হোম"
          >
            {siteAssets.siteLogoUrl ? (
              <img
                src={siteAssets.siteLogoUrl}
                alt="LivexWin"
                className="h-8 sm:h-9 object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              />
            ) : (
              <LivexWinLogo size="md" showDomain={true} />
            )}
          </div>
        </div>

        {/* Right: Unregistered [লগইন] [নিবন্ধন] OR Registered User Capsule + Logout */}
        <div className="flex items-center gap-1.5">
          {!user ? (
            <div className="flex items-center gap-1.5">
              {/* লগইন (Login) - Dark Red Button */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  onOpenAuth('login');
                }}
                className="px-3 py-1.5 bg-gradient-to-b from-[#8f111c] via-[#750b14] to-[#59070d] hover:brightness-115 text-white font-black text-xs rounded-lg border border-[#b81d28] shadow-md active:scale-95 transition-all cursor-pointer"
              >
                লগইন
              </button>

              {/* নিবন্ধন (Register) - Vibrant Golden Yellow Button */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  onOpenAuth('register');
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 hover:brightness-110 text-[#240406] font-black text-xs rounded-lg shadow-md border border-yellow-200 active:scale-95 transition-all cursor-pointer"
              >
                নিবন্ধন
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div
                onClick={() => {
                  soundFX.playClick();
                  onOpenMember();
                }}
                className="flex items-center gap-1.5 cursor-pointer bg-black/40 hover:bg-black/60 py-0.5 px-2 rounded-full border border-red-900/60"
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full overflow-hidden border border-yellow-400 shrink-0">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* User ID & Balance */}
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[11px] font-bold text-white font-mono tracking-tight">
                    {user.username}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="text-[11px] font-bold text-yellow-300 font-num">
                      {user.wallet.balance.toFixed(2)}
                    </span>
                    <button
                      onClick={handleRefresh}
                      className="text-gray-300 hover:text-white ml-0.5 cursor-pointer"
                      title="ব্যালেন্স রিফ্রেশ"
                    >
                      <RefreshCw
                        size={10}
                        className={isRefreshing ? 'animate-spin text-yellow-400' : ''}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Logout Button */}
              {onLogout && (
                <button
                  onClick={() => {
                    soundFX.playClick();
                    onLogout();
                  }}
                  className="p-1.5 rounded-full bg-red-950/80 hover:bg-red-800 text-red-200 hover:text-white border border-red-700/60 shadow transition-colors cursor-pointer"
                  title="লগআউট করুন (Logout)"
                >
                  <LogOut size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
