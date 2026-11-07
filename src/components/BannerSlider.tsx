import React, { useState, useEffect, useRef } from 'react';
import { soundFX } from '../utils/audio';
import { storage } from '../services/storage';
import { PromoSlideItem } from '../types';

interface BannerSliderProps {
  onOpenDeposit: () => void;
  onOpenEggGame: () => void;
  onOpenRedPacket: () => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({
  onOpenDeposit,
  onOpenEggGame,
  onOpenRedPacket,
}) => {
  const [assets, setAssets] = useState(storage.getSiteAssets());

  useEffect(() => {
    const handleUpdate = () => {
      setAssets(storage.getSiteAssets());
    };
    window.addEventListener('livexwin_assets_updated', handleUpdate);
    return () => window.removeEventListener('livexwin_assets_updated', handleUpdate);
  }, []);

  const slides: PromoSlideItem[] = assets.banners.length > 0 ? assets.banners : [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Keep index within bounds if banners changed
  const validIdx = slides.length > 0 ? currentIdx % slides.length : 0;

  // Automatically advance every 2 seconds (2000ms) with smooth sliding animation
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % slides.length);
    }, 2000); // 2 seconds as requested by the user

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handleAction = (slide: PromoSlideItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFX.playClick();
    if (slide.action === 'deposit') onOpenDeposit();
    else if (slide.action === 'egg') onOpenEggGame();
    else if (slide.action === 'redpacket') onOpenRedPacket();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    if (slides.length > 0) {
      setCurrentIdx(prev => (prev + 1) % slides.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    if (slides.length > 0) {
      setCurrentIdx(prev => (prev - 1 + slides.length) % slides.length);
    }
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipeLeft = distance > 45;
    const isSwipeRight = distance < -45;

    if (slides.length > 0) {
      if (isSwipeLeft) {
        setCurrentIdx(prev => (prev + 1) % slides.length);
      } else if (isSwipeRight) {
        setCurrentIdx(prev => (prev - 1 + slides.length) % slides.length);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="w-full max-w-lg mx-auto px-2 pt-2">
      {/* Outer Banner Wrapper with Rounded Corners and Glowing Border */}
      <div
        className="w-full h-44 sm:h-52 rounded-xl overflow-hidden relative shadow-[0_4px_20px_rgba(0,0,0,0.85)] border border-[#6b141d]/80 bg-[#140103] select-none group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sliding Track - Slides smoothly from side to side */}
        <div
          className="w-full h-full flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translateX(-${validIdx * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              onClick={() => handleAction(slide)}
              className="w-full min-w-full h-full relative cursor-pointer overflow-hidden flex items-center shrink-0"
            >
              {/* Full Image Banner (ফুল ছবি শো করবে এই সাইজে) */}
              <img
                src={slide.bgImage}
                alt={slide.title1}
                className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />

              {/* Dynamic Gradient Vignette Overlay to ensure text readability while showing full image */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${slide.gradientOverlay}`}
              />

              {/* Top & Bottom Soft Shadow for visual depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Golden Aztec / Particle Glow Effect in background */}
              <div className="absolute -right-6 -bottom-6 w-44 h-44 bg-gradient-to-tl from-amber-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />

              {/* Slide Content: Badge, 3D Bengali Typography, and CTA Button */}
              <div className="relative z-10 w-full h-full p-4 flex flex-col justify-between">
                {/* Top Row: Badge & Current Index Indicator */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black text-white bg-gradient-to-r ${slide.badgeColor} shadow-[0_2px_8px_rgba(0,0,0,0.6)] border border-white/20`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {slide.badge}
                  </span>

                  <span className="text-[10px] font-bold text-amber-200/80 bg-black/50 px-2 py-0.5 rounded-full border border-amber-500/30 backdrop-blur-xs">
                    {idx + 1} / {slides.length}
                  </span>
                </div>

                {/* Middle Row: Bengali Typography with 3D Gold Glow */}
                <div className="my-auto">
                  <h2 className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] leading-tight tracking-wide font-['Hind_Siliguri']">
                    {slide.title1}
                  </h2>
                  <p className="text-sm sm:text-base font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] leading-snug mt-0.5">
                    {slide.title2}
                  </p>
                  <div className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] mt-1 tracking-tight">
                    {slide.amount}
                  </div>
                </div>

                {/* Bottom Row: Action Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => handleAction(slide, e)}
                    className="px-3.5 py-1 rounded-full text-xs font-black text-[#2e0407] bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 hover:brightness-110 shadow-[0_2px_8px_rgba(245,158,11,0.5)] border border-yellow-200 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span>{slide.btnText}</span>
                    <span className="text-sm leading-none font-bold">›</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subtle Previous / Next Chevrons (visible on hover) */}
        <button
          onClick={handlePrev}
          aria-label="Previous Banner"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-amber-300 flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-20 active:scale-90"
        >
          ‹
        </button>
        <button
          onClick={handleNext}
          aria-label="Next Banner"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-amber-300 flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-20 active:scale-90"
        >
          ›
        </button>

        {/* Bottom Dot Indicators with Smooth Fill */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={e => {
                e.stopPropagation();
                soundFX.playClick();
                setCurrentIdx(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                validIdx === i
                  ? 'w-5 bg-gradient-to-r from-yellow-300 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                  : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
