import React, { useState } from 'react';
import { GameItem } from '../types';
import { soundFX } from '../utils/audio';
import { Heart, Search } from 'lucide-react';

interface GameGridProps {
  games: GameItem[];
  onLaunchGame: (game: GameItem) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({ games, onLaunchGame }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredGames = games.filter(g => {
    if (!g.active) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.bengaliName.toLowerCase().includes(q) ||
        g.provider.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full max-w-lg mx-auto px-2 my-2">
      {/* Search Bar matching card_c966a2e0.pdf and Winfish_deaf5f35.pdf: '🔍 অনুসন্ধান' */}
      <div className="mb-3 relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="অনুসন্ধান"
            className="w-full bg-[#1b0305] text-white placeholder-gray-400 text-xs pl-8 pr-4 py-2 rounded-full border border-[#520c13] focus:outline-none focus:border-amber-400 shadow-inner"
          />
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* 3-Column Games Grid (1:1 Match of 60BD.com pages 1 to 6) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {filteredGames.map(game => {
          const isFav = favorites[game.id];

          return (
            <div
              key={game.id}
              onClick={() => {
                soundFX.playClick();
                onLaunchGame(game);
              }}
              className="group cursor-pointer flex flex-col bg-[#1c0205] rounded-xl overflow-hidden border border-[#4d0910] hover:border-amber-400/90 md:hover:scale-[1.04] hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(251,191,36,0.4)] transition-all duration-300 ease-out shadow-md relative select-none"
            >
              {/* 4 Golden/Red dots on the left border (Exact visual signature from PDF screenshots!) */}
              <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10 pointer-events-none opacity-80">
                <span className="w-1 h-1 rounded-full bg-red-500" />
                <span className="w-1 h-1 rounded-full bg-red-500" />
                <span className="w-1 h-1 rounded-full bg-red-500" />
                <span className="w-1 h-1 rounded-full bg-red-500" />
              </div>

              {/* Card Image Area */}
              <div className="relative aspect-square w-full p-1 pl-2.5">
                <div className="w-full h-full rounded-lg overflow-hidden relative bg-black/80">
                  <img
                    src={game.image}
                    alt={game.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top-Right: Delicate White Heart Outline (Exact clone of PDF screenshots) */}
                  <button
                    onClick={e => toggleFav(game.id, e)}
                    className="absolute top-1 right-1 p-1 z-20 hover:scale-110 active:scale-125 transition-transform"
                    title="পছন্দের তালিকা"
                  >
                    <Heart
                      size={14}
                      className={
                        isFav
                          ? 'fill-red-500 text-red-500'
                          : 'text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                      }
                      strokeWidth={1.8}
                    />
                  </button>

                  {/* Multiplier Badge if present (e.g. 15X, 2600X, 100,000X) */}
                  {game.multiplier && (
                    <div className="absolute top-1 left-1 bg-black/70 text-yellow-300 font-extrabold text-[8px] px-1 py-0.2 rounded border border-yellow-500/40">
                      {game.multiplier}
                    </div>
                  )}

                  {/* Provider tag watermark badge */}
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white font-extrabold text-[8px] px-1 py-0.2 rounded">
                    {game.provider === 'Pocket Games Soft'
                      ? 'PG'
                      : game.provider === 'FA CHAI Gaming'
                      ? 'FC'
                      : game.provider === 'Pragmatic Play'
                      ? 'PP'
                      : game.provider}
                  </div>
                </div>
              </div>

              {/* Title & Provider Footer (Exact match to 60BD.com) */}
              <div className="px-1 pb-1.5 pt-0.5 flex flex-col items-center text-center">
                {/* Bengali Title */}
                <h4 className="font-bold text-white text-[11px] truncate w-full leading-tight drop-shadow-xs">
                  {game.bengaliName}
                </h4>

                {/* Provider Name */}
                <span className="text-[10px] text-gray-400 truncate w-full leading-tight mt-0.5">
                  {game.provider}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 100% Golden Progress Bar (Exact clone of 60BD.com page 6) */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="w-48 sm:w-60 h-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500 rounded-full shadow-sm" />
        <span className="text-xs font-black text-amber-400 font-num">100%</span>
      </div>
    </div>
  );
};
