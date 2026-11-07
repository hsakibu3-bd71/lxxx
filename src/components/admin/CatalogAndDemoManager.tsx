import React, { useState } from 'react';
import { GameItem, GameCategory, GameProvider } from '../../types';
import { storage } from '../../services/storage';
import { soundFX } from '../../utils/audio';
import {
  Plus,
  RefreshCw,
  Database,
  Link2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Save,
} from 'lucide-react';

interface CatalogAndDemoManagerProps {
  games: GameItem[];
  onRefreshCatalog: () => void;
}

export const CatalogAndDemoManager: React.FC<CatalogAndDemoManagerProps> = ({
  games,
  onRefreshCatalog,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBnName, setNewBnName] = useState('');
  const [newProvider, setNewProvider] = useState<GameProvider>('Jili');
  const [newCategory, setNewCategory] = useState<GameCategory>('slots');
  const [newImage, setNewImage] = useState(
    'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&auto=format&fit=crop&q=80'
  );
  const [newMultiplier, setNewMultiplier] = useState('1500X');
  const [newRemoteCode, setNewRemoteCode] = useState('jili/SuperAce');
  const [newDemoUrl, setNewDemoUrl] = useState(
    '/game_frame.php?gameid=jili%2FSuperAce&name=Super%20Ace&provider=Jili&user=DemoPlayer&balance=500&demo=1'
  );

  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editDemoUrl, setEditDemoUrl] = useState<string>('');
  const [editRemoteCode, setEditRemoteCode] = useState<string>('');
  const [cloning, setCloning] = useState(false);
  const [syncingDb, setSyncingDb] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const handleAddNewGame = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    if (!newName.trim()) return;
    storage.addGame({
      id: `g_custom_${Date.now()}`,
      name: newName.trim(),
      bengaliName: newBnName.trim() || newName.trim(),
      provider: newProvider,
      category: newCategory,
      image: newImage.trim(),
      multiplier: newMultiplier.trim() || undefined,
      remoteGameCode: newRemoteCode.trim() || undefined,
      demoUrl: newDemoUrl.trim() || undefined,
      rating: 5,
      rtp: 97.0,
      minBet: 1,
      maxBet: 10000,
      active: true,
    });
    setBannerMsg(`✅ নতুন গেম "${newBnName || newName}" ও ডেমো লিংক ক্যাটালগে যোগ হয়েছে!`);
    setNewName('');
    setNewBnName('');
    setShowAddForm(false);
    onRefreshCatalog();
  };

  const handleCloneAllRemoteGames = async () => {
    soundFX.playClick();
    setCloning(true);
    setBannerMsg(null);
    try {
      const settings = storage.getSiteSettings();
      const res = await fetch('/api/softaggregator/v1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_login: settings.softAggregatorApiLogin || 'DEMO_LIVEXWIN_LOGIN',
          api_password: settings.softAggregatorApiPassword || 'DEMO_LIVEXWIN_PASS',
          method: 'getGameList',
          currency: 'BDT',
        }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.response)) {
        const result = storage.syncGamesFromRemoteApi(data.response);
        const total = result.added + result.updated;
        setBannerMsg(
          `✅ Clone Remote API All Games সফল! মোট ${total}টি গেম ও ডেমো লিংক যুক্ত হয়েছে (নতুন: ${result.added}, আপডেট: ${result.updated})।`
        );
        onRefreshCatalog();
      }
    } catch (e: any) {
      setBannerMsg(`❌ ত্রুটি: ${e?.message || 'Remote API সংযোগ ব্যর্থ'}`);
    } finally {
      setCloning(false);
    }
  };

  const handleSyncToFirestore = async () => {
    soundFX.playClick();
    setSyncingDb(true);
    setBannerMsg(null);
    try {
      const res = await storage.seedCatalogToFirestore();
      setBannerMsg(
        `✅ ক্লাউড ডাটাবেসে ${res.games}টি গেম, ${res.categories}টি ক্যাটাগরি এবং ${res.providers}টি প্রোভাইডার সংরক্ষিত হয়েছে!`
      );
      onRefreshCatalog();
    } catch (e: any) {
      setBannerMsg(`❌ ডাটাবেস সিঙ্ক ত্রুটি: ${e?.message || 'অনুমতি যাচাই করুন'}`);
    } finally {
      setSyncingDb(false);
    }
  };

  const startEditDemo = (g: GameItem) => {
    soundFX.playClick();
    setEditingGameId(g.id);
    setEditDemoUrl(g.demoUrl || '');
    setEditRemoteCode(g.remoteGameCode || '');
  };

  const saveEditDemo = (gameId: string) => {
    soundFX.playClick();
    storage.updateGame(gameId, {
      demoUrl: editDemoUrl.trim(),
      remoteGameCode: editRemoteCode.trim(),
    });
    setEditingGameId(null);
    setBannerMsg('✅ গেমের ডেমো লিংক ও রিমোট এপিআই কোড আপডেট করা হয়েছে!');
    onRefreshCatalog();
  };

  return (
    <div className="space-y-4">
      {/* Action Header Bar */}
      <div className="bg-gradient-to-r from-[#240408] via-[#1c0306] to-[#140204] border border-amber-500/30 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-yellow-300 flex items-center gap-2">
            <Link2 size={16} />
            <span>LivexWin গেম ক্যাটালগ ও ডেমো লিংক ম্যানেজার (Clone Remote API All Games)</span>
          </h3>
          <p className="text-xs text-gray-300 mt-0.5">
            প্রতিটি গেমের ডেমো লিংক (`demoUrl`), রিমোট এপিআই গেম কোড (`id_hash`) এবং ক্লাউড ডাটাবেস সিঙ্ক পরিচালনা করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm(prev => !prev)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 shadow cursor-pointer"
          >
            <Plus size={13} />
            <span>নতুন গেম ও ডেমো লিংক যোগ</span>
          </button>

          <button
            type="button"
            onClick={handleCloneAllRemoteGames}
            disabled={cloning}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs flex items-center gap-1 shadow cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={cloning ? 'animate-spin' : ''} />
            <span>{cloning ? 'ক্লোন হচ্ছে...' : 'Clone Remote API All Games'}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncToFirestore}
            disabled={syncingDb}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1 shadow cursor-pointer disabled:opacity-50"
          >
            <Database size={13} />
            <span>{syncingDb ? 'সিঙ্ক হচ্ছে...' : 'Sync to Database'}</span>
          </button>
        </div>
      </div>

      {bannerMsg && (
        <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
          <span>{bannerMsg}</span>
        </div>
      )}

      {/* Add New Game Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleAddNewGame}
          className="bg-[#230408] border border-amber-400/50 rounded-2xl p-4 space-y-3 text-xs"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="font-black text-yellow-300 text-sm">
              নতুন ক্যাসিনো গেম ও ডেমো লিংক যুক্ত করুন
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-gray-300 font-bold mb-1">গেমের নাম (English):</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Super Ace Deluxe"
                className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">গেমের বাংলা নাম:</label>
              <input
                type="text"
                value={newBnName}
                onChange={e => setNewBnName(e.target.value)}
                placeholder="সুপার এস ডিলাক্স"
                className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">প্রোভাইডার:</label>
              <select
                value={newProvider}
                onChange={e => setNewProvider(e.target.value as GameProvider)}
                className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white"
              >
                <option value="Jili">Jili</option>
                <option value="Pocket Games Soft">Pocket Games Soft</option>
                <option value="Pragmatic Play">Pragmatic Play</option>
                <option value="JDB">JDB</option>
                <option value="FA CHAI Gaming">FA CHAI Gaming</option>
                <option value="Microgaming">Microgaming</option>
                <option value="KoolBet">KoolBet</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">ক্যাটাগরি:</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as GameCategory)}
                className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white"
              >
                <option value="hot">গরম (Hot)</option>
                <option value="slots">স্লট (Slots)</option>
                <option value="live">লাইভ (Live)</option>
                <option value="fishing">ফিশিং (Fishing)</option>
                <option value="cards">কার্ড (Cards)</option>
                <option value="lottery">লটারি (Lottery)</option>
                <option value="sports">স্পোর্টস (Sports)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">Remote API Game Code:</label>
              <input
                type="text"
                value={newRemoteCode}
                onChange={e => setNewRemoteCode(e.target.value)}
                placeholder="jili/SuperAce"
                className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-amber-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">মাল্টিপ্লায়ার ব্যাজ:</label>
              <input
                type="text"
                value={newMultiplier}
                onChange={e => setNewMultiplier(e.target.value)}
                placeholder="5000X"
                className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-gray-300 font-bold mb-1">ডেমো লিংক (Demo Link URL):</label>
              <input
                type="text"
                value={newDemoUrl}
                onChange={e => setNewDemoUrl(e.target.value)}
                placeholder="/game_frame.php?gameid=jili/SuperAce&demo=1"
                className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-emerald-300 font-mono"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-gray-300 font-bold mb-1">গেম থাম্বনেইল ছবি (Image URL):</label>
              <input
                type="text"
                value={newImage}
                onChange={e => setNewImage(e.target.value)}
                className="w-full bg-black/60 border border-gray-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs cursor-pointer"
            >
              গেম ও ডেমো লিংক সংরক্ষণ করুন
            </button>
          </div>
        </form>
      )}

      {/* Quick Demo Link Editor Table for First 12 Filtered Games */}
      <div className="bg-[#180205] border border-[#4d0910] rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-amber-400">
            🔗 ডেমো লিংক ও রিমোট এপিআই কোড কুইক এডিটর ({games.length} গেমস)
          </span>
          <span className="text-[11px] text-gray-400">
            যেকোনো গেমের ডেমো লিংক পরিবর্তন বা টেস্ট করুন
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto divide-y divide-white/5 text-xs">
          {games.map(g => (
            <div key={g.id} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <img src={g.image} alt={g.name} className="w-8 h-8 rounded object-cover shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-white truncate">
                    {g.bengaliName} <span className="text-gray-400 font-normal">({g.provider})</span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 truncate">
                    Code: {g.remoteGameCode || 'auto'} | Demo: {g.demoUrl || '/game_frame.php?demo=1'}
                  </div>
                </div>
              </div>

              {editingGameId === g.id ? (
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  <input
                    type="text"
                    value={editRemoteCode}
                    onChange={e => setEditRemoteCode(e.target.value)}
                    placeholder="jili/SuperAce"
                    className="bg-black/70 border border-amber-400/50 rounded px-2 py-1 text-[11px] font-mono text-amber-300 w-32"
                  />
                  <input
                    type="text"
                    value={editDemoUrl}
                    onChange={e => setEditDemoUrl(e.target.value)}
                    placeholder="Demo URL"
                    className="bg-black/70 border border-emerald-400/50 rounded px-2 py-1 text-[11px] font-mono text-emerald-300 w-48"
                  />
                  <button
                    type="button"
                    onClick={() => saveEditDemo(g.id)}
                    className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Save size={11} /> সেভ
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={
                      g.demoUrl ||
                      `/game_frame.php?gameid=${encodeURIComponent(
                        g.remoteGameCode || g.name
                      )}&name=${encodeURIComponent(g.name)}&provider=${encodeURIComponent(
                        g.provider
                      )}&demo=1`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold flex items-center gap-1 hover:bg-amber-500/30"
                  >
                    <ExternalLink size={10} /> ডেমো টেস্ট
                  </a>
                  <button
                    type="button"
                    onClick={() => startEditDemo(g)}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold cursor-pointer"
                  >
                    ডেমো লিংক এডিট
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      storage.deleteGame(g.id);
                      onRefreshCatalog();
                    }}
                    className="p-1 rounded bg-red-950/80 hover:bg-red-800 text-red-300 cursor-pointer"
                    title="গেম মুছে ফেলুন"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
