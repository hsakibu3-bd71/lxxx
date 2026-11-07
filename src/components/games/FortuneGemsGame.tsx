import React, { useState } from 'react';
import { soundFX } from '../../utils/audio';
import { storage } from '../../services/storage';
import confetti from 'canvas-confetti';
import { X, Play, Volume2, VolumeX, Sparkles, Gem } from 'lucide-react';

interface FortuneGemsGameProps {
  onClose: () => void;
  onBalanceChange: () => void;
}

const GEMS = [
  { id: 'garuda', name: 'Garuda Gold', label: '👑', payout: 20, color: 'from-amber-400 to-yellow-600', ring: 'ring-yellow-400' },
  { id: 'ruby', name: 'Red Ruby', label: '💎', payout: 12, color: 'from-red-500 to-rose-700', ring: 'ring-red-400' },
  { id: 'sapphire', name: 'Blue Sapphire', label: '🔷', payout: 8, color: 'from-blue-500 to-indigo-700', ring: 'ring-blue-400' },
  { id: 'emerald', name: 'Green Emerald', label: '🟢', payout: 5, color: 'from-emerald-400 to-teal-700', ring: 'ring-emerald-400' },
  { id: 'coin', name: 'Ancient Coin', label: '🪙', payout: 3, color: 'from-amber-600 to-yellow-800', ring: 'ring-amber-500' },
];

const WHEEL_MULTIPLIERS = [1, 2, 3, 5, 10, 15];

export const FortuneGemsGame: React.FC<FortuneGemsGameProps> = ({ onClose, onBalanceChange }) => {
  const [grid, setGrid] = useState<string[][]>([
    ['garuda', 'ruby', 'sapphire'],
    ['ruby', 'garuda', 'emerald'],
    ['emerald', 'coin', 'garuda'],
  ]);
  const [multiplierReel, setMultiplierReel] = useState<number>(1);
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState<number>(20);
  const [lastWin, setLastWin] = useState<number>(0);
  const [soundOn, setSoundOn] = useState(true);
  const [winTitle, setWinTitle] = useState<string>('');

  const currentUser = storage.getCurrentUser();
  const balance = currentUser?.wallet.balance ?? 0;

  const spin = () => {
    if (spinning) return;
    if (balance < betAmount) {
      soundFX.playClick();
      alert('ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।');
      return;
    }

    storage.updateBalance(-betAmount);
    onBalanceChange();
    soundFX.playSpin();

    setSpinning(true);
    setLastWin(0);
    setWinTitle('');

    const interval = setInterval(() => {
      setGrid([
        [GEMS[Math.floor(Math.random() * GEMS.length)].id, GEMS[Math.floor(Math.random() * GEMS.length)].id, GEMS[Math.floor(Math.random() * GEMS.length)].id],
        [GEMS[Math.floor(Math.random() * GEMS.length)].id, GEMS[Math.floor(Math.random() * GEMS.length)].id, GEMS[Math.floor(Math.random() * GEMS.length)].id],
        [GEMS[Math.floor(Math.random() * GEMS.length)].id, GEMS[Math.floor(Math.random() * GEMS.length)].id, GEMS[Math.floor(Math.random() * GEMS.length)].id],
      ]);
      setMultiplierReel(WHEEL_MULTIPLIERS[Math.floor(Math.random() * WHEEL_MULTIPLIERS.length)]);
    }, 60);

    setTimeout(() => {
      clearInterval(interval);

      const isWin = Math.random() > 0.4;
      const mult = isWin ? (Math.random() > 0.7 ? (Math.random() > 0.8 ? 15 : 10) : (Math.random() > 0.5 ? 5 : 2)) : 1;
      setMultiplierReel(mult);

      if (isWin) {
        const winGem = GEMS[Math.floor(Math.random() * GEMS.length)];
        // Winning middle line
        setGrid([
          [GEMS[1].id, GEMS[2].id, GEMS[3].id],
          [winGem.id, winGem.id, winGem.id], // 3 of a kind in center!
          [GEMS[0].id, GEMS[4].id, GEMS[2].id],
        ]);

        const payout = winGem.payout * betAmount * mult;
        setLastWin(payout);
        setWinTitle(`FORTUNE JACKPOT! ৳${payout} (${mult}X WHEEL)`);

        storage.updateBalance(payout);
        onBalanceChange();
        storage.recordGameBet('jili-fortune-gems-2', 'Fortune Gems 2 (ফরচুন জেমস ২)', 'Jili', betAmount, payout, mult);

        if (payout >= betAmount * 5) {
          soundFX.playJackpot();
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } else {
          soundFX.playWin();
        }
      } else {
        storage.recordGameBet('jili-fortune-gems-2', 'Fortune Gems 2', 'Jili', betAmount, 0, 0);
      }

      setSpinning(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-2 sm:p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-gradient-to-r from-[#380e04] via-[#631c07] to-[#380e04] p-3 rounded-t-xl border-b border-amber-600">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-yellow-500 text-black font-extrabold rounded text-xs">JILI</div>
          <span className="font-bold text-yellow-300 text-sm sm:text-base flex items-center gap-1">
            <Gem size={16} className="text-amber-400" /> Fortune Gems 2 (ফরচুন জেমস ২)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSoundOn(!soundOn)} className="text-gray-300 hover:text-white">
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button onClick={onClose} className="text-gray-300 hover:text-white bg-red-900/40 p-1 rounded-full">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Balance & Info */}
      <div className="w-full bg-[#1c0803] py-2 px-3 flex justify-between items-center text-xs border-x border-[#631c07]">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">ব্যালেন্স:</span>
          <span className="text-yellow-400 font-bold font-num text-sm">৳ {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-300 font-bold">
          <span>৪র্থ স্পেশাল রিল মাল্টিপ্লায়ার:</span>
          <span className="px-2 py-0.5 bg-amber-500 text-black rounded font-extrabold animate-pulse">{multiplierReel}X</span>
        </div>
      </div>

      {/* Main Reels (3x3 grid + 4th Multiplier Reel) */}
      <div className="w-full flex-1 bg-gradient-to-b from-[#260a03] to-[#120401] p-2 flex flex-col justify-center items-center border-x border-[#631c07]">
        <div className="flex gap-2 w-full justify-center items-center">
          {/* 3x3 Gem Grid */}
          <div className="grid grid-cols-3 gap-2 bg-[#0d0301] p-3 rounded-xl border-2 border-amber-600/60 shadow-xl shadow-black/80 flex-1">
            {grid.map((row, rIdx) =>
              row.map((gemId, cIdx) => {
                const gem = GEMS.find(g => g.id === gemId) || GEMS[0];
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`h-16 sm:h-20 rounded-lg flex flex-col items-center justify-center bg-gradient-to-br ${gem.color} shadow-md border border-white/20 transition-all select-none`}
                  >
                    <span className="text-2xl sm:text-3xl drop-shadow-lg">{gem.label}</span>
                    <span className="text-[10px] font-bold text-white/90 drop-shadow mt-0.5">{gem.name}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* 4th Wheel Reel */}
          <div className="w-20 sm:w-24 bg-gradient-to-b from-yellow-700 via-amber-600 to-yellow-800 p-2 rounded-xl border-2 border-yellow-400 shadow-xl flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-yellow-100 uppercase tracking-tighter mb-1">Wheel</span>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-amber-300 to-yellow-500 flex items-center justify-center text-black font-extrabold text-2xl shadow-inner border-2 border-white ring-2 ring-yellow-300 animate-spin-slow">
              {multiplierReel}X
            </div>
            <span className="text-[9px] font-bold text-amber-200 mt-1">মাল্টিপ্লায়ার</span>
          </div>
        </div>

        {winTitle && (
          <div className="mt-3 py-1.5 px-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full text-black font-extrabold text-sm shadow-lg flex items-center gap-1 animate-bounce">
            <Sparkles size={16} /> {winTitle}
          </div>
        )}
      </div>

      {/* Betting Controls */}
      <div className="w-full bg-[#1c0803] p-3 rounded-b-xl border border-[#631c07] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">বাজি:</span>
            <div className="flex gap-1">
              {[10, 20, 50, 100, 500].map(val => (
                <button
                  key={val}
                  onClick={() => {
                    soundFX.playClick();
                    setBetAmount(val);
                  }}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    betAmount === val ? 'bg-amber-400 text-black font-extrabold' : 'bg-stone-900 text-gray-300 border border-stone-800'
                  }`}
                >
                  ৳{val}
                </button>
              ))}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-gray-400 block">জয়লাভ:</span>
            <span className="text-sm font-bold text-emerald-400 font-num">৳ {lastWin.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={spin}
          disabled={spinning}
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-amber-600 text-black font-extrabold rounded-lg text-base shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          <Play size={18} fill="currentColor" />
          {spinning ? 'রিল ঘুরছে...' : `স্পিন (SPIN ৳${betAmount})`}
        </button>
      </div>
    </div>
  );
};
