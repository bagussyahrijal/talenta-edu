<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Traits\WablasTrait;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckInstallmentOverdue extends Command
{
    use WablasTrait;

    protected $signature = 'installment:check-overdue';
    protected $description = 'Cek jatuh tempo cicilan: kirim reminder H-7, H-3, H-0, dan bekukan akses jika melewati jatuh tempo';

    public function handle(): int
    {
        $today = Carbon::today('Asia/Jakarta');
        $this->info("Checking installment overdue at: {$today->toDateString()}");

        $pendingTerms = Invoice::with(['parentInvoice.user'])
            ->where('status', 'pending')
            ->whereNotNull('parent_invoice_id')
            ->whereNotNull('installment_due_date')
            ->get();

        $reminded = 0;
        $suspended = 0;

        foreach ($pendingTerms as $childInvoice) {
            $dueDate = Carbon::parse($childInvoice->installment_due_date)->startOfDay();
            $daysUntilDue = $today->diffInDays($dueDate, false); // negative = overdue

            $parentInvoice = $childInvoice->parentInvoice;
            if (!$parentInvoice) continue;

            $user = $parentInvoice->user;

            // Overdue: jatuh tempo sudah lewat
            if ($daysUntilDue < 0) {
                // Bekukan akses jika belum dibekukan
                if (!$parentInvoice->isAccessSuspended()) {
                    $parentInvoice->update(['access_suspended_at' => Carbon::now('Asia/Jakarta')]);

                    Log::info('Installment access suspended', [
                        'parent_invoice_code' => $parentInvoice->invoice_code,
                        'child_invoice_code' => $childInvoice->invoice_code,
                        'user_id' => $user->id,
                        'due_date' => $dueDate->toDateString(),
                    ]);

                    $this->sendSuspensionNotification($childInvoice, $parentInvoice, $user);
                    $suspended++;
                }
                continue;
            }

            // Reminder H-7, H-3, H-0
            if (in_array($daysUntilDue, [7, 3, 0])) {
                $this->sendReminderNotification($childInvoice, $parentInvoice, $user, (int) $daysUntilDue);
                $reminded++;

                Log::info("Installment reminder H-{$daysUntilDue} sent", [
                    'child_invoice_code' => $childInvoice->invoice_code,
                    'user_id' => $user->id,
                ]);
            }
        }

        $this->info("Done. Reminded: {$reminded}, Suspended: {$suspended}");
        return self::SUCCESS;
    }

    private function formatPhoneNumber(string $phoneNumber): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phoneNumber);

        if (str_starts_with($cleaned, '0')) {
            return '62' . substr($cleaned, 1);
        }

        if (!str_starts_with($cleaned, '62')) {
            return '62' . $cleaned;
        }

        return $cleaned;
    }

    private function sendReminderNotification(Invoice $child, Invoice $parent, mixed $user, int $daysLeft): void
    {
        try {
            if (!$user?->phone_number) return;

            $phoneNumber = $this->formatPhoneNumber($user->phone_number);
            $dueDate = Carbon::parse($child->installment_due_date)->translatedFormat('d F Y');
            $termNumber = $child->installment_number;
            $totalTerms = $parent->installmentTerms()->count();
            $amount = 'Rp ' . number_format($child->amount, 0, ',', '.');
            $payUrl = $child->invoice_url ?: url('/profile/installments');

            $dayLabel = match ($daysLeft) {
                7 => '7 hari lagi',
                3 => '3 hari lagi',
                0 => 'HARI INI',
                default => "{$daysLeft} hari lagi",
            };

            $message = "*[Talenta Edu - Pengingat Pembayaran Cicilan]*\n\n";
            $message .= "Halo *{$user->name}*,\n\n";
            $message .= "Tagihan cicilan Anda akan jatuh tempo *{$dayLabel}* ({$dueDate}):\n";
            $message .= "• *Termin:* Ke-{$termNumber} dari {$totalTerms}\n";
            $message .= "• *Nominal:* {$amount}\n";
            $message .= "• *Jatuh Tempo:* {$dueDate}\n\n";
            $message .= "Silakan lakukan pembayaran melalui tautan berikut:\n";
            $message .= "🔗 {$payUrl}\n\n";
            $message .= "Pastikan pembayaran dilakukan sebelum jatuh tempo agar akses materi pembelajaran tetap aktif.\n\n";
            $message .= "Terima kasih!\n*Talenta Edu Support*";

            self::sendText([['phone' => $phoneNumber, 'message' => $message, 'isGroup' => 'false']]);
        } catch (\Throwable $e) {
            Log::error('Failed to send installment reminder WhatsApp', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? null,
            ]);
        }
    }

    private function sendSuspensionNotification(Invoice $child, Invoice $parent, mixed $user): void
    {
        try {
            if (!$user?->phone_number) return;

            $phoneNumber = $this->formatPhoneNumber($user->phone_number);
            $dueDate = Carbon::parse($child->installment_due_date)->translatedFormat('d F Y');
            $termNumber = $child->installment_number;
            $totalTerms = $parent->installmentTerms()->count();
            $amount = 'Rp ' . number_format($child->amount, 0, ',', '.');
            $payUrl = $child->invoice_url ?: url('/profile/installments');

            $message = "*[Talenta Edu - Akses Pembelajaran Ditangguhkan]*\n\n";
            $message .= "Halo *{$user->name}*,\n\n";
            $message .= "Akses pembelajaran Anda telah ditangguhkan sementara karena cicilan ke-{$termNumber} (sebesar {$amount}) telah melewati batas jatuh tempo ({$dueDate}).\n\n";
            $message .= "Untuk mengaktifkan kembali akses Anda, silakan lakukan pembayaran sekarang melalui tautan berikut:\n";
            $message .= "🔗 {$payUrl}\n\n";
            $message .= "Akses akan langsung aktif kembali secara otomatis setelah pembayaran terkonfirmasi.\n\n";
            $message .= "Jika Anda membutuhkan bantuan, silakan hubungi customer support kami.\n\n";
            $message .= "Terima kasih!\n*Talenta Edu Support*";

            self::sendText([['phone' => $phoneNumber, 'message' => $message, 'isGroup' => 'false']]);
        } catch (\Throwable $e) {
            Log::error('Failed to send suspension notification WhatsApp', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? null,
            ]);
        }
    }
}
