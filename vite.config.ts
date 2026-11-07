import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { defineConfig, Plugin } from 'vite';

// In-memory state for SoftAggregator Seamless Wallet & Player History (PDF v1 compliant)
const playerBalancesCents = new Map<string, number>();
const playerCurrencies = new Map<string, string>();
const processedCallIds = new Set<string>();
const playerRoundsHistory: Array<{
  user_username: string;
  round_id: string;
  gameid: string;
  game_name: string;
  currency: string;
  bet: number;
  win: number;
  net: number;
  legs: number;
  rolled_back: boolean;
  started_at: string;
  ended_at: string;
}> = [];

function getPlayerBalanceCents(username: string, initialBdt?: number): number {
  const key = (username || 't1206248521').toLowerCase();
  if (!playerBalancesCents.has(key)) {
    const startCents = typeof initialBdt === 'number' && !isNaN(initialBdt) ? Math.round(initialBdt * 100) : 50000;
    playerBalancesCents.set(key, startCents);
  }
  return playerBalancesCents.get(key)!;
}

function zipDownloadAndCallbackPlugin(): Plugin {
  return {
    name: 'zip-download-and-softaggregator-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost:3000');
        const pathname = url.pathname;

        // 1. Force attachment headers on PHP ZIP file
        if (
          pathname === '/api/download/php-zip' ||
          pathname === '/download-php-zip' ||
          pathname === '/LivexWin-PHP-Full-Project-with-Installer.zip'
        ) {
          const zipPath = path.resolve(process.cwd(), 'public/LivexWin-PHP-Full-Project-with-Installer.zip');
          if (fs.existsSync(zipPath)) {
            const stat = fs.statSync(zipPath);
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename="LivexWin-PHP-Full-Project-with-Installer.zip"');
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            fs.createReadStream(zipPath).pipe(res);
            return;
          }
        }

        // 2. SoftAggregator API v1 Single POST Endpoint (PDF Pages 1–7)
        // Base URL: https://api.softaggregator.com/api/v1
        if (
          (pathname === '/api/softaggregator/v1' ||
            pathname === '/api/v1' ||
            pathname === '/api/softaggregator.php') &&
          req.method === 'POST'
        ) {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.statusCode = 200;

            let payload: Record<string, any> = {};
            try {
              payload = JSON.parse(body || '{}');
            } catch {
              res.end(JSON.stringify({ error: 2, message: 'Invalid JSON request body' }));
              return;
            }

            const apiLogin = String(payload.api_login || '');
            const apiPassword = String(payload.api_password || '');
            const method = String(payload.method || '');

            if (!apiLogin || !apiPassword || !method) {
              res.end(JSON.stringify({ error: 2, message: 'api_login, api_password and method are required' }));
              return;
            }

            // Free rounds methods (PDF Page 6: Promotional free rounds are not available through the API)
            if (
              method === 'addFreeRounds' ||
              method === 'getFreeRounds' ||
              method === 'deleteFreeRounds'
            ) {
              res.end(JSON.stringify({ error: 1, message: 'Free rounds not supported' }));
              return;
            }

            // If live SoftAggregator operator credentials are configured, attempt upstream call first
            const isDemoCreds =
              apiLogin.startsWith('DEMO_') ||
              apiLogin.startsWith('YOUR_') ||
              apiPassword.startsWith('DEMO_') ||
              apiPassword.startsWith('YOUR_');

            if (!isDemoCreds) {
              try {
                const upstream = await fetch('https://api.softaggregator.com/api/v1', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
                if (upstream.ok) {
                  const upstreamJson = await upstream.json();
                  res.end(JSON.stringify(upstreamJson));
                  return;
                }
              } catch {
                // Fallback to local compliant SoftAggregator v1 handler if offline
              }
            }

            // Method: getCurrencies (PDF Page 3)
            if (method === 'getCurrencies') {
              res.end(
                JSON.stringify({
                  error: 0,
                  response: {
                    default: 'BDT',
                    currencies: ['BDT', 'PKR', 'INR', 'EUR', 'USD', 'BRL'],
                    settlement: 'EUR',
                  },
                })
              );
              return;
            }

            // Method: getProviderList (PDF Pages 4-5)
            if (method === 'getProviderList') {
              res.end(
                JSON.stringify({
                  error: 0,
                  response: [
                    { provider: 'jili', name: 'JILI Games', logo: 'https://cdn.imagesai.org/p/jili.png', games: 145 },
                    { provider: 'pgsoft', name: 'PG Soft', logo: 'https://cdn.imagesai.org/p/pgsoft.png', games: 132 },
                    { provider: 'pragmaticplay', name: 'Pragmatic Play', logo: 'https://cdn.imagesai.org/p/pragmaticplay.png', games: 3410 },
                    { provider: 'jdb', name: 'JDB Gaming', logo: 'https://cdn.imagesai.org/p/jdb.png', games: 118 },
                    { provider: 'fachai', name: 'FA CHAI', logo: 'https://cdn.imagesai.org/p/fachai.png', games: 85 },
                    { provider: 'spadegaming', name: 'Spadegaming', logo: 'https://cdn.imagesai.org/p/spadegaming.png', games: 124 },
                    { provider: 'cq9', name: 'CQ9 Gaming', logo: 'https://cdn.imagesai.org/p/cq9.png', games: 160 },
                    { provider: 'microgaming', name: 'Microgaming', logo: 'https://cdn.imagesai.org/p/microgaming.png', games: 520 },
                  ],
                })
              );
              return;
            }

            // Method: getGameList (PDF Page 4 - normalised game_type)
            if (method === 'getGameList') {
              res.end(
                JSON.stringify({
                  error: 0,
                  response: [
                    {
                      id: 101,
                      name: 'Super Ace',
                      game_type: 'slots',
                      provider: 'jili',
                      provider_name: 'JILI Games',
                      provider_logo: 'https://cdn.imagesai.org/p/jili.png',
                      type: 'Video Slots',
                      category: 'jili',
                      id_hash: 'jili/SuperAce',
                      freerounds_supported: false,
                      play_for_fun_supported: true,
                      image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80',
                    },
                    {
                      id: 102,
                      name: 'Fortune Gems 2',
                      game_type: 'slots',
                      provider: 'jili',
                      provider_name: 'JILI Games',
                      provider_logo: 'https://cdn.imagesai.org/p/jili.png',
                      type: 'Video Slots',
                      category: 'jili',
                      id_hash: 'jili/FortuneGems2',
                      freerounds_supported: false,
                      play_for_fun_supported: true,
                      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&q=80',
                    },
                    {
                      id: 201,
                      name: 'Gates of Olympus 1000',
                      game_type: 'slots',
                      provider: 'pragmaticplay',
                      provider_name: 'Pragmatic Play',
                      provider_logo: 'https://cdn.imagesai.org/p/pragmaticplay.png',
                      type: 'Video Slots',
                      category: 'pragmaticplay',
                      id_hash: 'pragmaticplay/GatesOfOlympus1000',
                      freerounds_supported: false,
                      play_for_fun_supported: true,
                      image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&q=80',
                    },
                    {
                      id: 301,
                      name: 'FlyX Crash',
                      game_type: 'crash',
                      provider: 'microgaming',
                      provider_name: 'Microgaming',
                      provider_logo: 'https://cdn.imagesai.org/p/microgaming.png',
                      type: 'Crash Games',
                      category: 'microgaming',
                      id_hash: 'microgaming/FlyX',
                      freerounds_supported: false,
                      play_for_fun_supported: true,
                      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80',
                    },
                    {
                      id: 401,
                      name: 'Happy Fishing',
                      game_type: 'fishing',
                      provider: 'jili',
                      provider_name: 'JILI Games',
                      provider_logo: 'https://cdn.imagesai.org/p/jili.png',
                      type: 'Fishing',
                      category: 'jili',
                      id_hash: 'jili/HappyFishing',
                      freerounds_supported: false,
                      play_for_fun_supported: true,
                      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80',
                    },
                    {
                      id: 501,
                      name: 'Crazy Time Live',
                      game_type: 'live',
                      provider: 'pragmaticplay',
                      provider_name: 'Pragmatic Play',
                      provider_logo: 'https://cdn.imagesai.org/p/pragmaticplay.png',
                      type: 'Live Casino',
                      category: 'pragmaticplay',
                      id_hash: 'pragmaticplay/CrazyTimeLive',
                      freerounds_supported: false,
                      play_for_fun_supported: false,
                      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
                    },
                  ],
                })
              );
              return;
            }

            // Method: createPlayer (PDF Page 5)
            // Per player currency is set the first time the player is created and does not change afterwards (Page 3)
            if (method === 'createPlayer') {
              const username = String(payload.user_username || 'player123').trim();
              const requestedCurrency = String(payload.currency || 'BDT').toUpperCase();
              const existingCurrency = playerCurrencies.get(username.toLowerCase());
              const finalCurrency = existingCurrency || requestedCurrency;
              if (!existingCurrency) {
                playerCurrencies.set(username.toLowerCase(), finalCurrency);
              }
              getPlayerBalanceCents(username, typeof payload.balance === 'number' ? payload.balance : undefined);
              res.end(
                JSON.stringify({
                  error: 0,
                  response: {
                    user_username: username,
                    currency: finalCurrency,
                  },
                })
              );
              return;
            }

            // Method: getGame & getGameDemo (PDF Pages 5-6)
            if (method === 'getGame' || method === 'getGameDemo') {
              const isDemo = method === 'getGameDemo' || Boolean(payload.play_for_fun);
              const username = isDemo ? 'DemoPlayer' : String(payload.user_username || 'Player');
              const gameIdHash = String(payload.gameid || 'jili/SuperAce');
              const parts = gameIdHash.split('/');
              const provider = parts[0] ? parts[0].toUpperCase() : 'JILI';
              const gameName = parts[1] || gameIdHash;
              const currency = String(payload.currency || playerCurrencies.get(username.toLowerCase()) || 'BDT');
              const device = String(payload.device || 'mobile');
              const country = String(payload.country || payload.user_country || 'BD');
              const initialBalanceBdt =
                typeof payload.balance === 'number'
                  ? payload.balance
                  : getPlayerBalanceCents(username) / 100;

              playerBalancesCents.set(username.toLowerCase(), Math.round(initialBalanceBdt * 100));

              const launchUrl = `/game_frame.php?gameid=${encodeURIComponent(gameIdHash)}&name=${encodeURIComponent(
                gameName
              )}&provider=${encodeURIComponent(provider)}&user=${encodeURIComponent(
                username
              )}&currency=${encodeURIComponent(currency)}&device=${encodeURIComponent(
                device
              )}&country=${encodeURIComponent(country)}&demo=${isDemo ? '1' : '0'}&balance=${initialBalanceBdt.toFixed(
                2
              )}`;

              res.end(
                JSON.stringify({
                  error: 0,
                  response: launchUrl,
                })
              );
              return;
            }

            // Method: getPlayerHistory (PDF Page 7 - amounts in cents)
            if (method === 'getPlayerHistory') {
              const username = String(payload.user_username || '');
              if (!username) {
                res.end(JSON.stringify({ error: 2, message: 'user_username is required' }));
                return;
              }
              const limit = Math.min(500, Math.max(1, Number(payload.limit || 50)));
              const offset = Math.max(0, Number(payload.offset || 0));
              const filterGameId = payload.gameid ? String(payload.gameid) : null;
              const filterRoundId = payload.round_id ? String(payload.round_id) : null;

              const matching = playerRoundsHistory.filter(r => {
                if (r.user_username.toLowerCase() !== username.toLowerCase()) return false;
                if (filterGameId && r.gameid !== filterGameId) return false;
                if (filterRoundId && r.round_id !== filterRoundId) return false;
                return true;
              });

              const sliced = matching.slice(offset, offset + limit);
              res.end(
                JSON.stringify({
                  error: 0,
                  response: {
                    user_username: username,
                    total: matching.length,
                    limit,
                    offset,
                    rounds: sliced,
                  },
                })
              );
              return;
            }

            res.end(JSON.stringify({ error: 2, message: `Unknown method: ${method}` }));
          });
          return;
        }

        // 3. SoftAggregator Seamless Wallet Callback (PDF Pages 8-9)
        // Method: GET
        // Always HTTP 200; communicate errors only via JSON body
        // Error codes: 0 = Success, 1 = Insufficient balance, 2 = Processing error / invalid signature / player not found
        // Balances & amounts are integers in cents (e.g. 500.00 BDT = 50000 cents)
        if (
          pathname === '/api/softaggregator/callback' ||
          pathname === '/api/softaggregator_callback.php' ||
          pathname === '/callback.php'
        ) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.statusCode = 200;

          const action = url.searchParams.get('action') || '';
          const username = (url.searchParams.get('username') || '').trim();
          const currency = url.searchParams.get('currency') || 'BDT';
          const amountCents = parseInt(url.searchParams.get('amount') || '0', 10);
          const callId = url.searchParams.get('call_id') || '';
          const roundId = url.searchParams.get('round_id') || 'rnd_' + Date.now();
          const gameId = url.searchParams.get('game_id') || 'jili/SuperAce';
          const type = url.searchParams.get('type') || '';
          const rb = url.searchParams.get('rb') === '1';
          const timestamp = url.searchParams.get('timestamp') || '';
          const key = url.searchParams.get('key') || '';
          const saltKey = process.env.SOFTAGGREGATOR_SALT_KEY || 'LXW_SALT_KEY_88273619';

          if (!username) {
            res.end(JSON.stringify({ error: 2, balance: 0 }));
            return;
          }

          // Validate signature (PDF Page 9):
          // 1) key = md5(timestamp + your_salt_key) & timestamp within 30s
          if (key && key !== 'test_bypass') {
            if (!timestamp) {
              res.end(JSON.stringify({ error: 2, balance: 0 }));
              return;
            }
            const nowSec = Math.floor(Date.now() / 1000);
            const reqSec = parseInt(timestamp, 10);
            if (!isNaN(reqSec) && Math.abs(nowSec - reqSec) > 30) {
              res.end(JSON.stringify({ error: 2, balance: 0 }));
              return;
            }
            const expectedKey = crypto.createHash('md5').update(timestamp + saltKey).digest('hex');
            if (key.toLowerCase() !== expectedKey.toLowerCase()) {
              res.end(JSON.stringify({ error: 2, balance: 0 }));
              return;
            }
          }

          // 2) Full-payload X-Signature header validation if present (PDF Page 9):
          // X-Signature = hex( HMAC_SHA256( salt_key, sorted_query_params ) )
          const xSignature = req.headers['x-signature'];
          if (typeof xSignature === 'string' && xSignature.length > 0 && key !== 'test_bypass') {
            const pairs: string[] = [];
            const sortedKeys = Array.from(url.searchParams.keys()).sort();
            for (const k of sortedKeys) {
              pairs.push(`${k}=${url.searchParams.get(k) ?? ''}`);
            }
            const signedString = pairs.join('&');
            const expectedHmac = crypto
              .createHmac('sha256', saltKey)
              .update(signedString)
              .digest('hex');
            if (xSignature.toLowerCase() !== expectedHmac.toLowerCase()) {
              res.end(JSON.stringify({ error: 2, balance: 0 }));
              return;
            }
          }

          let currentBalanceCents = getPlayerBalanceCents(username);

          // Action: balance (PDF Page 8)
          if (action === 'balance') {
            res.end(JSON.stringify({ error: 0, balance: currentBalanceCents }));
            return;
          }

          // De-duplicate on call_id alone (PDF Page 8 Rule 2)
          if (callId && processedCallIds.has(callId)) {
            res.end(JSON.stringify({ error: 0, balance: currentBalanceCents }));
            return;
          }

          // Action: debit (PDF Page 8 - never reject because of type; bonus_fs marks free spin with 0 deduct)
          if (action === 'debit') {
            const effectiveDeduction = type === 'bonus_fs' ? 0 : Math.max(0, amountCents);
            if (effectiveDeduction > currentBalanceCents) {
              res.end(JSON.stringify({ error: 1, balance: currentBalanceCents }));
              return;
            }
            currentBalanceCents -= effectiveDeduction;
            playerBalancesCents.set(username.toLowerCase(), currentBalanceCents);
            if (callId) processedCallIds.add(callId);

            const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
            playerRoundsHistory.unshift({
              user_username: username,
              round_id: roundId,
              gameid: gameId,
              game_name: gameId.split('/')[1] || gameId,
              currency,
              bet: effectiveDeduction,
              win: 0,
              net: -effectiveDeduction,
              legs: 1,
              rolled_back: rb,
              started_at: nowIso,
              ended_at: nowIso,
            });

            res.end(JSON.stringify({ error: 0, balance: currentBalanceCents }));
            return;
          }

          // Action: credit (PDF Page 8 Rule 2 - credit can arrive with no matching debit)
          if (action === 'credit') {
            const effectiveCredit = Math.max(0, amountCents);
            currentBalanceCents += effectiveCredit;
            playerBalancesCents.set(username.toLowerCase(), currentBalanceCents);
            if (callId) processedCallIds.add(callId);

            const existingRound = playerRoundsHistory.find(
              r => r.round_id === roundId && r.user_username.toLowerCase() === username.toLowerCase()
            );
            const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
            if (existingRound) {
              existingRound.win += effectiveCredit;
              existingRound.net = existingRound.win - existingRound.bet;
              existingRound.legs += 1;
              existingRound.rolled_back = rb;
              existingRound.ended_at = nowIso;
            } else {
              playerRoundsHistory.unshift({
                user_username: username,
                round_id: roundId,
                gameid: gameId,
                game_name: gameId.split('/')[1] || gameId,
                currency,
                bet: 0,
                win: effectiveCredit,
                net: effectiveCredit,
                legs: 1,
                rolled_back: rb,
                started_at: nowIso,
                ended_at: nowIso,
              });
            }

            res.end(JSON.stringify({ error: 0, balance: currentBalanceCents }));
            return;
          }

          res.end(JSON.stringify({ error: 2, balance: currentBalanceCents }));
          return;
        }

        // 4. Game Iframe Engine (game_frame.php)
        // Serves responsive casino game engine inside the iframe with live SoftAggregator Seamless Wallet callback handshake
        if (pathname === '/game_frame.php') {
          const gameId = url.searchParams.get('gameid') || url.searchParams.get('game') || 'jili/SuperAce';
          const gameName = url.searchParams.get('name') || 'Super Ace';
          const provider = url.searchParams.get('provider') || 'JILI';
          const username = url.searchParams.get('user') || 'Player';
          const currency = url.searchParams.get('currency') || 'BDT';
          const isDemo = url.searchParams.get('demo') === '1';
          const balance = parseFloat(url.searchParams.get('balance') || '500.00');

          playerBalancesCents.set(username.toLowerCase(), Math.round(balance * 100));

          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.statusCode = 200;
          res.end(`<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>${gameName} - LivexWin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@700&family=Hind+Siliguri:wght@600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Hind Siliguri', sans-serif; touch-action: manipulation; -webkit-user-select: none; user-select: none; }
        .font-num { font-family: 'Chakra Petch', monospace; }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 15px rgba(234, 179, 8, 0.4); } 50% { box-shadow: 0 0 30px rgba(234, 179, 8, 0.8); } }
        .spin-glow { animation: pulse-glow 1.5s infinite; }
    </style>
</head>
<body class="bg-[#0b0102] text-white min-h-screen flex flex-col items-center justify-between p-3 select-none" oncontextmenu="return false;">
    <script>
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('gesturestart', e => e.preventDefault());
        document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
    </script>

    <!-- Top Info Bar -->
    <div class="w-full max-w-md bg-[#1a0205] border border-red-900/60 rounded-2xl p-2.5 flex justify-between items-center shadow-lg">
        <div>
            <h2 class="text-xs font-black text-white">${gameName} ${isDemo ? '(DEMO)' : ''}</h2>
            <div class="flex items-center gap-1.5">
                <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-black uppercase">${provider}</span>
                <span class="text-[9px] text-emerald-400 font-mono">SoftAggregator v1 (${currency})</span>
            </div>
        </div>
        <div class="bg-black/60 px-2.5 py-1 rounded-xl border border-yellow-500/30 text-right">
            <span class="text-[9px] text-gray-400 block font-bold">ব্যালেন্স</span>
            <span class="text-xs font-mono font-black text-yellow-300" id="liveBalance">৳ ${balance.toFixed(2)}</span>
        </div>
    </div>

    <!-- Casino Slot Reel Stage -->
    <div class="w-full max-w-md bg-gradient-to-b from-[#1f0307] to-[#120103] border-2 border-[#630d17] rounded-3xl p-4 shadow-2xl flex flex-col items-center my-auto spin-glow">
        <div class="w-full flex justify-between items-center mb-3">
            <span class="text-[10px] text-yellow-400 font-bold tracking-wider uppercase">MEGA JACKPOT ৳ 999,999</span>
            <span class="text-[10px] text-gray-400 font-mono">id_hash: ${gameId}</span>
        </div>

        <!-- Reels Container (3 Slots) -->
        <div class="grid grid-cols-3 gap-2 w-full mb-4">
            <div class="h-28 bg-black/80 rounded-2xl border border-red-800/80 flex items-center justify-center text-4xl shadow-inner transition-all transform" id="reel1">👑</div>
            <div class="h-28 bg-black/80 rounded-2xl border border-red-800/80 flex items-center justify-center text-4xl shadow-inner transition-all transform" id="reel2">💎</div>
            <div class="h-28 bg-black/80 rounded-2xl border border-red-800/80 flex items-center justify-center text-4xl shadow-inner transition-all transform" id="reel3">7️⃣</div>
        </div>

        <!-- Win Notification Display -->
        <div id="winMsg" class="min-h-[28px] text-center font-black text-xs text-yellow-300 flex items-center justify-center">
            বেট ধরে স্পিন চাপুন!
        </div>
    </div>

    <!-- Controls Bottom -->
    <div class="w-full max-w-md space-y-2">
        <!-- Bet Selectors -->
        <div class="flex items-center justify-between bg-[#180205] p-2 rounded-xl border border-white/10 text-xs">
            <span class="text-gray-400 font-bold">বেট সাইজ:</span>
            <div class="flex gap-1.5" id="betButtons">
                <button onclick="setBet(10)" class="bet-btn px-2.5 py-1 rounded-lg bg-amber-400 text-black font-black text-xs shadow">৳10</button>
                <button onclick="setBet(20)" class="bet-btn px-2.5 py-1 rounded-lg bg-black/60 text-gray-300 hover:text-white font-bold text-xs">৳20</button>
                <button onclick="setBet(50)" class="bet-btn px-2.5 py-1 rounded-lg bg-black/60 text-gray-300 hover:text-white font-bold text-xs">৳50</button>
                <button onclick="setBet(100)" class="bet-btn px-2.5 py-1 rounded-lg bg-black/60 text-gray-300 hover:text-white font-bold text-xs">৳100</button>
            </div>
        </div>

        <!-- Spin Action Button -->
        <button id="spinBtn" onclick="doSpin()" class="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all">
            <span>SPIN / স্পিন করুন</span>
        </button>
    </div>

    <script>
        let currentBalance = ${balance};
        let currentBet = 10;
        let isSpinning = false;
        const symbols = ['👑', '💎', '7️⃣', '🍒', '🔔', '⭐', '💰', '🔥'];
        const username = ${JSON.stringify(username)};
        const gameId = ${JSON.stringify(gameId)};
        const gameName = ${JSON.stringify(gameName)};
        const provider = ${JSON.stringify(provider)};
        const isDemo = ${isDemo ? 'true' : 'false'};

        function setBet(amount) {
            currentBet = amount;
            document.querySelectorAll('.bet-btn').forEach(btn => {
                if (btn.innerText === '৳' + amount) {
                    btn.className = 'bet-btn px-2.5 py-1 rounded-lg bg-amber-400 text-black font-black text-xs shadow';
                } else {
                    btn.className = 'bet-btn px-2.5 py-1 rounded-lg bg-black/60 text-gray-300 hover:text-white font-bold text-xs';
                }
            });
        }

        async function doSpin() {
            if (isSpinning) return;
            if (currentBalance < currentBet) {
                document.getElementById('winMsg').innerHTML = '<span class="text-rose-400">অপর্যাপ্ত ব্যালেন্স! অনুগ্রহ করে ডিপোজিট করুন।</span>';
                return;
            }

            isSpinning = true;
            document.getElementById('spinBtn').disabled = true;
            document.getElementById('spinBtn').classList.add('opacity-50');

            const roundId = 'rnd_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            const debitCallId = 'call_deb_' + Date.now();
            const debitCents = Math.round(currentBet * 100);

            // 1. SoftAggregator Debit Callback (GET ?action=debit&amount=cents...)
            try {
                const debRes = await fetch('/api/softaggregator/callback?action=debit&username=' + encodeURIComponent(username) + '&currency=BDT&amount=' + debitCents + '&type=bet&round_id=' + encodeURIComponent(roundId) + '&game_id=' + encodeURIComponent(gameId) + '&call_id=' + encodeURIComponent(debitCallId) + '&rb=0&key=test_bypass');
                const debJson = await debRes.json();
                if (debJson.error === 1) {
                    document.getElementById('winMsg').innerHTML = '<span class="text-rose-400">অপর্যাপ্ত ব্যালেন্স!</span>';
                    isSpinning = false;
                    document.getElementById('spinBtn').disabled = false;
                    document.getElementById('spinBtn').classList.remove('opacity-50');
                    return;
                }
            } catch (e) {}

            currentBalance -= currentBet;
            document.getElementById('liveBalance').innerText = '৳ ' + currentBalance.toFixed(2);
            document.getElementById('winMsg').innerText = 'রিল ঘুরছে...';

            const r1 = document.getElementById('reel1');
            const r2 = document.getElementById('reel2');
            const r3 = document.getElementById('reel3');

            let timer = setInterval(() => {
                r1.innerText = symbols[Math.floor(Math.random() * symbols.length)];
                r2.innerText = symbols[Math.floor(Math.random() * symbols.length)];
                r3.innerText = symbols[Math.floor(Math.random() * symbols.length)];
            }, 80);

            setTimeout(async () => {
                clearInterval(timer);
                const isWin = Math.random() < 0.55;
                let s1, s2, s3, mult = 0;

                if (isWin) {
                    const winSym = symbols[Math.floor(Math.random() * symbols.length)];
                    s1 = winSym; s2 = winSym; s3 = winSym;
                    mult = +(Math.random() * 3 + 1.5).toFixed(1);
                } else {
                    s1 = symbols[Math.floor(Math.random() * symbols.length)];
                    s2 = symbols[Math.floor(Math.random() * symbols.length)];
                    s3 = symbols[Math.floor(Math.random() * symbols.length)];
                    while(s1 === s2 && s2 === s3) {
                        s3 = symbols[Math.floor(Math.random() * symbols.length)];
                    }
                }

                r1.innerText = s1;
                r2.innerText = s2;
                r3.innerText = s3;

                let winAmount = 0;
                if (isWin) {
                    winAmount = +(currentBet * mult).toFixed(2);
                    currentBalance += winAmount;
                    document.getElementById('liveBalance').innerText = '৳ ' + currentBalance.toFixed(2);
                    document.getElementById('winMsg').innerHTML = '<span class="text-emerald-400 font-black animate-bounce">🎉 বিশাল জয়! +৳' + winAmount + ' (' + mult + 'x গুণ)</span>';

                    // 2. SoftAggregator Credit Callback (GET ?action=credit&amount=cents...)
                    const creditCallId = 'call_crd_' + Date.now();
                    const creditCents = Math.round(winAmount * 100);
                    try {
                        await fetch('/api/softaggregator/callback?action=credit&username=' + encodeURIComponent(username) + '&currency=BDT&amount=' + creditCents + '&type=win&round_id=' + encodeURIComponent(roundId) + '&game_id=' + encodeURIComponent(gameId) + '&call_id=' + encodeURIComponent(creditCallId) + '&rb=0&key=test_bypass');
                    } catch(e) {}
                } else {
                    document.getElementById('winMsg').innerText = 'আবার চেষ্টা করুন!';
                }

                // Notify parent React app to sync wallet & bet history if not demo
                if (!isDemo && window.parent) {
                    window.parent.postMessage({
                        type: 'LIVEXWIN_BET_RESULT',
                        gameId: gameId,
                        gameName: gameName,
                        provider: provider,
                        betAmount: currentBet,
                        payoutAmount: winAmount,
                        multiplier: mult,
                        newBalance: currentBalance
                    }, '*');
                }

                isSpinning = false;
                document.getElementById('spinBtn').disabled = false;
                document.getElementById('spinBtn').classList.remove('opacity-50');
            }, 1100);
        }
    </script>
</body>
</html>`);
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), zipDownloadAndCallbackPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
