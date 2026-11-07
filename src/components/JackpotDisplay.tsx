import React, { useState, useEffect } from 'react';

export const JackpotDisplay: React.FC = () => {
  const [jackpot, setJackpot] = useState<number>(28325281.18);

  useEffect(() => {
    const timer = setInterval(() => {
      setJackpot(prev => prev + Number((Math.random() * 0.35 + 0.05).toFixed(2)));
    }, 250);
    return () => clearInterval(timer);
  }, []);

  const formattedJackpot = jackpot.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="w-full max-w-lg mx-auto px-2 my-3 select-none">
      {/* Title Header matching page 6: 'জ্যাকপট - পুরস্কারের পুল ক্রমাগত বাড়ছে' */}
      <div className="text-center mb-1.5">
        <h3 className="text-base font-black text-amber-300 drop-shadow">
          জ্যাকপট
        </h3>
        <p className="text-xs text-white/90 font-medium">
          পুরস্কারের পুল ক্রমাগত বাড়ছে
        </p>
      </div>

      {/* Main Jackpot Graphic Frame (Exact Clone of PDF page 6) */}
      <div className="bg-gradient-to-r from-[#38060a] via-[#520910] to-[#38060a] p-2.5 rounded-2xl border-2 border-[#b81d28] shadow-2xl flex items-center justify-between gap-2 relative overflow-hidden">
        {/* Left: JACKPOT Winners Badge */}
        <div className="flex flex-col items-start leading-none pl-1">
          <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-yellow-400 drop-shadow-[0_2px_6px_rgba(255,215,0,0.8)]">
            JACKPOT
          </span>
          <span className="text-[11px] italic font-bold text-rose-200 -mt-0.5">
            Winners
          </span>
        </div>

        {/* Right: Golden Glowing Digital Ticker Box */}
        <div className="flex-1 bg-black/80 py-1.5 px-3 rounded-xl border border-yellow-400/80 shadow-inner flex items-center justify-center">
          <span className="text-lg sm:text-xl md:text-2xl font-black font-num tracking-wider text-yellow-300 drop-shadow">
            {formattedJackpot}
          </span>
        </div>
      </div>
    </div>
  );
};
