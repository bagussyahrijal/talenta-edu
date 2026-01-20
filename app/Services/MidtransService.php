<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$clientKey = config('midtrans.client_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * Create Snap transaction
     */
    public function createTransaction($params)
    {
        try {

            $snapToken = Snap::getSnapToken($params);
            return [
                'success' => true,
                'snap_token' => $snapToken,
                'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/' . $snapToken
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Get transaction status
     */
    public function getTransactionStatus($orderId)
    {
        try {
            $status = Transaction::status($orderId);
            return $status;
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * Cancel transaction
     */
    public function cancelTransaction($orderId)
    {
        try {
            $cancel = Transaction::cancel($orderId);
            return $cancel;
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * Get available payment methods
     */
    public function getPaymentChannels()
    {
        // Midtrans payment channels
        return [
            [
                'code' => 'credit_card',
                'name' => 'Credit Card',
                'group' => 'Virtual Account',
                'icon_url' => '/assets/payment-icons/credit-card.png',
                'type' => 'online',
                'active' => true,
                'fee_customer' => ['flat' => 0, 'percent' => 0],
                'minimum_amount' => 10000,
                'maximum_amount' => 500000000
            ],
            [
                'code' => 'bca_va',
                'name' => 'BCA Virtual Account',
                'group' => 'Virtual Account',
                'icon_url' => '/assets/payment-icons/bca.png',
                'type' => 'online',
                'active' => true,
                'fee_customer' => ['flat' => 4000, 'percent' => 0],
                'minimum_amount' => 10000,
                'maximum_amount' => 50000000
            ],
            [
                'code' => 'bni_va',
                'name' => 'BNI Virtual Account',
                'group' => 'Virtual Account',
                'icon_url' => '/assets/payment-icons/bni.png',
                'type' => 'online',
                'active' => true,
                'fee_customer' => ['flat' => 4000, 'percent' => 0],
                'minimum_amount' => 10000,
                'maximum_amount' => 50000000
            ],
            [
                'code' => 'bri_va',
                'name' => 'BRI Virtual Account',
                'group' => 'Virtual Account',
                'icon_url' => '/assets/payment-icons/bri.png',
                'type' => 'online',
                'active' => true,
                'fee_customer' => ['flat' => 4000, 'percent' => 0],
                'minimum_amount' => 10000,
                'maximum_amount' => 50000000
            ],
            [
                'code' => 'mandiri_va',
                'name' => 'Mandiri Virtual Account',
                'group' => 'Virtual Account',
                'icon_url' => '/assets/payment-icons/mandiri.png',
                'type' => 'online',
                'active' => true,
                'fee_customer' => ['flat' => 4000, 'percent' => 0],
                'minimum_amount' => 10000,
                'maximum_amount' => 50000000
            ],
            [
                'code' => 'permata_va',
                'name' => 'Permata Virtual Account',
                'group' => 'Virtual Account',
                'icon_url' => '/assets/payment-icons/permata.png',
                'type' => 'online',
                'active' => true,
                'fee_customer' => ['flat' => 4000, 'percent' => 0],
                'minimum_amount' => 10000,
                'maximum_amount' => 50000000
            ],
            [
                'code' => 'gopay',
                'name' => 'GoPay',
                'group' => 'E-Wallet',
                'icon_url' => '/assets/payment-icons/gopay.png',
                'type' => 'online',
                'active' => true,
                'fee_customer' => ['flat' => 0, 'percent' => 2],
                'minimum_amount' => 1000,
                'maximum_amount' => 10000000
            ],
            [
                'code' => 'shopeepay',
                'name' => 'ShopeePay',
                'group' => 'E-Wallet',
                'icon_url' => '/assets/payment-icons/shopeepay.png',
                'type' => 'online',
                'active' => true,
                'fee_customer' => ['flat' => 0, 'percent' => 2],
                'minimum_amount' => 1000,
                'maximum_amount' => 10000000
            ],
            [
                'code' => 'qris',
                'name' => 'QRIS',
                'group' => 'E-Wallet',
                'icon_url' => '/assets/payment-icons/qris.png',
                'type' => 'online',
                'active' => true,
                'fee_customer' => ['flat' => 0, 'percent' => 0.7],
                'minimum_amount' => 1500,
                'maximum_amount' => 10000000
            ],
            [
                'code' => 'indomaret',
                'name' => 'Indomaret',
                'group' => 'Retail',
                'icon_url' => '/assets/payment-icons/indomaret.png',
                'type' => 'offline',
                'active' => true,
                'fee_customer' => ['flat' => 5000, 'percent' => 0],
                'minimum_amount' => 10000,
                'maximum_amount' => 5000000
            ],
            [
                'code' => 'alfamart',
                'name' => 'Alfamart',
                'group' => 'Retail',
                'icon_url' => '/assets/payment-icons/alfamart.png',
                'type' => 'offline',
                'active' => true,
                'fee_customer' => ['flat' => 5000, 'percent' => 0],
                'minimum_amount' => 10000,
                'maximum_amount' => 5000000
            ]
        ];
    }
}