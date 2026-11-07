export interface GlobalAggregatorDoc {
  id: string;
  name: string;
  bengaliBadge: string;
  ggrModel: string;
  authMethod: string;
  baseEndpoint: string;
  supportedProviders: string[];
  launchFirstFlowSteps: string[];
  launchRequestExample: string;
  postLaunchBalanceCallbackExample: string;
  betWinCallbackExample: string;
  notes: string;
}

export const GLOBAL_AGGREGATOR_DOCS: GlobalAggregatorDoc[] = [
  {
    id: 'softaggregator',
    name: 'SoftAggregator Casino Games API v1 (Primary Engine)',
    bengaliBadge: 'সফটএগ্রিগেটর GGR v1 (সক্রিয়)',
    ggrModel: 'Launch-First → Post-Launch Seamless GGR (Cents Wallet + Agent GGR Credit Pool)',
    authMethod: 'JSON Body (api_login + api_password) + Callback SHA1(params + salt_key)',
    baseEndpoint: 'https://api.softaggregator.com/api/v1/ (Local Proxy: /api/softaggregator/v1)',
    supportedProviders: ['JILI', 'PG Soft', 'Pragmatic Play', 'Evolution', 'Spribe', 'FA CHAI', 'CQ9', 'JDB', 'EVOPLAY', 'Habanero'],
    launchFirstFlowSteps: [
      '1. Admin/System calls POST /api/softaggregator/v1 with method="getGameList" to clone all games, thumbnails & demo_url links.',
      '2. When player clicks a game, system calls method="createPlayer" followed by method="getGame" (or "getGameDemo" for Demo Link).',
      '3. Aggregator returns the Ultra-HD Iframe URL immediately (Launch-First).',
      '4. As the HTML5/Canvas slot or live table boots inside the iframe, it triggers GET /api/softaggregator/callback?action=balance&username=PLAYER to load the live GGR-authorized balance in cents (100 cents = 1.00 BDT).',
      '5. Every spin/round calls action=debit & action=credit with SHA1 signature verification and GGR quota tracking.',
    ],
    launchRequestExample: JSON.stringify(
      {
        api_login: 'LIVEXWIN_MERCHANT_LOGIN',
        api_password: 'LIVEXWIN_MERCHANT_PASSWORD',
        method: 'getGame',
        lang: 'bn',
        user_username: 't1206248521',
        user_password: '123456',
        gameid: 'jili/SuperAce',
        homeurl: 'https://livexwin.com',
        cashierurl: 'https://livexwin.com/deposit',
        play_for_fun: 0,
        currency: 'BDT',
        country: 'BD',
      },
      null,
      2
    ),
    postLaunchBalanceCallbackExample: `// Triggered automatically AFTER game iframe launches to load GGR balance
GET /api/softaggregator/callback?action=balance&username=t1206248521&currency=BDT&key=9f86d081884c7d659a2feaa0c55ad015a3bf4f1b

// Response (Balance in Cents: 10000 = ৳100.00 BDT)
{
  "status": "200",
  "balance": 10000,
  "currency": "BDT"
}`,
    betWinCallbackExample: `// Spin Debit & Credit (Seamless GGR Deduction)
GET /api/softaggregator/callback?action=debit&username=t1206248521&amount=1000&transaction_id=tx_99812&game_id=jili/SuperAce
GET /api/softaggregator/callback?action=credit&username=t1206248521&amount=2500&transaction_id=tx_99813&game_id=jili/SuperAce`,
    notes: 'Matches PDF specification (API_Documentation___SoftAggregator_Casino_Games_API). All monetary values in Seamless callbacks use integer cents (100 = 1 BDT).',
  },
  {
    id: 'nexusgg_fiverscan',
    name: 'NexusGG / Fiverscan / Goldsvet Clone GGR API',
    bengaliBadge: 'ক্লোন রিমোট এপিআই (GGR ক্রেডিট লঞ্চ)',
    ggrModel: 'Pre-Loaded Agent GGR Balance + Launch-First Post-Boot User Balance Sync',
    authMethod: 'JSON (agent_code + agent_token + secret_key)',
    baseEndpoint: 'https://api.nexusgg.io/api/v2',
    supportedProviders: ['JILI', 'PG Soft', 'Pragmatic Play', 'CQ9', 'Habanero', 'Booongo', 'Spadegaming'],
    launchFirstFlowSteps: [
      '1. Operator maintains an Agent GGR Point Balance (e.g. 100,000 GGR Credits at 6%–8% GGR rate).',
      '2. Operator calls POST /game_launch with agent_code, agent_token, user_code, provider_code, and game_code.',
      '3. Remote API returns launch_url immediately without pre-transferring funds.',
      '4. Once the game iframe opens on the player screen, NexusGG/Fiverscan fires POST /gold_api with method="user_balance" to load the player BDT balance into the slot cabinet.',
      '5. If Agent GGR Balance > 0, spins proceed and deduct GGR % automatically on net win/loss.',
    ],
    launchRequestExample: JSON.stringify(
      {
        method: 'game_launch',
        agent_code: 'livexwin_bd_agent',
        agent_token: 'nx_live_98a7bc65d4e3f210',
        user_code: 't1206248521',
        provider_code: 'JILI',
        game_code: 'jili_super_ace',
        lang: 'bn',
      },
      null,
      2
    ),
    postLaunchBalanceCallbackExample: `// POST /api/gold_api (Called by Remote Game Server AFTER Iframe Boots)
{
  "method": "user_balance",
  "agent_code": "livexwin_bd_agent",
  "agent_secret": "sec_88219a",
  "user_code": "t1206248521"
}

// Operator Response:
{
  "status": 1,
  "user_balance": 540.50
}`,
    betWinCallbackExample: `// POST /api/gold_api (method: "transaction")
{
  "method": "transaction",
  "agent_code": "livexwin_bd_agent",
  "user_code": "t1206248521",
  "game_type": "slot",
  "slot": {
    "provider_code": "JILI",
    "game_code": "jili_super_ace",
    "bet_money": 10.00,
    "win_money": 45.00,
    "txn_id": "nx_tx_772190"
  }
}`,
    notes: 'Most popular architecture for Asian/BDT clone sites (60bd98.vip / Baji / Jaya9 style) where game launches first and GGR balance loads dynamically inside the iframe.',
  },
  {
    id: 'slotegrator',
    name: 'Slotegrator (APIgrator Unified Casino API)',
    bengaliBadge: 'স্লটএগ্রিগেটর (APIgrator)',
    ggrModel: 'Unified Seamless Wallet + Post-Launch action=balance Handshake',
    authMethod: 'HTTP Headers: X-Merchant-Id, X-Timestamp, X-Nonce, X-Sign (HMAC-SHA1)',
    baseEndpoint: 'https://staging.slotegrator.com/api/index.php/v1',
    supportedProviders: ['Pragmatic Play', 'Evolution', 'NetEnt', 'Red Tiger', 'Amatic', 'BGaming', 'Endorphina', 'Spribe'],
    launchFirstFlowSteps: [
      '1. Fetch catalog & demo links via GET /games?page=1 (includes has_demo=1 flag).',
      '2. Launch Real Game via POST /games/init or Demo Game via POST /games/init-demo.',
      '3. When the returned iframe URL loads, Slotegrator sends POST /callback with action="balance", player_id, currency, and session_id.',
      '4. Operator verifies X-Sign HMAC-SHA1 signature and returns current player balance.',
      '5. Subsequent spins trigger action="bet", action="win", and action="refund".',
    ],
    launchRequestExample: JSON.stringify(
      {
        game_uuid: 'ae819201-jili-super-ace-9912',
        player_id: 'usr_1001',
        player_name: 't1206248521',
        currency: 'BDT',
        session_id: 'sess_livexwin_8812901',
        return_url: 'https://livexwin.com',
        language: 'bn',
      },
      null,
      2
    ),
    postLaunchBalanceCallbackExample: `// POST /api/slotegrator/callback (Headers: X-Merchant-Id, X-Timestamp, X-Nonce, X-Sign)
action=balance&player_id=usr_1001&currency=BDT&session_id=sess_livexwin_8812901

// Response:
{
  "balance": 1250.00
}`,
    betWinCallbackExample: `// POST /api/slotegrator/callback
action=bet&amount=20.00&currency=BDT&game_uuid=ae819201&player_id=usr_1001&transaction_id=sl_tx_01&session_id=sess_livexwin_8812901`,
    notes: 'Requires sorting all request parameters alphabetically, building a query string, and hashing with HMAC-SHA1(queryString, merchantKey).',
  },
  {
    id: 'softswiss',
    name: 'SOFTSWISS Game Aggregator API',
    bengaliBadge: 'সফটসুইস এগ্রিগেটর',
    ggrModel: 'Session-First Launch → Post-Launch /play Empty Actions Balance Load',
    authMethod: 'HTTP Header: X-Request-Sign (HMAC-SHA256 of raw JSON body)',
    baseEndpoint: 'https://casino.int.a8r.games',
    supportedProviders: ['BGaming', 'Pragmatic Play', 'Evolution', 'Play’n GO', 'Nolimit City', 'Hacksaw Gaming', 'Push Gaming'],
    launchFirstFlowSteps: [
      '1. Operator initiates game session via POST /sessions (or POST /demo for Demo Link).',
      '2. SOFTSWISS returns launch_options.game_url for iframe embedding.',
      '3. Immediately after iframe loads, SOFTSWISS calls Operator POST /play with user_id, currency, game, and NO actions array to load the player GGR balance in subunits.',
      '4. Every spin sends POST /play with actions: [{ action: "bet", amount: 1000 }, { action: "win", amount: 2500 }].',
    ],
    launchRequestExample: JSON.stringify(
      {
        casino_id: 'livexwin-bdt',
        game: 'jili:SuperAce',
        currency: 'BDT',
        locale: 'bn',
        ip: '103.112.204.10',
        client_type: 'mobile',
        balance: 50000,
        urls: {
          return_url: 'https://livexwin.com',
          deposit_url: 'https://livexwin.com/deposit',
        },
        user: {
          id: 't1206248521',
          firstname: 'Sakib',
          lastname: 'Hasan',
          nickname: 't1206248521',
          country: 'BD',
        },
      },
      null,
      2
    ),
    postLaunchBalanceCallbackExample: `// POST /wallet/play (Initial Post-Launch Balance Fetch)
{
  "user_id": "t1206248521",
  "currency": "BDT",
  "game": "jili:SuperAce"
}

// Response (Subunits: 50000 = ৳500.00):
{
  "balance": 50000
}`,
    betWinCallbackExample: `// POST /wallet/play (Atomic Bet + Win in single round)
{
  "user_id": "t1206248521",
  "currency": "BDT",
  "game": "jili:SuperAce",
  "game_id": "round_99182",
  "actions": [
    { "action": "bet", "amount": 1000, "action_id": "act_1" },
    { "action": "win", "amount": 3500, "action_id": "act_2" }
  ]
}`,
    notes: 'Supports single-request atomic bet+win settlement, reducing callback latency by 50% on mobile networks.',
  },
  {
    id: 'tbs2_asiagaming',
    name: 'TBS2 / Aristocrat / JILI-PG Hall-ID GGR System',
    bengaliBadge: 'TBS2 Hall-ID GGR সিস্টেম',
    ggrModel: 'Hall-ID GGR Quota + openGame.do → getBalance → writeBet',
    authMethod: 'JSON Body (hall + key)',
    baseEndpoint: 'http://tbs2api.aslot.net/API/',
    supportedProviders: ['JILI', 'PG Soft', 'Pragmatic Play', 'RubyPlay', 'CQ9', 'Spadegaming', 'FastSpin'],
    launchFirstFlowSteps: [
      '1. Operator configures Hall ID (e.g. 3201948) and Hall Secret Key.',
      '2. Call POST /API/openGame/ with cmd="openGame", hall, key, login, gameId, and demo="0" or "1".',
      '3. Iframe loads the returned content.url.',
      '4. Game server immediately posts cmd="getBalance" to Operator callback URL to load the player wallet balance into the game.',
      '5. Spins send cmd="writeBet" with bet, win, and tradeId.',
    ],
    launchRequestExample: JSON.stringify(
      {
        cmd: 'openGame',
        hall: '3201948',
        domain: 'https://livexwin.com',
        exitUrl: 'https://livexwin.com',
        language: 'bn',
        key: 'tbs2_secret_key_livexwin',
        login: 't1206248521',
        gameId: '749',
        demo: '0',
      },
      null,
      2
    ),
    postLaunchBalanceCallbackExample: `// POST /api/tbs2/callback (Fired on Iframe Boot)
{
  "cmd": "getBalance",
  "hall": "3201948",
  "key": "tbs2_secret_key_livexwin",
  "login": "t1206248521"
}

// Response:
{
  "status": "success",
  "error": "",
  "login": "t1206248521",
  "balance": "500.00",
  "currency": "BDT"
}`,
    betWinCallbackExample: `// POST /api/tbs2/callback
{
  "cmd": "writeBet",
  "hall": "3201948",
  "login": "t1206248521",
  "gameId": "749",
  "bet": "10.00",
  "win": "25.00",
  "tradeId": "tbs_882190"
}`,
    notes: 'Extremely popular for JILI, PG Soft, and Pragmatic Play Asian Hall-ID GGR packages where operators top up GGR Hall credit.',
  },
  {
    id: 'pragmatic_gs2c',
    name: 'Pragmatic Play Direct GS2C / BetSoft Seamless GGR',
    bengaliBadge: 'প্র্যাগম্যাটিক GS2C ডিরেক্ট',
    ggrModel: 'Token Launch → Authenticate.html → Balance.html → Bet/Result',
    authMethod: 'MD5 Hash Signature of sorted parameters + SecretKey',
    baseEndpoint: 'https://api.prerelease-env.biz/IntegrationService/v3/http/CasinoGameAPI',
    supportedProviders: ['Pragmatic Play', 'Pragmatic Live Casino'],
    launchFirstFlowSteps: [
      '1. Operator generates a one-time launch token and calls /game/url (or constructs gs2c/openGame.do).',
      '2. Player browser loads the GS2C HTML5 client inside the iframe.',
      '3. GS2C calls Operator /Authenticate.html with token & providerId -> Operator returns userId, currency="BDT", and cash balance.',
      '4. GS2C calls /Balance.html every 30s and /Bet.html + /Result.html on every tumble/spin.',
    ],
    launchRequestExample: JSON.stringify(
      {
        secureLogin: 'livexwin_pp_bdt',
        symbol: 'vs20olympx',
        language: 'bn',
        token: 'tok_pp_99281726',
        externalPlayerId: 't1206248521',
        playMode: 'REAL',
        hash: '6d8f90a1b2c3d4e5f678901234567890',
      },
      null,
      2
    ),
    postLaunchBalanceCallbackExample: `// POST /gs2c/Authenticate.html (Called by GS2C client when iframe opens)
providerId=PragmaticPlay&token=tok_pp_99281726&hash=4a1b2c...

// Operator Response:
{
  "userId": "t1206248521",
  "currency": "BDT",
  "cash": 500.00,
  "bonus": 0.00,
  "error": 0,
  "description": "Success"
}`,
    betWinCallbackExample: `// POST /gs2c/Bet.html
userId=t1206248521&gameId=vs20olympx&roundId=99812&amount=10.00&reference=ref_01`,
    notes: 'Native protocol for Gates of Olympus 1000, Sweet Bonanza 1000, Sugar Rush 1000, and Pragmatic Play Live Studio.',
  },
];
