import React, { useState, useEffect } from 'react';
import { soundFX } from '../../utils/audio';
import { storage } from '../../services/storage';
import { X, Crosshair, Sparkles } from 'lucide-react';

interface HappyFishingGameProps {
  onClose: () => void;
  onBalanceChange: () => void;
}

interface Fish {
  id: number;
  name: string;
  bnName: string;
  icon: string;
  multiplier: number;
  x: number; // percentage
  y: number; // percentage
  speed: number;
  direction: 1 | -1;
  health: number;
  maxHealth: number;
  size: string;
}

export const HappyFishingGame: React.FC<HappyFishingGameProps> = ({ onClose, onBalanceChange }) => {
  const [fishes, setFishes] = useState<Fish[]>([
    { id: 1, name: 'Clownfish', bnName: 'ছোট মাছ', icon: '🐠', multiplier: 2, x: 10, y: 30, speed: 1.2, direction: 1, health: 1, maxHealth: 1, size: 'text-2xl' },
    { id: 2, name: 'Golden Carp', bnName: 'সোনালী মাছ', icon: '🐟', multiplier: 5, x: 80, y: 50, speed: 0.9, direction: -1, health: 3, maxHealth: 3, size: 'text-3xl' },
    { id: 3, name: 'Hammerhead Shark', bnName: 'হাঙর', icon: '🦈', multiplier: 20, x: 20, y: 20, speed: 0.7, direction: 1, health: 8, maxHealth: 8, size: 'text-4xl' },
    { id: 4, name: 'King Crab', bnName: 'রাজ কাঁকড়া', icon: '🦀', multiplier: 15, x: 50, y: 70, speed: 0.5, direction: -1, health: 6, maxHealth: 6, size: 'text-3xl' },
    { id: 5, name: 'Golden Turtle', bnName: 'স্বর্ণ কচ্ছপ', icon: '🐢', multiplier: 50, x: 70, y: 35, speed: 0.4, direction: 1, health: 12, maxHealth: 12, size: 'text-4xl' },
    { id: 6, name: 'Dragon King', bnName: 'ড্রাগন রাজা', icon: '🐉', multiplier: 200, x: 15, y: 55, speed: 0.3, direction: 1, health: 25, maxHealth: 25, size: 'text-5xl' },
  ]);

  const [bulletCost, setBulletCost] = useState<number>(5);
  const [cannonAngle, setCannonAngle] = useState<number>(0);
  const [lastKill, setLastKill] = useState<{ text: string; reward: number } | null>(null);
  const [splashBullets, setSplashBullets] = useState<{ id: number; x: number; y: number }[]>([]);

  const currentUser = storage.getCurrentUser();
  const balance = currentUser?.wallet.balance ?? 0;

  // Move fishes
  useEffect(() => {
    const timer = setInterval(() => {
      setFishes(prev =>
        prev.map(f => {
          let nextX = f.x + f.speed * f.direction;
          let nextDir = f.direction;
          if (nextX > 90) {
            nextDir = -1;
            nextX = 90;
          } else if (nextX < 5) {
            nextDir = 1;
            nextX = 5;
          }
          return { ...f, x: nextX, direction: nextDir };
        })
      );
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const shootAtFish = (fish: Fish, e: React.MouseEvent) => {
    if (balance < bulletCost) {
      alert('পর্যাপ্ত ব্যালেন্স নেই! ডিপোজিট করুন।');
      return;
    }

    // Deduct bullet cost
    storage.updateBalance(-bulletCost);
    onBalanceChange();
    soundFX.playClick();

    // Visual bullet burst
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const bulletId = Date.now();
    setSplashBullets(prev => [...prev, { id: bulletId, x: clickX, y: clickY }]);
    setTimeout(() => {
      setSplashBullets(prev => prev.filter(b => b.id !== bulletId));
    }, 400);

    // Aim cannon
    const angle = ((fish.x - 50) / 50) * 45;
    setCannonAngle(angle);

    // Damage fish
    setFishes(prev =>
      prev.map(f => {
        if (f.id === fish.id) {
          const newHp = f.health - 1;
          if (newHp <= 0) {
            // Fish caught!
            const win = f.multiplier * bulletCost;
            storage.updateBalance(win);
            onBalanceChange();
            soundFX.playWin();
            storage.recordGameBet('jili-happy-fishing', `Happy Fishing: ${f.name}`, 'Jili', bulletCost, win, f.multiplier);

            setLastKill({ text: `${f.bnName} শিকার! +৳${win}`, reward: win });
            setTimeout(() => setLastKill(null), 2500);

            // Respawn
            return {
              ...f,
              health: f.maxHealth,
              x: Math.random() > 0.5 ? 5 : 85,
            };
          }
          return { ...f, health: newHp };
        }
        return f;
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-2 sm:p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-gradient-to-r from-cyan-950 via-teal-900 to-cyan-950 p-3 rounded-t-xl border-b border-cyan-500">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-cyan-500 text-black font-extrabold rounded text-xs">JILI</div>
          <span className="font-bold text-white text-sm flex items-center gap-1">
            <Crosshair size={16} className="text-cyan-400" /> Happy Fishing (হ্যাপি ফিশিং)
          </span>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-white bg-red-900/40 p-1 rounded-full">
          <X size={18} />
        </button>
      </div>

      {/* Underwater Arcade Area */}
      <div className="w-full flex-1 bg-gradient-to-b from-[#021f2d] via-[#053246] to-[#01141e] relative overflow-hidden flex flex-col justify-between p-2 select-none border-x border-cyan-900">
        {/* Ocean bubbles animation */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full animate-ping" />
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>

        {/* Floating catch toast */}
        {lastKill && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 py-1.5 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-sm rounded-full shadow-xl flex items-center gap-1 animate-bounce z-20">
            <Sparkles size={16} /> {lastKill.text}
          </div>
        )}

        {/* Fishes in water */}
        <div className="relative flex-1 w-full">
          {fishes.map(fish => (
            <div
              key={fish.id}
              onClick={e => shootAtFish(fish, e)}
              style={{
                left: `${fish.x}%`,
                top: `${fish.y}%`,
                transform: `scaleX(${fish.direction})`,
              }}
              className="absolute cursor-crosshair transition-all duration-300 flex flex-col items-center group active:scale-125"
            >
              <div className={`${fish.size} filter drop-shadow-lg select-none group-hover:scale-110 transition-transform`}>
                {fish.icon}
              </div>
              <div className="bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-yellow-300 font-bold border border-yellow-500/40">
                {fish.multiplier}x
              </div>
              {/* HP Bar */}
              <div className="w-10 h-1 bg-gray-800 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${(fish.health / fish.maxHealth) * 100}%` }}
                />
              </div>
            </div>
          ))}

          {/* Bullet explosions */}
          {splashBullets.map(b => (
            <div
              key={b.id}
              style={{ left: b.x, top: b.y }}
              className="absolute w-8 h-8 rounded-full border-2 border-yellow-300 bg-yellow-400/40 -translate-x-1/2 -translate-y-1/2 animate-ping pointer-events-none"
            />
          ))}
        </div>

        {/* Cannon Turret at bottom center */}
        <div className="flex flex-col items-center justify-center relative z-10">
          <div
            style={{ transform: `rotate(${cannonAngle}deg)` }}
            className="w-10 h-16 bg-gradient-to-t from-cyan-600 via-amber-400 to-yellow-300 rounded-t-lg border-2 border-white shadow-2xl transition-transform duration-150 origin-bottom flex items-center justify-center"
          >
            <div className="w-2 h-4 bg-red-600 rounded-t" />
          </div>
          <div className="w-24 h-6 bg-slate-900 rounded-full border-2 border-cyan-400 flex items-center justify-center text-[10px] font-bold text-cyan-300 -mt-2">
            বুলেট খরচ: ৳{bulletCost}
          </div>
        </div>
      </div>

      {/* Control Footer */}
      <div className="w-full bg-[#03151f] p-3 rounded-b-xl border border-cyan-900 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-300">
            ব্যালেন্স: <strong className="text-yellow-400 font-num">৳ {balance.toFixed(2)}</strong>
          </span>
          <span className="text-[11px] text-cyan-300">স্ক্রিনের মাছে ক্লিক করে গুলি ছুড়ুন!</span>
        </div>

        {/* Bullet Level selection */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">কামান পাওয়ার:</span>
          {[2, 5, 10, 20, 50].map(v => (
            <button
              key={v}
              onClick={() => {
                soundFX.playClick();
                setBulletCost(v);
              }}
              className={`flex-1 py-1 rounded text-xs font-bold ${
                bulletCost === v
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold'
                  : 'bg-cyan-950 text-cyan-200 border border-cyan-800'
              }`}
            >
              ৳{v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
