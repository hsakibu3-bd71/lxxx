import React from 'react';
import { soundFX } from '../utils/audio';

interface MarqueeNoticeProps {
  onOpenMailbox: () => void;
  announcementText?: string;
}

export const MarqueeNotice: React.FC<MarqueeNoticeProps> = ({
  onOpenMailbox,
  announcementText,
}) => {
  const text =
    announcementText ||
    '❤️ নতুন ইউজার: রেজিস্ট্রেশন রিওয়ার্ড সর্বোচ্চ ৳৬০+৳৮,৮৮৮ (APP রিওয়ার্ড)। ফ্রি লগইন রিওয়ার্ড সর্বোচ্চ ৳৯,৯৯৯। প্রথম রিচার্জে +১৮০% রিওয়ার্ড। প্রতিদিনের প্রথম রিচার্জে +১০% রিওয়ার্ড। প্রতিটি রিচার্জে রিওয়ার্ড পান, সর্বোচ্চ ৳২,৮৮৮ পর্যন্ত। একজন বন্ধুকে আমন্ত্রণ করলে সর্বোচ্চ ৳২,৮৯৯ রিওয়ার্ড পান।';

  return (
    <div className="w-full max-w-lg mx-auto px-2 my-2">
      <div className="bg-[#240407] rounded-full border border-[#5c0d15] px-2.5 py-1 flex items-center justify-between gap-2 shadow-inner">
        {/* Loudspeaker icon in red badge matching PDF */}
        <div className="w-6 h-6 rounded-full bg-[#52090f] flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
          <span className="text-xs">📢</span>
        </div>

        {/* Marquee text ticker */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee text-xs text-yellow-200 font-medium">
            {text}
          </div>
        </div>

        {/* Yellow Envelope with red badge '6' (Exact clone of PDF screenshot) */}
        <button
          onClick={() => {
            soundFX.playClick();
            onOpenMailbox();
          }}
          className="relative text-amber-400 hover:text-white p-1 shrink-0 ml-1"
          title="মেইলবক্স (৬টি বার্তা)"
        >
          <span className="text-base select-none">✉️</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center border border-black shadow">
            6
          </span>
        </button>
      </div>
    </div>
  );
};
