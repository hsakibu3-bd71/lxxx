import React, { useState } from 'react';
import { soundFX } from '../../utils/audio';
import { storage } from '../../services/storage';
import { X, Play, Radio } from 'lucide-react';

interface LiveCasinoGameProps {
  onClose: () => void;
  onBalanceChange: () => void;
}

export const LiveCasinoGame: React.FC<LiveCasinoGameProps> = ({ onClose, onBalanceChange }) => {
  const [selectedBet, setSelectedBet] = useState<'red' | 'black' | 'even' | 'odd' | 'green'>('red');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [spinning, setSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(7);
  const [resultMsg, setResultMsg] = useState<string>('');

  const currentUser = storage.getCurrentUser();
  const balance = currentUser?.wallet.balance ?? 0;

  const spinRoulette = () => {
    if (balance < betAmount) {
      alert('পর্যাপ্ত ব্যালেন্স নেই!');
      return;
    }

    storage.updateBalance(-betAmount);
    onBalanceChange();
    soundFX.playSpin();

    setSpinning(true);
    setResultMsg('');

    setTimeout(() => {
      // 0 to 36
      const num = Math.floor(Math.random() * 37);
      setWinningNumber(num);

      const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num);
      const isBlack = num !== 0 && !isRed;
      const isGreen = num === 0;
      const isEven = num !== 0 && num % 2 === 0;
      const isOdd = num % 2 !== 0;

      let won = false;
      let payoutMult = 2;

      if (selectedBet === 'red' && isRed) won = true;
      else if (selectedBet === 'black' && isBlack) won = true;
      else if (selectedBet === 'even' && isEven) won = true;
      else if (selectedBet === 'odd' && isOdd) won = true;
      else if (selectedBet === 'green' && isGreen) {
        won = true;
        payoutMult = 36;
      }

      if (won) {
        const win = betAmount * payoutMult;
        storage.updateBalance(win);
        onBalanceChange();
        soundFX.playWin();
        setResultMsg(`🎉 বিজয়ী নম্বর: ${num}! আপনি জিতেছেন ৳${win}!`);
        storage.recordGameBet('live-dream-gaming', `Live Roulette: ${num}`, 'Pragmatic Play', betAmount, win, payoutMult);
      } else {
        soundFX.playClick();
        setResultMsg(`❌ বিজয়ী নম্বর: ${num}. রাউন্ড সমাপ্ত!`);
        storage.recordGameBet('live-dream-gaming', `Live Roulette: ${num}`, 'Pragmatic Play', betAmount, 0, 0);
      }

      setSpinning(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-2 sm:p-4 max-w-lg mx-auto">
      {/* Live Dealer Video Top */}
      <div className="w-full relative h-48 sm:h-56 bg-slate-950 rounded-t-xl overflow-hidden border-b-2 border-red-600">
        <img
          src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80"
          alt="Live Dealer"
          className="w-full h-full object-cover filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70" />

        {/* Top status bar */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
          <div className="flex items-center gap-1.5 bg-red-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
            <Radio size={12} className="animate-pulse" /> LIVE HD
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white bg-black/60 p-1 rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* Roulette Wheel Center Simulation */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div
            className={`w-20 h-20 rounded-full border-4 border-yellow-400 bg-gradient-to-tr from-amber-700 via-stone-900 to-amber-700 flex items-center justify-center shadow-2xl ${
              spinning ? 'animate-spin' : ''
            }`}
          >
            <span className="text-2xl font-black text-white font-num drop-shadow-md">
              {winningNumber !== null ? winningNumber : '?'}
            </span>
          </div>
        </div>
      </div>

      {/* Result Toast */}
      {resultMsg && (
        <div className="my-1 py-1 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs rounded-full shadow-lg">
          {resultMsg}
        </div>
      )}

      {/* Betting Board */}
      <div className="w-full flex-1 bg-[#120204] p-3 flex flex-col justify-center border-x border-red-950">
        <span className="text-xs text-gray-400 font-bold mb-1.5 block">বাজির অপশন বাছাই করুন:</span>
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          <button
            onClick={() => setSelectedBet('red')}
            className={`py-2 rounded font-bold text-xs ${
              selectedBet === 'red' ? 'bg-red-600 text-white ring-2 ring-yellow-400' : 'bg-red-950/70 text-red-300 border border-red-800'
            }`}
          >
            লাল (1:1)
          </button>
          <button
            onClick={() => setSelectedBet('black')}
            className={`py-2 rounded font-bold text-xs ${
              selectedBet === 'black' ? 'bg-zinc-800 text-white ring-2 ring-yellow-400' : 'bg-zinc-950 text-gray-400 border border-zinc-800'
            }`}
          >
            কালো (1:1)
          </button>
          <button
            onClick={() => setSelectedBet('even')}
            className={`py-2 rounded font-bold text-xs ${
              selectedBet === 'even' ? 'bg-blue-600 text-white ring-2 ring-yellow-400' : 'bg-blue-950/70 text-blue-300 border border-blue-900'
            }`}
          >
            জোড় (1:1)
          </button>
          <button
            onClick={() => setSelectedBet('odd')}
            className={`py-2 rounded font-bold text-xs ${
              selectedBet === 'odd' ? 'bg-purple-600 text-white ring-2 ring-yellow-400' : 'bg-purple-950/70 text-purple-300 border border-purple-900'
            }`}
          >
            বিজোড় (1:1)
          </button>
          <button
            onClick={() => setSelectedBet('green')}
            className={`py-2 rounded font-bold text-xs ${
              selectedBet === 'green' ? 'bg-emerald-600 text-white ring-2 ring-yellow-400' : 'bg-emerald-950 text-emerald-300 border border-emerald-900'
            }`}
          >
            ০ (1:36)
          </button>
        </div>

        {/* Chips selector */}
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-400">ব্যালেন্স: <strong className="text-yellow-400 font-num">৳ {balance.toFixed(2)}</strong></span>
          <div className="flex gap-1">
            {[50, 100, 500, 1000].map(v => (
              <button
                key={v}
                onClick={() => setBetAmount(v)}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-[11px] shadow-md border ${
                  betAmount === v ? 'bg-yellow-400 text-black border-white scale-110' : 'bg-zinc-800 text-yellow-300 border-zinc-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={spinRoulette}
          disabled={spinning}
          className="w-full py-2.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-extrabold rounded-lg text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          <Play size={18} fill="currentColor" />
          {spinning ? 'হুইল ঘুরছে...' : `বাজি ধরুন (SPIN ৳${betAmount})`}
        </button>
      </div>
    </div>
  );
};
