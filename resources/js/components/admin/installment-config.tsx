import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn, parseRupiah, rupiahFormatter } from '@/lib/utils';
import { addWeeks, format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarDays, CalendarFold, Info, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface InstallmentTerm {
    id?: string;
    term_number: number;
    amount: number;
    due_date: string;
}

interface InstallmentConfigProps {
    productType: string;
    productId: string;
    productPrice: number;
    installmentEnabled: boolean;
    initialTerms?: InstallmentTerm[];
    registrationDeadline?: string | Date | null;
}

export default function InstallmentConfig({
    productType,
    productId,
    productPrice,
    installmentEnabled: initialEnabled,
    initialTerms = [],
    registrationDeadline,
}: InstallmentConfigProps) {
    const isFree = !productPrice || productPrice <= 0;

    const [enabled, setEnabled] = useState(isFree ? false : initialEnabled);

    // Hitung tanggal default
    const getDefaultTerm1Date = (): Date => {
        if (!registrationDeadline) return new Date();
        try {
            const d = typeof registrationDeadline === 'string' ? parseISO(registrationDeadline) : new Date(registrationDeadline);
            return isNaN(d.getTime()) ? new Date() : d;
        } catch {
            return new Date();
        }
    };

    const [terms, setTerms] = useState<InstallmentTerm[]>(() => {
        if (initialTerms.length > 0) {
            return initialTerms.map(t => ({
                ...t,
                due_date: t.due_date ? format(typeof t.due_date === 'string' ? parseISO(t.due_date) : t.due_date, 'yyyy-MM-dd') : ''
            }));
        }

        const t1Date = getDefaultTerm1Date();
        const t2Date = addWeeks(t1Date, 3);
        const t1Amount = productPrice > 0 ? Math.floor(productPrice / 2) : 0;
        const t2Amount = productPrice > 0 ? productPrice - t1Amount : 0;

        return [
            { term_number: 1, amount: t1Amount, due_date: format(t1Date, 'yyyy-MM-dd') },
            { term_number: 2, amount: t2Amount, due_date: format(t2Date, 'yyyy-MM-dd') },
        ];
    });

    const [isSaving, setIsSaving] = useState(false);

    // Auto-split jika productPrice > 0 dan terms masih bernilai 0
    useEffect(() => {
        if (initialTerms.length === 0 && productPrice > 0) {
            setTerms(prev => {
                const allZero = prev.every(t => !t.amount || t.amount === 0);
                if (allZero && prev.length >= 2) {
                    const splitAmount = Math.floor(productPrice / prev.length);
                    return prev.map((t, idx) => ({
                        ...t,
                        amount: idx === prev.length - 1 ? productPrice - splitAmount * (prev.length - 1) : splitAmount
                    }));
                }
                return prev;
            });
        }
    }, [productPrice, initialTerms.length]);

    // Fungsi bagi rata nominal ke semua termin aktif
    function distributeEvenly() {
        if (productPrice <= 0 || terms.length === 0) return;
        const splitAmount = Math.floor(productPrice / terms.length);
        setTerms(prev => prev.map((t, idx) => ({
            ...t,
            amount: idx === prev.length - 1 ? productPrice - splitAmount * (prev.length - 1) : splitAmount
        })));
        toast.info(`Nominal telah dibagi rata (${terms.length} termin).`);
    }

    const totalAmount = terms.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const isValidTotal = isFree || totalAmount === Number(productPrice);

    function handleAddTerm() {
        if (terms.length >= 6) {
            toast.error('Maksimal termin cicilan adalah 6 termin.');
            return;
        }

        const lastTerm = terms[terms.length - 1];
        let nextDate = new Date();
        if (lastTerm?.due_date) {
            try {
                nextDate = addWeeks(parseISO(lastTerm.due_date), 3);
            } catch {
                nextDate = addWeeks(new Date(), 3);
            }
        }

        const newTerms = [
            ...terms,
            {
                term_number: terms.length + 1,
                amount: 0,
                due_date: format(nextDate, 'yyyy-MM-dd'),
            },
        ];

        // Hitung ulang pembagian rata jika memungkinkan
        if (productPrice > 0) {
            const splitAmount = Math.floor(productPrice / newTerms.length);
            setTerms(
                newTerms.map((t, idx) => ({
                    ...t,
                    amount: idx === newTerms.length - 1 ? productPrice - splitAmount * (newTerms.length - 1) : splitAmount,
                }))
            );
        } else {
            setTerms(newTerms);
        }
    }

    function handleRemoveTerm(index: number) {
        if (terms.length <= 2) {
            toast.error('Minimal harus ada 2 termin cicilan (DP + Termin 2).');
            return;
        }

        const newTerms = terms
            .filter((_, i) => i !== index)
            .map((t, i) => ({ ...t, term_number: i + 1 }));

        if (productPrice > 0) {
            const splitAmount = Math.floor(productPrice / newTerms.length);
            setTerms(
                newTerms.map((t, idx) => ({
                    ...t,
                    amount: idx === newTerms.length - 1 ? productPrice - splitAmount * (newTerms.length - 1) : splitAmount,
                }))
            );
        } else {
            setTerms(newTerms);
        }
    }

    function handleAmountChange(index: number, val: string) {
        const numericVal = parseRupiah(val);
        setTerms(prev =>
            prev.map((t, i) => (i === index ? { ...t, amount: numericVal } : t))
        );
    }

    function handleDateChange(index: number, date: Date | undefined) {
        if (!date) return;
        const formatted = format(date, 'yyyy-MM-dd');
        setTerms(prev =>
            prev.map((t, i) => (i === index ? { ...t, due_date: formatted } : t))
        );
    }

    async function handleSave() {
        if (enabled) {
            if (terms.length < 2) {
                toast.error('Minimal harus ada 2 termin cicilan.');
                return;
            }

            for (const t of terms) {
                if (!t.amount || t.amount <= 0) {
                    toast.error(`Nominal untuk Termin ke-${t.term_number} tidak boleh 0.`);
                    return;
                }
                if (!t.due_date) {
                    toast.error(`Tanggal jatuh tempo untuk Termin ke-${t.term_number} wajib diisi.`);
                    return;
                }
            }

            if (!isValidTotal) {
                toast.error(
                    `Total termin (${rupiahFormatter.format(totalAmount)}) harus sama dengan harga produk (${rupiahFormatter.format(productPrice)}). Selisih: ${rupiahFormatter.format(Math.abs(productPrice - totalAmount))}`
                );
                return;
            }
        }

        setIsSaving(true);
        try {
            const payload = {
                type: productType,
                id: productId,
                installment_enabled: enabled,
                terms: enabled ? terms : [],
            };

            const res = await axios.post('/admin/installment-terms', payload);

            if (res.data.success) {
                toast.success(res.data.message || 'Pengaturan cicilan berhasil disimpan.');
                if (res.data.terms) {
                    setTerms(
                        res.data.terms.map((t: any) => ({
                            ...t,
                            due_date: t.due_date ? format(typeof t.due_date === 'string' ? parseISO(t.due_date) : t.due_date, 'yyyy-MM-dd') : '',
                        }))
                    );
                }
            } else {
                toast.error(res.data.message || 'Gagal menyimpan pengaturan.');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan.');
        } finally {
            setIsSaving(false);
        }
    }

    if (isFree) {
        return (
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-3">
                    <Info className="size-5 text-muted-foreground" />
                    <div>
                        <h4 className="font-semibold text-sm text-foreground">Opsi Cicilan Tidak Tersedia</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Produk ini gratis sehingga tidak memerlukan konfigurasi pembayaran cicilan.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
            {/* Header + Toggle */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="size-5 text-primary" />
                        <h3 className="font-bold text-base text-foreground">Pengaturan Pembayaran Cicilan (Installment)</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Aktifkan skema pembayaran cicilan berjangka untuk produk ini dengan mengatur jumlah termin dan tanggal jatuh tempo.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={cn('text-xs font-semibold', enabled ? 'text-primary' : 'text-muted-foreground')}>
                        {enabled ? 'Cicilan Aktif' : 'Cicilan Nonaktif'}
                    </span>
                    <Switch
                        checked={enabled}
                        onCheckedChange={setEnabled}
                        aria-label="Toggle cicilan"
                    />
                </div>
            </div>

            {/* Config Box (hanya jika diaktifkan) */}
            {enabled && (
                <div className="space-y-4 pt-2 border-t border-border">
                    {/* Ringkasan Harga & Status Validasi Total */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/50 p-4 border border-border">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Harga Resmi Produk</span>
                            <p className="text-base font-bold text-foreground">{rupiahFormatter.format(productPrice)}</p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Akumulasi Termin ({terms.length}x)</span>
                            <p className={cn('text-base font-bold', isValidTotal ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive')}>
                                {rupiahFormatter.format(totalAmount)}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {isValidTotal ? (
                                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300">
                                    Total Sesuai (100%)
                                </Badge>
                            ) : (
                                <Badge variant="destructive">
                                    Selisih: {rupiahFormatter.format(Math.abs(productPrice - totalAmount))}
                                </Badge>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={distributeEvenly}
                                className="text-xs h-7"
                            >
                                Bagi Rata
                            </Button>
                        </div>
                    </div>

                    {/* List Termin */}
                    <div className="space-y-3">
                        <Label className="text-xs font-semibold text-foreground">Daftar Termin Pembayaran</Label>

                        {terms.map((term, index) => {
                            const dateObj = term.due_date ? parseISO(term.due_date) : undefined;
                            const isDP = index === 0;

                            return (
                                <div
                                    key={index}
                                    className="flex flex-wrap md:flex-nowrap items-center gap-3 rounded-lg border border-border p-3 bg-card hover:bg-muted/30 transition-colors"
                                >
                                    {/* Badge Urutan */}
                                    <div className="flex items-center gap-2 min-w-[130px]">
                                        <div className={cn(
                                            'flex size-7 items-center justify-center rounded-full text-xs font-bold',
                                            isDP
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                        )}>
                                            {term.term_number}
                                        </div>
                                        <span className="text-xs font-medium text-foreground">
                                            {isDP ? 'Termin 1 (DP)' : `Termin ke-${term.term_number}`}
                                        </span>
                                    </div>

                                    {/* Input Nominal */}
                                    <div className="flex-1 min-w-[160px]">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                                                Rp
                                            </span>
                                            <Input
                                                type="text"
                                                value={term.amount ? term.amount.toLocaleString('id-ID') : ''}
                                                onChange={e => handleAmountChange(index, e.target.value)}
                                                placeholder="0"
                                                className="pl-9 text-xs font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Date Picker Jatuh Tempo */}
                                    <div className="min-w-[200px]">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full justify-start text-left text-xs font-normal h-9',
                                                        !term.due_date && 'text-muted-foreground'
                                                    )}
                                                >
                                                    <CalendarFold className="mr-2 size-3.5" />
                                                    {dateObj && !isNaN(dateObj.getTime()) ? (
                                                        format(dateObj, 'dd MMMM yyyy', { locale: id })
                                                    ) : (
                                                        <span>Pilih tanggal jatuh tempo</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateObj && !isNaN(dateObj.getTime()) ? dateObj : undefined}
                                                    onSelect={d => handleDateChange(index, d)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Hapus Termin (hanya jika > 2 termin & bukan DP) */}
                                    {!isDP && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveTerm(index)}
                                            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                            title="Hapus termin ini"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Tombol Tambah Termin */}
                    {terms.length < 6 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddTerm}
                            className="w-full border-dashed text-xs text-muted-foreground hover:text-foreground"
                        >
                            <Plus className="mr-1.5 size-3.5" />
                            Tambah Termin Cicilan ({terms.length + 1})
                        </Button>
                    )}
                </div>
            )}

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || (enabled && !isValidTotal)}
                    size="sm"
                    className="text-xs"
                >
                    {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Cicilan'}
                </Button>
            </div>
        </div>
    );
}
