import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BadgeCheck, Calendar, Check, Hourglass, ShoppingCart, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Bootcamp {
    id: string;
    title: string;
    schedules?: { day: string; start_time: string; end_time: string }[];
    start_date: string;
    end_date: string;
    strikethrough_price: number;
    price: number;
    thumbnail?: string | null;
    slug: string;
    description?: string | null;
    benefits?: string | null;
    requirements?: string | null;
    curriculum?: string | null;
    group_url?: string | null;
    level?: 'beginner' | 'intermediate' | 'advanced';
}

interface DiscountData {
    valid: boolean;
    discount_amount: number;
    final_amount: number;
    discount_code: {
        id: string;
        code: string;
        name: string;
        type: string;
        formatted_value: string;
    };
    message?: string;
}

interface ReferralInfo {
    code?: string;
    hasActive: boolean;
}

interface PaymentInstruction {
    title: string;
    steps: string[];
}

interface TransactionDetail {
    reference: string;
    payment_name: string;
    pay_code: string;
    instructions: PaymentInstruction[];
    status: string;
    paid_at?: string | null;
}

interface PendingInvoice {
    id: string;
    invoice_code: string;
    status: string;
    amount: number;
    payment_method: string;
    payment_channel: string;
    va_number?: string;
    qr_code_url?: string;
    bank_name?: string;
    created_at: string;
    expires_at: string;
}

interface PaymentChannel {
    active: boolean;
    code: string;
    fee_customer: {
        flat: number;
        percent: number;
    };
    fee_merchant: {
        flat: number;
        percent: number;
    };
    group: string;
    icon_url: string;
    maximum_amount: number;
    maximum_fee: number | null;
    minimum_amount: number;
    minimum_fee: number | null;
    name: string;
    total_fee: {
        flat: number;
        percent: string;
    };
    type: string;
}

interface InvoiceData {
    type: string;
    id: string;
    discount_amount: number;
    nett_amount: number;
    total_amount: number;
    payment_channel?: string;
    discount_code_id?: string;
    discount_code_amount?: number;
}

export default function RegisterBootcamp({
    bootcamp,
    hasAccess,
    pendingInvoice,
    transactionDetail,
    channels,
    referralInfo,
}: {
    bootcamp: Bootcamp;
    hasAccess: boolean;
    pendingInvoice?: PendingInvoice | null;
    transactionDetail?: TransactionDetail | null;
    channels: PaymentChannel[];
    referralInfo: ReferralInfo;
}) {
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number;

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [discountData, setDiscountData] = useState<DiscountData | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(channels.length > 0 ? channels[0] : null);

    const [showFreeForm, setShowFreeForm] = useState(false);
    const [freeFormData, setFreeFormData] = useState({
        ig_follow_proof: null as File | null,
        tiktok_follow_proof: null as File | null,
        tag_friend_proof: null as File | null,
    });
    const [fileErrors, setFileErrors] = useState({
        ig_follow_proof: false,
        tiktok_follow_proof: false,
        tag_friend_proof: false,
    });

    const isFree = bootcamp.price === 0;

    const basePrice = bootcamp.price;
    const discountAmount = discountData?.discount_amount || 0;
    const finalBootcampPrice = basePrice - discountAmount;

    const calculateAdminFee = (channel: PaymentChannel | null): number => {
        if (!channel || isFree) return 0;
        const flatFee = channel.fee_customer.flat || 0;
        const percentFee = Math.round(finalBootcampPrice * ((channel.fee_customer.percent || 0) / 100));
        return flatFee + percentFee;
    };

    const adminFee = calculateAdminFee(selectedChannel);
    const totalPrice = isFree ? 0 : finalBootcampPrice + adminFee;

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get('ref');

        if (refFromUrl) {
            sessionStorage.setItem('referral_code', refFromUrl);
        } else if (referralInfo.code) {
            sessionStorage.setItem('referral_code', referralInfo.code);
        }
    }, [referralInfo]);

    useEffect(() => {
        if (!promoCode.trim() || isFree) {
            setDiscountData(null);
            setPromoError('');
            return;
        }

        const timer = setTimeout(() => {
            validatePromoCode();
        }, 500);

        return () => clearTimeout(timer);
    }, [promoCode]);

    const validatePromoCode = async () => {
        if (!promoCode.trim() || isFree) return;

        setPromoLoading(true);
        setPromoError('');

        try {
            const response = await fetch('/api/discount-codes/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    code: promoCode,
                    amount: bootcamp.price,
                    product_type: 'bootcamp',
                    product_id: bootcamp.id,
                }),
            });

            const data = await response.json();

            if (data.valid) {
                setDiscountData(data);
                setPromoError('');
            } else {
                setDiscountData(null);
                setPromoError(data.message || 'Kode promo tidak valid');
            }
        } catch {
            setDiscountData(null);
            setPromoError('Terjadi kesalahan saat memvalidasi kode promo');
        } finally {
            setPromoLoading(false);
        }
    };

    const refreshCSRFToken = async (): Promise<string> => {
        try {
            const response = await fetch('/csrf-token', {
                method: 'GET',
                credentials: 'same-origin',
            });
            const data = await response.json();

            const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
            if (metaTag) {
                metaTag.content = data.token;
            }

            return data.token;
        } catch (error) {
            console.error('Failed to refresh CSRF token:', error);
            throw error;
        }
    };

    const handleFreeCheckout = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isProfileComplete) {
            alert('Profil Anda belum lengkap! Harap lengkapi nomor telepon terlebih dahulu.');
            window.location.href = route('profile.edit');
            return;
        }

        if (!freeFormData.ig_follow_proof || !freeFormData.tiktok_follow_proof || !freeFormData.tag_friend_proof) {
            alert('Harap upload semua bukti yang diperlukan!');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('type', 'bootcamp');
        formData.append('id', bootcamp.id);
        formData.append('ig_follow_proof', freeFormData.ig_follow_proof);
        formData.append('tiktok_follow_proof', freeFormData.tiktok_follow_proof);
        formData.append('tag_friend_proof', freeFormData.tag_friend_proof);

        router.post(route('enroll.free'), formData, {
            onError: (errors) => {
                console.log('Free enrollment errors:', errors);
                alert(errors.message || 'Gagal mendaftar bootcamp gratis.');
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isProfileComplete) {
            alert('Profil Anda belum lengkap! Harap lengkapi nomor telepon terlebih dahulu.');
            window.location.href = route('profile.edit');
            return;
        }

        if (!termsAccepted && !isFree) {
            alert('Anda harus menyetujui syarat dan ketentuan!');
            return;
        }

        setLoading(true);

        if (isFree) {
            setShowFreeForm(true);
            setLoading(false);
            return;
        }

        const submitPayment = async (retryCount = 0): Promise<void> => {
            const originalDiscountAmount = bootcamp.strikethrough_price > 0 ? bootcamp.strikethrough_price - bootcamp.price : 0;
            const promoDiscountAmount = discountData?.discount_amount || 0;

            const invoiceData: InvoiceData = {
                type: 'bootcamp',
                id: bootcamp.id,
                discount_amount: originalDiscountAmount + promoDiscountAmount,
                nett_amount: finalBootcampPrice,
                total_amount: totalPrice,
                payment_channel: selectedChannel?.code,
            };

            if (discountData?.valid) {
                invoiceData.discount_code_id = discountData.discount_code.id;
                invoiceData.discount_code_amount = discountData.discount_amount;
            }

            try {
                const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

                const res = await fetch(route('invoice.store'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                        Accept: 'application/json',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(invoiceData),
                });

                // Handle 419 error with retry
                if (res.status === 419 && retryCount < 2) {
                    console.log(`CSRF token expired, refreshing... (attempt ${retryCount + 1})`);
                    await refreshCSRFToken();
                    return submitPayment(retryCount + 1);
                }

                const data = await res.json();

                if (res.ok && data.success) {
                    if (data.payment_url) {
                        window.location.href = data.payment_url;
                    } else {
                        throw new Error('Payment URL not received');
                    }
                } else {
                    throw new Error(data.message || 'Gagal membuat invoice.');
                }
            } catch (error) {
                console.error('Payment error:', error);
                throw error;
            }
        };

        try {
            await submitPayment();
        } catch (error: any) {
            alert(error.message || 'Terjadi kesalahan saat proses pembayaran.');
            setLoading(false);
        }
    };

    const validateFileSize = (file: File, maxSizeMB: number = 2): boolean => {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    };

    const handleFileChange = (fieldName: keyof typeof freeFormData, file: File | null) => {
        if (!file) {
            setFreeFormData((prev) => ({ ...prev, [fieldName]: null }));
            setFileErrors((prev) => ({ ...prev, [fieldName]: false }));
            return;
        }

        if (!validateFileSize(file, 2)) {
            setFileErrors((prev) => ({ ...prev, [fieldName]: true }));
            const input = document.querySelector(`input[data-field="${fieldName}"]`) as HTMLInputElement;
            if (input) input.value = '';
            toast.error('Ukuran file terlalu besar. Maksimal 2MB.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setFileErrors((prev) => ({ ...prev, [fieldName]: true }));
            const input = document.querySelector(`input[data-field="${fieldName}"]`) as HTMLInputElement;
            if (input) input.value = '';
            toast.error('Hanya file gambar (JPG, PNG, GIF, dll) yang diperbolehkan.');
            return;
        }

        setFreeFormData((prev) => ({ ...prev, [fieldName]: file }));
        setFileErrors((prev) => ({ ...prev, [fieldName]: false }));
        toast.success('File berhasil diunggah.');
    };

    const getPaymentChannelName = (code: string): string => {
        const channel = channels.find((c) => c.code === code);
        return channel?.name || code;
    };

    const getPaymentGroupIcon = (channelCode: string): string => {
        const channel = channels.find((c) => c.code === channelCode);
        return channel?.icon_url || '';
    };

    const formatExpiryTime = (expiresAt: string): { time: string; status: 'expired' | 'urgent' | 'normal' } => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) {
            return { time: 'Sudah kadaluarsa', status: 'expired' };
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours < 1) {
            return { time: `${minutes} menit lagi`, status: 'urgent' };
        }

        return { time: `${hours} jam ${minutes} menit lagi`, status: hours < 3 ? 'urgent' : 'normal' };
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Berhasil menyalin ke clipboard!');
        });
    };

    const getLevelBadge = (level?: string) => {
        if (!level) return null;
        switch (level) {
            case 'beginner':
                return (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Beginner
                    </span>
                );
            case 'intermediate':
                return (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                        Intermediate
                    </span>
                );
            case 'advanced':
                return (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        Advanced
                    </span>
                );
            default:
                return null;
        }
    };

    if (!isLoggedIn) {
        const currentUrl = window.location.href;
        const loginUrl = route('login', { redirect: currentUrl });

        return (
            <div className="min-h-screen bg-[url('/assets/images/bg-product.png')] bg-cover bg-center bg-no-repeat">
                <Head title="Login Required" />
                <section className="flex min-h-screen items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md">
                        <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border bg-white/95 p-8 shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
                            <div className="rounded-full bg-blue-100 p-6 dark:bg-blue-900/30">
                                <User size={48} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-center">
                                <h2 className="mb-2 text-2xl font-bold">Login Diperlukan</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Silakan login terlebih dahulu untuk mendaftar bootcamp
                                    {referralInfo.hasActive && '. Kode referral Anda akan tetap tersimpan'}
                                </p>
                            </div>
                            <div className="flex w-full gap-3">
                                <Button asChild className="flex-1" size="lg">
                                    <a href={loginUrl}>Login</a>
                                </Button>
                                <Button asChild variant="outline" className="flex-1" size="lg">
                                    <Link href={route('register', referralInfo.code ? { ref: referralInfo.code } : {})}>Daftar</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (!isProfileComplete) {
        return (
            <div className="min-h-screen bg-[url('/assets/images/bg-product.png')] bg-cover bg-center bg-no-repeat">
                <Head title="Daftar Bootcamp" />
                <section className="flex min-h-screen items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md">
                        <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border bg-white/95 p-8 shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
                            <div className="rounded-full bg-orange-100 p-6 dark:bg-orange-900/30">
                                <User size={48} className="text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="text-center">
                                <h2 className="mb-2 text-2xl font-bold">Profil Belum Lengkap</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Harap lengkapi nomor telepon terlebih dahulu untuk melanjutkan pendaftaran
                                </p>
                            </div>
                            <Button asChild className="w-full" size="lg">
                                <Link href={route('profile.edit', { redirect: window.location.href })}>Lengkapi Profil</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[url('/assets/images/bg-product.png')] bg-cover bg-center bg-no-repeat">
            <Head title="Daftar Bootcamp" />

            <section className="mx-auto w-full max-w-7xl px-4 py-12">
                <div className="mb-8 px-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <Link href="/bootcamp" className="hover:text-orange-600">
                            Bootcamp
                        </Link>
                        <span>/</span>
                        <Link href={`/bootcamp/${bootcamp.slug}`} className="hover:text-orange-600">
                            {bootcamp.title}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white">Daftar</span>
                    </div>
                    <h1 className="mt-8 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">Daftar Bootcamp</h1>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Product Info */}
                    <div className={!pendingInvoice ? 'lg:col-span-2' : 'lg:col-span-3'}>
                        <div className="overflow-hidden rounded-2xl border bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
                            <div className="border-b bg-gray-50/80 p-4 dark:bg-gray-900/80">
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <ShoppingCart className="h-5 w-5" />
                                    <h2 className="text-lg font-semibold">Detail Pesanan</h2>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex gap-4">
                                    <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                                        <img
                                            src={bootcamp.thumbnail ? `/storage/${bootcamp.thumbnail}` : '/assets/images/placeholder.png'}
                                            alt={bootcamp.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <span className="mb-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                            Bootcamp
                                        </span>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{bootcamp.title}</h3>
                                        <div className="flex items-center gap-2">
                                            {getLevelBadge(bootcamp.level)}
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Calendar size={16} />
                                                <span>
                                                    {new Date(bootcamp.start_date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}{' '}
                                                    -{' '}
                                                    {new Date(bootcamp.end_date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Channels Section */}
                        {!isFree && channels.length > 0 && !pendingInvoice && !hasAccess && (
                            <div className="mt-6 overflow-hidden rounded-2xl border bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
                                <div className="border-b bg-gray-50/80 p-4 dark:bg-gray-900/80">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Metode Pembayaran</h2>
                                </div>
                                <div className="p-6">
                                    <div className="grid gap-3">
                                        {channels.map((channel) => (
                                            <div
                                                key={channel.code}
                                                onClick={() => setSelectedChannel(channel)}
                                                className={`group cursor-pointer rounded-xl border-2 p-4 transition-all ${
                                                    selectedChannel?.code === channel.code
                                                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                                                        : 'border-gray-200 hover:border-orange-300 dark:border-gray-700 dark:hover:border-orange-600'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-1 items-center gap-4">
                                                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                                                            <img
                                                                src={channel.icon_url}
                                                                alt={channel.name}
                                                                className="h-full w-full object-contain p-1"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900 dark:text-white">{channel.name}</p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">{channel.group}</p>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all"
                                                        style={{
                                                            borderColor: selectedChannel?.code === channel.code ? '#ea580c' : '#d1d5db',
                                                            backgroundColor: selectedChannel?.code === channel.code ? '#ea580c' : 'transparent',
                                                        }}
                                                    >
                                                        {selectedChannel?.code === channel.code && <Check className="h-3 w-3 text-white" />}
                                                    </div>
                                                </div>
                                                {selectedChannel?.code === channel.code && (
                                                    <div className="mt-4 border-t border-orange-200 pt-4 dark:border-orange-900">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-semibold text-gray-600 dark:text-white">Biaya Admin</span>
                                                            <span className="font-semibold text-orange-600">
                                                                Rp {calculateAdminFee(channel).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Section */}
                    <div className={!pendingInvoice ? 'lg:col-span-1' : 'lg:col-span-3'}>
                        {hasAccess ? (
                            <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-2xl border bg-white/95 p-6 text-center shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
                                <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                                    <BadgeCheck size={48} className="text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h2 className="mb-2 text-xl font-bold">Sudah Memiliki Akses</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Anda sudah terdaftar di bootcamp ini. Silakan masuk ke grup.
                                    </p>
                                </div>
                                <Button asChild className="w-full" size="lg">
                                    <a href={bootcamp.group_url ?? ''} target="_blank" rel="noopener noreferrer">
                                        Masuk Grup Bootcamp
                                    </a>
                                </Button>
                            </div>
                        ) : pendingInvoice ? (
                            <div className="overflow-hidden rounded-2xl border bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
                                <div
                                    className="border-b p-4 dark:bg-yellow-900/20"
                                    style={{
                                        backgroundColor: (() => {
                                            const expiryInfo = formatExpiryTime(pendingInvoice.expires_at);
                                            const isExpired = expiryInfo.status === 'expired' && pendingInvoice.status === 'pending';
                                            return isExpired ? '#fee2e2' : 'rgba(254, 249, 195, 0.5)';
                                        })(),
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const expiryInfo = formatExpiryTime(pendingInvoice.expires_at);
                                            const isExpired = expiryInfo.status === 'expired' && pendingInvoice.status === 'pending';
                                            if (isExpired) {
                                                return (
                                                    <>
                                                        <X className="h-5 w-5 text-red-600" />
                                                        <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">Pembayaran Gagal</h2>
                                                    </>
                                                );
                                            }
                                            return (
                                                <>
                                                    <Hourglass className="h-5 w-5 text-yellow-600" />
                                                    <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200">
                                                        Pembayaran Tertunda
                                                    </h2>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div className="space-y-6 p-6">
                                    {/* Invoice Info */}
                                    <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">No. Invoice</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{pendingInvoice.invoice_code}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Metode Pembayaran</span>
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={getPaymentGroupIcon(pendingInvoice.payment_channel)}
                                                    alt={pendingInvoice.payment_channel}
                                                    className="h-5 w-5 object-contain"
                                                />
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {transactionDetail?.payment_name || getPaymentChannelName(pendingInvoice.payment_channel)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Pembayaran</span>
                                            <span className="text-xl font-bold text-orange-600">
                                                Rp {pendingInvoice.amount.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>

                                    {(() => {
                                        const expiryInfo = formatExpiryTime(pendingInvoice.expires_at);
                                        const isExpired = expiryInfo.status === 'expired' && pendingInvoice.status === 'pending';

                                        // Pesan expired
                                        if (isExpired) {
                                            return (
                                                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                                                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                                        Waktu pembayaran telah habis. Jika Anda sudah membayar atau butuh bantuan, silakan hubungi
                                                        admin melalui&nbsp;
                                                        <a
                                                            href="https://wa.me/6289528514480"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-bold text-orange-600 underline"
                                                        >
                                                            WhatsApp Admin
                                                        </a>
                                                        .
                                                    </p>
                                                </div>
                                            );
                                        }

                                        // Jika belum expired, tampilkan VA, QR, dan instruksi
                                        return (
                                            <>
                                                {/* VA Number */}
                                                {pendingInvoice.va_number && (
                                                    <div className="space-y-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Nomor Virtual Account</p>
                                                        <div className="flex items-center justify-between rounded-lg bg-white p-3 dark:bg-gray-700">
                                                            <span className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                                                                {pendingInvoice.va_number}
                                                            </span>
                                                            <button
                                                                onClick={() => copyToClipboard(pendingInvoice.va_number!)}
                                                                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:cursor-pointer hover:bg-blue-700"
                                                            >
                                                                Salin
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* QR Code */}
                                                {pendingInvoice.qr_code_url && (
                                                    <div className="space-y-3 rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Kode QR Pembayaran</p>
                                                        <div className="flex justify-center rounded-lg bg-white p-4 dark:bg-gray-700">
                                                            <img
                                                                src={pendingInvoice.qr_code_url}
                                                                alt="QR Code"
                                                                className="h-48 w-48 object-contain"
                                                            />
                                                        </div>
                                                        <a
                                                            href={pendingInvoice.qr_code_url}
                                                            download
                                                            className="block rounded-lg bg-purple-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-purple-700"
                                                        >
                                                            Download QR Code
                                                        </a>
                                                    </div>
                                                )}

                                                {/* Instructions */}
                                                {transactionDetail?.instructions && transactionDetail.instructions.length > 0 ? (
                                                    <div className="space-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Langkah Pembayaran</p>
                                                        <div className="space-y-4">
                                                            {transactionDetail.instructions.map((instruction, idx) => (
                                                                <details
                                                                    key={idx}
                                                                    className="group rounded-lg border border-gray-200 dark:border-gray-600"
                                                                    open={idx === 0}
                                                                >
                                                                    <summary className="flex cursor-pointer items-center justify-between bg-gray-100 px-4 py-3 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500">
                                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                                            {instruction.title}
                                                                        </span>
                                                                        <span className="text-gray-600 transition-transform group-open:rotate-180 dark:text-gray-300">
                                                                            ▼
                                                                        </span>
                                                                    </summary>
                                                                    <div className="space-y-3 bg-white px-4 py-4 dark:bg-gray-700">
                                                                        <ol className="space-y-2">
                                                                            {instruction.steps.map((step, stepIdx) => (
                                                                                <li key={stepIdx} className="flex gap-3">
                                                                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-xs font-bold text-white">
                                                                                        {stepIdx + 1}
                                                                                    </span>
                                                                                    <span className="flex-1 pt-0.5 text-sm text-gray-700 dark:text-gray-300">
                                                                                        <div dangerouslySetInnerHTML={{ __html: step }} />
                                                                                    </span>
                                                                                </li>
                                                                            ))}
                                                                        </ol>
                                                                    </div>
                                                                </details>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </>
                                        );
                                    })()}

                                    <Button onClick={() => window.location.reload()} variant="outline" className="w-full" size="lg">
                                        Cek Status Pembayaran
                                    </Button>
                                </div>
                            </div>
                        ) : !showFreeForm ? (
                            <form onSubmit={handleCheckout}>
                                <div className="overflow-hidden rounded-2xl border bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
                                    <div className="border-b bg-gray-50/80 p-4 dark:bg-gray-900/80">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {isFree ? 'Detail Pendaftaran' : 'Ringkasan Pembayaran'}
                                        </h2>
                                    </div>

                                    <div className="space-y-4 p-6">
                                        {isFree ? (
                                            <div className="rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
                                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">BOOTCAMP GRATIS</p>
                                                <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                                                    Dapatkan akses dengan mengikuti persyaratan berikut
                                                </p>
                                                <ul className="mt-4 space-y-1 text-left text-sm text-green-700 dark:text-green-300">
                                                    <li>
                                                        • Follow Instagram{' '}
                                                        <a
                                                            href="https://www.instagram.com/kompeten.idn/"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-medium underline"
                                                        >
                                                            @kompeten.idn
                                                        </a>
                                                    </li>
                                                    <li>
                                                        • Follow TikTok{' '}
                                                        <a
                                                            href="https://www.tiktok.com/@kompetenidn"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-medium underline"
                                                        >
                                                            @kompetenidn
                                                        </a>
                                                    </li>
                                                    <li>• Tag 3 teman di postingan Instagram kami</li>
                                                </ul>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="promo-code" className="text-sm font-medium">
                                                        Punya Kode Promo?
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="promo-code"
                                                            type="text"
                                                            placeholder="Masukkan kode promo"
                                                            value={promoCode}
                                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                            className="pr-10"
                                                        />
                                                        {promoLoading && (
                                                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-orange-600"></div>
                                                            </div>
                                                        )}
                                                        {!promoLoading && promoCode && (
                                                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                                {discountData?.valid ? (
                                                                    <Check className="h-5 w-5 text-green-600" />
                                                                ) : promoError ? (
                                                                    <X className="h-5 w-5 text-red-600" />
                                                                ) : null}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {promoError && <p className="text-sm text-red-600">{promoError}</p>}
                                                    {discountData?.valid && (
                                                        <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                                                            <div className="flex items-center gap-2">
                                                                <Check className="h-4 w-4 text-green-600" />
                                                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                                    Promo "{discountData.discount_code.code}" diterapkan!
                                                                </p>
                                                            </div>
                                                            <p className="mt-1 text-xs text-green-600 dark:text-green-300">
                                                                {discountData.discount_code.name}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <Separator />

                                                <div className="space-y-3">
                                                    {bootcamp.strikethrough_price > 0 && (
                                                        <>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400">Harga Asli</span>
                                                                <span className="font-medium text-gray-500 line-through dark:text-gray-400">
                                                                    Rp {bootcamp.strikethrough_price.toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400">Diskon</span>
                                                                <span className="font-semibold text-red-600">
                                                                    -Rp {(bootcamp.strikethrough_price - bootcamp.price).toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">Harga Bootcamp</span>
                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            Rp {bootcamp.price.toLocaleString('id-ID')}
                                                        </span>
                                                    </div>

                                                    {discountData?.valid && (
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                Diskon Promo ({discountData.discount_code.code})
                                                            </span>
                                                            <span className="font-semibold text-green-600">
                                                                -Rp {discountData.discount_amount.toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">Biaya Transaksi</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            Rp {adminFee.toLocaleString('id-ID')}
                                                        </span>
                                                    </div>

                                                    <Separator />

                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-gray-900 dark:text-white">Total Pembayaran</span>
                                                        <span className="text-2xl font-bold text-orange-600">
                                                            Rp {totalPrice.toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {!isFree && (
                                            <>
                                                <Separator />
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        id="terms"
                                                        checked={termsAccepted}
                                                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                                        className="mt-1"
                                                    />
                                                    <Label htmlFor="terms" className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                                        Saya menyetujui{' '}
                                                        <a
                                                            href="/terms-and-conditions"
                                                            target="_blank"
                                                            className="font-medium text-orange-600 hover:underline"
                                                        >
                                                            syarat dan ketentuan
                                                        </a>{' '}
                                                        yang berlaku
                                                    </Label>
                                                </div>
                                            </>
                                        )}

                                        <Button className="w-full" type="submit" disabled={(isFree ? false : !termsAccepted) || loading} size="lg">
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                                    Memproses...
                                                </span>
                                            ) : isFree ? (
                                                'Upload Bukti Follow'
                                            ) : (
                                                'Bayar Sekarang'
                                            )}
                                        </Button>

                                        <p className="text-center text-xs text-gray-500 dark:text-gray-400">Pembayaran aman dan terenkripsi 🔒</p>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleFreeCheckout}>
                                <div className="overflow-hidden rounded-2xl border bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
                                    <div className="border-b bg-gray-50/80 p-4 dark:bg-gray-900/80">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Bukti Follow & Tag</h2>
                                    </div>

                                    <div className="space-y-4 p-6">
                                        <div>
                                            <Label htmlFor="ig_follow_proof">Bukti Follow Instagram</Label>
                                            <Input
                                                id="ig_follow_proof"
                                                data-field="ig_follow_proof"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange('ig_follow_proof', e.target.files?.[0] || null)}
                                                className={fileErrors.ig_follow_proof ? 'border-red-500' : ''}
                                                required
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Screenshot profil Instagram @kompeten yang menunjukkan follow (Maks. 2MB)
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="tiktok_follow_proof">Bukti Follow TikTok</Label>
                                            <Input
                                                id="tiktok_follow_proof"
                                                data-field="tiktok_follow_proof"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange('tiktok_follow_proof', e.target.files?.[0] || null)}
                                                className={fileErrors.tiktok_follow_proof ? 'border-red-500' : ''}
                                                required
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Screenshot profil TikTok @kompeten yang menunjukkan follow (Maks. 2MB)
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="tag_friend_proof">Bukti Tag 3 Teman</Label>
                                            <Input
                                                id="tag_friend_proof"
                                                data-field="tag_friend_proof"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange('tag_friend_proof', e.target.files?.[0] || null)}
                                                className={fileErrors.tag_friend_proof ? 'border-red-500' : ''}
                                                required
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Screenshot komentar yang menunjukkan tag 3 teman (Maks. 2MB)</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowFreeForm(false);
                                                    setFileErrors({ ig_follow_proof: false, tiktok_follow_proof: false, tag_friend_proof: false });
                                                    setFreeFormData({ ig_follow_proof: null, tiktok_follow_proof: null, tag_friend_proof: null });
                                                }}
                                                className="flex-1"
                                            >
                                                Kembali
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    loading ||
                                                    !freeFormData.ig_follow_proof ||
                                                    !freeFormData.tiktok_follow_proof ||
                                                    !freeFormData.tag_friend_proof ||
                                                    Object.values(fileErrors).some((e) => e)
                                                }
                                                className="flex-1"
                                            >
                                                {loading ? 'Memproses...' : 'Dapatkan Akses Gratis'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </section>
            <Toaster position="top-center" richColors />
        </div>
    );
}
