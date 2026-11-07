import React, { useState } from 'react';
import { soundFX } from '../utils/audio';
import { storage } from '../services/storage';
import { ChevronLeft, FileText, Check, Copy, ArrowRight, ShieldCheck, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onViewHistory: () => void;
}

type DepositMethod = 'nagad' | 'bkash' | 'send_money_nagad' | 'rocket';
type PaymentChannel = 'TKPAYBDT' | 'BD99PAYBDT' | 'GOLDPAYBDT' | 'AIPAYBD';

const QUICK_AMOUNTS = [100, 200, 500, 1000, 3000, 5000, 10000, 20000, 50000];

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onViewHistory,
}) => {
  const [method, setMethod] = useState<DepositMethod>('nagad');
  const [channel, setChannel] = useState<PaymentChannel>('TKPAYBDT');
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('500');
  const [step, setStep] = useState<1 | 2>(1);
  const [trxId, setTrxId] = useState<string>('');
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const agentNumbers: Record<DepositMethod, string> = {
    nagad: '01712062485',
    bkash: '01894726190',
    send_money_nagad: '01928374615',
    rocket: '016382910484',
  };

  const handleQuickAmount = (val: number) => {
    soundFX.playClick();
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = Number(val);
    if (!isNaN(num)) setAmount(num);
  };

  const handleNext = () => {
    soundFX.playClick();
    if (amount < 100 || amount > 50000) {
      setErrorMsg('জমার পরিমাণ ১০০ থেকে ৫০,০০০ টাকার মধ্যে হতে হবে।');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleCopyAgentNumber = () => {
    soundFX.playClick();
    navigator.clipboard.writeText(agentNumbers[method]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDeposit = () => {
    soundFX.playClick();
    if (!trxId || trxId.trim().length < 6) {
      setErrorMsg('সঠিক ট্রানজেকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }
    if (!senderNumber || senderNumber.trim().length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }

    const res = storage.submitDeposit(
      amount,
      method === 'send_money_nagad' ? 'nagad' : method,
      channel,
      trxId,
      senderNumber
    );

    if (res.success) {
      soundFX.playCoin();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      alert(res.message);
      onSuccess();
      onClose();
      setStep(1);
      setTrxId('');
      setSenderNumber('');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-start overflow-y-auto">
      <div className="w-full max-w-lg bg-[#f8f9fa] text-gray-900 min-h-screen flex flex-col pb-10">
        {/* Header matching Dip_0eb9b71d.pdf */}
        <div className="bg-[#42080d] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow">
          <button
            onClick={() => {
              soundFX.playClick();
              if (step === 2) setStep(1);
              else onClose();
            }}
            className="p-1 hover:bg-white/10 rounded-full"
          >
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-base font-bold">জমা দিন</h2>
          <button
            onClick={() => {
              soundFX.playClick();
              onViewHistory();
            }}
            className="p-1 hover:bg-white/10 rounded-full"
            title="জমা রেকর্ড"
          >
            <FileText size={20} />
          </button>
        </div>

        {step === 1 ? (
          <div className="p-4 space-y-5">
            {/* 1. আমানতের মোড (Deposit Mode) */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>আমানতের মোড</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {/* Nagad */}
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setMethod('nagad');
                  }}
                  className={`p-2 rounded-lg border flex flex-col items-center justify-center relative bg-white transition-all ${
                    method === 'nagad' ? 'border-red-600 ring-2 ring-red-500/20 shadow-sm' : 'border-gray-200'
                  }`}
                >
                  <img
                    src="/assets/aistudio/nagad_nobg.png"
                    alt="Nagad"
                    className="w-8 h-8 object-contain mb-1 filter drop-shadow-xs"
                  />
                  <span className="text-[11px] font-bold text-gray-700">NAGAD</span>
                  {method === 'nagad' && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px]">
                      <Check size={8} />
                    </span>
                  )}
                </button>

                {/* Bkash */}
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setMethod('bkash');
                  }}
                  className={`p-2 rounded-lg border flex flex-col items-center justify-center relative bg-white transition-all ${
                    method === 'bkash' ? 'border-red-600 ring-2 ring-red-500/20 shadow-sm' : 'border-gray-200'
                  }`}
                >
                  <img
                    src="/assets/aistudio/bkash_card.png"
                    alt="bKash"
                    className="w-8 h-8 object-contain rounded-md mb-1 shadow-xs"
                  />
                  <span className="text-[11px] font-bold text-gray-700">bKash</span>
                  {method === 'bkash' && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px]">
                      <Check size={8} />
                    </span>
                  )}
                </button>

                {/* Send Money Nagad */}
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setMethod('send_money_nagad');
                  }}
                  className={`p-2 rounded-lg border flex flex-col items-center justify-center relative bg-white transition-all ${
                    method === 'send_money_nagad' ? 'border-red-600 ring-2 ring-red-500/20 shadow-sm' : 'border-gray-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-black text-[11px] flex items-center justify-center mb-1 border border-blue-200">
                    সেন্ড
                  </div>
                  <span className="text-[9px] font-bold text-gray-700 text-center leading-tight">Send Money Nagad</span>
                  {method === 'send_money_nagad' && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px]">
                      <Check size={8} />
                    </span>
                  )}
                </button>

                {/* Rocket */}
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setMethod('rocket');
                  }}
                  className={`p-2 rounded-lg border flex flex-col items-center justify-center relative bg-white transition-all ${
                    method === 'rocket' ? 'border-red-600 ring-2 ring-red-500/20 shadow-sm' : 'border-gray-200'
                  }`}
                >
                  <img
                    src="/assets/aistudio/rocket_nobg.png"
                    alt="Rocket"
                    className="w-8 h-8 object-contain mb-1 filter drop-shadow-xs"
                  />
                  <span className="text-[11px] font-bold text-gray-700">ROCKET</span>
                  {method === 'rocket' && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px]">
                      <Check size={8} />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 2. পেমেন্ট চ্যানেল (Payment Channel) */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>পেমেন্ট চ্যানেল</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['TKPAYBDT', 'BD99PAYBDT', 'GOLDPAYBDT'] as PaymentChannel[]).map(ch => (
                  <button
                    key={ch}
                    onClick={() => {
                      soundFX.playClick();
                      setChannel(ch);
                    }}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all bg-white ${
                      channel === ch
                        ? 'border-red-600 text-red-600 ring-1 ring-red-500/30'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. জমা পরিমাণ (Deposit Amount) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{method.toUpperCase()} জমা পরিমাণ</span>
                </div>
                <span className="text-gray-500 font-normal">সীমাবদ্ধতা: ৳ ১০০ - ৫০,০০০</span>
              </div>

              {/* Quick chips (9 chips matching PDF) */}
              <div className="grid grid-cols-5 gap-2 mb-3">
                {QUICK_AMOUNTS.map(val => (
                  <button
                    key={val}
                    onClick={() => handleQuickAmount(val)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      amount === val
                        ? 'bg-red-50 border-red-600 text-red-700 font-extrabold shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {val.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Amount input box */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-base">
                  ৳
                </div>
                <input
                  type="number"
                  value={customAmount}
                  onChange={handleCustomChange}
                  placeholder="100 - 50,000"
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg py-2.5 pl-8 pr-4 text-sm font-bold focus:outline-none focus:border-red-600 shadow-inner"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-600 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* 4. কার্যক্রম (Action Button) */}
            <div className="pt-2">
              <div className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>কার্যক্রম</span>
              </div>
              <button
                onClick={handleNext}
                className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-lg text-base shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>পরবর্তী (Next)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Agent Cashout Number & TrxID Input */
          <div className="p-4 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              <p className="font-bold mb-1">
                নিচের {method.toUpperCase()} নম্বরে ৳ {amount.toLocaleString()} ক্যাশ আউট (Cash Out) বা সেন্ড মানি করুন:
              </p>
              <div className="bg-white p-2.5 rounded-lg border border-amber-300 flex items-center justify-between font-mono font-bold text-base text-gray-900 mt-2">
                <span>{agentNumbers[method]}</span>
                <button
                  onClick={handleCopyAgentNumber}
                  className="px-2.5 py-1 bg-amber-500 text-black rounded text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Copy size={12} />
                  <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                আপনার প্রেরক মোবাইল নম্বর (Sender Number):
              </label>
              <input
                type="text"
                value={senderNumber}
                onChange={e => setSenderNumber(e.target.value)}
                placeholder="যেমন: 01712062485"
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm font-mono text-gray-900 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                ট্রানজেকশন আইডি (TrxID):
              </label>
              <input
                type="text"
                value={trxId}
                onChange={e => setTrxId(e.target.value)}
                placeholder="যেমন: 9G7A4K19X"
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm font-mono uppercase text-gray-900 focus:outline-none focus:border-red-600"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                লেনদেন সফল হওয়ার পর {method.toUpperCase()} থেকে প্রাপ্ত TrxID প্রদান করুন।
              </span>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-600 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleConfirmDeposit}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold rounded-lg text-base shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} />
              <span>নিশ্চিত করুন এবং জমা সম্পন্ন করুন</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
