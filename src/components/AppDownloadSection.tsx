import React from 'react';
import { Apple, Smartphone, ChevronRight } from 'lucide-react';
import { soundFX } from '../utils/audio';
import { LivexWinLogo } from './LivexWinLogo';

interface AppDownloadSectionProps {
  onOpenDeposit: () => void;
  onOpenAndroidApp?: () => void;
}

export const AppDownloadSection: React.FC<AppDownloadSectionProps> = ({ onOpenDeposit, onOpenAndroidApp }) => {
  const handleDownload = (platform: string) => {
    soundFX.playWin();
    if (platform === 'Android' && onOpenAndroidApp) {
      onOpenAndroidApp();
    } else {
      alert(`LivexWin ${platform} অফিসিয়াল অ্যাপ ডাউনলোড লিংক প্রস্তুত!`);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-2 my-3 select-none">
      {/* Sleek App Download Container (বার্তি লেখা সম্পূর্ণ বাদ দিয়ে পরিচ্ছন্ন ৬০বিডি পেজ ৮ স্টাইল) */}
      <div className="flex flex-col items-center text-center">
        {/* Brand Name Badge: LivexWin Logo matching IMG_0287.png */}
        <div className="flex items-center justify-center my-2.5">
          <LivexWinLogo size="lg" showDomain={true} />
        </div>

        {/* Red Buttons matching 60BD page 8: 'iOS' and 'অ্যান্ড্রয়েড' */}
        <div className="w-full max-w-xs space-y-2">
          {/* iOS button */}
          <button
            onClick={() => handleDownload('iOS')}
            className="w-full py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black rounded-full text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all border border-rose-500/30"
          >
            <Apple size={16} />
            <span>iOS</span>
          </button>

          {/* Android button */}
          <button
            onClick={() => handleDownload('Android')}
            className="w-full py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black rounded-full text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all border border-rose-500/30"
          >
            <Smartphone size={16} />
            <span>অ্যান্ড্রয়েড (ওয়েবভিউ অটো-আপডেট)</span>
          </button>
        </div>

        {/* Deposit Row matching page 8: 'Deposit >' */}
        <div
          onClick={() => {
            soundFX.playClick();
            onOpenDeposit();
          }}
          className="w-full max-w-xs mt-3 py-2 px-4 bg-[#2b0407] hover:bg-[#3d060a] border border-[#5a0c13] rounded-xl flex items-center justify-between cursor-pointer transition-colors shadow-xs active:scale-98"
        >
          <span className="text-xs font-bold text-amber-300">Deposit</span>
          <ChevronRight size={16} className="text-amber-300" />
        </div>
      </div>
    </div>
  );
};
