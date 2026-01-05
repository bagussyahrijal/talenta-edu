<?php

namespace App\Services;

class TripayService
{
    private $apiKey;
    private $merchantCode;
    private $privateKey;
    private $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('tripay.API_KEY');
        $this->merchantCode = config('tripay.MERCHANT_CODE');
        $this->privateKey = config('tripay.PRIVATE_KEY');
        $this->baseUrl = config('tripay.api_url', 'https://tripay.co.id/api-sandbox');
    }

    public function getPaymentChannels()
    {
        try {
            $curl = curl_init();

            curl_setopt_array($curl, [
                CURLOPT_FRESH_CONNECT => true,
                CURLOPT_URL => $this->baseUrl . '/merchant/payment-channel',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HEADER => false,
                CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $this->apiKey],
                CURLOPT_FAILONERROR => false,
                CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
                CURLOPT_TIMEOUT => 30
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $error = curl_error($curl);

            curl_close($curl);

            if ($error) {
                throw new \Exception('Curl error: ' . $error);
            }

            $decodedResponse = json_decode($response);

            if ($httpCode !== 200 || !isset($decodedResponse->data)) {
                throw new \Exception('Failed to get payment channels');
            }

            return $decodedResponse->data;
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function requestTransaction($merchantRef, $method, $title, $amount, $customerName, $customerEmail)
    {
        try {
            $amount = (int)$amount;
            if ($amount <= 0) {
                throw new \Exception('Amount harus lebih dari 0');
            }

            $signatureData = $this->merchantCode . $merchantRef . $amount;
            $signature = hash_hmac('sha256', $signatureData, $this->privateKey);

            $postData = [
                'method' => $method,
                'merchant_ref' => $merchantRef,
                'amount' => $amount,
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
                'order_items' => [
                    [
                        'sku' => 'kompeten-' . $merchantRef,
                        'name' => $title,
                        'price' => $amount,
                        'quantity' => 1,
                    ]
                ],
                'callback_url' => route('tripay.callback'),
                'return_url' => config('app.url') . '/invoice/pending',
                'expired_time' => (time() + (24 * 60 * 60)),
                'signature' => $signature
            ];

            $curl = curl_init();

            curl_setopt_array($curl, [
                CURLOPT_FRESH_CONNECT => true,
                CURLOPT_URL => $this->baseUrl . '/transaction/create',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HEADER => false,
                CURLOPT_HTTPHEADER => [
                    'Authorization: Bearer ' . $this->apiKey,
                    'Content-Type: application/x-www-form-urlencoded'
                ],
                CURLOPT_FAILONERROR => false,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => http_build_query($postData),
                CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_SSL_VERIFYHOST => 2
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $error = curl_error($curl);

            curl_close($curl);

            if ($error) {
                throw new \Exception('Curl error: ' . $error);
            }

            $decodedResponse = json_decode($response);

            if ($httpCode !== 200) {
                throw new \Exception(
                    'Tripay API Error: ' . ($decodedResponse->message ?? 'HTTP ' . $httpCode)
                );
            }

            if (!isset($decodedResponse->success) || !$decodedResponse->success) {
                throw new \Exception($decodedResponse->message ?? 'Tripay request failed');
            }

            if (!isset($decodedResponse->data)) {
                throw new \Exception('Invalid response format from Tripay');
            }

            return $decodedResponse;
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function detailTransaction($reference)
    {
        try {
            $curl = curl_init();

            curl_setopt_array($curl, [
                CURLOPT_FRESH_CONNECT => true,
                CURLOPT_URL => $this->baseUrl . '/transaction/detail?reference=' . urlencode($reference),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HEADER => false,
                CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $this->apiKey],
                CURLOPT_FAILONERROR => false,
                CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
                CURLOPT_TIMEOUT => 30
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $error = curl_error($curl);

            curl_close($curl);

            if ($error) {
                throw new \Exception('Curl error: ' . $error);
            }

            $decodedResponse = json_decode($response);

            if ($httpCode !== 200 || !isset($decodedResponse->data)) {
                throw new \Exception('Failed to get transaction detail');
            }

            return $decodedResponse;
        } catch (\Exception $e) {
            throw $e;
        }
    }
}
