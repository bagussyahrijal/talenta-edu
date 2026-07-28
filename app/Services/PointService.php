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
