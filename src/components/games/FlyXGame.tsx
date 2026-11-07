import React, { useState, useEffect, useRef } from 'react';
import { soundFX } from '../../utils/audio';
import { storage } from '../../services/storage';
import { X, Rocket, DollarSign, TrendingUp } from 'lucide-react';

interface FlyXGameProps {
  onClose: () => void;
  onBalanceChange: () => void;
}

export const FlyXGame: React.FC<FlyXGameProps> = ({ onClose, onBalanceChange }) => {
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [gameState, setGameState] = useState<'betting' | 'flying' | 'crashed'>('betting');
  const [betAmount, setBetAmount] = useState<number>(50);
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [cashedOut, setCashedOut] = useState<boolean>(false);
  const [cashoutProfit, setCashoutProfit] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([1.85, 2.40, 1.12, 5.80, 1.45, 12.30, 1.05]);
  const [otherPlayers, setOtherPlayers] = useState([
    { name: 't1209***', bet: 200, cashedAt: null as number | null },
    { name: 'rakib***', bet: 500, cashedAt: null as number | null },
    { name: 'bdt_king***', bet: 1000, cashedAt: null as number | null },
  ]);

  const currentUser = storage.getCurrentUser();
  const balance = currentUser?.wallet.balance ?? 0;
  const crashPointRef = useRef<number>(2.0);

  // Round controller
  useEffect(() => {
    let animFrame: number;
    let startTime: number;

    if (gameState === 'flying') {
      startTime = Date.now();
      const currentCrash = crashPointRef.current;

      const tick = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        // Exponential flight curve
        const nextMult = Number((1.0 + Math.pow(elapsed * 0.75, 1.8)).toFixed(2));

        if (nextMult >= currentCrash) {
          setMultiplier(currentCrash);
          setGameState('crashed');
          setHistory(prev => [currentCrash, ...prev.slice(0, 7)]);
          soundFX.playClick();

          if (hasBet && !cashedOut) {
            storage.recordGameBet('micro-flyx', 'FlyX Crash', 'Microgaming', betAmount, 0, 0);
          }

          // Restart next round after 3 seconds
          setTimeout(() => {
            setGameState('betting');
            setHasBet(false);
            setCashedOut(false);
            setMultiplier(1.00);
            setCashoutProfit(0);
          }, 3000);
        } else {
          setMultiplier(nextMult);

          // Random AI player cashouts
          setOtherPlayers(prev =>
            prev.map(p => {
              if (!p.cashedAt && nextMult > 1.3 && Math.random() < 0.05) {
                return { ...p, cashedAt: nextMult };
              }
              return p;
            })
          );

          animFrame = requestAnimationFrame(tick);
        }
      };

      animFrame = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [gameState, hasBet, cashedOut, betAmount]);

  const placeBet = () => {
    if (balance < betAmount) {
      alert('ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!');
      return;
    }
    storage.updateBalance(-betAmount);
    onBalanceChange();
    setHasBet(true);
    soundFX.playClick();
  };

  const cashOut = () => {
    if (!hasBet || cashedOut || gameState !== 'flying') return;
    const win = Number((betAmount * multiplier).toFixed(2));
    storage.updateBalance(win);
    onBalanceChange();
    setCashedOut(true);
    setCashoutProfit(win);
    soundFX.playWin();
    storage.recordGameBet('micro-flyx', 'FlyX Crash', 'Microgaming', betAmount, win, multiplier);
  };

  const startFlight = () => {
    // Generate crash point with 97% RTP distribution
    const rand = Math.random();
    let point = 1.05;
    if (rand < 0.05) point = 1.00; // instant crash
    else if (rand < 0.5) point = Number((1.1 + Math.random() * 1.5).toFixed(2));
    else if (rand < 0.8) point = Number((2.0 + Math.random() * 3.5).toFixed(2));
    else if (rand < 0.95) point = Number((5.0 + Math.random() * 8.0).toFixed(2));
    else point = Number((15.0 + Math.random() * 35.0).toFixed(2));

    crashPointRef.current = point;
    setOtherPlayers([
      { name: 't1209***', bet: 200, cashedAt: null },
      { name: 'rakib***', bet: 500, cashedAt: null },
      { name: 'bdt_king***', bet: 1000, cashedAt: null },
    ]);
    setGameState('flying');
    soundFX.playSpin();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-2 sm:p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-3 rounded-t-xl border-b border-rose-600">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-rose-600 text-white font-bold rounded text-xs flex items-center gap-1">
            <Rocket size={12} /> FlyX
          </div>
          <span className="font-bold text-white text-sm">Microgaming Crash (ফ্লাইএক্স)</span>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-white bg-red-900/40 p-1 rounded-full">
          <X size={18} />
        </button>
      </div>

      {/* History Pill Bar */}
      <div className="w-full bg-[#111] py-1.5 px-3 flex gap-1.5 overflow-x-auto text-[11px] font-bold border-x border-slate-800">
        {history.map((h, i) => (
          <span
            key={i}
            className={`px-2 py-0.5 rounded-full ${
              h >= 2.0 ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40' : 'bg-blue-950/60 text-blue-300 border border-blue-500/40'
            }`}
          >
            {h.toFixed(2)}x
          </span>
        ))}
      </div>

      {/* Flight Canvas Area */}
      <div className="w-full flex-1 bg-gradient-to-b from-slate-950 to-[#190306] p-4 flex flex-col justify-center items-center relative overflow-hidden border-x border-slate-800">
        {/* Sky trajectory line */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute bottom-10 left-10 right-10 h-[1px] bg-white/20" />
          <div className="absolute bottom-24 left-10 right-10 h-[1px] bg-white/20" />
          <div className="absolute bottom-40 left-10 right-10 h-[1px] bg-white/20" />
        </div>

        {/* Multiplier Central Display */}
        <div className="flex flex-col items-center z-10">
          <div
            className={`text-5xl sm:text-6xl font-black font-num tracking-tight transition-transform ${
              gameState === 'crashed' ? 'text-red-500 scale-95' : 'text-white'
            }`}
          >
            {multiplier.toFixed(2)}x
          </div>

          {gameState === 'crashed' && (
            <div className="mt-2 text-red-400 font-bold text-sm tracking-wider uppercase animate-pulse">
              FLEW AWAY (ক্র্যাশ করেছে!)
            </div>
          )}

          {gameState === 'betting' && (
            <div className="mt-2 text-amber-300 font-bold text-xs bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40">
              পরবর্তী রাউন্ড শুরু হচ্ছে... বাজি ধরুন!
            </div>
          )}
        </div>

        {/* Rocket Icon animating */}
        <div
          className={`absolute transition-all duration-100 ${
            gameState === 'flying'
              ? 'bottom-28 right-24 scale-125 text-rose-500 -rotate-45 animate-bounce'
              : gameState === 'crashed'
              ? 'bottom-40 right-10 text-gray-600 scale-75 opacity-40'
              : 'bottom-12 left-14 text-rose-400 rotate-0'
          }`}
        >
          <Rocket size={42} />
        </div>

        {/* Cashout Success Toast */}
        {cashedOut && (
          <div className="absolute top-4 py-1.5 px-4 bg-emerald-500 text-black font-extrabold text-sm rounded-full shadow-lg flex items-center gap-1 animate-bounce z-20">
            <DollarSign size={16} /> ক্যাশ আউট সফল! ৳ {cashoutProfit.toFixed(2)}
          </div>
        )}
      </div>

      {/* Live Bets Feed & Action */}
      <div className="w-full bg-[#111] p-3 rounded-b-xl border border-slate-800 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">ব্যালেন্স: <strong className="text-yellow-400 font-num">৳ {balance.toFixed(2)}</strong></span>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <TrendingUp size={12} className="text-emerald-400" /> লাইভ প্লেয়ার ক্যাশআউট চলছে
          </div>
        </div>

        {/* Bet Chips */}
        <div className="flex items-center gap-1.5">
          {[20, 50, 100, 200, 500].map(v => (
            <button
              key={v}
              disabled={hasBet}
              onClick={() => {
                soundFX.playClick();
                setBetAmount(v);
              }}
              className={`flex-1 py-1 rounded text-xs font-bold transition-all ${
                betAmount === v ? 'bg-rose-600 text-white' : 'bg-stone-800 text-gray-300'
              }`}
            >
              ৳{v}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex gap-2 mt-1">
          {gameState === 'betting' && !hasBet && (
            <button
              onClick={placeBet}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-extrabold rounded-lg text-sm shadow-lg active:scale-95 transition-all"
            >
              বাজি ধরুন (BET ৳{betAmount})
            </button>
          )}

          {gameState === 'betting' && hasBet && (
            <button
              onClick={startFlight}
              className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-extrabold rounded-lg text-sm shadow-lg active:scale-95 transition-all animate-pulse"
            >
              রকেট লঞ্চ করুন! (LAUNCH NOW)
            </button>
          )}

          {gameState === 'betting' && !hasBet && (
            <button
              onClick={() => {
                placeBet();
                setTimeout(startFlight, 300);
              }}
              className="py-2.5 px-3 bg-gray-800 text-gray-300 font-bold rounded-lg text-xs"
            >
              তাৎক্ষণিক লঞ্চ
            </button>
          )}

          {gameState === 'flying' && hasBet && !cashedOut && (
            <button
              onClick={cashOut}
              className="flex-1 py-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-extrabold rounded-lg text-base shadow-xl shadow-yellow-500/40 active:scale-95 transition-all animate-pulse"
            >
              ক্যাশ আউট করুন ৳ {(betAmount * multiplier).toFixed(2)} ({multiplier.toFixed(2)}x)
            </button>
          )}

          {gameState === 'flying' && (!hasBet || cashedOut) && (
            <div className="flex-1 py-2.5 bg-gray-900/80 text-gray-400 font-bold rounded-lg text-center text-xs flex items-center justify-center">
              ফ্লাইট চলছে... অপেক্ষা করুন ({multiplier.toFixed(2)}x)
            </div>
          )}

          {gameState === 'crashed' && (
            <div className="flex-1 py-2.5 bg-red-950/60 text-red-300 font-bold rounded-lg text-center text-xs flex items-center justify-center">
              পরবর্তী রাউন্ড অপেক্ষা করুন...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
