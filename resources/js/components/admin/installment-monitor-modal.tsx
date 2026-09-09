import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { rupiahFormatter } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Copy,
    ExternalLink,
    Loader2,
    Lock,
    MessageCircle,
    Send,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface InstallmentTermInvoice {
    id: string;
    installment_number: number;
    invoice_code: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed' | 'expired';
    installment_due_date: string | null;
    paid_at: string | null;
    invoice_url?: string | null;
    payment_url?: string | null;
}

export type InstallmentTermItem = InstallmentTermInvoice;

export interface InstallmentParentInvoice {
    id: string;
    invoice_code: string;
    status: string;
    amount: number;
    is_installment?: boolean;
    access_suspended_at?: string | null;
    created_at: string;
    user?: {
        id: string;
        name: string;
        phone_number: string | null;
        email?: string | null;
    } | null;
    installment_terms?: InstallmentTermInvoice[];
    installmentTerms?: InstallmentTermInvoice[];
    course_items?: Array<{ course?: { title: string } }>;
    courseItems?: Array<{ course?: { title: string } }>;
    bootcamp_items?: Array<{ bootcamp?: { title: string } }>;
    bootcampItems?: Array<{ bootcamp?: { title: string } }>;
    webinar_items?: Array<{ webinar?: { title: string } }>;
    webinarItems?: Array<{ webinar?: { title: string } }>;
    certification_program_items?: Array<{ certification_program?: { title: string }; certificationProgram?: { title: string } }>;
    certificationProgramItems?: Array<{ certification_program?: { title: string }; certificationProgram?: { title: string } }>;
    bundle_enrollments?: Array<{ bundle?: { title: string } }>;
    bundleEnrollments?: Array<{ bundle?: { title: string } }>;
}

interface InstallmentMonitorModalProps {
    invoice: InstallmentParentInvoice;
    trigger?: React.ReactNode;
}

export default function InstallmentMonitorModal({
    invoice,
    trigger,
}: InstallmentMonitorModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [sendingId, setSendingId] = useState<string | null>(null);

    const terms: InstallmentTermInvoice[] =
        invoice.installment_terms || invoice.installmentTerms || [];

    const paidTerms = terms.filter((t) => t.status === 'paid');
    const totalTerms = terms.length;
    const isFullyPaid = totalTerms > 0 && paidTerms.length === totalTerms;
    const isSuspended = !!invoice.access_suspended_at;
    const progressPercent = totalTerms > 0 ? (paidTerms.length / totalTerms) * 100 : 0;

    // Get item name
    const productName =
        invoice.course_items?.[0]?.course?.title ||
        invoice.courseItems?.[0]?.course?.title ||
        invoice.bootcamp_items?.[0]?.bootcamp?.title ||
        invoice.bootcampItems?.[0]?.bootcamp?.title ||
        invoice.webinar_items?.[0]?.webinar?.title ||
        invoice.webinarItems?.[0]?.webinar?.title ||
        invoice.certification_program_items?.[0]?.certification_program?.title ||
        invoice.certificationProgramItems?.[0]?.certificationProgram?.title ||
        invoice.bundle_enrollments?.[0]?.bundle?.title ||
        invoice.bundleEnrollments?.[0]?.bundle?.title ||
        'Program Pembelajaran';

    const user = invoice.user;

    function handleCopyUrl(url?: string | null) {
        if (!url) {
            toast.error('URL pembayaran belum digenerate untuk termin ini.');
            return;
        }
        navigator.clipboard.writeText(url);
        toast.success('Link tagihan pembayaran berhasil disalin ke clipboard!');
    }

    async function handleSendAutomatedReminder(term: InstallmentTermInvoice) {
        if (!user?.phone_number) {
            toast.error('Nomor WhatsApp peserta tidak tersedia.');
            return;
        }

        setSendingId(term.id);
        try {
            const res = await axios.post(`/admin/installments/${term.id}/send-reminder`);
            if (res.data.success) {
                toast.success(res.data.message || 'Pesan pengingat berhasil dikirim ke WhatsApp peserta.');
            } else {
                toast.error(res.data.message || 'Gagal mengirim pesan pengingat.');
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                'Gagal mengirim reminder WhatsApp. Pastikan WhatsApp Gateway terhubung.'
            );
        } finally {
            setSendingId(null);
        }
    }

    function handleOpenWaWeb(term: InstallmentTermInvoice) {
        if (!user?.phone_number) {
            toast.error('Nomor WhatsApp peserta tidak tersedia.');
            return;
        }

        let phone = user.phone_number.replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
        }
        if (phone.startsWith('8')) {
            phone = '62' + phone;
        }

        const dueDateFormatted = term.installment_due_date
            ? format(parseISO(term.installment_due_date), 'dd MMMM yyyy', { locale: id })
            : '-';
        const amountFormatted = rupiahFormatter.format(term.amount);
        const payUrl = term.invoice_url || term.payment_url || window.location.origin + '/profile/installments';

        const message =
            `*[Talenta Edu - Pengingat Pembayaran Cicilan]*\n\n` +
            `Halo *${user.name}*,\n\n` +
            `Kami mengingatkan tagihan cicilan untuk program *${productName}*:\n` +
            `• *Termin:* Ke-${term.installment_number} dari ${totalTerms}\n` +
            `• *Nominal:* ${amountFormatted}\n` +
            `• *Jatuh Tempo:* ${dueDateFormatted}\n\n` +
            `Silakan lakukan pembayaran melalui tautan berikut:\n` +
            `🔗 ${payUrl}\n\n` +
            `Pastikan pembayaran dilakukan sebelum jatuh tempo agar akses belajar Anda tetap aktif.\n\n` +
            `Terima kasih!\n*Talenta Edu Support*`;

        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <Clock className="size-3.5" />
                        <span>Cicilan ({paidTerms.length}/{totalTerms})</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <DialogTitle className="text-lg">Monitoring Cicilan Peserta</DialogTitle>
                        {isFullyPaid ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
                                <CheckCircle2 className="size-3 mr-1" /> Lunas
                            </Badge>
                        ) : isSuspended ? (
                            <Badge variant="destructive" className="text-xs">
                                <Lock className="size-3 mr-1" /> Akses Dibekukan
                            </Badge>
                        ) : (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                                <Clock className="size-3 mr-1" /> Berjalan ({paidTerms.length}/{totalTerms})
                            </Badge>
                        )}
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Kelola dan pantau seluruh termin pembayaran cicilan untuk transaksi ini.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-2">
                    {/* Info Card Peserta & Produk */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg border border-border bg-muted/30 text-xs">
                        <div>
                            <p className="text-muted-foreground mb-0.5">Peserta</p>
                            <p className="font-semibold text-foreground text-sm">{user?.name || '-'}</p>
                            <p className="text-muted-foreground">{user?.email || '-'}</p>
                            <p className="text-muted-foreground">{user?.phone_number || 'Tidak ada no. WA'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-0.5">Program / Produk</p>
                            <p className="font-semibold text-foreground text-sm">{productName}</p>
                            <p className="text-muted-foreground font-mono">{invoice.invoice_code}</p>
                            <p className="font-medium text-foreground mt-0.5">
                                Total: {rupiahFormatter.format(invoice.amount)}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress Kelunasan:</span>
                            <span className="font-semibold">
                                {paidTerms.length} dari {totalTerms} termin ({Math.round(progressPercent)}%)
                            </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${isFullyPaid ? 'bg-emerald-500' : isSuspended ? 'bg-red-500' : 'bg-primary'}`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Suspended Alert */}
                    {isSuspended && !isFullyPaid && (
                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                            <AlertCircle className="size-4 flex-shrink-0 mt-0.5 text-red-500" />
                            <div>
                                <p className="font-semibold">Akses Belajar Sedang Dibekukan</p>
                                <p className="text-red-600 dark:text-red-400 mt-0.5">
                                    Peserta melewati tanggal jatuh tempo cicilan. Akses materi ditangguhkan otomatis oleh sistem sampai termin berikutnya dibayar.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* List of Terms */}
                    <div className="space-y-2.5">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            Rincian Termin Pembayaran
                        </h4>

                        {terms.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-4 text-center">
                                Data termin cicilan tidak ditemukan pada invoice ini.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {terms.map((term) => {
                                    const isPaid = term.status === 'paid';
                                    const dueDateObj = term.installment_due_date
                                        ? parseISO(term.installment_due_date)
                                        : null;
                                    const isOverdue =
                                        !isPaid && dueDateObj && new Date() > dueDateObj;
                                    const isSending = sendingId === term.id;
                                    const invoiceUrl = term.invoice_url || term.payment_url;

                                    return (
                                        <div
                                            key={term.id}
                                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border text-xs transition-colors ${
                                                isPaid
                                                    ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/50'
                                                    : isOverdue
                                                      ? 'bg-red-50/40 border-red-200 dark:bg-red-950/10 dark:border-red-900/50'
                                                      : 'bg-card border-border'
                                            }`}
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground">
                                                        Termin ke-{term.installment_number}
                                                        {term.installment_number === 1 ? ' (DP)' : ''}
                                                    </span>
                                                    <span className="font-mono text-[11px] text-muted-foreground">
                                                        {term.invoice_code}
                                                    </span>
                                                    {isPaid ? (
                                                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] px-1.5 py-0">
                                                            <CheckCircle2 className="size-3 mr-1" /> Lunas
                                                        </Badge>
                                                    ) : isOverdue ? (
                                                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                                            <AlertCircle className="size-3 mr-1" /> Terlambat
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                            <Clock className="size-3 mr-1" /> Menunggu
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                    <span className="font-semibold text-foreground text-sm">
                                                        {rupiahFormatter.format(term.amount)}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="size-3" />
                                                        Jatuh Tempo:{' '}
                                                        {dueDateObj && !isNaN(dueDateObj.getTime())
                                                            ? format(dueDateObj, 'dd MMM yyyy', { locale: id })
                                                            : '-'}
                                                    </span>
                                                    {isPaid && term.paid_at && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-emerald-600 dark:text-emerald-400">
                                                                Dibayar: {format(new Date(term.paid_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons for Pending Terms */}
                                            {!isPaid && (
                                                <div className="flex items-center gap-1.5 self-end sm:self-center">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 px-2 text-xs"
                                                                onClick={() => handleCopyUrl(invoiceUrl)}
                                                            >
                                                                <Copy className="size-3.5" />
                                                                <span className="sr-only">Salin Link</span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Salin Link Tagihan Termin</TooltipContent>
                                                    </Tooltip>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                disabled={isSending}
                                                                className="h-8 px-2.5 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            >
                                                                {isSending ? (
                                                                    <Loader2 className="size-3.5 animate-spin" />
                                                                ) : (
                                                                    <MessageCircle className="size-3.5 fill-white" />
                                                                )}
                                                                <span>Reminder WA</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-56 text-xs">
                                                            <DropdownMenuItem
                                                                onClick={() => handleSendAutomatedReminder(term)}
                                                                className="cursor-pointer gap-2 py-2"
                                                            >
                                                                <Send className="size-3.5 text-primary" />
                                                                <div>
                                                                    <p className="font-medium text-foreground">Kirim Otomatis (Sistem)</p>
                                                                    <p className="text-[10px] text-muted-foreground">Kirim langsung via WA Gateway</p>
                                                                </div>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleOpenWaWeb(term)}
                                                                className="cursor-pointer gap-2 py-2"
                                                            >
                                                                <ExternalLink className="size-3.5 text-emerald-600" />
                                                                <div>
                                                                    <p className="font-medium text-foreground">Buka WhatsApp Web</p>
                                                                    <p className="text-[10px] text-muted-foreground">Buka chat dengan template siap kirim</p>
                                                                </div>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
