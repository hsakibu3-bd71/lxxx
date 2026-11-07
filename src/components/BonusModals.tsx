import React, { useState, useEffect } from 'react';
import { soundFX } from '../utils/audio';
import { storage } from '../services/storage';
import { X, Sparkles, Gift, Clock, Award, ShieldCheck, HeartHandshake, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GoldenEggModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: () => void;
}

export const GoldenEggModal: React.FC<GoldenEggModalProps> = ({ isOpen, onClose, onRewardClaimed }) => {
  const [selectedEgg, setSelectedEgg] = useState<number | null>(null);
  const [crackedEgg, setCrackedEgg] = useState<number | null>(null);
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);
  const [isClaimed, setIsClaimed] = useState<boolean>(false);
  const settings = storage.getSiteSettings();
  const user = storage.getCurrentUser();

  if (!isOpen) return null;

  const handleSelectOrCrack = (idx: number) => {
    soundFX.playClick();
    setSelectedEgg(idx);
  };

  const handleClaim = () => {
    if (crackedEgg !== null) {
      handleReset();
      return;
    }

    const eggToCrack = selectedEgg !== null ? selectedEgg : Math.floor(Math.random() * 8);
    setCrackedEgg(eggToCrack);
    soundFX.playSpin();

    const res = storage.crackGoldenEgg();
    if (res.success) {
      setRewardAmount(res.amount);
      setIsClaimed(true);
      soundFX.playJackpot();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
      onRewardClaimed();
    } else {
      alert(res.message);
      setCrackedEgg(null);
    }
  };

  const handleReset = () => {
    setSelectedEgg(null);
    setCrackedEgg(null);
    setRewardAmount(null);
    setIsClaimed(false);
    onClose();
  };

  // 8 Golden Eggs matching IMG_0284.png
  // Row 1: 2 eggs (idx 0, 1)
  // Row 2: 3 eggs (idx 2, 3, 4)
  // Row 3: 3 eggs (idx 5, 6, 7)
  const renderEgg = (idx: number) => {
    const isSelected = selectedEgg === idx;
    const isCracked = crackedEgg === idx;

    return (
      <div
        key={idx}
        onClick={() => handleSelectOrCrack(idx)}
        className="flex flex-col items-center justify-center cursor-pointer group relative transition-transform duration-300"
      >
        {/* Glowing halo behind egg matching IMG_0284.png */}
        <div className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500/30 to-amber-400/20 blur-md pointer-events-none animate-pulse" />

        {/* 3D Golden Egg */}
        <div
          className={`w-14 sm:w-16 h-18 sm:h-20 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] relative transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.8)] border border-yellow-200/60 ${
            isCracked
              ? 'scale-110 rotate-6 filter brightness-125'
              : isSelected
              ? 'scale-108 ring-4 ring-yellow-300 -translate-y-1'
              : 'hover:scale-105 active:scale-95'
          }`}
          style={{
            background:
              'radial-gradient(circle at 35% 25%, #ffffff 0%, #fffae6 15%, #ffd43f 40%, #f59e0b 70%, #b45309 90%, #78350f 100%)',
          }}
        >
          {/* Specular Glint */}
          <div className="absolute top-2 left-2.5 w-3.5 h-6 rounded-full bg-white/60 blur-[1px] transform -rotate-25 pointer-events-none" />

          {/* Crack indicator */}
          {isCracked && (
            <div className="absolute inset-0 flex items-center justify-center text-2xl select-none animate-bounce">
              💥
            </div>
          )}
        </div>

        {/* Red Satin Pedestal Cushion with Gold Trim matching IMG_0284.png */}
        <div className="w-16 sm:w-18 h-3.5 sm:h-4 bg-gradient-to-r from-[#6b0811] via-[#9e131d] to-[#6b0811] rounded-sm -mt-2 border-t-2 border-yellow-400/80 shadow-[0_4px_10px_rgba(0,0,0,0.9)] relative z-10 flex items-center justify-center">
          <div className="w-12 h-1 bg-yellow-400/40 rounded-full blur-[0.5px]" />
        </div>

        {/* Golden Sunburst Pedestal Base Ring */}
        <div className="w-18 sm:w-20 h-2 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent -mt-0.5 rounded-full blur-xs" />
      </div>
    );
  };

  const maxPrizeFormatted = (settings.goldenEggMaxDisplay || 99999).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 select-none">
      {/* Container with dark casino background matching IMG_0284.png */}
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden py-5 px-4 flex flex-col items-center justify-center text-center">
        {/* Soft Background Radial Glow */}
        <div className="absolute inset-0 bg-radial from-amber-900/40 via-black/90 to-black pointer-events-none" />

        {/* Header Title & Subtitle */}
        <div className="relative z-10 mb-3 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-black mb-1">
            <Sparkles size={12} className="text-yellow-300" />
            <span>লাকি গোল্ডেন এগ ইভেন্ট</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
            যেকোনো ডিম ভেঙে পুরস্কার নিন
          </h3>
          <p className="text-[12px] text-gray-200 mt-1">
            সর্বোচ্চ <span className="text-yellow-300 font-extrabold font-num">৳ {maxPrizeFormatted}</span> পর্যন্ত নিশ্চিত নগদ ক্যাশ!
          </p>
          {/* Level Tier explanation requested by user */}
          <div className="mt-1 flex items-center justify-center gap-2 text-[10px] text-amber-200/90 font-medium bg-black/50 py-1 px-2.5 rounded-full border border-amber-500/30">
            <span>VIP ১-৪: ৳{settings.goldenEggTier1 || 9}</span>
            <span>•</span>
            <span>VIP ৫-১০: ৳{settings.goldenEggTier2 || 99}</span>
            <span>•</span>
            <span>VIP ১১+: ৳{settings.goldenEggTier3 || 199}</span>
          </div>
        </div>

        {/* 8 Golden Eggs Pyramid/Grid (Matching IMG_0284.png) */}
        <div className="relative z-10 w-full flex flex-col items-center gap-3 my-2">
          {/* Row 1: 2 Eggs */}
          <div className="flex justify-center gap-8 sm:gap-10">
            {renderEgg(0)}
            {renderEgg(1)}
          </div>

          {/* Row 2: 3 Eggs */}
          <div className="flex justify-center gap-4 sm:gap-6">
            {renderEgg(2)}
            {renderEgg(3)}
            {renderEgg(4)}
          </div>

          {/* Row 3: 3 Eggs */}
          <div className="flex justify-center gap-4 sm:gap-6">
            {renderEgg(5)}
            {renderEgg(6)}
            {renderEgg(7)}
          </div>
        </div>

        {/* Reward celebration banner */}
        {rewardAmount !== null && (
          <div className="relative z-20 w-full my-2 p-3 bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-500/30 border border-yellow-400 rounded-2xl animate-bounce shadow-xl">
            <span className="text-xs text-amber-200 font-bold block">🎉 অভিনন্দন! ডিম ভেঙে পেয়েছেন:</span>
            <span className="text-2xl font-black text-yellow-300 font-num">৳ {rewardAmount} BDT</span>
          </div>
        )}

        {/* Bottom CTA Button: দাবি করুন (Claim) matching IMG_0284.png */}
        <div className="relative z-10 w-full flex items-center justify-center mt-4">
          <button
            onClick={handleClaim}
            className="w-4/5 py-3 rounded-full font-black text-sm text-[#3b1202] bg-gradient-to-r from-[#ffe066] via-[#f59e0b] to-[#fbbf24] hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_24px_rgba(245,158,11,0.7)] border-2 border-yellow-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isClaimed ? 'পুরস্কার সংগৃহীত (সম্পন্ন)' : 'দাবি করুন'}</span>
          </button>
        </div>

        {/* Bottom Left Close [✕] button matching IMG_0284.png */}
        <div className="relative z-10 w-full flex justify-between items-center px-4 mt-3">
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-gray-400 hover:text-white flex items-center justify-center border border-white/20 transition-all active:scale-90"
            title="বন্ধ করুন"
          >
            <X size={16} />
          </button>

          <span className="text-[10px] text-gray-400 font-bold">
            {user ? `আপনার লেভেল: VIP ${user.vipLevel || 1}` : 'ডিম স্পর্শ করুন'}
          </span>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// RED PACKET MODAL (MATCHING IMG_0275_8a9fb3f6.png)
// ----------------------------------------------------
interface RedPacketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: () => void;
}

export const RedPacketModal: React.FC<RedPacketModalProps> = ({ isOpen, onClose, onRewardClaimed }) => {
  const [claimedAmt, setClaimedAmt] = useState<number | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const user = storage.getCurrentUser();

  if (!isOpen) return null;

  const handleOpenPacket = () => {
    if (isOpening) return;
    setIsOpening(true);
    soundFX.playSpin();
    setTimeout(() => {
      const res = storage.claimRedPacket();
      if (res.success) {
        setClaimedAmt(res.amount);
        soundFX.playWin();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        onRewardClaimed();
      } else {
        alert(res.message);
      }
      setIsOpening(false);
    }, 400);
  };

  const winnersList = [
    { name: 'eb***g', amount: '৳ 0.55' },
    { name: '01****2', amount: '৳ 0.75' },
    { name: '01********5', amount: '৳ 1.76' },
    { name: 'tk***9', amount: '৳ 1.12' },
    { name: 'user_99', amount: '৳ 2.80' },
    { name: 'lx***8', amount: '৳ 3.40' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden py-4 px-4 flex flex-col items-center justify-center text-center">
        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 active:scale-95"
        >
          <X size={18} />
        </button>

        {/* Crown Ribbon Header matching IMG_0275_8a9fb3f6.png */}
        <div className="relative z-10 w-full flex flex-col items-center mb-1">
          {/* Royal Crown Ornament */}
          <div className="w-16 h-8 flex items-center justify-center text-3xl drop-shadow-[0_4px_12px_rgba(250,204,21,0.8)] animate-pulse">
            👑
          </div>

          {/* Ribbon Banner: পুরস্কার */}
          <div className="relative -mt-2 px-8 py-1.5 bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#b91c1c] text-white font-black text-sm rounded-md shadow-[0_4px_14px_rgba(220,38,38,0.8)] border border-yellow-300">
            <span className="tracking-widest drop-shadow-md">পুরস্কার</span>
          </div>

          {/* Time & Event: 00:00-03:00 ফ্রি ক্যাশ রেইন */}
          <div className="mt-2 text-center">
            <div className="text-[12px] font-extrabold text-amber-300 tracking-wide font-num">
              00:00-03:00
            </div>
            <div className="text-[11px] font-bold text-gray-200">
              ফ্রি ক্যাশ রেইন
            </div>
          </div>
        </div>

        {/* Glowing Red Packet Envelope matching IMG_0275_8a9fb3f6.png */}
        <div
          onClick={handleOpenPacket}
          className={`relative z-10 w-44 h-60 my-2 rounded-2xl bg-gradient-to-b from-[#e63946] via-[#d62828] to-[#9d0208] border-2 border-yellow-300/80 shadow-[0_10px_35px_rgba(220,38,38,0.7)] flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 ${
            isOpening ? 'scale-105 rotate-2' : 'hover:scale-103 active:scale-95'
          }`}
        >
          {/* Envelope Top Flap Curve */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#ff4d6d]/40 to-transparent rounded-t-2xl pointer-events-none" />

          {/* Golden Curved Band */}
          <div className="absolute inset-x-2 top-24 h-14 border-b-4 border-yellow-400 rounded-[50%] pointer-events-none opacity-80" />

          {/* Central Golden Medallion Coin with Sparkles */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#f59e0b] via-[#fde047] to-[#fef08a] border-4 border-yellow-200 shadow-[0_4px_20px_rgba(245,158,11,0.9)] flex items-center justify-center relative">
            <div className="w-14 h-14 rounded-full border border-yellow-600/40 flex items-center justify-center bg-radial from-yellow-300 to-amber-500">
              <span className="text-amber-950 font-black text-2xl drop-shadow-sm select-none">
                開
              </span>
            </div>
            {/* Sparkle glints */}
            <div className="absolute -top-1 -right-1 text-yellow-100 text-xs animate-ping">✦</div>
            <div className="absolute -bottom-1 -left-1 text-yellow-100 text-xs">✦</div>
          </div>

          <span className="mt-4 text-[11px] font-black text-yellow-200 drop-shadow">
            ট্যাপ করে আনলক করুন
          </span>
        </div>

        {/* Claimed Amount display */}
        {claimedAmt !== null && (
          <div className="relative z-20 w-full my-1.5 p-2 bg-red-950/90 border border-yellow-400/80 rounded-xl text-yellow-300 font-extrabold text-xs animate-bounce">
            🎉 আপনি পেয়েছেন: ৳ {claimedAmt} BDT ক্যাশ!
          </div>
        )}

        {/* দাবি করুন (Claim) Gold Gradient Button */}
        <div className="relative z-10 w-full flex items-center justify-center mt-2">
          <button
            onClick={handleOpenPacket}
            className="w-4/5 py-2.5 rounded-full font-black text-xs text-[#3b1202] bg-gradient-to-r from-[#ffe066] via-[#f59e0b] to-[#fbbf24] hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_18px_rgba(245,158,11,0.7)] border-2 border-yellow-200 cursor-pointer"
          >
            দাবি করুন
          </button>
        </div>

        {/* Progress Bar matching IMG_0275_8a9fb3f6.png */}
        <div className="relative z-10 w-4/5 mt-3">
          <div className="w-full bg-black/60 rounded-full h-2 border border-white/20 overflow-hidden flex items-center">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full w-[35%]" />
          </div>
          <div className="text-[10px] text-gray-300 text-right mt-0.5 font-num">
            {user ? `${user.redPacketsClaimed || 0} / 17 সংগৃহীত` : '0.00%'}
          </div>
        </div>

        {/* Live Winner Ticker Table matching IMG_0275_8a9fb3f6.png */}
        <div className="relative z-10 w-full mt-2 bg-black/75 rounded-2xl border border-yellow-500/40 p-2.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 mb-1.5 text-left border-b border-white/10 pb-1">
            <span className="text-base">🏆</span>
            <span className="text-[11px] font-bold text-amber-300">সাম্প্রতিক পুরস্কারপ্রাপ্ত সদস্যগণ</span>
          </div>

          <div className="space-y-1">
            {winnersList.map((w, i) => (
              <div key={i} className="flex justify-between items-center text-[11px] font-num text-gray-200 px-2 py-0.5 rounded hover:bg-white/5">
                <span className="font-semibold text-gray-300">{w.name}</span>
                <span className="font-bold text-yellow-300">{w.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// LUCKY SPIN WHEEL MODAL (MATCHING IMG_0276_46dc5975.png)
// ----------------------------------------------------
interface WheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: () => void;
}

export const WheelModal: React.FC<WheelModalProps> = ({ isOpen, onClose, onRewardClaimed }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const settings = storage.getSiteSettings();
  const user = storage.getCurrentUser();

  // Slices on wheel matching IMG_0276
  const slices = [
    { label: 'IPHONE 18', sub: 'PRO MAX', color: '#dc2626', textCol: '#fff' },
    { label: '৳ ৮,৮৮৮', sub: 'ক্যাশ', color: '#16a34a', textCol: '#fff' },
    { label: '৳ ৫,৮৮৮', sub: 'মেগা', color: '#f59e0b', textCol: '#000' },
    { label: '৳ ১,৮৮৮', sub: 'ক্যাশ', color: '#9333ea', textCol: '#fff' },
    { label: '৳ ৮৮', sub: 'বোনাস', color: '#2563eb', textCol: '#fff' },
    { label: '৳ ৩৮', sub: 'ক্যাশ', color: '#ea580c', textCol: '#fff' },
    { label: '৳ ১৮', sub: 'বোনাস', color: '#0d9488', textCol: '#fff' },
    { label: '৳ ৮', sub: 'ক্যাশ', color: '#e11d48', textCol: '#fff' },
  ];

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonPrize(null);
    soundFX.playSpin();

    // Random spins + targeted slice
    const extraRounds = 5 + Math.floor(Math.random() * 3);
    const targetSlice = 7; // User level based result
    const anglePerSlice = 360 / slices.length;
    const targetAngle = 360 * extraRounds + (targetSlice * anglePerSlice + anglePerSlice / 2);

    setRotation(prev => prev + targetAngle);

    setTimeout(() => {
      const res = storage.spinLuckyWheel();
      setIsSpinning(false);
      if (res.success) {
        setWonPrize(res.prize);
        soundFX.playJackpot();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        onRewardClaimed();
      } else {
        alert(res.message);
      }
    }, 4000);
  };

  const timerString = settings.wheelCountdownTimer || '২৩ : ০৬ : ৩১';

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden py-4 px-4 flex flex-col items-center justify-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 active:scale-95"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="relative z-10 text-center mb-1">
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 text-[10px] font-black mb-1">
            <Smartphone size={12} className="text-yellow-400" />
            <span>আইফোন ১৮ প্রো ম্যাক্স ও মেগা ক্যাশ ড্র</span>
          </div>
          <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400">
            লাকি স্পিন হুইল ইভেন্ট
          </h3>
        </div>

        {/* Countdown Timer Display matching IMG_0276: ২৩ : ০৬ : ৩১ */}
        <div className="relative z-10 flex items-center gap-2 bg-gradient-to-r from-red-950 via-black to-red-950 px-4 py-1.5 rounded-full border border-yellow-500/60 shadow-lg my-1.5">
          <Clock size={13} className="text-yellow-400 animate-spin" />
          <span className="text-[11px] font-bold text-gray-300">ইভেন্ট শেষ হতে বাকি:</span>
          <span className="text-xs font-black font-num text-yellow-300 tracking-wider">
            {timerString}
          </span>
        </div>

        {/* Grand Prize iPhone 18 Banner */}
        <div className="relative z-10 w-full flex items-center justify-between px-3 py-1 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border border-yellow-400/40 rounded-xl mb-2 text-[11px]">
          <span className="text-yellow-300 font-extrabold">🏆 গ্র্যান্ড প্রাইজ:</span>
          <span className="text-white font-black">IPHONE 18 PRO MAX</span>
        </div>

        {/* Interactive Animated Wheel */}
        <div className="relative z-10 w-64 h-64 my-1 flex items-center justify-center">
          {/* Wheel Pointer at Top */}
          <div className="absolute -top-3 z-30 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-yellow-400 filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" />

          {/* Outer Glowing Ring with Marquee Bulbs */}
          <div className="absolute inset-0 rounded-full border-4 border-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.7)] pointer-events-none" />

          {/* Rotating Wheel Container */}
          <div
            className="w-full h-full rounded-full overflow-hidden transition-transform duration-[4000ms] ease-out shadow-2xl relative"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {/* SVG Wheel segments */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {slices.map((s, i) => {
                const angle = 360 / slices.length;
                const startAngle = i * angle;
                const endAngle = (i + 1) * angle;

                const startRad = (startAngle - 90) * (Math.PI / 180);
                const endRad = (endAngle - 90) * (Math.PI / 180);

                const x1 = 50 + 50 * Math.cos(startRad);
                const y1 = 50 + 50 * Math.sin(startRad);
                const x2 = 50 + 50 * Math.cos(endRad);
                const y2 = 50 + 50 * Math.sin(endRad);

                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                const midAngle = startAngle + angle / 2;
                const midRad = (midAngle - 90) * (Math.PI / 180);
                const textX = 50 + 32 * Math.cos(midRad);
                const textY = 50 + 32 * Math.sin(midRad);

                return (
                  <g key={i}>
                    <path d={pathData} fill={s.color} stroke="#111" strokeWidth="0.8" />
                    <text
                      x={textX}
                      y={textY}
                      fill={s.textCol}
                      fontSize="4.2"
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                    >
                      {s.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center GO / Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="absolute z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-100 border-4 border-[#3b1202] text-[#3b1202] font-black text-sm shadow-[0_4px_15px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-80 cursor-pointer"
          >
            <span>{isSpinning ? '...' : 'GO'}</span>
            <span className="text-[8px] font-bold -mt-0.5">স্পিন</span>
          </button>
        </div>

        {/* Won Prize Celebration */}
        {wonPrize && (
          <div className="relative z-20 w-full my-2 p-2.5 bg-gradient-to-r from-amber-500/40 to-yellow-400/30 border border-yellow-400 rounded-xl text-yellow-300 font-extrabold text-xs animate-bounce">
            🎉 অভিনন্দন! আপনি জিতেছেন: {wonPrize}!
          </div>
        )}

        {/* VIP Level Tiers Note */}
        <div className="relative z-10 w-full mt-2 text-[10px] text-gray-300 flex items-center justify-center gap-1.5 bg-black/40 py-1 rounded-lg">
          <span>VIP ১-৪: ৳{settings.wheelTier1 || 8}</span>
          <span>•</span>
          <span>VIP ৫-১০: ৳{settings.wheelTier2 || 88}</span>
          <span>•</span>
          <span>VIP ১১+: ৳{settings.wheelTier3 || 1888}</span>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// RESCUE RELIEF FUND MODAL (উদ্ধার তহবিল)
// ----------------------------------------------------
interface RescueFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: () => void;
}

export const RescueFundModal: React.FC<RescueFundModalProps> = ({ isOpen, onClose, onRewardClaimed }) => {
  const [claimed, setClaimed] = useState(false);
  const user = storage.getCurrentUser();
  const settings = storage.getSiteSettings();

  if (!isOpen) return null;

  const handleClaim = () => {
    soundFX.playClick();
    const res = storage.claimRescueFund();
    if (res.success) {
      setClaimed(true);
      soundFX.playWin();
      confetti({ particleCount: 70, spread: 60 });
      onRewardClaimed();
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <div className="bg-gradient-to-b from-[#1c1917] via-[#0f172a] to-[#020617] text-white p-5 rounded-3xl border-2 border-emerald-500/60 max-w-sm w-full text-center relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white bg-black/40 p-1.5 rounded-full"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <HeartHandshake size={28} />
        </div>

        <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 mb-1">
          দৈনিক উদ্ধার তহবিল
        </h3>
        <p className="text-xs text-gray-300 mb-4">
          খেলতে গিয়ে কোনো ক্ষতি হলে লাইভএক্সউইন প্ল্যাটফর্ম থেকে প্রতিদিন উদ্ধার ক্যাশব্যাক নিশ্চিত।
        </p>

        <div className="bg-black/60 p-3 rounded-2xl border border-white/10 text-left space-y-2 mb-4 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">উদ্ধার ক্যাশব্যাক হার:</span>
            <span className="font-bold text-emerald-400">{settings.rescueFundPercentage || 10}% দৈনিক</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">বর্তমান উদ্ধার সীমা:</span>
            <span className="font-bold text-yellow-300 font-num">সর্বোচ্চ ৳{settings.rescueFundDailyMax || 500}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">আপনার বর্তমান ব্যালেন্স:</span>
            <span className="font-bold text-white font-num">৳ {user?.wallet.balance.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <button
          onClick={handleClaim}
          disabled={claimed}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-95 text-white font-black rounded-xl text-xs shadow-lg border border-emerald-400/50 cursor-pointer disabled:opacity-60"
        >
          {claimed ? 'তহবিল গৃহীত হয়েছে' : 'উদ্ধার তহবিল গ্রহণ করুন'}
        </button>
      </div>
    </div>
  );
};
