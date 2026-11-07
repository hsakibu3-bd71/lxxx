import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { soundFX } from '../../utils/audio';
import { PHP_PROJECT_FILES } from '../../services/phpProjectFiles';
import { downloadPhpFullProjectZip } from '../../services/zipExporter';
import { ProviderConfig, PromoSlideItem, CategoryCardItem, PaymentMethodAsset, SiteAssets } from '../../types';
import {
  Shield,
  Users,
  CreditCard,
  Gamepad2,
  Settings,
  Download,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Code,
  Globe,
  Radio,
  FileText,
  AlertTriangle,
  Server,
  Zap,
  Plus,
  Image as ImageIcon,
  Palette,
  Trash2,
  Upload,
  Smartphone,
  Gift,
} from 'lucide-react';

interface AdminControlPanelProps {
  onClose: () => void;
  onRefreshData: () => void;
}

type AdminTab =
  | 'overview'
  | 'promotions'
  | 'softaggregator'
  | 'users'
  | 'transactions'
  | 'games'
  | 'providers'
  | 'media_assets'
  | 'tracking_cdn'
  | 'php_source';

export const AdminControlPanel: React.FC<AdminControlPanelProps> = ({
  onClose,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState(storage.getAllUsers());
  const [transactions, setTransactions] = useState(storage.getTransactions(true));
  const [games, setGames] = useState(storage.getGames());
  const [providers, setProviders] = useState(storage.getProviders());
  const [siteSettings, setSiteSettings] = useState(storage.getSiteSettings());

  // Filter & Search
  const [userSearch, setUserSearch] = useState('');
  const [gameFilterProvider, setGameFilterProvider] = useState('All');
  const [gameSearch, setGameSearch] = useState('');

  // Admin Game Catalog CRUD States
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [newGameName, setNewGameName] = useState('');
  const [newGameBengaliName, setNewGameBengaliName] = useState('');
  const [newGameCategory, setNewGameCategory] = useState<'hot' | 'slots' | 'fishing' | 'live' | 'poker' | 'lottery' | 'sports'>('slots');
  const [newGameProvider, setNewGameProvider] = useState<string>('Jili');
  const [newGameImage, setNewGameImage] = useState('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80');
  const [newGameDemoLink, setNewGameDemoLink] = useState('');
  const [newGameRtp, setNewGameRtp] = useState(97.2);
  const [newGameMultiplier, setNewGameMultiplier] = useState('2000X');
  const [gameCatalogNotice, setGameCatalogNotice] = useState<string | null>(null);

  // Selected file for PHP code viewer
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Balance adjustment modal state
  const [adjustUserId, setAdjustUserId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('500');
  const [adjustAction, setAdjustAction] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState<string>('কাস্টমার বোনাস');

  // Tracking & CDN states
  const [gtmId, setGtmId] = useState<string>('GTM-LXW9988');
  const [fbPixelId, setFbPixelId] = useState<string>('982736451029384');
  const [cloudflareDomain, setCloudflareDomain] = useState<string>('livexwin.com');
  const [sslMode, setSslMode] = useState<'flexible' | 'full' | 'strict'>('full');
  const [trackingSaved, setTrackingSaved] = useState<boolean>(false);

  // Provider Image & Display Management States
  const [editingProvId, setEditingProvId] = useState<string | null>(null);
  const [provImageInput, setProvImageInput] = useState<string>('');
  const [provShowType, setProvShowType] = useState<'image_only' | 'text_only' | 'both'>('both');
  const [provDisplayName, setProvDisplayName] = useState<string>('');
  const [isAddingNewProv, setIsAddingNewProv] = useState<boolean>(false);
  const [newProvName, setNewProvName] = useState<string>('');
  const [newProvDisplayName, setNewProvDisplayName] = useState<string>('');
  const [newProvLogoUrl, setNewProvLogoUrl] = useState<string>('');
  const [newProvShowType, setNewProvShowType] = useState<'image_only' | 'text_only' | 'both'>('both');

  // Media & Assets Manager States
  const [siteAssets, setSiteAssets] = useState<SiteAssets>(storage.getSiteAssets());
  const [mediaSubTab, setMediaSubTab] = useState<'banners' | 'payments' | 'categories' | 'branding'>('banners');

  // New Banner States
  const [isAddingBanner, setIsAddingBanner] = useState<boolean>(false);
  const [newBannerBadge, setNewBannerBadge] = useState<string>('নতুন ধামাকা বোনাস');
  const [newBannerTitle1, setNewBannerTitle1] = useState<string>('প্রতিটি ডিপোজিটে');
  const [newBannerTitle2, setNewBannerTitle2] = useState<string>('পাবেন দ্বিগুণ ক্যাশব্যাক');
  const [newBannerAmount, setNewBannerAmount] = useState<string>('সর্বোচ্চ ৫,০০০ ৳');
  const [newBannerBtnText, setNewBannerBtnText] = useState<string>('এখনই নিন');
  const [newBannerAction, setNewBannerAction] = useState<'deposit' | 'egg' | 'redpacket'>('deposit');
  const [newBannerBgImage, setNewBannerBgImage] = useState<string>('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1000&auto=format&fit=crop&q=85');

  // New Payment Method States
  const [isAddingPayment, setIsAddingPayment] = useState<boolean>(false);
  const [newPayName, setNewPayName] = useState<string>('');
  const [newPayNameBn, setNewPayNameBn] = useState<string>('');
  const [newPayLogoUrl, setNewPayLogoUrl] = useState<string>('');
  const [newPayColor, setNewPayColor] = useState<string>('orange');

  // Promotions & Bonus Control States
  const [promoEggMax, setPromoEggMax] = useState<number>(siteSettings.goldenEggMaxDisplay || 99999);
  const [promoEggTier1, setPromoEggTier1] = useState<number>(siteSettings.goldenEggTier1 || 9);
  const [promoEggTier2, setPromoEggTier2] = useState<number>(siteSettings.goldenEggTier2 || 99);
  const [promoEggTier3, setPromoEggTier3] = useState<number>(siteSettings.goldenEggTier3 || 199);
  const [promoWheelTimer, setPromoWheelTimer] = useState<string>(siteSettings.wheelCountdownTimer || '২৩ : ০৬ : ৩১');
  const [promoWheelTier1, setPromoWheelTier1] = useState<number>(siteSettings.wheelTier1 || 8);
  const [promoWheelTier2, setPromoWheelTier2] = useState<number>(siteSettings.wheelTier2 || 88);
  const [promoWheelTier3, setPromoWheelTier3] = useState<number>(siteSettings.wheelTier3 || 1888);
  const [promoRedLimit, setPromoRedLimit] = useState<number>(siteSettings.redPacketDailyLimit || 17);
  const [promoRescuePct, setPromoRescuePct] = useState<number>(siteSettings.rescueFundPercentage || 10);
  const [promoRescueMax, setPromoRescueMax] = useState<number>(siteSettings.rescueFundDailyMax || 500);
  const [isPromoSaved, setIsPromoSaved] = useState(false);
  const [isExportingPhpZip, setIsExportingPhpZip] = useState(false);

  // Admin Authentication Gate State
  const currentUser = storage.getCurrentUser();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    () => currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || sessionStorage.getItem('lxw_admin_auth') === '1'
  );
  const [adminUserInput, setAdminUserInput] = useState('admin');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // SoftAggregator Provider & Callback State (Synced with SiteSettings)
  const [softLogin, setSoftLogin] = useState(siteSettings.softAggregatorApiLogin || 'DEMO_LIVEXWIN_LOGIN');
  const [softPassword, setSoftPassword] = useState(siteSettings.softAggregatorApiPassword || 'DEMO_LIVEXWIN_PASS');
  const [softSalt, setSoftSalt] = useState(siteSettings.softAggregatorSaltKey || 'LXW_SALT_KEY_88273619');
  const [softCurrency, setSoftCurrency] = useState(siteSettings.softAggregatorCurrency || 'BDT');
  const [softCountry, setSoftCountry] = useState(siteSettings.softAggregatorCountry || 'BD');
  const [softSaved, setSoftSaved] = useState(false);

  // Live Simulator state (Callback + POST /api/v1 Methods)
  const [simAction, setSimAction] = useState<'balance' | 'debit' | 'credit'>('balance');
  const [simUser, setSimUser] = useState('t1206248521');
  const [simAmount, setSimAmount] = useState('50');
  const [simLoading, setSimLoading] = useState(false);
  const [simResponse, setSimResponse] = useState<string | null>(null);
  const [simStatus, setSimStatus] = useState<number | null>(null);

  // SoftAggregator POST /api/v1 Method Tester State
  const [apiMethod, setApiMethod] = useState<'getCurrencies' | 'getProviderList' | 'getGameList' | 'createPlayer' | 'getGame' | 'getGameDemo' | 'getPlayerHistory'>('getCurrencies');
  const [apiMethodResponse, setApiMethodResponse] = useState<string | null>(null);
  const [apiMethodLoading, setApiMethodLoading] = useState(false);

  const handleTestCallback = async () => {
    soundFX.playClick();
    setSimLoading(true);
    setSimResponse(null);
    try {
      const amtCents = Math.round(parseFloat(simAmount || '0') * 100);
      const url = `/api/softaggregator/callback?action=${simAction}&username=${encodeURIComponent(simUser)}&amount=${amtCents}&currency=${encodeURIComponent(softCurrency)}&call_id=sim_${Date.now()}&timestamp=${Math.floor(Date.now() / 1000)}&key=test_bypass`;
      const res = await fetch(url);
      const json = await res.json();
      setSimStatus(res.status);
      setSimResponse(JSON.stringify(json, null, 2));
      soundFX.playSuccess();
    } catch (err: any) {
      setSimStatus(500);
      setSimResponse(JSON.stringify({ error: 2, message: err?.message || 'Request failed' }, null, 2));
    } finally {
      setSimLoading(false);
    }
  };

  const handleTestApiMethod = async () => {
    soundFX.playClick();
    setApiMethodLoading(true);
    setApiMethodResponse(null);
    try {
      const payload: Record<string, any> = {
        api_login: softLogin,
        api_password: softPassword,
        method: apiMethod,
      };
      if (apiMethod === 'createPlayer') {
        payload.user_username = simUser || 't1206248521';
        payload.user_password = 'secret';
        payload.currency = softCurrency;
      } else if (apiMethod === 'getGame' || apiMethod === 'getGameDemo') {
        payload.user_username = simUser || 't1206248521';
        payload.user_password = 'secret';
        payload.gameid = 'jili/SuperAce';
        payload.lang = 'bn';
        payload.currency = softCurrency;
        payload.device = 'mobile';
        payload.country = softCountry;
        payload.homeurl = window.location.origin;
      } else if (apiMethod === 'getPlayerHistory') {
        payload.user_username = simUser || 't1206248521';
        payload.limit = 50;
        payload.offset = 0;
      }

      const res = await fetch('/api/softaggregator/v1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setApiMethodResponse(JSON.stringify(json, null, 2));
      soundFX.playSuccess();
    } catch (err: any) {
      setApiMethodResponse(JSON.stringify({ error: 2, message: err?.message || 'API call failed' }, null, 2));
    } finally {
      setApiMethodLoading(false);
    }
  };

  const handleSavePromotions = () => {
    soundFX.playWin();
    const updated = {
      ...siteSettings,
      goldenEggMaxDisplay: Number(promoEggMax),
      goldenEggTier1: Number(promoEggTier1),
      goldenEggTier2: Number(promoEggTier2),
      goldenEggTier3: Number(promoEggTier3),
      wheelCountdownTimer: String(promoWheelTimer),
      wheelTier1: Number(promoWheelTier1),
      wheelTier2: Number(promoWheelTier2),
      wheelTier3: Number(promoWheelTier3),
      redPacketDailyLimit: Number(promoRedLimit),
      rescueFundPercentage: Number(promoRescuePct),
      rescueFundDailyMax: Number(promoRescueMax),
    };
    storage.updateSiteSettings(updated);
    setSiteSettings(updated);
    setIsPromoSaved(true);
    setTimeout(() => setIsPromoSaved(false), 3000);
  };

  const handleDownloadPhpZip = async () => {
    setIsExportingPhpZip(true);
    soundFX.playClick();
    try {
      await downloadPhpFullProjectZip();
    } catch (err) {
      alert('ZIP তৈরিতে সমস্যা হয়েছে: ' + String(err));
    } finally {
      setIsExportingPhpZip(false);
    }
  };

  const refreshAll = () => {
    setUsers(storage.getAllUsers());
    setTransactions(storage.getTransactions(true));
    setGames(storage.getGames());
    setProviders(storage.getProviders());
    setSiteSettings(storage.getSiteSettings());
    setSiteAssets(storage.getSiteAssets());
    onRefreshData();
  };

  const showGameNotice = (msg: string) => {
    setGameCatalogNotice(msg);
    setTimeout(() => setGameCatalogNotice(null), 3500);
  };

  const handleSaveGameCatalogForm = () => {
    soundFX.playWin();
    if (!newGameName.trim()) {
      showGameNotice('গেমের ইংরেজি নাম (Game Name) লিখুন।');
      return;
    }
    const cleanName = newGameName.trim();
    const cleanBn = newGameBengaliName.trim() || cleanName;
    const defaultDemo = `/game_frame.php?gameid=${encodeURIComponent(
      newGameProvider.toLowerCase().replace(/[^a-z0-9]/g, '') + '/' + cleanName.replace(/[^a-zA-Z0-9]/g, '')
    )}&name=${encodeURIComponent(cleanName)}&provider=${encodeURIComponent(newGameProvider)}&demo=1`;

    if (editingGameId) {
      storage.updateGame(editingGameId, {
        name: cleanName,
        bengaliName: cleanBn,
        category: newGameCategory,
        provider: newGameProvider as any,
        image: newGameImage.trim() || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80',
        demoLink: newGameDemoLink.trim() || defaultDemo,
        rtp: Number(newGameRtp || 97.2),
        multiplier: newGameMultiplier.trim() || '1000X',
      });
      setEditingGameId(null);
      setIsAddingGame(false);
      refreshAll();
      showGameNotice(`"${cleanBn}" গেমের তথ্য সফলভাবে আপডেট করা হয়েছে!`);
    } else {
      storage.addGame({
        name: cleanName,
        bengaliName: cleanBn,
        category: newGameCategory,
        provider: newGameProvider as any,
        image: newGameImage.trim() || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80',
        demoLink: newGameDemoLink.trim() || defaultDemo,
        rating: 5,
        multiplier: newGameMultiplier.trim() || '1000X',
        isHot: newGameCategory === 'hot',
        isNew: true,
        rtp: Number(newGameRtp || 97.2),
        playableType: newGameCategory === 'fishing' ? 'happy_fishing' : newGameCategory === 'live' ? 'live_roulette' : newGameCategory === 'poker' ? 'teen_patti' : 'super_ace',
        minBet: 1,
        maxBet: 10000,
        active: true,
      });
      setIsAddingGame(false);
      setNewGameName('');
      setNewGameBengaliName('');
      setNewGameDemoLink('');
      refreshAll();
      showGameNotice(`নতুন গেম "${cleanBn}" সফলভাবে ক্যাটালগে যোগ হয়েছে!`);
    }
  };

  const handleStartEditGame = (g: any) => {
    soundFX.playClick();
    setEditingGameId(g.id);
    setNewGameName(g.name);
    setNewGameBengaliName(g.bengaliName);
    setNewGameCategory(g.category);
    setNewGameProvider(g.provider);
    setNewGameImage(g.image);
    setNewGameDemoLink(g.demoLink || '');
    setNewGameRtp(g.rtp);
    setNewGameMultiplier(g.multiplier || '1000X');
    setIsAddingGame(true);
  };

  const handleDeleteGameItem = (id: string, title: string) => {
    soundFX.playClick();
    storage.deleteGame(id);
    refreshAll();
    showGameNotice(`"${title}" গেমটি ক্যাটালগ থেকে মুছে ফেলা হয়েছে।`);
  };

  const handleCloneAllRemoteProviderGames = () => {
    soundFX.playWin();
    const res = storage.cloneRemoteProviderGames();
    refreshAll();
    showGameNotice(
      `60bd98.vip সকল প্রোভাইডার গেম সিঙ্ক সম্পন্ন! নতুন যুক্ত: ${res.addedCount} টি (মোট গেম: ${res.totalCount} টি)`
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, onDone: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onDone(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartEditProvider = (prov: ProviderConfig) => {
    soundFX.playClick();
    setEditingProvId(prov.id);
    setProvImageInput(prov.logoUrl || '');
    setProvShowType(prov.showType || 'both');
    setProvDisplayName(prov.displayName || prov.name);
  };

  const handleSaveProviderVisuals = (id: string) => {
    soundFX.playWin();
    storage.updateProvider(id, {
      logoUrl: provImageInput.trim() || undefined,
      showType: provShowType,
      displayName: provDisplayName.trim() || undefined,
    });
    window.dispatchEvent(new Event('livexwin_providers_updated'));
    setEditingProvId(null);
    refreshAll();
    alert('প্রোভাইডার কার্ডের ছবি ও ডিসপ্লে অপশন সফলভাবে সেভ হয়েছে!');
  };

  const handleAddNewProvider = () => {
    soundFX.playClick();
    if (!newProvName.trim()) {
      alert('প্রোভাইডারের নাম লিখুন।');
      return;
    }
    const newProv: ProviderConfig = {
      id: 'prov_' + Date.now(),
      name: newProvName.trim() as any,
      displayName: newProvDisplayName.trim() || newProvName.trim(),
      logoUrl: newProvLogoUrl.trim() || undefined,
      showType: newProvShowType,
      apiUrl: 'https://api.livexwin.com/v1/game/' + newProvName.toLowerCase().replace(/\s+/g, '_'),
      merchantCode: 'LXW_' + newProvName.toUpperCase().replace(/\s+/g, '_'),
      secretKey: 'sec_' + Math.random().toString(36).substring(2, 15),
      agentCode: 'AG_LXW',
      currency: 'BDT',
      callbackUrl: 'https://livexwin.com/api/games/callback/' + newProvName.toLowerCase().replace(/\s+/g, '_'),
      status: 'active',
      lastPingMs: 42,
    };
    storage.addProvider(newProv);
    window.dispatchEvent(new Event('livexwin_providers_updated'));
    setIsAddingNewProv(false);
    setNewProvName('');
    setNewProvDisplayName('');
    setNewProvLogoUrl('');
    refreshAll();
    alert('নতুন প্রোভাইডার সফলভাবে যুক্ত হয়েছে এবং কার্ড ফ্রেম তৈরি হয়েছে!');
  };

  const handleResetProviders = () => {
    soundFX.playClick();
    if (confirm('আপনি কি সকল প্রোভাইডার সেটিংস ও ইমেজ ডিফল্ট অবস্থায় রিস্টোর করতে চান?')) {
      storage.resetProvidersToDefault();
      window.dispatchEvent(new Event('livexwin_providers_updated'));
      refreshAll();
      alert('সকল প্রোভাইডার ও ছবি ডিফল্ট অবস্থায় রিস্টোর করা হয়েছে।');
    }
  };

  // KPIs
  const totalUsersCount = users.filter(u => u.role === 'player').length;
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit' && (t.status === 'approved' || t.status === 'completed'))
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdraw' && (t.status === 'approved' || t.status === 'completed'))
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const netRevenue = totalDeposits - totalWithdrawals;

  // Handlers
  const handleApproveTx = (id: string) => {
    soundFX.playCoin();
    storage.approveTransaction(id);
    refreshAll();
  };

  const handleRejectTx = (id: string) => {
    soundFX.playClick();
    const reason = prompt('বাতিল করার কারণ লিখুন (ঐচ্ছিক):') || 'নথি যাচাই ব্যর্থ';
    storage.rejectTransaction(id, reason);
    refreshAll();
  };

  const handleAdjustBalance = () => {
    if (!adjustUserId) return;
    const num = Number(adjustAmount);
    if (isNaN(num) || num <= 0) {
      alert('সঠিক টাকার পরিমাণ দিন।');
      return;
    }
    const delta = adjustAction === 'credit' ? num : -num;
    storage.adminAdjustUserBalance(adjustUserId, delta, adjustReason);
    soundFX.playCoin();
    alert(`ব্যবহারকারীর ব্যালেন্স সফলভাবে ${adjustAction === 'credit' ? 'যুক্ত' : 'কর্তন'} করা হয়েছে!`);
    setAdjustUserId(null);
    refreshAll();
  };

  const handleToggleUserStatus = (userId: string, currentStatus: 'active' | 'banned') => {
    soundFX.playClick();
    const next = currentStatus === 'active' ? 'banned' : 'active';
    storage.adminSetUserStatus(userId, next);
    refreshAll();
  };

  const handleToggleGame = (gameId: string, current: boolean) => {
    soundFX.playClick();
    storage.updateGame(gameId, { active: !current });
    refreshAll();
  };

  const handleRtpChange = (gameId: string, newRtp: number) => {
    storage.updateGame(gameId, { rtp: newRtp });
    refreshAll();
  };

  const handleSaveTracking = () => {
    soundFX.playWin();
    setTrackingSaved(true);
    setTimeout(() => setTrackingSaved(false), 3000);
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    setAdminLoginError('');
    if (
      adminUserInput.trim().toLowerCase() === 'admin' &&
      (adminPassInput === 'admin123' || adminPassInput === 'admin' || adminPassInput === '123456')
    ) {
      soundFX.playWin();
      sessionStorage.setItem('lxw_admin_auth', '1');
      setIsAdminAuthenticated(true);
    } else {
      const res = storage.login(adminUserInput, adminPassInput);
      if (res.success && (res.user?.role === 'admin' || res.user?.role === 'superadmin')) {
        soundFX.playWin();
        sessionStorage.setItem('lxw_admin_auth', '1');
        setIsAdminAuthenticated(true);
        onRefreshData();
      } else {
        setAdminLoginError('অ্যাডমিন ইউজারনেম বা পাসওয়ার্ড সঠিক নয়! (ডিফল্ট: admin / admin123)');
      }
    }
  };

  const handleAdminLogout = () => {
    soundFX.playClick();
    sessionStorage.removeItem('lxw_admin_auth');
    if (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') {
      storage.logout();
      onRefreshData();
    }
    setIsAdminAuthenticated(false);
    onClose();
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0d0203] text-white flex items-center justify-center p-4 select-none">
        <div className="w-full max-w-sm bg-gradient-to-b from-[#2a0408] via-[#180205] to-[#0e0102] border-2 border-[#7a121c] rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-black shadow-lg mb-2">
              <Shield size={24} />
            </div>
            <h1 className="text-lg font-black text-yellow-300">LivexWin Master Admin</h1>
            <p className="text-xs text-gray-400">স্বতন্ত্র অ্যাডমিন কন্ট্রোল প্যানেল লগইন</p>
          </div>

          {adminLoginError && (
            <div className="p-2.5 bg-red-950/90 border border-red-500 rounded-xl text-red-200 text-xs text-center font-bold">
              ⚠️ {adminLoginError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-300 font-bold mb-1">অ্যাডমিন ইউজারনেম:</label>
              <input
                type="text"
                value={adminUserInput}
                onChange={e => setAdminUserInput(e.target.value)}
                placeholder="admin"
                className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-bold mb-1">অ্যাডমিন পাসওয়ার্ড:</label>
              <input
                type="password"
                value={adminPassInput}
                onChange={e => setAdminPassInput(e.target.value)}
                placeholder="admin123"
                className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-105 text-black font-black rounded-xl shadow-lg cursor-pointer"
            >
              অ্যাডমিন প্যানেলে প্রবেশ করুন
            </button>
          </form>

          <div className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-[11px] text-gray-400 text-center">
            ডিফল্ট ক্রেডেনশিয়াল: <span className="text-yellow-300 font-mono font-bold">admin</span> / <span className="text-yellow-300 font-mono font-bold">admin123</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold border border-white/10 cursor-pointer"
          >
            ← মূল হোম পেজে ফিরুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0203] text-gray-100 flex flex-col overflow-hidden">
      {/* Admin Top Header */}
      <div className="bg-gradient-to-r from-[#32060b] via-[#4d0910] to-[#32060b] border-b border-[#70111a] px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-black flex items-center justify-center font-black shadow-md">
            <Shield size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white">LivexWin Master Control Panel</h1>
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Super Admin
              </span>
            </div>
            <p className="text-[11px] text-gray-300">
              Standalone PHP Backend • SoftAggregator API v1 • Real-Time Financials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* PHP Standalone Project with Installer ZIP */}
          <button
            onClick={handleDownloadPhpZip}
            disabled={isExportingPhpZip}
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            title="cPanel / Apache এর জন্য ১-ক্লিক ইন্সটলার সহ সম্পূর্ণ PHP প্রজেক্ট"
          >
            <Download size={14} className={isExportingPhpZip ? 'animate-bounce' : ''} />
            <span>{isExportingPhpZip ? 'তৈরি হচ্ছে...' : '⚡ PHP প্রজেক্ট ZIP ডাউনলোড'}</span>
          </button>

          <button
            onClick={handleAdminLogout}
            className="px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-white rounded-lg text-xs font-bold border border-red-700 cursor-pointer"
          >
            লগআউট
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-bold border border-gray-700 cursor-pointer"
          >
            হোম পেজে ফিরুন
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="bg-[#1b0306] border-b border-[#4d0c13] px-4 flex gap-1 overflow-x-auto scrollbar-none text-xs font-bold">
        {[
          { id: 'overview', label: 'ড্যাশবোর্ড (Overview)', icon: Server },
          { id: 'promotions', label: '🎁 প্রমোশন ও বোনাস কন্ট্রোল', icon: Gift },
          { id: 'softaggregator', label: '🎰 SoftAggregator API v1', icon: Zap },
          { id: 'users', label: 'প্লেয়ার ম্যানেজমেন্ট', icon: Users, badge: totalUsersCount },
          { id: 'transactions', label: 'পেমেন্ট অনুমোদন', icon: CreditCard, badge: pendingTransactions.length },
          { id: 'games', label: 'গেম ক্যাটালগ ও RTP', icon: Gamepad2 },
          { id: 'providers', label: 'প্রোভাইডার এপিআই সেটআপ', icon: Zap },
          { id: 'media_assets', label: '🎨 মিডিয়া ও আইকন', icon: ImageIcon },
          { id: 'tracking_cdn', label: 'CDN, GTM ও Pixel', icon: Globe },
          { id: 'php_source', label: 'PHP প্রজেক্ট সোর্স কোড', icon: Code },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFX.playClick();
                setActiveTab(tab.id as AdminTab);
              }}
              className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-yellow-400 text-yellow-300 bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#120204]">
        {/* ========================================== */}
        {/* TAB 1: OVERVIEW & KPIS */}
        {/* ========================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* 4 Main KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#240407] border border-[#5a0c13] p-4 rounded-xl shadow-md">
                <span className="text-xs text-gray-400 font-bold block">মোট খেলোয়াড় (Players)</span>
                <span className="text-2xl sm:text-3xl font-black text-white font-num mt-1 block">
                  {totalUsersCount}
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 block font-bold">● ১০০% সক্রিয় অ্যাকাউন্ট</span>
              </div>

              <div className="bg-[#240407] border border-[#5a0c13] p-4 rounded-xl shadow-md">
                <span className="text-xs text-gray-400 font-bold block">মোট ডিপোজিট (Total Deposits)</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-num mt-1 block">
                  ৳ {totalDeposits.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">Nagad, Bkash, Rocket</span>
              </div>

              <div className="bg-[#240407] border border-[#5a0c13] p-4 rounded-xl shadow-md">
                <span className="text-xs text-gray-400 font-bold block">মোট উত্তোলন (Withdrawals)</span>
                <span className="text-2xl sm:text-3xl font-black text-rose-400 font-num mt-1 block">
                  ৳ {totalWithdrawals.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">অনুমোদিত মোট অর্থ</span>
              </div>

              <div className="bg-[#240407] border border-[#5a0c13] p-4 rounded-xl shadow-md">
                <span className="text-xs text-gray-400 font-bold block">নেট রেভিনিউ (GGR Revenue)</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-num mt-1 block">
                  ৳ {netRevenue.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 block font-bold">প্ল্যাটফর্ম প্রফিট</span>
              </div>
            </div>

            {/* Quick Action Alerts */}
            {pendingTransactions.length > 0 && (
              <div className="bg-amber-950/60 border border-amber-600/70 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={24} className="text-amber-400" />
                  <div>
                    <h4 className="font-bold text-amber-200 text-sm">
                      {pendingTransactions.length} টি পেমেন্ট অনুরোধ আপনার অনুমোদনের অপেক্ষায় রয়েছে!
                    </h4>
                    <p className="text-xs text-amber-300/80">
                      উত্তোলন বা জমা অনুরোধগুলো যাচাই করে দ্রুত অনুমোদন অথবা বাতিল করুন।
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="px-3 py-1.5 bg-amber-400 text-black font-extrabold rounded-lg text-xs"
                >
                  অনুমোদন করুন ›
                </button>
              </div>
            )}

            {/* Platform Quick Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#200305] border border-[#500b12] p-4 rounded-xl">
                <h3 className="font-bold text-sm text-yellow-300 mb-2 flex items-center gap-1.5">
                  <Zap size={15} /> গেমিং ইঞ্জিন স্ট্যাটাস
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-400">সীমলেস ওয়ালেট মোড:</span>
                    <span className="text-emerald-400 font-bold">সক্রিয় (Active Instant Settle)</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-400">এভারেজ আরটিপি (Platform RTP):</span>
                    <span className="text-amber-400 font-bold font-num">97.2%</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-400">কারেন্সি:</span>
                    <span className="text-white font-bold">BDT (৳) বাংলাদেশী টাকা</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">প্রোভাইডার এপিআই কানেক্টিভিটি:</span>
                    <span className="text-emerald-400 font-bold">৬ টি প্রোভাইডার অনলাইন</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#200305] border border-[#500b12] p-4 rounded-xl">
                <h3 className="font-bold text-sm text-yellow-300 mb-2 flex items-center gap-1.5">
                  <Globe size={15} /> সাইট ও সিকিউরিটি কনফিগ
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-400">সাইটের নাম:</span>
                    <span className="text-white font-bold">{siteSettings.siteName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-400">ক্লাউডফ্লেয়ার সিডিএন:</span>
                    <span className="text-emerald-400 font-bold">প্রটেকশন সক্রিয়</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-400">উত্তোলন সীমা:</span>
                    <span className="text-yellow-400 font-bold">৳ ১০০ - ২৫,০০০</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">দৈনিক ফ্রি বোনাস:</span>
                    <span className="text-white font-bold">গোল্ডেন এগ + ১৭ রেড প্যাকেট</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB: PROMOTIONS & BONUS CONTROL (USER REQUEST) */}
        {/* ========================================== */}
        {activeTab === 'promotions' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#1e0407] border border-[#5d0e16] p-4 rounded-2xl shadow-lg">
              <div>
                <h2 className="text-lg font-black text-yellow-300 flex items-center gap-2">
                  <Gift size={20} className="text-amber-400" />
                  <span>বোনাস ও প্রমোশন কন্ট্রোল সেন্টার</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  গোল্ডেন এগ, লাকি স্পিন হুইল, রেড প্যাকেট ও উদ্ধার তহবিলের সকল রিওয়ার্ড ও কাউন্টডাউন সময় নিয়ন্ত্রণ
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isPromoSaved && (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 animate-pulse">
                    <CheckCircle size={14} /> সফলভাবে সংরক্ষিত হয়েছে!
                  </span>
                )}
                <button
                  onClick={handleSavePromotions}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={15} />
                  <span>সকল পরিবর্তন সংরক্ষণ করুন</span>
                </button>
              </div>
            </div>

            {/* 1. Golden Egg Control Box */}
            <div className="bg-[#1a0305] border border-yellow-500/40 rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥚</span>
                  <div>
                    <h3 className="font-black text-sm text-yellow-300">১. লাকি গোল্ডেন এগ ইভেন্ট (IMG_0284)</h3>
                    <p className="text-[11px] text-gray-400">সর্বোচ্চ প্রদর্শন ৳ ৯৯,৯৯৯ ও ৩টি নিশ্চিত লেভেল পুরষ্কার (৳৯ / ৳৯৯ / ৳১৯৯)</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 text-[10px] font-bold border border-yellow-400/40">
                  ৩টি লেভেল টিয়ার
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">সর্বোচ্চ প্রদর্শিত পুরষ্কার (BDT):</label>
                  <input
                    type="number"
                    value={promoEggMax}
                    onChange={e => setPromoEggMax(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-yellow-300 font-mono font-black focus:outline-none focus:border-yellow-400"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">যেমন: ৯৯,৯৯৯ ৳</span>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">VIP ১-৪ ফিক্সড উইন (BDT):</label>
                  <input
                    type="number"
                    value={promoEggTier1}
                    onChange={e => setPromoEggTier1(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-yellow-400"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">ইউজার রুল: ৳ ৯</span>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">VIP ৫-১০ ফিক্সড উইন (BDT):</label>
                  <input
                    type="number"
                    value={promoEggTier2}
                    onChange={e => setPromoEggTier2(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-yellow-400"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">ইউজার রুল: ৳ ৯৯</span>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">VIP ১১+ ফিক্সড উইন (BDT):</label>
                  <input
                    type="number"
                    value={promoEggTier3}
                    onChange={e => setPromoEggTier3(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-yellow-400"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">ইউজার রুল: ৳ ১৯৯</span>
                </div>
              </div>
            </div>

            {/* 2. Lucky Spin Wheel Control Box */}
            <div className="bg-[#1a0305] border border-red-500/40 rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎡</span>
                  <div>
                    <h3 className="font-black text-sm text-rose-300">২. লাকি স্পিন হুইল ও কাউন্টডাউন সময় (IMG_0276)</h3>
                    <p className="text-[11px] text-gray-400">কাউন্টডাউন সময় এড ও লেভেল-ভিত্তিক উইন পুরষ্কার নিয়ন্ত্রণ</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-rose-300 text-[10px] font-bold border border-red-500/40">
                  আইফোন ১৮ প্রো ম্যাক্স
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">কাউন্টডাউন সময় (এড/এডিট):</label>
                  <input
                    type="text"
                    value={promoWheelTimer}
                    onChange={e => setPromoWheelTimer(e.target.value)}
                    placeholder="২৩ : ০৬ : ৩১"
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-amber-300 font-mono font-black focus:outline-none focus:border-yellow-400"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">ঘণ্টা : মিনিট : সেকেন্ড</span>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">VIP ১-৪ স্পিন প্রাইজ (BDT):</label>
                  <input
                    type="number"
                    value={promoWheelTier1}
                    onChange={e => setPromoWheelTier1(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-yellow-400"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">যেমন: ৳ ৮ ক্যাশ</span>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">VIP ৫-১০ স্পিন প্রাইজ (BDT):</label>
                  <input
                    type="number"
                    value={promoWheelTier2}
                    onChange={e => setPromoWheelTier2(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-yellow-400"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">যেমন: ৳ ৮৮ ক্যাশ ড্র</span>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">VIP ১১+ মেগা প্রাইজ (BDT):</label>
                  <input
                    type="number"
                    value={promoWheelTier3}
                    onChange={e => setPromoWheelTier3(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-yellow-400"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">যেমন: ৳ ১,৮৮৮ মেগা ড্র</span>
                </div>
              </div>
            </div>

            {/* 3. Red Packet & Rescue Fund Control */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Red Packet */}
              <div className="bg-[#1a0305] border border-rose-500/40 rounded-2xl p-5 shadow-md space-y-3">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <span className="text-xl">🧧</span>
                  <h3 className="font-black text-sm text-rose-300">৩. রেড প্যাকেট উপহার (IMG_0275)</h3>
                </div>
                <div className="text-xs space-y-2">
                  <div>
                    <label className="block text-gray-300 font-bold mb-1">দৈনিক সর্বোচ্চ রেড প্যাকেট সংখ্যা:</label>
                    <input
                      type="number"
                      value={promoRedLimit}
                      onChange={e => setPromoRedLimit(Number(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono font-bold"
                    />
                    <span className="text-[10px] text-gray-500 mt-0.5 block">ডিফল্ট: ১৭টি প্যাকেট</span>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 text-[11px] text-gray-300">
                    <span className="text-yellow-300 font-bold block">ফ্রি ক্যাশ রেইন সময়:</span>
                    <span>00:00 - 03:00 (প্রতিদিন মধ্যরাতে স্বয়ংক্রিয় সক্রিয়)</span>
                  </div>
                </div>
              </div>

              {/* Rescue Relief Fund (উদ্ধার তহবিল) */}
              <div className="bg-[#1a0305] border border-emerald-500/40 rounded-2xl p-5 shadow-md space-y-3">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <span className="text-xl">🛡️</span>
                  <h3 className="font-black text-sm text-emerald-300">৪. দৈনিক উদ্ধার তহবিল (Rescue Fund)</h3>
                </div>
                <div className="text-xs grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-gray-300 font-bold mb-1">ক্যাশব্যাক হার (%):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={promoRescuePct}
                      onChange={e => setPromoRescuePct(Number(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono font-bold"
                    />
                    <span className="text-[10px] text-gray-500 mt-0.5 block">ডিফল্ট: ১০% দৈনিক</span>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-bold mb-1">সর্বোচ্চ সীমা (BDT):</label>
                    <input
                      type="number"
                      value={promoRescueMax}
                      onChange={e => setPromoRescueMax(Number(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono font-bold"
                    />
                    <span className="text-[10px] text-gray-500 mt-0.5 block">ডিফল্ট: ৳ ৫০০</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">
                  খেলোয়াড়দের গেমিং লস সুরক্ষার জন্য সদস্য কেন্দ্র ও প্রমোশন থেকে সরাসরি উদ্ধার ক্যাশব্যাক বিতরণ।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB: SOFTAGGREGATOR & WALLET CALLBACK URL */}
        {/* ========================================== */}
        {activeTab === 'softaggregator' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Top Callback URL Banner */}
            <div className="bg-gradient-to-r from-[#240306] via-[#3a060d] to-[#240306] border-2 border-yellow-500/50 p-5 rounded-3xl shadow-2xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner">
                  <Zap size={22} />
                </div>
                <div>
                  <h2 className="text-base font-black text-yellow-300">
                    অফিসিয়াল SoftAggregator Seamless Wallet Callback URL
                  </h2>
                  <p className="text-xs text-gray-300">
                    SoftAggregator API Documentation অনুযায়ী আপনার প্রোভাইডার ড্যাশবোর্ডে নিচের কলব্যাক URL যুক্ত করুন
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 block mb-1">
                    প্রাইমারি কলব্যাক ইউআরএল (Primary Callback URL):
                  </span>
                  <div className="p-3 bg-black/80 rounded-xl border border-yellow-500/40 flex items-center justify-between gap-2">
                    <code className="font-mono text-yellow-300 text-xs break-all select-all">
                      {window.location.origin}/api/softaggregator_callback.php
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/softaggregator_callback.php`);
                        soundFX.playSuccess();
                        alert('কলব্যাক ইউআরএল সফলভাবে কপি করা হয়েছে!');
                      }}
                      className="shrink-0 px-3 py-1 bg-amber-400 text-black font-black text-xs rounded-lg hover:bg-amber-300 cursor-pointer"
                    >
                      কপি করুন
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-gray-400 block mb-1">
                    বিকল্প সংক্ষিপ্ত লিংক (Short Alias):
                  </span>
                  <div className="p-3 bg-black/80 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                    <code className="font-mono text-gray-300 text-xs break-all select-all">
                      {window.location.origin}/callback.php
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/callback.php`);
                        soundFX.playSuccess();
                        alert('সংক্ষিপ্ত লিংক সফলভাবে কপি করা হয়েছে!');
                      }}
                      className="shrink-0 px-3 py-1 bg-gray-700 text-white font-bold text-xs rounded-lg hover:bg-gray-600 cursor-pointer"
                    >
                      কপি করুন
                    </button>
                  </div>
                </div>
              </div>

              {/* PDF Document Specification Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] border-t border-white/10">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle size={14} />
                  <span>GET মেথড & সর্বদা HTTP 200 রেসপন্স</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle size={14} />
                  <span>পূর্ণ সংখ্যায় Cents ফরম্যাট (৳500 = 50000)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle size={14} />
                  <span>MD5(timestamp + salt_key) ভ্যালিডেশন</span>
                </div>
              </div>
            </div>

            {/* API Credentials Configuration Box */}
            <div className="bg-[#1e0407] border border-[#5d0e16] p-5 rounded-3xl shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-black text-yellow-300 flex items-center gap-2">
                    <Shield size={16} className="text-amber-400" />
                    <span>🔑 SoftAggregator API ক্রেডেনশিয়ালস</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    ৪০,০০০+ গেম ক্যাটালগ ও প্রোভাইডার সংযোগের জন্য কনফিগার করুন
                  </p>
                </div>
                <button
                  onClick={() => {
                    soundFX.playWin();
                    const updated = {
                      ...siteSettings,
                      softAggregatorApiLogin: softLogin.trim(),
                      softAggregatorApiPassword: softPassword.trim(),
                      softAggregatorSaltKey: softSalt.trim(),
                      softAggregatorCurrency: softCurrency.trim(),
                      softAggregatorCountry: softCountry.trim(),
                    };
                    storage.updateSiteSettings(updated);
                    setSiteSettings(updated);
                    setSoftSaved(true);
                    setTimeout(() => setSoftSaved(false), 2500);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-xs rounded-xl shadow-lg hover:brightness-110 cursor-pointer"
                >
                  {softSaved ? 'সংরক্ষিত হয়েছে ✓' : 'সংরক্ষণ করুন ✓'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">API Login (api_login):</label>
                  <input
                    type="text"
                    value={softLogin}
                    onChange={e => setSoftLogin(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">API Password (api_password):</label>
                  <input
                    type="password"
                    value={softPassword}
                    onChange={e => setSoftPassword(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Salt Key (md5 & HMAC-SHA256 সাইন কি):</label>
                  <input
                    type="text"
                    value={softSalt}
                    onChange={e => setSoftSalt(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-300 font-bold mb-1">মুদ্রা (Currency):</label>
                    <input
                      type="text"
                      value={softCurrency}
                      onChange={e => setSoftCurrency(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-bold mb-1">দেশ (Country ISO-2):</label>
                    <input
                      type="text"
                      value={softCountry}
                      onChange={e => setSoftCountry(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SoftAggregator POST /api/v1 Method Tester (PDF Pages 2-7) */}
            <div className="bg-[#1e0407] border border-[#5d0e16] p-5 rounded-3xl shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <Server size={16} className="text-amber-400" />
                  <span>📡 SoftAggregator POST /api/v1 মেথড টেস্টার (PDF Pages 2–7)</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Base URL: <code>https://api.softaggregator.com/api/v1</code> — getCurrencies, getGameList, getProviderList, createPlayer, getGame, getPlayerHistory পরীক্ষা করুন
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-gray-300 font-bold mb-1">API Method নির্বাচন করুন:</label>
                  <select
                    value={apiMethod}
                    onChange={e => setApiMethod(e.target.value as any)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold"
                  >
                    <option value="getCurrencies">getCurrencies (Page 3 - সমর্থিত মুদ্রা তালিকা)</option>
                    <option value="getProviderList">getProviderList (Page 4 - গেম স্টুডিও ও প্রোভাইডার)</option>
                    <option value="getGameList">getGameList (Page 4 - গেম লিস্ট ও normalised game_type)</option>
                    <option value="createPlayer">createPlayer (Page 5 - প্লেয়ার তৈরি)</option>
                    <option value="getGame">getGame (Page 5 - রিয়েল মানি গেম লঞ্চ URL)</option>
                    <option value="getGameDemo">getGameDemo (Page 6 - ডেমো মোড গেম লঞ্চ URL)</option>
                    <option value="getPlayerHistory">getPlayerHistory (Page 7 - প্লেয়ার রাউন্ড হিস্ট্রি ইন Cents)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleTestApiMethod}
                    disabled={apiMethodLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-black font-black text-xs rounded-xl shadow cursor-pointer disabled:opacity-50"
                  >
                    {apiMethodLoading ? 'কল হচ্ছে...' : 'POST /api/v1 কল করুন 🚀'}
                  </button>
                </div>
              </div>

              {apiMethodResponse && (
                <div className="p-3 bg-black/80 rounded-xl border border-amber-500/30 text-xs font-mono text-amber-300 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{apiMethodResponse}</pre>
                </div>
              )}
            </div>

            {/* Live Callback Simulator & Tester (PDF Pages 8-9) */}
            <div className="bg-[#1e0407] border border-[#5d0e16] p-5 rounded-3xl shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-black text-yellow-300 flex items-center gap-1.5">
                  <Zap size={16} className="text-emerald-400" />
                  <span>🧪 সিমলেস ওয়ালেট কলব্যাক সিমুলেটর (GET Callback - PDF Pages 8–9)</span>
                </h3>
                <p className="text-xs text-gray-400">
                  SoftAggregator এর balance, debit, ও credit কলব্যাক (Cents ফরম্যাট, call_id de-duplication, MD5 ও X-Signature HMAC-SHA256) পরীক্ষা করুন
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">অ্যাকশন টাইপ:</label>
                  <select
                    value={simAction}
                    onChange={e => setSimAction(e.target.value as any)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="balance">balance (ব্যালেন্স চেক)</option>
                    <option value="debit">debit (বেট কাটা)</option>
                    <option value="credit">credit (উইন ক্রেডিট)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">প্লেয়ার ইউজারনেম:</label>
                  <input
                    type="text"
                    value={simUser}
                    onChange={e => setSimUser(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">টাকার পরিমাণ (৳ BDT):</label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={e => setSimAmount(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleTestCallback}
                    disabled={simLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-black font-black text-xs rounded-xl shadow cursor-pointer disabled:opacity-50"
                  >
                    {simLoading ? 'রান হচ্ছে...' : 'টেস্ট রান করুন ⚡'}
                  </button>
                </div>
              </div>

              {/* Simulator Output */}
              {simResponse && (
                <div className="p-3 bg-black/80 rounded-xl border border-white/10 text-xs font-mono text-gray-300 space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-gray-400">API রেসপন্স পে-লোড:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        simStatus === 200
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      HTTP {simStatus} {simStatus === 200 ? 'OK' : 'ERROR'}
                    </span>
                  </div>
                  <pre className="text-emerald-400 whitespace-pre overflow-x-auto">{simResponse}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: USER MANAGEMENT */}
        {/* ========================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="ইউজারনেম বা মোবাইল নম্বর খুঁজুন..."
                  className="w-full bg-[#200305] border border-[#520c13] rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <span className="text-xs text-gray-400">
                মোট ইউজার: <strong>{users.length}</strong>
              </span>
            </div>

            <div className="bg-[#1b0306] rounded-xl border border-[#500c13] overflow-x-auto shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#2c050a] text-gray-300 font-bold uppercase text-[10px] border-b border-[#500c13]">
                  <tr>
                    <th className="p-3">ইউজার</th>
                    <th className="p-3">মোবাইল</th>
                    <th className="p-3">ব্যালেন্স (BDT)</th>
                    <th className="p-3">VIP</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3a060d]">
                  {users
                    .filter(u =>
                      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.phone.includes(userSearch)
                    )
                    .map(u => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 flex items-center gap-2">
                          <img
                            src={u.avatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-yellow-400"
                          />
                          <div>
                            <span className="font-bold text-white block">{u.username}</span>
                            <span className="text-[10px] text-gray-400">{u.nickname}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-gray-300">{u.phone}</td>
                        <td className="p-3 font-bold font-num text-yellow-400 text-sm">
                          ৳ {u.wallet.balance.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            VIP {u.vipLevel}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === 'active'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-red-950 text-red-300 border border-red-800'
                            }`}
                          >
                            {u.status === 'active' ? 'সক্রিয়' : 'ব্যান করা'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                soundFX.playClick();
                                setAdjustUserId(u.id);
                              }}
                              className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-black font-extrabold rounded text-[10px]"
                            >
                              ব্যালেন্স পরিবর্তন
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(u.id, u.status)}
                              className={`px-2 py-1 rounded text-[10px] font-bold ${
                                u.status === 'active'
                                  ? 'bg-red-900/60 hover:bg-red-800 text-red-200'
                                  : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200'
                              }`}
                            >
                              {u.status === 'active' ? 'ব্যান করুন' : 'আনব্যান'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Adjust Balance Modal */}
            {adjustUserId && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
                <div className="bg-[#220407] border border-[#6b121a] p-5 rounded-2xl max-w-sm w-full text-white space-y-3">
                  <h3 className="font-bold text-sm text-yellow-300">
                    ম্যানুয়াল ব্যালেন্স সমন্বয় (Credit/Debit)
                  </h3>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">অ্যাকশন বাছাই করুন:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setAdjustAction('credit')}
                        className={`py-1.5 rounded text-xs font-bold ${
                          adjustAction === 'credit' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        + জমা করুন (Credit)
                      </button>
                      <button
                        onClick={() => setAdjustAction('debit')}
                        className={`py-1.5 rounded text-xs font-bold ${
                          adjustAction === 'debit' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        - কর্তন করুন (Debit)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">টাকার পরিমাণ (BDT):</label>
                    <input
                      type="number"
                      value={adjustAmount}
                      onChange={e => setAdjustAmount(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700 rounded p-2 text-sm text-yellow-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">কারণ বা নোট:</label>
                    <input
                      type="text"
                      value={adjustReason}
                      onChange={e => setAdjustReason(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700 rounded p-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleAdjustBalance}
                      className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-black font-extrabold rounded-lg text-xs"
                    >
                      নিশ্চিত করুন
                    </button>
                    <button
                      onClick={() => setAdjustUserId(null)}
                      className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg text-xs font-bold"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: TRANSACTION APPROVALS */}
        {/* ========================================== */}
        {activeTab === 'transactions' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">
                অনুমোদন ও লেনদেনের ইতিহাস ({transactions.length})
              </h3>
              <button
                onClick={refreshAll}
                className="px-2.5 py-1 bg-gray-800 text-gray-200 text-xs font-bold rounded flex items-center gap-1"
              >
                <RefreshCw size={12} /> রিফ্রেশ
              </button>
            </div>

            <div className="bg-[#1b0306] rounded-xl border border-[#500c13] overflow-x-auto shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#2c050a] text-gray-300 font-bold uppercase text-[10px] border-b border-[#500c13]">
                  <tr>
                    <th className="p-3">টাইপ</th>
                    <th className="p-3">পরিমাণ (BDT)</th>
                    <th className="p-3">মেথড / চ্যানেল</th>
                    <th className="p-3">অ্যাকাউন্ট / TrxID</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3a060d]">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <span
                          className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                            tx.type === 'deposit'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : tx.type === 'withdraw'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-mono mt-0.5">{tx.id}</span>
                      </td>
                      <td className="p-3 font-bold font-num text-yellow-400 text-sm">
                        ৳ {tx.amount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-white uppercase">{tx.method || 'ওয়ালেট'}</span>
                        {tx.channel && <span className="text-[10px] text-gray-400 block">{tx.channel}</span>}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-gray-300">
                        {tx.accountNumber || 'N/A'}
                        {tx.trxId && <span className="text-amber-400 block font-bold">Trx: {tx.trxId}</span>}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.status === 'approved' || tx.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : tx.status === 'pending'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                              : 'bg-red-950 text-red-300 border border-red-800'
                          }`}
                        >
                          {tx.status === 'approved' || tx.status === 'completed'
                            ? 'অনুমোদিত'
                            : tx.status === 'pending'
                            ? 'অপেক্ষমান (Pending)'
                            : 'বাতিল (Rejected)'}
                        </span>
                      </td>
                      <td className="p-3">
                        {tx.status === 'pending' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleApproveTx(tx.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded text-[10px] flex items-center gap-1 shadow"
                            >
                              <CheckCircle size={10} /> অনুমোদন
                            </button>
                            <button
                              onClick={() => handleRejectTx(tx.id)}
                              className="px-2 py-1 bg-red-800 hover:bg-red-700 text-white font-bold rounded text-[10px] flex items-center gap-1 shadow"
                            >
                              <XCircle size={10} /> বাতিল
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-500">সম্পন্ন</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: GAME CATALOG & RTP SETTINGS */}
        {/* ========================================== */}
        {activeTab === 'games' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            {gameCatalogNotice && (
              <div className="p-3 bg-emerald-950/90 border border-emerald-500 text-emerald-200 rounded-xl text-xs font-bold flex items-center justify-between">
                <span>✅ {gameCatalogNotice}</span>
                <button onClick={() => setGameCatalogNotice(null)} className="text-emerald-300 hover:text-white">✕</button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#1c0306] p-3.5 rounded-2xl border border-[#500c13]">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={gameSearch}
                  onChange={e => setGameSearch(e.target.value)}
                  placeholder="গেম খুঁজুন (নাম / প্রোভাইডার)..."
                  className="bg-[#120103] border border-[#500c13] rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <select
                  value={gameFilterProvider}
                  onChange={e => setGameFilterProvider(e.target.value)}
                  className="bg-[#120103] border border-[#500c13] rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="All">সকল প্রোভাইডার ({games.length})</option>
                  <option value="Jili">Jili</option>
                  <option value="Pocket Games Soft">Pocket Games Soft</option>
                  <option value="Pragmatic Play">Pragmatic Play</option>
                  <option value="JDB">JDB</option>
                  <option value="FA CHAI Gaming">FA CHAI Gaming</option>
                  <option value="Microgaming">Microgaming</option>
                  <option value="CQ9">CQ9</option>
                  <option value="Spadegaming">Spadegaming</option>
                  <option value="Joker">Joker</option>
                  <option value="Fastspin">Fastspin</option>
                  <option value="BTGaming">BTGaming</option>
                  <option value="2J GAMES">2J GAMES</option>
                  <option value="SWGaming">SWGaming</option>
                  <option value="FunTa Gaming">FunTa Gaming</option>
                  <option value="Baison Poker">Baison Poker</option>
                  <option value="Kings Poker">Kings Poker</option>
                  <option value="BNG">BNG</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setEditingGameId(null);
                    setNewGameName('');
                    setNewGameBengaliName('');
                    setNewGameDemoLink('');
                    setIsAddingGame(!isAddingGame);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Plus size={13} />
                  <span>{isAddingGame ? 'ফরম বন্ধ করুন' : 'নতুন গেম যোগ করুন'}</span>
                </button>

                <button
                  onClick={handleCloneAllRemoteProviderGames}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-105 text-black font-black rounded-lg text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Zap size={13} />
                  <span>60bd98.vip সকল প্রোভাইডার গেম ক্লোন / সিঙ্ক</span>
                </button>

                <span className="text-xs text-gray-400 ml-1">
                  সক্রিয়: <strong>{games.filter(g => g.active).length}</strong> / {games.length}
                </span>
              </div>
            </div>

            {/* Add / Edit Game Drawer */}
            {isAddingGame && (
              <div className="p-4 bg-[#260408] border border-amber-500/50 rounded-2xl shadow-xl space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h4 className="font-black text-sm text-yellow-300">
                    {editingGameId ? 'গেম তথ্য সম্পাদনা (Edit Game)' : 'নতুন ক্যাসিনো গেম যুক্ত করুন (Add Game)'}
                  </h4>
                  <button
                    onClick={() => {
                      setIsAddingGame(false);
                      setEditingGameId(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-gray-300 block mb-1 font-bold">গেমের নাম (English):</label>
                    <input
                      type="text"
                      value={newGameName}
                      onChange={e => setNewGameName(e.target.value)}
                      placeholder="যেমন: Super Ace Deluxe"
                      className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 block mb-1 font-bold">গেমের বাংলা নাম:</label>
                    <input
                      type="text"
                      value={newGameBengaliName}
                      onChange={e => setNewGameBengaliName(e.target.value)}
                      placeholder="যেমন: সুপার এইস ডিলাক্স"
                      className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 block mb-1 font-bold">প্রোভাইডার (Provider):</label>
                    <select
                      value={newGameProvider}
                      onChange={e => setNewGameProvider(e.target.value)}
                      className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white font-bold"
                    >
                      <option value="Jili">Jili</option>
                      <option value="Pocket Games Soft">Pocket Games Soft</option>
                      <option value="Pragmatic Play">Pragmatic Play</option>
                      <option value="JDB">JDB</option>
                      <option value="FA CHAI Gaming">FA CHAI Gaming</option>
                      <option value="Microgaming">Microgaming</option>
                      <option value="CQ9">CQ9</option>
                      <option value="Spadegaming">Spadegaming</option>
                      <option value="Joker">Joker</option>
                      <option value="Fastspin">Fastspin</option>
                      <option value="BTGaming">BTGaming</option>
                      <option value="2J GAMES">2J GAMES</option>
                      <option value="SWGaming">SWGaming</option>
                      <option value="FunTa Gaming">FunTa Gaming</option>
                      <option value="Baison Poker">Baison Poker</option>
                      <option value="Kings Poker">Kings Poker</option>
                      <option value="BNG">BNG</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-300 block mb-1 font-bold">ক্যাটাগরি (Category):</label>
                    <select
                      value={newGameCategory}
                      onChange={e => setNewGameCategory(e.target.value as any)}
                      className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white font-bold"
                    >
                      <option value="hot">গরম খেলা (Hot)</option>
                      <option value="slots">স্লট খেলা (Slots)</option>
                      <option value="fishing">মাছ ধরা (Fishing)</option>
                      <option value="live">লাইভ ক্যাসিনো (Live)</option>
                      <option value="poker">পোকার / কার্ড (Poker)</option>
                      <option value="sports">খেলাধুলা (Sports)</option>
                      <option value="lottery">লটারি (Lottery)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-300 block mb-1 font-bold">RTP (%) ও মাল্টিপ্লায়ার:</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={newGameRtp}
                        onChange={e => setNewGameRtp(Number(e.target.value))}
                        className="w-24 bg-black/60 border border-gray-700 rounded-lg p-2 text-yellow-300 font-mono"
                      />
                      <input
                        type="text"
                        value={newGameMultiplier}
                        onChange={e => setNewGameMultiplier(e.target.value)}
                        placeholder="2000X"
                        className="flex-1 bg-black/60 border border-gray-700 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-300 block mb-1 font-bold">ডেমো / রিমোট লঞ্চ লিংক (Demo Link):</label>
                    <input
                      type="text"
                      value={newGameDemoLink}
                      onChange={e => setNewGameDemoLink(e.target.value)}
                      placeholder="/game_frame.php?gameid=jili/SuperAce&demo=1"
                      className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-emerald-300 font-mono"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-gray-300 block mb-1 font-bold">থাম্বনেইল ইমেজ URL অথবা ফাইল আপলোড:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGameImage}
                        onChange={e => setNewGameImage(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-black/60 border border-gray-700 rounded-lg p-2 text-white font-mono text-xs"
                      />
                      <label className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-yellow-300 border border-amber-500/40 rounded-lg cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0">
                        <Upload size={13} /> থাম্বনেইল আপলোড
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleFileUpload(e, url => setNewGameImage(url))}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      setIsAddingGame(false);
                      setEditingGameId(null);
                    }}
                    className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleSaveGameCatalogForm}
                    className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-black rounded-lg text-xs shadow-md"
                  >
                    {editingGameId ? 'পরিবর্তন সংরক্ষণ করুন' : 'গেম ক্যাটালগে যুক্ত করুন'}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {games
                .filter(g => {
                  if (gameFilterProvider !== 'All' && g.provider !== gameFilterProvider) return false;
                  if (gameSearch && !g.name.toLowerCase().includes(gameSearch.toLowerCase()) && !g.bengaliName.includes(gameSearch)) return false;
                  return true;
                })
                .map(g => (
                  <div
                    key={g.id}
                    className="p-3 bg-[#1e0306] border border-[#500b12] rounded-xl flex items-center justify-between gap-3 shadow-xs"
                  >
                    <img
                      src={g.image}
                      alt={g.name}
                      className="w-12 h-12 rounded-lg object-cover ring-1 ring-yellow-400/40 shrink-0"
                    />
                    <div className="flex-1 overflow-hidden">
                      <span className="font-bold text-white text-xs block truncate">{g.bengaliName}</span>
                      <span className="text-[10px] text-gray-400 block truncate">
                        {g.name} ({g.provider}) • <span className="text-amber-300 uppercase">{g.category}</span>
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400">RTP:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={g.rtp}
                          onChange={e => handleRtpChange(g.id, Number(e.target.value))}
                          className="w-14 bg-black/60 border border-gray-700 rounded px-1 text-[11px] font-mono text-yellow-300 text-center"
                        />
                        <span className="text-[10px] text-gray-400">%</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      <button
                        onClick={() => handleToggleGame(g.id, g.active)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          g.active
                            ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                            : 'bg-red-950 text-red-300 border border-red-900'
                        }`}
                      >
                        {g.active ? 'সক্রিয়' : 'বন্ধ'}
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEditGame(g)}
                          className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold"
                          title="সম্পাদনা"
                        >
                          ✎ এডিট
                        </button>
                        <button
                          onClick={() => handleDeleteGameItem(g.id, g.bengaliName)}
                          className="p-1 bg-red-950/80 hover:bg-red-800 text-red-300 rounded border border-red-800/60"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 5: GAME PROVIDERS API & CARD FRAME SETUP */}
        {/* ========================================== */}
        {activeTab === 'providers' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>গেম প্রোভাইডার ও কার্ড ফ্রেম ম্যানেজমেন্ট</span>
                  <span className="px-2 py-0.5 bg-amber-400 text-black text-[10px] font-black rounded-full">
                    {providers.length} টি প্রোভাইডার
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  গেম ক্যাটাগরিতে প্রদর্শিত প্রতিটি প্রোভাইডারের কার্ড ফ্রেম, কাস্টম লোগো ছবি এবং এপিআই ক্রেডেনশিয়াল পরিচালনা করুন।
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsAddingNewProv(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-xs flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <Plus size={13} /> নতুন প্রোভাইডার যোগ করুন
                </button>

                <button
                  onClick={handleResetProviders}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-lg text-xs active:scale-95 border border-gray-700"
                >
                  ডিফল্ট ছবি রিস্টোর
                </button>

                <button
                  onClick={handleDownloadPhpZip}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold rounded-lg text-xs flex items-center gap-1 shadow active:scale-95"
                >
                  <Download size={13} /> PHP Full Project ZIP
                </button>
              </div>
            </div>

            {/* Add New Provider Modal / Drawer */}
            {isAddingNewProv && (
              <div className="p-4 bg-[#2c0509] border border-amber-500/50 rounded-2xl shadow-xl space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h4 className="font-black text-sm text-yellow-300">নতুন গেম প্রোভাইডার কার্ড ফ্রেম যুক্ত করুন</h4>
                  <button onClick={() => setIsAddingNewProv(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-gray-300 block mb-1 font-bold">প্রোভাইডার নাম (System Key):</label>
                    <input
                      type="text"
                      placeholder="যেমন: Sexy Gaming"
                      value={newProvName}
                      onChange={e => setNewProvName(e.target.value)}
                      className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-gray-300 block mb-1 font-bold">প্রদর্শিত নাম (Display Name):</label>
                    <input
                      type="text"
                      placeholder="যেমন: Sexy Gaming Live"
                      value={newProvDisplayName}
                      onChange={e => setNewProvDisplayName(e.target.value)}
                      className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-gray-300 block mb-1 font-bold">কার্ডে কী শো করবে:</label>
                    <select
                      value={newProvShowType}
                      onChange={e => setNewProvShowType(e.target.value as any)}
                      className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white font-bold"
                    >
                      <option value="both">ছবি এবং নাম উভয়ই (Both)</option>
                      <option value="image_only">শুধু ছবি (Image Only)</option>
                      <option value="text_only">শুধু নাম (Text Only)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 block mb-1 font-bold text-xs">লোগো / ইমেজ URL (কার্ড ফ্রেমে প্রদর্শিত হবে):</label>
                  <input
                    type="text"
                    placeholder="https://... (ছবি লিংক)"
                    value={newProvLogoUrl}
                    onChange={e => setNewProvLogoUrl(e.target.value)}
                    className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-xs font-mono text-amber-200"
                  />
                </div>

                {/* Live Preview of New Provider Card Frame */}
                <div className="p-3 bg-black/50 rounded-xl border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-400">কার্ড ফ্রেম প্রিভিউ:</span>
                  <div className="px-3.5 py-1.5 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-500/25 via-[#4a0d13] to-amber-500/25 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)] flex items-center gap-2">
                    {newProvLogoUrl && newProvShowType !== 'text_only' && (
                      <div className="w-5 h-5 rounded-md overflow-hidden bg-black/40 p-0.5 shrink-0 flex items-center justify-center border border-white/10">
                        <img src={newProvLogoUrl} alt="preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                    {newProvShowType !== 'image_only' && (
                      <span className="text-xs font-black">{newProvDisplayName || newProvName || 'প্রোভাইডার নাম'}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleAddNewProvider}
                    className="flex-1 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold rounded-lg text-xs shadow-md"
                  >
                    যোগ করুন এবং সাইটে অ্যাক্টিভ করুন
                  </button>
                  <button
                    onClick={() => setIsAddingNewProv(false)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-xs font-bold"
                  >
                    বাতিল
                  </button>
                </div>
              </div>
            )}

            {/* Providers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers.map(prov => {
                const isEditing = editingProvId === prov.id;
                const hasLogo = Boolean(prov.logoUrl && prov.logoUrl.trim().length > 0);

                return (
                  <div
                    key={prov.id}
                    className="bg-[#200305] border border-[#520c13] p-4 rounded-2xl shadow-md space-y-3.5"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#40080e] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-600 text-white font-black text-xs rounded">
                          {prov.name}
                        </span>
                        <span className="text-xs text-amber-300 font-bold">
                          {prov.displayName || prov.name}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        অনলাইন ({prov.lastPingMs || 40}ms)
                      </span>
                    </div>

                    {/* Live Front-End Card Frame Preview Box */}
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 font-medium">লাইভ কার্ড ফ্রেম:</span>
                      <div className="px-3 py-1.5 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-500/25 via-[#4a0d13] to-amber-500/25 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)] flex items-center gap-2">
                        {hasLogo && prov.showType !== 'text_only' && (
                          <div className="w-5 h-5 rounded-md overflow-hidden bg-black/40 p-0.5 shrink-0 flex items-center justify-center border border-white/10">
                            <img src={prov.logoUrl} alt={prov.name} className="w-full h-full object-contain" />
                          </div>
                        )}
                        {prov.showType !== 'image_only' && (
                          <span className="text-xs font-black">{prov.displayName || prov.name}</span>
                        )}
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_#f59e0b]" />
                      </div>
                    </div>

                    {/* Image / Visual Configuration Box */}
                    {isEditing ? (
                      <div className="p-3 bg-black/50 border border-amber-400/50 rounded-xl space-y-2.5 text-xs">
                        <span className="font-bold text-yellow-300 block">কার্ড ফ্রেমের ছবি ও অপশন সম্পাদনা:</span>

                        <div>
                          <label className="text-[10px] text-gray-300 block mb-0.5 font-bold">ছবি / লোগো URL:</label>
                          <input
                            type="text"
                            value={provImageInput}
                            onChange={e => setProvImageInput(e.target.value)}
                            placeholder="https://... ছবির সরাসরি লিংক"
                            className="w-full bg-black/80 border border-gray-700 rounded p-1.5 text-xs text-amber-200 font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-300 block mb-0.5 font-bold">প্রদর্শিত নাম:</label>
                          <input
                            type="text"
                            value={provDisplayName}
                            onChange={e => setProvDisplayName(e.target.value)}
                            placeholder="যেমন: JILI Games"
                            className="w-full bg-black/80 border border-gray-700 rounded p-1.5 text-xs text-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-300 block mb-0.5 font-bold">প্রদর্শন স্টাইল:</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'both', label: 'ছবি + নাম' },
                              { id: 'image_only', label: 'শুধু ছবি' },
                              { id: 'text_only', label: 'শুধু নাম' },
                            ].map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setProvShowType(s.id as any)}
                                className={`py-1 rounded text-[11px] font-bold border transition-all ${
                                  provShowType === s.id
                                    ? 'bg-amber-400 text-black border-amber-400 font-extrabold'
                                    : 'bg-black/40 text-gray-300 border-gray-700'
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleSaveProviderVisuals(prov.id)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-xs"
                          >
                            ছবি সেভ করুন
                          </button>
                          <button
                            onClick={() => setEditingProvId(null)}
                            className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs"
                          >
                            বাতিল
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[11px] text-gray-400">
                          স্টাইল: <strong>{prov.showType === 'image_only' ? 'শুধু ছবি' : prov.showType === 'text_only' ? 'শুধু নাম' : 'ছবি + নাম'}</strong>
                        </span>
                        <button
                          onClick={() => handleStartEditProvider(prov)}
                          className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-lg text-xs font-bold active:scale-95"
                        >
                          ✎ ছবি / লোগো পরিবর্তন
                        </button>
                      </div>
                    )}

                    {/* API Endpoints & Secret Credentials */}
                    <div className="space-y-1.5 text-xs border-t border-white/5 pt-2">
                      <div>
                        <span className="text-gray-400 text-[10px] block">API এন্ডপয়েন্ট:</span>
                        <input
                          type="text"
                          value={prov.apiUrl}
                          readOnly
                          className="w-full bg-black/60 border border-gray-800 rounded p-1 text-[11px] font-mono text-gray-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-400 text-[10px] block">মার্চেন্ট কোড:</span>
                          <input
                            type="text"
                            value={prov.merchantCode}
                            readOnly
                            className="w-full bg-black/60 border border-gray-800 rounded p-1 text-[11px] font-mono text-yellow-300"
                          />
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] block">এজেন্ট আইডি:</span>
                          <input
                            type="text"
                            value={prov.agentCode}
                            readOnly
                            className="w-full bg-black/60 border border-gray-800 rounded p-1 text-[11px] font-mono text-yellow-300"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-400 text-[10px] block">ওয়েবহুক কলব্যাক URL:</span>
                        <input
                          type="text"
                          value={prov.callbackUrl}
                          readOnly
                          className="w-full bg-black/60 border border-gray-800 rounded p-1 text-[11px] font-mono text-emerald-300"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB: MEDIA & ICONS MANAGER */}
        {/* ========================================== */}
        {activeTab === 'media_assets' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#4d0c13] pb-3">
              <div>
                <h3 className="font-black text-sm text-yellow-300 flex items-center gap-2">
                  <Palette size={17} /> সাইটের সকল ছবি, ব্যানার ও আইকন পরিবর্তন ম্যানেজার
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  হোম স্লাইডার ব্যানার, পেমেন্ট মেথড লোগো, গেম ক্যাটাগরি আর্ট এবং সাইটের ব্র্যান্ড লোগো সরাসরি URL অথবা আপনার ডিভাইস থেকে ফাইল আপলোড করে পরিবর্তন করুন।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    if (confirm('আপনি কি সকল ব্যানার, পেমেন্ট লোগো ও ছবি ডিফল্ট অবস্থায় রিসেট করতে চান?')) {
                      storage.resetSiteAssetsToDefault();
                      refreshAll();
                      alert('সকল ছবি ও ব্যানার সফলভাবে রিসেট হয়েছে!');
                    }
                  }}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-bold border border-gray-700 active:scale-95 transition-all"
                >
                  ডিফল্ট ছবি রিসেট
                </button>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto text-xs font-bold">
              {[
                { id: 'banners', label: `🖼️ ব্যানারসমূহ (${siteAssets.banners.length})` },
                { id: 'payments', label: `💳 পেমেন্ট গেটওয়ে (${siteAssets.paymentMethods.length})` },
                { id: 'categories', label: `🎮 গেম ক্যাটাগরি (${siteAssets.categories.length})` },
                { id: 'branding', label: '📱 লোগো ও অ্যান্ড্রয়েড অ্যাপ' },
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    soundFX.playClick();
                    setMediaSubTab(sub.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mediaSubTab === sub.id
                      ? 'bg-amber-400 text-black font-black shadow-md'
                      : 'bg-[#200305] text-gray-400 hover:text-white'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* SUB-SECTION 1: BANNERS */}
            {mediaSubTab === 'banners' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-300 font-bold">
                    প্রতিটি ব্যানার ২ সেকেন্ড পরপর স্লাইড হয় এবং সর্বোচ্চ ছবি শো করে:
                  </span>
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setIsAddingBanner(!isAddingBanner);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-xs flex items-center gap-1.5 shadow active:scale-95"
                  >
                    <Plus size={13} /> {isAddingBanner ? 'ফরম বন্ধ করুন' : 'নতুন ব্যানার যোগ করুন'}
                  </button>
                </div>

                {/* Add New Banner Form Drawer */}
                {isAddingBanner && (
                  <div className="p-4 bg-[#280407] border border-amber-500/50 rounded-2xl shadow-xl space-y-3">
                    <h4 className="font-black text-sm text-yellow-300">নতুন স্লাইডার ব্যানার তৈরি</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-gray-300 block mb-1 font-bold">ব্যানার ব্যাজ (ট্যাগ):</label>
                        <input
                          type="text"
                          value={newBannerBadge}
                          onChange={e => setNewBannerBadge(e.target.value)}
                          className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 block mb-1 font-bold">অ্যাকশন (বাটনে ক্লিক করলে কী হবে):</label>
                        <select
                          value={newBannerAction}
                          onChange={e => setNewBannerAction(e.target.value as any)}
                          className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white font-bold"
                        >
                          <option value="deposit">ডিপোজিট মডাল ওপেন</option>
                          <option value="egg">গোল্ডেন এগ বোনাস ওপেন</option>
                          <option value="redpacket">১৭ রেড প্যাকেট ওপেন</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-300 block mb-1 font-bold">শিরোনাম ১ (Title 1):</label>
                        <input
                          type="text"
                          value={newBannerTitle1}
                          onChange={e => setNewBannerTitle1(e.target.value)}
                          className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 block mb-1 font-bold">শিরোনাম ২ (Title 2):</label>
                        <input
                          type="text"
                          value={newBannerTitle2}
                          onChange={e => setNewBannerTitle2(e.target.value)}
                          className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 block mb-1 font-bold">টাকার পরিমাণ বা অফার:</label>
                        <input
                          type="text"
                          value={newBannerAmount}
                          onChange={e => setNewBannerAmount(e.target.value)}
                          className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-yellow-400 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 block mb-1 font-bold">বাটনের লেখা (Button Text):</label>
                        <input
                          type="text"
                          value={newBannerBtnText}
                          onChange={e => setNewBannerBtnText(e.target.value)}
                          className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-gray-300 block mb-1 font-bold">ব্যাকগ্রাউন্ড ছবি URL অথবা সরাসরি আপলোড:</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newBannerBgImage}
                            onChange={e => setNewBannerBgImage(e.target.value)}
                            placeholder="https://... অথবা নিচের ফাইল সিলেক্ট বাটন ব্যবহার করুন"
                            className="flex-1 bg-black/60 border border-gray-700 rounded-lg p-2 text-white font-mono text-xs"
                          />
                          <label className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-yellow-300 border border-amber-500/40 rounded-lg cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0">
                            <Upload size={13} /> ডিভাইস থেকে নির্বাচন
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => handleFileUpload(e, url => setNewBannerBgImage(url))}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => setIsAddingBanner(false)}
                        className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs"
                      >
                        বাতিল
                      </button>
                      <button
                        onClick={() => {
                          soundFX.playWin();
                          storage.addBanner({
                            badge: newBannerBadge,
                            badgeColor: 'from-amber-500 to-red-600',
                            title1: newBannerTitle1,
                            title2: newBannerTitle2,
                            amount: newBannerAmount,
                            btnText: newBannerBtnText,
                            action: newBannerAction,
                            bgImage: newBannerBgImage,
                            gradientOverlay: 'from-[#2e0306]/90 via-[#1f0204]/75 to-transparent',
                          });
                          refreshAll();
                          setIsAddingBanner(false);
                          alert('নতুন ব্যানার সফলভাবে তৈরি ও হোম স্লাইডারে যুক্ত হয়েছে!');
                        }}
                        className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold rounded-lg text-xs shadow-md"
                      >
                        ব্যানার সংরক্ষণ করুন
                      </button>
                    </div>
                  </div>
                )}

                {/* List of existing banners */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {siteAssets.banners.map((banner) => (
                    <div
                      key={banner.id}
                      className="bg-[#1e0306] border border-[#520c13] rounded-2xl overflow-hidden shadow-lg p-3 space-y-3"
                    >
                      {/* Live Preview Card */}
                      <div className="relative h-28 rounded-xl overflow-hidden border border-white/10">
                        <img
                          src={banner.bgImage}
                          alt=""
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent p-3 flex flex-col justify-between">
                          <div>
                            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-red-600 text-[10px] font-black text-black rounded uppercase">
                              {banner.badge}
                            </span>
                            <h4 className="text-sm font-black text-white mt-1 leading-tight">{banner.title1}</h4>
                            <p className="text-[11px] text-gray-200">{banner.title2}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-amber-300">{banner.amount}</span>
                            <span className="px-2 py-0.5 bg-amber-400 text-black font-bold text-[9px] rounded">
                              {banner.btnText}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Inputs to edit */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="text-gray-400 block mb-0.5 text-[11px] font-bold">ছবির URL বা নতুন ফাইল আপলোড:</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={banner.bgImage}
                              onChange={e => {
                                storage.updateBanner(banner.id, { bgImage: e.target.value });
                                setSiteAssets(storage.getSiteAssets());
                              }}
                              className="flex-1 bg-black/60 border border-gray-700 rounded p-1.5 text-[11px] text-gray-200 font-mono"
                            />
                            <label className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-yellow-300 border border-gray-700 rounded cursor-pointer flex items-center gap-1 text-[11px] shrink-0 font-bold">
                              <Upload size={11} /> আপলোড
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                  handleFileUpload(e, url => {
                                    storage.updateBanner(banner.id, { bgImage: url });
                                    refreshAll();
                                  });
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-gray-400 block mb-0.5 text-[10px]">শিরোনাম ১:</label>
                            <input
                              type="text"
                              value={banner.title1}
                              onChange={e => {
                                storage.updateBanner(banner.id, { title1: e.target.value });
                                setSiteAssets(storage.getSiteAssets());
                              }}
                              className="w-full bg-black/60 border border-gray-700 rounded p-1 text-[11px] text-white"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 block mb-0.5 text-[10px]">শিরোনাম ২:</label>
                            <input
                              type="text"
                              value={banner.title2}
                              onChange={e => {
                                storage.updateBanner(banner.id, { title2: e.target.value });
                                setSiteAssets(storage.getSiteAssets());
                              }}
                              className="w-full bg-black/60 border border-gray-700 rounded p-1 text-[11px] text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-gray-400 block mb-0.5 text-[10px]">অফার বা পরিমাণ:</label>
                            <input
                              type="text"
                              value={banner.amount}
                              onChange={e => {
                                storage.updateBanner(banner.id, { amount: e.target.value });
                                setSiteAssets(storage.getSiteAssets());
                              }}
                              className="w-full bg-black/60 border border-gray-700 rounded p-1 text-[11px] text-yellow-300 font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 block mb-0.5 text-[10px]">বাটন টেক্সট:</label>
                            <input
                              type="text"
                              value={banner.btnText}
                              onChange={e => {
                                storage.updateBanner(banner.id, { btnText: e.target.value });
                                setSiteAssets(storage.getSiteAssets());
                              }}
                              className="w-full bg-black/60 border border-gray-700 rounded p-1 text-[11px] text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <button
                          onClick={() => {
                            if (confirm('আপনি কি এই ব্যানারটি মুছে ফেলতে চান?')) {
                              soundFX.playClick();
                              storage.deleteBanner(banner.id);
                              refreshAll();
                            }
                          }}
                          className="text-red-400 hover:text-red-300 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Trash2 size={12} /> মুছে ফেলুন
                        </button>
                        <button
                          onClick={() => {
                            soundFX.playWin();
                            refreshAll();
                            alert('ব্যানার সফলভাবে সেভ হয়েছে!');
                          }}
                          className="px-3 py-1 bg-amber-400 text-black font-extrabold rounded text-[11px]"
                        >
                          সেভ করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-SECTION 2: PAYMENT METHODS */}
            {mediaSubTab === 'payments' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-950/40 border border-amber-600/50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-200 block">
                      পেমেন্ট গেটওয়ে প্রদর্শন নীতি:
                    </span>
                    <span className="text-gray-300 text-[11px]">
                      ইউজারের নির্দেশনায় পেমেন্ট সেকশনে বড় ছবির পরিবর্তে ছোট ও পরিচ্ছন্ন ব্র্যান্ড কার্ড যুক্ত করা হয়েছে। প্রতিটি গেটওয়ের লোগো ও ছবি নিচে থেকে পরিবর্তন করা যাবে।
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAddingPayment(!isAddingPayment)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-xs flex items-center gap-1 shadow shrink-0"
                  >
                    <Plus size={13} /> {isAddingPayment ? 'বন্ধ করুন' : 'নতুন পেমেন্ট যোগ করুন'}
                  </button>
                </div>

                {/* Add Payment Form */}
                {isAddingPayment && (
                  <div className="p-4 bg-[#280407] border border-amber-500/50 rounded-2xl shadow-xl space-y-3">
                    <h4 className="font-black text-sm text-yellow-300">নতুন পেমেন্ট গেটওয়ে যুক্ত করুন</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-gray-300 block mb-1 font-bold">গেটওয়ের নাম (English):</label>
                        <input
                          type="text"
                          placeholder="যেমন: SureCash / USDT"
                          value={newPayName}
                          onChange={e => setNewPayName(e.target.value)}
                          className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 block mb-1 font-bold">নাম (বাংলা):</label>
                        <input
                          type="text"
                          placeholder="যেমন: শিউরক্যাশ / ক্রিপ্টো"
                          value={newPayNameBn}
                          onChange={e => setNewPayNameBn(e.target.value)}
                          className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-gray-300 block mb-1 font-bold">লোগো ছবি URL অথবা ফাইল নির্বাচন:</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newPayLogoUrl}
                            onChange={e => setNewPayLogoUrl(e.target.value)}
                            placeholder="https://... অথবা ডিভাইস থেকে আপলোড করুন"
                            className="flex-1 bg-black/60 border border-gray-700 rounded-lg p-2 text-white font-mono text-xs"
                          />
                          <label className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-yellow-300 border border-amber-500/40 rounded-lg cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0">
                            <Upload size={13} /> ফাইল আপলোড
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => handleFileUpload(e, url => setNewPayLogoUrl(url))}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => setIsAddingPayment(false)}
                        className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs"
                      >
                        বাতিল
                      </button>
                      <button
                        onClick={() => {
                          if (!newPayName.trim()) {
                            alert('পেমেন্টের নাম লিখুন');
                            return;
                          }
                          soundFX.playWin();
                          storage.addPaymentMethod({
                            id: 'pay_' + Date.now(),
                            name: newPayName.trim(),
                            nameBn: newPayNameBn.trim() || newPayName.trim(),
                            logoUrl: newPayLogoUrl.trim() || 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=120&auto=format&fit=crop&q=80',
                            enabled: true,
                            color: newPayColor,
                          });
                          refreshAll();
                          setIsAddingPayment(false);
                          setNewPayName('');
                          setNewPayNameBn('');
                          setNewPayLogoUrl('');
                          alert('নতুন পেমেন্ট গেটওয়ে সফলভাবে সাইটে যুক্ত হয়েছে!');
                        }}
                        className="px-4 py-1.5 bg-amber-400 text-black font-extrabold rounded-lg text-xs shadow-md"
                      >
                        গেটওয়ে যুক্ত করুন
                      </button>
                    </div>
                  </div>
                )}

                {/* List of payment methods */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {siteAssets.paymentMethods.map(method => (
                    <div
                      key={method.id}
                      className="bg-[#1e0306] border border-[#520c13] rounded-2xl p-3 space-y-3 shadow-md"
                    >
                      {/* Logo preview */}
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-12 bg-white/10 rounded-xl p-1.5 flex items-center justify-center border border-white/15">
                          <img
                            src={method.logoUrl}
                            alt={method.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <span className="font-black text-white text-sm block truncate">{method.nameBn}</span>
                          <span className="text-[11px] text-gray-400 block truncate">{method.name}</span>
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold mt-0.5 ${
                              method.enabled ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                            }`}
                          >
                            {method.enabled ? '● সক্রিয়' : '● বন্ধ'}
                          </span>
                        </div>
                      </div>

                      {/* URL & Upload inputs */}
                      <div className="space-y-1.5 text-xs">
                        <label className="text-gray-400 block text-[10px] font-bold">লোগো ছবি পরিবর্তন:</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={method.logoUrl}
                            onChange={e => {
                              storage.updatePaymentMethod(method.id, { logoUrl: e.target.value });
                              setSiteAssets(storage.getSiteAssets());
                            }}
                            className="flex-1 bg-black/60 border border-gray-700 rounded p-1 text-[11px] text-gray-200 font-mono"
                          />
                          <label className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-yellow-300 border border-gray-700 rounded cursor-pointer flex items-center gap-1 text-[10px] shrink-0 font-bold">
                            <Upload size={11} /> আপলোড
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                handleFileUpload(e, url => {
                                  storage.updatePaymentMethod(method.id, { logoUrl: url });
                                  refreshAll();
                                });
                              }}
                            />
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-gray-400 block text-[10px]">নাম (বাংলা):</label>
                            <input
                              type="text"
                              value={method.nameBn}
                              onChange={e => {
                                storage.updatePaymentMethod(method.id, { nameBn: e.target.value });
                                setSiteAssets(storage.getSiteAssets());
                              }}
                              className="w-full bg-black/60 border border-gray-700 rounded p-1 text-[11px] text-white"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => {
                                soundFX.playClick();
                                storage.updatePaymentMethod(method.id, { enabled: !method.enabled });
                                refreshAll();
                              }}
                              className={`px-3 py-1.5 rounded text-[10px] font-black ${
                                method.enabled
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {method.enabled ? 'বন্ধ করুন' : 'সক্রিয় করুন'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-SECTION 3: CATEGORY CARDS */}
            {mediaSubTab === 'categories' && (
              <div className="space-y-4">
                <span className="text-xs text-gray-300 font-bold block">
                  হোমপেজের ৭টি মূল গেম ক্যাটাগরির ছবি ও বাংলা শিরোনাম পরিচালনা:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {siteAssets.categories.map(cat => (
                    <div
                      key={cat.id}
                      className="bg-[#1e0306] border border-[#520c13] rounded-2xl p-3 flex gap-3 shadow-md"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                        <img
                          src={cat.image}
                          alt={cat.titleBn}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-white text-sm">{cat.titleBn}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{cat.id}</span>
                        </div>

                        <div>
                          <label className="text-gray-400 block text-[10px]">ছবির URL বা ফাইল আপলোড:</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={cat.image}
                              onChange={e => {
                                storage.updateCategory(cat.id, { image: e.target.value });
                                setSiteAssets(storage.getSiteAssets());
                              }}
                              className="flex-1 bg-black/60 border border-gray-700 rounded p-1 text-[11px] text-gray-200 font-mono"
                            />
                            <label className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-yellow-300 border border-gray-700 rounded cursor-pointer flex items-center gap-1 text-[10px] shrink-0 font-bold">
                              <Upload size={11} /> আপলোড
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                  handleFileUpload(e, url => {
                                    storage.updateCategory(cat.id, { image: url });
                                    refreshAll();
                                  });
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-gray-400 block text-[10px]">ক্যাটাগরি নাম (বাংলা):</label>
                            <input
                              type="text"
                              value={cat.titleBn}
                              onChange={e => {
                                storage.updateCategory(cat.id, { titleBn: e.target.value });
                                setSiteAssets(storage.getSiteAssets());
                              }}
                              className="w-full bg-black/60 border border-gray-700 rounded p-1 text-[11px] text-white"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 block text-[10px]">সাবটাইটেল (বাংলা):</label>
                            <input
                              type="text"
                              value={cat.subBn}
                              onChange={e => {
                                storage.updateCategory(cat.id, { subBn: e.target.value });
                                setSiteAssets(storage.getSiteAssets());
                              }}
                              className="w-full bg-black/60 border border-gray-700 rounded p-1 text-[11px] text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-SECTION 4: BRANDING & ANDROID APP */}
            {mediaSubTab === 'branding' && (
              <div className="space-y-6">
                {/* Header Logo */}
                <div className="bg-[#1e0306] border border-[#520c13] rounded-2xl p-4 shadow-md space-y-3">
                  <div className="flex items-center gap-2 text-yellow-300 font-black text-xs">
                    <Palette size={16} /> সাইট হেডার লোগো (Header Brand Logo)
                  </div>
                  <p className="text-xs text-gray-400">
                    ডিফল্টভাবে <strong>liveXwin</strong> ভেক্টর লোগো (IMG_0287.png এর নিখুঁত ট্রান্সপারেন্ট ভার্সন) প্রদর্শিত হয়। আপনি চাইলে নিচে কাস্টম লোগো ছবি লিংক বা ফাইল আপলোড করে পরিবর্তন করতে পারেন।
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={siteAssets.siteLogoUrl}
                      onChange={e => {
                        storage.updateSiteAssets({ siteLogoUrl: e.target.value });
                        setSiteAssets(storage.getSiteAssets());
                      }}
                      placeholder="খালি রাখলে স্বয়ংক্রিয়ভাবে liveXwin ভেক্টর লোগো প্রদর্শিত হবে"
                      className="flex-1 bg-black/60 border border-gray-700 rounded-lg p-2 text-xs text-white font-mono"
                    />
                    <label className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-yellow-300 border border-amber-500/40 rounded-lg cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0">
                      <Upload size={13} /> লোগো আপলোড
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          handleFileUpload(e, url => {
                            storage.updateSiteAssets({ siteLogoUrl: url });
                            refreshAll();
                          });
                        }}
                      />
                    </label>
                  </div>
                  {siteAssets.siteLogoUrl && (
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        storage.updateSiteAssets({ siteLogoUrl: '' });
                        refreshAll();
                        alert('ডিফল্ট liveXwin ভেক্টর লোগো পুনরায় সক্রিয় করা হয়েছে!');
                      }}
                      className="text-xs text-amber-400 hover:underline font-bold"
                    >
                      ↺ ডিফল্ট liveXwin ভেক্টর লোগোতে ফিরে যান
                    </button>
                  )}
                </div>

                {/* Footer Provider Showcase Image */}
                <div className="bg-[#1e0306] border border-[#520c13] rounded-2xl p-4 shadow-md space-y-3">
                  <div className="flex items-center gap-2 text-yellow-300 font-black text-xs">
                    <Gamepad2 size={16} /> ফুটার গেম প্রোভাইডার গ্রিড ইমেজ (Footer Providers Showcase)
                  </div>
                  <p className="text-xs text-gray-400">
                    কম্পিউটার ও মোবাইল বান্ধব ফুটার প্রোভাইডার ইমেজ (জেআইএলআই, প্রাগম্যাটিক, নো লিমিট সিটি, হ্যাকস গেইমিং ইত্যাদি)।
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={siteAssets.footerProvidersImageUrl}
                      onChange={e => {
                        storage.updateSiteAssets({ footerProvidersImageUrl: e.target.value });
                        setSiteAssets(storage.getSiteAssets());
                      }}
                      className="flex-1 bg-black/60 border border-gray-700 rounded-lg p-2 text-xs text-white font-mono"
                    />
                    <label className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-yellow-300 border border-amber-500/40 rounded-lg cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0">
                      <Upload size={13} /> ফাইল আপলোড
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          handleFileUpload(e, url => {
                            storage.updateSiteAssets({ footerProvidersImageUrl: url });
                            refreshAll();
                          });
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Android App Box */}
                <div className="bg-[#240407] border border-[#5f0e15] rounded-2xl p-4 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                      <Smartphone size={16} /> ফুল PHP প্রজেক্ট ও অটো ইনস্টলার (Turnkey PHP 8+)
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-bold">
                      ● সক্রিয়
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    cPanel বা Apache সার্ভারে সরাসরি আপলোড করার জন্য সম্পূর্ণ PHP প্রজেক্ট এবং অটো ইনস্টলার নিচে ডাউনলোড করুন।
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={handleDownloadPhpZip}
                      disabled={isExportingPhpZip}
                      className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold rounded-lg text-xs shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Download size={14} /> সম্পূর্ণ PHP প্রজেক্ট ZIP ডাউনলোড
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 6: TRACKING, GOOGLE TAG MANAGER, FB PIXEL & CLOUDFLARE CDN */}
        {/* ========================================== */}
        {activeTab === 'tracking_cdn' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h3 className="font-bold text-sm text-white mb-1">
                Cloudflare CDN, Google Tag Manager ও Facebook Pixel ইন্টিগ্রেশন
              </h3>
              <p className="text-xs text-gray-400">
                রিয়েল ক্যাসিনো সাইটের সম্পূর্ণ ট্র্যাকিং, কনভার্সন অপটিমাইজেশন, ক্লাউডফ্লেয়ার ডিডিওএস সুরক্ষা এবং এসএসএল কনফিগারেশন।
              </p>
            </div>

            {/* Cloudflare CDN Box */}
            <div className="bg-[#200305] border border-[#520c13] p-4 rounded-xl shadow-md space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Globe size={16} /> Cloudflare Free CDN & DDoS Shield Setup
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">ডোমেন নাম:</label>
                  <input
                    type="text"
                    value={cloudflareDomain}
                    onChange={e => setCloudflareDomain(e.target.value)}
                    className="w-full bg-black/60 border border-gray-700 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">SSL/TLS এনক্রিপশন মোড:</label>
                  <select
                    value={sslMode}
                    onChange={e => setSslMode(e.target.value as any)}
                    className="w-full bg-black/60 border border-gray-700 rounded p-2 text-white font-bold"
                  >
                    <option value="flexible">Flexible (Edge to Client SSL)</option>
                    <option value="full">Full (End-to-End SSL)</option>
                    <option value="strict">Full (Strict - Recommended for Casino)</option>
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-gray-400">
                ক্লাউডফ্লেয়ার নেমসার্ভার: <code>dave.ns.cloudflare.com</code> ও <code>gemma.ns.cloudflare.com</code>
              </p>
            </div>

            {/* Google Tag Manager Box */}
            <div className="bg-[#200305] border border-[#520c13] p-4 rounded-xl shadow-md space-y-3">
              <div className="flex items-center gap-2 text-yellow-300 font-bold text-xs">
                <Radio size={16} /> Google Tag Manager (GTM) Container Setup
              </div>
              <div className="text-xs space-y-2">
                <label className="text-gray-400 block">GTM কন্টেইনার আইডি:</label>
                <input
                  type="text"
                  value={gtmId}
                  onChange={e => setGtmId(e.target.value)}
                  placeholder="GTM-XXXXXXX"
                  className="w-full sm:w-64 bg-black/60 border border-gray-700 rounded p-2 text-yellow-300 font-mono font-bold"
                />
                <span className="text-[11px] text-gray-400 block">
                  সক্রিয় ইভেন্টসমূহ: <code>registration</code>, <code>deposit</code>, <code>withdraw</code>, <code>game_launch</code>
                </span>
              </div>
            </div>

            {/* Facebook Pixel Box */}
            <div className="bg-[#200305] border border-[#520c13] p-4 rounded-xl shadow-md space-y-3">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <Zap size={16} /> Facebook Pixel (Meta Pixel) & CAPI Setup
              </div>
              <div className="text-xs space-y-2">
                <label className="text-gray-400 block">মেটা পিক্সেল আইডি (Pixel ID):</label>
                <input
                  type="text"
                  value={fbPixelId}
                  onChange={e => setFbPixelId(e.target.value)}
                  placeholder="123456789012345"
                  className="w-full sm:w-64 bg-black/60 border border-gray-700 rounded p-2 text-rose-300 font-mono font-bold"
                />
                <span className="text-[11px] text-gray-400 block">
                  সক্রিয় ট্র্যাকিং: <code>fbq('track', 'CompleteRegistration')</code>, <code>fbq('track', 'Purchase')</code>
                </span>
              </div>
            </div>

            {trackingSaved && (
              <div className="p-3 bg-emerald-950 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-bold text-center">
                ✓ ক্লাউডফ্লেয়ার সিডিএন, জিটিএম এবং ফেসবুক পিক্সেল সফলভাবে সংরক্ষিত ও সক্রিয় হয়েছে!
              </div>
            )}

            <button
              onClick={handleSaveTracking}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold rounded-lg text-xs shadow-md"
            >
              সেটিংস সংরক্ষণ করুন
            </button>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 7: PHP PROJECT SOURCE CODE EXPLORER */}
        {/* ========================================== */}
        {activeTab === 'php_source' && (
          <div className="space-y-4 max-w-6xl mx-auto h-[72vh] flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-bold text-sm text-white">
                  সম্পূর্ণ PHP প্রজেক্ট সোর্স কোড ভিউয়ার ({PHP_PROJECT_FILES.length} ফাইল)
                </h3>
                <p className="text-xs text-gray-400">
                  নিচের ফাইলগুলো ব্রাউজ করুন অথবা সরাসরি এক ক্লিকে সম্পূর্ণ PHP ZIP ফাইল ডাউনলোড করুন।
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDownloadPhpZip}
                  disabled={isExportingPhpZip}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold rounded-lg text-xs flex items-center gap-1 shadow cursor-pointer"
                >
                  <Download size={13} />
                  <span>{isExportingPhpZip ? 'তৈরি হচ্ছে...' : 'সম্পূর্ণ PHP ZIP ডাউনলোড'}</span>
                </button>
              </div>
            </div>

            {/* Split Code Browser */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-hidden">
              {/* File Tree Left */}
              <div className="bg-[#180306] border border-[#4d0c13] rounded-xl p-2 overflow-y-auto space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 block">
                  PHP ফাইলসমূহ ({PHP_PROJECT_FILES.length})
                </span>
                {PHP_PROJECT_FILES.map((file, idx) => (
                  <button
                    key={file.path}
                    onClick={() => {
                      soundFX.playClick();
                      setSelectedFileIdx(idx);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono transition-all flex flex-col cursor-pointer ${
                      selectedFileIdx === idx
                        ? 'bg-amber-400 text-black font-extrabold shadow-sm'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{file.path}</span>
                    <span className={`text-[9px] truncate ${selectedFileIdx === idx ? 'text-black/80' : 'text-gray-500'}`}>
                      {file.description}
                    </span>
                  </button>
                ))}
              </div>

              {/* Code Previewer Right */}
              <div className="md:col-span-2 bg-[#0a0102] border border-[#4d0c13] rounded-xl flex flex-col overflow-hidden">
                <div className="bg-[#1f0306] px-3 py-2 border-b border-[#4d0c13] flex justify-between items-center text-xs">
                  <span className="font-mono text-yellow-300 font-bold truncate">
                    {PHP_PROJECT_FILES[selectedFileIdx]?.path}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(PHP_PROJECT_FILES[selectedFileIdx]?.content || '');
                      soundFX.playClick();
                    }}
                    className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-[10px] font-bold cursor-pointer"
                  >
                    কোড কপি করুন
                  </button>
                </div>
                <pre className="flex-1 p-3 text-xs font-mono text-gray-200 overflow-auto bg-black/60 leading-relaxed selection:bg-amber-400 selection:text-black">
                  {PHP_PROJECT_FILES[selectedFileIdx]?.content}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
