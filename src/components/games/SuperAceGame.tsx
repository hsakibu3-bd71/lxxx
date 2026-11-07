import React, { useState } from 'react';
import { soundFX } from '../../utils/audio';
import { storage } from '../../services/storage';
import confetti from 'canvas-confetti';
import { X, Play, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface SuperAceGameProps {
  onClose: () => void;
  onBalanceChange: () => void;
}

const SYMBOLS = [
  { id: 'A', label: 'A', name: 'Ace', payout: 5, color: 'text-yellow-400', bg: 'bg-gradient-to-b from-amber-600 to-amber-900' },
  { id: 'K', label: 'K', name: 'King', payout: 4, color: 'text-red-400', bg: 'bg-gradient-to-b from-red-600 to-red-900' },
  { id: 'Q', label: 'Q', name: 'Queen', payout: 3, color: 'text-purple-400', bg: 'bg-gradient-to-b from-purple-600 to-purple-900' },
  { id: 'J', label: 'J', name: 'Jack', payout: 2, color: 'text-blue-400', bg: 'bg-gradient-to-b from-blue-600 to-blue-900' },
  { id: 'spade', label: '♠', name: 'Spade', payout: 1.5, color: 'text-slate-100', bg: 'bg-gradient-to-b from-slate-700 to-slate-900' },
  { id: 'heart', label: '♥', name: 'Heart', payout: 1.2, color: 'text-rose-400', bg: 'bg-gradient-to-b from-rose-700 to-rose-950' },
  { id: 'diamond', label: '♦', name: 'Diamond', payout: 1.0, color: 'text-emerald-400', bg: 'bg-gradient-to-b from-emerald-700 to-emerald-950' },
  { id: 'club', label: '♣', name: 'Club', payout: 0.8, color: 'text-indigo-300', bg: 'bg-gradient-to-b from-indigo-800 to-indigo-950' },
  { id: 'wild', label: 'WILD', name: 'Golden Ace', payout: 10, color: 'text-amber-200 font-extrabold', bg: 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-lg shadow-yellow-500/50' },
];

export const SuperAceGame: React.FC<SuperAceGameProps> = ({ onClose, onBalanceChange }) => {
  const [reels, setReels] = useState<string[][]>([
    ['A', 'K', 'Q', 'J'],
    ['K', 'wild', 'A', 'spade'],
    ['spade', 'heart', 'wild', 'A'],
    ['A', 'Q', 'K', 'diamond'],
    ['J', 'A', 'spade', 'club'],
  ]);
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [lastWin, setLastWin] = useState<number>(0);
  const [soundOn, setSoundOn] = useState(true);
  const [autoSpin, setAutoSpin] = useState(false);
  const [winMessage, setWinMessage] = useState<string>('');

  const currentUser = storage.getCurrentUser();
  const balance = currentUser?.wallet.balance ?? 0;

  const spin = async () => {
    if (spinning) return;
    if (balance < betAmount) {
      soundFX.playClick();
      alert('ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ডিপোজিট করুন।');
      setAutoSpin(false);
      return;
    }

    // Deduct bet
    storage.updateBalance(-betAmount);
    onBalanceChange();
    soundFX.playSpin();

    setSpinning(true);
    setLastWin(0);
    setWinMessage('');
    setComboMultiplier(1);

    // Simulate reel rotation
    const spinInterval = setInterval(() => {
      setReels(prev =>
        prev.map(col =>
          col.map(() => SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 1))].id)
        )
      );
    }, 60);

    setTimeout(() => {
      clearInterval(spinInterval);

      // Final reels generation
      const isWin = Math.random() > 0.45; // ~55% hit rate
      const newMultiplier = isWin ? (Math.random() > 0.6 ? 3 : (Math.random() > 0.8 ? 5 : 2)) : 1;

      let winPayout = 0;
      let matchedSymbol = 'A';

      if (isWin) {
        matchedSymbol = SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 1))].id;
        const symObj = SYMBOLS.find(s => s.id === matchedSymbol);
        const basePayout = (symObj?.payout || 2) * betAmount;
        winPayout = Math.floor(basePayout * newMultiplier);

        // Populate winning line across reels
        const finalCols = [
          [matchedSymbol, 'K', 'Q', 'spade'],
          [matchedSymbol, 'wild', 'A', 'heart'],
          [matchedSymbol, 'A', 'wild', 'club'],
          ['wild', matchedSymbol, 'K', 'diamond'],
          [matchedSymbol, 'J', 'A', 'spade'],
        ];
        setReels(finalCols);
        setComboMultiplier(newMultiplier);
        setLastWin(winPayout);
        setWinMessage(`SUPER WIN! ৳${winPayout} (Combo ${newMultiplier}X)`);

        storage.updateBalance(winPayout);
        onBalanceChange();
        storage.recordGameBet('jili-super-ace', 'Super Ace (সুপার এইস)', 'Jili', betAmount, winPayout, newMultiplier);

        if (winPayout >= betAmount * 4) {
          soundFX.playJackpot();
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } else {
          soundFX.playWin();
        }
      } else {
        // Non-winning configuration
        const randomCols = Array(5).fill(0).map(() =>
          Array(4).fill(0).map(() => SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 1))].id)
        );
        setReels(randomCols);
        setComboMultiplier(1);
        storage.recordGameBet('jili-super-ace', 'Super Ace', 'Jili', betAmount, 0, 0);
      }

      setSpinning(false);
    }, 900);
  };

  const toggleSound = () => {
    soundFX.enabled = !soundOn;
    setSoundOn(!soundOn);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-2 sm:p-4 max-w-lg mx-auto">
      {/* Game Header */}
      <div className="w-full flex items-center justify-between bg-gradient-to-r from-[#2e0508] via-[#520910] to-[#2e0508] p-3 rounded-t-xl border-b border-[#a81c25]">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-red-600 rounded text-xs font-bold text-white tracking-wider">JILI</div>
          <span className="font-bold text-yellow-400 text-sm sm:text-base">Super Ace (সুপার এইস)</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleSound} className="text-gray-300 hover:text-white">
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button onClick={onClose} className="text-gray-300 hover:text-white bg-red-900/40 p-1 rounded-full">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Multiplier Combo Header */}
      <div className="w-full bg-[#1b0305] py-2 px-3 flex justify-between items-center text-xs border-x border-[#5a0c13]">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">ব্যালেন্স:</span>
          <span className="text-yellow-400 font-bold font-num text-sm">৳ {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">কম্বো:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 5].map(m => (
              <span
                key={m}
                className={`px-1.5 py-0.5 rounded text-xs font-bold transition-all ${
                  comboMultiplier === m
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black scale-110 shadow-md shadow-yellow-500/50'
                    : 'bg-black/50 text-gray-400 border border-red-900/40'
                }`}
              >
                {m}X
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Reels Grid (5x4) */}
      <div className="w-full flex-1 bg-gradient-to-b from-[#220407] to-[#120103] p-2 flex flex-col justify-center items-center border-x border-[#5a0c13]">
        <div className="grid grid-cols-5 gap-1.5 w-full bg-[#0d0102]/80 p-2 rounded-lg border-2 border-[#82131b] shadow-inner shadow-black">
          {reels.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-1.5">
              {col.map((symId, rowIdx) => {
                const sym = SYMBOLS.find(s => s.id === symId) || SYMBOLS[0];
                const isWild = sym.id === 'wild';
                return (
                  <div
                    key={rowIdx}
                    className={`h-14 sm:h-16 rounded-md flex flex-col items-center justify-center font-bold text-lg select-none transition-all duration-150 border border-yellow-500/20 ${
                      sym.bg
                    } ${isWild ? 'animate-pulse ring-2 ring-yellow-400' : ''}`}
                  >
                    <span className={`${sym.color} text-xl sm:text-2xl drop-shadow`}>
                      {sym.label}
                    </span>
                    <span className="text-[9px] uppercase tracking-tighter text-white/80">
                      {sym.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Win Alert Banner */}
        {winMessage && (
          <div className="mt-2 py-1 px-4 bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600 rounded-full text-black font-extrabold text-sm animate-bounce shadow-lg flex items-center gap-1">
            <Sparkles size={16} /> {winMessage}
          </div>
        )}
      </div>

      {/* Betting Controls & Spin Button */}
      <div className="w-full bg-[#1b0305] p-3 rounded-b-xl border border-[#5a0c13] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">বাজি (Bet):</span>
            <div className="flex gap-1">
              {[5, 10, 50, 100, 500].map(val => (
                <button
                  key={val}
                  onClick={() => {
                    soundFX.playClick();
                    setBetAmount(val);
                  }}
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                    betAmount === val
                      ? 'bg-yellow-500 text-black font-extrabold'
                      : 'bg-red-950/60 text-gray-300 border border-red-800/40 hover:bg-red-900/60'
                  }`}
                >
                  ৳{val}
                </button>
              ))}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-gray-400 block">জিতেছেন:</span>
            <span className="text-sm font-bold text-emerald-400 font-num">
              ৳ {lastWin.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Spin action bar */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => setAutoSpin(!autoSpin)}
            className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
              autoSpin
                ? 'bg-emerald-600 border-emerald-400 text-white animate-pulse'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <RotateCcw size={14} className={autoSpin ? 'animate-spin' : ''} />
            {autoSpin ? 'AUTO ON' : 'AUTO'}
          </button>

          <button
            onClick={spin}
            disabled={spinning}
            className="flex-1 py-2.5 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 text-black font-extrabold rounded-lg text-base shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Play size={18} fill="currentColor" />
            {spinning ? 'স্পিন হচ্ছে...' : `স্পিন (SPIN ৳${betAmount})`}
          </button>
        </div>
      </div>
    </div>
  );
};
