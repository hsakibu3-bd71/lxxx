import React, { useState, useEffect } from 'react';
import { soundFX } from '../utils/audio';
import { X, Smartphone, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';
import { LivexWinLogo } from './LivexWinLogo';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installGuideShown, setInstallGuideShown] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    soundFX.playClick();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        soundFX.playWin();
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      setInstallGuideShown(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 select-none overflow-y-auto">
      <div className="bg-gradient-to-b from-[#240306] via-[#160103] to-[#0d0102] border-2 border-[#80121d] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative text-gray-200">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#4d0910] via-[#6e0c16] to-[#4d0910] px-4 py-3 flex items-center justify-between border-b border-[#8a131f]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black shadow-md">
              <Smartphone size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">LivexWin মোবাইল অ্যাপ</h3>
              <p className="text-[10px] text-amber-200">১-ক্লিকে সরাসরি ফোনে ইনস্টল করুন</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Visual Showcase Card */}
          <div className="bg-gradient-to-b from-[#38060b] to-[#1c0205] p-3.5 rounded-2xl border border-[#6b0f19] flex items-center gap-3 shadow-inner">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e50914] to-[#7a030a] p-1 shadow-lg shrink-0 flex items-center justify-center border border-amber-400/50">
              <span className="text-2xl">📱</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <LivexWinLogo size="sm" showDomain={false} />
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold border border-emerald-500/40">
                  সংস্করণ ২.০
                </span>
              </div>
              <p className="text-xs text-gray-300 font-medium leading-relaxed">
                দ্রুতগতির গেমপ্লে, তাৎক্ষণিক ডিপোজিট ও ক্যাশআউট সুবিধার জন্য অফিশিয়াল মোবাইল অ্যাপ ব্যবহার করুন।
              </p>
            </div>
          </div>

          {/* Key Automated Features */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1 text-[11px]">
                <RefreshCw size={13} className="text-amber-400" />
                <span>অটোমেটিক আপডেট</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                সকল নতুন গেম ও ইভেন্ট স্বয়ংক্রিয়ভাবে যুক্ত হয়।
              </p>
            </div>

            <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1 text-[11px]">
                <Zap size={13} />
                <span>সুপার ফাস্ট স্পিড</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                ফুল স্ক্রিন মোড ও স্মুথ ক্যাসিনো অভিজ্ঞতা।
              </p>
            </div>
          </div>

          {installGuideShown && (
            <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-start gap-2">
              <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <span>
                আপনার ব্রাউজারের উপরে ৩-ডট মেনু <strong>[⋮]</strong> চেপে <strong>"Add to Home screen"</strong> বা <strong>"Install App"</strong> সিলেক্ট করুন।
              </span>
            </div>
          )}

          {/* Action 1: 1-Click Direct Install to Phone */}
          <div className="space-y-2">
            <button
              onClick={handleInstallPWA}
              className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-sm rounded-xl shadow-[0_4px_16px_rgba(245,158,11,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone size={18} />
              <span>{isInstalled ? '✓ অ্যাপটি ফোনে যুক্ত হয়েছে' : '১-ক্লিকে ফোনে সরাসরি ইনস্টল করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
