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
            'referral_user_id' => $invoice->referral_user_id,
        ]);

        DB::transaction(function () use ($invoice) {
            if ($invoice->status !== 'paid') {
                Log::warning('processReferralReward skipped: not paid', ['invoice_code' => $invoice->invoice_code]);
                return;
            }

            if (!$invoice->referral_user_id) {
                Log::warning('processReferralReward skipped: no referral_user_id', ['invoice_code' => $invoice->invoice_code]);
                return;
            }

            $rewardExists = PointTransaction::where('reference_type', Invoice::class)
                ->where('reference_id', $invoice->id)->where('source', 'referral')->exists();

            if ($rewardExists) {
                Log::info('Referral reward already processed', ['invoice_code' => $invoice->invoice_code]);
                return;
            }

            $buyer    = User::find($invoice->user_id);
            $referrer = User::find($invoice->referral_user_id);

            if (!$buyer || !$referrer) {
                Log::error('processReferralReward: buyer or referrer not found', [
                    'buyer_id'    => $invoice->user_id,
                    'referrer_id' => $invoice->referral_user_id,
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

            // NOTE: Kami tidak mengupdate referred_by_user_id di model User karena kolom tersebut ditiadakan pada model User sesuai feedback pengguna.

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
