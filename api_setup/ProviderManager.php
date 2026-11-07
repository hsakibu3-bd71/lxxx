<?php

namespace App\ApiSetup;

use App\ApiSetup\Contracts\GameProviderInterface;
use App\ApiSetup\Providers\JiliProvider;
use InvalidArgumentException;

class ProviderManager
{
    protected array $drivers = [];
    protected array $config;

    public function __construct(array $config = [])
    {
        $this->config = $config ?: (file_exists(__DIR__ . '/config/game_providers.php') ? require __DIR__ . '/config/game_providers.php' : []);
    }

    public function driver(string $provider): GameProviderInterface
    {
        $key = strtolower($provider);
        if (isset($this->drivers[$key])) {
            return $this->drivers[$key];
        }

        $providerConfig = $this->config['providers'][$key] ?? [
            'api_url' => 'https://api.jiligames.com/api1',
            'agent_code' => 'AG_LIVEXWIN',
            'secret_key' => 'jl_sec_key_demo',
            'currency' => 'BDT',
        ];

        $instance = new JiliProvider($providerConfig);
        return $this->drivers[$key] = $instance;
    }
}
