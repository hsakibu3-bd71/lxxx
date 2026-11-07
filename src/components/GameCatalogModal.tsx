import React, { useState } from 'react';
import { GameItem, GameCategory } from '../types';
import { ALL_PROVIDERS } from '../data/games';
import { soundFX } from '../utils/audio';
import { X, Search, Play, Sparkles, Flame, Layers } from 'lucide-react';

interface GameCatalogModalProps {
  isOpen: boolean;
  games: GameItem[];
  onClose: () => void;
  onLaunchGame: (game: GameItem, isDemo?: boolean) => void;
}

const CATEGORY_TABS: { id: GameCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'সকল গেম (All)' },
  { id: 'hot', label: '🔥 গরম খেলা (Hot)' },
  { id: 'slots', label: '🎰 স্লট (Slots)' },
  { id: 'fishing', label: '🐟 মাছ ধরা (Fishing)' },
  { id: 'live', label: '🎥 লাইভ ক্যাসিনো (Live)' },
  { id: 'poker', label: '🃏 পোকার ও কার্ড (Cards)' },
  { id: 'sports', label: '🏏 স্পোর্টস (Sports)' },
  { id: 'lottery', label: '🎱 লটারি (Lottery)' },
];

export const GameCatalogModal: React.FC<GameCatalogModalProps> = ({
  isOpen,
  games,
  onClose,
  onLaunchGame,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'all'>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');

  if (!isOpen) return null;

  const activeGames = games.filter(g => g.active);
  const filteredGames = activeGames.filter(g => {
    if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;
    if (selectedProvider !== 'All' && g.provider !== selectedProvider) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.bengaliName.toLowerCase().includes(q) ||
        g.provider.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0103]/95 backdrop-blur-md flex flex-col overflow-hidden select-none">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#260307] via-[#3b060c] to-[#260307] border-b border-[#630d16] px-4 py-3 flex items-center justify-between shadow-xl shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-red-600 flex items-center justify-center text-black shadow">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>গেম ক্যাটালগ (60bd98.vip All Casino Providers)</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                {filteredGames.length} টি গেম
              </span>
            </h2>
            <p className="text-[11px] text-gray-300">
              সকল রিমোট প্রোভাইডার গেম, লাইভ ক্যাসিনো, স্লট এবং ফ্রি ডেমো মোড
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="p-2 rounded-full bg-black/50 hover:bg-red-900/70 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          title="বন্ধ করুন"
        >
          <X size={18} />
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-[#180205] border-b border-[#45080f] px-4 py-3 space-y-2.5 shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="গেম বা প্রোভাইডার অনুসন্ধান করুন (যেমন: Super Ace, Jili, PG, CQ9)..."
              className="w-full bg-[#100102] text-white placeholder-gray-400 text-xs pl-9 pr-4 py-2 rounded-xl border border-[#520c13] focus:outline-none focus:border-amber-400"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
          </div>

          {/* Category Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORY_TABS.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  soundFX.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md'
                    : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Provider Filter Strip */}
        <div className="max-w-5xl mx-auto flex gap-1.5 overflow-x-auto pt-1">
          {ALL_PROVIDERS.map(prov => (
            <button
              key={prov}
              onClick={() => {
                soundFX.playClick();
                setSelectedProvider(prov);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border transition-all cursor-pointer ${
                selectedProvider === prov
                  ? 'bg-red-700 text-white border-amber-400 shadow'
                  : 'bg-[#120103] text-gray-400 border-[#3d070d] hover:text-white'
              }`}
            >
              {prov === 'All' ? 'সকল প্রোভাইডার' : prov}
            </button>
          ))}
        </div>
      </div>

      {/* Main Catalog Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredGames.map(game => (
            <div
              key={game.id}
              className="group bg-[#1c0205] rounded-2xl overflow-hidden border border-[#4d0910] hover:border-amber-400/90 hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(251,191,36,0.35)] transition-all duration-300 flex flex-col justify-between relative"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-black/80">
                <img
                  src={game.image}
                  alt={game.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {game.isHot && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-[9px] flex items-center gap-0.5 shadow">
                    <Flame size={10} /> HOT
                  </span>
                )}
                {game.multiplier && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 border border-yellow-500/40 text-yellow-300 font-black text-[9px]">
                    {game.multiplier}
                  </span>
                )}
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-emerald-300 font-mono font-bold text-[9px]">
                  RTP {game.rtp}%
                </span>
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-amber-400 text-black font-black text-[9px]">
                  {game.provider}
                </span>
              </div>

              <div className="p-2.5 space-y-2">
                <div>
                  <h4 className="font-bold text-white text-xs truncate">{game.bengaliName}</h4>
                  <p className="text-[10px] text-gray-400 truncate">{game.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      onLaunchGame(game, false);
                    }}
                    className="py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-black font-black text-[10px] flex items-center justify-center gap-1 shadow cursor-pointer"
                  >
                    <Play size={10} fill="currentColor" />
                    <span>খেলুন</span>
                  </button>
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      onLaunchGame(game, true);
                    }}
                    className="py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 font-bold text-[10px] flex items-center justify-center gap-1 border border-amber-400/30 cursor-pointer"
                  >
                    <Sparkles size={10} />
                    <span>ডেমো</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
