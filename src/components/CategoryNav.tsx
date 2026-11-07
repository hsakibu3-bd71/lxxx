import React, { useState, useEffect } from 'react';
import { GameCategory } from '../types';
import { soundFX } from '../utils/audio';
import { storage } from '../services/storage';

interface CategoryNavProps {
  activeCategory: GameCategory | 'all';
  onSelectCategory: (cat: GameCategory | 'all') => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  const [assets, setAssets] = useState(storage.getSiteAssets());

  useEffect(() => {
    const handleUpdate = () => {
      setAssets(storage.getSiteAssets());
    };
    window.addEventListener('livexwin_assets_updated', handleUpdate);
    return () => window.removeEventListener('livexwin_assets_updated', handleUpdate);
  }, []);

  const categoryCards = assets.categories.length > 0 ? assets.categories : [];
  const currentCard = categoryCards.find(c => c.id === activeCategory) || categoryCards[0] || {
    id: 'hot',
    titleBn: 'গরম খেলা',
    subBn: 'প্রতিদিন নতুন স্লট',
    image: '',
    iconBg: '',
  };

  return (
    <div className="w-full max-w-lg mx-auto px-2 my-2">
      {/* 1. Horizontal Scroll of 3D Illustrated Category Cards matching PDF page 1 */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoryCards.map(cat => {
          const isActive = activeCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => {
                soundFX.playClick();
                onSelectCategory(cat.id as GameCategory);
              }}
              className={`cursor-pointer w-24 sm:w-28 h-20 rounded-xl overflow-hidden relative shrink-0 transition-all duration-200 select-none border ${
                isActive
                  ? 'border-yellow-400 ring-2 ring-yellow-400/40 shadow-lg scale-105'
                  : 'border-[#5c0d15] opacity-80 hover:opacity-100 hover:border-red-700'
              }`}
            >
              {/* Background artwork */}
              <img
                src={cat.image}
                alt={cat.titleBn}
                className="w-full h-full object-cover filter brightness-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Title label on bottom */}
              <div className="absolute bottom-1 left-1 right-1 text-center">
                <span
                  className={`text-[11px] font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] leading-tight block ${
                    isActive ? 'text-yellow-300' : 'text-white'
                  }`}
                >
                  {cat.titleBn}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Red Rounded Banner for Active Category matching PDF page 1: 'গরম খেলা - প্রতিদিন নতুন স্লট' */}
      <div className="mt-2 bg-gradient-to-r from-[#5a0910] via-[#85121c] to-[#5a0910] rounded-xl py-2 px-4 border border-[#b81d28] shadow-md flex items-center justify-between text-center">
        <div className="w-full">
          <h3 className="text-base sm:text-lg font-black text-amber-300 drop-shadow-sm leading-tight">
            {currentCard.titleBn}
          </h3>
          <p className="text-xs text-white/90 font-medium">
            {currentCard.subBn}
          </p>
        </div>
      </div>
    </div>
  );
};
