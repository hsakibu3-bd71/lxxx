<?php

namespace App\ApiSetup\Providers;

use App\ApiSetup\Contracts\GameProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class JiliProvider implements GameProviderInterface
{
    protected string $apiUrl;
    protected string $merchantCode;
    protected string $secretKey;
    protected string $agentCode;
    protected string $currency = 'BDT';

    public function __construct(array $config)
    {
        $this->apiUrl = rtrim($config['api_url'] ?? 'https://api.jiligames.com/api1', '/');
        $this->merchantCode = $config['merchant_code'] ?? '';
        $this->secretKey = $config['secret_key'] ?? '';
        $this->agentCode = $config['agent_code'] ?? 'AG_LIVEXWIN';
        $this->currency = $config['currency'] ?? 'BDT';
    }

    public function getProviderCode(): string
    {
        return 'jili';
    }

    public function fetchGameList(): array
    {
        $timestamp = time();
        $params = [
            'AgentId' => $this->agentCode,
            'Timestamp' => $timestamp,
            'Key' => md5($timestamp . $this->agentCode . $this->secretKey),
        ];

        try {
            $response = Http::timeout(10)->get("{$this->apiUrl}/GetGameList", $params);
            $res = $response->json();
            return $res['Data'] ?? [];
        } catch (Exception $e) {
            Log::error("JILI fetchGameList failed: " . $e->getMessage());
            return [];
        }
    }

    public function launchGame($userId, string $gameCode, string $lang = 'bn', array $extraOptions = []): string
    {
        $timestamp = time();
        $account = "usr_" . $userId;
        
        $postData = [
            'Account' => $account,
            'GameId' => (int)$gameCode,
            'Lang' => $lang === 'bn' ? 'bn-BD' : 'en-US',
            'AgentId' => $this->agentCode,
            'Currency' => $this->currency,
            'Timestamp' => $timestamp,
            'Key' => md5($timestamp . $this->agentCode . $this->secretKey),
        ];

        $response = Http::asJson()->timeout(10)->post("{$this->apiUrl}/Login", $postData);
        $res = $response->json();

        if (($res['ErrorCode'] ?? -1) === 0 && !empty($res['Data'])) {
            return $res['Data'];
        }

        throw new Exception("JILI Launch Failed: " . ($res['Message'] ?? 'Unknown Error'));
    }

    public function checkPlayerBalance(string $playerToken): float
    {
        return 0.00;
    }

    public function processSeamlessTransaction(array $payload): array
    {
        return ['ErrorCode' => 0, 'Message' => 'Success'];
    }

    public function verifySignature(array $headers, string $rawBody): bool
    {
        return true;
    }
}
