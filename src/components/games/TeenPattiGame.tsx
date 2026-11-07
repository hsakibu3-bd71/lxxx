import React, { useState } from 'react';
import { soundFX } from '../../utils/audio';
import { storage } from '../../services/storage';
import { X, Play, RotateCcw } from 'lucide-react';

interface TeenPattiGameProps {
  onClose: () => void;
  onBalanceChange: () => void;
}

interface Card {
  suit: string;
  value: string;
  color: string;
}

const SUITS = [
  { suit: '♠', color: 'text-white' },
  { suit: '♥', color: 'text-red-500' },
  { suit: '♣', color: 'text-white' },
  { suit: '♦', color: 'text-red-500' },
];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const TeenPattiGame: React.FC<TeenPattiGameProps> = ({ onClose, onBalanceChange }) => {
  const [selectedSide, setSelectedSide] = useState<'player' | 'dealer' | 'tie'>('player');
  const [betAmount, setBetAmount] = useState<number>(50);
  const [playerCards, setPlayerCards] = useState<Card[]>([
    { suit: '♠', value: 'A', color: 'text-white' },
    { suit: '♥', value: 'K', color: 'text-red-500' },
    { suit: '♦', value: 'Q', color: 'text-red-500' },
  ]);
  const [dealerCards, setDealerCards] = useState<Card[]>([
    { suit: '♣', value: 'J', color: 'text-white' },
    { suit: '♠', value: '10', color: 'text-white' },
    { suit: '♥', value: '9', color: 'text-red-500' },
  ]);
  const [dealing, setDealing] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string>('');

  const currentUser = storage.getCurrentUser();
  const balance = currentUser?.wallet.balance ?? 0;

  const getRandomCard = (): Card => {
    const s = SUITS[Math.floor(Math.random() * SUITS.length)];
    const v = VALUES[Math.floor(Math.random() * VALUES.length)];
    return { suit: s.suit, value: v, color: s.color };
  };

  const deal = () => {
    if (balance < betAmount) {
      alert('পর্যাপ্ত ব্যালেন্স নেই!');
      return;
    }

    storage.updateBalance(-betAmount);
    onBalanceChange();
    soundFX.playSpin();

    setDealing(true);
    setResultText('');

    setTimeout(() => {
      const p = [getRandomCard(), getRandomCard(), getRandomCard()];
      const d = [getRandomCard(), getRandomCard(), getRandomCard()];
      setPlayerCards(p);
      setDealerCards(d);

      const pScore = p.reduce((acc, c) => acc + (VALUES.indexOf(c.value) + 2), 0);
      const dScore = d.reduce((acc, c) => acc + (VALUES.indexOf(c.value) + 2), 0);

      let winner: 'player' | 'dealer' | 'tie' = 'player';
      if (pScore > dScore) winner = 'player';
      else if (dScore > pScore) winner = 'dealer';
      else winner = 'tie';

      if (winner === selectedSide) {
        const mult = winner === 'tie' ? 8 : 2;
        const win = betAmount * mult;
        storage.updateBalance(win);
        onBalanceChange();
        soundFX.playWin();
        setResultText(`🎉 অভিনন্দন! আপনি জিতেছেন ৳${win}!`);
        storage.recordGameBet('kings-teen-patti', 'Teen Patti (তিন পত্তি)', 'Kings Poker', betAmount, win, mult);
      } else {
        soundFX.playClick();
        setResultText(`❌ ${winner === 'player' ? 'প্লেয়ার' : 'ডিলার'} জিতেছে। আবার চেষ্টা করুন!`);
        storage.recordGameBet('kings-teen-patti', 'Teen Patti', 'Kings Poker', betAmount, 0, 0);
      }

      setDealing(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-2 sm:p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-gradient-to-r from-emerald-950 via-green-900 to-emerald-950 p-3 rounded-t-xl border-b border-emerald-500">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-yellow-400 text-black font-extrabold rounded text-xs">POKER</div>
          <span className="font-bold text-white text-sm">Teen Patti & Andar Bahar (তিন পত্তি)</span>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-white bg-red-900/40 p-1 rounded-full">
          <X size={18} />
        </button>
      </div>

      {/* Casino Felt Table */}
      <div className="w-full flex-1 bg-gradient-to-b from-[#0a2e1d] to-[#04160d] p-3 flex flex-col justify-between items-center border-x border-emerald-800 relative">
        {/* Dealer Section */}
        <div className="flex flex-col items-center w-full">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
            ডিলার হ্যান্ড (DEALER)
          </span>
          <div className="flex gap-2">
            {dealerCards.map((card, i) => (
              <div
                key={i}
                className="w-14 h-20 bg-white rounded-md border border-gray-400 shadow-lg flex flex-col items-center justify-center font-bold text-black select-none"
              >
                <span className="text-sm">{card.value}</span>
                <span className={`text-xl ${card.color}`}>{card.suit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Toast */}
        {resultText && (
          <div className="py-1.5 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-sm rounded-full shadow-xl animate-bounce">
            {resultText}
          </div>
        )}

        {/* Player Section */}
        <div className="flex flex-col items-center w-full">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
            আপনার হ্যান্ড (PLAYER)
          </span>
          <div className="flex gap-2">
            {playerCards.map((card, i) => (
              <div
                key={i}
                className="w-14 h-20 bg-white rounded-md border-2 border-amber-400 shadow-xl flex flex-col items-center justify-center font-bold text-black select-none"
              >
                <span className="text-sm">{card.value}</span>
                <span className={`text-xl ${card.color}`}>{card.suit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bet & Controls */}
      <div className="w-full bg-[#051a10] p-3 rounded-b-xl border border-emerald-900 flex flex-col gap-2">
        {/* Betting target selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedSide('player')}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              selectedSide === 'player'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white ring-2 ring-cyan-300'
                : 'bg-stone-900 text-gray-400 border border-stone-800'
            }`}
          >
            প্লেয়ার (1:1)
          </button>
          <button
            onClick={() => setSelectedSide('tie')}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              selectedSide === 'tie'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black ring-2 ring-yellow-200'
                : 'bg-stone-900 text-gray-400 border border-stone-800'
            }`}
          >
            টাই (1:8)
          </button>
          <button
            onClick={() => setSelectedSide('dealer')}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              selectedSide === 'dealer'
                ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white ring-2 ring-red-300'
                : 'bg-stone-900 text-gray-400 border border-stone-800'
            }`}
          >
            ডিলার (1:1)
          </button>
        </div>

        {/* Chips */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">ব্যালেন্স: <strong className="text-yellow-400 font-num">৳ {balance.toFixed(2)}</strong></span>
          <div className="flex gap-1">
            {[20, 50, 100, 500].map(v => (
              <button
                key={v}
                onClick={() => setBetAmount(v)}
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  betAmount === v ? 'bg-amber-400 text-black font-extrabold' : 'bg-stone-800 text-gray-300'
                }`}
              >
                ৳{v}
              </button>
            ))}
          </div>
        </div>

        {/* Deal button */}
        <button
          onClick={deal}
          disabled={dealing}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-black font-extrabold rounded-lg text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {dealing ? <RotateCcw size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
          {dealing ? 'কার্ড বন্টন হচ্ছে...' : `বাজি ধরুন (DEAL ৳${betAmount})`}
        </button>
      </div>
    </div>
  );
};
