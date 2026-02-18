<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use App\Models\Invoice;
use App\Models\CertificateParticipant;
use App\Models\Certificate;
use App\Mail\SendEmail;
use App\Models\AffiliateEarning;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Traits\WablasTrait;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\MidtransService;

class MidtransCallbackController extends Controller
{
    use WablasTrait;

    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    public function handle(Request $request)
    {
        try {
            $serverKey = config('midtrans.server_key');
            $hashed = hash('sha512', $request->order_id . $request->status_code . $request->gross_amount . $serverKey);

            if ($hashed !== $request->signature_key) {
                return Response::json([
                    'success' => false,
                    'message' => 'Invalid signature',
                ], 401);
            }

            $orderId = $request->order_id;
            $transactionStatus = $request->transaction_status;
            $fraudStatus = $request->fraud_status ?? null;

            Log::info('Midtrans Callback Received', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
                'payment_type' => $request->payment_type ?? null,
            ]);

            DB::beginTransaction();
            try {
                $invoice = Invoice::where('invoice_code', $orderId)
                    ->where('status', 'pending')
                    ->first();

                if (!$invoice) {
                    DB::rollBack();
                    Log::warning('Invoice not found or already processed', [
                        'order_id' => $orderId
                    ]);
                    return Response::json([
                        'success' => false,
                        'message' => 'Invoice not found or already processed',
                    ], 404);
                }

                if ($transactionStatus == 'capture') {
                    if ($fraudStatus == 'accept') {
                        $this->processPaymentSuccess($invoice, $request);
                    } else {
                        Log::warning('Payment captured but fraud status not accepted', [
                            'order_id' => $orderId,
                            'fraud_status' => $fraudStatus
                        ]);
                    }
                } else if ($transactionStatus == 'settlement') {
                    $this->processPaymentSuccess($invoice, $request);
                } else if ($transactionStatus == 'pending') {
                    Log::info('Payment pending', ['invoice_code' => $orderId]);
                } else if ($transactionStatus == 'deny' || $transactionStatus == 'expire' || $transactionStatus == 'cancel') {
                    $invoice->update([
                        'status' => 'failed',
                    ]);
                    Log::info('Payment failed/expired/cancelled', [
                        'invoice_code' => $orderId,
                        'status' => $transactionStatus
                    ]);
                }

                DB::commit();

                return Response::json([
                    'success' => true,
                    'message' => 'Callback processed successfully',
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Midtrans callback processing error', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'order_id' => $orderId
                ]);

                return Response::json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Midtrans callback validation error', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);

            return Response::json([
                'success' => false,
                'message' => 'Invalid request',
            ], 400);
        }
    }

    private function processPaymentSuccess($invoice, $request)
    {
        // Ambil VA number dengan cara yang lebih aman
        $vaNumber = null;

        // Cek berbagai format VA number dari Midtrans
        if ($request->has('va_numbers') && is_array($request->va_numbers) && count($request->va_numbers) > 0) {
            $vaNumber = $request->va_numbers[0]['va_number'] ?? null;
        } elseif ($request->has('bill_key')) {
            // Untuk Mandiri Bill
            $vaNumber = $request->bill_key;
        } elseif ($request->has('permata_va_number')) {
            // Untuk Permata VA
            $vaNumber = $request->permata_va_number;
        }

        // Ambil payment channel
        $paymentChannel = $request->payment_type ?? $invoice->payment_channel;

        $invoice->update([
            'status' => 'paid',
            'paid_at' => Carbon::now('Asia/Jakarta'),
            'payment_reference' => $request->transaction_id ?? $request->order_id,
            'payment_channel' => $paymentChannel,
            'va_number' => $vaNumber,
        ]);

        Log::info('Payment processed successfully', [
            'invoice_code' => $invoice->invoice_code,
            'payment_type' => $paymentChannel,
            'transaction_id' => $request->transaction_id
        ]);

        $this->processInvoiceEnrollments($invoice);
        $this->recordAffiliateCommission($invoice);
        $this->sendEmailNotification($invoice);
    }

    private function processInvoiceEnrollments($invoice)
    {
        $invoice->loadMissing([
            'courseItems',
            'bootcampItems',
            'webinarItems',
            'bundleEnrollments.bundle.bundleItems.bundleable'
        ]);

        $userId = $invoice->user_id;

        if ($invoice->courseItems->count() > 0) {
            foreach ($invoice->courseItems as $item) {
                $item->update([
                    'completed_at' => Carbon::now('Asia/Jakarta')
                ]);

                $this->addToCertificateParticipants('course', $item->course_id, $userId);
            }
        }

        if ($invoice->bootcampItems->count() > 0) {
            foreach ($invoice->bootcampItems as $item) {
                $item->update([
                    'completed_at' => Carbon::now('Asia/Jakarta')
                ]);

                $this->addToCertificateParticipants('bootcamp', $item->bootcamp_id, $userId);
            }
        }

        if ($invoice->webinarItems->count() > 0) {
            foreach ($invoice->webinarItems as $item) {
                $item->update([
                    'completed_at' => Carbon::now('Asia/Jakarta')
                ]);

                $this->addToCertificateParticipants('webinar', $item->webinar_id, $userId);
            }
        }

        if ($invoice->bundleEnrollments->count() > 0) {
            foreach ($invoice->bundleEnrollments as $enrollment) {
                $enrollment->update([
                    'completed_at' => Carbon::now('Asia/Jakarta')
                ]);

                // Pastikan enrollments individu dan sertifikat untuk semua item bundle terbuat
                if (method_exists($enrollment, 'createIndividualEnrollments')) {
                    $enrollment->createIndividualEnrollments();
                }

                $bundle = $enrollment->bundle;
                if ($bundle && $bundle->bundleItems) {
                    foreach ($bundle->bundleItems as $bundleItem) {
                        $type = $bundleItem->getTypeSlug();
                        $this->addToCertificateParticipants($type, $bundleItem->bundleable_id, $userId);
                    }
                }
            }
        }
    }

    /**
     * Menambahkan peserta ke certificate participants berdasarkan tipe program
     */
    private function addToCertificateParticipants(string $type, $itemId, $userId): void
    {
        $certificate = null;

        switch ($type) {
            case 'course':
                $certificate = Certificate::where('course_id', $itemId)->first();
                break;
            case 'bootcamp':
                $certificate = Certificate::where('bootcamp_id', $itemId)->first();
                break;
            case 'webinar':
                $certificate = Certificate::where('webinar_id', $itemId)->first();
                break;
        }

        if ($certificate) {
            $existingParticipant = CertificateParticipant::where('certificate_id', $certificate->id)
                ->where('user_id', $userId)
                ->first();

            if (!$existingParticipant) {
                CertificateParticipant::create([
                    'certificate_id' => $certificate->id,
                    'user_id' => $userId,
                ]);
            }
        }
    }


    private function recordAffiliateCommission($invoice)
    {
        if ($invoice->referred_by_user_id && $invoice->nett_amount > 0) {
            $commissionPercent = 10;
            $commissionAmount = ($invoice->nett_amount * $commissionPercent) / 100;

            AffiliateEarning::create([
                'affiliate_user_id' => $invoice->referred_by_user_id,
                'invoice_id' => $invoice->id,
                'course_id' => $invoice->courseItems->first()->course_id ?? null,
                'amount' => $commissionAmount,
                'rate' => $commissionPercent,
                'status' => 'approved',
            ]);

            Log::info('Affiliate commission recorded', [
                'invoice_code' => $invoice->invoice_code,
                'commission_amount' => $commissionAmount
            ]);
        }
    }

    private function sendEmailNotification($invoice)
    {
        try {
            $productType = '';
            $productTitle = '';
            if ($invoice->courseItems->count() > 0) {
                $productType = 'Course';
                $productTitle = $invoice->courseItems->first()->course->title ?? '';
            } elseif ($invoice->bootcampItems->count() > 0) {
                $productType = 'Bootcamp';
                $productTitle = $invoice->bootcampItems->first()->bootcamp->title ?? '';
            } elseif ($invoice->webinarItems->count() > 0) {
                $productType = 'Webinar';
                $productTitle = $invoice->webinarItems->first()->webinar->title ?? '';
            } elseif ($invoice->bundleEnrollments->count() > 0) {
                $productType = 'Bundle';
                $productTitle = $invoice->bundleEnrollments->first()->bundle->title ?? '';
            }

            $user = $invoice->user;
            $subject = 'Pembayaran Berhasil - ' . $invoice->invoice_code;
            $message = 'Pembayaran Anda untuk ' . $productType . ' "' . $productTitle . '" dengan No Invoice: ' . $invoice->invoice_code . ' telah berhasil. Total pembayaran: Rp ' . number_format($invoice->amount, 0, ',', '.') . '. Silakan cek dashboard untuk akses produk Anda.';

            // Constructor SendEmail membutuhkan 4 parameter: $subject, $message, $user, $id
            Mail::to($user->email)->send(new SendEmail(
                $subject,
                $message,
                $user->name,
                $invoice->id
            ));

            Log::info('Email notification sent', [
                'invoice_code' => $invoice->invoice_code,
                'email' => $invoice->user->email
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send email notification', [
                'error' => $e->getMessage(),
                'invoice_id' => $invoice->id
            ]);
        }
    }
}
