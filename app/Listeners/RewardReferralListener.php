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
