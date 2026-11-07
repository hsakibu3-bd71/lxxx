import React, { useState, useEffect } from 'react';
import { soundFX } from '../utils/audio';
import { storage } from '../services/storage';

interface PaymentFooterProps {
  onOpenDeposit: () => void;
  telegramLink?: string;
}

export const PaymentFooter: React.FC<PaymentFooterProps> = ({ onOpenDeposit }) => {
  const [assets, setAssets] = useState(storage.getSiteAssets());

  useEffect(() => {
    const handleUpdate = () => {
      setAssets(storage.getSiteAssets());
    };
    window.addEventListener('livexwin_assets_updated', handleUpdate);
    return () => window.removeEventListener('livexwin_assets_updated', handleUpdate);
  }, []);

  const paymentMethods = assets.paymentMethods.filter(m => m.enabled);

  return (
    <footer className="w-full max-w-lg mx-auto px-3 pt-4 pb-24 border-t border-[#3e080d] bg-[#120103] text-gray-400 select-none">
      {/* 1. Sleek Compact Payment Methods (বড় ছবি বাদ দিয়ে স্লিম ও প্রফেশনাল ডিজাইন) */}
      <div className="mb-4 text-center">
        <h4 className="font-extrabold text-white text-xs mb-2 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>পেমেন্ট মেথড (Payment Methods)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        </h4>

        {/* Compact, Clean Payment Methods Grid (No Large Images) */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-w-md mx-auto">
          {paymentMethods.map(pm => (
            <div
              key={pm.id}
              onClick={() => {
                soundFX.playClick();
                onOpenDeposit();
              }}
              className="p-1.5 bg-gradient-to-b from-[#220306] to-[#140204] rounded-xl border border-[#4d0b12] hover:border-amber-400/60 transition-all cursor-pointer shadow-md active:scale-95 group flex flex-col items-center justify-center"
              title={`${pm.nameBn} দিয়ে ডিপোজিট করুন`}
            >
              <div className="w-7 h-7 flex items-center justify-center mb-1">
                <img
                  src={pm.logoUrl}
                  alt={pm.name}
                  className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="text-[10px] font-bold text-gray-200 group-hover:text-amber-300 transition-colors">
                {pm.nameBn}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Official Game Providers Grid with Background Removed (মোবাইল ও কম্পিউটার ফ্রেন্ডলি) */}
      <div className="mb-5 text-center">
        <h4 className="font-extrabold text-white text-xs mb-2.5 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          <span>অফিসিয়াল গেম প্রোভাইডার (Game Providers)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
        </h4>

        {/* Responsive Transparent Providers Grid */}
        <div className="w-full p-2.5 bg-gradient-to-b from-[#1c0205] to-[#100102] rounded-2xl border border-[#480a11] shadow-xl">
          <img
            src={assets.footerProvidersImageUrl || '/assets/aistudio/providers_transparent.png'}
            alt="All Game Providers: Pragmatic Play, JILI, Hacksaw, Nolimit City, Play'n GO, Evolution, Spadegaming, Microgaming, etc."
            className="w-full h-auto max-h-48 object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] mx-auto"
            loading="lazy"
          />
        </div>
      </div>

      {/* 3. Verification & Trust Badges matching 60BD page 8 */}
      <div className="grid grid-cols-3 gap-2 text-[10px] text-center mb-4">
        {/* Verification */}
        <div className="p-2 bg-black/40 rounded-xl border border-white/5">
          <span className="font-bold text-gray-300 block mb-1">যাচাই ও লাইসেন্স</span>
          <div className="flex flex-wrap justify-center gap-1 font-mono text-[9px] text-gray-400">
            <span className="bg-white/5 px-1.5 py-0.5 rounded">PECHMS</span>
            <span className="bg-white/5 px-1.5 py-0.5 rounded">iTech Labs</span>
          </div>
        </div>

        {/* Telegram Community */}
        <div className="p-2 bg-black/40 rounded-xl border border-white/5 flex flex-col justify-center items-center">
          <span className="font-bold text-gray-300 block mb-1">টেলিগ্রাম</span>
          <a
            href="https://t.me/livexwin_official"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundFX.playClick()}
            className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-bold"
          >
            <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px]">
              ✈
            </span>
            <span>চ্যানেল</span>
          </a>
        </div>

        {/* Security / Responsible Gaming */}
        <div className="p-2 bg-black/40 rounded-xl border border-white/5">
          <span className="font-bold text-gray-300 block mb-1">সুরক্ষা</span>
          <div className="flex flex-wrap justify-center gap-1 font-mono text-[9px] text-gray-400">
            <span className="bg-white/5 px-1.5 py-0.5 rounded">GamCare</span>
            <span className="bg-white/5 px-1.5 py-0.5 rounded">Interac</span>
          </div>
        </div>
      </div>

      {/* 4. Strict Copyright: Only ©2026 livexwin.com */}
      <div className="text-center text-[11px] text-gray-400 border-t border-[#2a0508] pt-3 font-mono">
        ©2026 livexwin.com
      </div>
    </footer>
  );
};
