import React, { useState } from 'react';
import { soundFX } from '../utils/audio';
import { storage, maskAccountNumber } from '../services/storage';
import { ChevronLeft, FileText, Plus, RefreshCw, Eye, EyeOff, ShieldCheck, Check, Lock } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onViewHistory: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onViewHistory,
}) => {
  const [method, setMethod] = useState<'nagad' | 'bkash'>('nagad');
  const [amount, setAmount] = useState<string>('500');
  const [trxPass, setTrxPass] = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [showAddWallet, setShowAddWallet] = useState<boolean>(false);
  const [newAccName, setNewAccName] = useState<string>('');
  const [newAccNum, setNewAccNum] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentUser = storage.getCurrentUser();
  const balance = currentUser?.wallet.balance ?? 0;
  const boundWallets = currentUser?.boundWallets.filter(w => w.type === method) || [];

  const handleRefresh = () => {
    soundFX.playClick();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAddWallet = () => {
    soundFX.playClick();
    if (!newAccNum || newAccNum.length < 11) {
      alert('সঠিক ১১ ডিজিটের মোবাইল ওয়ালেট নম্বর দিন।');
      return;
    }
    storage.bindWallet(method, newAccName || 'আমার অ্যাকাউন্ট', newAccNum);
    setShowAddWallet(false);
    setNewAccName('');
    setNewAccNum('');
  };

  const handleWithdraw = () => {
    soundFX.playClick();
    setErrorMsg('');

    if (!currentUser?.trxPasswordSet) {
      setErrorMsg('উত্তোলন করার পূর্বে দয়া করে সদস্য কেন্দ্র -> নিরাপত্তা থেকে আপনার ৬ সংখ্যার উত্তোলন পাসওয়ার্ড সেট করুন।');
      return;
    }

    if (!trxPass.trim()) {
      setErrorMsg('দয়া করে আপনার ৬ সংখ্যার গোপন উত্তোলন পাসওয়ার্ড লিখুন।');
      return;
    }

    if (boundWallets.length === 0) {
      setErrorMsg('দয়া করে প্রথমে নিচের প্লাস (+) বাটনে ট্যাপ করে আপনার ওয়ালেট নম্বর সংযুক্ত করুন।');
      return;
    }

    const withdrawAmt = Number(amount);
    if (isNaN(withdrawAmt) || withdrawAmt < 100 || withdrawAmt > 25000) {
      setErrorMsg('উত্তোলনের পরিমাণ ১০০ থেকে ২৫,০০০ টাকার মধ্যে হতে হবে।');
      return;
    }
    if (withdrawAmt > balance) {
      setErrorMsg('আপনার প্রধান ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।');
      return;
    }

    const chosenWallet = selectedWalletId ? boundWallets.find(w => w.id === selectedWalletId) : boundWallets[0];
    const targetAccount = chosenWallet ? chosenWallet.accountNumber : boundWallets[0].accountNumber;
    const res = storage.submitWithdraw(withdrawAmt, method, targetAccount, trxPass.trim());

    if (res.success) {
      soundFX.playWin();
      alert(res.message);
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-start overflow-y-auto">
      <div className="w-full max-w-lg bg-[#f8f9fa] text-gray-900 min-h-screen flex flex-col pb-10">
        {/* Header matching Widdo_9a461963.pdf */}
        <div className="bg-[#42080d] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow">
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-base font-bold">উত্তোলন</h2>
          <button onClick={onViewHistory} className="p-1 hover:bg-white/10 rounded-full" title="উত্তোলন রেকর্ড">
            <FileText size={20} />
          </button>
        </div>

        {/* Method Switcher Tabs (Nagad vs bKash) */}
        <div className="bg-white border-b border-gray-200 flex">
          <button
            onClick={() => {
              soundFX.playClick();
              setMethod('nagad');
            }}
            className={`flex-1 py-3 text-center text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              method === 'nagad' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500'
            }`}
          >
            <img src="/assets/aistudio/nagad_nobg.png" alt="Nagad" className="w-5 h-5 object-contain" />
            <span>Nagad (নগদ)</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setMethod('bkash');
            }}
            className={`flex-1 py-3 text-center text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              method === 'bkash' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500'
            }`}
          >
            <img src="/assets/aistudio/bkash_card.png" alt="bKash" className="w-5 h-5 object-contain rounded-xs" />
            <span>bKash (বিকাশ)</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Bound Wallets Section */}
          <div>
            <div className="text-xs font-bold text-gray-700 mb-2">
              আবদ্ধ {method.toUpperCase()} ({boundWallets.length}/5)
            </div>

            {boundWallets.length > 0 ? (
              <div className="space-y-2">
                {boundWallets.map(w => {
                  const isSelected = selectedWalletId ? selectedWalletId === w.id : boundWallets[0]?.id === w.id;
                  return (
                    <div
                      key={w.id}
                      onClick={() => setSelectedWalletId(w.id)}
                      className={`p-3 bg-white rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between shadow-xs ${
                        isSelected ? 'border-red-600 bg-red-50/40' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-gray-900 block">{w.accountName}</span>
                          <span className="text-[10px] uppercase font-black text-red-600 bg-red-100 px-1.5 rounded">{w.type}</span>
                        </div>
                        {/* Only last 3 digits visible per user instruction */}
                        <span className="text-sm font-mono font-black text-red-600 tracking-wider block mt-0.5">
                          {maskAccountNumber(w.accountNumber)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded flex items-center gap-1">
                          <Lock size={10} /> লকড
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty e-wallet representation matching PDF */
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center relative">
                <div className="w-24 h-14 bg-gray-200 rounded-md mb-2 shadow-inner" />
                <span className="text-xs text-gray-400 font-bold">খালি ই-ওয়ালেট</span>
                <button
                  onClick={() => setShowAddWallet(true)}
                  className="absolute right-4 bottom-4 w-9 h-9 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
                  title="ওয়ালেট যুক্ত করুন"
                >
                  <Plus size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Add Wallet Popup / Form */}
          {showAddWallet && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-red-900 block">{method.toUpperCase()} নম্বর বাঁধুন:</span>
              <input
                type="text"
                value={newAccName}
                onChange={e => setNewAccName(e.target.value)}
                placeholder="হিসাবের নাম (Account Name)"
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-gray-900"
              />
              <input
                type="text"
                value={newAccNum}
                onChange={e => setNewAccNum(e.target.value)}
                placeholder="১১ ডিজিটের মোবাইল নম্বর"
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-mono text-gray-900"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddWallet}
                  className="flex-1 py-1.5 bg-red-600 text-white font-bold rounded text-xs"
                >
                  সংরক্ষণ করুন
                </button>
                <button
                  onClick={() => setShowAddWallet(false)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 font-bold rounded text-xs"
                >
                  বাতিল
                </button>
              </div>
            </div>
          )}

          {/* Rules & Limits Info matching PDF */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>উত্তোলন সময়:</span>
              <span className="font-bold text-gray-900">২৪ ঘণ্টা</span>
            </div>
            <div className="flex justify-between">
              <span>দৈনিক উত্তোলন ৯৯ (বার), অবশিষ্ট:</span>
              <span className="font-bold text-gray-900">৯৯ (বার)</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-100">
              <span>প্রধান ওয়ালেট:</span>
              <span className="font-bold text-red-600 font-num">৳ {balance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>উপলব্ধ পরিমাণ:</span>
              <span className="font-bold text-emerald-600 font-num">৳ {balance.toFixed(2)}</span>
            </div>

            {/* Refresh Balance Button matching PDF */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={handleRefresh}
                className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                <span>আপনার ব্যালেন্স রিফ্রেশ করুন</span>
              </button>
            </div>
          </div>

          {/* Amount input: 100 ~ 25,000 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              উত্তোলন পরিমাণ:
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="100 ~ 25,000"
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 pl-8 text-sm font-bold text-gray-900 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Transaction Password Input matching PDF */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              লেনদেন পাসওয়ার্ড:
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={trxPass}
                onChange={e => setTrxPass(e.target.value)}
                placeholder="লেনদেন পাসওয়ার্ড"
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 pr-10 text-sm font-mono text-gray-900 focus:outline-none focus:border-red-600"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-600 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Submit Withdraw Button */}
          <button
            onClick={handleWithdraw}
            className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-lg text-base shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck size={18} />
            <span>উত্তোলন (Withdraw)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
