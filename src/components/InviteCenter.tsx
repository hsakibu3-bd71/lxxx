import React, { useState } from 'react';
import { UserProfile } from '../types';
import { soundFX } from '../utils/audio';
import { Share2, Copy, Users, DollarSign, Award, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface InviteCenterProps {
  user: UserProfile | null;
}

export const InviteCenter: React.FC<InviteCenterProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const username = user?.username || 't1206248521';
  const inviteLink = `https://livexwin.com/register?ref=${username}`;

  const handleCopy = () => {
    soundFX.playClick();
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-2 py-3 space-y-3 select-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4d070c] via-[#75111b] to-[#4d070c] p-3 rounded-2xl text-center border border-[#b81d28] shadow-md">
        <h2 className="text-lg font-black text-amber-300 flex items-center justify-center gap-1.5">
          <Share2 size={20} className="text-yellow-400" />
          <span>আমন্ত্রণ ও কমিশন কেন্দ্র (Agency Center)</span>
        </h2>
        <p className="text-xs text-white/90 mt-0.5">
          বন্ধুদের আমন্ত্রণ জানান এবং প্রতিটি ডিপোজিট ও বাজিতে আজীবন কমিশন পান
        </p>
      </div>

      {/* Referral Link & Code Box */}
      <div className="bg-[#240407] p-4 rounded-2xl border border-[#5c0d15] shadow-lg space-y-3">
        <div>
          <span className="text-xs font-bold text-gray-300 block mb-1">
            আপনার ব্যক্তিগত আমন্ত্রণ লিংক:
          </span>
          <div className="bg-black/60 p-2.5 rounded-xl border border-gray-700 flex items-center justify-between font-mono text-xs text-yellow-300">
            <span className="truncate pr-2">{inviteLink}</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-black font-extrabold rounded-lg text-xs shrink-0 flex items-center gap-1 active:scale-95 transition-all shadow"
            >
              {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
              <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center bg-[#180204] p-3 rounded-xl border border-red-950">
          <div>
            <span className="text-[11px] text-gray-400 block">আপনার রেফারেল কোড:</span>
            <span className="text-base font-black text-white font-mono">{username}</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(username);
              soundFX.playClick();
              alert('রেফারেল কোড কপি করা হয়েছে!');
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs"
          >
            কোড কপি
          </button>
        </div>
      </div>

      {/* Commission Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#240407] p-3 rounded-xl border border-[#5c0d15] text-center">
          <Users size={20} className="text-amber-400 mx-auto mb-1" />
          <span className="text-[10px] text-gray-400 font-bold block">মোট আমন্ত্রিত বন্ধু</span>
          <span className="text-xl font-black text-white font-num mt-0.5 block">১২ জন</span>
        </div>

        <div className="bg-[#240407] p-3 rounded-xl border border-[#5c0d15] text-center">
          <DollarSign size={20} className="text-emerald-400 mx-auto mb-1" />
          <span className="text-[10px] text-gray-400 font-bold block">মোট অর্জিত কমিশন</span>
          <span className="text-xl font-black text-emerald-400 font-num mt-0.5 block">৳ ২,৪৫০.০০</span>
        </div>
      </div>

      {/* 3 Commission Tiers */}
      <div className="bg-[#240407] p-3.5 rounded-2xl border border-[#5c0d15] shadow-lg">
        <h4 className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
          <Award size={14} /> ৩ স্তরের কমিশন বন্টন নীতি:
        </h4>
        <div className="space-y-1.5 text-xs text-gray-300">
          <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-gray-800">
            <span>লেভেল ১ (সরাসরি আমন্ত্রিত বন্ধু):</span>
            <strong className="text-amber-400 font-mono">০.৬% টার্নওভার</strong>
          </div>
          <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-gray-800">
            <span>লেভেল ২ (বন্ধুর বন্ধু):</span>
            <strong className="text-amber-400 font-mono">০.৩% টার্নওভার</strong>
          </div>
          <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-gray-800">
            <span>লেভেল ৩ (সাব-এজেন্ট):</span>
            <strong className="text-amber-400 font-mono">০.১% টার্নওভার</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
