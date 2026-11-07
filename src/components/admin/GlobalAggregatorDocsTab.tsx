import React, { useState } from 'react';
import { GLOBAL_AGGREGATOR_DOCS } from '../../data/aggregatorDocs';
import { storage } from '../../services/storage';
import {
  Globe,
  RefreshCw,
  Database,
  CheckCircle2,
  Copy,
  Check,
  Play,
  Terminal,
  ShieldCheck,
  Zap,
  Link2,
} from 'lucide-react';

interface GlobalAggregatorDocsTabProps {
  onCatalogUpdated: () => void;
}

export const GlobalAggregatorDocsTab: React.FC<GlobalAggregatorDocsTabProps> = ({
  onCatalogUpdated,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(GLOBAL_AGGREGATOR_DOCS[0].id);
  const [cloning, setCloning] = useState(false);
  const [syncingFirestore, setSyncingFirestore] = useState(false);
  const [simulatingGgr, setSimulatingGgr] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [ggrSimLog, setGgrSimLog] = useState<string[]>([]);
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  const activeDoc =
    GLOBAL_AGGREGATOR_DOCS.find(d => d.id === selectedDocId) || GLOBAL_AGGREGATOR_DOCS[0];

  const copyCode = (key: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedBlock(key);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  // 1-Click Clone Remote API All Games & Demo Links
  const handleCloneRemoteGames = async () => {
    setCloning(true);
    setStatusBanner(null);
    try {
      const settings = storage.getSiteSettings();
      const res = await fetch('/api/softaggregator/v1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_login: settings.softAggregatorApiLogin || 'DEMO_LIVEXWIN_LOGIN',
          api_password: settings.softAggregatorApiPassword || 'DEMO_LIVEXWIN_PASS',
          method: 'getGameList',
          show_systems: 0,
          currency: 'BDT',
        }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.response)) {
        const result = storage.syncGamesFromRemoteApi(data.response);
        const total = result.added + result.updated;
        setStatusBanner(
          `✅ Clone Remote API সফল! মোট ${total}টি গেম এবং ডেমো লিংক সিঙ্ক হয়েছে (নতুন: ${result.added}, আপডেট: ${result.updated})।`
        );
        onCatalogUpdated();
      } else {
        setStatusBanner('⚠️ Remote API থেকে গেম তালিকা পাওয়া যায়নি।');
      }
    } catch (e: any) {
      setStatusBanner(`❌ ত্রুটি: ${e?.message || 'Remote API সংযোগ বিচ্ছিন্ন'}`);
    } finally {
      setCloning(false);
    }
  };

  // 1-Click Sync Full Catalog to Firestore Database
  const handleSyncToFirestore = async () => {
    setSyncingFirestore(true);
    setStatusBanner(null);
    try {
      const res = await storage.seedCatalogToFirestore();
      setStatusBanner(
        `✅ ডাটাবেস সিঙ্ক সম্পন্ন! ${res.games}টি গেম, ${res.categories}টি ক্যাটাগরি এবং ${res.providers}টি প্রোভাইডার ক্লাউড ডাটাবেসে সংরক্ষিত হয়েছে।`
      );
      onCatalogUpdated();
    } catch (e: any) {
      setStatusBanner(`❌ ডাটাবেস সিঙ্ক ত্রুটি: ${e?.message || 'অনুমতি যাচাই করুন'}`);
    } finally {
      setSyncingFirestore(false);
    }
  };

  // Simulate Launch-First -> Post-Launch GGR Balance Load Handshake
  const handleSimulateLaunchFirstGgr = async () => {
    setSimulatingGgr(true);
    const logs: string[] = [];
    const pushLog = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setGgrSimLog([...logs]);
    };

    try {
      pushLog(`🚀 Step 1 (Launch-First): Requesting Game Launch URL from ${activeDoc.name}...`);
      const launchRes = await fetch('/api/softaggregator/v1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_login: 'DEMO_LIVEXWIN_LOGIN',
          api_password: 'DEMO_LIVEXWIN_PASS',
          method: 'getGame',
          user_username: 't1206248521',
          user_password: '123456',
          gameid: 'jili/SuperAce',
          currency: 'BDT',
          lang: 'bn',
        }),
      });
      const launchJson = await launchRes.json();
      pushLog(`✅ Step 2 (Iframe Ready): Launch URL received -> ${launchJson.response}`);

      pushLog(
        `🔄 Step 3 (Post-Launch GGR Balance Load): Game Iframe booted and calling Seamless Callback ?action=balance&username=t1206248521...`
      );
      const balRes = await fetch(
        '/api/softaggregator/callback?action=balance&username=t1206248521&currency=BDT'
      );
      const balJson = await balRes.json();
      pushLog(
        `💰 Step 4 (GGR Balance Loaded in Game): Callback returned status=${balJson.status}, balance=${balJson.balance} cents (৳${(
          Number(balJson.balance || 0) / 100
        ).toFixed(2)} BDT)`
      );

      pushLog(
        `🎰 Step 5 (Test Spin GGR Debit/Credit): Executing ৳10.00 bet (1000 cents) and ৳25.00 win (2500 cents)...`
      );
      await fetch(
        '/api/softaggregator/callback?action=debit&username=t1206248521&amount=1000&transaction_id=sim_tx_1'
      );
      const winRes = await fetch(
        '/api/softaggregator/callback?action=credit&username=t1206248521&amount=2500&transaction_id=sim_tx_2'
      );
      const winJson = await winRes.json();
      pushLog(
        `🏆 Step 6 (GGR Settlement Complete): Updated Player Balance inside Game = ${winJson.balance} cents (৳${(
          Number(winJson.balance || 0) / 100
        ).toFixed(2)} BDT)`
      );
    } catch (e: any) {
      pushLog(`❌ Error: ${e?.message || 'Simulation failed'}`);
    } finally {
      setSimulatingGgr(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Control Bar: Clone All Games + Demo Links & Sync Database */}
      <div className="bg-gradient-to-r from-[#230408] via-[#1a0306] to-[#140204] border border-amber-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-amber-400" />
              <h3 className="text-sm sm:text-base font-black text-white">
                গ্লোবাল থার্ড-পার্টি GGR ক্যাসিনো এপিআই ও ডেমো লিংক ক্লোনার (Clone Remote API All Games)
              </h3>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              SoftAggregator, NexusGG/Fiverscan, Slotegrator, SOFTSWISS, TBS2 Hall-ID এবং Pragmatic GS2C প্রোভাইডারদের{' '}
              <span className="text-amber-300 font-bold">
                Launch-First → Post-Launch GGR Balance Load
              </span>{' '}
              আর্কিটেকচার এবং অরিজিনাল আইফ্রেম গেম ইঞ্জিন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCloneRemoteGames}
              disabled={cloning}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={cloning ? 'animate-spin' : ''} />
              <span>{cloning ? 'ক্লোন হচ্ছে...' : 'Clone Remote API All Games & Demo Links'}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncToFirestore}
              disabled={syncingFirestore}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer disabled:opacity-50"
            >
              <Database size={14} className={syncingFirestore ? 'animate-bounce' : ''} />
              <span>{syncingFirestore ? 'সিঙ্ক হচ্ছে...' : 'Sync Catalog to Cloud DB'}</span>
            </button>
          </div>
        </div>

        {statusBanner && (
          <div className="mt-3 p-2.5 rounded-xl bg-black/60 border border-amber-400/40 text-xs font-bold text-amber-200 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>{statusBanner}</span>
          </div>
        )}
      </div>

      {/* Interactive Launch-First -> Post-Launch GGR Balance Load Simulator */}
      <div className="bg-[#160205] border border-[#4a0b13] rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h4 className="text-xs sm:text-sm font-black text-amber-400 flex items-center gap-1.5">
              <Zap size={15} />
              <span>Launch-First → Post-Launch GGR Balance Load লাইভ টেস্টার</span>
            </h4>
            <p className="text-[11px] text-gray-400">
              যেই এপিআইগুলোতে আগে গেম লঞ্চ হয় এবং আইফ্রেম ওপেন হওয়ার পর কলব্যাকের মাধ্যমে GGR ব্যালেন্স লোড করে, তার লাইভ হ্যান্ডশেক পরীক্ষা করুন।
            </p>
          </div>
          <button
            type="button"
            onClick={handleSimulateLaunchFirstGgr}
            disabled={simulatingGgr}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Play size={13} className="fill-white" />
            <span>{simulatingGgr ? 'টেস্ট চলছে...' : 'টেস্ট GGR Launch & Balance Load'}</span>
          </button>
        </div>

        {ggrSimLog.length > 0 && (
          <div className="bg-black/80 border border-emerald-500/30 rounded-xl p-3 font-mono text-[11px] text-emerald-300 space-y-1 max-h-48 overflow-y-auto">
            {ggrSimLog.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}
      </div>

      {/* Provider Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {GLOBAL_AGGREGATOR_DOCS.map(doc => {
          const active = doc.id === activeDoc.id;
          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => setSelectedDocId(doc.id)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
                active
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-yellow-200 shadow-md'
                  : 'bg-[#1a0306] text-gray-300 border-[#4d0910] hover:border-amber-400/50 hover:text-white'
              }`}
            >
              <ShieldCheck size={13} />
              <span>{doc.bengaliBadge}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Aggregator Full Documentation Card */}
      <div className="bg-[#160205] border border-[#4d0910] rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h4 className="text-base font-black text-white">{activeDoc.name}</h4>
            <p className="text-xs text-amber-300 font-bold mt-0.5">{activeDoc.ggrModel}</p>
          </div>
          <div className="text-xs font-mono bg-black/50 px-3 py-1.5 rounded-lg border border-white/10 text-gray-300">
            <span className="text-gray-400">Endpoint: </span>
            <span className="text-emerald-400 font-bold">{activeDoc.baseEndpoint}</span>
          </div>
        </div>

        {/* Supported Providers & Auth Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-black/40 border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-gray-400 font-bold block mb-1">
              Authentication & Security Signature:
            </span>
            <p className="text-xs font-mono text-yellow-300 font-bold">{activeDoc.authMethod}</p>
            <p className="text-[11px] text-gray-400 mt-1.5">{activeDoc.notes}</p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-xl p-3">
            <span className="text-[11px] text-gray-400 font-bold block mb-1.5">
              সাপোর্টেড অরিজিনাল প্রোভাইডারসমূহ:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeDoc.supportedProviders.map(p => (
                <span
                  key={p}
                  className="px-2 py-0.5 rounded-md bg-red-950/80 border border-red-500/30 text-[11px] font-bold text-amber-300"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Launch-First -> Post-Launch GGR Balance Load Steps */}
        <div className="bg-black/40 border border-amber-500/20 rounded-xl p-3">
          <h5 className="text-xs font-black text-amber-400 mb-2 flex items-center gap-1.5">
            <Link2 size={14} />
            <span>Launch-First → Post-Launch GGR Balance Load কর্মপ্রক্রিয়া (Workflow):</span>
          </h5>
          <ul className="space-y-1.5 text-xs text-gray-200">
            {activeDoc.launchFirstFlowSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-black">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Code Payloads */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* 1. Game Launch Request */}
          <div className="bg-black/70 border border-white/10 rounded-xl p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-amber-400 flex items-center gap-1">
                <Terminal size={12} /> 1. Game Launch Request
              </span>
              <button
                type="button"
                onClick={() => copyCode('launch', activeDoc.launchRequestExample)}
                className="text-[10px] text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedBlock === 'launch' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="text-[10px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap flex-1">
              {activeDoc.launchRequestExample}
            </pre>
          </div>

          {/* 2. Post-Launch Balance Load Callback */}
          <div className="bg-black/70 border border-white/10 rounded-xl p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1">
                <Terminal size={12} /> 2. Post-Launch GGR Balance Load
              </span>
              <button
                type="button"
                onClick={() => copyCode('balance', activeDoc.postLaunchBalanceCallbackExample)}
                className="text-[10px] text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedBlock === 'balance' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="text-[10px] font-mono text-amber-200 overflow-x-auto whitespace-pre-wrap flex-1">
              {activeDoc.postLaunchBalanceCallbackExample}
            </pre>
          </div>

          {/* 3. Seamless Bet/Win GGR Settlement */}
          <div className="bg-black/70 border border-white/10 rounded-xl p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-rose-400 flex items-center gap-1">
                <Terminal size={12} /> 3. Spin Debit/Credit Callback
              </span>
              <button
                type="button"
                onClick={() => copyCode('betwin', activeDoc.betWinCallbackExample)}
                className="text-[10px] text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedBlock === 'betwin' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="text-[10px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap flex-1">
              {activeDoc.betWinCallbackExample}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
