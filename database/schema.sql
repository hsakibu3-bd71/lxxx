-- LivexWin Casino Production Database Schema & Initial Seeds
-- Compatible with MySQL 8.0+ and MariaDB 10.4+

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `wallets`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `games`;
DROP TABLE IF EXISTS `provider_configs`;
DROP TABLE IF EXISTS `bound_wallets`;
DROP TABLE IF EXISTS `bet_logs`;
DROP TABLE IF EXISTS `site_settings`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `nickname` varchar(100) DEFAULT NULL,
  `phone` varchar(25) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `trx_password` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  `role` enum('player','admin','superadmin') NOT NULL DEFAULT 'player',
  `status` enum('active','banned','suspended') NOT NULL DEFAULT 'active',
  `vip_level` tinyint unsigned NOT NULL DEFAULT 0,
  `vip_points` int unsigned NOT NULL DEFAULT 0,
  `invitation_code` varchar(50) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Wallets Table (Atomic Row-Level Locking via SELECT ... FOR UPDATE & version counter)
CREATE TABLE `wallets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL UNIQUE,
  `balance` decimal(14,2) NOT NULL DEFAULT 0.00,
  `frozen_balance` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_deposited` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_withdrawn` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_wagered` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_won` decimal(14,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(5) NOT NULL DEFAULT 'BDT',
  `version` bigint unsigned NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `wallets_user_id_foreign` (`user_id`),
  CONSTRAINT `wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wallets_non_negative_balance` CHECK (`balance` >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Transactions & Atomic Balance Ledger Table (Deposits, Withdrawals, Game Winnings/Losses, Bonuses)
CREATE TABLE `transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `type` enum('deposit','withdraw','bet','win','bonus','refund') NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `before_balance` decimal(14,2) NOT NULL DEFAULT 0.00,
  `after_balance` decimal(14,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
  `method` varchar(30) DEFAULT NULL,
  `channel` varchar(30) DEFAULT NULL,
  `trx_id` varchar(60) DEFAULT NULL UNIQUE,
  `idempotency_key` varchar(100) DEFAULT NULL UNIQUE,
  `game_code` varchar(60) DEFAULT NULL,
  `round_id` varchar(100) DEFAULT NULL,
  `account_number` varchar(30) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `transactions_user_id_type_idx` (`user_id`, `type`),
  KEY `transactions_created_at_idx` (`created_at`),
  CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bound Wallets Table
CREATE TABLE `bound_wallets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `type` enum('nagad','bkash','rocket') NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `account_number` varchar(30) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bound_wallets_user_id_foreign` (`user_id`),
  CONSTRAINT `bound_wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Game Categories Table (Mirrors 60bd98.vip 3D Category Cards)
CREATE TABLE IF NOT EXISTS `game_categories` (
  `id` varchar(40) NOT NULL,
  `title_bn` varchar(80) NOT NULL,
  `sub_bn` varchar(120) NOT NULL,
  `image` varchar(255) NOT NULL,
  `icon_bg` varchar(100) NOT NULL DEFAULT 'from-orange-600 to-red-800',
  `sort_order` int unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5b. Game Catalog Table
CREATE TABLE `games` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `game_code` varchar(60) NOT NULL UNIQUE,
  `remote_game_code` varchar(120) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `bengali_name` varchar(100) NOT NULL,
  `category` enum('hot','slots','fishing','live','poker','lottery','sports') NOT NULL DEFAULT 'slots',
  `provider` varchar(50) NOT NULL,
  `image` varchar(255) NOT NULL,
  `demo_url` varchar(500) DEFAULT NULL,
  `rating` tinyint unsigned NOT NULL DEFAULT 5,
  `multiplier` varchar(30) DEFAULT NULL,
  `rtp` decimal(5,2) NOT NULL DEFAULT 96.50,
  `min_bet` decimal(10,2) NOT NULL DEFAULT 1.00,
  `max_bet` decimal(12,2) NOT NULL DEFAULT 5000.00,
  `is_hot` tinyint(1) NOT NULL DEFAULT 0,
  `is_new` tinyint(1) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5c. User Favorite Games Table
CREATE TABLE IF NOT EXISTS `user_favorites` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `game_code` varchar(60) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_fav_unique` (`user_id`, `game_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bet Logs Table
CREATE TABLE `bet_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `game_code` varchar(60) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `bet_amount` decimal(14,2) NOT NULL,
  `payout_amount` decimal(14,2) NOT NULL,
  `profit` decimal(14,2) NOT NULL,
  `multiplier` decimal(10,2) NOT NULL DEFAULT 1.00,
  `round_id` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bet_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `bet_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Provider Configs Table
CREATE TABLE `provider_configs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `provider_code` varchar(50) NOT NULL UNIQUE,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(100) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `show_type` enum('image_only','text_only','both') NOT NULL DEFAULT 'both',
  `api_url` varchar(255) NOT NULL,
  `merchant_code` varchar(100) NOT NULL,
  `secret_key` varchar(255) NOT NULL,
  `agent_code` varchar(100) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'BDT',
  `callback_url` varchar(255) NOT NULL,
  `status` enum('active','maintenance','disabled') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- INITIAL SEED DATA
-- --------------------------------------------------------

-- Super Admin (Password: admin123, Trx: 123456)
INSERT INTO `users` (`id`, `username`, `nickname`, `phone`, `password`, `trx_password`, `role`, `status`, `vip_level`) VALUES
(1, 'admin', 'Super Manager', '01888888888', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active', 10);

-- Demo Player (Password: player123, Trx: 123456)
INSERT INTO `users` (`id`, `username`, `nickname`, `phone`, `password`, `trx_password`, `role`, `status`, `vip_level`) VALUES
(2, 't1206248521', 't1206248521', '01712062485', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'player', 'active', 0);

-- Wallets
INSERT INTO `wallets` (`user_id`, `balance`, `currency`) VALUES
(1, 9999999.00, 'BDT'),
(2, 500.00, 'BDT');

-- Bound Wallet for Demo Player
INSERT INTO `bound_wallets` (`user_id`, `type`, `account_name`, `account_number`) VALUES
(2, 'nagad', 'Sakib Hasan', '01712062485');

-- Initial Transactions
INSERT INTO `transactions` (`user_id`, `type`, `amount`, `status`, `method`, `channel`, `trx_id`, `note`) VALUES
(2, 'deposit', 500.00, 'completed', 'nagad', 'TKPAYBDT', '9G7A4K19X', 'স্বয়ংক্রিয় সফল ডিপোজিট'),
(2, 'bonus', 60.00, 'completed', 'system', 'BONUS', 'BONUS-60', 'রেজিস্ট্রেশন স্বাগতম উপহার ৳৬০');

-- Provider Configurations
INSERT INTO `provider_configs` (`provider_code`, `name`, `display_name`, `logo_url`, `show_type`, `api_url`, `merchant_code`, `secret_key`, `agent_code`, `callback_url`) VALUES
('jili', 'Jili', 'JILI Games', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200', 'both', 'https://api.jiligames.com/api1/auth', 'LIVEXWIN_BD_01', 'jl_sec_993847291048591823', 'AG_LIVEXWIN', 'https://livexwin.com/api/games/callback/jili'),
('pgsoft', 'Pocket Games Soft', 'PG Soft', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200', 'both', 'https://api.pgsoft.com/v2/Game', 'PG_LIVEXWIN_PRO', 'pg_sec_283918204918293841', 'PG_BD_AGENT', 'https://livexwin.com/api/games/callback/pgsoft'),
('pragmatic', 'Pragmatic Play', 'Pragmatic Play', 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=200', 'both', 'https://api.pragmaticplay.net/gs2c/CasinoService.do', 'PP_LIVEXWIN_LIVE', 'pp_sec_581920394810293849', 'PP_CASINO_HUB', 'https://livexwin.com/api/games/callback/pragmatic');
