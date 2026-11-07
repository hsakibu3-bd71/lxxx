export type GameCategory = 'hot' | 'slots' | 'fishing' | 'live' | 'poker' | 'lottery' | 'sports';

export type GameProvider = 
  | 'Jili' 
  | 'Pocket Games Soft' 
  | 'JDB' 
  | 'FA CHAI Gaming' 
  | 'Pragmatic Play' 
  | 'Microgaming' 
  | 'Mega Win' 
  | 'Baison Poker' 
  | 'Kings Poker' 
  | 'CQ9' 
  | 'Joker' 
  | 'Spadegaming' 
  | 'BTGaming'
  | '2J GAMES'
  | 'SWGaming' 
  | 'FunTa Gaming'
  | 'Funky Games' 
  | 'Fastspin'
  | 'BNG';

export interface GameItem {
  id: string;
  name: string;
  bengaliName: string;
  category: GameCategory;
  provider: GameProvider;
  image: string;
  rating: number;
  multiplier?: string;
  isHot?: boolean;
  isNew?: boolean;
  rtp: number; // e.g. 97.2
  playableType?: 'super_ace' | 'fortune_gems' | 'flyx' | 'happy_fishing' | 'crazy_777' | 'teen_patti' | 'live_roulette';
  minBet: number;
  maxBet: number;
  active: boolean;
}

export interface UserWallet {
  balance: number;
  frozenBalance: number;
  currency: string; // 'BDT'
}

export interface BoundWallet {
  id: string;
  type: 'nagad' | 'bkash' | 'rocket';
  accountName: string;
  accountNumber: string;
  addedAt: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus';
  amount: number;
  fee?: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  method?: 'nagad' | 'bkash' | 'rocket' | 'bank';
  channel?: 'TKPAYBDT' | 'BD99PAYBDT' | 'GOLDPAYBDT' | 'AIPAYBD';
  accountNumber?: string;
  trxId?: string;
  note?: string;
  createdAt: string;
}

export interface BetRecord {
  id: string;
  gameId: string;
  gameName: string;
  provider: GameProvider;
  betAmount: number;
  payoutAmount: number;
  profit: number;
  multiplier: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  phone: string;
  avatar: string;
  vipLevel: number;
  vipPoints: number;
  joinedDate: string;
  wallet: UserWallet;
  boundWallets: BoundWallet[];
  trxPasswordSet: boolean;
  trxPassword?: string;
  loginPassword?: string;
  role: 'player' | 'admin' | 'superadmin';
  status: 'active' | 'banned';
  dailyCheckinClaimed: boolean;
  consecutiveDays: number;
  goldenEggsLeft: number;
  redPacketsClaimed: number;
}

export interface ProviderConfig {
  id: string;
  name: GameProvider;
  displayName?: string;
  logoUrl?: string; // Custom provider image/logo URL added from admin
  showType?: 'image_only' | 'text_only' | 'both'; // Can be set from admin: show image only, text only, or both
  apiUrl: string;
  merchantCode: string;
  secretKey: string;
  agentCode: string;
  currency: string;
  callbackUrl: string;
  status: 'active' | 'maintenance' | 'disabled';
  lastPingMs?: number;
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  brandTagline: string;
  minDeposit: number;
  maxDeposit: number;
  minWithdraw: number;
  maxWithdraw: number;
  dailyWithdrawLimit: number;
  telegramLink: string;
  whatsappLink: string;
  liveChatActive: boolean;
  maintenanceMode: boolean;
  announcementText: string;
  firstDepositBonusPercent: number;
  // Admin Promotion Controls
  goldenEggMaxDisplay: number;
  goldenEggTier1: number;
  goldenEggTier2: number;
  goldenEggTier3: number;
  wheelCountdownTimer: string;
  wheelTier1: number;
  wheelTier2: number;
  wheelTier3: number;
  redPacketDailyLimit: number;
  rescueFundPercentage: number;
  rescueFundDailyMax: number;
  // SoftAggregator API Configuration (PDF v1)
  softAggregatorApiLogin?: string;
  softAggregatorApiPassword?: string;
  softAggregatorSaltKey?: string;
  softAggregatorCallbackUrl?: string;
  softAggregatorCurrency?: string;
  softAggregatorCountry?: string;
}

export interface PromoSlideItem {
  id: number;
  badge: string;
  badgeColor: string;
  title1: string;
  title2: string;
  amount: string;
  btnText: string;
  action: 'deposit' | 'egg' | 'redpacket';
  bgImage: string;
  gradientOverlay: string;
}

export interface CategoryCardItem {
  id: string;
  titleBn: string;
  subBn: string;
  image: string;
  iconBg: string;
}

export interface PaymentMethodAsset {
  id: string;
  name: string;
  nameBn: string;
  logoUrl: string;
  enabled: boolean;
  color: string;
}

export interface SiteAssets {
  siteLogoUrl: string;
  siteFaviconUrl: string;
  appLogoUrl: string;
  appQrCodeUrl: string;
  androidBadgeUrl: string;
  iosBadgeUrl: string;
  footerProvidersImageUrl: string;
  paymentMethods: PaymentMethodAsset[];
  banners: PromoSlideItem[];
  categories: CategoryCardItem[];
}

