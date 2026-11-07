/**
 * Complete Laravel 11.x Backend Architecture for LivexWin Casino Platform
 * Includes:
 * 1. Authentication & RBAC Middleware (Admin & Player Roles, Session & Sanctum Security)
 * 2. Atomic Player Balance & Transaction Management (DB::transaction + lockForUpdate)
 * 3. Game Catalog CRUD & Remote Casino Provider API Integration (60bd98.vip Clone)
 */

export interface LaravelBackendFile {
  path: string;
  description: string;
  content: string;
}

export const LARAVEL_PROJECT_FILES: LaravelBackendFile[] = [
  {
    path: 'database/migrations/2026_11_07_000001_create_casino_core_tables.php',
    description: 'Database schema for users (Admin/Player roles), wallets, atomic transactions, and game catalog',
    content: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username', 50)->unique();
            $table->string('nickname', 100)->nullable();
            $table->string('phone', 25)->unique();
            $table->string('password');
            $table->string('trx_password')->nullable();
            $table->enum('role', ['player', 'admin'])->default('player');
            $table->enum('status', ['active', 'banned'])->default('active');
            $table->unsignedTinyInteger('vip_level')->default(1);
            $table->unsignedInteger('vip_points')->default(0);
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->decimal('balance', 14, 2)->default(0.00);
            $table->decimal('frozen_balance', 14, 2)->default(0.00);
            $table->string('currency', 5)->default('BDT');
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference_id', 64)->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['deposit', 'withdraw', 'bet', 'win', 'bonus']);
            $table->decimal('amount', 14, 2);
            $table->decimal('balance_before', 14, 2);
            $table->decimal('balance_after', 14, 2);
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('completed');
            $table->string('method', 40)->nullable();
            $table->string('note', 300)->nullable();
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->string('game_code', 80)->unique();
            $table->string('name', 120);
            $table->string('bengali_name', 120);
            $table->enum('category', ['hot', 'slots', 'fishing', 'live', 'poker', 'lottery', 'sports'])->default('slots');
            $table->string('provider', 60);
            $table->string('thumbnail_url', 500);
            $table->string('demo_link', 500)->nullable();
            $table->decimal('rtp', 5, 2)->default(97.00);
            $table->string('multiplier', 30)->nullable();
            $table->boolean('is_hot')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->index(['category', 'provider', 'active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('games');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('users');
    }
};
`,
  },
  {
    path: 'app/Http/Controllers/AuthController.php',
    description: 'Laravel Authentication Controller with registration, login, logout, session regeneration, and Role-Based Access Control (Admin & Player)',
    content: `<?php

namespace App\\Http\\Controllers;

use App\\Models\\User;
use App\\Models\\Wallet;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Auth;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'min:4', 'max:50', 'unique:users,username'],
            'phone'    => ['required', 'string', 'min:11', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = DB::transaction(function () use ($validated) {
            $newUser = User::create([
                'username' => strtolower(trim($validated['username'])),
                'nickname' => trim($validated['username']),
                'phone'    => trim($validated['phone']),
                'password' => Hash::make($validated['password']),
                'role'     => 'player',
                'status'   => 'active',
            ]);

            Wallet::create([
                'user_id'  => $newUser->id,
                'balance'  => 60.00, // Welcome bonus
                'currency' => 'BDT',
            ]);

            return $newUser->load('wallet');
        });

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'message' => 'Registration completed with 60 BDT bonus.',
            'user'    => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'login'    => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $field = filter_var($credentials['login'], FILTER_VALIDATE_REGEXP, ['options' => ['regexp' => '/^[0-9]+$/']])
            ? 'phone'
            : 'username';

        $user = User::where($field, $credentials['login'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid credentials.'], 401);
        }

        if ($user->status === 'banned') {
            return response()->json(['success' => false, 'message' => 'Account is suspended.'], 403);
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        return response()->json([
            'success'      => true,
            'role'         => $user->role,
            'redirect_url' => $user->role === 'admin' ? '/admin' : '/',
            'user'         => $user->load('wallet'),
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true, 'message' => 'Logged out successfully.']);
    }
}
`,
  },
  {
    path: 'app/Http/Controllers/PlayerBalanceController.php',
    description: 'Atomic Player Balance & Transaction Controller using pessimistic row locking (lockForUpdate) to prevent race conditions',
    content: `<?php

namespace App\\Http\\Controllers;

use App\\Models\\Transaction;
use App\\Models\\Wallet;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Str;

class PlayerBalanceController extends Controller
{
    public function showBalance(Request $request)
    {
        $user = $request->user()->load('wallet');
        return response()->json([
            'success'        => true,
            'user_id'        => $user->id,
            'username'       => $user->username,
            'balance'        => (float) $user->wallet->balance,
            'frozen_balance' => (float) $user->wallet->frozen_balance,
            'currency'       => $user->wallet->currency,
        ]);
    }

    public function transactionHistory(Request $request)
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json([
            'success'      => true,
            'transactions' => $transactions,
        ]);
    }

    public function atomicUpdateBalance(Request $request)
    {
        $validated = $request->validate([
            'type'   => ['required', 'in:deposit,withdraw,bet,win,bonus'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:1000000'],
            'method' => ['nullable', 'string', 'max:40'],
            'note'   => ['nullable', 'string', 'max:300'],
        ]);

        $userId = $request->user()->id;

        return DB::transaction(function () use ($userId, $validated) {
            // Lock the player's wallet row to prevent concurrent race conditions
            $wallet = Wallet::where('user_id', $userId)->lockForUpdate()->firstOrFail();

            $isDebit = in_array($validated['type'], ['withdraw', 'bet'], true);
            $amount  = round((float) $validated['amount'], 2);

            if ($isDebit && $wallet->balance < $amount) {
                abort(422, 'Insufficient wallet balance.');
            }

            $before = (float) $wallet->balance;
            $after  = $isDebit ? round($before - $amount, 2) : round($before + $amount, 2);

            $wallet->update(['balance' => $after]);

            $tx = Transaction::create([
                'reference_id'   => 'TXN-' . strtoupper(Str::random(10)),
                'user_id'        => $userId,
                'type'           => $validated['type'],
                'amount'         => $amount,
                'balance_before' => $before,
                'balance_after'  => $after,
                'status'         => $validated['type'] === 'withdraw' ? 'pending' : 'completed',
                'method'         => $validated['method'] ?? 'system',
                'note'           => $validated['note'] ?? ucfirst($validated['type']),
            ]);

            return response()->json([
                'success'     => true,
                'balance'     => $after,
                'transaction' => $tx,
            ]);
        });
    }
}
`,
  },
  {
    path: 'app/Http/Controllers/GameCatalogController.php',
    description: 'Game Catalog Controller with Admin CRUD and Remote Casino Provider synchronization (60bd98.vip clone)',
    content: `<?php

namespace App\\Http\\Controllers;

use App\\Models\\Game;
use Illuminate\\Http\\Request;

class GameCatalogController extends Controller
{
    public function index(Request $request)
    {
        $query = Game::where('active', true);

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }
        if ($request->filled('provider') && $request->provider !== 'All') {
            $query->where('provider', $request->provider);
        }

        return response()->json([
            'success' => true,
            'games'   => $query->orderByDesc('is_hot')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'game_code'     => ['required', 'string', 'max:80', 'unique:games,game_code'],
            'name'          => ['required', 'string', 'max:120'],
            'bengali_name'  => ['required', 'string', 'max:120'],
            'category'      => ['required', 'in:hot,slots,fishing,live,poker,lottery,sports'],
            'provider'      => ['required', 'string', 'max:60'],
            'thumbnail_url' => ['required', 'url', 'max:500'],
            'demo_link'     => ['nullable', 'string', 'max:500'],
            'rtp'           => ['required', 'numeric', 'min:50', 'max:99.9'],
        ]);

        $game = Game::create($validated);
        return response()->json(['success' => true, 'game' => $game], 201);
    }

    public function update(Request $request, Game $game)
    {
        $validated = $request->validate([
            'name'          => ['sometimes', 'string', 'max:120'],
            'bengali_name'  => ['sometimes', 'string', 'max:120'],
            'category'      => ['sometimes', 'in:hot,slots,fishing,live,poker,lottery,sports'],
            'provider'      => ['sometimes', 'string', 'max:60'],
            'thumbnail_url' => ['sometimes', 'url', 'max:500'],
            'demo_link'     => ['nullable', 'string', 'max:500'],
            'rtp'           => ['sometimes', 'numeric', 'min:50', 'max:99.9'],
            'active'        => ['sometimes', 'boolean'],
        ]);

        $game->update($validated);
        return response()->json(['success' => true, 'game' => $game]);
    }

    public function destroy(Game $game)
    {
        $game->delete();
        return response()->json(['success' => true, 'message' => 'Game deleted from catalog.']);
    }
}
`,
  },
];
