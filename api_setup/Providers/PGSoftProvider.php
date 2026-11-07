<?php

namespace App\ApiSetup\Providers;

use App\ApiSetup\Contracts\GameProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class PGSoftProvider implements GameProviderInterface
{
    protected string $apiUrl;
    protected string $operatorToken;
    protected string $secretKey;
    protected string $currency = 'BDT';

    public function __construct(array $config)
    {
        $this->apiUrl = rtrim($config['api_url'] ?? 'https://api.pgsoft.com/v2', '/');
        $this->operatorToken = $config['merchant_code'] ?? 'PG_LIVEXWIN_PRO';
        $this->secretKey = $config['secret_key'] ?? '';
        $this->currency = $config['currency'] ?? 'BDT';
    }

    public function getProviderCode(): string
    {
        return 'pgsoft';
    }

    public function fetchGameList(): array
    {
        try {
            $response = Http::asForm()->timeout(15)->post("{$this->apiUrl}/Game/Get", [
                'operator_token' => $this->operatorToken,
                'currency' => $this->currency,
            ]);

            $data = $response->json();
            $games = [];

            if (($data['error'] ?? null) === null && !empty($data['data'])) {
                foreach ($data['data'] as $game) {
                    $games[] = [
                        'provider_id' => 'pgsoft',
                        'game_code' => (string)($game['game_id'] ?? ''),
                        'name' => $game['game_name'] ?? 'PG Soft Slot',
                        'bengali_name' => $game['game_name_bn'] ?? $game['game_name'] ?? 'পিজি সফট স্লট',
                        'category' => 'slots',
                        'image' => $game['icon_url'] ?? '',
                        'rtp' => 96.8,
                        'is_active' => true,
                    ];
                }
            }
            return $games;
        } catch (Exception $e) {
            Log::error("PGSoft FetchGameList Failed: " . $e->getMessage());
            return [];
        }
    }

    public function launchGame($userId, string $gameCode, string $lang = 'bn', array $extraOptions = []): string
    {
        $token = "pg_token_" . $userId . "_" . time();

        $postData = [
            'operator_token' => $this->operatorToken,
            'path' => "/{$gameCode}/index.html",
            'extra_args' => "btt=1&ops={$token}&l=" . ($lang === 'bn' ? 'bn' : 'en'),
        ];

        return "https://m.pgsoft.com{$postData['path']}?{$postData['extra_args']}";
    }

    public function checkPlayerBalance(string $playerToken): float
    {
        $userId = explode('_', $playerToken)[2] ?? null;
        $user = \App\Models\User::with('wallet')->find($userId);
        return $user && $user->wallet ? (float)$user->wallet->balance : 0.00;
    }

    public function processSeamlessTransaction(array $payload): array
    {
        $userId = $payload['player_name'] ?? 1;
        $bet = (float)($payload['bet_amount'] ?? 0);
        $win = (float)($payload['win_amount'] ?? 0);

        $wallet = \App\Models\Wallet::where('user_id', $userId)->firstOrFail();
        $net = $win - $bet;
        $wallet->balance += $net;
        $wallet->save();

        return [
            'data' => [
                'currency_code' => 'BDT',
                'balance_amount' => $wallet->balance,
                'updated_time' => time() * 1000,
            ],
            'error' => null,
        ];
    }

    public function verifySignature(array $headers, string $rawBody): bool
    {
        return true;
    }
}
