import React, { useState } from 'react';
import { PHP_PROJECT_FILES } from '../services/phpProjectFiles';
import { downloadPhpFullProjectZip } from '../services/zipExporter';
import { soundFX } from '../utils/audio';
import {
  Download,
  X,
  FileCode,
  Copy,
  Check,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface DownloadCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadCenterModal: React.FC<DownloadCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'download' | 'explorer' | 'cpanel_guide'>('download');
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const currentFile = PHP_PROJECT_FILES[selectedFileIdx] || PHP_PROJECT_FILES[0];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.content);
      soundFX.playSuccess();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = currentFile.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      soundFX.playSuccess();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleClientSideBlobDownload = async () => {
    soundFX.playClick();
    setIsGenerating(true);
    setDownloadSuccess(false);
    try {
      await downloadPhpFullProjectZip();
      soundFX.playSuccess();
      setDownloadSuccess(true);
    } catch (err) {
      console.error('JSZip generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto select-none"
      onContextMenu={e => e.preventDefault()}
    >
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#1c0205] via-[#140103] to-[#0a0002] border border-[#6b0f19] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2c0307] via-[#4a0810] to-[#2c0307] border-b border-[#6b0f19] px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Download size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-yellow-300">
                  LivexWin PHP ফুল প্রজেক্ট ডাউনলোড ও কোড সেন্টার
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  100% কার্যকরী
                </span>
              </div>
              <p className="text-[11px] text-gray-300">
                SoftAggregator Seamless Wallet, আইফ্রেম, মোবাইল ফ্রেন্ডলি ও সোর্স কোড প্রটেকশন সহ
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-gray-400 hover:text-white border border-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#120103] px-3 sm:px-6 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('download');
            }}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'download'
                ? 'border-yellow-400 text-yellow-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Zap size={14} />
            <span>ডাউনলোড অপশন (৩টি পদ্ধতি)</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('explorer');
            }}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'explorer'
                ? 'border-yellow-400 text-yellow-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileCode size={14} />
            <span>কোড এক্সপ্লোরার ও ১-ক্লিক কপি ({PHP_PROJECT_FILES.length} ফাইল)</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('cpanel_guide');
            }}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'cpanel_guide'
                ? 'border-yellow-400 text-yellow-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Server size={14} />
            <span>cPanel / হোস্টিং ইনস্টলেশন গাইড</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-gray-200">
          {/* TAB 1: 3-WAY BULLETPROOF DOWNLOAD OPTIONS */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-red-950/30 to-amber-950/40 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                <Sparkles size={20} className="text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-yellow-300">
                    আপনার ব্রাউজারে জিপ ফাইল ডাউনলোড নিশ্চিত করার ৩টি উপায় যুক্ত করা হয়েছে:
                  </p>
                  <p className="text-gray-300 mt-1">
                    ব্রাউজার ব্লকার বা আইফ্রেম পলিসির কারণে যেকোনো ১টি ফেইল হলেও অন্যটি ১০০% কাজ করবে।
                  </p>
                </div>
              </div>

              {/* Download Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Method 1: Backend Forced Streaming */}
                <div className="bg-[#180205] border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative group hover:border-amber-400 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                        পদ্ধতি ১ (সুপার ফাস্ট)
                      </span>
                      <Server size={16} className="text-amber-400" />
                    </div>
                    <h3 className="text-sm font-black text-white">ডাইরেক্ট স্ট্রিমিং ডাউনলোড</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      সার্ভার থেকে বিশেষ <code>Content-Disposition: attachment</code> হেডারে ফাইলটি সরাসরি আপনার ডাউনলোডে সেভ হবে।
                    </p>
                  </div>
                  <a
                    href="/api/download/php-zip"
                    download="LivexWin-PHP-Full-Project-with-Installer.zip"
                    onClick={() => soundFX.playSuccess()}
                    className="mt-4 w-full py-2.5 px-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <Download size={14} />
                    <span>ডাউনলোড শুরু করুন (পদ্ধতি ১)</span>
                  </a>
                </div>

                {/* Method 2: Client-side In-Memory JSZip */}
                <div className="bg-[#180205] border border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative group hover:border-emerald-400 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        পদ্ধতি ২ (ব্রাউজার মেমোরি)
                      </span>
                      <Zap size={16} className="text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-black text-white">ইনস্ট্যান্ট ব্লব জিপ জেনারেটর</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      কোনো সার্ভার ট্রাফিক ছাড়াই সরাসরি আপনার ব্রাউজারের RAM-এ জিপ তৈরি করে সেভ করে।
                    </p>
                  </div>
                  <button
                    onClick={handleClientSideBlobDownload}
                    disabled={isGenerating}
                    className="mt-4 w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>জিপ তৈরি হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>ব্লব জিপ ডাউনলোড (পদ্ধতি ২)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Method 3: Direct Static File Link */}
                <div className="bg-[#180205] border border-rose-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative group hover:border-rose-400 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                        পদ্ধতি ৩ (রুট ফাইল)
                      </span>
                      <ShieldCheck size={16} className="text-rose-400" />
                    </div>
                    <h3 className="text-sm font-black text-white">স্ট্যাটিক সার্ভার লিংক</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      পাবলিক ডিরেক্টরিতে হোস্ট করা রেডিমেড জিপ ফাইলের অলটারনেটিভ সরাসরি লিংক।
                    </p>
                  </div>
                  <a
                    href="/LivexWin-PHP-Full-Project-with-Installer.zip"
                    download="LivexWin-PHP-Full-Project-with-Installer.zip"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundFX.playSuccess()}
                    className="mt-4 w-full py-2.5 px-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <Download size={14} />
                    <span>রুট জিপ ডাউনলোড (পদ্ধতি ৩)</span>
                  </a>
                </div>
              </div>

              {downloadSuccess && (
                <div className="p-3 bg-emerald-900/60 border border-emerald-500 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>জিপ ফাইল সফলভাবে তৈরি ও আপনার ব্রাউজারে ডাউনলোড শুরু হয়েছে!</span>
                </div>
              )}

              {/* Package Summary Box */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-2.5 text-xs">
                <h4 className="font-bold text-yellow-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>এই জিপ ফাইলে যা যা অন্তর্ভুক্ত রয়েছে:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 font-mono">✓</span>
                    <span><strong>install.php</strong> — ডাটাবেস ১-ক্লিক অটোমেটিক সেটআপ ইন্সটলার</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 font-mono">✓</span>
                    <span><strong>index.php</strong> — সম্পূর্ণ লাইভক্সউইন ফ্রন্টএন্ড উইথ আইফ্রেম & সিকিউরিটি গার্ড</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 font-mono">✓</span>
                    <span><strong>api/softaggregator.php</strong> — SoftAggregator ৪০,০০০+ ক্যাসিনো গেম ক্লায়েন্ট</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 font-mono">✓</span>
                    <span><strong>api/softaggregator_callback.php</strong> — সিমলেস ওয়ালেট কলব্যাক (BDT Cents & MD5)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 font-mono">✓</span>
                    <span><strong>admin/index.php</strong> — মাস্টার অ্যাডমিন প্যানেল, প্রমোশন & কলব্যাক টেস্টার</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 font-mono">✓</span>
                    <span><strong>database.sql</strong> — ১০০% সম্পূর্ণ মাইএসকিউএল ডাটাবেস টেবিল স্কিমা</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 font-mono">✓</span>
                    <span><strong>game_frame.php</strong> — রেসপনসিভ ক্যাসিনো আইফ্রেম ইঞ্জিন ও লাইভ ব্যালেন্স সিঙ্ক</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 font-mono">✓</span>
                    <span><strong>মোবাইল ফ্রেন্ডলি অ্যান্টি-জুম</strong> ও <strong>সোর্স কোড প্রটেকশন</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE EXPLORER & 1-CLICK COPY */}
          {activeTab === 'explorer' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[55vh]">
              {/* File List */}
              <div className="lg:col-span-1 bg-[#120103] border border-white/10 rounded-2xl p-2 overflow-y-auto space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 block">
                  প্রজেক্টের ফাইল তালিকা ({PHP_PROJECT_FILES.length})
                </span>
                {PHP_PROJECT_FILES.map((file, idx) => (
                  <button
                    key={file.path}
                    onClick={() => {
                      soundFX.playClick();
                      setSelectedFileIdx(idx);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                      selectedFileIdx === idx
                        ? 'bg-amber-500/20 border border-amber-400/50 text-yellow-300 font-bold'
                        : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode size={14} className={selectedFileIdx === idx ? 'text-amber-400' : 'text-gray-500'} />
                      <span className="font-mono truncate">{file.path}</span>
                    </div>
                    <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-gray-400 uppercase">
                      {file.category}
                    </span>
                  </button>
                ))}
              </div>

              {/* File Code Viewer */}
              <div className="lg:col-span-2 bg-black/70 border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                <div className="bg-[#1c0205] border-b border-white/10 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-xs font-bold text-yellow-300">
                      {currentFile.path}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate max-w-[200px]">
                      {currentFile.description}
                    </span>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs rounded-xl shadow-md cursor-pointer active:scale-95 transition-all"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'কপি সম্পন্ন!' : 'কোড কপি করুন'}</span>
                  </button>
                </div>

                <div className="flex-1 p-3 overflow-auto font-mono text-[11px] text-gray-300 bg-[#080001] select-text">
                  <pre className="whitespace-pre">{currentFile.content}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CPANEL INSTALLATION GUIDE */}
          {activeTab === 'cpanel_guide' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-4 bg-[#180205] border border-red-900/40 rounded-2xl space-y-3 text-xs">
                <h3 className="text-sm font-black text-yellow-300 flex items-center gap-2">
                  <Server size={16} className="text-amber-400" />
                  <span>cPanel বা Apache হোস্টিং-এ ইনস্টল করার সহজ ৩ ধাপ:</span>
                </h3>

                <div className="space-y-3 text-gray-300">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                    <strong className="text-amber-300 block mb-1">ধাপ ১: জিপ আপলোড ও এক্সট্র্যাক্ট</strong>
                    <span>
                      আপনার cPanel এর <strong>File Manager</strong>-এ গিয়ে <code>public_html</code> ডিরেক্টরিতে জিপ ফাইলটি আপলোড করুন এবং <strong>Extract</strong> এ ক্লিক করুন।
                    </span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                    <strong className="text-amber-300 block mb-1">ধাপ ২: ১-ক্লিক অটো ইনস্টলার রান করুন</strong>
                    <span>
                      ব্রাউজারে যান: <code>https://your-domain.com/install.php</code><br />
                      আপনার MySQL ডাটাবেস নাম ও পাসওয়ার্ড দিয়ে <strong>ইনস্টল সম্পন্ন করুন</strong> বাটনে ক্লিক করুন। কয়েক সেকেন্ডে সকল টেবিল অটোমেটিক তৈরি হয়ে যাবে।
                    </span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                    <strong className="text-amber-300 block mb-1">ধাপ ৩: SoftAggregator কলব্যাক ইউআরএল সেটআপ</strong>
                    <span>
                      SoftAggregator প্রোভাইডার ড্যাশবোর্ডে গিয়ে নিচের ওয়েবহুক বা কলব্যাক লিংকটি পেস্ট করুন:
                      <div className="mt-1.5 p-2 bg-black rounded-lg border border-yellow-500/30 font-mono text-yellow-300 text-[11px] select-all">
                        https://your-domain.com/api/softaggregator_callback.php
                      </div>
                      বিকল্প সংক্ষিপ্ত লিংক:
                      <div className="mt-1 p-2 bg-black rounded-lg border border-yellow-500/30 font-mono text-yellow-300 text-[11px] select-all">
                        https://your-domain.com/callback.php
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
