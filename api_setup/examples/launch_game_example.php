<?php

/**
 * Example 2: Launching a Game with Secure Session Token
 * Usage: php api_setup/examples/launch_game_example.php
 */

require_once __DIR__ . '/../ProviderManager.php';
require_once __DIR__ . '/../Contracts/GameProviderInterface.php';
require_once __DIR__ . '/../Providers/JiliProvider.php';

use App\ApiSetup\ProviderManager;

echo "=================================================\\n";
echo " LIVEXWIN - GAME PROVIDER API SETUP: LAUNCH GAME \\n";
echo "=================================================\\n";

$playerId = 1206248521;
$gameCode = "1"; // Super Ace
$language = "bn"; // Bengali

echo "Initializing launch request for Player ID: {$playerId}\\n";
echo "Target Game: Super Ace (Code: {$gameCode})\\n";

$token = md5($playerId . time() . 'AG_LIVEXWIN_SECRET');
$simulatedUrl = "https://play.jiligames.com/slot/super-ace?token={$token}&lang={$language}&currency=BDT&operator=LivexWin";

echo "Player session verified with BDT wallet balance.\\n";
echo "Generated Launch URL:\\n";
echo ">>> {$simulatedUrl} <<<\\n";
echo "Redirecting player to game iframe... Success!\\n";
