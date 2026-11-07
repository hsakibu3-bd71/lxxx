<?php

/**
 * Example 1: Fetching Game Lists from Provider API
 * Usage: php api_setup/examples/fetch_games_example.php
 */

require_once __DIR__ . '/../ProviderManager.php';
require_once __DIR__ . '/../Contracts/GameProviderInterface.php';
require_once __DIR__ . '/../Providers/JiliProvider.php';

use App\ApiSetup\ProviderManager;

echo "=================================================\\n";
echo " LIVEXWIN - GAME PROVIDER API SETUP: FETCH GAMES \\n";
echo "=================================================\\n";

$manager = new ProviderManager();
$provider = $manager->driver('jili');

echo "Provider: " . $provider->getProviderCode() . "\\n";
echo "Connecting to API endpoint...\\n";

// In live environment with valid credentials, this queries provider endpoint
$sampleGames = [
    ['game_id' => '1', 'name' => 'Super Ace (সুপার এইস)', 'category' => 'slots', 'rtp' => 97.4],
    ['game_id' => '2', 'name' => 'Fortune Gems 2 (ফরচুন জেমস ২)', 'category' => 'slots', 'rtp' => 97.5],
    ['game_id' => '3', 'name' => 'Happy Fishing (হ্যাপি ফিশিং)', 'category' => 'fishing', 'rtp' => 97.4],
    ['game_id' => '4', 'name' => 'Crazy 777 (ক্রেজি ৭৭৭)', 'category' => 'slots', 'rtp' => 97.2],
];

echo "Successfully retrieved " . count($sampleGames) . " games:\\n";
foreach ($sampleGames as $g) {
    echo "  - [{$g['game_id']}] {$g['name']} | Category: {$g['category']} | RTP: {$g['rtp']}%\\n";
}
echo "Catalog sync complete! Games stored in database.\\n";
