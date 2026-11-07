<?php

namespace App\ApiSetup\Contracts;

interface GameProviderInterface
{
    /**
     * Get unique provider identifier code (e.g. 'jili', 'pgsoft', 'pragmatic')
     */
    public function getProviderCode(): string;

    /**
     * Fetch complete list of games from provider
     */
    public function fetchGameList(): array;

    /**
     * Launch a game session URL for a player
     */
    public function launchGame($userId, string $gameCode, string $lang = 'bn', array $extraOptions = []): string;

    /**
     * Seamless Wallet: Check balance callback
     */
    public function checkPlayerBalance(string $playerToken): float;

    /**
     * Seamless Wallet: Process bet & win settlement
     */
    public function processSeamlessTransaction(array $payload): array;

    /**
     * Verify incoming webhook signature
     */
    public function verifySignature(array $headers, string $rawBody): bool;
}
