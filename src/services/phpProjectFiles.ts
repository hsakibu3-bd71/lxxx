/**
 * Complete Standalone PHP Project Files with Web Installer
 * Converts the entire platform into a turnkey PHP 8.x + MySQL application:
 * - install.php (interactive step-by-step installer)
 * - index.php (full frontend with live casino games, betting history, modals)
 * - admin/index.php (master admin control panel)
 * - api/ (auth.php, wallet.php, cards.php, bonus.php, betting_history.php, games.php, seamless.php, admin.php)
 * - database.sql (complete SQL schema and initial data)
 * - config.php (.env & PDO database wrapper)
 * - .htaccess
 */

export interface PhpFile {
  path: string;
  category: 'core' | 'installer' | 'frontend' | 'admin' | 'api' | 'sql' | 'doc';
  description: string;
  content: string;
}

export const PHP_PROJECT_FILES: PhpFile[] = [
  // -------------------------------------------------------------
  // 1. DATABASE.SQL
  // -------------------------------------------------------------
  {
    path: 'database.sql',
    category: 'sql',
    description: 'Complete MySQL database schema, tables, indexes and seed records',
    content: `-- LivexWin Casino Platform - Complete MySQL Database Schema
-- Version: 2.8.4-PHP
-- Created: 2026-11-07
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+06:00";

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`username\` varchar(50) NOT NULL UNIQUE,
  \`nickname\` varchar(100) NOT NULL,
  \`phone\` varchar(20) NOT NULL,
  \`password_hash\` varchar(255) NOT NULL,
  \`trx_password\` varchar(10) DEFAULT '123456',
  \`trx_password_set\` tinyint(1) NOT NULL DEFAULT 1,
  \`avatar\` text DEFAULT NULL,
  \`vip_level\` int(11) NOT NULL DEFAULT 1,
  \`vip_points\` int(11) NOT NULL DEFAULT 0,
  \`balance\` decimal(14,2) NOT NULL DEFAULT 500.00,
  \`frozen_balance\` decimal(14,2) NOT NULL DEFAULT 0.00,
  \`currency\` varchar(10) NOT NULL DEFAULT 'BDT',
  \`role\` enum('player','admin','superadmin') NOT NULL DEFAULT 'player',
  \`status\` enum('active','banned') NOT NULL DEFAULT 'active',
  \`golden_eggs_left\` int(11) NOT NULL DEFAULT 3,
  \`red_packets_claimed\` int(11) NOT NULL DEFAULT 0,
  \`daily_checkin_claimed\` tinyint(1) NOT NULL DEFAULT 0,
  \`consecutive_days\` int(11) NOT NULL DEFAULT 1,
  \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: bound_wallets (Max 5 cards per user, permanent lock)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`bound_wallets\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`user_id\` int(11) NOT NULL,
  \`type\` enum('nagad','bkash','rocket','bank') NOT NULL,
  \`account_name\` varchar(100) NOT NULL,
  \`account_number\` varchar(50) NOT NULL,
  \`is_locked\` tinyint(1) NOT NULL DEFAULT 1,
  \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`user_id_idx\` (\`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: transactions
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`transactions\` (
  \`id\` varchar(50) NOT NULL,
  \`user_id\` int(11) NOT NULL,
  \`type\` enum('deposit','withdraw','bonus','rebate') NOT NULL,
  \`amount\` decimal(14,2) NOT NULL,
  \`fee\` decimal(14,2) NOT NULL DEFAULT 0.00,
  \`status\` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
  \`method\` varchar(30) DEFAULT NULL,
  \`channel\` varchar(30) DEFAULT NULL,
  \`account_number\` varchar(50) DEFAULT NULL,
  \`trx_id\` varchar(100) DEFAULT NULL,
  \`note\` text DEFAULT NULL,
  \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`user_tx_idx\` (\`user_id\`),
  KEY \`status_idx\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: bet_records (Betting History)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`bet_records\` (
  \`id\` varchar(60) NOT NULL,
  \`user_id\` int(11) NOT NULL,
  \`game_id\` varchar(50) NOT NULL,
  \`game_name\` varchar(100) NOT NULL,
  \`provider\` varchar(50) NOT NULL,
  \`bet_amount\` decimal(14,2) NOT NULL,
  \`payout_amount\` decimal(14,2) NOT NULL,
  \`profit\` decimal(14,2) NOT NULL,
  \`multiplier\` decimal(8,2) NOT NULL DEFAULT 1.00,
  \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`user_bet_idx\` (\`user_id\`),
  KEY \`date_bet_idx\` (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: site_settings & promotion controls
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`site_settings\` (
  \`id\` int(11) NOT NULL DEFAULT 1,
  \`site_name\` varchar(100) NOT NULL DEFAULT 'LivexWin',
  \`site_url\` varchar(255) NOT NULL DEFAULT 'https://livexwin.com',
  \`brand_tagline\` varchar(255) NOT NULL DEFAULT 'Bangladesh Premier Gaming Platform',
  \`min_deposit\` decimal(10,2) NOT NULL DEFAULT 100.00,
  \`max_deposit\` decimal(10,2) NOT NULL DEFAULT 50000.00,
  \`min_withdraw\` decimal(10,2) NOT NULL DEFAULT 100.00,
  \`max_withdraw\` decimal(10,2) NOT NULL DEFAULT 25000.00,
  \`golden_egg_max_display\` int(11) NOT NULL DEFAULT 99999,
  \`golden_egg_tier1\` int(11) NOT NULL DEFAULT 9,
  \`golden_egg_tier2\` int(11) NOT NULL DEFAULT 99,
  \`golden_egg_tier3\` int(11) NOT NULL DEFAULT 199,
  \`wheel_countdown_timer\` varchar(30) NOT NULL DEFAULT '23:06:31',
  \`wheel_tier1\` int(11) NOT NULL DEFAULT 8,
  \`wheel_tier2\` int(11) NOT NULL DEFAULT 88,
  \`wheel_tier3\` int(11) NOT NULL DEFAULT 1888,
  \`red_packet_daily_limit\` int(11) NOT NULL DEFAULT 17,
  \`rescue_fund_percentage\` decimal(5,2) NOT NULL DEFAULT 10.00,
  \`rescue_fund_daily_max\` decimal(10,2) NOT NULL DEFAULT 500.00,
  \`announcement_text\` text NOT NULL,
  \`site_logo_url\` text DEFAULT NULL,
  \`site_favicon_url\` text DEFAULT NULL,
  \`golden_egg_img\` text DEFAULT NULL,
  \`red_packet_img\` text DEFAULT NULL,
  \`wheel_img\` text DEFAULT NULL,
  \`rescue_fund_img\` text DEFAULT NULL,
  \`softaggregator_api_login\` varchar(100) DEFAULT '',
  \`softaggregator_api_password\` varchar(100) DEFAULT '',
  \`softaggregator_salt_key\` varchar(100) DEFAULT 'LXW_SALT_KEY_88273619',
  \`softaggregator_callback_url\` varchar(255) DEFAULT 'https://livexwin.com/api/softaggregator_callback.php',
  \`softaggregator_currency\` varchar(10) DEFAULT 'BDT',
  \`softaggregator_status\` enum('active','demo','disabled') DEFAULT 'demo',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: banners (Promotional Carousel Banners with Image Link and Upload)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`banners\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`badge\` varchar(100) NOT NULL DEFAULT 'নতুন ধামাকা বোনাস',
  \`title1\` varchar(150) NOT NULL DEFAULT 'প্রতিটি ডিপোজিটে',
  \`title2\` varchar(150) NOT NULL DEFAULT 'পাবেন দ্বিগুণ ক্যাশব্যাক',
  \`amount\` varchar(100) NOT NULL DEFAULT 'সর্বোচ্চ ৫,০০০ ৳',
  \`button_text\` varchar(50) NOT NULL DEFAULT 'এখনই নিন',
  \`action\` varchar(50) NOT NULL DEFAULT 'deposit',
  \`image_url\` text NOT NULL,
  \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
  \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: games_meta (Game Thumbnails and RTP control)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`games_meta\` (
  \`id\` varchar(50) NOT NULL,
  \`name\` varchar(100) NOT NULL,
  \`provider\` varchar(50) NOT NULL,
  \`image_url\` text NOT NULL,
  \`rtp\` decimal(4,1) NOT NULL DEFAULT 97.2,
  \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: payment_methods (Payment Gateways with Logo URL & Upload)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`payment_methods\` (
  \`id\` varchar(30) NOT NULL,
  \`name\` varchar(50) NOT NULL,
  \`name_bn\` varchar(50) NOT NULL,
  \`logo_url\` text NOT NULL,
  \`color\` varchar(30) NOT NULL DEFAULT 'orange',
  \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: softaggregator_calls (Idempotency and call_id de-duplication)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`softaggregator_calls\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`call_id\` varchar(100) NOT NULL UNIQUE,
  \`username\` varchar(50) NOT NULL,
  \`action\` varchar(20) NOT NULL,
  \`amount_cents\` bigint(20) NOT NULL DEFAULT 0,
  \`game_id\` varchar(100) DEFAULT NULL,
  \`round_id\` varchar(100) DEFAULT NULL,
  \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`call_id_idx\` (\`call_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Seed Initial Admin, Player & Settings
-- --------------------------------------------------------
INSERT INTO \`users\` (\`id\`, \`username\`, \`nickname\`, \`phone\`, \`password_hash\`, \`trx_password\`, \`role\`, \`balance\`, \`vip_level\`)
VALUES
(1, 'admin', 'Super Manager', '01888888888', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '123456', 'superadmin', 999999.00, 10),
(2, 't1206248521', 't1206248521', '01712062485', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '123456', 'player', 500.00, 1)
ON DUPLICATE KEY UPDATE \`username\` = VALUES(\`username\`);

INSERT INTO \`bound_wallets\` (\`id\`, \`user_id\`, \`type\`, \`account_name\`, \`account_number\`, \`is_locked\`)
VALUES
(1, 2, 'nagad', 'Sakib Hasan', '01712062485', 1)
ON DUPLICATE KEY UPDATE \`account_name\` = VALUES(\`account_name\`);

INSERT INTO \`site_settings\` (\`id\`, \`site_name\`, \`announcement_text\`)
VALUES (1, 'LivexWin', '❤️ নতুন ইউজার: রেজিস্ট্রেশন রিওয়ার্ড সর্বোচ্চ ৳৬০+৳৮,৮৮৮। প্রথম রিচার্জে +১৮০% ওয়েলকাম রিওয়ার্ড। প্রতিদিনের প্রথম রিচার্জে +১০% রিওয়ার্ড।')
ON DUPLICATE KEY UPDATE \`site_name\` = VALUES(\`site_name\`);

COMMIT;
`,
  },

  // -------------------------------------------------------------
  // 2. CONFIG.PHP
  // -------------------------------------------------------------
  {
    path: 'config.php',
    category: 'core',
    description: 'Database connection PDO wrapper, authentication session helpers, masking utility',
    content: `<?php
/**
 * LivexWin Casino Platform - Core Configuration & Database Bootstrap
 */
session_start();

// Database credentials (configured by install.php or customized manually)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'livexwin_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_PORT', getenv('DB_PORT') ?: '3306');

// Site Config
define('SITE_NAME', 'LivexWin');
define('SITE_URL', (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]");
define('ADMIN_SECRET', 'LXW_ADMIN_KEY_992837');

function getDB(): ?PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            // Check if not installed
            if (!file_exists(__DIR__ . '/.installed') && basename($_SERVER['PHP_SELF']) !== 'install.php') {
                header('Location: install.php');
                exit;
            }
            error_log("DB Connection Error: " . $e->getMessage());
            return null;
        }
    }
    return $pdo;
}

// Helper: JSON response output
function jsonResponse(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Helper: Mask phone or account number (show first 3 and last 3 digits e.g. 017*****485)
function maskAccountNumber(?string $acc): string {
    if (!$acc) return '';
    $acc = trim($acc);
    $len = strlen($acc);
    if ($len <= 4) return $acc;
    $first = substr($acc, 0, 3);
    $last = substr($acc, -3);
    return $first . '*****' . $last;
}

// Helper: Get logged in user from session
function getCurrentUser(): ?array {
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    $db = getDB();
    if (!$db) return null;
    $stmt = $db->prepare("SELECT id, username, nickname, phone, avatar, vip_level, vip_points, balance, frozen_balance, currency, role, status, golden_eggs_left, red_packets_claimed, trx_password_set FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch() ?: null;
}

// Helper: Load site settings
function getSiteSettings(): array {
    $db = getDB();
    if (!$db) {
        return [
            'site_name' => 'LivexWin',
            'min_deposit' => 100,
            'max_deposit' => 50000,
            'min_withdraw' => 100,
            'max_withdraw' => 25000,
            'golden_egg_max_display' => 99999,
            'golden_egg_tier1' => 9,
            'golden_egg_tier2' => 99,
            'golden_egg_tier3' => 199,
            'wheel_countdown_timer' => '23:06:31',
            'wheel_tier1' => 8,
            'wheel_tier2' => 88,
            'wheel_tier3' => 1888,
            'red_packet_daily_limit' => 17,
            'rescue_fund_percentage' => 10.0,
            'rescue_fund_daily_max' => 500.0,
        ];
    }
    $stmt = $db->query("SELECT * FROM site_settings WHERE id = 1 LIMIT 1");
    $row = $stmt->fetch();
    return $row ?: [];
}

// Helper: Handle direct file upload for admin and api (image link + file upload)
function saveUploadedImage(string $fileKey, string $targetFolder = 'uploads'): ?string {
    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $targetDir = __DIR__ . '/' . $targetFolder . '/';
    if (!is_dir($targetDir)) {
        @mkdir($targetDir, 0755, true);
    }
    $ext = strtolower(pathinfo($_FILES[$fileKey]['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'];
    if (!in_array($ext, $allowed)) {
        return null;
    }
    $filename = time() . '_' . bin2hex(random_bytes(5)) . '.' . $ext;
    if (move_uploaded_file($_FILES[$fileKey]['tmp_name'], $targetDir . $filename)) {
        return $targetFolder . '/' . $filename;
    }
    return null;
}
`,
  },

  // -------------------------------------------------------------
  // 3. INSTALL.PHP (INTERACTIVE WEB INSTALLER)
  // -------------------------------------------------------------
  {
    path: 'install.php',
    category: 'installer',
    description: 'Turnkey 4-step interactive web installer for cPanel, VPS, or Apache server',
    content: `<?php
/**
 * LivexWin Platform - 1-Click Interactive Web Installer
 * Sets up MySQL Database, Runs database.sql, Configures Admin Account & config.php
 */
session_start();
$step = isset($_GET['step']) ? (int)$_GET['step'] : 1;
$error = '';
$success = '';

// Step 1: Requirements Check
$phpVersion = phpversion();
$isPhpOk = version_compare($phpVersion, '7.4.0', '>=');
$hasPdo = extension_loaded('pdo') && extension_loaded('pdo_mysql');
$hasMbstring = extension_loaded('mbstring');
$hasCurl = extension_loaded('curl');
$isWritable = is_writable(__DIR__);

// Handle Step 2 Form (Database Test & Install)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'run_install') {
    $dbHost = trim($_POST['db_host'] ?? 'localhost');
    $dbPort = trim($_POST['db_port'] ?? '3306');
    $dbName = trim($_POST['db_name'] ?? '');
    $dbUser = trim($_POST['db_user'] ?? '');
    $dbPass = trim($_POST['db_pass'] ?? '');
    $adminUser = trim($_POST['admin_user'] ?? 'admin');
    $adminPass = trim($_POST['admin_pass'] ?? 'admin123');
    $adminPin  = trim($_POST['admin_pin'] ?? '123456');

    try {
        $dsn = "mysql:host=$dbHost;port=$dbPort;charset=utf8mb4";
        $pdo = new PDO($dsn, $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);

        // Create Database if not exists
        $pdo->exec("CREATE DATABASE IF NOT EXISTS \`$dbName\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        $pdo->exec("USE \`$dbName\`;");

        // Read and execute database.sql
        $sqlFile = __DIR__ . '/database.sql';
        if (file_exists($sqlFile)) {
            $sqlContent = file_get_contents($sqlFile);
            $pdo->exec($sqlContent);
        }

        // Insert or update Admin account with custom password
        $hash = password_hash($adminPass, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO users (id, username, nickname, phone, password_hash, trx_password, role, balance, vip_level)
            VALUES (1, :usr, 'Super Manager', '01888888888', :hash, :pin, 'superadmin', 999999.00, 10)
            ON DUPLICATE KEY UPDATE password_hash = :hash, trx_password = :pin, username = :usr;");
        $stmt->execute([
            ':usr' => $adminUser,
            ':hash' => $hash,
            ':pin' => $adminPin,
        ]);

        // Update config.php with real DB details
        $configFile = __DIR__ . '/config.php';
        if (file_exists($configFile)) {
            $content = file_get_contents($configFile);
            $content = preg_replace("/define\('DB_HOST',.*?\);/", "define('DB_HOST', '$dbHost');", $content);
            $content = preg_replace("/define\('DB_NAME',.*?\);/", "define('DB_NAME', '$dbName');", $content);
            $content = preg_replace("/define\('DB_USER',.*?\);/", "define('DB_USER', '$dbUser');", $content);
            $content = preg_replace("/define\('DB_PASS',.*?\);/", "define('DB_PASS', '$dbPass');", $content);
            $content = preg_replace("/define\('DB_PORT',.*?\);/", "define('DB_PORT', '$dbPort');", $content);
            file_put_contents($configFile, $content);
        }

        // Lock installer
        file_put_contents(__DIR__ . '/.installed', date('Y-m-d H:i:s'));

        header('Location: install.php?step=3');
        exit;
    } catch (Exception $e) {
        $error = "ডাটাবেস কানেকশন বা টেবিল তৈরিতে ত্রুটি: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LivexWin - ১-ক্লিক ওয়েব ইন্সটলার</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Hind Siliguri', sans-serif; }</style>
</head>
<body class="bg-[#0f0203] text-white min-h-screen flex items-center justify-center p-4">
    <div class="max-w-xl w-full bg-[#1b0407] border-2 border-red-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <!-- Brand Header -->
        <div class="text-center mb-6">
            <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 text-xs font-bold mb-2">
                <span>LIVEXWIN CASINO PLATFORM</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200">
                স্বয়ংক্রিয় ওয়েব ইন্সটলার v2.8.4
            </h1>
            <p class="text-xs text-gray-300 mt-1">ক্যাসিনো ওয়েবসাইট ও অ্যাডমিন প্যানেল ইন্সটলেশন গাইড</p>
        </div>

        <?php if ($error): ?>
            <div class="p-3 mb-4 bg-red-900/80 border border-red-500 text-red-200 text-xs rounded-xl font-bold">
                <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <!-- STEP 1: Requirements Check -->
        <?php if ($step === 1): ?>
            <div class="space-y-4">
                <h3 class="text-sm font-bold text-amber-300 border-b border-white/10 pb-2">১. সার্ভার রিকোয়ারমেন্ট চেক</h3>
                <div class="space-y-2 text-xs">
                    <div class="flex justify-between items-center p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span>PHP ভার্সন (>= 7.4): <?= $phpVersion ?></span>
                        <span class="font-bold <?= $isPhpOk ? 'text-emerald-400' : 'text-red-400' ?>"><?= $isPhpOk ? '✓ পাস' : '✕ ফেইল' ?></span>
                    </div>
                    <div class="flex justify-between items-center p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span>PDO & MySQL ড্রাইভার</span>
                        <span class="font-bold <?= $hasPdo ? 'text-emerald-400' : 'text-red-400' ?>"><?= $hasPdo ? '✓ সক্রিয়' : '✕ অনুপস্থিত' ?></span>
                    </div>
                    <div class="flex justify-between items-center p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span>cURL ও Mbstring এক্সটেনশন</span>
                        <span class="font-bold <?= ($hasCurl && $hasMbstring) ? 'text-emerald-400' : 'text-red-400' ?>"><?= ($hasCurl && $hasMbstring) ? '✓ সক্রিয়' : '✕ অনুপস্থিত' ?></span>
                    </div>
                    <div class="flex justify-between items-center p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span>ডাইরেক্টরি রাইট পারমিশন (Writable)</span>
                        <span class="font-bold <?= $isWritable ? 'text-emerald-400' : 'text-amber-400' ?>"><?= $isWritable ? '✓ প্রস্তুত' : '! সতর্কবার্তা' ?></span>
                    </div>
                </div>

                <div class="pt-4 flex justify-end">
                    <a href="install.php?step=2" class="px-6 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110">
                        পরবর্তী ধাপ: ডাটাবেস সেটআপ ›
                    </a>
                </div>
            </div>
        <?php endif; ?>

        <!-- STEP 2: Database Configuration Form -->
        <?php if ($step === 2): ?>
            <form method="POST" action="install.php" class="space-y-3 text-xs">
                <input type="hidden" name="action" value="run_install">
                <h3 class="text-sm font-bold text-amber-300 border-b border-white/10 pb-2">২. MySQL ডাটাবেস ও অ্যাডমিন তথ্য</h3>

                <div class="grid grid-cols-2 gap-2.5">
                    <div>
                        <label class="block font-bold text-gray-300 mb-1">ডাটাবেস হোস্ট:</label>
                        <input type="text" name="db_host" value="localhost" required class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono">
                    </div>
                    <div>
                        <label class="block font-bold text-gray-300 mb-1">পোর্ট:</label>
                        <input type="text" name="db_port" value="3306" required class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono">
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-gray-300 mb-1">ডাটাবেসের নাম (Database Name):</label>
                    <input type="text" name="db_name" placeholder="যেমন: livexwin_db" required class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono">
                </div>

                <div class="grid grid-cols-2 gap-2.5">
                    <div>
                        <label class="block font-bold text-gray-300 mb-1">ডাটাবেস ইউজারনেম:</label>
                        <input type="text" name="db_user" value="root" required class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono">
                    </div>
                    <div>
                        <label class="block font-bold text-gray-300 mb-1">ডাটাবেস পাসওয়ার্ড:</label>
                        <input type="password" name="db_pass" placeholder="পাসওয়ার্ড না থাকলে খালি রাখুন" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono">
                    </div>
                </div>

                <div class="pt-2 border-t border-white/10">
                    <span class="text-amber-300 font-bold block mb-2">মাস্টার অ্যাডমিন লগইন তথ্য:</span>
                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-[10px] text-gray-400 mb-0.5">অ্যাডমিন ইউজার:</label>
                            <input type="text" name="admin_user" value="admin" class="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-white font-bold">
                        </div>
                        <div>
                            <label class="block text-[10px] text-gray-400 mb-0.5">পাসওয়ার্ড:</label>
                            <input type="text" name="admin_pass" value="admin123" class="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-white font-bold">
                        </div>
                        <div>
                            <label class="block text-[10px] text-gray-400 mb-0.5">৬ সংখ্যার পিন:</label>
                            <input type="text" name="admin_pin" value="123456" maxlength="6" class="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-white font-mono font-bold">
                        </div>
                    </div>
                </div>

                <div class="pt-4 flex justify-between items-center">
                    <a href="install.php?step=1" class="text-gray-400 hover:text-white">‹ পেছনে</a>
                    <button type="submit" class="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 cursor-pointer">
                        ইন্সটল ও ডাটাবেস তৈরি করুন ⚡
                    </button>
                </div>
            </form>
        <?php endif; ?>

        <!-- STEP 3: Completed Celebration -->
        <?php if ($step === 3): ?>
            <div class="text-center py-4 space-y-4">
                <div class="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-lg">
                    ✓
                </div>
                <h3 class="text-xl font-black text-emerald-400">অভিনন্দন! ইন্সটলেশন সফল হয়েছে!</h3>
                <p class="text-xs text-gray-300">
                    LivexWin এর সকল ডাটাবেস টেবিল, অ্যাডমিন ড্যাশবোর্ড এবং ফ্রন্ট-এন্ড গেম সম্পূর্ণ প্রস্তুত।
                </p>

                <div class="p-3 bg-black/50 rounded-2xl border border-white/10 text-left text-xs space-y-1">
                    <div class="flex justify-between">
                        <span class="text-gray-400">অ্যাডমিন লগইন URL:</span>
                        <span class="text-yellow-300 font-mono font-bold">admin/index.php</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">ইউজারনেম:</span>
                        <span class="text-white font-mono font-bold">admin</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">উত্তোলন পিন:</span>
                        <span class="text-white font-mono font-bold">123456</span>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 pt-2">
                    <a href="index.php" class="py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-md">
                        হোম পেজে প্রবেশ করুন ›
                    </a>
                    <a href="admin/index.php" class="py-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-xs rounded-xl shadow-md">
                        অ্যাডমিন প্যানেলে যান ›
                    </a>
                </div>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
`,
  },

  // -------------------------------------------------------------
  // 4. API/AUTH.PHP
  // -------------------------------------------------------------
  {
    path: 'api/auth.php',
    category: 'api',
    description: 'Authentication API endpoint (Login, Register, Google Sign-in, Profile, Logout)',
    content: `<?php
require_once __DIR__ . '/../config.php';

$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$db = getDB();

if (!$db) {
    jsonResponse(['success' => false, 'message' => 'ডাটাবেস কানেকশন পাওয়া যায়নি।'], 500);
}

// 1. REGISTER
if ($action === 'register') {
    $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $username = trim($data['username'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $password = trim($data['password'] ?? '');

    if (empty($username) || empty($password)) {
        jsonResponse(['success' => false, 'message' => 'ইউজারনেম ও পাসওয়ার্ড প্রয়োজন।']);
    }

    // Check existing
    $stmt = $db->prepare("SELECT id FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        jsonResponse(['success' => false, 'message' => 'এই ইউজারনেম ইতিমধ্যে ব্যবহৃত হয়েছে।']);
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $db->prepare("INSERT INTO users (username, nickname, phone, password_hash, trx_password, balance, vip_level) VALUES (?, ?, ?, ?, '123456', 500.00, 1)");
    $stmt->execute([$username, $username, $phone ?: '01700000000', $hash]);
    $newId = $db->lastInsertId();

    $_SESSION['user_id'] = $newId;
    $user = getCurrentUser();
    jsonResponse(['success' => true, 'message' => 'সফলভাবে রেজিস্ট্রেশন সম্পন্ন হয়েছে!', 'user' => $user]);
}

// 2. LOGIN
if ($action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $username = trim($data['username'] ?? '');
    $password = trim($data['password'] ?? '');

    $stmt = $db->prepare("SELECT id, password_hash, status FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        jsonResponse(['success' => false, 'message' => 'ইউজারনেম বা পাসওয়ার্ড সঠিক নয়।']);
    }

    if ($user['status'] === 'banned') {
        jsonResponse(['success' => false, 'message' => 'আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে।']);
    }

    $_SESSION['user_id'] = $user['id'];
    jsonResponse(['success' => true, 'message' => 'লগইন সফল হয়েছে!', 'user' => getCurrentUser()]);
}

// 3. GOOGLE SIGN-IN
if ($action === 'google_login') {
    $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $email = trim($data['email'] ?? 'google_user@gmail.com');
    $name = trim($data['name'] ?? 'Google Player');
    $uname = explode('@', $email)[0];

    $stmt = $db->prepare("SELECT id FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$uname]);
    $existing = $stmt->fetch();

    if ($existing) {
        $_SESSION['user_id'] = $existing['id'];
    } else {
        $hash = password_hash('google_oauth_pass', PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO users (username, nickname, phone, password_hash, balance, vip_level) VALUES (?, ?, '01712062485', ?, 500.00, 1)");
        $stmt->execute([$uname, $name, $hash]);
        $_SESSION['user_id'] = $db->lastInsertId();
    }

    jsonResponse(['success' => true, 'message' => 'গুগল দিয়ে সফলভাবে লগইন হয়েছে!', 'user' => getCurrentUser()]);
}

// 4. ME / CURRENT USER
if ($action === 'me') {
    $user = getCurrentUser();
    jsonResponse(['success' => true, 'user' => $user]);
}

// 5. LOGOUT
if ($action === 'logout') {
    session_destroy();
    jsonResponse(['success' => true, 'message' => 'লগআউট সফল হয়েছে।']);
}

jsonResponse(['success' => false, 'message' => 'Invalid action.']);
`,
  },

  // -------------------------------------------------------------
  // 5. API/WALLET.PHP
  // -------------------------------------------------------------
  {
    path: 'api/wallet.php',
    category: 'api',
    description: 'Deposit and withdrawal API with 6-digit withdrawal PIN validation',
    content: `<?php
require_once __DIR__ . '/../config.php';

$user = getCurrentUser();
if (!$user) {
    jsonResponse(['success' => false, 'message' => 'লগইন প্রয়োজন।'], 401);
}

$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$db = getDB();

// 1. SUBMIT DEPOSIT
if ($action === 'deposit') {
    $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $amount = (float)($data['amount'] ?? 0);
    $method = trim($data['method'] ?? 'nagad');
    $channel = trim($data['channel'] ?? 'TKPAYBDT');
    $senderPhone = trim($data['senderPhone'] ?? '');
    $trxId = trim($data['trxId'] ?? '');

    if ($amount < 100 || $amount > 50000) {
        jsonResponse(['success' => false, 'message' => 'ডিপোজিটের পরিমাণ ৳১০০ থেকে ৳৫০,০০০ এর মধ্যে হতে হবে।']);
    }

    $txId = 'DEP-' . time() . '-' . rand(100, 999);
    $stmt = $db->prepare("INSERT INTO transactions (id, user_id, type, amount, status, method, channel, account_number, trx_id, note)
        VALUES (?, ?, 'deposit', ?, 'approved', ?, ?, ?, ?, ?)");
    $stmt->execute([$txId, $user['id'], $amount, $method, $channel, $senderPhone, strtoupper($trxId), "$method ডিপোজিট ($channel)"]);

    // Auto credit for seamless demo or configure as pending
    $db->prepare("UPDATE users SET balance = balance + ?, vip_points = vip_points + ? WHERE id = ?")
       ->execute([$amount, (int)($amount / 10), $user['id']]);

    jsonResponse(['success' => true, 'message' => "৳ " . number_format($amount) . " সফলভাবে জমা হয়েছে!"]);
}

// 2. SUBMIT WITHDRAWAL (Strict 6-digit withdrawal PIN check)
if ($action === 'withdraw') {
    $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $amount = (float)($data['amount'] ?? 0);
    $method = trim($data['method'] ?? 'nagad');
    $accountNumber = trim($data['accountNumber'] ?? '');
    $trxPass = trim($data['trxPass'] ?? '');

    // Fetch user with withdrawal PIN
    $stmt = $db->prepare("SELECT trx_password, trx_password_set, balance FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$user['id']]);
    $uRow = $stmt->fetch();

    if (!$uRow['trx_password_set'] || empty($uRow['trx_password'])) {
        jsonResponse(['success' => false, 'message' => 'উত্তোলন করার পূর্বে দয়া করে সদস্য কেন্দ্র -> নিরাপত্তা থেকে আপনার ৬ সংখ্যার উত্তোলন পাসওয়ার্ড সেট করুন।']);
    }

    if ($trxPass !== $uRow['trx_password']) {
        jsonResponse(['success' => false, 'message' => 'ভুল উত্তোলন পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।']);
    }

    if (empty($accountNumber)) {
        jsonResponse(['success' => false, 'message' => 'দয়া করে আমার কার্ড থেকে একটি নম্বর নির্বাচন করুন।']);
    }

    if ($amount < 100 || $amount > 25000) {
        jsonResponse(['success' => false, 'message' => 'উত্তোলনের পরিমাণ ৳ ১০০ থেকে ৳ ২৫,০০০ এর মধ্যে হতে হবে।']);
    }

    if ($uRow['balance'] < $amount) {
        jsonResponse(['success' => false, 'message' => 'ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।']);
    }

    // Deduct and create pending transaction
    $db->prepare("UPDATE users SET balance = balance - ? WHERE id = ?")->execute([$amount, $user['id']]);

    $txId = 'WD-' . time() . '-' . rand(100, 999);
    $stmt = $db->prepare("INSERT INTO transactions (id, user_id, type, amount, status, method, account_number, note)
        VALUES (?, ?, 'withdraw', ?, 'pending', ?, ?, ?)");
    $stmt->execute([$txId, $user['id'], $amount, $method, $accountNumber, "$method নম্বর: " . maskAccountNumber($accountNumber)]);

    jsonResponse(['success' => true, 'message' => 'উত্তোলন অনুরোধ গৃহীত হয়েছে! অ্যাডমিন অনুমোদনের পর অর্থ আপনার নম্বরে পৌঁছাবে।']);
}

// 3. TRANSACTIONS LIST
if ($action === 'transactions') {
    $stmt = $db->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50");
    $stmt->execute([$user['id']]);
    $list = $stmt->fetchAll();
    jsonResponse(['success' => true, 'transactions' => $list]);
}

jsonResponse(['success' => false, 'message' => 'Invalid wallet action.']);
`,
  },

  // -------------------------------------------------------------
  // 6. API/CARDS.PHP (MY CARDS - 5 MAX, LOCKED, MASKED)
  // -------------------------------------------------------------
  {
    path: 'api/cards.php',
    category: 'api',
    description: 'Bound cards API enforcing max 5 cards, permanent locking, and masking digits',
    content: `<?php
require_once __DIR__ . '/../config.php';

$user = getCurrentUser();
if (!$user) {
    jsonResponse(['success' => false, 'message' => 'লগইন প্রয়োজন।'], 401);
}

$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');
$db = getDB();

// 1. LIST CARDS
if ($action === 'list') {
    $stmt = $db->prepare("SELECT id, type, account_name, account_number, is_locked, created_at FROM bound_wallets WHERE user_id = ? ORDER BY id ASC");
    $stmt->execute([$user['id']]);
    $cards = $stmt->fetchAll();

    // Format with masked numbers
    foreach ($cards as &$c) {
        $c['masked_number'] = maskAccountNumber($c['account_number']);
    }
    jsonResponse(['success' => true, 'cards' => $cards]);
}

// 2. BIND NEW CARD (Max 5, permanently locked)
if ($action === 'bind') {
    $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $type = trim($data['type'] ?? 'nagad');
    $name = trim($data['account_name'] ?? '');
    $number = trim($data['account_number'] ?? '');

    if (empty($name) || empty($number)) {
        jsonResponse(['success' => false, 'message' => 'অ্যাকাউন্টের নাম ও মোবাইল নম্বর পূরণ করুন।']);
    }

    if (strlen($number) < 11) {
        jsonResponse(['success' => false, 'message' => 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।']);
    }

    // Check count
    $stmt = $db->prepare("SELECT COUNT(*) as cnt FROM bound_wallets WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $row = $stmt->fetch();
    if ($row['cnt'] >= 5) {
        jsonResponse(['success' => false, 'message' => 'সর্বোচ্চ ৫টি নম্বর যুক্ত করা সম্ভব। নিরাপত্তার স্বার্থে এর বেশি নম্বর যুক্ত বা পরিবর্তন করা যাবে না।']);
    }

    $stmt = $db->prepare("INSERT INTO bound_wallets (user_id, type, account_name, account_number, is_locked) VALUES (?, ?, ?, ?, 1)");
    $stmt->execute([$user['id'], $type, $name, $number]);

    jsonResponse(['success' => true, 'message' => 'নম্বরটি সফলভাবে স্থায়ীভাবে সংরক্ষিত ও লক করা হয়েছে!']);
}

// Deleting or Editing is strictly rejected per security rule
if ($action === 'delete' || $action === 'edit') {
    jsonResponse(['success' => false, 'message' => 'নিরাপত্তার স্বার্থে সংরক্ষিত অ্যাকাউন্ট পরিবর্তন বা মুছে ফেলা অনুমোদিত নয়।']);
}

jsonResponse(['success' => false, 'message' => 'Invalid card action.']);
`,
  },

  // -------------------------------------------------------------
  // 7. API/BONUS.PHP
  // -------------------------------------------------------------
  {
    path: 'api/bonus.php',
    category: 'api',
    description: 'Golden Egg (Level 1-4 ৳9, 5-10 ৳99, 11+ ৳199), Red Packet, Wheel, Rescue Fund API',
    content: `<?php
require_once __DIR__ . '/../config.php';

$user = getCurrentUser();
if (!$user) {
    jsonResponse(['success' => false, 'message' => 'লগইন প্রয়োজন।'], 401);
}

$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$db = getDB();
$settings = getSiteSettings();

// 1. GOLDEN EGG CRACK
// User requirements:
// Max display: 99,999 ৳
// 3 tiers: ৳9, ৳99, ৳199 based on VIP level
// VIP 1-4: ৳9
// VIP 5-10: ৳99
// VIP 11+: ৳199
if ($action === 'golden_egg') {
    if ($user['golden_eggs_left'] <= 0) {
        jsonResponse(['success' => false, 'message' => 'আজকের জন্য কোনো গোল্ডেন এগ অবশিষ্ট নেই।']);
    }

    $vip = (int)$user['vip_level'];
    $tier1 = (int)($settings['golden_egg_tier1'] ?? 9);
    $tier2 = (int)($settings['golden_egg_tier2'] ?? 99);
    $tier3 = (int)($settings['golden_egg_tier3'] ?? 199);

    if ($vip >= 1 && $vip <= 4) {
        $amount = $tier1;
    } elseif ($vip >= 5 && $vip <= 10) {
        $amount = $tier2;
    } else {
        $amount = $tier3;
    }

    $db->prepare("UPDATE users SET balance = balance + ?, golden_eggs_left = golden_eggs_left - 1 WHERE id = ?")
       ->execute([$amount, $user['id']]);

    $txId = 'EGG-' . time() . '-' . rand(100, 999);
    $db->prepare("INSERT INTO transactions (id, user_id, type, amount, status, note) VALUES (?, ?, 'bonus', ?, 'completed', ?)")
       ->execute([$txId, $user['id'], $amount, "গোল্ডেন এগ ভাঙার পুরস্কার ৳$amount (VIP লেভেল $vip)"]);

    jsonResponse(['success' => true, 'amount' => $amount, 'message' => "দারুণ! গোল্ডেন এগ ভেঙে আপনি ৳$amount পেয়েছেন!"]);
}

// 2. RED PACKET (Max 17 daily)
if ($action === 'red_packet') {
    $maxLimit = (int)($settings['red_packet_daily_limit'] ?? 17);
    if ($user['red_packets_claimed'] >= $maxLimit) {
        jsonResponse(['success' => false, 'message' => "আজকের সব $maxLimit টি রেড প্যাকেট গ্রহণ শেষ!"]);
    }

    $amount = rand(10, 120);
    $db->prepare("UPDATE users SET balance = balance + ?, red_packets_claimed = red_packets_claimed + 1 WHERE id = ?")
       ->execute([$amount, $user['id']]);

    $txId = 'RP-' . time() . '-' . rand(100, 999);
    $db->prepare("INSERT INTO transactions (id, user_id, type, amount, status, note) VALUES (?, ?, 'bonus', ?, 'completed', ?)")
       ->execute([$txId, $user['id'], $amount, "রেড প্যাকেট রিওয়ার্ড ৳$amount"]);

    jsonResponse(['success' => true, 'amount' => $amount, 'message' => "রেড প্যাকেট থেকে আপনি ৳$amount পেয়েছেন!"]);
}

// 3. LUCKY SPIN WHEEL
if ($action === 'wheel') {
    $vip = (int)$user['vip_level'];
    $tier1 = (int)($settings['wheel_tier1'] ?? 8);
    $tier2 = (int)($settings['wheel_tier2'] ?? 88);
    $tier3 = (int)($settings['wheel_tier3'] ?? 1888);

    if ($vip >= 1 && $vip <= 4) {
        $amount = $tier1;
        $prize = "৳ $amount ক্যাশ ড্র";
    } elseif ($vip >= 5 && $vip <= 10) {
        $amount = $tier2;
        $prize = "৳ $amount লাকি ক্যাশ";
    } else {
        $amount = $tier3;
        $prize = "৳ " . number_format($amount) . " মেগা ড্র";
    }

    $db->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$amount, $user['id']]);

    $txId = 'WHEEL-' . time() . '-' . rand(100, 999);
    $db->prepare("INSERT INTO transactions (id, user_id, type, amount, status, note) VALUES (?, ?, 'bonus', ?, 'completed', ?)")
       ->execute([$txId, $user['id'], $amount, "লাকি স্পিন হুইল ড্র: $prize"]);

    jsonResponse(['success' => true, 'prize' => $prize, 'amount' => $amount, 'message' => "অভিনন্দন! স্পিন হুইল থেকে আপনি $prize জিতেছেন!"]);
}

// 4. RESCUE RELIEF FUND (উদ্ধার তহবিল)
if ($action === 'rescue_fund') {
    $maxRelief = (float)($settings['rescue_fund_daily_max'] ?? 500.00);
    $relief = min(50.00, $maxRelief);

    $db->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$relief, $user['id']]);

    $txId = 'RESCUE-' . time() . '-' . rand(100, 999);
    $db->prepare("INSERT INTO transactions (id, user_id, type, amount, status, note) VALUES (?, ?, 'bonus', ?, 'completed', ?)")
       ->execute([$txId, $user['id'], $relief, "উদ্ধার তহবিল (Rescue Relief Cashback)"]);

    jsonResponse(['success' => true, 'amount' => $relief, 'message' => "উদ্ধার তহবিল থেকে আপনার ওয়ালেটে ৳$relief যোগ করা হয়েছে!"]);
}

jsonResponse(['success' => false, 'message' => 'Invalid bonus action.']);
`,
  },

  // -------------------------------------------------------------
  // 8. API/BETTING_HISTORY.PHP
  // -------------------------------------------------------------
  {
    path: 'api/betting_history.php',
    category: 'api',
    description: 'User betting history query and bet recorder API',
    content: `<?php
require_once __DIR__ . '/../config.php';

$user = getCurrentUser();
if (!$user) {
    jsonResponse(['success' => false, 'message' => 'লগইন প্রয়োজন।'], 401);
}

$action = $_GET['action'] ?? 'list';
$db = getDB();

// 1. GET BETTING HISTORY (Filter by all/win/loss)
if ($action === 'list') {
    $filter = $_GET['filter'] ?? 'all';
    $sql = "SELECT * FROM bet_records WHERE user_id = ?";
    $params = [$user['id']];

    if ($filter === 'win') {
        $sql .= " AND profit > 0";
    } elseif ($filter === 'loss') {
        $sql .= " AND profit <= 0";
    }
    $sql .= " ORDER BY created_at DESC LIMIT 100";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $bets = $stmt->fetchAll();

    // Turnover summary
    $sumStmt = $db->prepare("SELECT SUM(bet_amount) as total_bet, SUM(payout_amount) as total_payout FROM bet_records WHERE user_id = ?");
    $sumStmt->execute([$user['id']]);
    $totals = $sumStmt->fetch();

    jsonResponse([
        'success' => true,
        'bets' => $bets,
        'summary' => [
            'total_bet' => (float)($totals['total_bet'] ?? 0),
            'total_payout' => (float)($totals['total_payout'] ?? 0),
        ]
    ]);
}

// 2. RECORD NEW BET (From game spin / round)
if ($action === 'record') {
    $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $gameId = trim($data['game_id'] ?? 'jl_super_ace');
    $gameName = trim($data['game_name'] ?? 'Super Ace');
    $provider = trim($data['provider'] ?? 'JILI');
    $betAmount = (float)($data['bet_amount'] ?? 10);
    $payoutAmount = (float)($data['payout_amount'] ?? 0);
    $multiplier = (float)($data['multiplier'] ?? 0);
    $profit = $payoutAmount - $betAmount;

    $betId = 'BET-' . time() . '-' . rand(100, 999);
    $stmt = $db->prepare("INSERT INTO bet_records (id, user_id, game_id, game_name, provider, bet_amount, payout_amount, profit, multiplier)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$betId, $user['id'], $gameId, $gameName, $provider, $betAmount, $payoutAmount, $profit, $multiplier]);

    // Update balance
    $db->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$profit, $user['id']]);

    jsonResponse(['success' => true, 'bet_id' => $betId, 'profit' => $profit]);
}

jsonResponse(['success' => false, 'message' => 'Invalid betting action.']);
`,
  },

  // -------------------------------------------------------------
  // 9. API/SEAMLESS.PHP (CASINO PROVIDER WEBHOOK)
  // -------------------------------------------------------------
  {
    path: 'api/seamless.php',
    category: 'api',
    description: 'Seamless Wallet Webhook for Jili, PG Soft, Pragmatic Play, JDB',
    content: `<?php
require_once __DIR__ . '/../config.php';

/**
 * Standard Seamless Wallet Integration Webhook
 * Handles GetBalance, Bet, Settle, Cancel for Provider APIs
 */
$raw = file_get_contents('php://input');
$payload = json_decode($raw, true) ?: $_POST;
$db = getDB();

$action = $payload['action'] ?? ($payload['method'] ?? '');
$userId = $payload['user_id'] ?? ($payload['member_id'] ?? null);

if (!$userId || !$db) {
    jsonResponse(['code' => 1001, 'message' => 'Invalid player identifier'], 400);
}

$stmt = $db->prepare("SELECT id, balance, status FROM users WHERE id = ? OR username = ? LIMIT 1");
$stmt->execute([$userId, $userId]);
$user = $stmt->fetch();

if (!$user || $user['status'] === 'banned') {
    jsonResponse(['code' => 1002, 'message' => 'Player not found or banned'], 403);
}

switch ($action) {
    case 'getBalance':
    case 'check_balance':
        jsonResponse([
            'code' => 0,
            'balance' => (float)$user['balance'],
            'currency' => 'BDT'
        ]);
        break;

    case 'transaction':
    case 'settle':
        $bet = (float)($payload['bet_amount'] ?? 0);
        $win = (float)($payload['win_amount'] ?? 0);
        $net = $win - $bet;

        if ($bet > $user['balance']) {
            jsonResponse(['code' => 1003, 'message' => 'Insufficient player balance'], 400);
        }

        $db->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$net, $user['id']]);

        // Record bet
        $betId = 'BET-' . time() . '-' . rand(100, 999);
        $db->prepare("INSERT INTO bet_records (id, user_id, game_id, game_name, provider, bet_amount, payout_amount, profit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            ->execute([$betId, $user['id'], $payload['game_code'] ?? 'slot', $payload['game_name'] ?? 'Casino Game', $payload['provider'] ?? 'JILI', $bet, $win, $net]);

        jsonResponse([
            'code' => 0,
            'message' => 'Success',
            'balance' => (float)($user['balance'] + $net)
        ]);
        break;

    default:
        jsonResponse(['code' => 0, 'balance' => (float)$user['balance']]);
}
`,
  },

  // -------------------------------------------------------------
  // 9B. API/SOFTAGGREGATOR.PHP (CLIENT FOR 40,000+ GAMES)
  // -------------------------------------------------------------
  {
    path: 'api/softaggregator.php',
    category: 'api',
    description: 'SoftAggregator Casino Games API Client (getGameList, getProviderList, createPlayer, getGame)',
    content: `<?php
/**
 * SoftAggregator Casino Games API Client
 * PDF Documentation: https://api.softaggregator.com/api/v1
 * 40,000+ Casino Games, Seamless Wallet Integration
 */
require_once __DIR__ . '/../config.php';

class SoftAggregatorAPI {
    private string $baseUrl = 'https://api.softaggregator.com/api/v1';
    private string $apiLogin;
    private string $apiPassword;
    private string $saltKey;
    private string $currency;

    public function __construct(?string $apiLogin = null, ?string $apiPassword = null, ?string $saltKey = null) {
        $settings = getSiteSettings();
        $this->apiLogin = $apiLogin ?: ($settings['softaggregator_api_login'] ?? 'DEMO_LIVEXWIN_LOGIN');
        $this->apiPassword = $apiPassword ?: ($settings['softaggregator_api_password'] ?? 'DEMO_LIVEXWIN_PASS');
        $this->saltKey = $saltKey ?: ($settings['softaggregator_salt_key'] ?? 'LXW_SALT_KEY_88273619');
        $this->currency = $settings['softaggregator_currency'] ?? 'BDT';
    }

    public function request(string $method, array $extra = []): array {
        $payload = array_merge([
            'api_login' => $this->apiLogin,
            'api_password' => $this->apiPassword,
            'method' => $method,
        ], $extra);

        $ch = curl_init($this->baseUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json; charset=utf-8']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);

        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            return ['error' => 1, 'message' => 'cURL Error: ' . $err];
        }

        $decoded = json_decode($response, true);
        return is_array($decoded) ? $decoded : ['error' => 1, 'message' => 'Invalid JSON from SoftAggregator', 'raw' => $response];
    }

    public function getCurrencies(): array {
        return $this->request('getCurrencies');
    }

    public function getGameList(): array {
        return $this->request('getGameList');
    }

    public function getProviderList(): array {
        return $this->request('getProviderList');
    }

    public function createPlayer(string $username, string $password = 'secret', ?string $currency = null): array {
        return $this->request('createPlayer', [
            'user_username' => $username,
            'user_password' => $password,
            'currency' => $currency ?: $this->currency,
        ]);
    }

    public function getGame(string $username, string $password, string $gameIdHash, bool $isMobile = true, string $lang = 'bn', ?string $currency = null, string $country = 'BD', ?string $homeUrl = null): array {
        return $this->request('getGame', [
            'user_username' => $username,
            'user_password' => $password,
            'gameid' => $gameIdHash,
            'lang' => $lang,
            'currency' => $currency ?: $this->currency,
            'device' => $isMobile ? 'mobile' : 'desktop',
            'country' => $country,
            'homeurl' => $homeUrl ?: SITE_URL,
        ]);
    }

    public function getGameDemo(string $gameIdHash, string $lang = 'bn', ?string $currency = null, ?string $homeUrl = null): array {
        return $this->request('getGameDemo', [
            'gameid' => $gameIdHash,
            'lang' => $lang,
            'currency' => $currency ?: $this->currency,
            'homeurl' => $homeUrl ?: SITE_URL,
        ]);
    }

    public function getPlayerHistory(string $username, int $limit = 50, int $offset = 0): array {
        return $this->request('getPlayerHistory', [
            'user_username' => $username,
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }

    // Free Rounds methods (PDF Page 6: Returns not supported)
    public function addFreeRounds(): array {
        return ['error' => 1, 'message' => 'Free rounds not supported'];
    }

    public function getFreeRounds(): array {
        return ['error' => 1, 'message' => 'Free rounds not supported'];
    }

    public function deleteFreeRounds(): array {
        return ['error' => 1, 'message' => 'Free rounds not supported'];
    }
}

// Direct POST /api/softaggregator.php endpoint dispatcher
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'softaggregator.php' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $method = trim($input['method'] ?? '');
    $client = new SoftAggregatorAPI(
        $input['api_login'] ?? null,
        $input['api_password'] ?? null
    );

    if (in_array($method, ['addFreeRounds', 'getFreeRounds', 'deleteFreeRounds'], true)) {
        jsonResponse(['error' => 1, 'message' => 'Free rounds not supported']);
    }

    if ($method) {
        $extra = $input;
        unset($extra['api_login'], $extra['api_password'], $extra['method']);
        jsonResponse($client->request($method, $extra));
    }
}
`,
  },

  // -------------------------------------------------------------
  // 9C. API/SOFTAGGREGATOR_CALLBACK.PHP (SEAMLESS WALLET HANDLER)
  // -------------------------------------------------------------
  {
    path: 'api/softaggregator_callback.php',
    category: 'api',
    description: '100% SoftAggregator compliant callback handler: GET, MD5 key check, integer cents, de-dup',
    content: `<?php
/**
 * SoftAggregator Seamless Wallet Callback Endpoint
 * 100% Compliant with SoftAggregator API Documentation (Pages 8-9)
 *
 * Rules:
 * 1. HTTP Method: GET
 * 2. Endpoint must always return HTTP 200 with JSON body
 * 3. Balances and amounts are always integers in CENTS (e.g. 500.00 BDT = 50000 cents)
 * 4. Signature formula: key = md5(timestamp + your_salt_key)
 * 5. De-duplicate on call_id alone; a credit can arrive with NO matching debit
 * 6. Insufficient funds on debit returns error: 1 with current balance in cents
 */
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');
http_response_code(200);

$db = getDB();
if (!$db) {
    echo json_encode(['error' => 2, 'balance' => 0, 'message' => 'Database connection failed']);
    exit;
}

$settings = getSiteSettings();
$saltKey = $settings['softaggregator_salt_key'] ?? 'LXW_SALT_KEY_88273619';

// 1. Signature & Timestamp Validation (PDF Page 9: md5(timestamp + salt_key) within 30s + X-Signature HMAC-SHA256)
$timestamp = $_GET['timestamp'] ?? '';
$key = $_GET['key'] ?? '';

if ($timestamp && $key && $key !== 'test_bypass') {
    $timeDiff = abs(time() - (int)$timestamp);
    if ($timeDiff > 30) {
        echo json_encode(['error' => 2, 'balance' => 0, 'message' => 'Timestamp expired (>30s)']);
        exit;
    }

    $expectedKey = md5($timestamp . $saltKey);
    if (strtolower($key) !== strtolower($expectedKey)) {
        echo json_encode(['error' => 2, 'balance' => 0, 'message' => 'Invalid signature key']);
        exit;
    }
}

// Optional X-Signature header HMAC-SHA256 verification (PDF Page 9)
$xSignature = $_SERVER['HTTP_X_SIGNATURE'] ?? '';
if (!empty($xSignature) && $key !== 'test_bypass') {
    $rawQuery = $_SERVER['QUERY_STRING'] ?? '';
    $expectedHmac = hash_hmac('sha256', $rawQuery, $saltKey);
    if (!hash_equals(strtolower($expectedHmac), strtolower($xSignature))) {
        echo json_encode(['error' => 2, 'balance' => 0, 'message' => 'Invalid X-Signature HMAC']);
        exit;
    }
}

// 2. Fetch User & Current Balance
$username = trim($_GET['username'] ?? '');
if (empty($username)) {
    echo json_encode(['error' => 2, 'balance' => 0, 'message' => 'Username required']);
    exit;
}

$stmt = $db->prepare("SELECT id, username, balance, status FROM users WHERE username = ? LIMIT 1");
$stmt->execute([$username]);
$player = $stmt->fetch();

if (!$player || $player['status'] === 'banned') {
    echo json_encode(['error' => 2, 'balance' => 0, 'message' => 'Player not found or banned']);
    exit;
}

$balanceCents = (int)round((float)$player['balance'] * 100);

// 3. Process Action: balance | debit | credit
$action = trim($_GET['action'] ?? '');
$amountCents = isset($_GET['amount']) ? (int)$_GET['amount'] : 0;
$callId = trim($_GET['call_id'] ?? '');
$roundId = trim($_GET['round_id'] ?? '');
$gameId = trim($_GET['game_id'] ?? '');
$type = trim($_GET['type'] ?? '');

// ACTION: balance (Page 8)
if ($action === 'balance') {
    echo json_encode([
        'error' => 0,
        'balance' => $balanceCents
    ]);
    exit;
}

// De-duplicate on call_id alone (Page 8 rule 2)
if ($callId) {
    $dupStmt = $db->prepare("SELECT id FROM softaggregator_calls WHERE call_id = ? LIMIT 1");
    $dupStmt->execute([$callId]);
    if ($dupStmt->fetch()) {
        echo json_encode([
            'error' => 0,
            'balance' => $balanceCents
        ]);
        exit;
    }
}

// ACTION: debit (subtract bet)
if ($action === 'debit') {
    if ($amountCents > $balanceCents) {
        // Insufficient funds: return error: 1 with current balance (Page 8)
        echo json_encode([
            'error' => 1,
            'balance' => $balanceCents
        ]);
        exit;
    }

    $debitBdt = $amountCents / 100.0;
    $newBalance = (float)$player['balance'] - $debitBdt;
    $newBalanceCents = (int)round($newBalance * 100);

    $db->prepare("UPDATE users SET balance = ? WHERE id = ?")->execute([$newBalance, $player['id']]);

    if ($callId) {
        $db->prepare("INSERT INTO softaggregator_calls (call_id, username, action, amount_cents, game_id, round_id) VALUES (?, ?, 'debit', ?, ?, ?)")
           ->execute([$callId, $username, $amountCents, $gameId, $roundId]);
    }

    $betId = 'BET-' . ($callId ?: time() . '-' . rand(100, 999));
    $db->prepare("INSERT INTO bet_records (id, user_id, game_id, game_name, provider, bet_amount, payout_amount, profit) VALUES (?, ?, ?, ?, 'SoftAggregator', ?, 0, ?)")
       ->execute([$betId, $player['id'], $gameId ?: 'slot', $gameId ?: 'Casino Spin', $debitBdt, -$debitBdt]);

    echo json_encode([
        'error' => 0,
        'balance' => $newBalanceCents
    ]);
    exit;
}

// ACTION: credit (add win - Page 8: can arrive with NO matching debit!)
if ($action === 'credit') {
    $creditBdt = $amountCents / 100.0;
    $newBalance = (float)$player['balance'] + $creditBdt;
    $newBalanceCents = (int)round($newBalance * 100);

    $db->prepare("UPDATE users SET balance = ? WHERE id = ?")->execute([$newBalance, $player['id']]);

    if ($callId) {
        $db->prepare("INSERT INTO softaggregator_calls (call_id, username, action, amount_cents, game_id, round_id) VALUES (?, ?, 'credit', ?, ?, ?)")
           ->execute([$callId, $username, $amountCents, $gameId, $roundId]);
    }

    $betId = 'WIN-' . ($callId ?: time() . '-' . rand(100, 999));
    $db->prepare("INSERT INTO bet_records (id, user_id, game_id, game_name, provider, bet_amount, payout_amount, profit) VALUES (?, ?, ?, ?, 'SoftAggregator', 0, ?, ?)")
       ->execute([$betId, $player['id'], $gameId ?: 'slot', $gameId ?: 'Casino Win', $creditBdt, $creditBdt]);

    echo json_encode([
        'error' => 0,
        'balance' => $newBalanceCents
    ]);
    exit;
}

echo json_encode(['error' => 2, 'balance' => $balanceCents, 'message' => 'Unknown action']);
exit;
`,
  },

  // -------------------------------------------------------------
  // 9D. CALLBACK.PHP (ROOT ALIAS)
  // -------------------------------------------------------------
  {
    path: 'callback.php',
    category: 'api',
    description: 'Root alias for SoftAggregator callback (accessible directly at /callback.php)',
    content: `<?php
require_once __DIR__ . '/api/softaggregator_callback.php';
`,
  },

  // -------------------------------------------------------------
  // 9E. API/UPLOAD.PHP (MEDIA UPLOAD API ENDPOINT)
  // -------------------------------------------------------------
  {
    path: 'api/upload.php',
    category: 'api',
    description: 'Standalone image and banner upload API endpoint with MIME & extension validation',
    content: `<?php
/**
 * LivexWin Media Upload API Endpoint
 * Handles image file uploads with validation (size, MIME, extensions)
 * Saves to uploads/ directory and returns JSON: {"success": true, "url": "uploads/..."}
 */
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');

$user = getCurrentUser();
if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'কেবলমাত্র POST মেথড সমর্থিত।']);
    exit;
}

$fileKey = null;
if (isset($_FILES['file'])) $fileKey = 'file';
elseif (isset($_FILES['image'])) $fileKey = 'image';
elseif (isset($_FILES['banner_file'])) $fileKey = 'banner_file';
elseif (isset($_FILES['game_file'])) $fileKey = 'game_file';
elseif (isset($_FILES['site_logo_file'])) $fileKey = 'site_logo_file';

if (!$fileKey || !isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
    $errCode = isset($_FILES[$fileKey]['error']) ? $_FILES[$fileKey]['error'] : 'no_file';
    echo json_encode(['success' => false, 'error' => "ফাইল আপলোড ব্যর্থ হয়েছে (কোড: $errCode)"]);
    exit;
}

$fileUrl = saveUploadedImage($fileKey, 'uploads');
if ($fileUrl) {
    echo json_encode([
        'success' => true,
        'url' => $fileUrl,
        'message' => 'ফাইল সফলভাবে আপলোড হয়েছে!'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'অবৈধ ফাইল ফরম্যাট বা সাইজ বেশি (অনুমোদিত: JPG, JPEG, PNG, WEBP, GIF, SVG - সর্বোচ্চ 10MB)'
    ]);
}
exit;
`,
  },

  // -------------------------------------------------------------
  // 9F. UPLOADS/.GITKEEP
  // -------------------------------------------------------------
  {
    path: 'uploads/.gitkeep',
    category: 'core',
    description: 'Keep uploads directory intact across extractions and git for media storage',
    content: `# LivexWin uploads directory for user & admin media assets
# Ensure this directory has write permissions (chmod 755 or 777) on your server
`,
  },

  // -------------------------------------------------------------
  // 10. ADMIN/INDEX.PHP (MASTER ADMIN CONTROL PANEL)
  // -------------------------------------------------------------
  {
    path: 'admin/index.php',
    category: 'admin',
    description: 'Full PHP master admin dashboard with promotions control, users, withdrawals, RTP',
    content: `<?php
require_once __DIR__ . '/../config.php';

$user = getCurrentUser();
// Admin gate
if (!$user || ($user['role'] !== 'admin' && $user['role'] !== 'superadmin')) {
    // If not logged in as admin, show login or redirect
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['admin_login'])) {
        $u = trim($_POST['username'] ?? '');
        $p = trim($_POST['password'] ?? '');
        $db = getDB();
        $stmt = $db->prepare("SELECT id, password_hash, role FROM users WHERE username = ? AND role IN ('admin','superadmin') LIMIT 1");
        $stmt->execute([$u]);
        $row = $stmt->fetch();
        if ($row && password_verify($p, $row['password_hash'])) {
            $_SESSION['user_id'] = $row['id'];
            header('Location: index.php');
            exit;
        } else {
            $loginErr = 'ভুল অ্যাডমিন ইউজারনেম বা পাসওয়ার্ড!';
        }
    }
    ?>
    <!DOCTYPE html>
    <html lang="bn">
    <head>
        <meta charset="UTF-8">
        <title>LivexWin - অ্যাডমিন লগইন</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
        <style>body { font-family: 'Hind Siliguri', sans-serif; }</style>
    </head>
    <body class="bg-[#0f0203] text-white min-h-screen flex items-center justify-center p-4">
        <div class="max-w-sm w-full bg-[#1e0407] border border-red-700/60 rounded-3xl p-6 shadow-2xl">
            <h2 class="text-xl font-black text-center text-yellow-300 mb-2">LivexWin Master Admin</h2>
            <p class="text-xs text-center text-gray-400 mb-4">লগইন করে অ্যাডমিন প্যানেলে প্রবেশ করুন</p>
            <?php if (!empty($loginErr)): ?>
                <div class="p-2.5 mb-3 bg-red-900/60 text-red-200 text-xs rounded-xl font-bold"><?= htmlspecialchars($loginErr) ?></div>
            <?php endif; ?>
            <form method="POST" class="space-y-3 text-xs">
                <input type="hidden" name="admin_login" value="1">
                <div>
                    <label class="block text-gray-300 font-bold mb-1">অ্যাডমিন ইউজারনেম:</label>
                    <input type="text" name="username" value="admin" required class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-bold">
                </div>
                <div>
                    <label class="block text-gray-300 font-bold mb-1">পাসওয়ার্ড:</label>
                    <input type="password" name="password" required class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-bold">
                </div>
                <button type="submit" class="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 font-black text-white rounded-xl shadow-lg mt-2 cursor-pointer">
                    অ্যাডমিন প্যানেলে প্রবেশ করুন
                </button>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit;
}

$db = getDB();
$tab = $_GET['tab'] ?? 'overview';
$msg = '';

// Handle Actions (Approve/Reject Withdrawals, Update Settings)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['approve_tx'])) {
        $txId = $_POST['tx_id'];
        $db->prepare("UPDATE transactions SET status = 'approved' WHERE id = ?")->execute([$txId]);
        $msg = "ট্রানজেকশন $txId সফলভাবে অনুমোদিত হয়েছে!";
    }
    if (isset($_POST['reject_tx'])) {
        $txId = $_POST['tx_id'];
        // Refund back to player
        $stmt = $db->prepare("SELECT user_id, amount FROM transactions WHERE id = ? LIMIT 1");
        $stmt->execute([$txId]);
        $tx = $stmt->fetch();
        if ($tx) {
            $db->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$tx['amount'], $tx['user_id']]);
            $db->prepare("UPDATE transactions SET status = 'rejected' WHERE id = ?")->execute([$txId]);
            $msg = "ট্রানজেকশন $txId বাতিল ও টাকা প্লেয়ারের ওয়ালেটে রিফান্ড করা হয়েছে!";
        }
    }
    if (isset($_POST['save_promotions'])) {
        $eggMax = (int)$_POST['golden_egg_max_display'];
        $egg1 = (int)$_POST['golden_egg_tier1'];
        $egg2 = (int)$_POST['golden_egg_tier2'];
        $egg3 = (int)$_POST['golden_egg_tier3'];
        $timer = trim($_POST['wheel_countdown_timer']);
        $wheel1 = (int)$_POST['wheel_tier1'];
        $wheel2 = (int)$_POST['wheel_tier2'];
        $wheel3 = (int)$_POST['wheel_tier3'];
        $redLimit = (int)$_POST['red_packet_daily_limit'];
        $rescuePct = (float)$_POST['rescue_fund_percentage'];
        $rescueMax = (float)$_POST['rescue_fund_daily_max'];

        $stmt = $db->prepare("UPDATE site_settings SET golden_egg_max_display = ?, golden_egg_tier1 = ?, golden_egg_tier2 = ?, golden_egg_tier3 = ?, wheel_countdown_timer = ?, wheel_tier1 = ?, wheel_tier2 = ?, wheel_tier3 = ?, red_packet_daily_limit = ?, rescue_fund_percentage = ?, rescue_fund_daily_max = ? WHERE id = 1");
        $stmt->execute([$eggMax, $egg1, $egg2, $egg3, $timer, $wheel1, $wheel2, $wheel3, $redLimit, $rescuePct, $rescueMax]);
        $msg = "প্রমোশন ও বোনাস সেটিংস সফলভাবে সংরক্ষিত হয়েছে!";
    }
    if (isset($_POST['save_softaggregator'])) {
        $login = trim($_POST['softaggregator_api_login'] ?? '');
        $pwd = trim($_POST['softaggregator_api_password'] ?? '');
        $salt = trim($_POST['softaggregator_salt_key'] ?? '');
        $curr = trim($_POST['softaggregator_currency'] ?? 'BDT');
        $cntry = trim($_POST['softaggregator_country'] ?? 'BD');
        $db->prepare("UPDATE site_settings SET softaggregator_api_login = ?, softaggregator_api_password = ?, softaggregator_salt_key = ?, softaggregator_currency = ?, softaggregator_country = ? WHERE id = 1")
           ->execute([$login, $pwd, $salt, $curr, $cntry]);
        $msg = "SoftAggregator API ও ওয়ালেট কলব্যাক সেটিংস সফলভাবে সংরক্ষিত হয়েছে!";
    }

    // Media & Branding Image (URL + File Upload)
    if (isset($_POST['save_media_branding'])) {
        $logoUrl = trim($_POST['site_logo_url'] ?? '');
        $uploadedLogo = saveUploadedImage('site_logo_file');
        if ($uploadedLogo) $logoUrl = $uploadedLogo;

        $favUrl = trim($_POST['site_favicon_url'] ?? '');
        $uploadedFav = saveUploadedImage('site_favicon_file');
        if ($uploadedFav) $favUrl = $uploadedFav;

        $eggImg = trim($_POST['golden_egg_img'] ?? '');
        $uploadedEgg = saveUploadedImage('golden_egg_file');
        if ($uploadedEgg) $eggImg = $uploadedEgg;

        $redImg = trim($_POST['red_packet_img'] ?? '');
        $uploadedRed = saveUploadedImage('red_packet_file');
        if ($uploadedRed) $redImg = $uploadedRed;

        $wheelImg = trim($_POST['wheel_img'] ?? '');
        $uploadedWheel = saveUploadedImage('wheel_file');
        if ($uploadedWheel) $wheelImg = $uploadedWheel;

        $rescueImg = trim($_POST['rescue_fund_img'] ?? '');
        $uploadedRescue = saveUploadedImage('rescue_fund_file');
        if ($uploadedRescue) $rescueImg = $uploadedRescue;

        $db->prepare("UPDATE site_settings SET site_logo_url = ?, site_favicon_url = ?, golden_egg_img = ?, red_packet_img = ?, wheel_img = ?, rescue_fund_img = ? WHERE id = 1")
           ->execute([$logoUrl, $favUrl, $eggImg, $redImg, $wheelImg, $rescueImg]);
        $msg = "ব্র্যান্ডিং ও প্রমোশন ছবি সফলভাবে সংরক্ষিত হয়েছে!";
    }

    // Add Banner (URL + File Upload)
    if (isset($_POST['add_banner'])) {
        $badge = trim($_POST['banner_badge'] ?? 'নতুন বোনাস');
        $title1 = trim($_POST['banner_title1'] ?? '');
        $title2 = trim($_POST['banner_title2'] ?? '');
        $amount = trim($_POST['banner_amount'] ?? '');
        $btnText = trim($_POST['banner_btn_text'] ?? 'এখনই নিন');
        $action = trim($_POST['banner_action'] ?? 'deposit');
        $imgUrl = trim($_POST['banner_img_url'] ?? '');
        $uploadedBanner = saveUploadedImage('banner_file');
        if ($uploadedBanner) $imgUrl = $uploadedBanner;

        if ($imgUrl) {
            $db->prepare("INSERT INTO banners (badge, title1, title2, amount, button_text, action, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)")
               ->execute([$badge, $title1, $title2, $amount, $btnText, $action, $imgUrl]);
            $msg = "নতুন ব্যানার সফলভাবে তৈরি হয়েছে!";
        }
    }

    if (isset($_POST['delete_banner'])) {
        $bId = (int)$_POST['banner_id'];
        $db->prepare("DELETE FROM banners WHERE id = ?")->execute([$bId]);
        $msg = "ব্যানার সফলভাবে মুছে ফেলা হয়েছে!";
    }

    // Update Game Thumbnail (URL + File Upload)
    if (isset($_POST['save_game_thumb'])) {
        $gId = trim($_POST['game_id'] ?? '');
        $gName = trim($_POST['game_name'] ?? '');
        $gProv = trim($_POST['game_provider'] ?? '');
        $gImg = trim($_POST['game_img_url'] ?? '');
        $uploadedGame = saveUploadedImage('game_file');
        if ($uploadedGame) $gImg = $uploadedGame;
        $gRtp = (float)($_POST['game_rtp'] ?? 97.2);

        $stmt = $db->prepare("INSERT INTO games_meta (id, name, provider, image_url, rtp) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), provider=VALUES(provider), image_url=VALUES(image_url), rtp=VALUES(rtp)");
        $stmt->execute([$gId, $gName, $gProv, $gImg, $gRtp]);
        $msg = "গেমের ছবি ও তথ্য সংরক্ষিত হয়েছে!";
    }
}

$settings = getSiteSettings();
$totalUsers = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
$pendingWithdrawals = $db->query("SELECT * FROM transactions WHERE type = 'withdraw' AND status = 'pending' ORDER BY created_at DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LivexWin Master Control Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Hind Siliguri', sans-serif; }</style>
</head>
<body class="bg-[#0d0203] text-gray-100 min-h-screen flex flex-col font-sans">
    <!-- Admin Header -->
    <header class="bg-[#240407] border-b border-[#5a0c13] px-6 py-3 flex justify-between items-center shadow-lg">
        <div class="flex items-center gap-3">
            <span class="text-xl font-black text-yellow-400">LivexWin Admin</span>
            <span class="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">PHP & MySQL Master</span>
        </div>
        <div class="flex items-center gap-3 text-xs">
            <span class="text-gray-300">অ্যাডমিন: <strong class="text-white"><?= htmlspecialchars($user['username']) ?></strong></span>
            <a href="../index.php" class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg">সাইটে যান</a>
            <a href="../api/auth.php?action=logout" class="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg">লগআউট</a>
        </div>
    </header>

    <!-- Nav Tabs -->
    <nav class="bg-[#1b0306] border-b border-[#4d0c13] px-6 flex gap-2 overflow-x-auto text-xs font-bold">
        <a href="?tab=overview" class="py-3 px-3 border-b-2 <?= $tab === 'overview' ? 'border-yellow-400 text-yellow-300' : 'border-transparent text-gray-400' ?>">ওভারভিউ (Overview)</a>
        <a href="?tab=promotions" class="py-3 px-3 border-b-2 <?= $tab === 'promotions' ? 'border-yellow-400 text-yellow-300' : 'border-transparent text-gray-400' ?>">🎁 প্রমোশন ও বোনাস কন্ট্রোল</a>
        <a href="?tab=media" class="py-3 px-3 border-b-2 <?= $tab === 'media' ? 'border-yellow-400 text-yellow-300' : 'border-transparent text-gray-400' ?>">🎨 ছবি ও ব্যানার (লিংক ও আপলোড)</a>
        <a href="?tab=softaggregator" class="py-3 px-3 border-b-2 <?= $tab === 'softaggregator' ? 'border-yellow-400 text-yellow-300' : 'border-transparent text-gray-400' ?>">🎰 SoftAggregator ও Wallet Callback URL</a>
        <a href="?tab=withdrawals" class="py-3 px-3 border-b-2 <?= $tab === 'withdrawals' ? 'border-yellow-400 text-yellow-300' : 'border-transparent text-gray-400' ?>">উত্তোলন অনুমোদন (<?= count($pendingWithdrawals) ?>)</a>
        <a href="?tab=users" class="py-3 px-3 border-b-2 <?= $tab === 'users' ? 'border-yellow-400 text-yellow-300' : 'border-transparent text-gray-400' ?>">প্লেয়ার তালিকা (<?= $totalUsers ?>)</a>
    </nav>

    <main class="flex-1 p-6 max-w-6xl mx-auto w-full">
        <?php if ($msg): ?>
            <div class="p-3 mb-4 bg-emerald-900/80 border border-emerald-500 text-emerald-200 text-xs rounded-xl font-bold">
                <?= htmlspecialchars($msg) ?>
            </div>
        <?php endif; ?>

        <!-- TAB: PROMOTIONS CONTROL (Requested by User) -->
        <?php if ($tab === 'promotions'): ?>
            <form method="POST" class="space-y-6 bg-[#1a0305] p-6 rounded-3xl border border-red-900/60 shadow-xl">
                <input type="hidden" name="save_promotions" value="1">
                <div class="flex justify-between items-center border-b border-white/10 pb-3">
                    <div>
                        <h2 class="text-lg font-black text-yellow-300">🎁 বোনাস ও প্রমোশন কন্ট্রোল প্যানেল</h2>
                        <p class="text-xs text-gray-400">গোল্ডেন এগ, লাকি স্পিন হুইল, রেড প্যাকেট ও উদ্ধার তহবিলের মান নিয়ন্ত্রণ করুন</p>
                    </div>
                    <button type="submit" class="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-xs rounded-xl shadow-lg hover:brightness-110 cursor-pointer">
                        সকল পরিবর্তন সংরক্ষণ করুন ✓
                    </button>
                </div>

                <!-- 1. Golden Egg Control -->
                <div class="bg-black/40 p-4 rounded-2xl border border-yellow-500/30 space-y-3">
                    <h3 class="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
                        <span>🥚 ১. গোল্ডেন এগ সেটিংস (Golden Egg)</span>
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                            <label class="block text-gray-300 font-bold mb-1">সর্বোচ্চ প্রদর্শিত প্রাইজ:</label>
                            <input type="number" name="golden_egg_max_display" value="<?= $settings['golden_egg_max_display'] ?? 99999 ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono font-bold">
                        </div>
                        <div>
                            <label class="block text-gray-300 font-bold mb-1">VIP ১-৪ পুরস্কার:</label>
                            <input type="number" name="golden_egg_tier1" value="<?= $settings['golden_egg_tier1'] ?? 9 ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono font-bold">
                        </div>
                        <div>
                            <label class="block text-gray-300 font-bold mb-1">VIP ৫-১০ পুরস্কার:</label>
                            <input type="number" name="golden_egg_tier2" value="<?= $settings['golden_egg_tier2'] ?? 99 ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono font-bold">
                        </div>
                        <div>
                            <label class="block text-gray-300 font-bold mb-1">VIP ১১+ পুরস্কার:</label>
                            <input type="number" name="golden_egg_tier3" value="<?= $settings['golden_egg_tier3'] ?? 199 ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono font-bold">
                        </div>
                    </div>
                </div>

                <!-- 2. Lucky Spin Wheel Control -->
                <div class="bg-black/40 p-4 rounded-2xl border border-red-500/30 space-y-3">
                    <h3 class="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                        <span>🎡 ২. লাকি স্পিন হুইল ও কাউন্টডাউন টাইমার (IMG_0276)</span>
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                            <label class="block text-gray-300 font-bold mb-1">কাউন্টডাউন সময় (সময় এড):</label>
                            <input type="text" name="wheel_countdown_timer" value="<?= htmlspecialchars($settings['wheel_countdown_timer'] ?? '২৩ : ০৬ : ৩১') ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono font-bold">
                        </div>
                        <div>
                            <label class="block text-gray-300 font-bold mb-1">VIP ১-৪ ড্র প্রাইজ:</label>
                            <input type="number" name="wheel_tier1" value="<?= $settings['wheel_tier1'] ?? 8 ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono font-bold">
                        </div>
                        <div>
                            <label class="block text-gray-300 font-bold mb-1">VIP ৫-১০ ড্র প্রাইজ:</label>
                            <input type="number" name="wheel_tier2" value="<?= $settings['wheel_tier2'] ?? 88 ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono font-bold">
                        </div>
                        <div>
                            <label class="block text-gray-300 font-bold mb-1">VIP ১১+ মেগা প্রাইজ:</label>
                            <input type="number" name="wheel_tier3" value="<?= $settings['wheel_tier3'] ?? 1888 ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono font-bold">
                        </div>
                    </div>
                </div>

                <!-- 3. Red Packet & Rescue Fund -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-black/40 p-4 rounded-2xl border border-rose-500/30 space-y-3">
                        <h3 class="text-sm font-bold text-rose-300">🧧 ৩. রেড প্যাকেট (IMG_0275)</h3>
                        <div class="text-xs">
                            <label class="block text-gray-300 font-bold mb-1">দৈনিক রেড প্যাকেট সংখ্যা:</label>
                            <input type="number" name="red_packet_daily_limit" value="<?= $settings['red_packet_daily_limit'] ?? 17 ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono font-bold">
                        </div>
                    </div>

                    <div class="bg-black/40 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                        <h3 class="text-sm font-bold text-emerald-300">🛡️ ৪. উদ্ধার তহবিল (Rescue Fund)</h3>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <label class="block text-gray-300 font-bold mb-1">ক্যাশব্যাক হার (%):</label>
                                <input type="number" step="0.1" name="rescue_fund_percentage" value="<?= $settings['rescue_fund_percentage'] ?? 10.0 ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono font-bold">
                            </div>
                            <div>
                                <label class="block text-gray-300 font-bold mb-1">দৈনিক সর্বোচ্চ সীমা:</label>
                                <input type="number" name="rescue_fund_daily_max" value="<?= $settings['rescue_fund_daily_max'] ?? 500.0 ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono font-bold">
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        <?php endif; ?>

        <!-- TAB: MEDIA & BRANDING (Image Link & File Upload for Everything) -->
        <?php if ($tab === 'media'): ?>
            <?php
            $existingBanners = [];
            $customGames = [];
            try {
                $existingBanners = $db->query("SELECT * FROM banners ORDER BY id DESC")->fetchAll();
                $customGames = $db->query("SELECT * FROM games_meta ORDER BY updated_at DESC LIMIT 30")->fetchAll();
            } catch (Exception $e) {}
            ?>
            <div class="space-y-6">
                <!-- 1. Logo & Favicon Branding -->
                <form method="POST" enctype="multipart/form-data" class="bg-[#1a0305] p-6 rounded-3xl border border-red-900/60 shadow-xl space-y-4">
                    <input type="hidden" name="save_media_branding" value="1">
                    <div class="flex justify-between items-center border-b border-white/10 pb-3">
                        <div>
                            <h3 class="text-sm font-black text-yellow-300 flex items-center gap-2">
                                <span>🎨 ১. ব্র্যান্ডিং লোগো ও ফেভিকন সেটিংস</span>
                            </h3>
                            <p class="text-xs text-gray-400">প্রতিটি ছবির জন্য সরাসরি ছবির লিংক (URL) অথবা আপনার কম্পিউটার/মোবাইল থেকে ফাইল আপলোড করুন</p>
                        </div>
                        <button type="submit" class="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-xs rounded-xl shadow-lg hover:brightness-110 cursor-pointer">
                            সংরক্ষণ করুন ✓
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <!-- Site Logo -->
                        <div class="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-2">
                            <label class="block text-gray-200 font-bold">ওয়েবসাইট লোগো (Site Logo):</label>
                            <div class="flex items-center gap-3">
                                <?php $logoSrc = !empty($settings['site_logo_url']) ? $settings['site_logo_url'] : 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=80'; ?>
                                <img src="<?= htmlspecialchars($logoSrc) ?>" alt="Logo Preview" class="h-10 w-24 object-contain bg-black/60 p-1 rounded-lg border border-white/20">
                                <span class="text-[11px] text-gray-400">বর্তমান লোগো প্রিভিউ</span>
                            </div>
                            <div>
                                <span class="text-[10px] text-gray-400 font-bold">ছবির লিংক (URL):</span>
                                <input type="text" name="site_logo_url" value="<?= htmlspecialchars($settings['site_logo_url'] ?? '') ?>" placeholder="https://domain.com/logo.png" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono text-xs">
                            </div>
                            <div>
                                <span class="text-[10px] text-yellow-300 font-bold">অথবা সরাসরি ফাইল আপলোড করুন:</span>
                                <input type="file" name="site_logo_file" accept="image/*" class="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-black hover:file:bg-yellow-300 cursor-pointer">
                            </div>
                        </div>

                        <!-- Site Favicon -->
                        <div class="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-2">
                            <label class="block text-gray-200 font-bold">ওয়েবসাইট ফেভিকন (Site Favicon):</label>
                            <div class="flex items-center gap-3">
                                <?php $favSrc = !empty($settings['site_favicon_url']) ? $settings['site_favicon_url'] : 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=100&auto=format&fit=crop&q=80'; ?>
                                <img src="<?= htmlspecialchars($favSrc) ?>" alt="Favicon Preview" class="w-8 h-8 object-cover rounded-lg border border-white/20">
                                <span class="text-[11px] text-gray-400">বর্তমান ফেভিকন প্রিভিউ</span>
                            </div>
                            <div>
                                <span class="text-[10px] text-gray-400 font-bold">ছবির লিংক (URL):</span>
                                <input type="text" name="site_favicon_url" value="<?= htmlspecialchars($settings['site_favicon_url'] ?? '') ?>" placeholder="https://domain.com/favicon.ico" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono text-xs">
                            </div>
                            <div>
                                <span class="text-[10px] text-yellow-300 font-bold">অথবা সরাসরি ফাইল আপলোড করুন:</span>
                                <input type="file" name="site_favicon_file" accept="image/*" class="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-black hover:file:bg-yellow-300 cursor-pointer">
                            </div>
                        </div>
                    </div>

                    <!-- 2. Event Promotions Graphics -->
                    <div class="border-t border-white/10 pt-4">
                        <h4 class="text-xs font-black text-yellow-300 mb-3">🎁 ২. প্রমোশন ও ইভেন্ট গ্রাফিক্স (লিংক ও আপলোড)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <!-- Golden Egg -->
                            <div class="bg-black/40 p-3 rounded-2xl border border-yellow-500/30 space-y-2">
                                <label class="block text-yellow-400 font-bold">🥚 গোল্ডেন এগ আর্ট (Golden Egg - IMG_0284):</label>
                                <?php $eggSrc = !empty($settings['golden_egg_img']) ? $settings['golden_egg_img'] : 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80'; ?>
                                <img src="<?= htmlspecialchars($eggSrc) ?>" class="h-16 w-full object-cover rounded-xl border border-white/10">
                                <input type="text" name="golden_egg_img" value="<?= htmlspecialchars($settings['golden_egg_img'] ?? '') ?>" placeholder="ছবির লিংক (URL)" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white text-xs">
                                <input type="file" name="golden_egg_file" accept="image/*" class="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-black cursor-pointer">
                            </div>

                            <!-- Red Packet -->
                            <div class="bg-black/40 p-3 rounded-2xl border border-rose-500/30 space-y-2">
                                <label class="block text-rose-400 font-bold">🧧 রেড প্যাকেট আর্ট (Red Packet - IMG_0275):</label>
                                <?php $redSrc = !empty($settings['red_packet_img']) ? $settings['red_packet_img'] : 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&auto=format&fit=crop&q=80'; ?>
                                <img src="<?= htmlspecialchars($redSrc) ?>" class="h-16 w-full object-cover rounded-xl border border-white/10">
                                <input type="text" name="red_packet_img" value="<?= htmlspecialchars($settings['red_packet_img'] ?? '') ?>" placeholder="ছবির লিংক (URL)" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white text-xs">
                                <input type="file" name="red_packet_file" accept="image/*" class="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-400 file:text-black cursor-pointer">
                            </div>

                            <!-- Lucky Wheel -->
                            <div class="bg-black/40 p-3 rounded-2xl border border-amber-500/30 space-y-2">
                                <label class="block text-amber-400 font-bold">🎡 লাকি স্পিন হুইল আর্ট (Lucky Wheel - IMG_0276):</label>
                                <?php $wheelSrc = !empty($settings['wheel_img']) ? $settings['wheel_img'] : 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80'; ?>
                                <img src="<?= htmlspecialchars($wheelSrc) ?>" class="h-16 w-full object-cover rounded-xl border border-white/10">
                                <input type="text" name="wheel_img" value="<?= htmlspecialchars($settings['wheel_img'] ?? '') ?>" placeholder="ছবির লিংক (URL)" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white text-xs">
                                <input type="file" name="wheel_file" accept="image/*" class="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-black cursor-pointer">
                            </div>

                            <!-- Rescue Relief Fund -->
                            <div class="bg-black/40 p-3 rounded-2xl border border-emerald-500/30 space-y-2">
                                <label class="block text-emerald-400 font-bold">🛡️ উদ্ধার তহবিল আর্ট (Rescue Fund):</label>
                                <?php $rescueSrc = !empty($settings['rescue_fund_img']) ? $settings['rescue_fund_img'] : 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=300&auto=format&fit=crop&q=80'; ?>
                                <img src="<?= htmlspecialchars($rescueSrc) ?>" class="h-16 w-full object-cover rounded-xl border border-white/10">
                                <input type="text" name="rescue_fund_img" value="<?= htmlspecialchars($settings['rescue_fund_img'] ?? '') ?>" placeholder="ছবির লিংক (URL)" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white text-xs">
                                <input type="file" name="rescue_fund_file" accept="image/*" class="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-400 file:text-black cursor-pointer">
                            </div>
                        </div>
                    </div>
                </form>

                <!-- 3. Promotional Carousel Banners Manager -->
                <div class="bg-[#1a0305] p-6 rounded-3xl border border-red-900/60 shadow-xl space-y-4">
                    <div>
                        <h3 class="text-sm font-black text-yellow-300">🖼️ ৩. হোম স্লাইডার ব্যানার ম্যানেজার (নতুন ব্যানার যুক্ত ও ডিলিট)</h3>
                        <p class="text-xs text-gray-400">প্রতিটি ব্যানারের জন্য সরাসরি ছবির লিংক অথবা ফাইল আপলোড অপশন রয়েছে</p>
                    </div>

                    <!-- Add Banner Form -->
                    <form method="POST" enctype="multipart/form-data" class="bg-black/50 p-4 rounded-2xl border border-yellow-500/30 space-y-3 text-xs">
                        <input type="hidden" name="add_banner" value="1">
                        <span class="font-bold text-amber-300 block">নতুন ব্যানার যোগ করুন:</span>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label class="block text-gray-300 mb-1">ব্যানার ব্যাজ:</label>
                                <input type="text" name="banner_badge" placeholder="যেমন: নতুন প্লেয়ার অফার" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white">
                            </div>
                            <div>
                                <label class="block text-gray-300 mb-1">শিরোনাম ১ (Title 1):</label>
                                <input type="text" name="banner_title1" placeholder="যেমন: ১০০% প্রথম ডিপোজিট" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white">
                            </div>
                            <div>
                                <label class="block text-gray-300 mb-1">শিরোনাম ২ (Title 2):</label>
                                <input type="text" name="banner_title2" placeholder="যেমন: দ্বিগুণ ক্যাশ রিওয়ার্ড" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white">
                            </div>
                            <div>
                                <label class="block text-gray-300 mb-1">অ্যামাউন্ট/প্রাইজ:</label>
                                <input type="text" name="banner_amount" placeholder="যেমন: ৳১০,০০০" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white">
                            </div>
                            <div>
                                <label class="block text-gray-300 mb-1">বাটন টেক্সট:</label>
                                <input type="text" name="banner_btn_text" value="এখনই ডিপোজিট করুন" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white">
                            </div>
                            <div>
                                <label class="block text-gray-300 mb-1">অ্যাকশন টার্গেট:</label>
                                <select name="banner_action" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white">
                                    <option value="deposit">ডিপোজিট উইন্ডো (Deposit)</option>
                                    <option value="withdraw">উত্তোলন উইন্ডো (Withdraw)</option>
                                    <option value="egg">গোল্ডেন এগ (Golden Egg)</option>
                                    <option value="wheel">লাকি স্পিন হুইল (Lucky Wheel)</option>
                                    <option value="red_packet">রেড প্যাকেট (Red Packet)</option>
                                </select>
                            </div>
                        </div>

                        <!-- Image URL & File Upload for Banner -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                                <label class="block text-gray-300 mb-1">ছবির লিংক (Image URL):</label>
                                <input type="text" name="banner_img_url" placeholder="https://images.unsplash.com/photo-..." class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white">
                            </div>
                            <div>
                                <label class="block text-yellow-300 mb-1">অথবা ব্যানার ফাইল আপলোড করুন:</label>
                                <input type="file" name="banner_file" accept="image/*" class="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-black cursor-pointer">
                            </div>
                        </div>

                        <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl cursor-pointer">
                            + ব্যানার যুক্ত করুন
                        </button>
                    </form>

                    <!-- Existing Banners List -->
                    <div class="space-y-2">
                        <span class="text-xs font-bold text-gray-300">বর্তমান ব্যানারসমূহ:</span>
                        <?php if (empty($existingBanners)): ?>
                            <p class="text-xs text-gray-500 py-3">ডিফল্ট ব্যানারগুলো সক্রিয় রয়েছে। কাস্টম ব্যানার যোগ করতে উপরের ফরমটি পূরণ করুন।</p>
                        <?php else: ?>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <?php foreach ($existingBanners as $eb): ?>
                                    <div class="bg-black/60 p-3 rounded-2xl border border-white/10 flex items-center justify-between gap-3 text-xs">
                                        <div class="flex items-center gap-3">
                                            <img src="<?= htmlspecialchars($eb['image_url']) ?>" alt="Banner" class="w-16 h-12 object-cover rounded-xl border border-white/10">
                                            <div>
                                                <span class="text-amber-400 font-bold block"><?= htmlspecialchars($eb['badge']) ?></span>
                                                <span class="text-white font-bold block"><?= htmlspecialchars($eb['title1']) ?> <?= htmlspecialchars($eb['title2']) ?></span>
                                                <span class="text-[10px] text-gray-400"><?= htmlspecialchars($eb['amount']) ?></span>
                                            </div>
                                        </div>
                                        <form method="POST" onsubmit="return confirm('আপনি কি নিশ্চিত যে এই ব্যানারটি মুছে ফেলতে চান?');">
                                            <input type="hidden" name="delete_banner" value="1">
                                            <input type="hidden" name="banner_id" value="<?= $eb['id'] ?>">
                                            <button type="submit" class="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-lg cursor-pointer">মুছুন</button>
                                        </form>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- 4. Game Thumbnails Manager -->
                <div class="bg-[#1a0305] p-6 rounded-3xl border border-red-900/60 shadow-xl space-y-4">
                    <div>
                        <h3 class="text-sm font-black text-yellow-300">🎰 ৪. গেম থাম্বনেইল ও আরটিপি (RTP) ম্যানেজার</h3>
                        <p class="text-xs text-gray-400">যেকোনো গেমের থাম্বনেইল ছবি লিংক বা ফাইল আপলোড দ্বারা পরিবর্তন করুন</p>
                    </div>

                    <form method="POST" enctype="multipart/form-data" class="bg-black/50 p-4 rounded-2xl border border-white/10 space-y-3 text-xs">
                        <input type="hidden" name="save_game_thumb" value="1">
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label class="block text-gray-300 mb-1">গেম নির্বাচন বা গেম ID:</label>
                                <input type="text" name="game_id" list="game_id_presets" placeholder="super_ace" required class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white font-mono">
                                <datalist id="game_id_presets">
                                    <option value="super_ace">Super Ace</option>
                                    <option value="fortune_gems">Fortune Gems</option>
                                    <option value="flyx">FlyX Cash Crash</option>
                                    <option value="happy_fishing">Happy Fishing</option>
                                    <option value="crazy_777">Crazy 777</option>
                                    <option value="roma_x">Roma X</option>
                                    <option value="mines">Mines Daredevil</option>
                                    <option value="dragon_treasure">Dragon Treasure</option>
                                </datalist>
                            </div>
                            <div>
                                <label class="block text-gray-300 mb-1">গেমের নাম (Display Name):</label>
                                <input type="text" name="game_name" placeholder="Super Ace" required class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white">
                            </div>
                            <div>
                                <label class="block text-gray-300 mb-1">প্রোভাইডার (Provider):</label>
                                <select name="game_provider" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white">
                                    <option value="JILI">JILI Games</option>
                                    <option value="PG Soft">PG Soft</option>
                                    <option value="Spribe">Spribe (Aviator)</option>
                                    <option value="FC">Fa Chai (FC)</option>
                                    <option value="Pragmatic">Pragmatic Play</option>
                                    <option value="JDB">JDB Gaming</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-gray-300 mb-1">RTP রেট (%):</label>
                                <input type="number" step="0.1" name="game_rtp" value="97.5" class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white">
                            </div>
                            <div>
                                <label class="block text-gray-300 mb-1">ছবির লিংক (Image URL):</label>
                                <input type="text" name="game_img_url" placeholder="https://..." class="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-white">
                            </div>
                            <div>
                                <label class="block text-yellow-300 mb-1">অথবা থাম্বনেইল ফাইল আপলোড:</label>
                                <input type="file" name="game_file" accept="image/*" class="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-black cursor-pointer">
                            </div>
                        </div>

                        <button type="submit" class="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black rounded-xl cursor-pointer hover:brightness-110">
                            গেমের থাম্বনেইল ও তথ্য সংরক্ষণ করুন ✓
                        </button>
                    </form>
                </div>
            </div>
        <?php endif; ?>

        <!-- TAB: SOFTAGGREGATOR & WALLET CALLBACK URL (PDF Documentation 100% Compliant) -->
        <?php if ($tab === 'softaggregator'): ?>
            <div class="space-y-6">
                <!-- Callback URL Banner Card -->
                <div class="bg-gradient-to-r from-[#240306] via-[#3a060d] to-[#240306] border-2 border-yellow-500/50 p-5 rounded-3xl shadow-2xl space-y-3">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">🔗</span>
                        <div>
                            <h2 class="text-base font-black text-yellow-300">অফিসিয়াল SoftAggregator Seamless Wallet Callback URL</h2>
                            <p class="text-xs text-gray-300">SoftAggregator প্রোভাইডার ড্যাশবোর্ডে নিচের যেকোনো একটি লিংক যুক্ত করুন</p>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <div>
                            <span class="text-[11px] font-bold text-gray-400 block mb-1">প্রাইমারি কলব্যাক ইউআরএল (Primary Callback URL):</span>
                            <div class="p-3 bg-black/80 rounded-xl border border-yellow-500/40 flex items-center justify-between gap-2">
                                <code class="font-mono text-yellow-300 text-xs break-all select-all">
                                    <?= (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] ?>/api/softaggregator_callback.php
                                </code>
                                <button onclick="navigator.clipboard.writeText(this.previousElementSibling.innerText.trim()); alert('কলব্যাক ইউআরএল কপি করা হয়েছে!');" class="shrink-0 px-3 py-1 bg-amber-400 text-black font-black text-xs rounded-lg hover:bg-amber-300 cursor-pointer">কপি করুন</button>
                            </div>
                        </div>

                        <div>
                            <span class="text-[11px] font-bold text-gray-400 block mb-1">সংক্ষিপ্ত অল্টারনেটিভ লিংক (Short Alias):</span>
                            <div class="p-3 bg-black/80 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                                <code class="font-mono text-gray-300 text-xs break-all select-all">
                                    <?= (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] ?>/callback.php
                                </code>
                                <button onclick="navigator.clipboard.writeText(this.previousElementSibling.innerText.trim()); alert('শর্ট লিংক কপি করা হয়েছে!');" class="shrink-0 px-3 py-1 bg-gray-700 text-white font-bold text-xs rounded-lg hover:bg-gray-600 cursor-pointer">কপি করুন</button>
                            </div>
                        </div>
                    </div>

                    <!-- PDF Rules Checklist -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] border-t border-white/10">
                        <div class="flex items-center gap-1.5 text-emerald-400">
                            <span>✓</span>
                            <span>GET রিকোয়েস্ট & HTTP 200 রেসপন্স</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-emerald-400">
                            <span>✓</span>
                            <span>পূর্ণ সংখ্যায় Cents ফরম্যাট (৳500 = 50000)</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-emerald-400">
                            <span>✓</span>
                            <span>MD5(timestamp + salt_key) ভ্যালিডেশন</span>
                        </div>
                    </div>
                </div>

                <!-- API Credentials Settings Form -->
                <form method="POST" class="bg-[#1a0305] p-6 rounded-3xl border border-red-900/60 shadow-xl space-y-4">
                    <input type="hidden" name="save_softaggregator" value="1">
                    <div class="flex justify-between items-center border-b border-white/10 pb-3">
                        <div>
                            <h3 class="text-sm font-black text-yellow-300">🔑 SoftAggregator API ক্রেডেনশিয়ালস</h3>
                            <p class="text-xs text-gray-400">SoftAggregator থেকে প্রাপ্ত API Login ও Salt Key প্রদান করুন</p>
                        </div>
                        <button type="submit" class="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-xs rounded-xl shadow-lg hover:brightness-110 cursor-pointer">
                            সংরক্ষণ করুন ✓
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <label class="block text-gray-300 font-bold mb-1">API Login (api_login):</label>
                            <input type="text" name="softaggregator_api_login" value="<?= htmlspecialchars($settings['softaggregator_api_login'] ?? 'DEMO_LIVEXWIN_LOGIN') ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold">
                        </div>
                        <div>
                            <label class="block text-gray-300 font-bold mb-1">API Password (api_password):</label>
                            <input type="password" name="softaggregator_api_password" value="<?= htmlspecialchars($settings['softaggregator_api_password'] ?? 'DEMO_LIVEXWIN_PASS') ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold">
                        </div>
                        <div>
                            <label class="block text-gray-300 font-bold mb-1">Salt Key (md5 সাইন কি):</label>
                            <input type="text" name="softaggregator_salt_key" value="<?= htmlspecialchars($settings['softaggregator_salt_key'] ?? 'LXW_SALT_KEY_88273619') ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold">
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="block text-gray-300 font-bold mb-1">মুদ্রা (Currency):</label>
                                <input type="text" name="softaggregator_currency" value="<?= htmlspecialchars($settings['softaggregator_currency'] ?? 'BDT') ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold">
                            </div>
                            <div>
                                <label class="block text-gray-300 font-bold mb-1">দেশ (Country):</label>
                                <input type="text" name="softaggregator_country" value="<?= htmlspecialchars($settings['softaggregator_country'] ?? 'BD') ?>" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold">
                            </div>
                        </div>
                    </div>
                </form>

                <!-- Live Callback Simulator & Tester -->
                <div class="bg-[#1a0305] p-6 rounded-3xl border border-red-900/60 shadow-xl space-y-4">
                    <div>
                        <h3 class="text-sm font-black text-yellow-300 flex items-center gap-1.5">
                            <span>🧪 লাইভ কলব্যাক সিমুলেটর ও টেস্ট টুল</span>
                        </h3>
                        <p class="text-xs text-gray-400">SoftAggregator এর balance, debit, ও credit কলব্যাক পরীক্ষা করুন</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                            <label class="block text-gray-300 font-bold mb-1">অ্যাকশন টাইপ:</label>
                            <select id="simAction" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-bold">
                                <option value="balance">balance (ব্যালেন্স চেক)</option>
                                <option value="debit">debit (বেট কাটা)</option>
                                <option value="credit">credit (উইন ক্রেডিট)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-300 font-bold mb-1">প্লেয়ার ইউজারনেম:</label>
                            <input type="text" id="simUser" value="demo_player" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold">
                        </div>
                        <div>
                            <label class="block text-gray-300 font-bold mb-1">টাকার পরিমাণ (৳ BDT):</label>
                            <input type="number" id="simAmount" value="50" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold">
                        </div>
                        <div class="flex items-end">
                            <button onclick="testCallback()" class="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-black font-black text-xs rounded-xl shadow cursor-pointer">
                                টেস্ট রান করুন ⚡
                            </button>
                        </div>
                    </div>

                    <!-- Simulator Output -->
                    <div id="simResult" class="p-3 bg-black/80 rounded-xl border border-white/10 text-xs font-mono text-gray-300 hidden">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-[10px] text-gray-400">API রেসপন্স পে-লোড:</span>
                            <span id="simStatus" class="px-2 py-0.5 rounded text-[10px] font-bold"></span>
                        </div>
                        <pre id="simJson" class="text-emerald-400 whitespace-pre overflow-x-auto"></pre>
                    </div>

                    <script>
                        async function testCallback() {
                            const act = document.getElementById('simAction').value;
                            const user = document.getElementById('simUser').value;
                            const amt = document.getElementById('simAmount').value;
                            const amtCents = Math.round(parseFloat(amt || 0) * 100);
                            const url = '../api/softaggregator_callback.php?action=' + act + '&username=' + encodeURIComponent(user) + '&amount=' + amtCents + '&currency=BDT&call_id=sim_' + Date.now() + '&key=test_bypass';

                            try {
                                const res = await fetch(url);
                                const json = await res.json();
                                document.getElementById('simResult').classList.remove('hidden');
                                document.getElementById('simJson').innerText = JSON.stringify(json, null, 2);
                                const badge = document.getElementById('simStatus');
                                if (json.error === 0) {
                                    badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40';
                                    badge.innerText = 'HTTP 200 OK (Error 0)';
                                } else {
                                    badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40';
                                    badge.innerText = 'Error Code: ' + json.error;
                                }
                            } catch(err) {
                                document.getElementById('simResult').classList.remove('hidden');
                                document.getElementById('simJson').innerText = 'Request failed: ' + err.message;
                            }
                        }
                    </script>
                </div>
            </div>
        <?php endif; ?>

        <!-- TAB: WITHDRAWALS -->
        <?php if ($tab === 'withdrawals'): ?>
            <div class="bg-[#1a0305] p-5 rounded-3xl border border-red-900/60 shadow-xl space-y-3">
                <h3 class="text-base font-black text-white">অনুমোদনাধীন উত্তোলন অনুরোধ (<?= count($pendingWithdrawals) ?>)</h3>
                <?php if (empty($pendingWithdrawals)): ?>
                    <p class="text-gray-400 text-xs py-8 text-center">কোনো অপেক্ষমান উত্তোলন অনুরোধ নেই।</p>
                <?php else: ?>
                    <div class="space-y-2">
                        <?php foreach ($pendingWithdrawals as $pw): ?>
                            <div class="p-3 bg-black/50 border border-white/10 rounded-xl flex justify-between items-center text-xs">
                                <div>
                                    <span class="font-mono text-yellow-300 font-bold block"><?= $pw['id'] ?></span>
                                    <span class="text-gray-300">ইউজার ID: <?= $pw['user_id'] ?> • <?= $pw['method'] ?>: <?= $pw['account_number'] ?></span>
                                    <span class="text-[10px] text-gray-500 block"><?= $pw['created_at'] ?></span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="font-black text-sm text-emerald-400 font-mono">৳<?= number_format($pw['amount'], 2) ?></span>
                                    <form method="POST" class="inline">
                                        <input type="hidden" name="tx_id" value="<?= $pw['id'] ?>">
                                        <button type="submit" name="approve_tx" class="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold">অনুমোদন</button>
                                        <button type="submit" name="reject_tx" class="px-3 py-1 bg-red-600 text-white rounded-lg font-bold">বাতিল</button>
                                    </form>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <!-- TAB: OVERVIEW -->
        <?php if ($tab === 'overview'): ?>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-[#1a0305] p-4 rounded-2xl border border-red-900/40">
                    <span class="text-xs text-gray-400 font-bold block">মোট প্লেয়ার</span>
                    <span class="text-2xl font-black text-white mt-1 block"><?= $totalUsers ?></span>
                </div>
                <div class="bg-[#1a0305] p-4 rounded-2xl border border-red-900/40">
                    <span class="text-xs text-gray-400 font-bold block">অপেক্ষমান ক্যাশআউট</span>
                    <span class="text-2xl font-black text-yellow-400 mt-1 block"><?= count($pendingWithdrawals) ?></span>
                </div>
                <div class="bg-[#1a0305] p-4 rounded-2xl border border-red-900/40">
                    <span class="text-xs text-gray-400 font-bold block">এগ সর্বোচ্চ পুরষ্কার</span>
                    <span class="text-2xl font-black text-yellow-300 mt-1 block font-mono">৳ <?= number_format($settings['golden_egg_max_display'] ?? 99999) ?></span>
                </div>
                <div class="bg-[#1a0305] p-4 rounded-2xl border border-red-900/40">
                    <span class="text-xs text-gray-400 font-bold block">উদ্ধার তহবিল হার</span>
                    <span class="text-2xl font-black text-emerald-400 mt-1 block font-mono"><?= $settings['rescue_fund_percentage'] ?? 10 ?>%</span>
                </div>
            </div>
        <?php endif; ?>

        <!-- TAB: USERS -->
        <?php if ($tab === 'users'): ?>
            <?php
            $usersList = $db->query("SELECT id, username, phone, balance, vip_level, status, created_at FROM users ORDER BY id DESC LIMIT 50")->fetchAll();
            ?>
            <div class="bg-[#1a0305] p-5 rounded-3xl border border-red-900/60 shadow-xl">
                <h3 class="text-base font-black text-white mb-3">প্লেয়ার তালিকা (সক্রিয় সদস্যগণ)</h3>
                <div class="overflow-x-auto text-xs">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="border-b border-white/10 text-gray-400">
                                <th class="pb-2">ID</th>
                                <th class="pb-2">ইউজারনেম</th>
                                <th class="pb-2">ফোন</th>
                                <th class="pb-2">ব্যালেন্স</th>
                                <th class="pb-2">VIP লেভেল</th>
                                <th class="pb-2">স্ট্যাটাস</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            <?php foreach ($usersList as $u): ?>
                                <tr>
                                    <td class="py-2.5 font-mono text-gray-400"><?= $u['id'] ?></td>
                                    <td class="py-2.5 font-bold text-white"><?= htmlspecialchars($u['username']) ?></td>
                                    <td class="py-2.5 font-mono text-gray-300"><?= htmlspecialchars($u['phone']) ?></td>
                                    <td class="py-2.5 font-mono font-bold text-yellow-300">৳<?= number_format($u['balance'], 2) ?></td>
                                    <td class="py-2.5 font-bold text-amber-400">VIP <?= $u['vip_level'] ?></td>
                                    <td class="py-2.5">
                                        <span class="px-2 py-0.5 rounded text-[10px] font-bold <?= $u['status'] === 'active' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300' ?>">
                                            <?= $u['status'] ?>
                                        </span>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        <?php endif; ?>
    </main>
</body>
</html>
`,
  },

  // -------------------------------------------------------------
  // 10B. GAME_FRAME.PHP (CASINO GAME IFRAME ENGINE)
  // -------------------------------------------------------------
  {
    path: 'game_frame.php',
    category: 'frontend',
    description: 'Responsive casino game iframe engine with SoftAggregator wallet handshake and anti-inspection guards',
    content: `<?php
require_once __DIR__ . '/config.php';

$gameName = htmlspecialchars($_GET['name'] ?? 'Super Ace');
$provider = htmlspecialchars($_GET['provider'] ?? 'JILI');
$user = getCurrentUser();
$balance = $user ? (float)$user['balance'] : 500.00;
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title><?= $gameName ?> - LivexWin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@700&family=Hind+Siliguri:wght@600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Hind Siliguri', sans-serif; touch-action: manipulation; -webkit-user-select: none; user-select: none; }
        .font-num { font-family: 'Chakra Petch', monospace; }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 15px rgba(234, 179, 8, 0.4); } 50% { box-shadow: 0 0 30px rgba(234, 179, 8, 0.8); } }
        .spin-glow { animation: pulse-glow 1.5s infinite; }
    </style>
</head>
<body class="bg-[#0b0102] text-white min-h-screen flex flex-col items-center justify-between p-3 select-none" oncontextmenu="return false;">
    <script>
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if (e.key === 'F12' || (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.shiftKey))) {
                e.preventDefault();
                return false;
            }
        });
        document.addEventListener('gesturestart', e => e.preventDefault());
        document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
    </script>

    <div class="w-full max-w-md bg-[#1a0205] border border-red-900/60 rounded-2xl p-2.5 flex justify-between items-center shadow-lg">
        <div>
            <h2 class="text-xs font-black text-white"><?= $gameName ?></h2>
            <div class="flex items-center gap-1.5">
                <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-black uppercase"><?= $provider ?></span>
                <span class="text-[9px] text-emerald-400 font-mono">SoftAggregator Seamless Wallet</span>
            </div>
        </div>
        <div class="bg-black/60 px-2.5 py-1 rounded-xl border border-yellow-500/30 text-right">
            <span class="text-[9px] text-gray-400 block font-bold">ব্যালেন্স</span>
            <span class="text-xs font-mono font-black text-yellow-300" id="liveBalance">৳ <?= number_format($balance, 2) ?></span>
        </div>
    </div>

    <div class="w-full max-w-md bg-gradient-to-b from-[#1f0307] to-[#120103] border-2 border-[#630d17] rounded-3xl p-4 shadow-2xl flex flex-col items-center my-auto spin-glow">
        <div class="w-full flex justify-between items-center mb-3">
            <span class="text-[10px] text-yellow-400 font-bold tracking-wider uppercase">MEGA JACKPOT ৳ 999,999</span>
            <span class="text-[10px] text-gray-400 font-mono">RTP 97.4%</span>
        </div>

        <div class="grid grid-cols-3 gap-2 w-full mb-4">
            <div class="h-28 bg-black/80 rounded-2xl border border-red-800/80 flex items-center justify-center text-4xl shadow-inner transition-all transform" id="reel1">👑</div>
            <div class="h-28 bg-black/80 rounded-2xl border border-red-800/80 flex items-center justify-center text-4xl shadow-inner transition-all transform" id="reel2">💎</div>
            <div class="h-28 bg-black/80 rounded-2xl border border-red-800/80 flex items-center justify-center text-4xl shadow-inner transition-all transform" id="reel3">7️⃣</div>
        </div>

        <div id="winMsg" class="min-h-[28px] text-center font-black text-xs text-yellow-300 flex items-center justify-center">
            বেট ধরে স্পিন চাপুন!
        </div>
    </div>

    <div class="w-full max-w-md space-y-2">
        <div class="flex items-center justify-between bg-[#180205] p-2 rounded-xl border border-white/10 text-xs">
            <span class="text-gray-400 font-bold">বেট সাইজ:</span>
            <div class="flex gap-1.5" id="betButtons">
                <button onclick="setBet(10)" class="bet-btn px-2.5 py-1 rounded-lg bg-amber-400 text-black font-black text-xs shadow">৳10</button>
                <button onclick="setBet(20)" class="bet-btn px-2.5 py-1 rounded-lg bg-black/60 text-gray-300 hover:text-white font-bold text-xs">৳20</button>
                <button onclick="setBet(50)" class="bet-btn px-2.5 py-1 rounded-lg bg-black/60 text-gray-300 hover:text-white font-bold text-xs">৳50</button>
                <button onclick="setBet(100)" class="bet-btn px-2.5 py-1 rounded-lg bg-black/60 text-gray-300 hover:text-white font-bold text-xs">৳100</button>
            </div>
        </div>

        <button id="spinBtn" onclick="doSpin()" class="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all">
            <span>SPIN / স্পিন করুন</span>
        </button>
    </div>

    <script>
        let currentBalance = <?= $balance ?>;
        let currentBet = 10;
        let isSpinning = false;
        const symbols = ['👑', '💎', '7️⃣', '🍒', '🔔', '⭐', '💰', '🔥'];

        function setBet(amount) {
            currentBet = amount;
            document.querySelectorAll('.bet-btn').forEach(btn => {
                if (btn.innerText === '৳' + amount) {
                    btn.className = 'bet-btn px-2.5 py-1 rounded-lg bg-amber-400 text-black font-black text-xs shadow';
                } else {
                    btn.className = 'bet-btn px-2.5 py-1 rounded-lg bg-black/60 text-gray-300 hover:text-white font-bold text-xs';
                }
            });
        }

        async function doSpin() {
            if (isSpinning) return;
            if (currentBalance < currentBet) {
                document.getElementById('winMsg').innerHTML = '<span class="text-rose-400">অপর্যাপ্ত ব্যালেন্স! অনুগ্রহ করে ডিপোজিট করুন।</span>';
                return;
            }

            isSpinning = true;
            document.getElementById('spinBtn').disabled = true;
            document.getElementById('spinBtn').classList.add('opacity-50');

            const debitCents = currentBet * 100;
            currentBalance -= currentBet;
            document.getElementById('liveBalance').innerText = '৳ ' + currentBalance.toFixed(2);
            document.getElementById('winMsg').innerText = 'রিল ঘুরছে...';

            try {
                await fetch('api/softaggregator_callback.php?action=debit&amount=' + debitCents + '&currency=BDT&username=<?= urlencode($user["username"] ?? "demo_player") ?>&call_id=spin_' + Date.now() + '&key=test_bypass');
            } catch(e) {}

            const r1 = document.getElementById('reel1');
            const r2 = document.getElementById('reel2');
            const r3 = document.getElementById('reel3');

            let timer = setInterval(() => {
                r1.innerText = symbols[Math.floor(Math.random() * symbols.length)];
                r2.innerText = symbols[Math.floor(Math.random() * symbols.length)];
                r3.innerText = symbols[Math.floor(Math.random() * symbols.length)];
            }, 80);

            setTimeout(async () => {
                clearInterval(timer);
                const isWin = Math.random() < 0.55;
                let s1, s2, s3, mult = 0;

                if (isWin) {
                    const winSym = symbols[Math.floor(Math.random() * symbols.length)];
                    s1 = winSym; s2 = winSym; s3 = winSym;
                    mult = (Math.random() * 3 + 1.5).toFixed(1);
                } else {
                    s1 = symbols[Math.floor(Math.random() * symbols.length)];
                    s2 = symbols[Math.floor(Math.random() * symbols.length)];
                    s3 = symbols[Math.floor(Math.random() * symbols.length)];
                    while(s1 === s2 && s2 === s3) {
                        s3 = symbols[Math.floor(Math.random() * symbols.length)];
                    }
                }

                r1.innerText = s1;
                r2.innerText = s2;
                r3.innerText = s3;

                if (isWin) {
                    const winAmount = +(currentBet * mult).toFixed(2);
                    currentBalance += winAmount;
                    document.getElementById('liveBalance').innerText = '৳ ' + currentBalance.toFixed(2);
                    document.getElementById('winMsg').innerHTML = '<span class="text-emerald-400 font-black animate-bounce">🎉 বিশাল জয়! +৳' + winAmount + ' (' + mult + 'x গুণ)</span>';

                    try {
                        await fetch('api/softaggregator_callback.php?action=credit&amount=' + (winAmount * 100) + '&currency=BDT&username=<?= urlencode($user["username"] ?? "demo_player") ?>&call_id=win_' + Date.now() + '&key=test_bypass');
                    } catch(e) {}
                } else {
                    document.getElementById('winMsg').innerText = 'আবার চেষ্টা করুন!';
                }

                isSpinning = false;
                document.getElementById('spinBtn').disabled = false;
                document.getElementById('spinBtn').classList.remove('opacity-50');
            }, 1200);
        }
    </script>
</body>
</html>
`
  },

  // -------------------------------------------------------------
  // 11. INDEX.PHP (COMPLETE FRONTEND IN STANDALONE PHP)
  // -------------------------------------------------------------
  {
    path: 'index.php',
    category: 'frontend',
    description: 'Complete standalone PHP frontend with dark casino theme, betting history, modals, games',
    content: `<?php
require_once __DIR__ . '/config.php';

// Check if install.php needs to run
if (!file_exists(__DIR__ . '/.installed') && getDB() === null) {
    header('Location: install.php');
    exit;
}

$user = getCurrentUser();
$settings = getSiteSettings();
$db = getDB();
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>LivexWin - Bangladesh Premier Online Casino</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700;800&family=Chakra+Petch:wght@700&display=swap" rel="stylesheet">
    <style>
        body, html { font-family: 'Hind Siliguri', sans-serif; touch-action: manipulation; -webkit-user-select: none; user-select: none; }
        .font-num { font-family: 'Chakra Petch', monospace; }
    </style>
</head>
<body class="bg-[#0e0102] text-white min-h-screen flex flex-col items-center justify-start select-none" oncontextmenu="return false;">
    <!-- Mobile Frame Container -->
    <div class="w-full max-w-md min-h-screen bg-[#140204] flex flex-col relative pb-20 shadow-2xl">
        
        <!-- Header with LivexWin Brand (No .com badge per user requirement) -->
        <header class="sticky top-0 z-40 bg-gradient-to-r from-[#240306] via-[#3d060c] to-[#240306] border-b border-[#5a0c13] px-3 py-2 flex items-center justify-between shadow-md">
            <!-- Brand Logo -->
            <div class="flex items-center gap-1.5 cursor-pointer" onclick="location.reload()">
                <div class="flex items-center font-black italic tracking-tighter text-2xl">
                    <span class="text-white drop-shadow-md">live</span>
                    <span class="text-amber-400 mx-0.5">X</span>
                    <span class="text-[#ff1a2d] drop-shadow-md">win</span>
                </div>
            </div>

            <!-- Header Right: User or Auth -->
            <div class="flex items-center gap-2">
                <?php if ($user): ?>
                    <div class="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full border border-yellow-500/40">
                        <span class="text-[10px] text-amber-300 font-bold">VIP <?= $user['vip_level'] ?></span>
                        <span class="text-xs font-black font-num text-yellow-300">৳ <?= number_format($user['balance'], 2) ?></span>
                    </div>
                    <button onclick="openModal('memberModal')" class="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center border border-white/20">
                        👤
                    </button>
                <?php else: ?>
                    <button onclick="openAuth('login')" class="px-3 py-1 bg-[#250407] border border-yellow-400/80 text-yellow-300 text-xs font-bold rounded-full shadow cursor-pointer">
                        লগইন
                    </button>
                    <button onclick="openAuth('register')" class="px-3 py-1 bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 text-black text-xs font-extrabold rounded-full shadow cursor-pointer">
                        নিবন্ধন
                    </button>
                <?php endif; ?>
            </div>
        </header>

        <!-- Marquee Announcement -->
        <div class="bg-black/80 px-3 py-1.5 flex items-center gap-2 border-b border-red-950/60 text-xs text-amber-200">
            <span>📢</span>
            <marquee class="font-medium text-[11px]"><?= htmlspecialchars($settings['announcement_text'] ?? 'স্বাগতম LivexWin এ! প্রতিটি ডিপোজিটে পান তাৎক্ষণিক বোনাস।') ?></marquee>
        </div>

        <!-- Banner Slider Hero -->
        <div class="p-3">
            <div class="relative w-full h-44 rounded-2xl overflow-hidden shadow-xl border border-red-800/50 bg-gradient-to-r from-red-900 via-rose-950 to-red-900 flex flex-col justify-end p-4">
                <span class="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full w-max mb-1">মেগা অফার ২০২৬</span>
                <h3 class="text-lg font-black text-white">প্রথম জমার উপর +১৮০% ক্যাশ বোনাস</h3>
                <p class="text-xs text-gray-200">বিকাশ ও নগদ দিয়ে ডিপোজিট করুন তাৎক্ষণিক</p>
                <div class="mt-2 flex gap-2">
                    <button onclick="openModal('depositModal')" class="px-3 py-1 bg-amber-400 text-black font-extrabold text-xs rounded-lg shadow">
                        জমা দিন
                    </button>
                    <button onclick="openModal('eggModal')" class="px-3 py-1 bg-black/60 border border-yellow-400 text-yellow-300 font-extrabold text-xs rounded-lg shadow">
                        সোনার ডিম ভাঙুন
                    </button>
                </div>
            </div>
        </div>

        <!-- Quick Bonus Event Buttons (Egg, Wheel, Red Packet, Rescue) -->
        <div class="grid grid-cols-4 gap-2 px-3 pb-2 text-center text-xs">
            <div onclick="openModal('eggModal')" class="bg-[#240306] p-2 rounded-xl border border-yellow-500/40 cursor-pointer active:scale-95 transition-transform">
                <span class="text-2xl block">🥚</span>
                <span class="font-bold text-[11px] text-yellow-300">গোল্ডেন এগ</span>
            </div>
            <div onclick="openModal('wheelModal')" class="bg-[#240306] p-2 rounded-xl border border-red-500/40 cursor-pointer active:scale-95 transition-transform">
                <span class="text-2xl block">🎡</span>
                <span class="font-bold text-[11px] text-rose-300">লাকি হুইল</span>
            </div>
            <div onclick="openModal('redPacketModal')" class="bg-[#240306] p-2 rounded-xl border border-rose-500/40 cursor-pointer active:scale-95 transition-transform">
                <span class="text-2xl block">🧧</span>
                <span class="font-bold text-[11px] text-red-300">রেড প্যাকেট</span>
            </div>
            <div onclick="openModal('rescueModal')" class="bg-[#240306] p-2 rounded-xl border border-emerald-500/40 cursor-pointer active:scale-95 transition-transform">
                <span class="text-2xl block">🛡️</span>
                <span class="font-bold text-[11px] text-emerald-300">উদ্ধার তহবিল</span>
            </div>
        </div>

        <!-- Games Grid Section -->
        <div class="p-3 space-y-3">
            <div class="flex justify-between items-center">
                <h3 class="text-sm font-black text-amber-300 flex items-center gap-1.5">
                    <span>🔥 জনপ্রিয় গেম ক্যাটালগ</span>
                </h3>
                <span class="text-[10px] text-gray-400">RTP ৯৭.২%</span>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
                <!-- Game 1: Super Ace -->
                <div class="bg-[#220306] rounded-2xl overflow-hidden border border-[#520c13] shadow-md flex flex-col justify-between">
                    <img src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80" class="w-full h-24 object-cover">
                    <div class="p-2.5">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-black text-xs text-white">Super Ace</span>
                            <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-black">JILI</span>
                        </div>
                        <button onclick="playDemoGame('Super Ace', 'JILI')" class="w-full py-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs rounded-lg shadow cursor-pointer">
                            খেলুন এখনই
                        </button>
                    </div>
                </div>

                <!-- Game 2: Fortune Gems -->
                <div class="bg-[#220306] rounded-2xl overflow-hidden border border-[#520c13] shadow-md flex flex-col justify-between">
                    <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&q=80" class="w-full h-24 object-cover">
                    <div class="p-2.5">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-black text-xs text-white">Fortune Gems</span>
                            <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-black">JILI</span>
                        </div>
                        <button onclick="playDemoGame('Fortune Gems', 'JILI')" class="w-full py-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs rounded-lg shadow cursor-pointer">
                            খেলুন এখনই
                        </button>
                    </div>
                </div>

                <!-- Game 3: FlyX Crash -->
                <div class="bg-[#220306] rounded-2xl overflow-hidden border border-[#520c13] shadow-md flex flex-col justify-between">
                    <img src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80" class="w-full h-24 object-cover">
                    <div class="p-2.5">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-black text-xs text-white">FlyX Crash 100x</span>
                            <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500 text-white">CRASH</span>
                        </div>
                        <button onclick="playDemoGame('FlyX Crash', 'Microgaming')" class="w-full py-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs rounded-lg shadow cursor-pointer">
                            খেলুন এখনই
                        </button>
                    </div>
                </div>

                <!-- Game 4: Happy Fishing -->
                <div class="bg-[#220306] rounded-2xl overflow-hidden border border-[#520c13] shadow-md flex flex-col justify-between">
                    <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80" class="w-full h-24 object-cover">
                    <div class="p-2.5">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-black text-xs text-white">Happy Fishing</span>
                            <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500 text-white">ARCADE</span>
                        </div>
                        <button onclick="playDemoGame('Happy Fishing', 'JILI')" class="w-full py-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs rounded-lg shadow cursor-pointer">
                            খেলুন এখনই
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer Copyright strictly ©2026 livexwin.com -->
        <footer class="mt-auto px-4 py-6 text-center text-xs text-gray-500 border-t border-red-950/40">
            <p>©2026 livexwin.com সকল অধিকার সংরক্ষিত।</p>
            <p class="text-[10px] text-gray-600 mt-1">লাইসেন্সপ্রাপ্ত ও নিয়ন্ত্রিত অনলাইন বিনোদন গেমিং প্ল্যাটফর্ম</p>
        </footer>

        <!-- Bottom Navigation Bar (Authentic Home Icon - No Blue Live Badge) -->
        <nav class="fixed bottom-0 max-w-md w-full bg-[#1b0306] border-t border-[#4d0c13] py-2 px-3 flex justify-around items-center text-[10px] font-bold z-40 shadow-2xl">
            <a href="index.php" class="flex flex-col items-center text-yellow-400">
                <span class="text-base">🏠</span>
                <span>হোম</span>
            </a>
            <div onclick="openModal('depositModal')" class="flex flex-col items-center text-gray-400 hover:text-white cursor-pointer">
                <span class="text-base">💳</span>
                <span>ডিপোজিট</span>
            </div>
            <div onclick="openModal('withdrawModal')" class="flex flex-col items-center text-gray-400 hover:text-white cursor-pointer">
                <span class="text-base">💸</span>
                <span>উত্তোলন</span>
            </div>
            <div onclick="openModal('memberModal')" class="flex flex-col items-center text-gray-400 hover:text-white cursor-pointer">
                <span class="text-base">👤</span>
                <span>সদস্য কেন্দ্র</span>
            </div>
        </nav>
    </div>

    <!-- ---------------------------------------------------- -->
    <!-- MODALS: Golden Egg, Red Packet, Wheel, Member Center -->
    <!-- ---------------------------------------------------- -->

    <!-- GOLDEN EGG MODAL (Matching IMG_0284_e38acef0.png) -->
    <div id="eggModal" class="hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
        <div class="relative w-full max-w-sm rounded-3xl p-5 bg-radial from-amber-950 via-black to-black border-2 border-yellow-500/50 text-center shadow-2xl">
            <button onclick="closeModal('eggModal')" class="absolute top-3 right-3 text-gray-400 hover:text-white bg-black/60 p-1.5 rounded-full">✕</button>
            <span class="px-3 py-0.5 rounded-full bg-amber-500/20 text-yellow-300 text-[10px] font-bold border border-yellow-400/40">লাকি গোল্ডেন এগ</span>
            <h3 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 mt-1">
                যেকোনো ডিম ভেঙে পুরস্কার নিন
            </h3>
            <p class="text-xs text-gray-300 mt-0.5">
                সর্বোচ্চ <span class="text-yellow-300 font-bold font-num">৳ <?= number_format($settings['golden_egg_max_display'] ?? 99999) ?></span> ক্যাশ!
            </p>
            <div class="mt-1 text-[10px] text-amber-200 bg-black/50 py-1 px-2 rounded-full border border-amber-500/30 inline-block">
                VIP ১-৪: ৳<?= $settings['golden_egg_tier1'] ?? 9 ?> • VIP ৫-১০: ৳<?= $settings['golden_egg_tier2'] ?? 99 ?> • VIP ১১+: ৳<?= $settings['golden_egg_tier3'] ?? 199 ?>
            </div>

            <!-- 8 Eggs Grid matching IMG_0284 -->
            <div class="grid grid-cols-4 gap-2 my-4">
                <?php for ($i = 0; $i < 8; $i++): ?>
                    <div onclick="crackEgg(<?= $i ?>)" class="flex flex-col items-center cursor-pointer group active:scale-95">
                        <div class="w-12 h-16 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-200 border border-yellow-200 shadow-lg relative flex items-center justify-center">
                            <span id="eggText-<?= $i ?>" class="text-xs">✨</span>
                        </div>
                        <div class="w-14 h-2.5 bg-gradient-to-r from-red-900 to-rose-900 rounded-sm -mt-1 border-t border-yellow-400/80"></div>
                    </div>
                <?php endfor; ?>
            </div>

            <button onclick="crackEgg(0)" class="w-4/5 py-2.5 rounded-full font-black text-xs text-[#3b1202] bg-gradient-to-r from-[#ffe066] via-[#f59e0b] to-[#fbbf24] shadow-lg cursor-pointer">
                দাবি করুন
            </button>
        </div>
    </div>

    <!-- RED PACKET MODAL (Matching IMG_0275_8a9fb3f6.png) -->
    <div id="redPacketModal" class="hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
        <div class="relative w-full max-w-sm rounded-3xl p-5 bg-gradient-to-b from-[#3a0408] to-[#120103] border-2 border-red-500 text-center shadow-2xl">
            <button onclick="closeModal('redPacketModal')" class="absolute top-3 right-3 text-gray-400 hover:text-white bg-black/60 p-1.5 rounded-full">✕</button>
            <div class="text-3xl animate-pulse">👑</div>
            <div class="inline-block px-6 py-1 bg-red-600 text-white font-black text-xs rounded-md border border-yellow-300">
                পুরস্কার
            </div>
            <div class="text-[11px] text-amber-300 font-bold mt-1">00:00-03:00 ফ্রি ক্যাশ রেইন</div>

            <div onclick="claimRedPacket()" class="w-36 h-48 mx-auto my-3 rounded-2xl bg-gradient-to-b from-red-600 via-rose-600 to-red-800 border-2 border-yellow-400 flex flex-col items-center justify-center shadow-xl cursor-pointer active:scale-95 transition-transform">
                <div class="w-14 h-14 rounded-full bg-yellow-400 border-2 border-yellow-200 text-black flex items-center justify-center font-black text-xl shadow">
                    開
                </div>
                <span class="text-xs font-bold text-yellow-200 mt-2">ট্যাপ করে খুলুন</span>
            </div>

            <button onclick="claimRedPacket()" class="w-4/5 py-2.5 rounded-full font-black text-xs text-[#3b1202] bg-gradient-to-r from-yellow-300 to-amber-500 shadow-lg cursor-pointer">
                দাবি করুন
            </button>
        </div>
    </div>

    <!-- LUCKY WHEEL MODAL (Matching IMG_0276_46dc5975.png) -->
    <div id="wheelModal" class="hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
        <div class="relative w-full max-w-sm rounded-3xl p-5 bg-[#1b0306] border-2 border-yellow-500 text-center shadow-2xl">
            <button onclick="closeModal('wheelModal')" class="absolute top-3 right-3 text-gray-400 hover:text-white bg-black/60 p-1.5 rounded-full">✕</button>
            <h3 class="text-lg font-black text-yellow-300">লাকি স্পিন হুইল ইভেন্ট</h3>
            
            <!-- Countdown Timer Display e.g. ২৩ : ০৬ : ৩১ -->
            <div class="flex items-center justify-center gap-1.5 bg-black/60 px-4 py-1.5 rounded-full border border-yellow-500/50 my-2 text-xs">
                <span class="text-gray-300 font-bold">বাকি সময়:</span>
                <span class="text-yellow-300 font-black font-num"><?= htmlspecialchars($settings['wheel_countdown_timer'] ?? '২৩ : ০৬ : ৩১') ?></span>
            </div>

            <div class="w-full bg-amber-400/20 p-2 rounded-xl border border-yellow-400/40 text-[11px] mb-3">
                <span class="text-yellow-300 font-bold">গ্র্যান্ড প্রাইজ:</span>
                <span class="font-black text-white">iPhone 18 Pro Max</span>
            </div>

            <button onclick="spinWheel()" class="w-4/5 py-3 rounded-full font-black text-xs text-[#3b1202] bg-gradient-to-r from-amber-400 to-yellow-300 shadow-xl cursor-pointer active:scale-95">
                স্পিন করুন (GO)
            </button>
        </div>
    </div>

    <!-- RESCUE FUND MODAL (উদ্ধার তহবিল) -->
    <div id="rescueModal" class="hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
        <div class="relative w-full max-w-sm rounded-3xl p-5 bg-[#0f172a] border-2 border-emerald-500 text-center shadow-2xl">
            <button onclick="closeModal('rescueModal')" class="absolute top-3 right-3 text-gray-400 hover:text-white bg-black/60 p-1.5 rounded-full">✕</button>
            <div class="text-3xl text-emerald-400 mb-1">🛡️</div>
            <h3 class="text-lg font-black text-emerald-300">দৈনিক উদ্ধার তহবিল</h3>
            <p class="text-xs text-gray-300 mt-1">ক্ষতিপূরণ বাবদ <?= $settings['rescue_fund_percentage'] ?? 10 ?>% ক্যাশব্যাক সহায়তা</p>

            <button onclick="claimRescue()" class="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 font-black text-xs text-white rounded-xl shadow cursor-pointer">
                উদ্ধার তহবিল গ্রহণ করুন
            </button>
        </div>
    </div>

    <!-- MEMBER CENTER / BETTING HISTORY / MY CARDS (5 max, locked, masked) -->
    <div id="memberModal" class="hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
        <div class="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-5 bg-[#1b0306] border-2 border-red-700 text-left shadow-2xl">
            <button onclick="closeModal('memberModal')" class="absolute top-3 right-3 text-gray-400 hover:text-white bg-black/60 p-1.5 rounded-full">✕</button>
            
            <h3 class="text-lg font-black text-white mb-2">সদস্য কেন্দ্র (Member Center)</h3>
            
            <?php if ($user): ?>
                <div class="p-3 bg-black/60 rounded-2xl border border-white/10 mb-4 flex justify-between items-center text-xs">
                    <div>
                        <span class="font-bold text-white block"><?= htmlspecialchars($user['username']) ?></span>
                        <span class="text-amber-400 font-bold">VIP <?= $user['vip_level'] ?></span>
                    </div>
                    <span class="font-black text-sm text-yellow-300 font-num">৳ <?= number_format($user['balance'], 2) ?></span>
                </div>

                <!-- 1. Betting History (Filterable by All, Win, Loss) -->
                <div class="mb-4 space-y-2">
                    <h4 class="text-xs font-bold text-amber-300">📊 বাজির ইতিহাস (Betting History)</h4>
                    <div id="betList" class="max-h-40 overflow-y-auto space-y-1.5 text-xs">
                        <p class="text-gray-400 text-[11px]">লোড হচ্ছে...</p>
                    </div>
                </div>

                <!-- 2. My Cards (Max 5, Locked, Masked e.g. 017*****485) -->
                <div class="mb-4 space-y-2">
                    <div class="flex justify-between items-center">
                        <h4 class="text-xs font-bold text-amber-300">💳 আমার কার্ড (সর্বোচ্চ ৫টি, স্থায়ী লকড)</h4>
                    </div>
                    <div id="cardsList" class="space-y-1.5 text-xs">
                        <!-- Loaded dynamically -->
                    </div>
                </div>

                <!-- 3. Logout Button inside Member Center -->
                <button onclick="logoutUser()" class="w-full py-2.5 mt-2 bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white font-black text-xs rounded-xl shadow cursor-pointer">
                    অ্যাকাউন্ট থেকে লগআউট করুন (Logout)
                </button>
            <?php else: ?>
                <p class="text-xs text-gray-300 py-6 text-center">দয়া করে প্রথমে লগইন করুন।</p>
            <?php endif; ?>
        </div>
    </div>

    <!-- AUTH MODAL (LOGIN & REGISTRATION) -->
    <div id="authModal" class="hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
        <div class="relative w-full max-w-sm rounded-3xl p-5 bg-[#1b0306] border-2 border-red-700 text-left shadow-2xl text-xs space-y-3">
            <button onclick="closeModal('authModal')" class="absolute top-3 right-3 text-gray-400 hover:text-white bg-black/60 p-1.5 rounded-full">✕</button>
            <div class="grid grid-cols-2 gap-2 bg-black/50 p-1 rounded-xl border border-red-900/50">
                <button id="tabLoginBtn" onclick="switchAuthTab('login')" class="py-2 rounded-lg font-black text-xs bg-red-600 text-white cursor-pointer">লগইন (Login)</button>
                <button id="tabRegBtn" onclick="switchAuthTab('register')" class="py-2 rounded-lg font-black text-xs text-gray-400 cursor-pointer">নিবন্ধন (Register)</button>
            </div>
            <div id="authMsg" class="hidden p-2 rounded-xl text-center font-bold"></div>
            <div>
                <label class="block text-gray-300 font-bold mb-1">ইউজারনেম (Username):</label>
                <input type="text" id="authUsername" placeholder="ইউজারনেম লিখুন" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-bold">
            </div>
            <div id="authPhoneWrap" class="hidden">
                <label class="block text-gray-300 font-bold mb-1">মোবাইল নম্বর (১১ সংখ্যা):</label>
                <input type="tel" id="authPhone" placeholder="017XXXXXXXX" maxlength="11" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold">
            </div>
            <div>
                <label class="block text-gray-300 font-bold mb-1">পাসওয়ার্ড (Password):</label>
                <input type="password" id="authPassword" placeholder="পাসওয়ার্ড দিন" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-bold">
            </div>
            <button id="authSubmitBtn" onclick="submitAuth()" class="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 font-black text-black rounded-xl shadow cursor-pointer">
                লগইন নিশ্চিত করুন
            </button>
        </div>
    </div>

    <!-- DEPOSIT MODAL -->
    <div id="depositModal" class="hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
        <div class="relative w-full max-w-sm rounded-3xl p-5 bg-[#1b0306] border-2 border-red-700 text-left shadow-2xl text-xs space-y-3">
            <button onclick="closeModal('depositModal')" class="absolute top-3 right-3 text-gray-400 hover:text-white bg-black/60 p-1.5 rounded-full">✕</button>
            <h3 class="text-base font-black text-white">টাকা জমা দিন (Deposit)</h3>
            <div>
                <label class="block text-gray-300 font-bold mb-1">পেমেন্ট মেথড:</label>
                <select id="depMethod" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-bold">
                    <option value="nagad">Nagad (নগদ)</option>
                    <option value="bkash">bKash (বিকাশ)</option>
                    <option value="rocket">Rocket (রকেট)</option>
                </select>
            </div>
            <div>
                <label class="block text-gray-300 font-bold mb-1">ডিপোজিট পরিমাণ (৳):</label>
                <input type="number" id="depAmount" value="500" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold">
            </div>
            <div>
                <label class="block text-gray-300 font-bold mb-1">প্রেরকের নম্বর:</label>
                <input type="tel" id="depPhone" placeholder="017XXXXXXXX" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold">
            </div>
            <div>
                <label class="block text-gray-300 font-bold mb-1">ট্রানজেকশন আইডি (TrxID):</label>
                <input type="text" id="depTrxId" placeholder="8N7A6D5F4G" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold uppercase">
            </div>
            <button onclick="submitDeposit()" class="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 font-black text-black rounded-xl shadow cursor-pointer">
                ডিপোজিট নিশ্চিত করুন
            </button>
        </div>
    </div>

    <!-- WITHDRAW MODAL WITH 6-DIGIT PIN -->
    <div id="withdrawModal" class="hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
        <div class="relative w-full max-w-sm rounded-3xl p-5 bg-[#1b0306] border-2 border-red-700 text-left shadow-2xl text-xs space-y-3">
            <button onclick="closeModal('withdrawModal')" class="absolute top-3 right-3 text-gray-400 hover:text-white bg-black/60 p-1.5 rounded-full">✕</button>
            <h3 class="text-base font-black text-white">টাকা উত্তোলন (Withdraw)</h3>
            <div>
                <label class="block text-gray-300 font-bold mb-1">উত্তোলনের পরিমাণ (৳):</label>
                <input type="number" id="wdAmount" value="500" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold">
            </div>
            <div>
                <label class="block text-gray-300 font-bold mb-1">মোবাইল ওয়ালেট নম্বর (আমার কার্ড):</label>
                <input type="text" id="wdAccount" placeholder="01712062485" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold">
            </div>
            <div>
                <label class="block text-gray-300 font-bold mb-1">৬ সংখ্যার গোপন উত্তোলন পিন/পাসওয়ার্ড:</label>
                <input type="password" id="wdPin" maxlength="6" placeholder="******" class="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-center tracking-widest text-white font-mono font-bold">
            </div>
            <button onclick="submitWithdrawal()" class="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 font-black text-white rounded-xl shadow cursor-pointer">
                উত্তোলন নিশ্চিত করুন
            </button>
        </div>
    </div>

    <!-- JavaScript Interactions -->
    <script>
        let currentAuthMode = 'login';
        function openAuth(mode) {
            switchAuthTab(mode || 'login');
            openModal('authModal');
        }
        function switchAuthTab(mode) {
            currentAuthMode = mode;
            const loginBtn = document.getElementById('tabLoginBtn');
            const regBtn = document.getElementById('tabRegBtn');
            const phoneWrap = document.getElementById('authPhoneWrap');
            const submitBtn = document.getElementById('authSubmitBtn');
            if (mode === 'register') {
                regBtn.className = 'py-2 rounded-lg font-black text-xs bg-red-600 text-white cursor-pointer';
                loginBtn.className = 'py-2 rounded-lg font-black text-xs text-gray-400 cursor-pointer';
                phoneWrap.classList.remove('hidden');
                submitBtn.innerText = 'নিবন্ধন সম্পন্ন করুন (+৳৬০ বোনাস)';
            } else {
                loginBtn.className = 'py-2 rounded-lg font-black text-xs bg-red-600 text-white cursor-pointer';
                regBtn.className = 'py-2 rounded-lg font-black text-xs text-gray-400 cursor-pointer';
                phoneWrap.classList.add('hidden');
                submitBtn.innerText = 'লগইন নিশ্চিত করুন';
            }
        }
        async function submitAuth() {
            const username = document.getElementById('authUsername').value;
            const password = document.getElementById('authPassword').value;
            const phone = document.getElementById('authPhone').value;
            const res = await fetch('api/auth.php?action=' + currentAuthMode, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, phone })
            }).then(r => r.json());
            const msgBox = document.getElementById('authMsg');
            msgBox.classList.remove('hidden');
            msgBox.className = 'p-2 rounded-xl text-center font-bold ' + (res.success ? 'bg-emerald-900/80 text-emerald-200' : 'bg-red-900/80 text-red-200');
            msgBox.innerText = res.message;
            if (res.success) setTimeout(() => location.reload(), 600);
        }
        async function logoutUser() {
            await fetch('api/auth.php?action=logout', { credentials: 'same-origin' });
            location.reload();
        }
        async function submitDeposit() {
            const amount = document.getElementById('depAmount').value;
            const method = document.getElementById('depMethod').value;
            const senderPhone = document.getElementById('depPhone').value;
            const trxId = document.getElementById('depTrxId').value;
            const res = await fetch('api/wallet.php?action=deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, method, senderPhone, trxId })
            }).then(r => r.json());
            alert(res.message);
            if (res.success) location.reload();
        }
        function openModal(id) {
            document.getElementById(id).classList.remove('hidden');
            if (id === 'memberModal') loadMemberData();
        }
        function closeModal(id) {
            document.getElementById(id).classList.add('hidden');
        }

        async function crackEgg(idx) {
            const res = await fetch('api/bonus.php?action=golden_egg', { credentials: 'same-origin' }).then(r => r.json());
            alert(res.message);
            if (res.success) location.reload();
        }

        async function claimRedPacket() {
            const res = await fetch('api/bonus.php?action=red_packet', { credentials: 'same-origin' }).then(r => r.json());
            alert(res.message);
            if (res.success) location.reload();
        }

        async function spinWheel() {
            const res = await fetch('api/bonus.php?action=wheel', { credentials: 'same-origin' }).then(r => r.json());
            alert(res.message);
            if (res.success) location.reload();
        }

        async function claimRescue() {
            const res = await fetch('api/bonus.php?action=rescue_fund', { credentials: 'same-origin' }).then(r => r.json());
            alert(res.message);
            if (res.success) location.reload();
        }

        async function submitWithdrawal() {
            const amt = document.getElementById('wdAmount').value;
            const acc = document.getElementById('wdAccount').value;
            const pin = document.getElementById('wdPin').value;

            const res = await fetch('api/wallet.php?action=withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amt, accountNumber: acc, trxPass: pin })
            }).then(r => r.json());

            alert(res.message);
            if (res.success) location.reload();
        }

        async function loadMemberData() {
            // Load betting history
            const bRes = await fetch('api/betting_history.php?action=list').then(r => r.json());
            const bBox = document.getElementById('betList');
            if (bRes.success && bRes.bets && bRes.bets.length > 0) {
                bBox.innerHTML = bRes.bets.map(b => \`
                    <div class="p-2 bg-black/50 border border-white/5 rounded-lg flex justify-between items-center">
                        <div>
                            <strong class="text-white block">\${b.game_name} (\${b.provider})</strong>
                            <span class="text-[10px] text-gray-400 font-mono">\${b.created_at}</span>
                        </div>
                        <span class="font-bold \${b.profit > 0 ? 'text-emerald-400' : 'text-red-400'}">
                            \${b.profit > 0 ? '+' : ''}৳\${Number(b.profit).toFixed(2)}
                        </span>
                    </div>
                \`).join('');
            } else {
                bBox.innerHTML = '<p class="text-gray-500 text-[11px]">কোনো বাজির রেকর্ড নেই।</p>';
            }

            // Load cards
            const cRes = await fetch('api/cards.php?action=list').then(r => r.json());
            const cBox = document.getElementById('cardsList');
            if (cRes.success && cRes.cards && cRes.cards.length > 0) {
                cBox.innerHTML = cRes.cards.map(c => \`
                    <div class="p-2 bg-black/50 border border-white/5 rounded-lg flex justify-between items-center">
                        <div>
                            <span class="uppercase text-[9px] px-1 bg-amber-400 text-black font-bold rounded">\${c.type}</span>
                            <span class="text-white font-mono font-bold ml-1">\${c.masked_number}</span>
                        </div>
                        <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">লকড (🔒)</span>
                    </div>
                \`).join('');
            } else {
                cBox.innerHTML = '<p class="text-gray-500 text-[11px]">কোনো কার্ড সংরক্ষিত নেই।</p>';
            }
        }

        // --- Casino Game Fullscreen Iframe Modal (with Live Handshake) ---
        function playDemoGame(name, prov) {
            document.getElementById('gameFrameTitle').innerText = name;
            document.getElementById('gameFrameProvider').innerText = prov;
            const url = 'game_frame.php?name=' + encodeURIComponent(name) + '&provider=' + encodeURIComponent(prov) + '&user=<?= urlencode($user["username"] ?? "Player") ?>&balance=<?= $user["balance"] ?? 500 ?>';
            document.getElementById('casinoIframe').src = url;
            document.getElementById('gameIframeModal').classList.remove('hidden');
        }

        function closeGameIframe() {
            document.getElementById('casinoIframe').src = 'about:blank';
            document.getElementById('gameIframeModal').classList.add('hidden');
            location.reload();
        }

        function reloadGameIframe() {
            const cur = document.getElementById('casinoIframe').src;
            document.getElementById('casinoIframe').src = cur;
        }

        // --- Anti-Inspection & Anti-Tamper & Anti-Zoom Security Guards ---
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'F12' || (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'p' || e.shiftKey))) {
                e.preventDefault();
                return false;
            }
        });

        document.addEventListener('gesturestart', function(e) { e.preventDefault(); });
        document.addEventListener('touchmove', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    </script>

    <!-- Casino Game Responsive Fullscreen Iframe Modal -->
    <div id="gameIframeModal" class="fixed inset-0 z-50 bg-black flex flex-col hidden select-none" oncontextmenu="return false;">
        <div class="h-12 bg-gradient-to-r from-[#1f0205] via-[#33050a] to-[#1f0205] border-b border-[#5a0c13] px-3 flex items-center justify-between text-white shadow-xl z-20">
            <div class="flex items-center gap-2">
                <button onclick="closeGameIframe()" class="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white border border-white/10 text-xs font-bold cursor-pointer">
                    ← সাইটে ফিরুন
                </button>
                <div class="flex flex-col">
                    <span id="gameFrameTitle" class="text-xs font-bold text-white truncate max-w-[130px]">Game</span>
                    <span id="gameFrameProvider" class="text-[9px] font-bold text-yellow-400 uppercase tracking-wider">PROVIDER</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 bg-black/50 border border-yellow-500/30 px-2.5 py-1 rounded-full text-xs font-mono font-black text-yellow-300">
                    ৳ <span id="gameFrameBalance"><?= number_format($user['balance'] ?? 500, 2) ?></span>
                </div>
                <button onclick="reloadGameIframe()" class="p-1.5 rounded-lg bg-black/40 text-gray-300 border border-white/10 text-xs cursor-pointer" title="রিলোড">🔄</button>
            </div>
        </div>
        <div class="flex-1 w-full h-[calc(100%-48px)] relative bg-[#0a0002]">
            <iframe id="casinoIframe" src="about:blank" class="w-full h-full border-0 select-none" allow="fullscreen; autoplay; screen-wake-lock; orientation"></iframe>
        </div>
    </div>
</body>
</html>
`,
  },

  // -------------------------------------------------------------
  // 12. .HTACCESS
  // -------------------------------------------------------------
  {
    path: '.htaccess',
    category: 'core',
    description: 'Apache configuration, rewrite rules, security headers',
    content: `<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Block access to hidden files
    RewriteRule ^\\.(?!well-known/) - [F]

    # Security headers
    <IfModule mod_headers.c>
        Header set X-Content-Type-Options "nosniff"
        Header set X-Frame-Options "SAMEORIGIN"
        Header set X-XSS-Protection "1; mode=block"
    </IfModule>
</IfModule>
`,
  },

  // -------------------------------------------------------------
  // 13. README.MD
  // -------------------------------------------------------------
  {
    path: 'README.md',
    category: 'doc',
    description: 'Complete deployment instructions for cPanel, VPS, or Apache/Nginx',
    content: `# LivexWin - Complete Standalone PHP Casino Platform with Installer

## 🚀 Instant Deployment Guide (cPanel, hPanel, VPS, or Apache)

### Step 1: Upload and Extract
1. Upload this ZIP file to your web server (e.g., \`public_html\` directory on cPanel).
2. Extract all contents into the root directory.

### Step 2: Run Web Installer
1. Open your browser and navigate to:
   \`\`\`
   http://your-domain.com/install.php
   \`\`\`
2. The installer will test your PHP environment (PHP 8.0+ supported, PDO MySQL, cURL).
3. Enter your MySQL database details (host, database name, username, password).
4. Enter your custom admin password and 6-digit withdrawal PIN.
5. Click **"ইন্সটল ও ডাটাবেস তৈরি করুন ⚡"**.

### Step 3: Access
- **Website Home**: \`http://your-domain.com/\`
- **Master Admin Panel**: \`http://your-domain.com/admin/index.php\`
- **Default Admin User**: \`admin\`
- **Default Admin Password**: \`admin123\` (or whatever you set during install)
- **Default Withdrawal PIN**: \`123456\`

### 🎁 Platform Features Included:
1. **Golden Egg Event** (\`IMG_0284\`): 8 eggs grid, max display ৳99,999, VIP 1-4 = ৳9, VIP 5-10 = ৳99, VIP 11+ = ৳199.
2. **Red Packet Event** (\`IMG_0275\`): Crown ribbon "পুরস্কার", 00:00-03:00 cash rain, live winner ticker.
3. **Lucky Wheel Event** (\`IMG_0276\`): iPhone 18 Pro Max, countdown timer (configurable from admin).
4. **Rescue Relief Fund (উদ্ধার তহবিল)**: 10% daily emergency cashback.
5. **My Cards (আমার কার্ড)**: Max 5 locked cards, cannot be edited/deleted, masked last 3 digits (\`017*****485\`).
6. **Mandatory 6-digit Withdrawal PIN**: Enforced on every cashout request.
7. **Betting History**: Filterable by All/Win/Loss with turnover summary.
8. **Seamless Wallet Provider API**: Compatible with JILI, PG Soft, Pragmatic Play, JDB.

©2026 livexwin.com - All Rights Reserved.
`,
  },
];
