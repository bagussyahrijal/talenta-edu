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

        $referrer = User::where('referral_code', $code)
            ->orWhere('affiliate_code', $code)
            ->first();

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
