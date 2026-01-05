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

class TripayCallbackController extends Controller
{
    use WablasTrait;

    protected $privateKey;

    public function __construct()
    {
        $this->privateKey = config('tripay.PRIVATE_KEY');
    }

    public function handle(Request $request)
    {

        $callbackSignature = $request->server('HTTP_X_CALLBACK_SIGNATURE');
        $json = $request->getContent();
        $signature = hash_hmac('sha256', $json, $this->privateKey);

        if ($signature !== (string) $callbackSignature) {
            return Response::json([
                'success' => false,
                'message' => 'Invalid signature',
            ], 401);
        }

        // ✅ Verifikasi event type
        $event = $request->server('HTTP_X_CALLBACK_EVENT');
        if ($event !== 'payment_status') {
            return Response::json([
                'success' => false,
                'message' => 'Unrecognized callback event',
            ]);
        }

        // ✅ Parse JSON payload
        $data = json_decode($json);

        if (JSON_ERROR_NONE !== json_last_error()) {
            return Response::json([
                'success' => false,
                'message' => 'Invalid JSON data',
            ], 400);
        }

        $tripayReference = $data->reference ?? null;
        $status = strtoupper((string)($data->status ?? ''));

        if (!$tripayReference) {
            return Response::json([
                'success' => false,
                'message' => 'Missing required fields',
            ], 400);
        }

        if ($data->is_closed_payment !== 1) {
            return Response::json([
                'success' => false,
                'message' => 'Not a closed payment'
            ]);
        }

        DB::beginTransaction();
        try {
            $invoice = Invoice::where('payment_reference', $tripayReference)
                ->where('status', 'pending')
                ->first();

            if (!$invoice) {
                DB::rollBack();
                return Response::json([
                    'success' => false,
                    'message' => 'Invoice not found or already processed',
                ], 404);
            }

            switch ($status) {
                case 'PAID':
                case 'SETTLEMENT':
                    $invoice->update([
                        'status' => 'paid',
                        'paid_at' => Carbon::now('Asia/Jakarta'),
                        'payment_reference' => $tripayReference,
                        'va_number' => $data->pay_code ?? null,
                        'qr_code_url' => $data->qr_url ?? null,
                    ]);

                    $this->processInvoiceEnrollments($invoice);

                    $this->recordAffiliateCommission($invoice);

                    $this->sendEmailNotification($invoice);

                    // $this->sendWhatsAppNotification($invoice);

                    break;

                case 'UNPAID':
                    break;
                case 'EXPIRED':
                case 'FAILED':
                case 'FAILED_AFTER_PAID':
                    $invoice->update(['status' => 'failed']);

                    // $this->sendWhatsAppPaymentFailed($invoice);

                    break;

                default:
                    DB::rollBack();
                    return Response::json([
                        'success' => false,
                        'message' => 'Unrecognized payment status',
                    ]);
            }

            DB::commit();

            return Response::json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            return Response::json([
                'success' => false,
                'message' => 'Internal server error',
            ], 500);
        }
    }

    /**
     * ✅ Process enrollments setelah pembayaran sukses
     */
    private function processInvoiceEnrollments(Invoice $invoice)
    {
        $invoice->load(['courseItems', 'bootcampItems', 'webinarItems', 'bundleEnrollments.bundle.bundleItems.bundleable']);
        $userId = $invoice->user_id;

        foreach ($invoice->courseItems as $courseItem) {
            $this->addToCertificateParticipants('course', $courseItem->course_id, $userId);
        }

        foreach ($invoice->bootcampItems as $bootcampItem) {
            $this->addToCertificateParticipants('bootcamp', $bootcampItem->bootcamp_id, $userId);
        }

        foreach ($invoice->webinarItems as $webinarItem) {
            $this->addToCertificateParticipants('webinar', $webinarItem->webinar_id, $userId);
        }

        foreach ($invoice->bundleEnrollments as $bundleEnrollment) {
            $bundleEnrollment->createIndividualEnrollments();

            $bundle = $bundleEnrollment->bundle;

            foreach ($bundle->bundleItems as $item) {
                $type = $item->getTypeSlug();
                $this->addToCertificateParticipants($type, $item->bundleable_id, $userId);
            }
        }
    }

    /**
     * ✅ Menambahkan peserta ke certificate participants
     */
    private function addToCertificateParticipants($type, $itemId, $userId)
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

    /**
     * ✅ Kirim email notifikasi
     */
    private function sendEmailNotification(Invoice $invoice)
    {
        try {
            $user = $invoice->user;
            $subject = 'Info Pembayaran Berhasil';
            $message = 'Pembayaran Anda No Invoice: ' . $invoice->invoice_code . ' telah berhasil. Silakan cek dashboard untuk akses produk.';

            Mail::to($user->email)->send(new SendEmail($subject, $message, $user->name, $invoice->id));
        } catch (\Exception $e) {
            Log::error('Failed to send email notification', [
                'invoice_code' => $invoice->invoice_code,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * ✅ Kirim WhatsApp notifikasi pembayaran berhasil
     */
    // private function sendWhatsAppNotification(Invoice $invoice)
    // {
    //     try {
    //         $user = $invoice->user;

    //         if (!$user->phone_number) {
    //             Log::warning('User does not have phone number', [
    //                 'user_id' => $user->id,
    //                 'invoice_code' => $invoice->invoice_code
    //             ]);
    //             return;
    //         }

    //         $phoneNumber = $this->formatPhoneNumber($user->phone_number);

    //         $message = "[pesan otomatis]\n";
    //         $message .= "✅ Info Pembayaran Berhasil\n\n";
    //         $message .= "Halo Kak " . $user->name . ",\n\n";
    //         $message .= "Pembayaran Anda No Invoice: " . $invoice->invoice_code . " telah berhasil diproses.\n\n";
    //         $message .= "Silakan cek dashboard untuk mengakses produk yang Anda beli.\n\n";
    //         $message .= "Terima kasih atas kepercayaan Anda! 🙏\n\n";
    //         $message .= "Araska - Customer Support";

    //         $waData = [
    //             [
    //                 'phone' => $phoneNumber,
    //                 'message' => $message,
    //                 'secret' => false,
    //                 'retry' => false,
    //                 'isGroup' => false,
    //             ]
    //         ];

    //         $sent = self::sendText($waData);

    //         if ($sent) {
    //             Log::info('WhatsApp notification sent', [
    //                 'invoice_code' => $invoice->invoice_code,
    //                 'phone' => $phoneNumber
    //             ]);
    //         }
    //     } catch (\Exception $e) {
    //         Log::error('Failed to send WhatsApp notification', [
    //             'invoice_code' => $invoice->invoice_code,
    //             'error' => $e->getMessage()
    //         ]);
    //     }
    // }

    /**
     * ✅ Kirim WhatsApp notifikasi pembayaran gagal
     */
    // private function sendWhatsAppPaymentFailed(Invoice $invoice)
    // {
    //     try {
    //         $user = $invoice->user;

    //         if (!$user->phone_number) {
    //             return;
    //         }

    //         $phoneNumber = $this->formatPhoneNumber($user->phone_number);

    //         $message = "[pesan otomatis]\n";
    //         $message .= "❌ Pembayaran Gagal atau Kadaluarsa\n\n";
    //         $message .= "Halo Kak " . $user->name . ",\n\n";
    //         $message .= "Maaf, pembayaran untuk invoice " . $invoice->invoice_code . " tidak berhasil atau sudah kadaluarsa.\n\n";
    //         $message .= "Silakan lakukan pembelian ulang jika Anda masih berminat.\n\n";
    //         $message .= "Terima kasih atas perhatiannya! 🙏\n\n";
    //         $message .= "Araska - Customer Support";

    //         $waData = [
    //             [
    //                 'phone' => $phoneNumber,
    //                 'message' => $message,
    //                 'secret' => false,
    //                 'retry' => false,
    //                 'isGroup' => false,
    //             ]
    //         ];

    //         self::sendText($waData);

    //         Log::info('WhatsApp payment failed notification sent', [
    //             'invoice_code' => $invoice->invoice_code,
    //             'phone' => $phoneNumber
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Failed to send WhatsApp payment failed notification', [
    //             'invoice_code' => $invoice->invoice_code,
    //             'error' => $e->getMessage()
    //         ]);
    //     }
    // }

    /**
     * ✅ Format nomor HP ke format WhatsApp
     */
    // private function formatPhoneNumber(string $phoneNumber): string
    // {
    //     $phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber);

    //     if (substr($phoneNumber, 0, 1) == '0') {
    //         $phoneNumber = '62' . substr($phoneNumber, 1);
    //     }

    //     if (substr($phoneNumber, 0, 2) != '62') {
    //         $phoneNumber = '62' . $phoneNumber;
    //     }

    //     return $phoneNumber;
    // }

    private function recordAffiliateCommission(Invoice $invoice)
    {
        if ($invoice->referred_by_user_id) {
            $affiliate = User::find($invoice->referred_by_user_id);

            if ($affiliate && $affiliate->affiliate_status === 'Active' && $affiliate->commission > 0) {
                $commissionAmount = $invoice->nett_amount * ($affiliate->commission / 100);

                AffiliateEarning::create([
                    'affiliate_user_id' => $affiliate->id,
                    'invoice_id' => $invoice->id,
                    'amount' => $commissionAmount,
                    'rate' => $affiliate->commission,
                    'status' => 'approved',
                ]);

                Log::info('Affiliate commission recorded', [
                    'affiliate_id' => $affiliate->id,
                    'invoice_code' => $invoice->invoice_code,
                    'commission_amount' => $commissionAmount
                ]);
            }
        } else {
            $defaultAffiliate = User::where('affiliate_code', 'TAL2025')->first();

            if ($defaultAffiliate && $defaultAffiliate->affiliate_status === 'Active' && $defaultAffiliate->commission > 0) {
                $commissionAmount = $invoice->nett_amount * ($defaultAffiliate->commission / 100);

                AffiliateEarning::create([
                    'affiliate_user_id' => $defaultAffiliate->id,
                    'invoice_id' => $invoice->id,
                    'amount' => $commissionAmount,
                    'rate' => $defaultAffiliate->commission,
                    'status' => 'approved',
                ]);

                Log::info('Default affiliate commission recorded (TAL2025)', [
                    'affiliate_id' => $defaultAffiliate->id,
                    'invoice_code' => $invoice->invoice_code,
                    'commission_amount' => $commissionAmount
                ]);
            }
        }

        $this->recordMentorCommission($invoice);
    }

    /**
     * ✅ Mencatat komisi untuk mentor dari penjualan kelas mereka
     */
    private function recordMentorCommission(Invoice $invoice)
    {
        $invoice->load(['courseItems.course.user']);

        foreach ($invoice->courseItems as $courseItem) {
            $course = $courseItem->course;
            $mentor = $course->user;

            if ($mentor && $mentor->hasRole('mentor') && $mentor->affiliate_status === 'Active' && $mentor->commission > 0) {
                $commissionAmount = $courseItem->price * ($mentor->commission / 100);

                AffiliateEarning::create([
                    'affiliate_user_id' => $mentor->id,
                    'invoice_id' => $invoice->id,
                    'amount' => $commissionAmount,
                    'rate' => $mentor->commission,
                    'status' => 'approved',
                    'type' => 'mentor_course',
                    'course_id' => $course->id,
                ]);

                Log::info('Mentor commission recorded', [
                    'mentor_id' => $mentor->id,
                    'course_id' => $course->id,
                    'invoice_code' => $invoice->invoice_code,
                    'commission_amount' => $commissionAmount
                ]);
            }
        }
    }
}
