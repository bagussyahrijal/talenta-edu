import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BadgeCheck, Check, Hourglass, Package, ShoppingCart, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
interface Product {
    id: string;
    title: string;
    slug: string;
    price: number;
    thumbnail?: string | null;
}

interface BundleItem {
    id: string;
    bundleable_type: string;
    bundleable: Product;
    price: number;
}

interface Bundle {
    id: string;
    title: string;
    slug: string;
    short_description?: string | null;
    description?: string | null;
    thumbnail?: string | null;
    price: number;
    strikethrough_price: number;
    registration_deadline?: string | null;
    bundle_items: BundleItem[];
    bundle_items_count: number;
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

interface CheckoutBundleProps {
    bundle: Bundle;
    hasAccess: boolean;
    pendingInvoice?: PendingInvoice | null;
    transactionDetail?: TransactionDetail | null;
    channels: PaymentChannel[];
    referralInfo: ReferralInfo;
}

export default function CheckoutBundle({ bundle, hasAccess, pendingInvoice, transactionDetail, channels, referralInfo }: CheckoutBundleProps) {
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number;

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(channels.length > 0 ? channels[0] : null);

    const bundleDiscount = bundle.strikethrough_price - bundle.price;

    const calculateAdminFee = (channel: PaymentChannel | null): number => {
        if (!channel) return 0;
        const flatFee = channel.fee_customer.flat || 0;
        const percentFee = Math.round(bundle.price * ((channel.fee_customer.percent || 0) / 100));
        return flatFee + percentFee;
    };

    const adminFee = calculateAdminFee(selectedChannel);
    const totalPrice = bundle.price + adminFee;

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get('ref');

        if (refFromUrl) {
            sessionStorage.setItem('referral_code', refFromUrl);
        } else if (referralInfo.code) {
            sessionStorage.setItem('referral_code', referralInfo.code);
        }
    }, [referralInfo]);

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

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isProfileComplete) {
            alert('Profil Anda belum lengkap! Harap lengkapi nomor telepon terlebih dahulu.');
            window.location.href = route('profile.edit');
            return;
        }

        if (!termsAccepted) {
            alert('Anda harus menyetujui syarat dan ketentuan!');
            return;
        }

        setLoading(true);

        const submitPayment = async (retryCount = 0): Promise<void> => {
            const invoiceData = {
                bundle_id: bundle.id,
                discount_amount: bundleDiscount,
                nett_amount: bundle.price,
                total_amount: totalPrice,
                payment_channel: selectedChannel?.code,
            };

            try {
                const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

                const res = await fetch(route('invoice.store.bundle'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                        Accept: 'application/json',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(invoiceData),
                });

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
                                    Silakan login terlebih dahulu untuk membeli paket bundling
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
                <Head title="Checkout Paket Bundling" />
                <section className="flex min-h-screen items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md">
                        <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border bg-white/95 p-8 shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
                            <div className="rounded-full bg-orange-100 p-6 dark:bg-orange-900/30">
                                <User size={48} className="text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="text-center">
                                <h2 className="mb-2 text-2xl font-bold">Profil Belum Lengkap</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Harap lengkapi nomor telepon terlebih dahulu untuk melanjutkan pembelian
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
            <Head title={`Checkout - ${bundle.title}`} />

            <section className="mx-auto w-full max-w-7xl px-4 py-12">
                <div className="mb-8 px-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <Link href="/bundle" className="hover:text-orange-600">
                            Paket Bundling
                        </Link>
                        <span>/</span>
                        <Link href={`/bundle/${bundle.slug}`} className="hover:text-orange-600">
                            {bundle.title}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white">Checkout</span>
                    </div>
                    <h1 className="mt-8 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">Checkout Paket Bundling</h1>
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
                                            src={bundle.thumbnail ? `/storage/${bundle.thumbnail}` : '/assets/images/placeholder.png'}
                                            alt={bundle.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <span className="mb-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                            Paket Bundling
                                        </span>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{bundle.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Package size={16} />
                                            <span>{bundle.bundle_items_count} Program</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <div>
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                        Isi Paket ({bundle.bundle_items_count} Program)
                                    </h3>
                                    <div className="space-y-3">
                                        {bundle.bundle_items.map((item, index) => (
                                            <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                                    {index + 1}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-gray-900 dark:text-white">{item.bundleable.title}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {item.bundleable_type.includes('Course')
                                                            ? 'Kelas Online'
                                                            : item.bundleable_type.includes('Bootcamp')
                                                              ? 'Bootcamp'
                                                              : 'Webinar'}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    {item.price === 0 ? 'Gratis' : `Rp ${item.price.toLocaleString('id-ID')}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                    <h4 className="mb-2 flex items-center gap-2 font-semibold text-green-800 dark:text-green-400">
                                        <BadgeCheck size={18} />
                                        Keuntungan Paket Bundling
                                    </h4>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                                            <Check size={16} className="mt-0.5 flex-shrink-0" />
                                            <span>
                                                Hemat {Math.round(((bundle.strikethrough_price - bundle.price) / bundle.strikethrough_price) * 100)}%
                                                dari harga normal
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                                            <Check size={16} className="mt-0.5 flex-shrink-0" />
                                            <span>Akses ke {bundle.bundle_items_count} program pembelajaran sekaligus</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                                            <Check size={16} className="mt-0.5 flex-shrink-0" />
                                            <span>Sertifikat untuk semua program yang diselesaikan</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                                            <Check size={16} className="mt-0.5 flex-shrink-0" />
                                            <span>Akses selamanya ke semua materi pembelajaran</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Payment Channels Section */}
                        {channels.length > 0 && !pendingInvoice && !hasAccess && (
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
                                        Anda sudah membeli paket bundling ini. Silakan lanjutkan belajar.
                                    </p>
                                </div>
                                <Button asChild className="w-full" size="lg">
                                    <Link href={route('profile.index')}>Lihat Dashboard</Link>
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
                        ) : (
                            <form onSubmit={handleCheckout}>
                                <div className="overflow-hidden rounded-2xl border bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
                                    <div className="border-b bg-gray-50/80 p-4 dark:bg-gray-900/80">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ringkasan Pembayaran</h2>
                                    </div>

                                    <div className="space-y-4 p-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Harga Normal</span>
                                                <span className="font-medium text-gray-500 line-through dark:text-gray-400">
                                                    Rp {bundle.strikethrough_price.toLocaleString('id-ID')}
                                                </span>
                                            </div>

                                            {bundleDiscount > 0 && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Diskon Bundle</span>
                                                    <span className="font-semibold text-red-600">-Rp {bundleDiscount.toLocaleString('id-ID')}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Harga Bundle</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    Rp {bundle.price.toLocaleString('id-ID')}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Biaya Transaksi</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    Rp {adminFee.toLocaleString('id-ID')}
                                                </span>
                                            </div>

                                            <Separator />

                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-900 dark:text-white">Total Pembayaran</span>
                                                <span className="text-2xl font-bold text-orange-600">Rp {totalPrice.toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>

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
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-orange-600 hover:underline"
                                                >
                                                    syarat dan ketentuan
                                                </a>{' '}
                                                yang berlaku
                                            </Label>
                                        </div>

                                        <Button className="w-full" type="submit" disabled={!termsAccepted || loading} size="lg">
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                                    Memproses...
                                                </span>
                                            ) : (
                                                'Bayar Sekarang'
                                            )}
                                        </Button>

                                        <p className="text-center text-xs text-gray-500 dark:text-gray-400">Pembayaran aman dan terenkripsi 🔒</p>
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
