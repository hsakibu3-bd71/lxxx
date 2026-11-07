import React from 'react';
import { soundFX } from '../utils/audio';
import { Home, Gift, Share2, User } from 'lucide-react';

export type ActiveTab = 'home' | 'promo' | 'deposit' | 'invite' | 'member';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const handleClick = (tab: ActiveTab) => {
    soundFX.playClick();
    onChangeTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#140103] via-[#240306] to-[#2a0408] border-t border-[#681119] shadow-2xl">
      <div className="max-w-md mx-auto px-2 py-1 flex items-center justify-between relative select-none">
        {/* 1. হোম (Home) with real Home icon */}
        <button
          onClick={() => handleClick('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'home' ? 'text-amber-300 font-extrabold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            activeTab === 'home'
              ? 'bg-gradient-to-tr from-amber-400 to-yellow-400 text-black shadow-md shadow-amber-500/40'
              : 'bg-[#3a060c] text-gray-300 border border-[#6b141d]'
          }`}>
            <Home size={17} />
          </div>
          <span className="text-[10px] mt-0.5 font-bold">হোম</span>
          {activeTab === 'home' && (
            <span className="w-5 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mt-0.5 shadow-[0_0_4px_#f59e0b]" />
          )}
        </button>

        {/* 2. প্রমোশন (Promotion) with 3D gift box matching IMG_0286.png */}
        <button
          onClick={() => handleClick('promo')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'promo' ? 'text-amber-300 font-extrabold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#8f111b] to-[#54060c] flex items-center justify-center border border-amber-400/50 shadow-md">
            <Gift size={18} className="text-amber-300" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold">প্রমোশন</span>
          {activeTab === 'promo' && (
            <span className="w-5 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mt-0.5 shadow-[0_0_4px_#f59e0b]" />
          )}
        </button>

        {/* 3. ডিপোজিট (Center Raised Golden Treasure Bag with Coins matching IMG_0286.png) */}
        <div className="relative -top-4 flex flex-col items-center px-1">
          <button
            onClick={() => handleClick('deposit')}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shadow-2xl active:scale-95 transition-transform flex items-center justify-center ring-4 ring-[#160103]"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#7e0d17] via-[#a31522] to-[#5c080f] flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
              <span className="text-2xl select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">💰</span>
              <div className="absolute -top-1 w-6 h-2 bg-yellow-300/60 rounded-full blur-[0.5px]" />
            </div>
          </button>
          <span className="text-[10px] font-black text-amber-300 drop-shadow tracking-tight mt-0.5">
            ডিপোজিট
          </span>
        </div>

        {/* 4. আমন্ত্রণ (Invite) with orange circular share icon matching IMG_0286.png */}
        <button
          onClick={() => handleClick('invite')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'invite' ? 'text-amber-300 font-extrabold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-md border border-amber-300/40">
            <Share2 size={16} className="text-white" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold">আমন্ত্রণ</span>
          {activeTab === 'invite' && (
            <span className="w-5 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mt-0.5 shadow-[0_0_4px_#f59e0b]" />
          )}
        </button>

        {/* 5. সদস্য (Member Profile) with user avatar matching IMG_0286.png */}
        <button
          onClick={() => handleClick('member')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'member' ? 'text-amber-300 font-extrabold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center shadow-md border border-pink-300/40">
            <User size={16} className="text-white" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold">সদস্য</span>
          {activeTab === 'member' && (
            <span className="w-5 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mt-0.5 shadow-[0_0_4px_#f59e0b]" />
          )}
        </button>
      </div>
    </nav>
  );
};
