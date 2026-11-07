import React from 'react';
import { soundFX } from '../utils/audio';
import { Gift, Sparkles, ChevronRight, ArrowRight } from 'lucide-react';

interface PromotionsCenterProps {
  onOpenDeposit: () => void;
  onOpenEggGame: () => void;
  onOpenRedPacket: () => void;
  onOpenInvite: () => void;
  onClaimDaily: () => void;
  onOpenWheel?: () => void;
  onOpenRescueFund?: () => void;
}

export const PromotionsCenter: React.FC<PromotionsCenterProps> = ({
  onOpenDeposit,
  onOpenEggGame,
  onOpenRedPacket,
  onOpenInvite,
  onClaimDaily,
  onOpenWheel,
  onOpenRescueFund,
}) => {
  const promos = [
    {
      id: 'reg-bonus',
      tag: 'নতুন ইউজার স্পেশাল',
      title: 'রেজিস্ট্রেশন রিওয়ার্ড সর্বোচ্চ ৳৬০ + ৳৮,৮৮৮',
      desc: 'অ্যাপ ডাউনলোড করে রেজিস্টার করলেই পাবেন তাৎক্ষণিক ফ্রি বোনাস। প্রতিদিন ফ্রি লগইন রিওয়ার্ড সর্বোচ্চ ৳৯,৯৯৯ পর্যন্ত!',
      badge: 'APP রিওয়ার্ড',
      btnText: 'রিওয়ার্ড দাবি করুন',
      action: onClaimDaily,
      bg: 'from-[#4a080d] to-[#250407]',
      border: 'border-[#7d141e]',
    },
    {
      id: 'golden-egg',
      tag: 'দৈনিক লাকি ইভেন্ট',
      title: 'প্রতিদিন গোল্ডেন এগ ভাঙুন - সর্বোচ্চ ৯৯,৯৯৯ টাকা',
      desc: 'VIP ১-৪: ৳৯ | VIP ৫-১০: ৳৯৯ | VIP ১১+: ৳১৯৯। যেকোনো এগে স্পর্শ করে তাৎক্ষণিক ক্যাশ জিতে নিন!',
      badge: '৳৯৯,৯৯৯',
      btnText: 'এগ ভাঙুন',
      action: onOpenEggGame,
      bg: 'from-[#4a0314] to-[#220108]',
      border: 'border-yellow-500',
    },
    {
      id: 'lucky-wheel',
      tag: 'গ্র্যান্ড ড্র ২০২৬',
      title: 'লাকি স্পিন হুইল - আইফোন ১৮ প্রো ম্যাক্স ও ক্যাশ ড্র',
      desc: 'কাউন্টডাউন শেষ হওয়ার আগে স্পিন করুন! জিতুন iPhone 18 Pro Max এবং নগদ ৳৮,৮৮৮ পর্যন্ত মেগা প্রাইজ।',
      badge: 'iPhone 18',
      btnText: 'হুইল স্পিন করুন',
      action: onOpenWheel || onOpenEggGame,
      bg: 'from-[#2e0854] to-[#120324]',
      border: 'border-purple-500',
    },
    {
      id: 'red-packet',
      tag: 'দৈনিক উপহার',
      title: 'প্রতিদিন জমা করুন ১৭টি রেড প্যাকেট',
      desc: 'প্রতিদিন 00:00-03:00 ফ্রি ক্যাশ রেইনে ১৭টি রেড প্যাকেট আনলক করে নগদ টাকা জিতে নিন।',
      badge: '১৭টি প্যাকেট',
      btnText: 'রেড প্যাকেট খুলুন',
      action: onOpenRedPacket,
      bg: 'from-[#3a0614] to-[#1c0209]',
      border: 'border-rose-600',
    },
    {
      id: 'rescue-fund',
      tag: 'সুরক্ষা তহবিল',
      title: 'দৈনিক উদ্ধার তহবিল - ১০% ক্যাশব্যাক সুরক্ষা',
      desc: 'গেমিং চলাকালীন যেকোনো ক্ষতির জন্য লাইভএক্সউইন প্লাটফর্ম থেকে সরাসরি উদ্ধার তহবিল রিফান্ড।',
      badge: '১০% রিফান্ড',
      btnText: 'তহবিল নিন',
      action: onOpenRescueFund || onOpenDeposit,
      bg: 'from-[#03291d] to-[#01140e]',
      border: 'border-emerald-600',
    },
    {
      id: 'dep-bonus',
      tag: 'প্রতিটি জমার রিওয়ার্ড',
      title: 'প্রতিটি জমায় প্রতিবার পান সর্বোচ্চ ৩,৮৮৮ টাকা',
      desc: 'নগদ, বিকাশ ও রকেটের মাধ্যমে প্রতিটি ডিপোজিটে পান তাৎক্ষণিক ক্যাশ রিওয়ার্ড। প্রথম রিচার্জে +১৮০% ওয়েলকাম বোনাস!',
      badge: '+১৮০% বোনাস',
      btnText: 'এখনই জমা দিন',
      action: onOpenDeposit,
      bg: 'from-[#421703] to-[#200a01]',
      border: 'border-amber-600',
    },
    {
      id: 'invite-friend',
      tag: 'রেফারেল কমিশন',
      title: 'একজন বন্ধুকে আমন্ত্রণ জানালে সর্বোচ্চ ৳২,৮৯৯ রিওয়ার্ড',
      desc: 'আপনার আমন্ত্রণ লিংকের মাধ্যমে বন্ধুদের যুক্ত করুন এবং তাদের প্রতিটি বাজিতে পান সর্বোচ্চ কমিশন!',
      badge: '৳২,৮৯৯',
      btnText: 'আমন্ত্রণ লিংক নিন',
      action: onOpenInvite,
      bg: 'from-[#1c093a] to-[#0c031c]',
      border: 'border-purple-600',
    },
  ];

  return (
    <div className="w-full max-w-lg mx-auto px-2 py-3 space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5a0910] via-[#85121c] to-[#5a0910] p-3 rounded-2xl text-center border border-[#b81d28] shadow-md">
        <h2 className="text-lg font-black text-amber-300 flex items-center justify-center gap-1.5">
          <Gift size={20} className="text-yellow-400" />
          <span>প্রমোশন সেন্টার (Promotions)</span>
        </h2>
        <p className="text-xs text-white/90 mt-0.5">
          সকল বোনাস ও স্পেশাল অফার এক নজরে
        </p>
      </div>

      {/* Promos List */}
      <div className="space-y-2.5">
        {promos.map(p => (
          <div
            key={p.id}
            className={`bg-gradient-to-r ${p.bg} p-3.5 rounded-2xl border ${p.border} shadow-lg relative overflow-hidden flex flex-col justify-between`}
          >
            {/* Tag Badge */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="bg-black/60 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-yellow-500/30 flex items-center gap-1">
                <Sparkles size={10} /> {p.tag}
              </span>
              <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow">
                {p.badge}
              </span>
            </div>

            {/* Title & Desc */}
            <h3 className="text-sm font-black text-white leading-tight mb-1">
              {p.title}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              {p.desc}
            </p>

            {/* Action button */}
            <button
              onClick={() => {
                soundFX.playClick();
                p.action();
              }}
              className="w-full py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold rounded-xl text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>{p.btnText}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
