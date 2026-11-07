import React from 'react';
import { Trophy, Flame, Play } from 'lucide-react';
import { soundFX } from '../utils/audio';
import { GameItem } from '../types';
import { GAME_CATALOG } from '../data/games';

interface WinnersListProps {
  onLaunchGame?: (game: GameItem) => void;
}

interface WinnerItem {
  id: string;
  user: string;
  vipLevel: number;
  avatar: string;
  gameId: string;
  amount: string;
  multiplier: string;
  tier: 'BIG WIN' | 'MEGA WIN' | 'SUPER WIN';
  timeAgo: string;
}

const STATIC_WINNERS: WinnerItem[] = [
  {
    id: 'w-1',
    user: '****Umn',
    vipLevel: 3,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    gameId: 'jili-super-ace',
    amount: '৪,৪৩৪,৫৪৬.০০',
    multiplier: 'x1500',
    tier: 'SUPER WIN',
    timeAgo: 'মাত্র এখন',
  },
  {
    id: 'w-2',
    user: '*******Exx',
    vipLevel: 5,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    gameId: 'jili-fortune-gems-2',
    amount: '৪,৩৪২,৩৩৫.০০',
    multiplier: 'x880',
    tier: 'MEGA WIN',
    timeAgo: '১ মি. আগে',
  },
  {
    id: 'w-3',
    user: '******Miu',
    vipLevel: 8,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    gameId: 'mg-flyx',
    amount: '৮,৬৭৬,৭৭৬.০০',
    multiplier: 'x2450',
    tier: 'SUPER WIN',
    timeAgo: '২ মি. আগে',
  },
  {
    id: 'w-4',
    user: '*******Art',
    vipLevel: 4,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    gameId: 'jili-happy-fishing',
    amount: '৮,৫৬৭,৫৬৬.০০',
    multiplier: 'x950',
    tier: 'MEGA WIN',
    timeAgo: '২ মি. আগে',
  },
  {
    id: 'w-5',
    user: '*****Uis',
    vipLevel: 6,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    gameId: 'bp-teen-patti',
    amount: '৭,৭৫৭,৫৬৭.০০',
    multiplier: 'x640',
    tier: 'BIG WIN',
    timeAgo: '৩ মি. আগে',
  },
  {
    id: 'w-6',
    user: '*******Ord',
    vipLevel: 9,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    gameId: 'pp-live-roulette',
    amount: '৭,৫৭৫,৭৫৭.০০',
    multiplier: 'x1200',
    tier: 'SUPER WIN',
    timeAgo: '৩ মি. আগে',
  },
  {
    id: 'w-7',
    user: '****Rtw',
    vipLevel: 2,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    gameId: 'pg-wild-bounty',
    amount: '৫,৩৪৪,৩৪৬.০০',
    multiplier: 'x5000',
    tier: 'SUPER WIN',
    timeAgo: '৪ মি. আগে',
  },
  {
    id: 'w-8',
    user: '*******Ing',
    vipLevel: 7,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    gameId: 'jili-crazy-777',
    amount: '৫,৩৪৩,৪৩৩.০০',
    multiplier: 'x777',
    tier: 'MEGA WIN',
    timeAgo: '৫ মি. আগে',
  },
  {
    id: 'w-9',
    user: '****Sak',
    vipLevel: 4,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    gameId: 'jili-golden-empire',
    amount: '৩,৯৮৪,১২০.০০',
    multiplier: 'x1200',
    tier: 'BIG WIN',
    timeAgo: '৫ মি. আগে',
  },
  {
    id: 'w-10',
    user: '***Tan',
    vipLevel: 3,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    gameId: 'jili-money-coming',
    amount: '৬,১৪০,২০০.০০',
    multiplier: 'x1000',
    tier: 'SUPER WIN',
    timeAgo: '৬ মি. আগে',
  },
  {
    id: 'w-11',
    user: '******Rak',
    vipLevel: 5,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    gameId: 'jdb-roma-x',
    amount: '৪,৮৯০,৫০০.০০',
    multiplier: 'x850',
    tier: 'MEGA WIN',
    timeAgo: '৭ মি. আগে',
  },
  {
    id: 'w-12',
    user: '*******Fah',
    vipLevel: 6,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    gameId: 'pp-buffalo-king',
    amount: '৯,১২০,৩০০.০০',
    multiplier: 'x3200',
    tier: 'SUPER WIN',
    timeAgo: '৮ মি. আগে',
  },
];

export const WinnersList: React.FC<WinnersListProps> = ({ onLaunchGame }) => {
  // Map winner items with actual game data from GAME_CATALOG
  const winnersWithGames = STATIC_WINNERS.map(w => {
    const game = GAME_CATALOG.find(g => g.id === w.gameId) || GAME_CATALOG[0];
    return { ...w, game };
  });

  // Duplicate items for a continuous seamless upward scroll loop
  const displayItems = [...winnersWithGames, ...winnersWithGames];

  const handleCardClick = (game: GameItem) => {
    soundFX.playWin();
    if (onLaunchGame) {
      onLaunchGame(game);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-2 my-3 select-none">
      {/* Parchment Box with Gold Rim & Red Ribbon (1:1 Clone of PDF page 7) */}
      <div className="bg-gradient-to-b from-[#e8a348] via-[#cf8830] to-[#b37020] rounded-2xl p-1 shadow-2xl relative border-2 border-yellow-200">
        {/* Red Ribbon Title: 'List Of Winners' with Gold Trophy & Live Streaming Dot */}
        <div className="flex items-center justify-between px-3 -mt-3.5 mx-2">
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 py-1.5 px-4 rounded-xl shadow-lg border border-yellow-300 flex items-center gap-1.5 w-fit">
            <Trophy size={15} className="text-yellow-300 animate-bounce" />
            <span className="font-black text-white text-xs sm:text-sm tracking-wide">
              List Of Winners
            </span>
          </div>

          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full border border-yellow-400/40 text-[10px] text-yellow-300 font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>লাইভ জয়ী ফিড</span>
          </div>
        </div>

        {/* Viewport for Vertical Scrolling (নিচ থেকে উপরে আসবে) */}
        <div className="p-2 mt-2 relative h-72 sm:h-80 overflow-hidden rounded-xl bg-gradient-to-b from-[#2a0407]/90 via-[#190204]/95 to-[#2a0407]/90 border border-[#7d141e]/80 shadow-inner group">
          {/* Top & Bottom Gradient Shadows for Smooth Fade Transition */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#190204] to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#190204] to-transparent z-10 pointer-events-none" />

          {/* Continuous Upward Scrolling Ticker Container (নিচ থেকে উপরে) */}
          <div className="space-y-2 animate-vertical-ticker group-hover:[animation-play-state:paused]">
            {displayItems.map((item, idx) => {
              const game = item.game;

              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => handleCardClick(game)}
                  className="bg-gradient-to-r from-[#3e060b] via-[#290306] to-[#1c0204] rounded-xl p-2 border border-[#6b121b] hover:border-amber-400/80 transition-all flex items-center justify-between gap-2.5 shadow-md hover:bg-white/5 cursor-pointer active:scale-98"
                >
                  {/* Left: Player Avatar + Obfuscated Name & VIP */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={item.avatar}
                        alt={item.user}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-yellow-400 shadow-sm"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[8px] font-black px-1 rounded-full shadow">
                        V{item.vipLevel}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-amber-200 font-mono tracking-wide truncate">
                          {item.user}
                        </span>
                        <span className="text-[9px] text-gray-400 shrink-0">
                          {item.timeAgo}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <Flame size={10} className="text-amber-400" />
                        <span>{item.tier}</span>
                      </span>
                    </div>
                  </div>

                  {/* Middle: Real Game from Site (খেলোয়ারের জেতা গেম) */}
                  <div className="flex items-center gap-2 shrink-0 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-amber-400/60 shadow-xs"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] font-bold text-white truncate max-w-[85px] sm:max-w-[100px]">
                        {game.bengaliName}
                      </span>
                      <span className="text-[9px] text-gray-400 truncate max-w-[85px] sm:max-w-[100px]">
                        {game.provider}
                      </span>
                    </div>
                  </div>

                  {/* Right: Won Amount & Play Indicator */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-[10px] text-yellow-300 font-bold">৳</span>
                      <span className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 font-num tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                        {item.amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className="text-[9px] font-extrabold text-amber-300/90 font-num bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">
                        {item.multiplier}
                      </span>
                      <Play size={10} className="text-amber-400 fill-amber-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
