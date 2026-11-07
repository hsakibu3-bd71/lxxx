import React, { useState, useEffect } from 'react';
import { UserProfile, Transaction, BetRecord } from '../types';
import { soundFX } from '../utils/audio';
import { storage, maskAccountNumber, FeedbackItem, MailMessage } from '../services/storage';
import {
  ChevronLeft,
  Copy,
  Edit2,
  RefreshCw,
  Award,
  History,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  User,
  Shield,
  Share2,
  Target,
  Mail,
  MessageSquare,
  Smartphone,
  Headphones,
  HelpCircle,
  LogOut,
  CheckCircle2,
  CreditCard,
  Plus,
  Trash2,
  Lock,
  Send,
  HelpCircle as QuestionIcon,
  ChevronDown,
  Gift,
  QrCode,
  LifeBuoy,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemberCenterProps {
  user: UserProfile | null;
  onClose: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenAppDownload: () => void;
  onRefreshBalance: () => void;
  onLogout: () => void;
  onOpenEggGame: () => void;
  onOpenRedPacket: () => void;
}

type SubModalType =
  | 'none'
  | 'rewards'
  | 'bets'
  | 'profit_loss'
  | 'deposit_records'
  | 'withdraw_records'
  | 'transactions'
  | 'my_cards'
  | 'account_info'
  | 'security'
  | 'invite'
  | 'missions'
  | 'mail'
  | 'feedback'
  | 'live_support'
  | 'help_center'
  | 'app_download'
  | 'rescue_fund'
  | 'edit_nickname';

export const MemberCenter: React.FC<MemberCenterProps> = ({
  user,
  onClose,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenAppDownload,
  onRefreshBalance,
  onLogout,
  onOpenEggGame,
  onOpenRedPacket,
}) => {
  const [copied, setCopied] = useState(false);
  const [subModal, setSubModal] = useState<SubModalType>('none');
  const [nicknameInput, setNicknameInput] = useState(user?.nickname || '');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // My Cards / Add Bound Wallet State
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardType, setNewCardType] = useState<'nagad' | 'bkash' | 'rocket'>('nagad');
  const [newCardName, setNewCardName] = useState(user?.nickname || '');
  const [newCardNumber, setNewCardNumber] = useState('');

  // Security Center State
  const [oldLoginPass, setOldLoginPass] = useState('');
  const [newLoginPass, setNewLoginPass] = useState('');
  const [confirmLoginPass, setConfirmLoginPass] = useState('');
  const [newTrxPin, setNewTrxPin] = useState('');
  const [securityTab, setSecurityTab] = useState<'password' | 'trx_pin' | 'phone'>('trx_pin');

  // Mail State
  const [mailList, setMailList] = useState<MailMessage[]>([]);
  const [selectedMail, setSelectedMail] = useState<MailMessage | null>(null);

  // Feedback State
  const [feedbackCategory, setFeedbackCategory] = useState('গেম সম্পর্কিত');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackContact, setFeedbackContact] = useState(user?.phone || '');
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([]);

  // Live Support Chat State
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'bot' | 'user'; text: string; time: string }>
  >([
    {
      sender: 'bot',
      text: `নমস্কার ${user?.nickname || 'গ্রাহক'}! LivexWin 24/7 লাইভ কাস্টমার সার্ভিসে স্বাগতম। ডিপোজিট, উত্তোলন বা গেম সংক্রান্ত কোনো জিজ্ঞাসা থাকলে জানান।`,
      time: 'এখনই',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Help Center FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Bet History Filter State
  const [betCategoryFilter, setBetCategoryFilter] = useState<'all' | 'win' | 'loss' | 'slots' | 'crash' | 'live' | 'fishing'>('all');

  // Transactions Filter
  const [txFilter, setTxFilter] = useState<'all' | 'deposit' | 'withdraw' | 'bonus'>('all');

  const transactions = storage.getTransactions();
  const betRecords = storage.getBetRecords();

  useEffect(() => {
    setMailList(storage.getMailMessages());
    setFeedbackHistory(storage.getFeedbackList());
  }, [subModal]);

  const handleCopyUsername = () => {
    soundFX.playClick();
    if (user?.username) {
      navigator.clipboard.writeText(user.username);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDailyCheckin = () => {
    soundFX.playClick();
    const res = storage.claimDailyCheckin();
    if (res.success) {
      soundFX.playWin();
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 } });
      alert(res.message);
      onRefreshBalance();
    } else {
      alert(res.message);
    }
  };

  const handleSaveNickname = () => {
    soundFX.playClick();
    if (nicknameInput.trim()) {
      storage.updateProfile({ nickname: nicknameInput.trim() });
      soundFX.playWin();
      alert('ডাকনাম সফলভাবে পরিবর্তন করা হয়েছে!');
      setSubModal('none');
      onRefreshBalance();
    }
  };

  const handleAddBoundWallet = () => {
    soundFX.playClick();
    if (!newCardNumber || newCardNumber.length < 11) {
      alert('দয়া করে সঠিক ১১ সংখ্যার মোবাইল নাম্বার দিন (যেমন: 017xxxxxxxx)');
      return;
    }
    const res = storage.bindWallet(newCardType, newCardName, newCardNumber);
    if (res.success) {
      soundFX.playWin();
      alert(res.message);
      setIsAddingCard(false);
      setNewCardNumber('');
      onRefreshBalance();
    } else {
      alert(res.message);
    }
  };

  const handleRemoveWallet = (id: string) => {
    soundFX.playClick();
    if (confirm('আপনি কি এই ওয়ালেটটি মুছে ফেলতে চান?')) {
      storage.removeBoundWallet(id);
      onRefreshBalance();
    }
  };

  const handleSaveTrxPin = () => {
    soundFX.playClick();
    if (newTrxPin.length !== 6 || isNaN(Number(newTrxPin))) {
      alert('ট্রানজেকশন পিন অবশ্যই ৬ সংখ্যার হতে হবে (যেমন: 123456)।');
      return;
    }
    storage.updateSecurity({ trxPassword: newTrxPin });
    soundFX.playWin();
    alert('উত্তোলন ট্রানজেকশন পিন সফলভাবে সংরক্ষিত হয়েছে!');
    setNewTrxPin('');
    onRefreshBalance();
  };

  const handleSaveLoginPassword = () => {
    soundFX.playClick();
    if (!newLoginPass || newLoginPass.length < 6) {
      alert('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (newLoginPass !== confirmLoginPass) {
      alert('পাসওয়ার্ড কনফার্মেশন মেলেনি!');
      return;
    }
    storage.updateSecurity({ loginPassword: newLoginPass });
    soundFX.playWin();
    alert('লগইন পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!');
    setOldLoginPass('');
    setNewLoginPass('');
    setConfirmLoginPass('');
  };

  const handleSubmitFeedback = () => {
    soundFX.playClick();
    if (!feedbackMessage.trim()) {
      alert('আপনার পরামর্শ বা বার্তা লিখুন।');
      return;
    }
    const res = storage.submitFeedback({
      category: feedbackCategory,
      message: feedbackMessage.trim(),
      contact: feedbackContact.trim(),
    });
    soundFX.playWin();
    alert(res.message);
    setFeedbackMessage('');
    setFeedbackHistory(storage.getFeedbackList());
  };

  const handleSendChatMessage = (msgText?: string) => {
    const textToSend = msgText || chatInput;
    if (!textToSend.trim()) return;

    soundFX.playClick();
    const newMsg = {
      sender: 'user' as const,
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMsg]);
    if (!msgText) setChatInput('');

    // Simulated Smart Support Bot Response
    setTimeout(() => {
      soundFX.playClick();
      let botReply = 'ধন্যবাদ আপনার মেসেজের জন্য। একজন সিনিয়র এজেন্ট আপনার অ্যাকাউন্ট হিস্ট্রি যাচাই করছেন।';
      const lower = textToSend.toLowerCase();

      if (lower.includes('ডিপোজিট') || lower.includes('জমা') || lower.includes('deposit')) {
        botReply = 'ডিপোজিটের ক্ষেত্রে নগদ বা বিকাশ ট্রানজেকশন আইডি (TrxID) সাবমিট করার পর সাধারণত ১-৩ মিনিটের মধ্যে স্বয়ংক্রিয়ভাবে ব্যালেন্সে যোগ হয়। প্রয়োজনে ডিপোজিট রেকর্ড দেখুন।';
      } else if (lower.includes('উত্তোলন') || lower.includes('টাকা') || lower.includes('withdraw') || lower.includes('ক্যাশআউট')) {
        botReply = 'উত্তোলন সাধারণত ৫-১৫ মিনিটের মধ্যে অনুমোদিত হয়ে গ্রাহকের নগদ/বিকাশ একাউন্টে ট্রান্সফার হয়। প্রতিদিন ২৪ ঘণ্টাই ক্যাশআউট উন্মুক্ত।';
      } else if (lower.includes('পাসওয়ার্ড') || lower.includes('পিন') || lower.includes('pin') || lower.includes('password')) {
        botReply = 'উত্তোলন পিন ভুলে গেলে সদস্য সেন্টারের "সুরক্ষা কেন্দ্র" থেকে যেকোনো সময় ৬-সংখ্যার নতুন ট্রানজেকশন পাসওয়ার্ড সেট করে নিতে পারেন।';
      } else if (lower.includes('বোনাস') || lower.includes('রেড') || lower.includes('এগ') || lower.includes('bonus')) {
        botReply = 'নতুন ইউজারদের জন্য ৳৬০ রেজিস্ট্রেশন ফ্রি বোনাস, দৈনিক গোল্ডেন এগ (সর্বোচ্চ ৳৭৭৭,৭৭৭) এবং ১৭টি রেড প্যাকেট অফার চালু রয়েছে।';
      }

      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot' as const,
          text: botReply,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  const handleClaimAllRewards = () => {
    soundFX.playWin();
    confetti({ particleCount: 80, spread: 60 });
    storage.adminAdjustUserBalance(user?.id || 'usr_t1206248521', 150, 'দৈনিক ভিআইপি ক্যাশব্যাক ও রিবেট বোনাস দাবি');
    alert('অভিনন্দন! ৳ ১৫০.০০ ভিআইপি ক্যাশব্যাক সফলভাবে মূল অ্যাকাউন্টে যুক্ত হয়েছে!');
    onRefreshBalance();
  };

  const unreadMailsCount = mailList.filter(m => !m.read).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#eef1f5] text-gray-900 overflow-y-auto select-none">
      <div className="max-w-lg mx-auto min-h-screen flex flex-col pb-12 shadow-2xl bg-[#f8fafc]">
        {/* Header matching User_7bfe922a.pdf */}
        <div className="bg-[#3e070c] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-md">
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full active:scale-95 transition-transform"
          >
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-base font-extrabold tracking-wide">আমার অ্যাকাউন্ট</h2>
          {/* Daily Sign-In Button */}
          <button
            onClick={handleDailyCheckin}
            className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            <CheckCircle2 size={13} />
            <span>সাইন ইন</span>
            <span className="text-[10px]">›</span>
          </button>
        </div>

        {/* Profile Card Banner matching User_7bfe922a.pdf */}
        <div className="bg-gradient-to-b from-[#3e070c] via-[#5c0e15] to-[#7d141e] p-4 text-white shadow-lg relative border-b border-[#a31c28]">
          <div className="flex items-center gap-3.5">
            {/* User Avatar */}
            <div className="relative">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                }
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-yellow-400 shadow-md"
              />
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
                vip{user?.vipLevel ?? 0}
              </span>
            </div>

            {/* User Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-base text-yellow-300">
                  {user?.username || 't1206248521'}
                </span>
                <button
                  onClick={handleCopyUsername}
                  className="text-gray-300 hover:text-white p-0.5"
                  title="কপি করুন"
                >
                  <Copy size={13} />
                </button>
                {copied && <span className="text-[10px] text-emerald-300 font-bold">কপি হয়েছে</span>}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-200 mt-0.5">
                <span>ডাকনাম: {user?.nickname || user?.username}</span>
                <button
                  onClick={() => setSubModal('edit_nickname')}
                  className="text-yellow-400 hover:text-white"
                >
                  <Edit2 size={11} />
                </button>
              </div>

              <span className="text-[10px] text-gray-300 block mt-0.5 font-medium">
                যোগদান করেছেন: {user?.joinedDate || '2026-11-06'}
              </span>
            </div>
          </div>

          {/* Balance Row */}
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-yellow-300 font-num">৳</span>
              <span className="text-2xl font-black font-num text-yellow-300 tracking-wide">
                {user?.wallet.balance.toFixed(2) || '0.00'}
              </span>
            </div>
            <button
              onClick={() => {
                soundFX.playClick();
                setIsRefreshing(true);
                onRefreshBalance();
                setTimeout(() => setIsRefreshing(false), 500);
              }}
              className="text-gray-200 hover:text-white p-1 rounded-full active:scale-90 transition-transform"
              title="ব্যালেন্স রিফ্রেশ"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-yellow-400' : ''} />
            </button>
          </div>

          {/* 3 Main Action Pills matching PDF */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenDeposit();
              }}
              className="py-2.5 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-xs font-black text-center shadow-md active:scale-95 transition-all"
            >
              জমা দিন
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenWithdraw();
              }}
              className="py-2.5 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-xs font-black text-center shadow-md active:scale-95 transition-all"
            >
              উত্তোলন
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setSubModal('my_cards');
              }}
              className="py-2.5 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-xs font-black text-center shadow-md active:scale-95 transition-all"
            >
              আমার কার্ড ({user?.boundWallets.length || 0})
            </button>
          </div>
        </div>

        {/* Member Center 16 Golden Medallion Icons (Exact Match to User_7bfe922a.pdf) */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-2.5 px-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>সদস্য সেন্টার (Member Center)</span>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-200 grid grid-cols-4 gap-y-5 gap-x-2">
            {/* 1. আমার পুরস্কার (badge 8) */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('rewards');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center relative active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md">
                <Award size={22} className="text-amber-950" />
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">আমার পুরস্কার</span>
            </div>

            {/* 2. বাজির ইতিহাস */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('bets');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md">
                <History size={22} className="text-amber-950" />
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">বাজির ইতিহাস</span>
            </div>

            {/* 3. লাভ এবং লস */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('profit_loss');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md">
                <TrendingUp size={22} className="text-amber-950" />
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">লাভ এবং লস</span>
            </div>

            {/* 4. জমা রেকর্ড */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('deposit_records');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md">
                <ArrowDownCircle size={22} className="text-amber-950" />
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">জমা রেকর্ড</span>
            </div>

            {/* 5. উত্তোলন রেকর্ড */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('withdraw_records');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md">
                <ArrowUpCircle size={22} className="text-amber-950" />
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">উত্তোলন রেকর্ড</span>
            </div>

            {/* 6. লেনদেনের ইতিহাস */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('transactions');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md">
                <Clock size={22} className="text-amber-950" />
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">লেনদেনের ইতিহাস</span>
            </div>

            {/* 7. আমার অ্যাকাউন্ট */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('account_info');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md">
                <User size={22} className="text-amber-950" />
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">আমার অ্যাকাউন্ট</span>
            </div>

            {/* 8. সুরক্ষা কেন্দ্র */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('security');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md">
                <Shield size={22} className="text-amber-950" />
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">সুরক্ষা কেন্দ্র</span>
            </div>

            {/* 9. বন্ধুদের আমন্ত্রণ */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('invite');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md">
                <Share2 size={22} className="text-amber-950" />
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">বন্ধুদের আমন্ত্রণ</span>
            </div>

            {/* 10. মিশন (badge 1) */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('missions');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center relative active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md relative">
                <Target size={22} className="text-amber-950" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white font-black text-[9px] rounded-full flex items-center justify-center shadow">
                  1
                </span>
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">মিশন</span>
            </div>

            {/* 11. মেইল (badge unread) */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('mail');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center relative active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md relative">
                <Mail size={22} className="text-amber-950" />
                {unreadMailsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white font-black text-[9px] rounded-full flex items-center justify-center shadow">
                    {unreadMailsCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">মেইল</span>
            </div>

            {/* 12. পরামর্শ */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('feedback');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md">
                <MessageSquare size={22} className="text-amber-950" />
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">পরামর্শ</span>
            </div>

            {/* 13. অ্যাপ ডাউনলোড */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('app_download');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md relative">
                <Smartphone size={22} className="text-amber-950" />
                <span className="absolute -top-1 -right-1 px-1 bg-blue-600 text-white font-black text-[7px] rounded-full shadow">
                  LIVE
                </span>
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">অ্যাপ ডাউনলোড</span>
            </div>

            {/* 14. কাস্টমার সার্ভিস */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('live_support');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md">
                <Headphones size={22} className="text-amber-950" />
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">কাস্টমার সার্ভিস</span>
            </div>

            {/* 15. সাহায্য কেন্দ্র */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('help_center');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md">
                <HelpCircle size={22} className="text-amber-950" />
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">সাহায্য কেন্দ্র</span>
            </div>

            {/* 16. উদ্ধার তহবিল (Rescue Relief Cashback) */}
            <div
              onClick={() => {
                soundFX.playClick();
                setSubModal('rescue_fund');
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full gold-medallion flex items-center justify-center mb-1.5 shadow-md">
                <LifeBuoy size={22} className="text-amber-950" />
              </div>
              <span className="text-[11px] text-gray-800 font-bold leading-tight">উদ্ধার তহবিল</span>
            </div>

            {/* 17. লগআউট */}
            <div
              onClick={() => {
                soundFX.playClick();
                onLogout();
              }}
              className="flex flex-col items-center justify-center cursor-pointer group text-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center mb-1.5 shadow-md">
                <LogOut size={22} className="text-white" />
              </div>
              <span className="text-[11px] text-red-600 font-black leading-tight">লগআউট</span>
            </div>
          </div>

          {/* Dedicated Full-Width Logout Button at Bottom of Member Center */}
          <button
            onClick={() => {
              soundFX.playClick();
              onLogout();
            }}
            className="mt-4 w-full py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>অ্যাকাউন্ট থেকে লগআউট করুন (Logout)</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* INTERACTIVE SUB-MODALS FOR ALL 16 USER DASHBOARD ACTIONS */}
        {/* ======================================================== */}
        {subModal !== 'none' && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 animate-fade-in backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 max-h-[88vh] overflow-y-auto shadow-2xl flex flex-col text-gray-900 border border-gray-100">
              {/* Modal Top Bar */}
              <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-gray-200 shrink-0">
                <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  {subModal === 'rewards' && 'আমার পুরস্কার ও ভিআইপি বেনিফিট'}
                  {subModal === 'bets' && 'সাম্প্রতিক বাজির ইতিহাস'}
                  {subModal === 'profit_loss' && 'লাভ এবং লস বিশ্লেষণ'}
                  {subModal === 'deposit_records' && 'জমা রেকর্ডসমূহ'}
                  {subModal === 'withdraw_records' && 'উত্তোলন রেকর্ডসমূহ'}
                  {subModal === 'transactions' && 'লেনদেনের সম্পূর্ণ ইতিহাস'}
                  {subModal === 'my_cards' && 'আমার কার্ড / ওয়ালেট ব্যবস্থাপনা'}
                  {subModal === 'account_info' && 'আমার প্রোফাইল ও অ্যাকাউন্ট তথ্য'}
                  {subModal === 'security' && 'নিরাপত্তা কেন্দ্র (Security Center)'}
                  {subModal === 'invite' && 'বন্ধুদের আমন্ত্রণ ও রেফারেল আয়'}
                  {subModal === 'missions' && 'মিশন ও দৈনিক পুরস্কার হাব'}
                  {subModal === 'mail' && 'মেইলবক্স (সিস্টেম বার্তা ও উপহার)'}
                  {subModal === 'feedback' && 'পরামর্শ ও মতামত কেন্দ্র'}
                  {subModal === 'live_support' && '২৪/৭ লাইভ কাস্টমার সাপোর্ট'}
                  {subModal === 'rescue_fund' && 'জরুরি উদ্ধার তহবিল (Rescue Relief Cashback)'}
                  {subModal === 'app_download' && 'LivexWin মোবাইল অ্যাপ ডাউনলোড'}
                  {subModal === 'edit_nickname' && 'ডাকনাম পরিবর্তন করুন'}
                </h3>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setSubModal('none');
                    setSelectedMail(null);
                  }}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-black active:scale-90"
                >
                  ✕
                </button>
              </div>

              {/* 1. MY REWARDS & VIP BENEFITS */}
              {subModal === 'rewards' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white rounded-2xl shadow-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">বর্তমান স্ট্যাটাস</span>
                        <h4 className="text-xl font-black">VIP {user?.vipLevel ?? 0} মেম্বার</h4>
                      </div>
                      <Award size={36} className="text-yellow-200" />
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span>VIP 1 এর অগ্রগতি</span>
                        <span>{user?.vipPoints || 120} / 500 পয়েন্ট</span>
                      </div>
                      <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-yellow-200 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((user?.vipPoints || 120) / 500) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-black text-gray-900 block">দৈনিক স্লট রিবেট ক্যাশব্যাক</span>
                        <span className="text-[11px] text-gray-600">প্রতিদিন ১.২% স্বয়ংক্রিয় ফেরত</span>
                      </div>
                      <span className="font-bold text-amber-600">৳ ৮৫.৫০</span>
                    </div>

                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-black text-gray-900 block">সাপ্তাহিক ভিআইপি রিওয়ার্ড</span>
                        <span className="text-[11px] text-gray-600">সাপ্তাহিক টার্নওভার উপহার</span>
                      </div>
                      <span className="font-bold text-rose-600">৳ ১৫০.০০</span>
                    </div>
                  </div>

                  <button
                    onClick={handleClaimAllRewards}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-105 text-black font-extrabold rounded-xl text-xs shadow-md active:scale-95 transition-all"
                  >
                    এক ক্লিকে সকল বোনাস গ্রহণ করুন (Claim All)
                  </button>
                </div>
              )}

              {/* 2. BETTING HISTORY (সাম্প্রতিক বাজির ইতিহাস) */}
              {subModal === 'bets' && (
                <div className="space-y-3">
                  {/* Filter Tabs */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    {[
                      { id: 'all', label: `সকল বাজি (${betRecords.length})` },
                      { id: 'win', label: `জয়ী (${betRecords.filter(b => b.profit > 0).length})` },
                      { id: 'loss', label: `পরাজিত (${betRecords.filter(b => b.profit <= 0).length})` },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setBetCategoryFilter(f.id as any)}
                        className={`px-3 py-1.5 rounded-xl font-black whitespace-nowrap transition-all ${
                          betCategoryFilter === f.id
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Summary Bar */}
                  <div className="p-3 bg-gradient-to-r from-[#200306] to-[#3a060d] text-white rounded-2xl flex justify-between items-center text-xs shadow-sm">
                    <div>
                      <span className="text-[10px] text-gray-300 block">মোট বাজির পরিমাণ:</span>
                      <span className="font-black font-num text-sm text-yellow-300">
                        ৳ {betRecords.reduce((s, b) => s + b.betAmount, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-300 block">মোট পেআউট:</span>
                      <span className="font-black font-num text-sm text-emerald-400">
                        ৳ {betRecords.reduce((s, b) => s + b.payoutAmount, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Betting Records List */}
                  <div className="space-y-2.5 max-h-96 overflow-y-auto">
                    {betRecords
                      .filter(b => {
                        if (betCategoryFilter === 'win') return b.profit > 0;
                        if (betCategoryFilter === 'loss') return b.profit <= 0;
                        return true;
                      })
                      .map(b => {
                        const isWin = b.profit > 0;
                        return (
                          <div
                            key={b.id}
                            className="p-3 bg-gray-50 hover:bg-gray-100/80 rounded-2xl border border-gray-200 text-xs transition-colors shadow-xs"
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              <div>
                                <span className="font-black text-gray-900 text-sm block leading-tight">
                                  {b.gameName}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                                    {b.provider}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-mono">
                                    {b.createdAt}
                                  </span>
                                </div>
                              </div>

                              {/* Win / Loss Result Badge */}
                              <span
                                className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                                  isWin
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {isWin ? '✓ জয়ী (WIN)' : '✕ পরাজিত (LOSS)'}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200/80 text-[11px]">
                              <div>
                                <span className="text-gray-500 block text-[10px]">বাজি (Bet):</span>
                                <span className="font-bold text-gray-800 font-num">৳{b.betAmount}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block text-[10px]">পেআউট (Payout):</span>
                                <span className="font-bold text-gray-800 font-num">৳{b.payoutAmount}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-500 block text-[10px]">নিট ফলাফল:</span>
                                <span
                                  className={`font-black font-num text-xs ${
                                    isWin ? 'text-emerald-600' : 'text-red-600'
                                  }`}
                                >
                                  {isWin ? `+৳${b.profit.toFixed(2)}` : `-৳${Math.abs(b.profit).toFixed(2)}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {betRecords.length === 0 && (
                      <div className="text-center py-10 space-y-2">
                        <span className="text-3xl block">🎰</span>
                        <p className="text-gray-500 text-xs font-bold">এখনো কোনো বাজি খেলা হয়নি।</p>
                        <p className="text-gray-400 text-[11px]">যেকোনো গেম খেলে আপনার বাজি ও পেআউটের ইতিহাস এখানে দেখতে পাবেন।</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. PROFIT & LOSS */}
              {subModal === 'profit_loss' && (
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl shadow-md text-center">
                    <span className="text-[11px] font-bold uppercase opacity-90">সর্বশেষ ৩০ দিনের নিট লাভ</span>
                    <h3 className="text-3xl font-black font-num mt-1">+৳ ৫৪০.০০</h3>
                    <span className="text-[10px] opacity-80 mt-1 block">টার্নওভার: ৳ ১২,৪৫০.০০</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-gray-50 rounded-xl border">
                      <span className="text-gray-500 text-[11px] block">মোট বাজি পরিমাণ</span>
                      <span className="font-black text-gray-900 text-sm font-num">৳ ১১,৯১০.০০</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border">
                      <span className="text-gray-500 text-[11px] block">মোট পেআউট জয়</span>
                      <span className="font-black text-emerald-600 text-sm font-num">৳ ১২,৪৫০.০০</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border text-xs space-y-2">
                    <span className="font-bold text-gray-800 block">গেমভিত্তিক বিশ্লেষণ:</span>
                    <div className="flex justify-between">
                      <span>JILI স্লট (Super Ace / Fortune Gems)</span>
                      <span className="text-emerald-600 font-bold">+৳ ৩২০.০০</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Microgaming FlyX ক্র্যাশ</span>
                      <span className="text-emerald-600 font-bold">+৳ ২১০.০০</span>
                    </div>
                    <div className="flex justify-between">
                      <span>টিন পট্টি ও কার্ড</span>
                      <span className="text-emerald-600 font-bold">+৳ ১০.০০</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. DEPOSIT RECORDS */}
              {subModal === 'deposit_records' && (
                <div className="space-y-2">
                  {transactions
                    .filter(t => t.type === 'deposit')
                    .map(t => (
                      <div key={t.id} className="p-3 bg-gray-50 rounded-xl border text-xs flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-gray-900 uppercase">{t.method}</span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">{t.channel}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{t.id} • {t.createdAt}</span>
                          {t.trxId && (
                            <span className="text-[10px] text-red-600 font-mono font-bold block">
                              TrxID: {t.trxId}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-black font-num text-sm text-emerald-600 block">+৳{t.amount.toFixed(2)}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                            সফল
                          </span>
                        </div>
                      </div>
                    ))}
                  {transactions.filter(t => t.type === 'deposit').length === 0 && (
                    <p className="text-center text-gray-500 text-xs py-8">কোনো জমা রেকর্ড নেই।</p>
                  )}
                  <button
                    onClick={() => {
                      setSubModal('none');
                      onOpenDeposit();
                    }}
                    className="w-full py-2.5 bg-red-600 text-white rounded-xl text-xs font-black shadow-md mt-2"
                  >
                    নতুন ডিপোজিট করুন
                  </button>
                </div>
              )}

              {/* 5. WITHDRAW RECORDS */}
              {subModal === 'withdraw_records' && (
                <div className="space-y-2">
                  {transactions
                    .filter(t => t.type === 'withdraw')
                    .map(t => (
                      <div key={t.id} className="p-3 bg-gray-50 rounded-xl border text-xs flex justify-between items-center">
                        <div>
                          <span className="font-black text-gray-900 uppercase block">
                            {t.method || 'ওয়ালেট'} উত্তোলন
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">{t.id} • {t.createdAt}</span>
                          {t.accountNumber && (
                            <span className="text-[10px] text-gray-700 font-mono block font-bold">
                              একাউন্ট: {t.accountNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-black font-num text-sm text-red-600 block">-৳{t.amount.toFixed(2)}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            t.status === 'approved' || t.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {t.status === 'approved' || t.status === 'completed' ? 'সফল' : t.status === 'pending' ? 'অনুমোদনাধীন' : 'বাতিল'}
                          </span>
                        </div>
                      </div>
                    ))}
                  {transactions.filter(t => t.type === 'withdraw').length === 0 && (
                    <p className="text-center text-gray-500 text-xs py-8">কোনো উত্তোলন রেকর্ড নেই।</p>
                  )}
                  <button
                    onClick={() => {
                      setSubModal('none');
                      onOpenWithdraw();
                    }}
                    className="w-full py-2.5 bg-[#3e070c] text-white rounded-xl text-xs font-black shadow-md mt-2"
                  >
                    নতুন উত্তোলন করুন
                  </button>
                </div>
              )}

              {/* 6. ALL TRANSACTIONS */}
              {subModal === 'transactions' && (
                <div className="space-y-3">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    {[
                      { id: 'all', label: 'সব' },
                      { id: 'deposit', label: 'জমা' },
                      { id: 'withdraw', label: 'উত্তোলন' },
                      { id: 'bonus', label: 'বোনাস' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setTxFilter(f.id as any)}
                        className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap ${
                          txFilter === f.id ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {transactions
                      .filter(t => (txFilter === 'all' ? true : t.type === txFilter))
                      .map(t => (
                        <div key={t.id} className="p-3 bg-gray-50 rounded-xl border text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-gray-900 block capitalize">
                              {t.type === 'deposit' ? 'জমা' : t.type === 'withdraw' ? 'উত্তোলন' : 'বোনাস'}{' '}
                              ({t.method || 'সিস্টেম'})
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">{t.id} • {t.createdAt}</span>
                            {t.note && <span className="text-[10px] text-gray-600 block">{t.note}</span>}
                          </div>
                          <div className="text-right">
                            <span className={`font-black font-num text-sm block ${
                              t.type === 'deposit' || t.type === 'bonus' ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {t.type === 'withdraw' ? '-' : '+'}৳{t.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 7. MY CARDS / BOUND WALLETS (আমার কার্ড: সর্বোচ্চ ৫টি, স্থায়ী লকড) */}
              {subModal === 'my_cards' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black text-gray-800 block">
                        সংযুক্ত ওয়ালেট সমূহ ({user?.boundWallets.length || 0}/5):
                      </span>
                      <span className="text-[10px] text-gray-500">
                        নিরাপত্তার স্বার্থে নম্বর স্থায়ীভাবে সংরক্ষিত ও শেষ ৩ ডিজিট প্রদর্শিত হয়।
                      </span>
                    </div>

                    {(user?.boundWallets.length || 0) < 5 ? (
                      <button
                        onClick={() => setIsAddingCard(!isAddingCard)}
                        className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 shadow-xs shrink-0"
                      >
                        <Plus size={13} /> নতুন কার্ড যোগ করুন
                      </button>
                    ) : (
                      <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full shrink-0">
                        ৫টি পূর্ণ হয়েছে
                      </span>
                    )}
                  </div>

                  {/* Add Bound Wallet Form */}
                  {isAddingCard && (user?.boundWallets.length || 0) < 5 && (
                    <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2.5 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-gray-900">নতুন পেমেন্ট ওয়ালেট যুক্ত করুন</span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                          ⚠️ একবার যুক্ত হলে পরিবর্তন বা রিমুভ করা যাবে না
                        </span>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block mb-1">মেথড বাছাই করুন:</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['nagad', 'bkash', 'rocket'] as const).map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setNewCardType(m)}
                              className={`py-1.5 rounded-lg text-xs font-bold uppercase border transition-all ${
                                newCardType === m
                                  ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-300'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block mb-1">অ্যাকাউন্টধারীর নাম:</label>
                        <input
                          type="text"
                          value={newCardName}
                          onChange={e => setNewCardName(e.target.value)}
                          placeholder="আপনার নাম লিখুন"
                          className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-gray-900 font-bold focus:outline-none focus:border-red-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block mb-1">মোবাইল ওয়ালেট নাম্বার (১১ সংখ্যা):</label>
                        <input
                          type="text"
                          maxLength={11}
                          value={newCardNumber}
                          onChange={e => setNewCardNumber(e.target.value)}
                          placeholder="017xxxxxxxx"
                          className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-red-600"
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleAddBoundWallet}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-xs"
                        >
                          নিশ্চিত ও সংরক্ষণ করুন
                        </button>
                        <button
                          onClick={() => setIsAddingCard(false)}
                          className="px-3 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg text-xs"
                        >
                          বাতিল
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of Bound Wallets (Permanently locked, masked last 3 digits) */}
                  <div className="space-y-2">
                    {user?.boundWallets.map(w => (
                      <div
                        key={w.id}
                        className="p-3.5 bg-gradient-to-r from-[#240306] via-[#38060c] to-[#240306] text-white rounded-2xl border border-[#6b141d] flex justify-between items-center shadow-md"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="uppercase text-[11px] font-black px-2 py-0.5 rounded bg-amber-400 text-black">
                              {w.type}
                            </span>
                            <span className="text-xs font-bold text-amber-200">{w.accountName}</span>
                          </div>
                          {/* Masked with only last 3 digits visible e.g. 017*****485 */}
                          <span className="font-mono text-base font-black tracking-widest text-yellow-300 block mt-1">
                            {maskAccountNumber(w.accountNumber)}
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">সংযুক্ত: {w.addedAt}</span>
                        </div>

                        {/* Permanent Lock badge - No Delete / Edit permitted per user rule */}
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[10px] font-black flex items-center gap-1 shadow-xs">
                            <Lock size={11} /> লকড
                          </span>
                          <span className="text-[9px] text-gray-400">অপরিবর্তনযোগ্য</span>
                        </div>
                      </div>
                    ))}
                    {(!user?.boundWallets || user.boundWallets.length === 0) && (
                      <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-4 space-y-1">
                        <CreditCard size={28} className="mx-auto text-gray-400 mb-1" />
                        <p className="text-gray-700 text-xs font-bold">কোনো ওয়ালেট বা কার্ড সংযুক্ত নেই।</p>
                        <p className="text-gray-500 text-[11px]">উত্তোলন করার জন্য সর্বোচ্চ ৫টি বিকাশ, নগদ বা রকেট অ্যাকাউন্ট যুক্ত করুন।</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 8. ACCOUNT INFO */}
              {subModal === 'account_info' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-gray-50 rounded-2xl border space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-500">ইউজারনেম</span>
                      <span className="font-mono font-bold text-gray-900">{user?.username}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200 items-center">
                      <span className="text-gray-500">ডাকনাম</span>
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <span>{user?.nickname}</span>
                        <button
                          onClick={() => setSubModal('edit_nickname')}
                          className="text-red-600 font-bold text-[11px] hover:underline"
                        >
                          [পরিবর্তন]
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-500">ফোন নম্বর</span>
                      <span className="font-mono font-bold text-gray-900">{user?.phone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-500">ভিআইপি স্ট্যাটাস</span>
                      <span className="font-bold text-amber-600">VIP {user?.vipLevel ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-500">নিরাপত্তা স্কোর</span>
                      <span className="font-bold text-emerald-600">উচ্চ (Strong - 100%)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">অ্যাকাউন্ট তৈরির তারিখ</span>
                      <span className="text-gray-800">{user?.joinedDate}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. SECURITY CENTER */}
              {subModal === 'security' && (
                <div className="space-y-3 text-xs">
                  <div className="flex gap-2 border-b pb-2">
                    <button
                      onClick={() => setSecurityTab('trx_pin')}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-center ${
                        securityTab === 'trx_pin' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      উত্তোলন ট্রানজেকশন পিন
                    </button>
                    <button
                      onClick={() => setSecurityTab('password')}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-center ${
                        securityTab === 'password' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      লগইন পাসওয়ার্ড
                    </button>
                  </div>

                  {securityTab === 'trx_pin' && (
                    <div className="space-y-3">
                      <p className="text-gray-600 text-[11px]">
                        ক্যাশআউট ও টাকা উত্তোলনের সময় সুরক্ষার জন্য ৬ সংখ্যার গোপন ট্রানজেকশন পিন কোড সেট করুন।
                      </p>
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">নতুন ৬ সংখ্যার পিন:</label>
                        <input
                          type="password"
                          maxLength={6}
                          value={newTrxPin}
                          onChange={e => setNewTrxPin(e.target.value)}
                          placeholder="যেমন: 123456"
                          className="w-full border border-gray-300 rounded-xl p-2.5 text-center tracking-widest font-mono text-base font-black focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <button
                        onClick={handleSaveTrxPin}
                        className="w-full py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-md"
                      >
                        পিন সংরক্ষণ করুন
                      </button>
                    </div>
                  )}

                  {securityTab === 'password' && (
                    <div className="space-y-3">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">নতুন পাসওয়ার্ড:</label>
                        <input
                          type="password"
                          value={newLoginPass}
                          onChange={e => setNewLoginPass(e.target.value)}
                          placeholder="কমপক্ষে ৬ অক্ষর"
                          className="w-full border border-gray-300 rounded-xl p-2 text-xs font-bold focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">পাসওয়ার্ড নিশ্চিত করুন:</label>
                        <input
                          type="password"
                          value={confirmLoginPass}
                          onChange={e => setConfirmLoginPass(e.target.value)}
                          placeholder="পুনরায় একই পাসওয়ার্ড দিন"
                          className="w-full border border-gray-300 rounded-xl p-2 text-xs font-bold focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <button
                        onClick={handleSaveLoginPassword}
                        className="w-full py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-md"
                      >
                        পাসওয়ার্ড আপডেট করুন
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 10. INVITE FRIENDS */}
              {subModal === 'invite' && (
                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-gradient-to-r from-red-700 to-rose-800 text-white rounded-2xl text-center space-y-1 shadow-md">
                    <span className="text-[11px] font-bold opacity-90 uppercase">রেফারেল কমিশন আয়</span>
                    <h3 className="text-2xl font-black font-num">৳ ১,৪৮০.০০</h3>
                    <span className="text-[10px] opacity-80 block">মোট আমন্ত্রিত বন্ধু: ১২ জন</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border space-y-2">
                    <label className="text-[11px] font-bold text-gray-700 block">আপনার রেফারেল লিংক:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value="https://livexwin.com/reg?ref=LXW99"
                        className="w-full bg-white border border-gray-300 rounded-lg p-2 font-mono text-[11px] text-gray-800 font-bold"
                      />
                      <button
                        onClick={() => {
                          soundFX.playClick();
                          navigator.clipboard.writeText('https://livexwin.com/reg?ref=LXW99');
                          alert('রেফারেল লিংক কপি করা হয়েছে!');
                        }}
                        className="px-3 bg-red-600 text-white rounded-lg font-bold shrink-0 shadow-xs"
                      >
                        কপি
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-[11px]">
                    <span className="font-bold text-amber-900 block">কমিশন রেট:</span>
                    <p className="text-gray-700">• লেভেল ১ (সরাসরি রেফার): ০.৬% আনলিমিটেড টার্নওভার কমিশন</p>
                    <p className="text-gray-700">• লেভেল ২: ০.৩% কমিশন</p>
                    <p className="text-gray-700">• লেভেল ৩: ০.১% কমিশন</p>
                  </div>
                </div>
              )}

              {/* 11. MISSIONS */}
              {subModal === 'missions' && (
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border flex items-center justify-between">
                    <div>
                      <span className="font-black text-gray-900 block">১. দৈনিক সাইন-ইন সম্পন্ন</span>
                      <span className="text-[10px] text-gray-500">পুরস্কার: ৳১৮ - ৳৫০</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                      সম্পন্ন
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border flex items-center justify-between">
                    <div>
                      <span className="font-black text-gray-900 block">২. গোল্ডেন এগ ভাঙুন</span>
                      <span className="text-[10px] text-gray-500">প্রতিদিন ৩টি ফ্রি সোনার ডিম</span>
                    </div>
                    <button
                      onClick={() => {
                        setSubModal('none');
                        onOpenEggGame();
                      }}
                      className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-black font-extrabold rounded-lg text-xs shadow-xs"
                    >
                      এগ খেলুন
                    </button>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border flex items-center justify-between">
                    <div>
                      <span className="font-black text-gray-900 block">৩. ১৭টি রেড প্যাকেট ওপেন</span>
                      <span className="text-[10px] text-gray-500">ফ্রি ক্যাশ ও জ্যাকপট ড্র</span>
                    </div>
                    <button
                      onClick={() => {
                        setSubModal('none');
                        onOpenRedPacket();
                      }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-lg text-xs shadow-xs"
                    >
                      প্যাকেট খুলুন
                    </button>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border flex items-center justify-between">
                    <div>
                      <span className="font-black text-gray-900 block">৪. ৫০০ টাকা প্রথম জমা সম্পন্ন</span>
                      <span className="text-[10px] text-gray-500">পুরস্কার: ১০০% বোনাস ক্যাশ</span>
                    </div>
                    <button
                      onClick={() => {
                        setSubModal('none');
                        onOpenDeposit();
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-xs shadow-xs"
                    >
                      ডিপোজিট
                    </button>
                  </div>
                </div>
              )}

              {/* 12. MAILBOX */}
              {subModal === 'mail' && (
                <div className="space-y-2">
                  {!selectedMail ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {mailList.map(m => (
                        <div
                          key={m.id}
                          onClick={() => {
                            soundFX.playClick();
                            storage.markMailRead(m.id);
                            setSelectedMail(m);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            m.read ? 'bg-gray-50 border-gray-200' : 'bg-amber-50/80 border-amber-300 shadow-xs'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-black text-gray-900 text-xs flex items-center gap-1.5">
                              {!m.read && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
                              {m.title}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">{m.date}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-1 line-clamp-1">{m.summary}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <button
                        onClick={() => setSelectedMail(null)}
                        className="text-red-600 font-bold flex items-center gap-1 text-[11px]"
                      >
                        ‹ মেসেজ তালিকায় ফিরুন
                      </button>
                      <div className="p-3.5 bg-gray-50 rounded-2xl border space-y-2">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h4 className="font-black text-gray-900 text-sm">{selectedMail.title}</h4>
                          <span className="text-[10px] text-gray-400 font-mono">{selectedMail.date}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 block">প্রেরক: {selectedMail.sender}</span>
                        <p className="text-gray-800 leading-relaxed text-xs pt-1">{selectedMail.content}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 13. FEEDBACK */}
              {subModal === 'feedback' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">পরামর্শের ক্যাটাগরি:</label>
                    <select
                      value={feedbackCategory}
                      onChange={e => setFeedbackCategory(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-bold text-gray-800"
                    >
                      <option value="গেম সম্পর্কিত">গেম সম্পর্কিত পরামর্শ</option>
                      <option value="ডিপোজিট / উত্তোলন">ডিপোজিট বা উত্তোলন সংক্রান্ত</option>
                      <option value="ওয়েবসাইট বা অ্যাপ বাগ">ওয়েবসাইট বা অ্যাপের সমস্যা</option>
                      <option value="অন্যান্য প্রস্তাবনা">অন্যান্য সাধারণ প্রস্তাবনা</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">আপনার বার্তা বা মতামত:</label>
                    <textarea
                      rows={4}
                      value={feedbackMessage}
                      onChange={e => setFeedbackMessage(e.target.value)}
                      placeholder="আপনার মূল্যবান মতামত বিস্তারিত লিখুন..."
                      className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-red-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">যোগাযোগের মোবাইল বা ইমেইল (ঐচ্ছিক):</label>
                    <input
                      type="text"
                      value={feedbackContact}
                      onChange={e => setFeedbackContact(e.target.value)}
                      placeholder="017xxxxxxxx বা email@example.com"
                      className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <button
                    onClick={handleSubmitFeedback}
                    className="w-full py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-md active:scale-95 transition-all"
                  >
                    পরামর্শ জমা দিন
                  </button>
                </div>
              )}

              {/* 14. LIVE SUPPORT CHAT */}
              {subModal === 'live_support' && (
                <div className="flex flex-col h-[400px]">
                  {/* Chat Top Agent Header */}
                  <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-xl mb-2 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      স
                    </div>
                    <div>
                      <span className="font-black text-xs text-gray-900 block">সোনিয়া (লাইভ কাস্টমার সাপোর্ট)</span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        অনলাইন সক্রিয়
                      </span>
                    </div>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-2 p-2 border rounded-xl bg-gray-50/70 mb-2 text-xs">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-2.5 rounded-2xl shadow-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-red-600 text-white rounded-br-none'
                              : 'bg-white text-gray-800 border rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-gray-400 mt-0.5 px-1">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Quick helpful FAQ prompt chips */}
                  <div className="flex gap-1 overflow-x-auto pb-1 mb-1.5 shrink-0">
                    {[
                      'ডিপোজিট কতক্ষণে যোগ হয়?',
                      'সর্বনিম্ন উত্তোলনের সীমা কত?',
                      'উত্তোলন পিন ভুলে গেছি',
                      'বোনাস শর্ত কি?',
                    ].map(chip => (
                      <button
                        key={chip}
                        onClick={() => handleSendChatMessage(chip)}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-[10px] font-bold whitespace-nowrap active:scale-95"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input Bar */}
                  <div className="flex gap-1.5 shrink-0">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSendChatMessage();
                      }}
                      placeholder="আপনার বার্তা লিখুন..."
                      className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-red-600"
                    />
                    <button
                      onClick={() => handleSendChatMessage()}
                      className="px-3.5 bg-red-600 text-white rounded-xl flex items-center justify-center active:scale-90 shadow-xs"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* 15. HELP CENTER FAQ */}
              {subModal === 'help_center' && (
                <div className="space-y-2 text-xs">
                  {[
                    {
                      q: 'বিকাশ ও নগদ দিয়ে কীভাবে দ্রুত ডিপোজিট করব?',
                      a: 'হোমপেজ বা এই ড্যাশবোর্ড থেকে "জমা দিন" বাটনে ক্লিক করুন। প্রদত্ত এজেন্ট নম্বরে টাকা সেন্ড মানি বা ক্যাশআউট করে ফিরতি এসএমএস থেকে ট্রানজেকশন আইডি (TrxID) কপি করে ফর্মটিতে বসিয়ে নিশ্চিত করুন। ১-৩ মিনিটে ব্যালেন্স যোগ হবে।',
                    },
                    {
                      q: 'টাকা উত্তোলন হতে সাধারণত কত সময় লাগে?',
                      a: 'LivexWin এ ২৪/৭ স্বয়ংক্রিয় ক্যাশআউট সিস্টেম রয়েছে। প্রত্যাহারের অনুরোধ জানানোর পর সাধারণ সময়ে ৩ থেকে ১৫ মিনিটের মধ্যে সরাসরি আপনার নগদ বা বিকাশ অ্যাকাউন্টে টাকা পৌঁছে যায়।',
                    },
                    {
                      q: 'ট্রানজেকশন পাসওয়ার্ড বা পিন ভুলে গেলে কী করব?',
                      a: 'সদস্য সেন্টারের "সুরক্ষা কেন্দ্র" এ গিয়ে যেকোনো সময় নিজের ৬ সংখ্যার নতুন ট্রানজেকশন পিন পুনরায় সেট করে নিতে পারেন।',
                    },
                    {
                      q: 'গেমের RTP (রিটার্ন টু প্লেয়ার) বলতে কী বোঝায়?',
                      a: 'আরটিপি হলো মোট বাজির পরিমাণের কত শতাংশ গ্রাহকদের মধ্যে বিজয়ী হিসেবে বিতরণ করা হয়। LivexWin এ জিলি ও পিজি সফটের স্লটগুলোতে ৯৭.২% পর্যন্ত সর্বোচ্চ RTP নিশ্চিত করা আছে।',
                    },
                    {
                      q: 'বোনাসের টাকা উত্তোলন করার নিয়ম কি?',
                      a: 'প্রতিটি বোনাসে সাধারণত ১ গুণ (1x) বা সামান্য টার্নওভারের শর্ত থাকে। যেকোনো স্লট বা গেমে সমপরিমাণ বাজি ধরা সম্পন্ন হলেই সম্পূর্ণ টাকা মূল ব্যালেন্সে যুক্ত হয়ে উত্তোলনযোগ্য হয়।',
                    },
                  ].map((faq, idx) => {
                    const isOpen = openFaqIdx === idx;
                    return (
                      <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                          className="w-full p-3 bg-gray-50 flex justify-between items-center text-left font-bold text-gray-900"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="p-3 bg-white text-gray-700 leading-relaxed text-[11px] border-t border-gray-100">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 16. APP DOWNLOAD */}
              {subModal === 'app_download' && (
                <div className="space-y-4 text-xs text-center py-2">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#550c12] to-amber-500 text-yellow-300 font-black text-2xl flex items-center justify-center mx-auto shadow-md">
                    LX
                  </div>
                  <div>
                    <h4 className="text-base font-black text-gray-900">LivexWin অফিসিয়াল অ্যাপ v2.8.4</h4>
                    <p className="text-[11px] text-gray-500">Android APK ও iOS WebClip সাপোর্ট সহ</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => {
                        soundFX.playWin();
                        alert('অ্যান্ড্রয়েড APK ডাউনলোড শুরু হয়েছে (5.2 MB)...');
                      }}
                      className="py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-xl shadow-md active:scale-95"
                    >
                      অ্যান্ড্রয়েড APK
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playWin();
                        alert('আইফোন ব্যবহারকারী: Safari ব্রাউজারের Share বাটন থেকে "Add to Home Screen" নির্বাচন করুন।');
                      }}
                      className="py-3 bg-gray-900 hover:bg-gray-800 text-white font-extrabold rounded-xl shadow-md active:scale-95"
                    >
                      আইওএস (iOS)
                    </button>
                  </div>
                </div>
              )}

              {/* RESCUE FUND (উদ্ধার তহবিল) */}
              {subModal === 'rescue_fund' && (
                <div className="space-y-3 text-xs text-center py-2">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-600 shadow-sm">
                    <LifeBuoy size={28} />
                  </div>
                  <h4 className="text-base font-black text-gray-900">দৈনিক উদ্ধার তহবিল (Rescue Fund)</h4>
                  <p className="text-[11px] text-gray-500">
                    দৈনিক গেমিং সহায়তা ও ব্যাক-আপ ক্যাশ রিফান্ড
                  </p>

                  <div className="p-3 bg-gray-50 rounded-2xl border text-left space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">ক্যাশব্যাক রেট:</span>
                      <span className="font-bold text-emerald-600">১০% দৈনিক</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">সর্বোচ্চ সীমা:</span>
                      <span className="font-bold text-yellow-600 font-num">৳ ৫০০ BDT</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const res = storage.claimRescueFund();
                      if (res.success) {
                        soundFX.playJackpot();
                        confetti({ particleCount: 80, spread: 60 });
                        alert(res.message);
                        onRefreshBalance();
                        setSubModal('none');
                      } else {
                        alert(res.message);
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black rounded-xl shadow-md text-xs cursor-pointer"
                  >
                    উদ্ধার তহবিল সংগ্রহ করুন
                  </button>
                </div>
              )}

              {/* 17. EDIT NICKNAME */}
              {subModal === 'edit_nickname' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-700 block">নতুন ডাকনাম দিন:</label>
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={e => setNicknameInput(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-600 font-bold"
                  />
                  <button
                    onClick={handleSaveNickname}
                    className="w-full py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    হালনাগাদ ও সংরক্ষণ করুন
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
