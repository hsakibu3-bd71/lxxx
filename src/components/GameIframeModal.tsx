import React, { useState, useRef, useEffect } from 'react';
import { GameItem, UserProfile } from '../types';
import { soundFX } from '../utils/audio';
import { storage } from '../services/storage';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  RotateCw,
  Wallet,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';

interface GameIframeModalProps {
  game: GameItem;
  user: UserProfile | null;
  onClose: () => void;
  onOpenDeposit: () => void;
  onRefreshBalance: () => void;
}

export const GameIframeModal: React.FC<GameIframeModalProps> = ({
  game,
  user,
  onClose,
  onOpenDeposit,
  onRefreshBalance,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [launchedUrl, setLaunchedUrl] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    soundFX.playClick();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Listen for Seamless Wallet bet/win synchronization from game iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.type === 'LIVEXWIN_BET_RESULT' && user) {
        const netDelta = Number(data.payoutAmount || 0) - Number(data.betAmount || 0);
        storage.updateBalance(netDelta);
        storage.recordGameBet(
          data.gameId || game.id,
          data.gameName || game.name,
          data.provider || game.provider,
          Number(data.betAmount || 0),
          Number(data.payoutAmount || 0),
          Number(data.multiplier || 0)
        );
        onRefreshBalance();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, game, onRefreshBalance]);

  // Launch Game via SoftAggregator API v1 (PDF Page 5-6: createPlayer -> getGame / getGameDemo)
  useEffect(() => {
    let cancelled = false;
    const launchViaSoftAggregator = async () => {
      setIsLoading(true);
      const settings = storage.getSiteSettings();
      const apiLogin = settings.softAggregatorApiLogin || 'DEMO_LIVEXWIN_LOGIN';
      const apiPassword = settings.softAggregatorApiPassword || 'DEMO_LIVEXWIN_PASS';
      const currency = settings.softAggregatorCurrency || 'BDT';
      const country = settings.softAggregatorCountry || 'BD';
      const providerSlug = game.provider.toLowerCase().replace(/[^a-z0-9]/g, '');
      const gameSlug = game.name.replace(/[^a-zA-Z0-9]/g, '');
      const idHash = `${providerSlug}/${gameSlug}`;
      const isMobileDevice = window.innerWidth <= 768;

      try {
        if (user) {
          // 1. Ensure player exists via createPlayer (PDF Page 5)
          await fetch('/api/softaggregator/v1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_login: apiLogin,
              api_password: apiPassword,
              method: 'createPlayer',
              user_username: user.username,
              user_password: user.loginPassword || '123456',
              currency,
              balance: user.wallet.balance,
            }),
          });

          // 2. Launch real-money game via getGame (PDF Page 5-6)
          const res = await fetch('/api/softaggregator/v1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_login: apiLogin,
              api_password: apiPassword,
              method: 'getGame',
              user_username: user.username,
              user_password: user.loginPassword || '123456',
              gameid: idHash,
              lang: 'bn',
              currency,
              device: isMobileDevice ? 'mobile' : 'desktop',
              country,
              homeurl: window.location.origin,
              balance: user.wallet.balance,
            }),
          });
          const data = await res.json();
          if (!cancelled && data.error === 0 && typeof data.response === 'string') {
            setLaunchedUrl(data.response);
            return;
          }
        } else {
          // Guest demo launch via getGameDemo (PDF Page 6: country never required in demo mode)
          const res = await fetch('/api/softaggregator/v1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_login: apiLogin,
              api_password: apiPassword,
              method: 'getGameDemo',
              gameid: idHash,
              lang: 'bn',
              currency,
              device: isMobileDevice ? 'mobile' : 'desktop',
              homeurl: window.location.origin,
              play_for_fun: true,
            }),
          });
          const data = await res.json();
          if (!cancelled && data.error === 0 && typeof data.response === 'string') {
            setLaunchedUrl(data.response);
            return;
          }
        }
      } catch {
        // Fallback if network request fails
      }

      if (!cancelled) {
        const username = user?.username || 'DemoPlayer';
        const bdtBalance = user ? user.wallet.balance : 500;
        setLaunchedUrl(
          `/game_frame.php?gameid=${encodeURIComponent(idHash)}&name=${encodeURIComponent(
            game.name
          )}&provider=${encodeURIComponent(game.provider)}&user=${encodeURIComponent(
            username
          )}&balance=${bdtBalance}&demo=${user ? '0' : '1'}`
        );
      }
    };

    launchViaSoftAggregator();
    return () => {
      cancelled = true;
    };
  }, [game, user?.id, iframeKey]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden select-none"
      onContextMenu={e => e.preventDefault()}
    >
      {/* Top Gaming Bar (48px height) */}
      <div className="h-12 bg-gradient-to-r from-[#1f0205] via-[#33050a] to-[#1f0205] border-b border-[#5a0c13] px-3 flex items-center justify-between text-white shadow-xl z-20 shrink-0">
        {/* Left: Back & Game Info */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white border border-white/10 active:scale-95 transition-transform cursor-pointer"
            title="গেম থেকে বের হন"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-white truncate max-w-[120px] sm:max-w-[180px] leading-tight">
              {game.bengaliName || game.name}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
                {game.provider}
              </span>
              <span className="text-[9px] text-emerald-400 font-mono font-semibold flex items-center gap-0.5">
                <ShieldCheck size={10} /> SoftAggregator v1
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Balance & Quick Deposit */}
        <div className="flex items-center gap-2">
          {/* Wallet Balance */}
          <div className="flex items-center gap-1.5 bg-black/50 border border-yellow-500/30 px-2.5 py-1 rounded-full">
            <Wallet size={12} className="text-yellow-400" />
            <span className="text-xs font-mono font-black text-yellow-300">
              ৳ {user ? user.wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '500.00 (Demo)'}
            </span>
          </div>

          {/* Quick Deposit Button */}
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenDeposit();
            }}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs rounded-full shadow-md active:scale-95 transition-transform cursor-pointer"
            title="দ্রুত ডিপোজিট"
          >
            <PlusCircle size={13} />
            <span>ডিপোজিট</span>
          </button>

          {/* Reload Iframe */}
          <button
            onClick={() => {
              soundFX.playClick();
              setIsLoading(true);
              setIframeKey(Date.now());
              onRefreshBalance();
            }}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white border border-white/10 active:scale-95 transition-transform cursor-pointer"
            title="গেম রিলোড করুন"
          >
            <RotateCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white border border-white/10 active:scale-95 transition-transform cursor-pointer"
            title={isFullscreen ? 'ছোট স্ক্রিন' : 'ফুলস্ক্রিন'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Iframe Container sized to calc(100dvh - 48px) per SoftAggregator PDF Page 6 Mobile Tip */}
      <div className="w-full h-[calc(100dvh-48px)] relative bg-[#0a0002] flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0e0103] gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-bold text-yellow-300">
                {game.bengaliName || game.name} লোড হচ্ছে...
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                SoftAggregator API v1 Seamless Wallet সংযোগ স্থাপন হচ্ছে
              </p>
            </div>
          </div>
        )}

        {launchedUrl && (
          <iframe
            key={iframeKey}
            src={launchedUrl}
            title={game.name}
            onLoad={() => setIsLoading(false)}
            allow="fullscreen; autoplay; screen-wake-lock; orientation; clipboard-write"
            className="w-full h-full border-0 select-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        )}
      </div>
    </div>
  );
};
