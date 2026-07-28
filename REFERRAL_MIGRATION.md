# Panduan Migrasi Fitur Referral — Aksara → Talenta

> **Konteks:** Fitur referral di aksara-edu menggunakan prefix `AKSA-` dan default code `ATM2025`, serta payment gateway **Xendit**.
> Di talenta-edu, prefix diganti menjadi `TALE-`, default code `TAL2025`, dan payment gateway adalah **Midtrans**.
>
> Talenta sudah memiliki beberapa infrastruktur partial (kolom `referred_by_user_id` di invoices, referral session di Auth controllers).
> File ini mencakup semua perubahan yang perlu dilakukan agar fitur berjalan penuh.

---

## Daftar Perubahan

| # | Kategori | File | Aksi |
|---|---|---|---|
| 1 | Migration | `users` table | Tambah kolom `referral_code` & `point_balance` |
| 2 | Migration | `invoices` table | Sudah ada `referred_by_user_id` — tidak perlu tambah |
| 3 | Migration | Baru: `point_transactions` | Buat tabel |
| 4 | Migration | Baru: `settings` | Buat tabel dengan seed default |
| 5 | Model | `User` | Aktifkan kolom + relasi + auto-generate referral_code |
| 6 | Model | `Invoice` | Tambah relasi `referralUser()` |
| 7 | Model | Baru: `PointTransaction` | Buat model |
| 8 | Model | Baru: `Setting` | Buat model |
| 9 | Service | Baru: `ReferralService` | Buat service validasi kode |
| 10 | Service | Baru: `RewardService` | Buat service proses reward |
| 11 | Service | Baru: `PointService` | Buat service manajemen poin |
| 12 | Event | Baru: `TransactionPaid` | Buat event |
| 13 | Listener | Baru: `RewardReferralListener` | Buat listener |
| 14 | Controller | Baru: `ReferralController` | Endpoint validate & get points |
| 15 | Controller | Baru: `Admin/ReferralAdminController` | Panel admin referral |
| 16 | Controller | `MidtransCallbackController` | Dispatch event `TransactionPaid` saat paid |
| 17 | Controller | `User/Profile/ProfileController` | Tambah method `referral()` |
| 18 | Console | Baru: `GenerateReferralCodes` | Command generate kode existing users |
| 19 | Provider | `AppServiceProvider` | Daftarkan event listener |
| 20 | Routes | `web.php` | Tambah route referral (user & admin) |

---

## 1. Migrations

### 1a. Tambah kolom ke `users` table

Buat file: `database/migrations/2026_07_28_000001_add_referral_columns_to_users_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('referral_code')->nullable()->unique()->after('id');
            $table->bigInteger('point_balance')->default(0)->after('referral_code');
            $table->foreignUuid('referred_by_user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null')
                  ->after('point_balance');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['referred_by_user_id']);
            $table->dropColumn(['referral_code', 'point_balance', 'referred_by_user_id']);
        });
    }
};
```

> CATATAN: Kolom `referred_by_user_id` di tabel `users` sudah dikomentari di migration asal talenta.
> Migration ini mengaktifkannya. Pastikan tidak ada konflik dengan data existing.

### 1b. Buat tabel `point_transactions`

Buat file: `database/migrations/2026_07_28_000003_create_point_transactions_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->string('type');           // reward, redeem, adjustment
            $table->string('source');         // referral, checkout, admin
            $table->bigInteger('amount');     // positif (tambah) atau negatif (kurang)
            $table->text('description');
            $table->string('reference_type')->nullable();
            $table->string('reference_id')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'type']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_transactions');
    }
};
```

### 1c. Buat tabel `settings`

Buat file: `database/migrations/2026_07_28_000004_create_settings_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        DB::table('settings')->insert([
            ['key' => 'referral_reward',              'value' => '5000', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'buyer_reward',                 'value' => '2000', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'referral_only_first_purchase', 'value' => 'true', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
```

---

## 2. Models

### 2a. `app/Models/User.php` — REPLACE SELURUH FILE

```php
<?php

namespace App\Models;

use App\Notifications\CustomResetPasswordNotification;
use App\Notifications\CustomVerifyEmailNotification;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids, HasRoles;

    protected $fillable = [
        'google_id',
        'github_id',
        'referred_by_user_id',
        'name',
        'email',
        'phone_number',
        'instance',
        'bio',
        'password',
        'affiliate_code',
        'affiliate_status',
        'commission',
        'avatar',
        'email_verified_at',
        'referral_code',
        'point_balance',
    ];

    /**
     * Auto-generate referral code TALE-XXXXXX saat user baru dibuat.
     */
    protected static function booted()
    {
        static::creating(function ($user) {
            if (empty($user->referral_code)) {
                do {
                    $code = 'TALE-' . strtoupper(\Illuminate\Support\Str::random(6));
                } while (static::where('referral_code', $code)->exists());
                $user->referral_code = $code;
            }
        });
    }

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    public function getUserPermissions()
    {
        return $this->getAllPermissions()->mapWithKeys(fn($permission) => [$permission['name'] => true]);
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPasswordNotification($token));
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmailNotification());
    }

    // Relasi Referral
    public function referrer()
    {
        return $this->belongsTo(User::class, 'referred_by_user_id');
    }

    public function referredInvoices()
    {
        return $this->hasMany(Invoice::class, 'referred_by_user_id');
    }

    public function pointTransactions()
    {
        return $this->hasMany(PointTransaction::class);
    }

    // Relasi Existing
    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function bootcamps()
    {
        return $this->belongsToMany(Bootcamp::class, 'bootcamp_mentors', 'user_id', 'bootcamp_id')->withTimestamps();
    }

    public function webinars()
    {
        return $this->hasMany(Webinar::class);
    }

    public function certificationPrograms()
    {
        return $this->belongsToMany(CertificationProgram::class, 'certification_program_mentors', 'user_id', 'certification_program_id')->withTimestamps();
    }

    public function articles()
    {
        return $this->hasMany(Article::class);
    }

    public function affiliateEarnings()
    {
        return $this->hasMany(AffiliateEarning::class, 'affiliate_user_id');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function courseEnrollments()
    {
        return $this->hasManyThrough(EnrollmentCourse::class, Invoice::class, 'user_id', 'invoice_id', 'id', 'id');
    }

    public function bootcampEnrollments()
    {
        return $this->hasManyThrough(EnrollmentBootcamp::class, Invoice::class, 'user_id', 'invoice_id', 'id', 'id');
    }

    public function webinarEnrollments()
    {
        return $this->hasManyThrough(EnrollmentWebinar::class, Invoice::class, 'user_id', 'invoice_id', 'id', 'id');
    }

    public function certificationProgramEnrollments()
    {
        return $this->hasManyThrough(EnrollmentCertificationProgram::class, Invoice::class, 'user_id', 'invoice_id', 'id', 'id');
    }
}
```

---

### 2b. `app/Models/Invoice.php` — tambahkan method ini

```php
// Tambahkan ke dalam class Invoice yang sudah ada

/**
 * User yang mereferensikan pembelian ini (alias untuk referred_by_user_id).
 * Di talenta kolom bernama 'referred_by_user_id'.
 */
public function referralUser()
{
    return $this->belongsTo(User::class, 'referred_by_user_id');
}
```

---

### 2c. Buat `app/Models/PointTransaction.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PointTransaction extends Model
{
    use HasUuids;

    protected $guarded = ['created_at', 'updated_at'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reference()
    {
        return $this->morphTo();
    }
}
```

---

### 2d. Buat `app/Models/Setting.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $primaryKey = 'key';
    public $incrementing  = false;
    protected $keyType    = 'string';
    protected $fillable   = ['key', 'value'];

    public static function get(string $key, $default = null)
    {
        $setting = self::find($key);
        if (!$setting) return $default;

        $value = $setting->value;
        if ($value === 'true')  return true;
        if ($value === 'false') return false;
        if (is_numeric($value)) {
            return strpos($value, '.') !== false ? (float)$value : (int)$value;
        }
        return $value;
    }

    public static function set(string $key, $value)
    {
        if (is_bool($value)) $value = $value ? 'true' : 'false';
        return self::updateOrCreate(['key' => $key], ['value' => (string)$value]);
    }
}
```

---

## 3. Services

### 3a. Buat `app/Services/ReferralService.php`

```php
<?php

namespace App\Services;

use App\Models\User;
use App\Models\Invoice;
use App\Models\Setting;

class ReferralService
{
    public function validateReferralCode(string $code, ?string $email = null, ?User $user = null): array
    {
        $code = strtoupper(trim($code));

        if (empty($code)) {
            return ['valid' => false, 'message' => 'Kode referral tidak boleh kosong.', 'referrer' => null];
        }

        $referrer = User::where('referral_code', $code)->first();

        if (!$referrer) {
            return ['valid' => false, 'message' => 'Kode referral tidak ditemukan.', 'referrer' => null];
        }

        if (!$user && !empty($email)) {
            $user = User::where('email', $email)->first();
        }

        if ($user) {
            if ($referrer->id === $user->id) {
                return ['valid' => false, 'message' => 'Anda tidak bisa menggunakan kode referral Anda sendiri.', 'referrer' => null];
            }

            if (Setting::get('referral_only_first_purchase', true)) {
                $hasPaidInvoice = Invoice::where('user_id', $user->id)->where('status', 'paid')->exists();
                if ($hasPaidInvoice) {
                    return ['valid' => false, 'message' => 'Referral hanya berlaku untuk pembelian pertama Anda.', 'referrer' => null];
                }
            }
        } else {
            if ($email && strtolower(trim($email)) === strtolower($referrer->email)) {
                return ['valid' => false, 'message' => 'Anda tidak bisa menggunakan kode referral Anda sendiri.', 'referrer' => null];
            }
        }

        return ['valid' => true, 'message' => 'Kode referral valid.', 'referrer' => $referrer];
    }
}
```

---

### 3b. Buat `app/Services/PointService.php`

```php
<?php

namespace App\Services;

use App\Models\User;
use App\Models\Invoice;
use App\Models\PointTransaction;
use Illuminate\Support\Facades\DB;

class PointService
{
    public function addTransaction(
        User $user,
        int $amount,
        string $type,
        string $source,
        string $description,
        ?string $referenceType = null,
        ?string $referenceId = null
    ): PointTransaction {
        return DB::transaction(function () use ($user, $amount, $type, $source, $description, $referenceType, $referenceId) {
            $lockedUser = User::where('id', $user->id)->lockForUpdate()->first();
            if (!$lockedUser) throw new \Exception('User tidak ditemukan saat memproses transaksi poin.');

            $newBalance = $lockedUser->point_balance + $amount;
            if ($newBalance < 0) throw new \Exception('Saldo poin tidak mencukupi untuk melakukan transaksi ini.');

            $lockedUser->update(['point_balance' => $newBalance]);
            $user->point_balance = $newBalance;

            return PointTransaction::create([
                'user_id'        => $lockedUser->id,
                'type'           => $type,
                'source'         => $source,
                'amount'         => $amount,
                'description'    => $description,
                'reference_type' => $referenceType,
                'reference_id'   => $referenceId,
            ]);
        });
    }

    public function redeemPoints(User $user, int $amount, Invoice $invoice): PointTransaction
    {
        return $this->addTransaction(
            $user, -$amount, 'redeem', 'checkout',
            "Penggunaan poin sebagai potongan harga invoice {$invoice->invoice_code}",
            Invoice::class, $invoice->id
        );
    }

    public function refundPoints(Invoice $invoice): ?PointTransaction
    {
        return DB::transaction(function () use ($invoice) {
            $deduction = PointTransaction::where('user_id', $invoice->user_id)
                ->where('reference_type', Invoice::class)->where('reference_id', $invoice->id)
                ->where('type', 'redeem')->where('amount', '<', 0)->first();

            if (!$deduction) return null;
            $refundAmount = abs($deduction->amount);

            $alreadyRefunded = PointTransaction::where('user_id', $invoice->user_id)
                ->where('reference_type', Invoice::class)->where('reference_id', $invoice->id)
                ->where('type', 'adjustment')->where('amount', '>', 0)
                ->where('description', 'like', '%Pengembalian poin%')->exists();

            if ($alreadyRefunded) return null;

            $user = User::find($invoice->user_id);
            if (!$user) return null;

            return $this->addTransaction(
                $user, $refundAmount, 'adjustment', 'checkout',
                "Pengembalian poin karena pembatalan/kadaluarsa invoice {$invoice->invoice_code}",
                Invoice::class, $invoice->id
            );
        });
    }

    public function adjustPoints($userId, int $amount, string $source, string $description): PointTransaction
    {
        $user = User::findOrFail($userId);
        return $this->addTransaction($user, $amount, 'adjustment', $source, $description);
    }
}
```

---

### 3c. Buat `app/Services/RewardService.php`

```php
<?php

namespace App\Services;

use App\Models\User;
use App\Models\Invoice;
use App\Models\Setting;
use App\Models\PointTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RewardService
{
    protected $pointService;

    public function __construct(PointService $pointService)
    {
        $this->pointService = $pointService;
    }

    /**
     * Proses reward referral setelah pembayaran berhasil.
     * Di talenta kolom referral di invoice bernama 'referred_by_user_id'.
     */
    public function processReferralReward(Invoice $invoice): void
    {
        Log::info('processReferralReward started', [
            'invoice_code'        => $invoice->invoice_code,
            'status'              => $invoice->status,
            'referred_by_user_id' => $invoice->referred_by_user_id,
        ]);

        DB::transaction(function () use ($invoice) {
            if ($invoice->status !== 'paid') {
                Log::warning('processReferralReward skipped: not paid', ['invoice_code' => $invoice->invoice_code]);
                return;
            }

            if (!$invoice->referred_by_user_id) {
                Log::warning('processReferralReward skipped: no referred_by_user_id', ['invoice_code' => $invoice->invoice_code]);
                return;
            }

            $rewardExists = PointTransaction::where('reference_type', Invoice::class)
                ->where('reference_id', $invoice->id)->where('source', 'referral')->exists();

            if ($rewardExists) {
                Log::info('Referral reward already processed', ['invoice_code' => $invoice->invoice_code]);
                return;
            }

            $buyer    = User::find($invoice->user_id);
            $referrer = User::find($invoice->referred_by_user_id);

            if (!$buyer || !$referrer) {
                Log::error('processReferralReward: buyer or referrer not found', [
                    'buyer_id'    => $invoice->user_id,
                    'referrer_id' => $invoice->referred_by_user_id,
                ]);
                return;
            }

            $onlyFirstPurchase = Setting::get('referral_only_first_purchase', true);
            if ($onlyFirstPurchase) {
                $paidInvoicesCount = Invoice::where('user_id', $buyer->id)->where('status', 'paid')->count();
                if ($paidInvoicesCount > 1) {
                    Log::info('Referral reward skipped: not first purchase', ['buyer_id' => $buyer->id]);
                    return;
                }
            }

            if (empty($buyer->referred_by_user_id)) {
                $buyer->update(['referred_by_user_id' => $referrer->id]);
            }

            $referrerRewardAmount = (int) Setting::get('referral_reward', 5000);
            $buyerRewardAmount    = (int) Setting::get('buyer_reward', 2000);

            if ($referrerRewardAmount > 0) {
                $this->pointService->addTransaction(
                    $referrer, $referrerRewardAmount, 'reward', 'referral',
                    "Bonus referral dari pembelian pertama oleh {$buyer->name}",
                    Invoice::class, $invoice->id
                );
            }

            if ($buyerRewardAmount > 0) {
                $this->pointService->addTransaction(
                    $buyer, $buyerRewardAmount, 'reward', 'referral',
                    "Bonus pembelian menggunakan kode referral dari {$referrer->name}",
                    Invoice::class, $invoice->id
                );
            }

            Log::info('Referral reward processed successfully', [
                'invoice_code' => $invoice->invoice_code,
                'referrer'     => $referrer->name,
                'buyer'        => $buyer->name,
            ]);
        });
    }
}
```

---

## 4. Events & Listeners

### 4a. Buat `app/Events/TransactionPaid.php`

```php
<?php

namespace App\Events;

use App\Models\Invoice;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TransactionPaid
{
    use Dispatchable, SerializesModels;

    public $invoice;

    public function __construct(Invoice $invoice)
    {
        $this->invoice = $invoice;
    }
}
```

---

### 4b. Buat `app/Listeners/RewardReferralListener.php`

```php
<?php

namespace App\Listeners;

use App\Events\TransactionPaid;
use App\Services\RewardService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class RewardReferralListener implements ShouldQueue
{
    use InteractsWithQueue;

    protected $rewardService;

    public function __construct(RewardService $rewardService)
    {
        $this->rewardService = $rewardService;
    }

    public function handle(TransactionPaid $event): void
    {
        Log::info('RewardReferralListener triggered', [
            'invoice_code'        => $event->invoice->invoice_code,
            'referred_by_user_id' => $event->invoice->referred_by_user_id,
        ]);

        try {
            $this->rewardService->processReferralReward($event->invoice);
        } catch (\Exception $e) {
            Log::error('Gagal memproses reward referral', [
                'invoice_code' => $event->invoice->invoice_code,
                'error'        => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
```

---

## 5. Controllers

### 5a. Buat `app/Http/Controllers/ReferralController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Services\ReferralService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReferralController extends Controller
{
    protected $referralService;

    public function __construct(ReferralService $referralService)
    {
        $this->referralService = $referralService;
    }

    public function validateCode(Request $request)
    {
        $request->validate([
            'code'  => 'required|string',
            'email' => 'nullable|email',
        ]);

        $user  = Auth::user();
        $email = $request->input('email');

        if ($user && !$email) {
            $email = $user->email;
        }

        $result = $this->referralService->validateReferralCode($request->code, $email, $user);
        return response()->json($result);
    }

    public function getPoints(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['point_balance' => 0], 401);
        }
        return response()->json(['point_balance' => (int) $user->point_balance]);
    }
}
```

---

### 5b. Buat `app/Http/Controllers/Admin/ReferralAdminController.php`

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PointTransaction;
use App\Models\Setting;
use App\Services\PointService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReferralAdminController extends Controller
{
    protected $pointService;

    public function __construct(PointService $pointService)
    {
        $this->pointService = $pointService;
    }

    public function settings()
    {
        return Inertia::render('admin/referral/settings', [
            'settings' => [
                'referral_reward'              => (int) Setting::get('referral_reward', 5000),
                'buyer_reward'                 => (int) Setting::get('buyer_reward', 2000),
                'referral_only_first_purchase' => (bool) Setting::get('referral_only_first_purchase', true),
            ],
        ]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'referral_reward'              => 'required|integer|min:0',
            'buyer_reward'                 => 'required|integer|min:0',
            'referral_only_first_purchase' => 'required|boolean',
        ]);

        Setting::set('referral_reward', $request->referral_reward);
        Setting::set('buyer_reward', $request->buyer_reward);
        Setting::set('referral_only_first_purchase', $request->referral_only_first_purchase);

        return redirect()->back()->with('success', 'Pengaturan referral berhasil diperbarui.');
    }

    public function report()
    {
        $referrers = User::whereHas('referredInvoices', function ($query) {
                $query->where('status', 'paid');
            })
            ->withCount(['referredInvoices as referrals_count' => function ($query) {
                $query->where('status', 'paid');
            }])
            ->orderBy('referrals_count', 'desc')
            ->paginate(15);

        return Inertia::render('admin/referral/report', ['referrers' => $referrers]);
    }

    public function transactions(Request $request)
    {
        $query = PointTransaction::with('user');

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            });
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate(15);
        $users = User::select('id', 'name', 'email', 'point_balance')->orderBy('name')->limit(200)->get();

        return Inertia::render('admin/referral/transactions', [
            'transactions' => $transactions,
            'users'        => $users,
            'filters'      => $request->only(['search']),
        ]);
    }

    public function adjustPoints(Request $request)
    {
        $request->validate([
            'user_id'     => 'required|string',
            'amount'      => 'required|integer',
            'description' => 'required|string|max:255',
        ]);

        try {
            $user = User::where('id', $request->user_id)
                ->orWhere('name', $request->user_id)
                ->orWhere('email', $request->user_id)
                ->first();

            if (!$user) {
                return redirect()->back()->withErrors(['user_id' => 'Pengguna tidak ditemukan.']);
            }

            if ($request->amount < 0 && $user->point_balance < abs($request->amount)) {
                return redirect()->back()->withErrors(['amount' => 'Saldo poin tidak mencukupi.']);
            }

            $this->pointService->adjustPoints($user->id, $request->amount, 'manual_adjustment', $request->description);
            return redirect()->back()->with('success', 'Saldo poin berhasil disesuaikan secara manual.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal menyesuaikan poin: ' . $e->getMessage()]);
        }
    }
}
```

---

### 5c. `app/Http/Controllers/MidtransCallbackController.php` — TAMBAHKAN

Di baris atas, tambahkan use statement:

```php
use App\Events\TransactionPaid;
```

Di method `processPaymentSuccess()`, tambahkan di baris paling akhir sebelum penutup `}`:

```php
// Dispatch event untuk proses reward referral (di bagian akhir processPaymentSuccess)
event(new TransactionPaid($invoice));
```

Contoh method lengkap setelah modifikasi:

```php
private function processPaymentSuccess($invoice, $request)
{
    // ... kode existing ...

    $this->processInvoiceEnrollments($invoice);
    $this->recordAffiliateCommission($invoice);
    $this->sendEmailNotification($invoice);
    $this->sendWhatsAppNotification($invoice);

    // BARU: Dispatch event untuk reward referral
    event(new \App\Events\TransactionPaid($invoice));
}
```

---

### 5d. `app/Http/Controllers/User/Profile/ProfileController.php` — TAMBAHKAN

Tambahkan method ini di akhir class:

```php
public function referral()
{
    $user   = Auth::user();
    $userId = $user->id;

    $transactions = \App\Models\PointTransaction::where('user_id', $userId)
        ->orderBy('created_at', 'desc')
        ->get();

    // Di talenta menggunakan 'referred_by_user_id'
    $totalReferralsCount = \App\Models\Invoice::where('referred_by_user_id', $userId)
        ->where('status', 'paid')
        ->count();

    $totalPointsEarned = \App\Models\PointTransaction::where('user_id', $userId)
        ->where('amount', '>', 0)
        ->sum('amount');

    return Inertia::render('user/profile/referral', [
        'referralCode'   => $user->referral_code,
        'pointBalance'   => (int) $user->point_balance,
        'totalReferrals' => $totalReferralsCount,
        'totalEarned'    => (int) $totalPointsEarned,
        'transactions'   => $transactions,
    ]);
}
```

---

## 6. Console Command

### Buat `app/Console/Commands/GenerateReferralCodes.php`

```php
<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateReferralCodes extends Command
{
    protected $signature = 'app:generate-referral-codes';

    protected $description = 'Generate unique referral codes (TALE-XXXXXX) for existing users without one';

    public function handle()
    {
        $users = User::whereNull('referral_code')->get();
        $count = $users->count();

        if ($count === 0) {
            $this->info('Semua user sudah memiliki referral code.');
            return 0;
        }

        $this->info("Menghasilkan referral code untuk {$count} user...");
        $bar = $this->output->createProgressBar($count);
        $bar->start();

        foreach ($users as $user) {
            do {
                $code = 'TALE-' . strtoupper(Str::random(6));
            } while (User::where('referral_code', $code)->exists());

            $user->update(['referral_code' => $code]);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Berhasil membuat referral code untuk {$count} user.");

        return 0;
    }
}
```

---

## 7. AppServiceProvider

### `app/Providers/AppServiceProvider.php` — UPDATE method `boot()`

```php
public function boot(): void
{
    // ... kode existing tetap ...

    // TAMBAHKAN: Daftarkan event listener reward referral
    \Illuminate\Support\Facades\Event::listen(
        \App\Events\TransactionPaid::class,
        \App\Listeners\RewardReferralListener::class
    );
}
```

---

## 8. Routes (`routes/web.php`)

### Tambah di luar middleware (sebelum `require __DIR__ . '/settings.php'`):

```php
Route::post('/api/referral/validate', [App\Http\Controllers\ReferralController::class, 'validateCode'])
    ->name('api.referral.validate');
```

### Tambah di dalam `Route::middleware(['auth'])->group`:

```php
Route::get('/profile/referral', [ProfileController::class, 'referral'])
    ->name('profile.referral');

Route::get('/api/user/points', [App\Http\Controllers\ReferralController::class, 'getPoints'])
    ->name('api.user.points');
```

### Tambah di dalam `Route::middleware(['role:admin'])->group`:

```php
// Referral & Reward point admin routes
Route::get('referral/settings', [App\Http\Controllers\Admin\ReferralAdminController::class, 'settings'])
    ->name('admin.referral.settings');
Route::post('referral/settings', [App\Http\Controllers\Admin\ReferralAdminController::class, 'updateSettings'])
    ->name('admin.referral.settings.update');
Route::get('referral/report', [App\Http\Controllers\Admin\ReferralAdminController::class, 'report'])
    ->name('admin.referral.report');
Route::get('referral/transactions', [App\Http\Controllers\Admin\ReferralAdminController::class, 'transactions'])
    ->name('admin.referral.transactions');
Route::post('referral/adjust-points', [App\Http\Controllers\Admin\ReferralAdminController::class, 'adjustPoints'])
    ->name('admin.referral.adjust-points');
```

---

## 9. Auth Controllers — Sudah OK

| File | Status |
|---|---|
| `Auth/RegisteredUserController.php` | Sudah gunakan `TAL2025`, session referral sudah benar |
| `Auth/SocialiteController.php` | Sudah gunakan `TAL2025` dan `referred_by_user_id` |

Tidak perlu diubah.

---

## 10. Tabel Perbedaan Aksara vs Talenta

| Aspek | Aksara | Talenta |
|---|---|---|
| Prefix referral code | `AKSA-XXXXXX` | `TALE-XXXXXX` |
| Default affiliate code | `ATM2025` | `TAL2025` |
| Kolom referral di `invoices` | `referral_user_id` | `referred_by_user_id` |
| Payment gateway | Xendit | Midtrans |
| Trigger reward dari | `callbackXendit()` | `processPaymentSuccess()` di `MidtransCallbackController` |
| Kolom di `users` | Ada sejak awal | Perlu ditambah via migration |

---

## 11. Urutan Eksekusi

```bash
# 1. Jalankan migrations baru
php artisan migrate

# 2. Generate referral codes untuk user existing
php artisan app:generate-referral-codes

# 3. Pastikan queue worker berjalan (listener async)
php artisan queue:work

# 4. Clear cache
php artisan config:clear
php artisan cache:clear
```

---

## 12. Frontend / Inertia Views yang Perlu Dibuat

Salin dari aksara-edu dan ganti branding:

| View | Path di talenta |
|---|---|
| Halaman referral user | `resources/js/pages/user/profile/referral.tsx` |
| Halaman settings admin | `resources/js/pages/admin/referral/settings.tsx` |
| Halaman report admin | `resources/js/pages/admin/referral/report.tsx` |
| Halaman transactions admin | `resources/js/pages/admin/referral/transactions.tsx` |

Ganti semua teks "Aksara" → "Talenta" di dalam view.

---

## 13. Tests

Buat/sesuaikan test berikut (gunakan `referred_by_user_id`, bukan `referral_user_id`):

- `tests/Feature/ReferralTest.php`
- `tests/Unit/Services/ReferralServiceTest.php`
- `tests/Unit/Services/RewardServiceTest.php`
- `tests/Unit/Services/PointServiceTest.php`
