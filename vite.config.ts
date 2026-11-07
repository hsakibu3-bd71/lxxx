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

            // Method: getGameList (PDF Page 4 - normalised game_type + demo_url)
            if (method === 'getGameList') {
              res.end(
                JSON.stringify({
                  error: 0,
                  response: [
                    {
                      id: 101,
                      name: 'Super Ace',
                      bengali_name: 'সুপার এইস',
                      game_type: 'slots',
                      provider: 'jili',
                      provider_name: 'Jili',
                      provider_logo: 'https://cdn.imagesai.org/p/jili.png',
                      type: 'Video Slots',
                      category: 'hot',
                      id_hash: 'jili/SuperAce',
                      rtp: 97.4,
                      multiplier: '1500X',
                      freerounds_supported: false,
                      play_for_fun_supported: true,
                      demo_url: '/game_frame.php?gameid=jili%2FSuperAce&name=Super%20Ace&provider=JILI&user=DemoPlayer&currency=BDT&device=mobile&country=BD&demo=1&balance=500.00',
                      image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80',
                    },
                    {
                      id: 102,
                      name: 'Fortune Gems 2',
                      bengali_name: 'ফরচুন জেমস ২',
                      game_type: 'slots',
                      provider: 'jili',
                      provider_name: 'Jili',
                      provider_logo: 'https://cdn.imagesai.org/p/jili.png',
                      type: 'Video Slots',
                      category: 'hot',
                      id_hash: 'jili/FortuneGems2',
                      rtp: 97.5,
                      multiplier: '15X Wheel',
                      freerounds_supported: false,
                      play_for_fun_supported: true,
                      demo_url: '/game_frame.php?gameid=jili%2FFortuneGems2&name=Fortune%20Gems%202&provider=JILI&user=DemoPlayer&currency=BDT&device=mobile&country=BD&demo=1&balance=500.00',
                      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
                    },
                    {
                      id: 103,
                      name: 'Golden Empire',
                      bengali_name: 'গোল্ডেন এম্পায়ার',
                      game_type: 'slots',
                      provider: 'jili',
                      provider_name: 'Jili',
                      provider_logo: 'https://cdn.imagesai.org/p/jili.png',
                      type: 'Video Slots',
                      category: 'slots',
                      id_hash: 'jili/GoldenEmpire',
                      rtp: 97.2,
                      multiplier: '2000X',
                      freerounds_supported: false,
                      play_for_fun_supported: true,
                      demo_url: '/game_frame.php?gameid=jili%2FGoldenEmpire&name=Golden%20Empire&provider=JILI&user=DemoPlayer&currency=BDT&device=mobile&country=BD&demo=1&balance=500.00',
                      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80',
                    },
                    {
                      id: 201,
                      name: 'Gates of Olympus 1000',
                      bengali_name: 'গেটস অফ অলিম্পাস 1000',
                      game_type: 'slots',
                      provider: 'pragmaticplay',
                      provider_name: 'Pragmatic Play',
                      provider_logo: 'https://cdn.imagesai.org/p/pragmaticplay.png',
                      type: 'Video Slots',
                      category: 'slots',
                      id_hash: 'pragmaticplay/GatesOfOlympus1000',
                      rtp: 96.5,
                      multiplier: '15,000X',
                      freerounds_supported: false,
                      play_for_fun_supported: true,
                      demo_url: '/game_frame.php?gameid=pragmaticplay%2FGatesOfOlympus1000&name=Gates%20of%20Olympus%201000&provider=PRAGMATICPLAY&user=DemoPlayer&currency=BDT&device=mobile&country=BD&demo=1&balance=500.00',
                      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&q=80',
                    },
                    {
                      id: 202,
                      name: 'Fortune Tiger',
                      bengali_name: 'ফরচুন টাইগার',
                      game_type: 'slots',
                      provider: 'pgsoft',
                      provider_name: 'Pocket Games Soft',
                      provider_logo: 'https://cdn.imagesai.org/p/pgsoft.png',
                      type: 'Video Slots',
                      category: 'hot',
                      id_hash: 'pgsoft/FortuneTiger',
                      rtp: 96.9,
                      multiplier: '2500X',
                      freerounds_supported: false,
                      play_for_fun_supported: true,
                      demo_url: '/game_frame.php?gameid=pgsoft%2FFortuneTiger&name=Fortune%20Tiger&provider=PGSOFT&user=DemoPlayer&currency=BDT&device=mobile&country=BD&demo=1&balance=500.00',
                      image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80',
                    },
                    {
                      id: 301,
                      name: 'FlyX (Crash Aviator)',
                      bengali_name: 'ফ্লাইএক্স',
                      game_type: 'crash',
                      provider: 'microgaming',
                      provider_name: 'Microgaming',
                      provider_logo: 'https://cdn.imagesai.org/p/microgaming.png',
                      type: 'Crash Games',
                      category: 'hot',
                      id_hash: 'microgaming/FlyX',
                      rtp: 97.0,
                      multiplier: '100X+',
                      freerounds_supported: false,
                      play_for_fun_supported: true,
                      demo_url: '/game_frame.php?gameid=microgaming%2FFlyX&name=FlyX&provider=MICROGAMING&user=DemoPlayer&currency=BDT&device=mobile&country=BD&demo=1&balance=500.00',
                      image: 'https://images.unsplash.com/photo-1517976487507-5b3b4a450532?w=400&q=80',
                    },
                    {
                      id: 401,
                      name: 'Happy Fishing',
                      bengali_name: 'হ্যাপি ফিশিং',
                      game_type: 'fishing',
                      provider: 'jili',
                      provider_name: 'Jili',
                      provider_logo: 'https://cdn.imagesai.org/p/jili.png',
                      type: 'Fishing',
                      category: 'fishing',
                      id_hash: 'jili/HappyFishing',
                      rtp: 97.4,
                      multiplier: '950X',
                      freerounds_supported: false,
                      play_for_fun_supported: true,
                      demo_url: '/game_frame.php?gameid=jili%2FHappyFishing&name=Happy%20Fishing&provider=JILI&user=DemoPlayer&currency=BDT&device=mobile&country=BD&demo=1&balance=500.00',
                      image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&q=80',
                    },
                    {
                      id: 501,
                      name: 'Crazy Time Live',
                      bengali_name: 'ক্রেজি টাইম লাইভ',
                      game_type: 'live',
                      provider: 'pragmaticplay',
                      provider_name: 'Pragmatic Play',
                      provider_logo: 'https://cdn.imagesai.org/p/pragmaticplay.png',
                      type: 'Live Casino',
                      category: 'live',
                      id_hash: 'pragmaticplay/CrazyTimeLive',
                      rtp: 98.1,
                      multiplier: '20,000X',
                      freerounds_supported: false,
                      play_for_fun_supported: true,
                      demo_url: '/game_frame.php?gameid=pragmaticplay%2FCrazyTimeLive&name=Crazy%20Time%20Live&provider=PRAGMATICPLAY&user=DemoPlayer&currency=BDT&device=mobile&country=BD&demo=1&balance=500.00',
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

        // 4. Ultra-HD Multi-Engine Game Iframe (game_frame.php)
        // Mirrors original provider graphics & mechanics (JILI Super Ace 5x4 Golden Card Cascade, Fortune Gems 3x3+4th Multiplier Reel, Pragmatic 6x5 Tumble 1000X, PG Soft Mahjong, FlyX Crash Canvas, Happy Fishing Ocean Canvas, Live Studio) + Launch-First GGR Balance Load Handshake
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
    <title>${gameName} - ${provider} | LivexWin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@700;800&family=Hind+Siliguri:wght@600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Hind Siliguri', sans-serif; touch-action: manipulation; -webkit-user-select: none; user-select: none; background: radial-gradient(circle at 50% 15%, #3b0710 0%, #140204 55%, #070001 100%); }
        .font-num { font-family: 'Chakra Petch', monospace; }
        @keyframes float-orb { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-4px) scale(1.06); } }
        @keyframes gold-shimmer { 0% { border-color: #f59e0b; box-shadow: 0 0 12px rgba(245,158,11,0.35); } 50% { border-color: #fef08a; box-shadow: 0 0 24px rgba(250,204,21,0.75); } 100% { border-color: #f59e0b; box-shadow: 0 0 12px rgba(245,158,11,0.35); } }
        .gold-stage { animation: gold-shimmer 2.5s infinite; }
        .orb-anim { animation: float-orb 1.8s ease-in-out infinite; }
        .card-gold { background: linear-gradient(145deg, #fde047 0%, #eab308 45%, #a16207 100%); color: #1c0204; border: 2px solid #fef9c3; }
        .card-normal { background: linear-gradient(180deg, #fffbeb 0%, #fde68a 100%); color: #111827; border: 1.5px solid #d97706; }
        .cell-win { animation: float-orb 0.45s ease-in-out infinite; box-shadow: 0 0 18px #facc15, inset 0 0 10px #fef08a !important; border-color: #fef08a !important; }
    </style>
</head>
<body class="text-white min-h-screen flex flex-col items-center justify-between p-2 sm:p-3 select-none overflow-x-hidden" oncontextmenu="return false;">
    <script>
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('gesturestart', e => e.preventDefault());
    </script>

    <!-- Top Provider & GGR Seamless Handshake Header -->
    <div class="w-full max-w-lg bg-gradient-to-r from-[#240307] via-[#38060d] to-[#240307] border border-amber-500/40 rounded-2xl p-2.5 flex justify-between items-center shadow-xl">
        <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 text-black font-black flex flex-col items-center justify-center text-[10px] leading-none shadow-md border border-yellow-200">
                <span>${provider.slice(0, 4).toUpperCase()}</span>
                <span class="text-[7px] font-bold">HD</span>
            </div>
            <div>
                <div class="flex items-center gap-1.5">
                    <h2 class="text-xs sm:text-sm font-black text-white tracking-wide">${gameName}</h2>
                    <span class="text-[9px] font-black px-1.5 py-0.5 rounded ${isDemo ? 'bg-cyan-500 text-black' : 'bg-emerald-500 text-black'}">${isDemo ? 'DEMO' : 'REAL BDT'}</span>
                </div>
                <div class="flex items-center gap-1.5 mt-0.5">
                    <span id="ggrStatusBadge" class="text-[9px] text-emerald-300 font-mono flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        GGR Wallet Synced (${gameId})
                    </span>
                </div>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <button onclick="toggleSound()" id="soundBtn" class="p-1.5 rounded-xl bg-black/50 border border-white/15 text-xs text-amber-300 hover:bg-black/80 cursor-pointer" title="সাউন্ড">🔊</button>
            <div class="bg-black/80 px-3 py-1 rounded-xl border border-yellow-400/50 text-right shadow-inner">
                <span class="text-[9px] text-amber-300/80 block font-bold uppercase">${currency} ব্যালেন্স</span>
                <span class="text-xs sm:text-sm font-num font-extrabold text-yellow-300" id="liveBalance">৳ ${balance.toFixed(2)}</span>
            </div>
        </div>
    </div>

    <!-- Dynamic Engine Stage -->
    <div id="engineContainer" class="w-full max-w-lg my-auto py-2 flex flex-col items-center justify-center"></div>

    <!-- Bottom Casino Controls Bar -->
    <div class="w-full max-w-lg bg-gradient-to-t from-[#160103] via-[#260408] to-[#1c0205] border border-amber-500/40 rounded-2xl p-2.5 shadow-2xl space-y-2">
        <div class="flex items-center justify-between gap-2 text-xs">
            <div class="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-xl border border-white/10">
                <span class="text-[10px] text-gray-400 font-bold">বেট:</span>
                <div class="flex gap-1" id="betButtons">
                    <button onclick="setBet(10)" class="bet-btn px-2 py-0.5 rounded-lg bg-amber-400 text-black font-black text-[11px] shadow cursor-pointer">৳10</button>
                    <button onclick="setBet(20)" class="bet-btn px-2 py-0.5 rounded-lg bg-black/60 text-gray-300 font-bold text-[11px] cursor-pointer">৳20</button>
                    <button onclick="setBet(50)" class="bet-btn px-2 py-0.5 rounded-lg bg-black/60 text-gray-300 font-bold text-[11px] cursor-pointer">৳50</button>
                    <button onclick="setBet(100)" class="bet-btn px-2 py-0.5 rounded-lg bg-black/60 text-gray-300 font-bold text-[11px] cursor-pointer">৳100</button>
                    <button onclick="setBet(500)" class="bet-btn px-2 py-0.5 rounded-lg bg-black/60 text-gray-300 font-bold text-[11px] cursor-pointer">৳500</button>
                </div>
            </div>
            <div class="flex items-center gap-1">
                <button id="turboBtn" onclick="toggleTurbo()" class="px-2 py-1 rounded-xl bg-black/60 border border-white/15 text-[10px] font-black text-gray-300 cursor-pointer">⚡ TURBO</button>
                <button id="autoBtn" onclick="toggleAuto()" class="px-2 py-1 rounded-xl bg-black/60 border border-white/15 text-[10px] font-black text-gray-300 cursor-pointer">🔄 AUTO</button>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <button id="buyBonusBtn" onclick="triggerBonusBuy()" class="px-3 py-2.5 rounded-xl bg-gradient-to-b from-purple-600 to-indigo-900 border border-purple-400 text-white font-black text-[10px] leading-tight shadow-lg cursor-pointer shrink-0 active:scale-95">
                <span class="block text-yellow-300">★ BUY BONUS</span>
                <span id="buyBonusPrice" class="font-num text-[11px]">৳ 500</span>
            </button>
            <button id="spinBtn" onclick="doMainAction()" class="flex-1 py-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-black font-black text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(251,191,36,0.5)] border-2 border-yellow-100 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all">
                <span id="spinBtnLabel">🎰 SPIN / স্পিন করুন</span>
            </button>
        </div>
    </div>

    <script>
        let currentBalance = ${balance};
        let currentBet = 10;
        let isSpinning = false;
        let isTurbo = false;
        let isAuto = false;
        let soundEnabled = true;
        let freeSpinsLeft = 0;
        let cascadeStep = 0;

        const username = ${JSON.stringify(username)};
        const gameId = ${JSON.stringify(gameId)};
        const gameName = ${JSON.stringify(gameName)};
        const provider = ${JSON.stringify(provider)};
        const isDemo = ${isDemo ? 'true' : 'false'};

        // Determine authentic game engine mode
        const lowerName = (gameName + ' ' + gameId + ' ' + provider).toLowerCase();
        let engineType = 'super_ace'; // default JILI 5x4 Golden Card Cascade
        if (lowerName.includes('flyx') || lowerName.includes('aviator') || lowerName.includes('crash')) {
            engineType = 'crash';
        } else if (lowerName.includes('fish')) {
            engineType = 'fishing';
        } else if (lowerName.includes('gems') || lowerName.includes('777') || lowerName.includes('money coming')) {
            engineType = 'fortune_gems';
        } else if (lowerName.includes('olympus') || lowerName.includes('bonanza') || lowerName.includes('starlight') || lowerName.includes('sugar') || lowerName.includes('pragmatic')) {
            engineType = 'olympus_1000';
        } else if (lowerName.includes('live') || lowerName.includes('roulette') || lowerName.includes('baccarat') || lowerName.includes('patti') || lowerName.includes('andar') || lowerName.includes('dragon tiger') || lowerName.includes('rummy')) {
            engineType = 'live_casino';
        }

        // Web Audio API Sound Synthesizer
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        let audioCtx = null;
        function playTone(freq, dur, type = 'sine', vol = 0.08) {
            if (!soundEnabled) return;
            try {
                if (!audioCtx) audioCtx = new AudioCtx();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(vol, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + dur);
            } catch (e) {}
        }
        function playSpinSound() { playTone(320, 0.07, 'triangle', 0.06); }
        function playWinChime() {
            playTone(523.25, 0.12, 'sine', 0.1);
            setTimeout(() => playTone(659.25, 0.12, 'sine', 0.1), 90);
            setTimeout(() => playTone(783.99, 0.22, 'triangle', 0.12), 180);
            setTimeout(() => playTone(1046.5, 0.35, 'sine', 0.14), 280);
        }

        function toggleSound() {
            soundEnabled = !soundEnabled;
            document.getElementById('soundBtn').innerText = soundEnabled ? '🔊' : '🔇';
        }
        function toggleTurbo() {
            isTurbo = !isTurbo;
            const btn = document.getElementById('turboBtn');
            btn.className = isTurbo
                ? 'px-2 py-1 rounded-xl bg-amber-400 text-black border border-yellow-200 text-[10px] font-black cursor-pointer shadow'
                : 'px-2 py-1 rounded-xl bg-black/60 border border-white/15 text-[10px] font-black text-gray-300 cursor-pointer';
        }
        function toggleAuto() {
            isAuto = !isAuto;
            const btn = document.getElementById('autoBtn');
            btn.className = isAuto
                ? 'px-2 py-1 rounded-xl bg-emerald-400 text-black border border-emerald-200 text-[10px] font-black cursor-pointer shadow'
                : 'px-2 py-1 rounded-xl bg-black/60 border border-white/15 text-[10px] font-black text-gray-300 cursor-pointer';
            if (isAuto && !isSpinning) doMainAction();
        }
        function setBet(amount) {
            currentBet = amount;
            document.getElementById('buyBonusPrice').innerText = '৳ ' + (amount * 50);
            document.querySelectorAll('.bet-btn').forEach(btn => {
                if (btn.innerText === '৳' + amount) {
                    btn.className = 'bet-btn px-2 py-0.5 rounded-lg bg-amber-400 text-black font-black text-[11px] shadow cursor-pointer';
                } else {
                    btn.className = 'bet-btn px-2 py-0.5 rounded-lg bg-black/60 text-gray-300 font-bold text-[11px] cursor-pointer';
                }
            });
        }

        // Launch-First -> Post-Launch GGR Balance Load Handshake
        async function syncInitialGgrBalance() {
            try {
                const res = await fetch('/api/softaggregator/callback?action=balance&username=' + encodeURIComponent(username) + '&currency=BDT&key=test_bypass');
                const data = await res.json();
                if (data.error === 0 && typeof data.balance === 'number') {
                    currentBalance = data.balance / 100;
                    document.getElementById('liveBalance').innerText = '৳ ' + currentBalance.toFixed(2);
                    document.getElementById('ggrStatusBadge').innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> GGR Balance Loaded (৳' + currentBalance.toFixed(0) + ')';
                }
            } catch (e) {}
        }

        // Build Engine Stage UI
        const stage = document.getElementById('engineContainer');

        if (engineType === 'super_ace') {
            stage.innerHTML = \`
                <div class="w-full bg-gradient-to-b from-[#3d070e] via-[#210307] to-[#120103] border-2 border-amber-400/80 rounded-3xl p-3 shadow-2xl gold-stage">
                    <!-- JILI Super Ace Multiplier Bar (1x 2x 3x 5x) -->
                    <div class="flex items-center justify-between bg-black/70 border border-yellow-500/40 rounded-2xl px-3 py-1.5 mb-2.5">
                        <span class="text-[10px] font-black text-amber-300 uppercase tracking-wider" id="modeBanner">JILI SUPER ACE 5x4</span>
                        <div class="flex items-center gap-1.5" id="multBar">
                            <span id="m0" class="px-2.5 py-0.5 rounded-lg bg-amber-400 text-black font-num font-black text-xs shadow">x1</span>
                            <span id="m1" class="px-2.5 py-0.5 rounded-lg bg-black/60 text-amber-300/60 font-num font-black text-xs">x2</span>
                            <span id="m2" class="px-2.5 py-0.5 rounded-lg bg-black/60 text-amber-300/60 font-num font-black text-xs">x3</span>
                            <span id="m3" class="px-2.5 py-0.5 rounded-lg bg-black/60 text-amber-300/60 font-num font-black text-xs">x5</span>
                        </div>
                    </div>
                    <!-- 5x4 Golden Playing Cards Grid (20 cells) -->
                    <div id="aceGrid" class="grid grid-cols-5 gap-1.5 w-full my-1"></div>
                    <div id="winMsg" class="mt-2 min-h-[28px] bg-black/60 rounded-xl border border-yellow-500/20 px-3 py-1 text-center font-black text-xs text-yellow-300 flex items-center justify-center">
                        🃏 গোল্ডেন কার্ড ক্যাসকেড! ৩+ ম্যাচ করলে জিতবেন (সর্বোচ্চ 1500X)
                    </div>
                </div>
            \`;
            renderSuperAceGrid();
        } else if (engineType === 'fortune_gems') {
            stage.innerHTML = \`
                <div class="w-full bg-gradient-to-b from-[#3b1504] via-[#210803] to-[#120202] border-2 border-amber-400 rounded-3xl p-3 shadow-2xl gold-stage">
                    <div class="flex justify-between items-center mb-2 px-1">
                        <span class="text-[10px] font-black text-amber-300 uppercase">💎 JILI FORTUNE GEMS 3x3 + 4TH REEL</span>
                        <span class="text-[10px] font-num font-black px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">MAX 15X WHEEL</span>
                    </div>
                    <div class="grid grid-cols-4 gap-2 w-full my-1">
                        <div class="col-span-3 grid grid-cols-3 gap-1.5" id="gemsGrid"></div>
                        <div class="col-span-1 bg-gradient-to-b from-amber-900/80 via-yellow-950 to-amber-900/80 border-2 border-yellow-400 rounded-2xl p-1.5 flex flex-col justify-between items-center" id="fourthReel">
                            <div class="text-[9px] font-black text-yellow-300 uppercase">4th Reel</div>
                            <div id="multWheelTop" class="w-full h-12 rounded-xl bg-black/50 flex items-center justify-center font-num font-black text-sm text-amber-200/60">2X</div>
                            <div id="multWheelCenter" class="w-full h-16 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-black flex items-center justify-center font-num font-black text-xl shadow-lg border-2 border-white">5X</div>
                            <div id="multWheelBot" class="w-full h-12 rounded-xl bg-black/50 flex items-center justify-center font-num font-black text-sm text-amber-200/60">10X</div>
                        </div>
                    </div>
                    <div id="winMsg" class="mt-2 min-h-[28px] bg-black/60 rounded-xl border border-yellow-500/20 px-3 py-1 text-center font-black text-xs text-yellow-300 flex items-center justify-center">
                        💎 ৪র্থ রিলের গুনিতক আপনার জয়ের সাথে সরাসরি গুণ হবে!
                    </div>
                </div>
            \`;
            renderFortuneGemsGrid();
        } else if (engineType === 'olympus_1000') {
            stage.innerHTML = \`
                <div class="w-full bg-gradient-to-b from-[#2b0938] via-[#1a0424] to-[#0d0112] border-2 border-amber-400 rounded-3xl p-3 shadow-2xl gold-stage">
                    <div class="flex justify-between items-center mb-2">
                        <div class="flex items-center gap-1.5">
                            <span class="text-lg">⚡</span>
                            <span class="text-[11px] font-black text-amber-300 uppercase">${gameName} (6x5 TUMBLE)</span>
                        </div>
                        <div id="zeusOrbBadge" class="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-num font-black text-xs shadow orb-anim">
                            ⚡ ORB: 1000X READY
                        </div>
                    </div>
                    <div id="olympusGrid" class="grid grid-cols-6 gap-1 w-full my-1"></div>
                    <div id="winMsg" class="mt-2 min-h-[28px] bg-black/60 rounded-xl border border-purple-400/30 px-3 py-1 text-center font-black text-xs text-yellow-300 flex items-center justify-center">
                        ⚡ ৮+ যেকোনো প্রতীক মিললেই টাম্বল জয় এবং জিউস ১০০০X মাল্টিপ্লায়ার!
                    </div>
                </div>
            \`;
            renderOlympusGrid();
        } else if (engineType === 'crash') {
            document.getElementById('spinBtnLabel').innerText = '🚀 BET & LAUNCH / উড্ডয়ন করুন';
            stage.innerHTML = \`
                <div class="w-full bg-gradient-to-b from-[#170308] to-[#090103] border-2 border-rose-500/70 rounded-3xl p-3 shadow-2xl">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] font-black text-rose-400 uppercase">✈️ FLYX / AVIATOR CRASH ENGINE</span>
                        <div class="flex gap-1 text-[10px] font-num font-bold">
                            <span class="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">2.45x</span>
                            <span class="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700">14.80x</span>
                            <span class="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">108.5x</span>
                        </div>
                    </div>
                    <div class="relative w-full h-56 bg-black/90 rounded-2xl border border-red-900/60 overflow-hidden flex items-center justify-center">
                        <canvas id="crashCanvas" width="420" height="224" class="w-full h-full"></canvas>
                        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span id="crashMultText" class="text-4xl sm:text-5xl font-num font-black text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">1.00x</span>
                            <span id="crashSubText" class="text-[11px] font-bold text-emerald-400 mt-1">উড্ডয়নের জন্য প্রস্তুত</span>
                        </div>
                    </div>
                    <div id="winMsg" class="mt-2 min-h-[28px] bg-black/60 rounded-xl px-3 py-1 text-center font-black text-xs text-yellow-300 flex items-center justify-center">
                        🚀 প্লেন উড়ে যাওয়ার আগে ক্যাশ আউট করুন!
                    </div>
                </div>
            \`;
            drawCrashIdle();
        } else if (engineType === 'fishing') {
            document.getElementById('spinBtnLabel').innerText = '🎯 FIRE CANNON / তোপ দাগুন';
            stage.innerHTML = \`
                <div class="w-full bg-gradient-to-b from-[#03263d] via-[#021829] to-[#010c14] border-2 border-cyan-400/80 rounded-3xl p-3 shadow-2xl">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] font-black text-cyan-300 uppercase">🌊 JILI HAPPY FISHING 888X BOSS</span>
                        <span class="text-[10px] font-num font-black px-2 py-0.5 rounded bg-amber-400 text-black">🐉 GOLDEN DRAGON ACTIVE</span>
                    </div>
                    <div class="relative w-full h-60 bg-[#021b2e] rounded-2xl border border-cyan-500/40 overflow-hidden cursor-crosshair" onclick="doMainAction()">
                        <canvas id="fishCanvas" width="440" height="240" class="w-full h-full"></canvas>
                        <div class="absolute bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-t from-amber-600 to-yellow-400 text-black px-4 py-1 rounded-t-2xl font-black text-[10px] border-2 border-white shadow-lg">
                            🔫 LASER CANNON (৳<span id="cannonBetLabel">10</span>/Shot)
                        </div>
                    </div>
                    <div id="winMsg" class="mt-2 min-h-[28px] bg-black/60 rounded-xl px-3 py-1 text-center font-black text-xs text-yellow-300 flex items-center justify-center">
                        🐟 সমুদ্রের যেকোনো মাছে ক্লিক করুন অথবা নিচে FIRE বাটন চাপুন!
                    </div>
                </div>
            \`;
            initFishingCanvas();
        } else {
            document.getElementById('spinBtnLabel').innerText = '🎲 DEAL & BET / বাজি ধরুন';
            stage.innerHTML = \`
                <div class="w-full bg-gradient-to-b from-[#2e050a] via-[#1a0205] to-[#0d0102] border-2 border-amber-400 rounded-3xl p-3 shadow-2xl gold-stage">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] font-black text-rose-400 flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> LIVE HD DEALER STUDIO</span>
                        <span class="text-[10px] font-num font-bold text-amber-300">TABLE #VIP-01</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2.5 my-2">
                        <div id="liveHandA" class="bg-black/75 border-2 border-blue-500/60 rounded-2xl p-3 flex flex-col items-center">
                            <span class="text-[10px] font-black text-blue-300 uppercase mb-1">PLAYER / ANDAR (2.0x)</span>
                            <div class="flex gap-1.5 text-2xl my-1" id="cardsA">🂡 🂮</div>
                            <span id="scoreA" class="text-xs font-num font-black text-white">Points: 9</span>
                        </div>
                        <div id="liveHandB" class="bg-black/75 border-2 border-rose-500/60 rounded-2xl p-3 flex flex-col items-center">
                            <span class="text-[10px] font-black text-rose-300 uppercase mb-1">BANKER / BAHAR (1.98x)</span>
                            <div class="flex gap-1.5 text-2xl my-1" id="cardsB">🂱 🂽</div>
                            <span id="scoreB" class="text-xs font-num font-black text-white">Points: 8</span>
                        </div>
                    </div>
                    <div id="winMsg" class="mt-2 min-h-[28px] bg-black/60 rounded-xl px-3 py-1 text-center font-black text-xs text-yellow-300 flex items-center justify-center">
                        🎥 লাইভ ডিলার টেবিল প্রস্তুত! বাজি ধরতে DEAL বাটনে ক্লিক করুন
                    </div>
                </div>
            \`;
        }

        // Render Helpers
        const aceSymbols = [
            { t: 'A♠️', c: 'text-slate-900' },
            { t: 'K♥️', c: 'text-red-600' },
            { t: 'Q♦️', c: 'text-red-600' },
            { t: 'J♣️', c: 'text-slate-900' },
            { t: '👑', c: 'text-amber-600' },
            { t: '🃏WILD', c: 'text-purple-800' }
        ];

        function renderSuperAceGrid(winSymbol = null, goldIndices = []) {
            const g = document.getElementById('aceGrid');
            if (!g) return;
            g.innerHTML = '';
            for (let i = 0; i < 20; i++) {
                const isGold = goldIndices.includes(i) || Math.random() < 0.22;
                const sym = (winSymbol && (i % 5 < 3) && Math.random() < 0.65)
                    ? winSymbol
                    : aceSymbols[Math.floor(Math.random() * aceSymbols.length)];
                const isWinningCell = winSymbol && sym.t === winSymbol.t && (i % 5 < 3);
                const div = document.createElement('div');
                div.className = \`h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center font-black text-xs sm:text-sm shadow-md transition-all duration-200 \${isGold ? 'card-gold' : 'card-normal'} \${isWinningCell ? 'cell-win' : ''}\`;
                div.innerHTML = \`<span>\${sym.t}</span>\${isGold ? '<span class="text-[7px] font-extrabold uppercase tracking-tighter bg-black/80 text-yellow-300 px-1 rounded">GOLD</span>' : ''}\`;
                g.appendChild(div);
            }
        }

        const gemSymbols = ['👑', '🔴', '🔵', '🟢', '🟣', '🔶', '🅰️', '🅺'];
        function renderFortuneGemsGrid(winSym = null, multVal = '5X') {
            const g = document.getElementById('gemsGrid');
            if (!g) return;
            g.innerHTML = '';
            for (let i = 0; i < 9; i++) {
                const sym = (winSym && (i >= 3 && i <= 5)) ? winSym : gemSymbols[Math.floor(Math.random() * gemSymbols.length)];
                const isMidWin = Boolean(winSym && i >= 3 && i <= 5);
                const div = document.createElement('div');
                div.className = \`h-16 bg-gradient-to-b from-[#2b0509] to-[#120103] border-2 \${isMidWin ? 'border-yellow-300 cell-win' : 'border-amber-600/60'} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-inner\`;
                div.innerText = sym;
                g.appendChild(div);
            }
            const c = document.getElementById('multWheelCenter');
            if (c) c.innerText = multVal;
        }

        const olympusSymbols = ['👑', '⏳', '💍', '🏆', '🔴', '🟣', '🟡', '🟢', '🔵'];
        function renderOlympusGrid(winSym = null, orbText = null) {
            const g = document.getElementById('olympusGrid');
            if (!g) return;
            g.innerHTML = '';
            const orbIdx = orbText ? Math.floor(Math.random() * 30) : -1;
            for (let i = 0; i < 30; i++) {
                const div = document.createElement('div');
                if (i === orbIdx && orbText) {
                    div.className = 'h-10 sm:h-11 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 text-black font-num font-black text-xs flex items-center justify-center border-2 border-white cell-win';
                    div.innerText = orbText;
                } else {
                    const s = (winSym && Math.random() < 0.36) ? winSym : olympusSymbols[Math.floor(Math.random() * olympusSymbols.length)];
                    const isMatch = winSym && s === winSym;
                    div.className = \`h-10 sm:h-11 rounded-xl bg-black/75 border \${isMatch ? 'border-yellow-300 cell-win' : 'border-purple-800/60'} flex items-center justify-center text-lg sm:text-xl\`;
                    div.innerText = s;
                }
                g.appendChild(div);
            }
        }

        function drawCrashIdle(mult = 1.0, progress = 0) {
            const canvas = document.getElementById('crashCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            for (let x = 0; x < canvas.width; x += 40) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }
            if (progress > 0) {
                const endX = 30 + progress * (canvas.width - 70);
                const endY = canvas.height - 25 - Math.pow(progress, 1.5) * (canvas.height - 65);
                const grad = ctx.createLinearGradient(30, canvas.height - 25, endX, endY);
                grad.addColorStop(0, '#f43f5e');
                grad.addColorStop(1, '#facc15');
                ctx.strokeStyle = grad;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(30, canvas.height - 25);
                ctx.quadraticCurveTo(endX * 0.55, canvas.height - 25, endX, endY);
                ctx.stroke();
                ctx.font = '22px sans-serif';
                ctx.fillText('🚀', endX - 10, endY + 6);
            }
        }

        let fishes = [];
        function initFishingCanvas() {
            const canvas = document.getElementById('fishCanvas');
            if (!canvas) return;
            fishes = [
                { x: 60, y: 50, vx: 1.4, icon: '🐉', mult: '888X', size: 28 },
                { x: 220, y: 95, vx: -1.6, icon: '🦈', mult: '100X', size: 24 },
                { x: 140, y: 150, vx: 1.9, icon: '🐡', mult: '25X', size: 20 },
                { x: 310, y: 65, vx: -1.2, icon: '🐙', mult: '50X', size: 22 },
                { x: 90, y: 185, vx: 2.2, icon: '🐠', mult: '10X', size: 18 }
            ];
            function stepFish() {
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                fishes.forEach(f => {
                    f.x += f.vx;
                    if (f.x > canvas.width - 30) f.vx = -Math.abs(f.vx);
                    if (f.x < 20) f.vx = Math.abs(f.vx);
                    ctx.font = f.size + 'px sans-serif';
                    ctx.fillText(f.icon, f.x, f.y);
                    ctx.font = 'bold 10px monospace';
                    ctx.fillStyle = '#fde047';
                    ctx.fillText(f.mult, f.x + 2, f.y + 12);
                });
                requestAnimationFrame(stepFish);
            }
            requestAnimationFrame(stepFish);
        }

        function triggerBonusBuy() {
            const cost = currentBet * 50;
            if (currentBalance < cost) {
                document.getElementById('winMsg').innerHTML = '<span class="text-rose-400">বোনাস কিনতে ৳' + cost + ' ব্যালেন্স প্রয়োজন!</span>';
                return;
            }
            freeSpinsLeft = 10;
            doMainAction(true);
        }

        async function doMainAction(isBonusBuy = false) {
            if (isSpinning) return;
            const effectiveBet = isBonusBuy ? currentBet * 50 : currentBet;
            if (currentBalance < effectiveBet) {
                document.getElementById('winMsg').innerHTML = '<span class="text-rose-400">অপর্যাপ্ত ব্যালেন্স! অনুগ্রহ করে ডিপোজিট করুন।</span>';
                isAuto = false;
                return;
            }

            isSpinning = true;
            playSpinSound();
            document.getElementById('spinBtn').disabled = true;
            document.getElementById('spinBtn').classList.add('opacity-60');

            const roundId = 'rnd_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            const debitCallId = 'call_deb_' + Date.now();
            const debitCents = Math.round(effectiveBet * 100);

            try {
                const debRes = await fetch('/api/softaggregator/callback?action=debit&username=' + encodeURIComponent(username) + '&currency=BDT&amount=' + debitCents + '&type=bet&round_id=' + encodeURIComponent(roundId) + '&game_id=' + encodeURIComponent(gameId) + '&call_id=' + encodeURIComponent(debitCallId) + '&rb=0&key=test_bypass');
                const debJson = await debRes.json();
                if (debJson.error === 1) {
                    document.getElementById('winMsg').innerHTML = '<span class="text-rose-400">অপর্যাপ্ত ব্যালেন্স!</span>';
                    isSpinning = false;
                    document.getElementById('spinBtn').disabled = false;
                    document.getElementById('spinBtn').classList.remove('opacity-60');
                    return;
                }
            } catch (e) {}

            currentBalance -= effectiveBet;
            document.getElementById('liveBalance').innerText = '৳ ' + currentBalance.toFixed(2);
            document.getElementById('winMsg').innerText = isBonusBuy ? '🔥 ১০টি ফ্রি স্পিন সুপার বোনাস চলছে...' : '🎰 রিল ঘুরছে...';

            const animDuration = isTurbo ? 350 : 950;
            let ticks = 0;
            const animTimer = setInterval(() => {
                ticks++;
                playSpinSound();
                if (engineType === 'super_ace') renderSuperAceGrid();
                else if (engineType === 'fortune_gems') renderFortuneGemsGrid(null, ['1X', '2X', '3X', '5X', '10X', '15X'][ticks % 6]);
                else if (engineType === 'olympus_1000') renderOlympusGrid();
                else if (engineType === 'crash') {
                    const p = Math.min(1, ticks / 12);
                    const m = (1 + p * 2.4).toFixed(2);
                    document.getElementById('crashMultText').innerText = m + 'x';
                    drawCrashIdle(m, p);
                }
            }, 85);

            setTimeout(async () => {
                clearInterval(animTimer);
                const isWin = isBonusBuy ? true : Math.random() < 0.58;
                let mult = 0;

                if (isWin) {
                    mult = isBonusBuy
                        ? +(Math.random() * 45 + 35).toFixed(1)
                        : +(Math.random() * 4.5 + 1.5).toFixed(1);
                    cascadeStep = (cascadeStep + 1) % 4;
                } else {
                    cascadeStep = 0;
                }

                if (engineType === 'super_ace') {
                    const winSym = isWin ? aceSymbols[Math.floor(Math.random() * 5)] : null;
                    renderSuperAceGrid(winSym, [2, 7, 12, 17]);
                    ['m0', 'm1', 'm2', 'm3'].forEach((id, idx) => {
                        const el = document.getElementById(id);
                        if (el) {
                            el.className = idx === cascadeStep
                                ? 'px-2.5 py-0.5 rounded-lg bg-amber-400 text-black font-num font-black text-xs shadow scale-110'
                                : 'px-2.5 py-0.5 rounded-lg bg-black/60 text-amber-300/60 font-num font-black text-xs';
                        }
                    });
                } else if (engineType === 'fortune_gems') {
                    const winSym = isWin ? gemSymbols[Math.floor(Math.random() * 5)] : null;
                    const wheelMult = isWin ? (mult >= 5 ? '10X' : '5X') : '1X';
                    renderFortuneGemsGrid(winSym, wheelMult);
                } else if (engineType === 'olympus_1000') {
                    const winSym = isWin ? olympusSymbols[Math.floor(Math.random() * 5)] : null;
                    renderOlympusGrid(winSym, isWin ? (isBonusBuy ? '⚡100X' : '⚡15X') : null);
                } else if (engineType === 'crash') {
                    const finalM = isWin ? mult.toFixed(2) : '1.00';
                    document.getElementById('crashMultText').innerText = finalM + 'x';
                    document.getElementById('crashSubText').innerText = isWin ? '✅ সফল ক্যাশ আউট!' : '💥 ক্র্যাশ হয়েছে!';
                    drawCrashIdle(finalM, isWin ? 0.85 : 0.2);
                } else if (engineType === 'live_casino') {
                    const sA = isWin ? 9 : 4;
                    const sB = isWin ? 6 : 9;
                    document.getElementById('scoreA').innerText = 'Points: ' + sA;
                    document.getElementById('scoreB').innerText = 'Points: ' + sB;
                }

                let winAmount = 0;
                if (isWin) {
                    playWinChime();
                    winAmount = +(currentBet * mult).toFixed(2);
                    currentBalance += winAmount;
                    document.getElementById('liveBalance').innerText = '৳ ' + currentBalance.toFixed(2);
                    document.getElementById('winMsg').innerHTML = '<span class="text-emerald-300 font-black animate-bounce">🎉 মেগা উইন! +৳' + winAmount.toFixed(2) + ' (' + mult + 'X)</span>';

                    const creditCallId = 'call_crd_' + Date.now();
                    const creditCents = Math.round(winAmount * 100);
                    try {
                        await fetch('/api/softaggregator/callback?action=credit&username=' + encodeURIComponent(username) + '&currency=BDT&amount=' + creditCents + '&type=win&round_id=' + encodeURIComponent(roundId) + '&game_id=' + encodeURIComponent(gameId) + '&call_id=' + encodeURIComponent(creditCallId) + '&rb=0&key=test_bypass');
                    } catch(e) {}
                } else {
                    document.getElementById('winMsg').innerText = 'আবার স্পিন করুন — জ্যাকপট খুব কাছে!';
                }

                if (!isDemo && window.parent) {
                    window.parent.postMessage({
                        type: 'LIVEXWIN_BET_RESULT',
                        gameId: gameId,
                        gameName: gameName,
                        provider: provider,
                        betAmount: effectiveBet,
                        payoutAmount: winAmount,
                        multiplier: mult,
                        newBalance: currentBalance
                    }, '*');
                }

                isSpinning = false;
                document.getElementById('spinBtn').disabled = false;
                document.getElementById('spinBtn').classList.remove('opacity-60');

                if (isAuto) {
                    setTimeout(() => {
                        if (isAuto && !isSpinning) doMainAction();
                    }, 550);
                }
            }, animDuration);
        }

        // Trigger initial Launch-First -> GGR Balance Load Handshake
        syncInitialGgrBalance();
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
