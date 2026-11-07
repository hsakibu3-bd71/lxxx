import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { soundFX } from './utils/audio';
import { GameItem, GameCategory, UserProfile } from './types';
import { Header } from './components/Header';
import { BannerSlider } from './components/BannerSlider';
import { MarqueeNotice } from './components/MarqueeNotice';
import { CategoryNav } from './components/CategoryNav';
import { ProviderTabs } from './components/ProviderTabs';
import { GameGrid } from './components/GameGrid';
import { JackpotDisplay } from './components/JackpotDisplay';
import { WinnersList } from './components/WinnersList';
import { AppDownloadSection } from './components/AppDownloadSection';
import { PaymentFooter } from './components/PaymentFooter';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { MemberCenter } from './components/MemberCenter';
import { GoldenEggModal, RedPacketModal, WheelModal, RescueFundModal } from './components/BonusModals';
import { AuthModal } from './components/AuthModals';
import { AndroidAppModal } from './components/AndroidAppModal';
import { AdminControlPanel } from './components/admin/AdminControlPanel';
import { PromotionsCenter } from './components/PromotionsCenter';
import { InviteCenter } from './components/InviteCenter';
import { GameIframeModal } from './components/GameIframeModal';
import { DownloadCenterModal } from './components/DownloadCenterModal';

// Playable Games
import { SuperAceGame } from './components/games/SuperAceGame';
import { FortuneGemsGame } from './components/games/FortuneGemsGame';
import { FlyXGame } from './components/games/FlyXGame';
import { HappyFishingGame } from './components/games/HappyFishingGame';
import { TeenPattiGame } from './components/games/TeenPattiGame';
import { LiveCasinoGame } from './components/games/LiveCasinoGame';

import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => storage.getCurrentUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [activeCategory, setActiveCategory] = useState<GameCategory | 'all'>('hot');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Auth Modal Mode ('login' | 'register')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Standalone Admin Route Detection (/admin or #admin)
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname.startsWith('/admin') ||
      window.location.hash === '#admin' ||
      window.location.search.includes('admin=1')
    );
  });

  // Modals
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [isEggModalOpen, setIsEggModalOpen] = useState(false);
  const [isRedPacketOpen, setIsRedPacketOpen] = useState(false);
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isRescueOpen, setIsRescueOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAndroidAppOpen, setIsAndroidAppOpen] = useState(false);
  const [isDownloadCenterOpen, setIsDownloadCenterOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Active Game Launchers (Interactive Iframe & Native Engines)
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);
  const [activeIframeGame, setActiveIframeGame] = useState<GameItem | null>(null);
  const [isDemoLaunch, setIsDemoLaunch] = useState<boolean>(false);
  const [catalogTick, setCatalogTick] = useState<number>(0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Listen for real-time catalog & favorites updates from Firestore / Admin Panel
  useEffect(() => {
    const onCatalogChange = () => setCatalogTick(t => t + 1);
    window.addEventListener('livexwin_catalog_updated', onCatalogChange);
    return () => window.removeEventListener('livexwin_catalog_updated', onCatalogChange);
  }, []);

  // Listen for hash/popstate changes for standalone /admin or #admin
  useEffect(() => {
    const checkRoute = () => {
      const isAdm =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash === '#admin' ||
        window.location.search.includes('admin=1');
      setIsAdminRoute(isAdm);
    };
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  // STRICT ZOOM PREVENTION (Touch gesture / Pinch / Double-tap / Wheel zoom OFF)
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('gesturestart', handleGesture);
    document.addEventListener('gesturechange', handleGesture);
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('gesturestart', handleGesture);
      document.removeEventListener('gesturechange', handleGesture);
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const refreshUser = () => {
    setCurrentUser(storage.getCurrentUser());
    setCatalogTick(t => t + 1);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const requireAuth = (callback: () => void) => {
    const u = storage.getCurrentUser();
    if (!u) {
      openAuthModal('login');
      return;
    }
    callback();
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setIsMemberOpen(false);
    setActiveTab('home');
    showToast('আপনি সফলভাবে লগআউট করেছেন।');
  };

  const handleLaunchGame = (game: GameItem, isDemo: boolean = false) => {
    soundFX.playClick();
    setIsDemoLaunch(isDemo);
    setActiveIframeGame(game);
  };

  const handleCloseGame = () => {
    setActiveGame(null);
    setActiveIframeGame(null);
    setIsDemoLaunch(false);
    refreshUser();
  };

  // Separated Standalone Admin Panel View (/admin or #admin)
  if (isAdminRoute) {
    return (
      <AdminControlPanel
        onClose={() => {
          if (window.location.hash === '#admin') {
            window.history.pushState('', document.title, window.location.pathname);
          } else if (window.location.pathname.startsWith('/admin')) {
            window.history.pushState('', document.title, '/');
          }
          setIsAdminRoute(false);
          refreshUser();
        }}
        onRefreshData={refreshUser}
      />
    );
  }

  const allGames = storage.getGames();
  void catalogTick;
  const visibleGames = allGames.filter(g => {
    if (activeCategory !== 'all' && g.category !== activeCategory) {
      return false;
    }
    if (selectedProvider !== 'All' && g.provider !== selectedProvider) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0e0102] text-white flex flex-col items-center justify-start font-sans selection:bg-amber-400 selection:text-black">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs px-4 py-2 rounded-full shadow-2xl border border-yellow-200 animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Desktop / Computer Device View Switcher bar (Only visible on large screens) */}
      <div className="hidden lg:flex w-full bg-[#180204] border-b border-[#3e080d] py-1.5 px-4 justify-between items-center text-xs text-gray-400 z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-gray-300">LivexWin Ultra HD Gaming Platform</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-lg border border-red-950">
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1 rounded-md font-bold flex items-center gap-1 transition-all ${
                viewMode === 'mobile'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone size={13} />
              <span>মোবাইল ভিউ (Mobile View)</span>
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1 rounded-md font-bold flex items-center gap-1 transition-all ${
                viewMode === 'desktop'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Monitor size={13} />
              <span>কম্পিউটার ভিউ (Wide Screen)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Outer Shell: Mobile Frame vs Wide Desktop Container */}
      <div
        className={`w-full min-h-screen flex flex-col relative transition-all duration-300 ${
          viewMode === 'mobile'
            ? 'max-w-md bg-[#160103] shadow-[0_0_50px_rgba(0,0,0,0.9)] border-x border-[#3a060b]'
            : 'max-w-5xl bg-[#160103] shadow-2xl border-x border-[#3a060b]'
        }`}
      >
        {/* 1. Header (Clean Player Header: [লগইন] / [নিবন্ধন] when logged out, Profile Capsule + Logout when logged in, NO Admin button on Home Page) */}
        <Header
          user={currentUser}
          onRefreshBalance={refreshUser}
          onOpenDeposit={() => requireAuth(() => setIsDepositOpen(true))}
          onOpenMember={() => requireAuth(() => setIsMemberOpen(true))}
          onOpenAppDownload={() => setIsAndroidAppOpen(true)}
          onOpenAuth={(mode) => openAuthModal(mode)}
          onLogout={handleLogout}
        />

        {/* Main Viewport Content based on Active Bottom Tab */}
        <main className="flex-1 pb-16">
          {activeTab === 'home' && (
            <>
              {/* Promotional Banner Carousel */}
              <BannerSlider
                onOpenDeposit={() => requireAuth(() => setIsDepositOpen(true))}
                onOpenEggGame={() => requireAuth(() => setIsEggModalOpen(true))}
                onOpenRedPacket={() => requireAuth(() => setIsRedPacketOpen(true))}
              />

              {/* Marquee Notice Ticker with Speaker & Envelope Badge 6 */}
              <MarqueeNotice onOpenMailbox={() => requireAuth(() => setIsMemberOpen(true))} />

              {/* 3D Illustrated Category Navigation with Red Banner */}
              <CategoryNav
                activeCategory={activeCategory}
                onSelectCategory={cat => {
                  setActiveCategory(cat);
                  setSelectedProvider('All');
                }}
              />

              {/* Provider Tabs */}
              <ProviderTabs
                selectedProvider={selectedProvider}
                onSelectProvider={prov => setSelectedProvider(prov)}
              />

              {/* 3-Column Games Catalog Grid with 4 Dots & Heart Icons */}
              <GameGrid
                games={visibleGames}
                onLaunchGame={handleLaunchGame}
              />

              {/* Live Digital Jackpot Display */}
              <JackpotDisplay />

              {/* Real-time Winners List (Parchment Card) */}
              <WinnersList onLaunchGame={handleLaunchGame} />

              {/* App Download Showcase (iOS & Android App) */}
              <AppDownloadSection
                onOpenDeposit={() => requireAuth(() => setIsDepositOpen(true))}
                onOpenAndroidApp={() => setIsAndroidAppOpen(true)}
              />

              {/* Payment Badges & Licensing 4-Column Footer */}
              <PaymentFooter onOpenDeposit={() => requireAuth(() => setIsDepositOpen(true))} />
            </>
          )}

          {/* 2. প্রমোশন সেন্টার (Promotions Tab) */}
          {activeTab === 'promo' && (
            <PromotionsCenter
              onOpenDeposit={() => requireAuth(() => setIsDepositOpen(true))}
              onOpenEggGame={() => requireAuth(() => setIsEggModalOpen(true))}
              onOpenRedPacket={() => requireAuth(() => setIsRedPacketOpen(true))}
              onOpenWheel={() => requireAuth(() => setIsWheelOpen(true))}
              onOpenRescueFund={() => requireAuth(() => setIsRescueOpen(true))}
              onOpenInvite={() => setActiveTab('invite')}
              onClaimDaily={() => {
                requireAuth(() => {
                  const res = storage.claimDailyCheckin();
                  if (res.success) {
                    soundFX.playWin();
                    showToast(res.message);
                    refreshUser();
                  } else {
                    showToast(res.message);
                  }
                });
              }}
            />
          )}

          {/* 3. আমন্ত্রণ ও এজেন্সি কেন্দ্র (Invite Tab) */}
          {activeTab === 'invite' && (
            <InviteCenter user={currentUser} />
          )}
        </main>

        {/* Floating Action Buttons */}
        <div className="fixed right-3 bottom-24 z-30 flex flex-col gap-2.5 pointer-events-auto">
          {/* Floating Red Share/People Button */}
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('invite');
            }}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-center shadow-xl border border-yellow-400 active:scale-95 transition-transform"
            title="আমন্ত্রণ জানান"
          >
            <span className="text-base select-none">👥</span>
          </button>

          {/* Floating Telegram Paper Airplane Button */}
          <a
            href="https://t.me/livexwin_official"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundFX.playClick()}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-center shadow-xl border border-yellow-400 active:scale-95 transition-transform"
            title="টেলিগ্রাম চ্যানেল"
          >
            <span className="text-base select-none">✈️</span>
          </a>
        </div>

        {/* Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={tab => {
            if (tab === 'deposit') {
              requireAuth(() => setIsDepositOpen(true));
            } else if (tab === 'member') {
              requireAuth(() => setIsMemberOpen(true));
            } else {
              setActiveTab(tab);
            }
          }}
        />
      </div>

      {/* Interactive Casino Game Iframe Modal */}
      {activeIframeGame && (
        <GameIframeModal
          game={activeIframeGame}
          user={currentUser}
          initialDemoMode={isDemoLaunch}
          onClose={handleCloseGame}
          onOpenDeposit={() => requireAuth(() => setIsDepositOpen(true))}
          onRefreshBalance={refreshUser}
        />
      )}

      {/* Playable Game Engines */}
      {activeGame && (
        <>
          {(activeGame.playableType === 'super_ace' || !activeGame.playableType) && (
            <SuperAceGame onClose={handleCloseGame} onBalanceChange={refreshUser} />
          )}
          {activeGame.playableType === 'fortune_gems' && (
            <FortuneGemsGame onClose={handleCloseGame} onBalanceChange={refreshUser} />
          )}
          {activeGame.playableType === 'flyx' && (
            <FlyXGame onClose={handleCloseGame} onBalanceChange={refreshUser} />
          )}
          {activeGame.playableType === 'happy_fishing' && (
            <HappyFishingGame onClose={handleCloseGame} onBalanceChange={refreshUser} />
          )}
          {activeGame.playableType === 'teen_patti' && (
            <TeenPattiGame onClose={handleCloseGame} onBalanceChange={refreshUser} />
          )}
          {activeGame.playableType === 'live_roulette' && (
            <LiveCasinoGame onClose={handleCloseGame} onBalanceChange={refreshUser} />
          )}
          {activeGame.playableType === 'crazy_777' && (
            <SuperAceGame onClose={handleCloseGame} onBalanceChange={refreshUser} />
          )}
        </>
      )}

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={refreshUser}
        onViewHistory={() => {
          setIsDepositOpen(false);
          setIsMemberOpen(true);
        }}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onSuccess={refreshUser}
        onViewHistory={() => {
          setIsWithdrawOpen(false);
          setIsMemberOpen(true);
        }}
      />

      {/* Member Center (Includes Logout action) */}
      {isMemberOpen && (
        <MemberCenter
          user={currentUser}
          onClose={() => setIsMemberOpen(false)}
          onOpenDeposit={() => {
            setIsMemberOpen(false);
            setIsDepositOpen(true);
          }}
          onOpenWithdraw={() => {
            setIsMemberOpen(false);
            setIsWithdrawOpen(true);
          }}
          onOpenAppDownload={() => {
            setIsMemberOpen(false);
            setIsAndroidAppOpen(true);
          }}
          onRefreshBalance={refreshUser}
          onLogout={handleLogout}
          onOpenEggGame={() => {
            setIsMemberOpen(false);
            setIsEggModalOpen(true);
          }}
          onOpenRedPacket={() => {
            setIsMemberOpen(false);
            setIsRedPacketOpen(true);
          }}
        />
      )}

      {/* App & PHP Package Modal */}
      <AndroidAppModal
        isOpen={isAndroidAppOpen}
        onClose={() => setIsAndroidAppOpen(false)}
      />

      {/* Golden Egg Bonus Modal */}
      <GoldenEggModal
        isOpen={isEggModalOpen}
        onClose={() => setIsEggModalOpen(false)}
        onRewardClaimed={refreshUser}
      />

      {/* Red Packet Bonus Modal */}
      <RedPacketModal
        isOpen={isRedPacketOpen}
        onClose={() => setIsRedPacketOpen(false)}
        onRewardClaimed={refreshUser}
      />

      {/* Lucky Wheel Bonus Modal */}
      <WheelModal
        isOpen={isWheelOpen}
        onClose={() => setIsWheelOpen(false)}
        onRewardClaimed={refreshUser}
      />

      {/* Rescue Relief Fund Modal (উদ্ধার তহবিল) */}
      <RescueFundModal
        isOpen={isRescueOpen}
        onClose={() => setIsRescueOpen(false)}
        onRewardClaimed={refreshUser}
      />

      {/* Auth Modal (Login & Registration) */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          const loggedInUser = storage.getCurrentUser();
          setCurrentUser(loggedInUser);
          if (loggedInUser?.role === 'admin') {
            window.location.hash = 'admin';
            setIsAdminRoute(true);
          }
        }}
      />

      {/* Download Center Modal (Standalone PHP Project Explorer) */}
      <DownloadCenterModal
        isOpen={isDownloadCenterOpen}
        onClose={() => setIsDownloadCenterOpen(false)}
      />
    </div>
  );
}
