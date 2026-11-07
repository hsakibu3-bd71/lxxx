<?php

namespace App\ApiSetup\Providers;

use App\ApiSetup\Contracts\GameProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class PragmaticPlayProvider implements GameProviderInterface
{
    protected string $apiUrl;
    protected string $secureLogin;
    protected string $secretKey;
    protected string $currency = 'BDT';

    public function __construct(array $config)
    {
        $this->apiUrl = rtrim($config['api_url'] ?? 'https://api.pragmaticplay.net/gs2c', '/');
        $this->secureLogin = $config['merchant_code'] ?? 'PP_LIVEXWIN';
        $this->secretKey = $config['secret_key'] ?? '';
        $this->currency = $config['currency'] ?? 'BDT';
    }

    public function getProviderCode(): string
    {
        return 'pragmatic';
    }

    public function fetchGameList(): array
    {
        return [
            [
                'provider_id' => 'pragmatic',
                'game_code' => 'vs20olympgate',
                'name' => 'Gates of Olympus',
                'bengali_name' => 'গেটস অফ অলিম্পাস',
                'category' => 'slots',
                'image' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
                'rtp' => 96.5,
                'is_active' => true,
            ],
            [
                'provider_id' => 'pragmatic',
                'game_code' => 'vs20buffking',
                'name' => 'Buffalo King Megaways',
                'bengali_name' => 'বাফেলো কিং মেগাওয়েজ',
                'category' => 'slots',
                'image' => 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400',
                'rtp' => 96.06,
                'is_active' => true,
            ]
        ];
    }

    public function launchGame($userId, string $gameCode, string $lang = 'bn', array $extraOptions = []): string
    {
        $token = 'pp_' . $userId . '_' . md5(uniqid());
        $params = http_build_query([
            'symbol' => $gameCode,
            'token' => $token,
            'language' => $lang === 'bn' ? 'bn' : 'en',
            'cur' => $this->currency,
            'lobbyURL' => config('app.url'),
        ]);

        return "{$this->apiUrl}/CasinoService.do?{$params}";
    }

    public function checkPlayerBalance(string $playerToken): float
    {
        return 500.00;
    }

    public function processSeamlessTransaction(array $payload): array
    {
        return [
            'error' => 0,
            'description' => 'Success',
            'balance' => 500.00,
            'currency' => $this->currency,
        ];
    }

    public function verifySignature(array $headers, string $rawBody): bool
    {
        return true;
    }
}
