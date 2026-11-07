import React, { useState, useEffect } from 'react';
import { soundFX } from '../utils/audio';
import { storage } from '../services/storage';
import { ProviderConfig } from '../types';

interface ProviderTabsProps {
  selectedProvider: string;
  onSelectProvider: (provider: string) => void;
}

export const ProviderTabs: React.FC<ProviderTabsProps> = ({
  selectedProvider,
  onSelectProvider,
}) => {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);

  const loadProviders = () => {
    const list = storage.getProviders().filter(p => p.status === 'active');
    setProviders(list);
  };

  useEffect(() => {
    loadProviders();

    // Listen for storage updates so admin changes reflect immediately
    const handleStorageChange = () => {
      loadProviders();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('livexwin_providers_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('livexwin_providers_updated', handleStorageChange);
    };
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto px-2 my-2.5">
      {/* Horizontal scrollable provider card frames */}
      <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none items-center">
        {/* "All" Card Frame */}
        <button
          onClick={() => {
            soundFX.playClick();
            onSelectProvider('All');
          }}
          className={`shrink-0 px-3.5 py-1.5 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
            selectedProvider === 'All'
              ? 'border-amber-400 bg-gradient-to-r from-amber-500/25 via-[#4a0d13] to-amber-500/25 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'border-[#42080d] bg-gradient-to-b from-[#240306] to-[#120103] text-gray-400 hover:border-[#6e111a] hover:text-gray-200'
          }`}
        >
          <span className="text-amber-400">❖</span>
          <span>সব (All)</span>
        </button>

        {/* Dynamic Provider Card Frames (Customized from Admin with Logo / Image / Text) */}
        {providers.map(prov => {
          const isSelected = selectedProvider === prov.name;
          const showType = prov.showType || 'both';
          const hasImage = Boolean(prov.logoUrl && prov.logoUrl.trim().length > 0);

          return (
            <button
              key={prov.id}
              onClick={() => {
                soundFX.playClick();
                onSelectProvider(prov.name);
              }}
              title={prov.displayName || prov.name}
              className={`shrink-0 px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 shadow-sm active:scale-95 select-none ${
                isSelected
                  ? 'border-amber-400 bg-gradient-to-r from-amber-500/25 via-[#4a0d13] to-amber-500/25 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                  : 'border-[#42080d] bg-gradient-to-b from-[#240306] to-[#120103] text-gray-300 hover:border-[#6e111a] hover:text-white'
              }`}
            >
              {/* Provider Logo Image in Card Frame */}
              {hasImage && showType !== 'text_only' && (
                <div className="w-5 h-5 rounded-md overflow-hidden bg-black/40 p-0.5 shrink-0 flex items-center justify-center border border-white/10">
                  <img
                    src={prov.logoUrl}
                    alt={prov.name}
                    className="w-full h-full object-contain filter drop-shadow"
                    onError={e => {
                      // Fallback gracefully if image link is invalid
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Provider Text Name in Card Frame */}
              {showType !== 'image_only' && (
                <span className="text-xs font-black whitespace-nowrap tracking-wide">
                  {prov.displayName || prov.name}
                </span>
              )}

              {/* Indicator dot if selected */}
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_#f59e0b]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
