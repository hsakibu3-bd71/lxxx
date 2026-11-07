import { UserProfile, Transaction, BetRecord, ProviderConfig, SiteSettings, GameItem, SiteAssets, PromoSlideItem, CategoryCardItem, PaymentMethodAsset } from '../types';
import { GAME_CATALOG } from '../data/games';
import {
  ensureFirestoreUserDoc,
  atomicRecordTransactionFirestore,
  upsertGameCatalogFirestore,
  deleteGameCatalogFirestore,
  signOutFirebase,
} from '../lib/firebase';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'livexwin_current_user_id',
  USERS: 'livexwin_users_db',
  TRANSACTIONS: 'livexwin_transactions_db',
  BET_RECORDS: 'livexwin_bets_db',
  PROVIDER_CONFIGS: 'livexwin_providers_db',
  SITE_SETTINGS: 'livexwin_settings_db',
  SITE_ASSETS: 'livexwin_assets_db',
  GAME_CATALOG_OVERRIDE: 'livexwin_games_db',
};

export function maskAccountNumber(acc: string): string {
  if (!acc) return '';
  const trimmed = acc.trim();
  if (trimmed.length <= 4) return trimmed;
  const prefix = trimmed.slice(0, 3);
  const suffix = trimmed.slice(-3);
  return `${prefix}*****${suffix}`;
}

// Initial default user matching live casino player
const DEFAULT_USER: UserProfile = {
  id: 'usr_t1206248521',
  username: 't1206248521',
  nickname: 't1206248521',
  phone: '01712062485',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  vipLevel: 1,
  vipPoints: 0,
  joinedDate: '2026-11-06',
  wallet: {
    balance: 500.00,
    frozenBalance: 0.00,
    currency: 'BDT',
  },
  boundWallets: [
    {
      id: 'bw_1',
      type: 'nagad',
      accountName: 'Sakib Hasan',
      accountNumber: '01712062485',
      addedAt: '2026-11-06 14:20',
    }
  ],
  trxPasswordSet: true,
  trxPassword: '123456',
  loginPassword: '123456',
  role: 'player',
  status: 'active',
  dailyCheckinClaimed: false,
  consecutiveDays: 1,
  goldenEggsLeft: 3,
  redPacketsClaimed: 0,
};

const DEFAULT_ADMIN: UserProfile = {
  id: 'usr_admin',
  username: 'admin',
  nickname: 'Super Manager',
  phone: '01888888888',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  vipLevel: 10,
  vipPoints: 99999,
  joinedDate: '2026-01-01',
  wallet: {
    balance: 9999999.00,
    frozenBalance: 0.00,
    currency: 'BDT',
  },
  boundWallets: [],
  trxPasswordSet: true,
  trxPassword: 'admin',
  loginPassword: 'admin123',
  role: 'admin',
  status: 'active',
  dailyCheckinClaimed: true,
  consecutiveDays: 30,
  goldenEggsLeft: 99,
  redPacketsClaimed: 17,
};

export interface FeedbackItem {
  id: string;
  userId: string;
  username: string;
  category: string;
  message: string;
  contact?: string;
  createdAt: string;
}

export interface MailMessage {
  id: string;
  title: string;
  sender: string;
  summary: string;
  content: string;
  date: string;
  read: boolean;
  rewardAmount?: number;
  rewardClaimed?: boolean;
}

const DEFAULT_PROVIDERS: ProviderConfig[] = [
  {
    id: 'prov_jili',
    name: 'Jili',
    displayName: 'JILI Games',
    logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=80',
    showType: 'both',
    apiUrl: 'https://api.jiligames.com/api1/auth',
    merchantCode: 'LIVEXWIN_BD_01',
    secretKey: 'jl_sec_993847291048591823',
    agentCode: 'AG_LIVEXWIN',
    currency: 'BDT',
    callbackUrl: 'https://livexwin.com/api/games/callback/jili',
    status: 'active',
    lastPingMs: 38,
  },
  {
    id: 'prov_pg',
    name: 'Pocket Games Soft',
    displayName: 'PG Soft',
    logoUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80',
    showType: 'both',
    apiUrl: 'https://api.pgsoft.com/v2/Game',
    merchantCode: 'PG_LIVEXWIN_PRO',
    secretKey: 'pg_sec_283918204918293841',
    agentCode: 'PG_BD_AGENT',
    currency: 'BDT',
    callbackUrl: 'https://livexwin.com/api/games/callback/pgsoft',
    status: 'active',
    lastPingMs: 32,
  },
  {
    id: 'prov_pp',
    name: 'Pragmatic Play',
    displayName: 'Pragmatic Play',
    logoUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=200&auto=format&fit=crop&q=80',
    showType: 'both',
    apiUrl: 'https://api.pragmaticplay.net/gs2c/CasinoService.do',
    merchantCode: 'PP_LIVEXWIN_LIVE',
    secretKey: 'pp_sec_581920394810293849',
    agentCode: 'PP_CASINO_HUB',
    currency: 'BDT',
    callbackUrl: 'https://livexwin.com/api/games/callback/pragmatic',
    status: 'active',
    lastPingMs: 44,
  },
  {
    id: 'prov_jdb',
    name: 'JDB',
    displayName: 'JDB Gaming',
    logoUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
    showType: 'both',
    apiUrl: 'https://api.jdbgaming.com/v1/auth',
    merchantCode: 'JDB_LIVEXWIN',
    secretKey: 'jdb_sec_772819283749102938',
    agentCode: 'JDB_BD_99',
    currency: 'BDT',
    callbackUrl: 'https://livexwin.com/api/games/callback/jdb',
    status: 'active',
    lastPingMs: 40,
  },
  {
    id: 'prov_fc',
    name: 'FA CHAI Gaming',
    displayName: 'FA CHAI',
    logoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80',
    showType: 'both',
    apiUrl: 'https://api.fachai.com/game/launch',
    merchantCode: 'FC_LIVEXWIN',
    secretKey: 'fc_sec_661928374910293847',
    agentCode: 'FC_ASIA_AGENT',
    currency: 'BDT',
    callbackUrl: 'https://livexwin.com/api/games/callback/fachai',
    status: 'active',
    lastPingMs: 46,
  },
  {
    id: 'prov_micro',
    name: 'Microgaming',
    displayName: 'Microgaming',
    logoUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=200&auto=format&fit=crop&q=80',
    showType: 'both',
    apiUrl: 'https://api.microgaming.com/launch/flyx',
    merchantCode: 'MG_LIVEXWIN',
    secretKey: 'mg_sec_102938475610293847',
    agentCode: 'MG_BD_HUB',
    currency: 'BDT',
    callbackUrl: 'https://livexwin.com/api/games/callback/microgaming',
    status: 'active',
    lastPingMs: 55,
  },
  {
    id: 'prov_spade',
    name: 'Spadegaming',
    displayName: 'Spadegaming',
    logoUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80',
    showType: 'both',
    apiUrl: 'https://api.spadegaming.com/v1/auth',
    merchantCode: 'SG_LIVEXWIN',
    secretKey: 'sg_sec_884918293049182938',
    agentCode: 'SG_AGENT_01',
    currency: 'BDT',
    callbackUrl: 'https://livexwin.com/api/games/callback/spadegaming',
    status: 'active',
    lastPingMs: 41,
  },
  {
    id: 'prov_cq9',
    name: 'CQ9',
    displayName: 'CQ9 Gaming',
    logoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&auto=format&fit=crop&q=80',
    showType: 'both',
    apiUrl: 'https://api.cq9gaming.com/auth',
    merchantCode: 'CQ9_LIVEXWIN',
    secretKey: 'cq9_sec_994829103948291029',
    agentCode: 'CQ9_ASIA',
    currency: 'BDT',
    callbackUrl: 'https://livexwin.com/api/games/callback/cq9',
    status: 'active',
    lastPingMs: 49,
  },
  {
    id: 'prov_joker',
    name: 'Joker',
    displayName: 'Joker Gaming',
    logoUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80',
    showType: 'both',
    apiUrl: 'https://api.jokergaming.com/v1/launch',
    merchantCode: 'JKR_LIVEXWIN',
    secretKey: 'jkr_sec_339182940192839481',
    agentCode: 'JKR_BD_PRO',
    currency: 'BDT',
    callbackUrl: 'https://livexwin.com/api/games/callback/joker',
    status: 'active',
    lastPingMs: 47,
  },
  {
    id: 'prov_bng',
    name: 'BNG',
    displayName: 'Booongo (BNG)',
    logoUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
    showType: 'both',
    apiUrl: 'https://api.bnggames.com/v1/auth',
    merchantCode: 'BNG_LIVEXWIN',
    secretKey: 'bng_sec_449182940192839482',
    agentCode: 'BNG_BD_HUB',
    currency: 'BDT',
    callbackUrl: 'https://livexwin.com/api/games/callback/bng',
    status: 'active',
    lastPingMs: 50,
  },
  {
    id: 'prov_megawin',
    name: 'Mega Win',
    displayName: 'Mega Win',
    logoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80',
    showType: 'both',
    apiUrl: 'https://api.megawin.com/v1/auth',
    merchantCode: 'MW_LIVEXWIN',
    secretKey: 'mw_sec_229182940192839483',
    agentCode: 'MW_BD',
    currency: 'BDT',
    callbackUrl: 'https://livexwin.com/api/games/callback/megawin',
    status: 'active',
    lastPingMs: 52,
  },
  {
    id: 'prov_baison',
    name: 'Baison Poker',
    displayName: 'Baison Poker',
    logoUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=200&auto=format&fit=crop&q=80',
    showType: 'both',
    apiUrl: 'https://api.baisonpoker.com/v1/auth',
    merchantCode: 'BP_LIVEXWIN',
    secretKey: 'bp_sec_119182940192839484',
    agentCode: 'BP_CARD_HUB',
    currency: 'BDT',
    callbackUrl: 'https://livexwin.com/api/games/callback/baison',
    status: 'active',
    lastPingMs: 54,
  },
  {
    id: 'prov_kings',
    name: 'Kings Poker',
    displayName: 'Kings Poker',
    logoUrl: 'https://images.unsplash.com/photo-1541278107931-e006523892df?w=200&auto=format&fit=crop&q=80',
    showType: 'both',
    apiUrl: 'https://api.kingspoker.com/v1/auth',
    merchantCode: 'KP_LIVEXWIN',
    secretKey: 'kp_sec_559182940192839485',
    agentCode: 'KP_VIP_HUB',
    currency: 'BDT',
    callbackUrl: 'https://livexwin.com/api/games/callback/kings',
    status: 'active',
    lastPingMs: 48,
  },
  {
    id: 'prov_fastspin',
    name: 'Fastspin',
    displayName: 'FastSpin',
    logoUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=200&auto=format&fit=crop&q=80',
    showType: 'both',
    apiUrl: 'https://api.fastspin.com/v1/auth',
    merchantCode: 'FS_LIVEXWIN',
    secretKey: 'fs_sec_669182940192839486',
    agentCode: 'FS_HUB',
    currency: 'BDT',
    callbackUrl: 'https://livexwin.com/api/games/callback/fastspin',
    status: 'active',
    lastPingMs: 43,
  },
];

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'LivexWin',
  siteUrl: 'https://livexwin.com',
  brandTagline: 'Bangladesh Premier Online Casino & Entertainment Platform',
  minDeposit: 100,
  maxDeposit: 50000,
  minWithdraw: 100,
  maxWithdraw: 25000,
  dailyWithdrawLimit: 99,
  telegramLink: 'https://t.me/livexwin_official',
  whatsappLink: 'https://wa.me/8801700000000',
  liveChatActive: true,
  maintenanceMode: false,
  announcementText: '❤️ নতুন ইউজার: রেজিস্ট্রেশন রিওয়ার্ড সর্বোচ্চ ৳৬০+৳৮,৮৮৮ (APP রিওয়ার্ড)। ফ্রি লগইন রিওয়ার্ড সর্বোচ্চ ৳৯,৯৯৯। প্রথম রিচার্জে +১৮০% রিওয়ার্ড। প্রতিদিনের প্রথম রিচার্জে +১০% রিওয়ার্ড। প্রতিটি রিচার্জে রিওয়ার্ড পান, সর্বোচ্চ ৳২,৮৮৮ পর্যন্ত। একজন বন্ধুকে আমন্ত্রণ করলে সর্বোচ্চ ৳২,৮৯৯ রিওয়ার্ড পান।',
  firstDepositBonusPercent: 180,
  // Admin Promotion Controls
  goldenEggMaxDisplay: 99999,
  goldenEggTier1: 9,
  goldenEggTier2: 99,
  goldenEggTier3: 199,
  wheelCountdownTimer: '23:06:31',
  wheelTier1: 8,
  wheelTier2: 88,
  wheelTier3: 1888,
  redPacketDailyLimit: 17,
  rescueFundPercentage: 10,
  rescueFundDailyMax: 500,
  softAggregatorApiLogin: 'DEMO_LIVEXWIN_LOGIN',
  softAggregatorApiPassword: 'DEMO_LIVEXWIN_PASS',
  softAggregatorSaltKey: 'LXW_SALT_KEY_88273619',
  softAggregatorCallbackUrl: typeof window !== 'undefined' ? `${window.location.origin}/api/softaggregator/callback` : 'https://livexwin.com/api/softaggregator/callback',
  softAggregatorCurrency: 'BDT',
  softAggregatorCountry: 'BD',
};

export const DEFAULT_SITE_ASSETS: SiteAssets = {
  siteLogoUrl: '',
  siteFaviconUrl: '',
  appLogoUrl: '',
  appQrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://livexwin.com/app',
  androidBadgeUrl: '',
  iosBadgeUrl: '',
  footerProvidersImageUrl: '/assets/aistudio/providers_transparent.png',
  paymentMethods: [
    {
      id: 'nagad',
      name: 'NAGAD',
      nameBn: 'নগদ',
      logoUrl: '/assets/aistudio/nagad_nobg.png',
      enabled: true,
      color: 'orange',
    },
    {
      id: 'bkash',
      name: 'bKash',
      nameBn: 'বিকাশ',
      logoUrl: '/assets/aistudio/bkash_card.png',
      enabled: true,
      color: 'pink',
    },
    {
      id: 'rocket',
      name: 'ROCKET',
      nameBn: 'রকেট',
      logoUrl: '/assets/aistudio/rocket_nobg.png',
      enabled: true,
      color: 'purple',
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      nameBn: 'ব্যাংক ট্রান্সফার',
      logoUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=120&auto=format&fit=crop&q=80',
      enabled: true,
      color: 'blue',
    },
    {
      id: 'upay',
      name: 'Upay',
      nameBn: 'উপায়',
      logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80',
      enabled: true,
      color: 'yellow',
    },
  ],
  banners: [
    {
      id: 1,
      badge: 'দৈনিক ডিপোজিট বোনাস',
      badgeColor: 'from-amber-500 to-red-600',
      title1: 'প্রতিটি জমায়',
      title2: 'প্রতিবার পুরস্কার পান',
      amount: 'সর্বোচ্চ ৩,৮৮৮ ৳',
      btnText: 'এখনই ডিপোজিট করুন',
      action: 'deposit',
      bgImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1000&auto=format&fit=crop&q=85',
      gradientOverlay: 'from-[#2e0306]/90 via-[#1f0204]/75 to-transparent',
    },
    {
      id: 2,
      badge: 'লাকি গোল্ডেন এগ',
      badgeColor: 'from-yellow-400 to-amber-600',
      title1: 'প্রতিদিন গোল্ডেন এগ ভাঙুন',
      title2: 'মেগা ক্যাশ জ্যাকপট জিতুন',
      amount: 'সর্বোচ্চ ৭৭৭,৭৭৭ ৳',
      btnText: 'এগ ভাঙুন ও জিতুন',
      action: 'egg',
      bgImage: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=1000&auto=format&fit=crop&q=85',
      gradientOverlay: 'from-[#381e02]/90 via-[#261301]/75 to-transparent',
    },
    {
      id: 3,
      badge: '১৭টি রেড প্যাকেট উৎসব',
      badgeColor: 'from-red-600 to-rose-700',
      title1: 'প্রতিদিন জমা করুন',
      title2: 'আনলক করুন প্রতিদিন',
      amount: '১৭টি রেড প্যাকেট বোনাস',
      btnText: 'প্যাকেট খুলুন',
      action: 'redpacket',
      bgImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=85',
      gradientOverlay: 'from-[#3a0408]/90 via-[#240103]/75 to-transparent',
    },
    {
      id: 4,
      badge: 'মেগা লাকি ড্র ২০২৬',
      badgeColor: 'from-purple-600 to-pink-600',
      title1: 'IPHONE 18 PRO MAX',
      title2: 'দৈনিক স্পেশাল টাস্ক ও লাকি ড্র',
      amount: '১০০% নিশ্চিত উইন',
      btnText: 'অংশ নিন এখনই',
      action: 'deposit',
      bgImage: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=1000&auto=format&fit=crop&q=85',
      gradientOverlay: 'from-[#210538]/90 via-[#140224]/75 to-transparent',
    },
    {
      id: 5,
      badge: 'নতুন সদস্য ওয়েলকাম অফার',
      badgeColor: 'from-emerald-600 to-teal-700',
      title1: 'নতুন সদস্য স্বাগতম বোনাস',
      title2: '১ম জমার উপর দ্বিগুণ ক্যাশ',
      amount: '১০০% ক্যাশব্যাক + ৳৬০ ফ্রি',
      btnText: 'বোনাস দাবি করুন',
      action: 'deposit',
      bgImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1000&auto=format&fit=crop&q=85',
      gradientOverlay: 'from-[#03241c]/90 via-[#01140f]/75 to-transparent',
    },
    {
      id: 6,
      badge: 'JILI & PG স্লট টুর্নামেন্ট',
      badgeColor: 'from-amber-600 to-yellow-600',
      title1: 'সুপার এস ও ফরচুন জেমস',
      title2: 'মেগা জ্যাকপট পুল উন্মুক্ত',
      amount: '৳ ২,৫০,০০,০০০ পুল',
      btnText: 'স্লট খেলুন এখনই',
      action: 'deposit',
      bgImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=85',
      gradientOverlay: 'from-[#2b0c03]/90 via-[#1a0601]/75 to-transparent',
    },
  ],
  categories: [
    {
      id: 'hot',
      titleBn: 'গরম খেলা',
      subBn: 'প্রতিদিন নতুন স্লট',
      image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=200&auto=format&fit=crop&q=80',
      iconBg: 'from-orange-600 to-red-800',
    },
    {
      id: 'slots',
      titleBn: 'স্লট খেলা',
      subBn: 'মেগা জ্যাকপট স্লট',
      image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=80',
      iconBg: 'from-amber-600 to-yellow-800',
    },
    {
      id: 'fishing',
      titleBn: 'মাছ ধরা খেলা',
      subBn: 'আর্কেড ফিশিং মেশিন',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&auto=format&fit=crop&q=80',
      iconBg: 'from-cyan-600 to-blue-800',
    },
    {
      id: 'live',
      titleBn: 'লাইভ ক্যাসিনো',
      subBn: 'লাইভ ভিডিও ডিলার',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80',
      iconBg: 'from-purple-600 to-pink-800',
    },
    {
      id: 'sports',
      titleBn: 'খেলাধুলা',
      subBn: 'লাইভ ক্রিকেট বাজি',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=200&auto=format&fit=crop&q=80',
      iconBg: 'from-emerald-600 to-teal-800',
    },
    {
      id: 'poker',
      titleBn: 'পোকার খেলা',
      subBn: 'তিন পত্তি ও অন্দর বাহার',
      image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=200&auto=format&fit=crop&q=80',
      iconBg: 'from-rose-600 to-red-900',
    },
    {
      id: 'lottery',
      titleBn: 'লটারি খেলা',
      subBn: 'স্পিড ড্র ২৪/৭',
      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200&auto=format&fit=crop&q=80',
      iconBg: 'from-blue-600 to-indigo-900',
    },
  ],
};

class StorageService {
  private users: UserProfile[] = [];
  private currentUserId: string = '';
  private transactions: Transaction[] = [];
  private betRecords: BetRecord[] = [];
  private providers: ProviderConfig[] = [];
  private siteSettings: SiteSettings = DEFAULT_SETTINGS;
  private siteAssets: SiteAssets = DEFAULT_SITE_ASSETS;
  private games: GameItem[] = GAME_CATALOG;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.users = [DEFAULT_USER, DEFAULT_ADMIN];
        this.saveUsers();
      }

      const storedCurrent = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (storedCurrent && storedCurrent !== 'LOGGED_OUT' && this.users.find(u => u.id === storedCurrent)) {
        this.currentUserId = storedCurrent;
      } else {
        this.currentUserId = '';
      }

      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (storedTx) {
        this.transactions = JSON.parse(storedTx);
      } else {
        // Sample initial transactions for default player usr_t1206248521
        this.transactions = [
          {
            id: 'TXN-9827361',
            userId: 'usr_t1206248521',
            username: 't1206248521',
            type: 'deposit',
            amount: 500,
            balanceAfter: 500,
            status: 'completed',
            method: 'nagad',
            channel: 'TKPAYBDT',
            accountNumber: '01712062485',
            trxId: '9G7A4K19X',
            createdAt: '2026-11-06 14:30',
          },
          {
            id: 'TXN-9827362',
            userId: 'usr_t1206248521',
            username: 't1206248521',
            type: 'bonus',
            amount: 60,
            balanceAfter: 60,
            status: 'completed',
            note: 'রেজিস্ট্রেশন রিওয়ার্ড বোনাস',
            createdAt: '2026-11-06 14:21',
          }
        ];
        this.saveTransactions();
      }

      const storedBets = localStorage.getItem(STORAGE_KEYS.BET_RECORDS);
      if (storedBets) {
        this.betRecords = JSON.parse(storedBets);
      }

      const storedProviders = localStorage.getItem(STORAGE_KEYS.PROVIDER_CONFIGS);
      if (storedProviders) {
        try {
          const parsed = JSON.parse(storedProviders) as ProviderConfig[];
          // Merge to ensure all default providers and logoUrls are present
          const merged = [...DEFAULT_PROVIDERS];
          parsed.forEach(p => {
            const idx = merged.findIndex(m => m.id === p.id || m.name === p.name);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...p };
            } else {
              merged.push(p);
            }
          });
          this.providers = merged;
        } catch {
          this.providers = DEFAULT_PROVIDERS;
        }
      } else {
        this.providers = DEFAULT_PROVIDERS;
        this.saveProviders();
      }

      const storedSettings = localStorage.getItem(STORAGE_KEYS.SITE_SETTINGS);
      if (storedSettings) {
        this.siteSettings = JSON.parse(storedSettings);
      } else {
        this.siteSettings = DEFAULT_SETTINGS;
        this.saveSettings();
      }

      const storedAssets = localStorage.getItem(STORAGE_KEYS.SITE_ASSETS);
      if (storedAssets) {
        try {
          const parsed = JSON.parse(storedAssets) as SiteAssets;
          this.siteAssets = {
            ...DEFAULT_SITE_ASSETS,
            ...parsed,
            paymentMethods: parsed.paymentMethods || DEFAULT_SITE_ASSETS.paymentMethods,
            banners: parsed.banners || DEFAULT_SITE_ASSETS.banners,
            categories: parsed.categories || DEFAULT_SITE_ASSETS.categories,
          };
        } catch {
          this.siteAssets = DEFAULT_SITE_ASSETS;
        }
      } else {
        this.siteAssets = DEFAULT_SITE_ASSETS;
        this.saveAssets();
      }

      const storedGames = localStorage.getItem(STORAGE_KEYS.GAME_CATALOG_OVERRIDE);
      if (storedGames) {
        try {
          const parsedGames = JSON.parse(storedGames) as GameItem[];
          const mergedGames = [...GAME_CATALOG];
          parsedGames.forEach(pg => {
            const idx = mergedGames.findIndex(m => m.id === pg.id);
            if (idx >= 0) {
              mergedGames[idx] = { ...mergedGames[idx], ...pg };
            } else {
              mergedGames.push(pg);
            }
          });
          this.games = mergedGames;
        } catch {
          this.games = GAME_CATALOG;
        }
      } else {
        this.games = GAME_CATALOG;
        this.saveGames();
      }
    } catch {
      this.users = [DEFAULT_USER, DEFAULT_ADMIN];
      this.currentUserId = '';
      this.providers = DEFAULT_PROVIDERS;
      this.siteSettings = DEFAULT_SETTINGS;
      this.siteAssets = DEFAULT_SITE_ASSETS;
      this.games = GAME_CATALOG;
    }
  }

  private saveUsers() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
  }

  private saveTransactions() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
  }

  private saveBets() {
    localStorage.setItem(STORAGE_KEYS.BET_RECORDS, JSON.stringify(this.betRecords));
  }

  private saveProviders() {
    localStorage.setItem(STORAGE_KEYS.PROVIDER_CONFIGS, JSON.stringify(this.providers));
  }

  private saveSettings() {
    localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(this.siteSettings));
  }

  private saveGames() {
    localStorage.setItem(STORAGE_KEYS.GAME_CATALOG_OVERRIDE, JSON.stringify(this.games));
  }

  // --- Auth & Users ---
  getCurrentUser(): UserProfile | null {
    if (!this.currentUserId || this.currentUserId === 'LOGGED_OUT') {
      return null;
    }
    const user = this.users.find(u => u.id === this.currentUserId);
    return user || null;
  }

  setCurrentUser(userId: string) {
    this.currentUserId = userId;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  logout(): void {
    this.currentUserId = '';
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'LOGGED_OUT');
    void signOutFirebase();
  }

  getAllUsers(): UserProfile[] {
    return [...this.users];
  }

  registerUser(username: string, phone: string, pass: string, _inviteCode?: string): { success: boolean; message: string; user?: UserProfile } {
    const cleanUser = username.trim().toLowerCase();
    const cleanPhone = phone.trim();
    if (this.users.some(u => u.username.toLowerCase() === cleanUser || u.phone === cleanPhone)) {
      return { success: false, message: 'ইউজারনেম বা মোবাইল নম্বর ইতিমধ্যে ব্যবহৃত হয়েছে।' };
    }

    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      username: cleanUser,
      nickname: username.trim(),
      phone: cleanPhone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      vipLevel: 0,
      vipPoints: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      wallet: {
        balance: 60.00, // free registration bonus!
        frozenBalance: 0.00,
        currency: 'BDT',
      },
      boundWallets: [],
      trxPasswordSet: false,
      loginPassword: pass.trim(),
      role: 'player',
      status: 'active',
      dailyCheckinClaimed: false,
      consecutiveDays: 1,
      goldenEggsLeft: 3,
      redPacketsClaimed: 0,
    };

    this.users.push(newUser);
    this.saveUsers();
    this.setCurrentUser(newUser.id);

    // Record registration bonus transaction
    this.addTransaction({
      type: 'bonus',
      amount: 60,
      status: 'completed',
      note: 'নতুন ইউজার রেজিস্ট্রেশন রিওয়ার্ড ৳৬০',
    });

    return { success: true, message: 'সফলভাবে রেজিস্ট্রেশন সম্পন্ন হয়েছে! ৳৬০ বোনাস যোগ হয়েছে।', user: newUser };
  }

  login(usernameOrPhone: string, pass: string): { success: boolean; message: string; user?: UserProfile } {
    const term = usernameOrPhone.trim().toLowerCase();
    const user = this.users.find(u => u.username.toLowerCase() === term || u.phone.trim() === term);
    if (!user) {
      return { success: false, message: 'ইউজারনেম বা মোবাইল নম্বর খুঁজে পাওয়া যায়নি।' };
    }
    if (user.status === 'banned') {
      return { success: false, message: 'আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত রয়েছে। কাস্টমার সার্ভিসে যোগাযোগ করুন।' };
    }
    if (user.loginPassword && user.loginPassword !== pass.trim()) {
      return { success: false, message: 'পাসওয়ার্ড সঠিক নয়! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।' };
    }
    this.setCurrentUser(user.id);
    return { success: true, message: 'লগইন সফল হয়েছে!', user };
  }

  loginWithGoogle(email: string, name?: string, avatar?: string, firebaseUid?: string): { success: boolean; message: string; user: UserProfile } {
    const isSuperAdminEmail = email.toLowerCase() === 'sakibhasanu3@gmail.com';
    let user = this.users.find(
      u =>
        (firebaseUid && u.id === firebaseUid) ||
        u.phone === email ||
        u.username === email ||
        (isSuperAdminEmail && u.role === 'admin')
    );
    if (!user) {
      const cleanUsername = (email.split('@')[0] || 'google_user').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase().slice(0, 10);
      const uniqueName = cleanUsername + Math.floor(100 + Math.random() * 900);
      user = {
        id: firebaseUid || 'usr_g_' + Date.now(),
        username: uniqueName,
        nickname: name || cleanUsername,
        phone: '017' + Math.floor(10000000 + Math.random() * 90000000),
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        vipLevel: 1,
        vipPoints: 0,
        joinedDate: new Date().toISOString().split('T')[0],
        wallet: { balance: 200, frozenBalance: 0, currency: 'BDT' },
        boundWallets: [],
        trxPasswordSet: true,
        trxPassword: '123456',
        role: isSuperAdminEmail ? 'admin' : 'player',
        status: 'active',
        dailyCheckinClaimed: false,
        consecutiveDays: 1,
        goldenEggsLeft: 3,
        redPacketsClaimed: 0,
      };
      this.users.push(user);
      this.saveUsers();
    }
    this.setCurrentUser(user.id);
    void ensureFirestoreUserDoc(user);
    return { success: true, message: `স্বাগতম ${user.nickname}! গুগল অ্যাকাউন্টে সফলভাবে সাইন ইন হয়েছে।`, user };
  }

  updateProfile(updates: Partial<UserProfile>): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    Object.assign(user, updates);
    this.saveUsers();
    return true;
  }

  // --- Wallet Operations ---
  updateBalance(amountDelta: number): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.wallet.balance + amountDelta < 0) {
      return false;
    }
    user.wallet.balance = Number((user.wallet.balance + amountDelta).toFixed(2));
    this.saveUsers();
    return true;
  }

  submitDeposit(amount: number, method: 'nagad' | 'bkash' | 'rocket', channel: 'TKPAYBDT' | 'BD99PAYBDT' | 'GOLDPAYBDT' | 'AIPAYBD', trxId: string, senderPhone: string): { success: boolean; message: string; transaction: Transaction } {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'ইউজার লগইন নেই', transaction: null as unknown as Transaction };

    const txn: Transaction = {
      id: 'DP-' + Math.floor(1000000 + Math.random() * 9000000),
      type: 'deposit',
      amount,
      status: 'approved', // Auto approved for ultra smooth demo or can be reviewed by admin
      method,
      channel,
      accountNumber: senderPhone,
      trxId: trxId.toUpperCase(),
      note: `${method.toUpperCase()} ডিপোজিট (${channel})`,
      createdAt: new Date().toLocaleString('en-GB'),
    };

    // Credit balance atomically
    user.wallet.balance = Number((user.wallet.balance + amount).toFixed(2));
    user.vipPoints += Math.floor(amount / 10);
    if (user.vipPoints >= 500 && user.vipLevel < 1) user.vipLevel = 1;
    if (user.vipPoints >= 2000 && user.vipLevel < 2) user.vipLevel = 2;
    if (user.vipPoints >= 10000 && user.vipLevel < 3) user.vipLevel = 3;

    const enrichedTxn: Transaction = {
      ...txn,
      userId: user.id,
      username: user.username,
      balanceAfter: user.wallet.balance,
    };

    this.transactions.unshift(enrichedTxn);
    this.saveUsers();
    this.saveTransactions();
    void atomicRecordTransactionFirestore(amount, enrichedTxn);

    return { success: true, message: `৳ ${amount.toLocaleString()} সফলভাবে জমা হয়েছে!`, transaction: enrichedTxn };
  }

  submitWithdraw(amount: number, method: 'nagad' | 'bkash', accountNumber: string, trxPass: string): { success: boolean; message: string } {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'ইউজার লগইন নেই' };

    // Withdrawal Password Verification
    if (!user.trxPasswordSet || !user.trxPassword) {
      return { success: false, message: 'উত্তোলন করার পূর্বে দয়া করে সদস্য কেন্দ্র -> নিরাপত্তা থেকে আপনার ৬ সংখ্যার উত্তোলন পাসওয়ার্ড সেট করুন।' };
    }

    if (!trxPass || trxPass.trim() !== user.trxPassword.trim()) {
      return { success: false, message: 'ভুল উত্তোলন পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।' };
    }

    if (!accountNumber) {
      return { success: false, message: 'দয়া করে উত্তোলন করার জন্য আমার কার্ড থেকে একটি নম্বর নির্বাচন করুন।' };
    }

    if (amount < this.siteSettings.minWithdraw || amount > this.siteSettings.maxWithdraw) {
      return { success: false, message: `উত্তোলনের পরিমাণ ৳ ${this.siteSettings.minWithdraw} থেকে ৳ ${this.siteSettings.maxWithdraw} এর মধ্যে হতে হবে।` };
    }

    if (user.wallet.balance < amount) {
      return { success: false, message: 'ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।' };
    }

    // Deduct immediately & mark as pending approval in Admin Control Panel
    user.wallet.balance = Number((user.wallet.balance - amount).toFixed(2));
    this.saveUsers();

    const txn: Transaction = {
      id: 'WD-' + Math.floor(1000000 + Math.random() * 9000000),
      userId: user.id,
      username: user.username,
      type: 'withdraw',
      amount,
      balanceAfter: user.wallet.balance,
      status: 'pending', // Pending admin approval
      method,
      accountNumber,
      note: `${method.toUpperCase()} নম্বর: ${accountNumber}`,
      createdAt: new Date().toLocaleString('en-GB'),
    };

    this.transactions.unshift(txn);
    this.saveTransactions();
    void atomicRecordTransactionFirestore(-amount, txn);

    return { success: true, message: `উত্তোলন অনুরোধ গৃহীত হয়েছে! অ্যাডমিন অনুমোদনের পর অর্থ আপনার নম্বরে পৌঁছাবে।` };
  }

  recordGameBet(gameId: string, gameName: string, provider: any, betAmount: number, payoutAmount: number, multiplier: number): BetRecord {
    const user = this.getCurrentUser();
    const profit = Number((payoutAmount - betAmount).toFixed(2));
    const record: BetRecord = {
      id: 'BET-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userId: user?.id,
      username: user?.username,
      gameId,
      gameName,
      provider,
      betAmount,
      payoutAmount,
      profit,
      multiplier,
      createdAt: new Date().toLocaleString('en-GB'),
    };
    this.betRecords.unshift(record);
    if (this.betRecords.length > 200) this.betRecords.pop();
    this.saveBets();

    // Also record game bet/win transaction in player's transaction history
    if (user && (betAmount > 0 || payoutAmount > 0)) {
      const txType: Transaction['type'] = profit >= 0 ? 'win' : 'bet';
      const txAmount = Math.abs(profit) > 0 ? Math.abs(profit) : betAmount;
      const gameTxn: Transaction = {
        id: 'GM-' + Math.floor(1000000 + Math.random() * 9000000),
        userId: user.id,
        username: user.username,
        type: txType,
        amount: Number(txAmount.toFixed(2)),
        balanceAfter: user.wallet.balance,
        status: 'completed',
        method: String(provider),
        note:
          profit >= 0
            ? `${gameName} (${provider}) গেমে জয় +৳${profit.toFixed(2)} (${multiplier}x)`
            : `${gameName} (${provider}) গেমে বেট -৳${betAmount.toFixed(2)}`,
        createdAt: new Date().toLocaleString('en-GB'),
      };
      this.transactions.unshift(gameTxn);
      this.saveTransactions();
      void atomicRecordTransactionFirestore(profit, gameTxn);
    }

    return record;
  }

  claimDailyCheckin(): { success: boolean; amount: number; message: string } {
    const user = this.getCurrentUser();
    if (!user) return { success: false, amount: 0, message: 'ইউজার লগইন নেই' };
    if (user.dailyCheckinClaimed) {
      return { success: false, amount: 0, message: 'আজকের চেক-ইন বোনাস ইতিমধ্যে গ্রহণ করা হয়েছে।' };
    }
    const reward = Math.floor(18 + Math.random() * 50);
    user.wallet.balance = Number((user.wallet.balance + reward).toFixed(2));
    user.dailyCheckinClaimed = true;
    user.consecutiveDays += 1;
    this.saveUsers();

    this.addTransaction({
      type: 'bonus',
      amount: reward,
      status: 'completed',
      note: `দৈনিক চেক-ইন রিওয়ার্ড (দিন ${user.consecutiveDays})`,
    });

    return { success: true, amount: reward, message: `অভিনন্দন! আপনি ৳${reward} দৈনিক সাইন-ইন রিওয়ার্ড পেয়েছেন!` };
  }

  /**
   * Golden Egg Crack:
   * Max display in UI: 99,999 ৳
   * Rewards pool strictly: ৳ 9, ৳ 99, ৳ 199 based on user level
   * Level 1-4: ৳ 9
   * Level 5-10: ৳ 99
   * Level 11+: ৳ 199
   */
  crackGoldenEgg(): { success: boolean; amount: number; message: string } {
    const user = this.getCurrentUser();
    if (!user) return { success: false, amount: 0, message: 'ইউজার লগইন নেই' };
    if (user.goldenEggsLeft <= 0) {
      return { success: false, amount: 0, message: 'আজকের জন্য কোনো গোল্ডেন এগ অবশিষ্ট নেই।' };
    }

    const vip = user.vipLevel || 1;
    let amount = this.siteSettings.goldenEggTier1 || 9;
    if (vip >= 1 && vip <= 4) {
      amount = this.siteSettings.goldenEggTier1 || 9;
    } else if (vip >= 5 && vip <= 10) {
      amount = this.siteSettings.goldenEggTier2 || 99;
    } else {
      amount = this.siteSettings.goldenEggTier3 || 199;
    }

    user.wallet.balance = Number((user.wallet.balance + amount).toFixed(2));
    user.goldenEggsLeft -= 1;
    this.saveUsers();

    this.addTransaction({
      type: 'bonus',
      amount,
      status: 'completed',
      note: `গোল্ডেন এগ ভাঙার পুরস্কার ৳${amount} (VIP লেভেল ${vip})`,
    });

    return { success: true, amount, message: `দারুণ! গোল্ডেন এগ ভেঙে আপনি ৳${amount} পেয়েছেন!` };
  }

  claimRedPacket(): { success: boolean; amount: number; message: string } {
    const user = this.getCurrentUser();
    if (!user) return { success: false, amount: 0, message: 'ইউজার লগইন নেই' };
    if (user.redPacketsClaimed >= 17) {
      return { success: false, amount: 0, message: 'আজকের সব ১৭টি রেড প্যাকেট গ্রহণ শেষ!' };
    }
    const amount = Math.floor(10 + Math.random() * 120);
    user.wallet.balance = Number((user.wallet.balance + amount).toFixed(2));
    user.redPacketsClaimed += 1;
    this.saveUsers();

    this.addTransaction({
      type: 'bonus',
      amount,
      status: 'completed',
      note: `রেড প্যাকেট #${user.redPacketsClaimed} রিওয়ার্ড`,
    });

    return { success: true, amount, message: `রেড প্যাকেট থেকে আপনি ৳${amount} পেয়েছেন!` };
  }

  /**
   * Lucky Spin Wheel (চাকা বোনাস)
   */
  spinLuckyWheel(): { success: boolean; prize: string; amount: number; message: string } {
    const user = this.getCurrentUser();
    if (!user) return { success: false, prize: '', amount: 0, message: 'ইউজার লগইন নেই' };
    const vip = user.vipLevel || 1;
    let amount = this.siteSettings.wheelTier1 || 8;
    let prize = `৳ ${amount} ক্যাশ`;
    if (vip >= 1 && vip <= 4) {
      amount = this.siteSettings.wheelTier1 || 8;
      prize = `৳ ${amount} ক্যাশ ড্র`;
    } else if (vip >= 5 && vip <= 10) {
      amount = this.siteSettings.wheelTier2 || 88;
      prize = `৳ ${amount} লাকি ক্যাশ`;
    } else {
      amount = this.siteSettings.wheelTier3 || 1888;
      prize = `৳ ${amount.toLocaleString()} মেগা ড্র`;
    }
    user.wallet.balance = Number((user.wallet.balance + amount).toFixed(2));
    this.saveUsers();

    this.addTransaction({
      type: 'bonus',
      amount,
      status: 'completed',
      note: `লাকি স্পিন হুইল ড্র: ${prize}`,
    });

    return { success: true, prize, amount, message: `অভিনন্দন! স্পিন হুইল থেকে আপনি ${prize} জিতেছেন!` };
  }

  /**
   * Rescue Relief Fund (উদ্ধার তহবিল)
   */
  claimRescueFund(): { success: boolean; amount: number; message: string } {
    const user = this.getCurrentUser();
    if (!user) return { success: false, amount: 0, message: 'ইউজার লগইন নেই' };
    const relief = 50; // Daily emergency cashback relief
    user.wallet.balance = Number((user.wallet.balance + relief).toFixed(2));
    this.saveUsers();

    this.addTransaction({
      type: 'bonus',
      amount: relief,
      status: 'completed',
      note: 'উদ্ধার তহবিল (Rescue Cashback Relief Fund)',
    });

    return { success: true, amount: relief, message: `উদ্ধার তহবিল থেকে আপনার ওয়ালেটে ৳${relief} যোগ করা হয়েছে!` };
  }

  private addTransaction(txn: Omit<Transaction, 'id' | 'createdAt'>) {
    const user = this.getCurrentUser();
    const fullTxn: Transaction = {
      ...txn,
      id: 'TXN-' + Math.floor(1000000 + Math.random() * 9000000),
      userId: txn.userId || user?.id,
      username: txn.username || user?.username,
      balanceAfter: txn.balanceAfter ?? user?.wallet.balance,
      createdAt: new Date().toLocaleString('en-GB'),
    };
    this.transactions.unshift(fullTxn);
    this.saveTransactions();
    void atomicRecordTransactionFirestore(txn.type === 'withdraw' || txn.type === 'bet' ? -txn.amount : txn.amount, fullTxn);
  }

  // --- Transactions Query (Player-isolated by default; Admin sees all) ---
  getTransactions(includeAllForAdmin = false): Transaction[] {
    const user = this.getCurrentUser();
    if (includeAllForAdmin || user?.role === 'admin' || user?.role === 'superadmin') {
      return [...this.transactions];
    }
    if (!user) return [];
    return this.transactions.filter(
      t => t.userId === user.id || (!t.userId && user.id === 'usr_t1206248521')
    );
  }

  getBetRecords(includeAllForAdmin = false): BetRecord[] {
    const user = this.getCurrentUser();
    if (includeAllForAdmin || user?.role === 'admin' || user?.role === 'superadmin') {
      return [...this.betRecords];
    }
    if (!user) return [];
    return this.betRecords.filter(
      b => b.userId === user.id || (!b.userId && user.id === 'usr_t1206248521')
    );
  }

  // --- Admin Methods ---
  approveTransaction(id: string): boolean {
    const tx = this.transactions.find(t => t.id === id);
    if (!tx || tx.status !== 'pending') return false;
    tx.status = 'approved';
    this.saveTransactions();
    return true;
  }

  rejectTransaction(id: string, reason?: string): boolean {
    const tx = this.transactions.find(t => t.id === id);
    if (!tx || tx.status !== 'pending') return false;
    tx.status = 'rejected';
    tx.note = (tx.note || '') + (reason ? ` (বাতিল: ${reason})` : ' (বাতিল করা হয়েছে)');

    // If it was a withdrawal that got rejected, refund back to user atomically
    if (tx.type === 'withdraw') {
      const targetUser = this.users.find(u => u.id === tx.userId) || this.getCurrentUser();
      if (targetUser) {
        targetUser.wallet.balance = Number((targetUser.wallet.balance + tx.amount).toFixed(2));
        this.saveUsers();
      }
    }

    this.saveTransactions();
    return true;
  }

  adminAdjustUserBalance(userId: string, delta: number, note: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    user.wallet.balance = Math.max(0, Number((user.wallet.balance + delta).toFixed(2)));
    this.saveUsers();

    this.addTransaction({
      userId: user.id,
      username: user.username,
      balanceAfter: user.wallet.balance,
      type: delta >= 0 ? 'bonus' : 'withdraw',
      amount: Math.abs(delta),
      status: 'completed',
      note: `অ্যাডমিন ব্যালেন্স অ্যাডজাস্টমেন্ট: ${note}`,
    });
    return true;
  }

  adminSetUserStatus(userId: string, status: 'active' | 'banned'): boolean {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    user.status = status;
    this.saveUsers();
    return true;
  }

  adminSetUserVip(userId: string, vipLevel: number): boolean {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    user.vipLevel = vipLevel;
    this.saveUsers();
    return true;
  }

  // --- Game Providers & Settings ---
  getProviders(): ProviderConfig[] {
    return [...this.providers];
  }

  updateProvider(id: string, updates: Partial<ProviderConfig>): boolean {
    const prov = this.providers.find(p => p.id === id);
    if (!prov) return false;
    Object.assign(prov, updates);
    this.saveProviders();
    return true;
  }

  addProvider(prov: ProviderConfig): boolean {
    this.providers.push(prov);
    this.saveProviders();
    return true;
  }

  removeProvider(id: string): boolean {
    this.providers = this.providers.filter(p => p.id !== id);
    this.saveProviders();
    return true;
  }

  getGames(): GameItem[] {
    return [...this.games];
  }

  addGame(gameData: Omit<GameItem, 'id'> & { id?: string }): GameItem {
    const cleanId =
      (gameData.id || `${gameData.provider}-${gameData.name}`)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80) +
      '-' +
      Math.floor(100 + Math.random() * 900);

    const newGame: GameItem = {
      ...gameData,
      id: cleanId,
      demoLink:
        gameData.demoLink ||
        `/game_frame.php?gameid=${encodeURIComponent(cleanId)}&name=${encodeURIComponent(
          gameData.name
        )}&provider=${encodeURIComponent(gameData.provider)}&demo=1`,
      remoteGameCode: gameData.remoteGameCode || cleanId,
    };

    this.games.unshift(newGame);
    this.saveGames();
    void upsertGameCatalogFirestore(newGame);
    return newGame;
  }

  updateGame(id: string, updates: Partial<GameItem>): boolean {
    const game = this.games.find(g => g.id === id);
    if (!game) return false;
    Object.assign(game, updates);
    this.saveGames();
    void upsertGameCatalogFirestore(game);
    return true;
  }

  deleteGame(id: string): boolean {
    const beforeLen = this.games.length;
    this.games = this.games.filter(g => g.id !== id);
    if (this.games.length !== beforeLen) {
      this.saveGames();
      void deleteGameCatalogFirestore(id);
      return true;
    }
    return false;
  }

  cloneRemoteProviderGames(): { addedCount: number; totalCount: number } {
    const remoteExtras: GameItem[] = [
      {
        id: 'jili-golden-empire-vip',
        name: 'Golden Empire',
        bengaliName: 'গোল্ডেন এম্পায়ার',
        category: 'hot',
        provider: 'Jili',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
        demoLink: '/game_frame.php?gameid=jili/GoldenEmpire&name=Golden%20Empire&provider=Jili&demo=1',
        remoteGameCode: 'jili_golden_empire',
        rating: 5,
        multiplier: '2000X',
        isHot: true,
        rtp: 97.5,
        playableType: 'super_ace',
        minBet: 1,
        maxBet: 5000,
        active: true,
      },
      {
        id: 'pg-fortune-tiger-vip',
        name: 'Fortune Tiger',
        bengaliName: 'ফরচুন টাইগার',
        category: 'hot',
        provider: 'Pocket Games Soft',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80',
        demoLink: '/game_frame.php?gameid=pgsoft/FortuneTiger&name=Fortune%20Tiger&provider=Pocket%20Games%20Soft&demo=1',
        remoteGameCode: 'pg_fortune_tiger',
        rating: 5,
        multiplier: '2500X',
        isHot: true,
        rtp: 96.9,
        playableType: 'fortune_gems',
        minBet: 2,
        maxBet: 10000,
        active: true,
      },
      {
        id: 'pp-spaceman-crash',
        name: 'Spaceman Crash',
        bengaliName: 'স্পেসম্যান ক্র্যাশ',
        category: 'hot',
        provider: 'Pragmatic Play',
        image: 'https://images.unsplash.com/photo-1517976487507-5b3b4a450532?w=400&auto=format&fit=crop&q=80',
        demoLink: '/game_frame.php?gameid=pragmatic/Spaceman&name=Spaceman%20Crash&provider=Pragmatic%20Play&demo=1',
        remoteGameCode: 'pp_spaceman',
        rating: 5,
        multiplier: '5000X Crash',
        isHot: true,
        rtp: 97.0,
        playableType: 'flyx',
        minBet: 10,
        maxBet: 25000,
        active: true,
      },
      {
        id: 'fc-chinese-new-year-more',
        name: 'Chinese New Year Moreways',
        bengaliName: 'চাইনিজ নিউ ইয়ার মোরওয়েজ',
        category: 'slots',
        provider: 'FA CHAI Gaming',
        image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&auto=format&fit=crop&q=80',
        demoLink: '/game_frame.php?gameid=fachai/CNYMoreways&name=CNY%20Moreways&provider=FA%20CHAI%20Gaming&demo=1',
        remoteGameCode: 'fc_cny_moreways',
        rating: 4.9,
        multiplier: '16,800X',
        rtp: 96.8,
        playableType: 'super_ace',
        minBet: 1,
        maxBet: 5000,
        active: true,
      },
    ];

    let added = 0;
    const allCloneCandidates = [...GAME_CATALOG, ...remoteExtras];
    allCloneCandidates.forEach(candidate => {
      if (!this.games.some(g => g.id === candidate.id)) {
        this.games.push(candidate);
        added++;
        void upsertGameCatalogFirestore(candidate);
      }
    });
    this.saveGames();
    return { addedCount: added, totalCount: this.games.length };
  }

  // --- Bound Wallets & Cards Management ---
  bindWallet(type: 'nagad' | 'bkash' | 'rocket', accountName: string, accountNumber: string): { success: boolean; message: string } {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'ইউজার লগইন নেই' };
    if (!accountNumber || accountNumber.length < 11) {
      return { success: false, message: 'সঠিক ১১ সংখ্যার মোবাইল নাম্বার দিন।' };
    }
    if (user.boundWallets.length >= 5) {
      return { success: false, message: 'সর্বোচ্চ ৫টি ওয়ালেট অ্যাকাউন্ট যুক্ত করা সম্ভব।' };
    }
    const newWallet = {
      id: 'bw_' + Date.now(),
      type,
      accountName: accountName || user.nickname || 'ব্যবহারকারী',
      accountNumber,
      addedAt: new Date().toLocaleString('en-GB'),
    };
    user.boundWallets.push(newWallet);
    this.saveUsers();
    return { success: true, message: `${type.toUpperCase()} অ্যাকাউন্ট (${accountNumber}) সফলভাবে যুক্ত হয়েছে!` };
  }

  removeBoundWallet(id: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    user.boundWallets = user.boundWallets.filter(w => w.id !== id);
    this.saveUsers();
    return true;
  }

  // --- Security Center ---
  updateSecurity(data: { loginPassword?: string; trxPassword?: string; phone?: string }): { success: boolean; message: string } {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'ইউজার লগইন নেই' };
    if (data.loginPassword) {
      user.loginPassword = data.loginPassword;
    }
    if (data.trxPassword) {
      user.trxPassword = data.trxPassword;
      user.trxPasswordSet = true;
    }
    if (data.phone) {
      user.phone = data.phone;
    }
    this.saveUsers();
    return { success: true, message: 'নিরাপত্তা তথ্য সফলভাবে আপডেট করা হয়েছে!' };
  }

  // --- Feedback & Suggestions ---
  submitFeedback(data: { category: string; message: string; contact?: string }): { success: boolean; message: string } {
    const user = this.getCurrentUser();
    const item: FeedbackItem = {
      id: 'FB-' + Date.now(),
      userId: user?.id || 'guest',
      username: user?.username || 'ভিজিটর',
      category: data.category,
      message: data.message,
      contact: data.contact,
      createdAt: new Date().toLocaleString('en-GB'),
    };
    const stored = localStorage.getItem('livexwin_feedbacks_db');
    const list: FeedbackItem[] = stored ? JSON.parse(stored) : [];
    list.unshift(item);
    localStorage.setItem('livexwin_feedbacks_db', JSON.stringify(list));
    return { success: true, message: 'আপনার পরামর্শ সফলভাবে জমা হয়েছে! আমাদের টিম দ্রুত পর্যালোচনা করবে।' };
  }

  getFeedbackList(): FeedbackItem[] {
    const stored = localStorage.getItem('livexwin_feedbacks_db');
    return stored ? JSON.parse(stored) : [];
  }

  // --- Mailbox Messages ---
  getMailMessages(): MailMessage[] {
    const stored = localStorage.getItem('livexwin_mailbox_db');
    if (stored) return JSON.parse(stored);
    const initialMails: MailMessage[] = [
      {
        id: 'mail_1',
        title: 'স্বাগতম উপহার প্রদান',
        sender: 'LivexWin Official',
        summary: 'রেজিস্ট্রেশন রিওয়ার্ড ৳৬০ আপনার অ্যাকাউন্টে জমা হয়েছে।',
        content: 'প্রিয় গ্রাহক, LivexWin ক্যাসিনোতে আপনাকে স্বাগতম! আপনার অ্যাকাউন্টে সাইন-আপ রিওয়ার্ড বোনাস ৳৬০ ক্রেডিট করা হয়েছে। শুভকামনা!',
        date: '2026-11-06 14:21',
        read: false,
        rewardAmount: 60,
        rewardClaimed: true,
      },
      {
        id: 'mail_2',
        title: 'প্রতিদিনের ডিপোজিট বোনাস আনলক',
        sender: 'ইভেন্ট টিম',
        summary: 'যেকোনো ডিপোজিটে পান সর্বোচ্চ ৩,৮৮৮ টাকা ক্যাশব্যাক।',
        content: 'আজই বিকাশ বা নগদে রিচার্জ করে সর্বোচ্চ ৩,৮৮৮ টাকা পর্যন্ত অতিরিক্ত রিলোড বোনাস আনলক করুন। অটোমেটিক ক্যাশব্যাক চালু রয়েছে।',
        date: '2026-11-06 14:30',
        read: false,
      },
      {
        id: 'mail_3',
        title: 'লাকি গোল্ডেন এগ উৎসব',
        sender: 'ভিআইপি ক্লাব',
        summary: 'প্রতিদিন ৩টি ফ্রি সোনার ডিম ভাঙার সুযোগ!',
        content: 'গোল্ডেন এগ ভাঙুন এবং জিতে নিন সর্বোচ্চ ৭৭৭,৭৭৭ টাকা সরাসরি মেইন ব্যালেন্সে। আজই এগ খেলায় অংশ নিন।',
        date: '2026-11-06 15:00',
        read: false,
      },
      {
        id: 'mail_4',
        title: '১৭টি রেড প্যাকেট ক্যাম্পেইন',
        sender: 'প্রমোশন হাব',
        summary: 'দৈনিক রিচার্জে আনলক হচ্ছে ১৭টি রেড প্যাকেট।',
        content: 'প্রতিদিন মাত্র ৫০০ টাকা বাজি ধরে আপনি ১৭টি লাল খাম খোলার সুযোগ পাবেন। প্রতি প্যাকেটে রয়েছে ফ্রি ক্যাশ।',
        date: '2026-11-06 15:30',
        read: false,
      },
      {
        id: 'mail_5',
        title: 'নিরাপত্তা টিপস ও ট্রানজেকশন পিন',
        sender: 'সিকিউরিটি টিম',
        summary: 'আপনার ৬ সংখ্যার ক্যাশআউট পিন সবসময় গোপন রাখুন।',
        content: 'উত্তোলনের সময় সুরক্ষার স্বার্থে নিজের ট্রানজেকশন পাসওয়ার্ড কারও সাথে শেয়ার করবেন না। প্রয়োজনে সিকিউরিটি সেন্টার থেকে পিন আপডেট করুন।',
        date: '2026-11-06 16:00',
        read: true,
      },
      {
        id: 'mail_6',
        title: 'IPHONE 18 PRO MAX লাকি ড্র',
        sender: 'মেগা প্রাইজ বোর্ড',
        summary: 'চলতি সপ্তাহের স্পেশাল লাকি ড্র রেজিস্ট্রেশন সক্রিয়।',
        content: 'চলতি সপ্তাহের টার্নওভার পূরণ করলেই পাচ্ছেন iPhone 18 Pro Max ও খাঁটি সোনার কয়েন জেতার দারুণ সুযোগ।',
        date: '2026-11-06 16:30',
        read: true,
      },
    ];
    localStorage.setItem('livexwin_mailbox_db', JSON.stringify(initialMails));
    return initialMails;
  }

  markMailRead(id: string): void {
    const mails = this.getMailMessages();
    const target = mails.find(m => m.id === id);
    if (target) {
      target.read = true;
      localStorage.setItem('livexwin_mailbox_db', JSON.stringify(mails));
    }
  }

  resetProvidersToDefault(): void {
    this.providers = [...DEFAULT_PROVIDERS];
    this.saveProviders();
  }

  getSiteSettings(): SiteSettings {
    return { ...this.siteSettings };
  }

  updateSiteSettings(updates: Partial<SiteSettings>): boolean {
    Object.assign(this.siteSettings, updates);
    this.saveSettings();
    return true;
  }

  private saveAssets(): void {
    localStorage.setItem(STORAGE_KEYS.SITE_ASSETS, JSON.stringify(this.siteAssets));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('livexwin_assets_updated'));
    }
  }

  getSiteAssets(): SiteAssets {
    return { ...this.siteAssets };
  }

  updateSiteAssets(updates: Partial<SiteAssets>): boolean {
    Object.assign(this.siteAssets, updates);
    this.saveAssets();
    return true;
  }

  updateBanner(id: number, updates: Partial<PromoSlideItem>): boolean {
    const banners = [...this.siteAssets.banners];
    const idx = banners.findIndex(b => b.id === id);
    if (idx >= 0) {
      banners[idx] = { ...banners[idx], ...updates };
      this.siteAssets.banners = banners;
      this.saveAssets();
      return true;
    }
    return false;
  }

  addBanner(banner: Omit<PromoSlideItem, 'id'>): boolean {
    const newId = this.siteAssets.banners.length > 0 
      ? Math.max(...this.siteAssets.banners.map(b => b.id)) + 1 
      : 1;
    const newSlide: PromoSlideItem = {
      ...banner,
      id: newId,
    };
    this.siteAssets.banners = [...this.siteAssets.banners, newSlide];
    this.saveAssets();
    return true;
  }

  deleteBanner(id: number): boolean {
    this.siteAssets.banners = this.siteAssets.banners.filter(b => b.id !== id);
    this.saveAssets();
    return true;
  }

  updateCategory(id: string, updates: Partial<CategoryCardItem>): boolean {
    const categories = [...this.siteAssets.categories];
    const idx = categories.findIndex(c => c.id === id);
    if (idx >= 0) {
      categories[idx] = { ...categories[idx], ...updates };
      this.siteAssets.categories = categories;
      this.saveAssets();
      return true;
    }
    return false;
  }

  updatePaymentMethod(id: string, updates: Partial<PaymentMethodAsset>): boolean {
    const methods = [...this.siteAssets.paymentMethods];
    const idx = methods.findIndex(m => m.id === id);
    if (idx >= 0) {
      methods[idx] = { ...methods[idx], ...updates };
      this.siteAssets.paymentMethods = methods;
      this.saveAssets();
      return true;
    }
    return false;
  }

  addPaymentMethod(method: PaymentMethodAsset): boolean {
    this.siteAssets.paymentMethods = [...this.siteAssets.paymentMethods, method];
    this.saveAssets();
    return true;
  }

  resetSiteAssetsToDefault(): void {
    this.siteAssets = JSON.parse(JSON.stringify(DEFAULT_SITE_ASSETS));
    this.saveAssets();
  }
}

export const storage = new StorageService();
