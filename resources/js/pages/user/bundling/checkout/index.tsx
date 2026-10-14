import { parseISO } from 'date-fns';
import InputError from '@/components/input-error';
import InstallmentOptions, { ActiveInstallmentData, InstallmentTermOption } from '@/components/installment-options';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserLayout from '@/layouts/user-layout';
import { rupiahFormatter } from '@/lib/utils';
import { SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BadgeCheck, Calendar, Check, CreditCard, Gift, Hourglass, LoaderCircle, Package, Play, RefreshCw, Shield, Tag, User, X } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    batch?: string | null;
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

interface PendingInvoice {
    id: string;
    invoice_code: string;
    amount: number;
    status: string;
    invoice_url: string;
    payment_channel?: string;
    payment_method?: string;
    va_number?: string;
    qr_code_url?: string;
    bank_name?: string;
    created_at: string;
    expires_at: string;
}

interface TransactionDetail {
    payment_method?: string;
    payment_channel?: string;
    va_number?: string;
    qr_code_url?: string;
    bank_name?: string;
    created_at: string;
    expires_at: string;
}

type RegisterForm = {
    name: string;
    email: string;
    phone_number: string;
    instance: string;
    city: string;
    password: string;
    password_confirmation: string;
};

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

// interface PaymentChannel {
//     active: boolean;
//     code: string;
//     fee_customer: {
//         flat: number;
//         percent: number;
//     };
//     fee_merchant: {
//         flat: number;
//         percent: number;
//     };
//     group: string;
//     icon_url: string;
//     maximum_amount: number;
//     maximum_fee: number | null;
//     minimum_amount: number;
//     minimum_fee: number | null;
//     name: string;
//     total_fee: {
//         flat: number;
//         percent: string;
//     };
//     type: string;
// }

interface CheckoutBundleProps {
    bundle: Bundle;
    hasAccess: boolean;
    activeInstallment?: ActiveInstallmentData | null;
    pendingInvoice?: PendingInvoice | null;
    transactionDetail?: TransactionDetail | null;
    // channels: PaymentChannel[];
    referralInfo: ReferralInfo;
    installmentTerms?: InstallmentTermOption[];
}

export default function CheckoutBundle({
    bundle,
    hasAccess,
    activeInstallment: initialActiveInstallment = null,
    pendingInvoice,
    transactionDetail,
    referralInfo,
    installmentTerms = [],
}: CheckoutBundleProps) {
    const { t, i18n } = useTranslation('user');
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number && auth.user?.instance && auth.user?.city;

    const [activeInstallment, setActiveInstallment] = useState<ActiveInstallmentData | null>(initialActiveInstallment);
    const isAnyTermOverdue = !initialActiveInstallment && installmentTerms.some((t: any) => {
        if (!t.due_date) return false;
        try {
            const d = typeof t.due_date === 'string' ? parseISO(t.due_date) : new Date(t.due_date);
            if (isNaN(d.getTime())) return false;
            const endOfDay = new Date(d);
            endOfDay.setHours(23, 59, 59, 999);
            return new Date() > endOfDay;
        } catch {
            return false;
        }
    });

    const [paymentTab, setPaymentTab] = useState<'full' | 'installment'>(initialActiveInstallment ? 'installment' : 'full');
    const [cancellingInvoice, setCancellingInvoice] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    // const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(channels.length > 0 ? channels[0] : null);

    const bundleDiscount = bundle.strikethrough_price - bundle.price;

    // const calculateAdminFee = (channel: PaymentChannel | null): number => {
    //     if (!channel) return 0;
    //     const flatFee = channel.fee_customer.flat || 0;
    //     const percentFee = Math.round(bundle.price * ((channel.fee_customer.percent || 0) / 100));
    //     return flatFee + percentFee;
    // };

    const adminFee = 5000; //calculateAdminFee(selectedChannel);

    const [emailExists, setEmailExists] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [promoCode, setPromoCode] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [discountData, setDiscountData] = useState<DiscountData | null>(null);
    const [codeType, setCodeType] = useState<'voucher' | 'referral'>('voucher');
    const [referralData, setReferralData] = useState<{ valid: boolean; referrer?: { name: string } } | null>(null);
    const [referralLoading, setReferralLoading] = useState(false);
    const [referralError, setReferralError] = useState('');
    const totalPrice = bundle.price + adminFee - (discountData?.discount_amount || 0);

    useEffect(() => {
        if (!promoCode.trim()) {
            setDiscountData(null);
            setReferralData(null);
            setPromoError('');
            setReferralError('');
            return;
        }

        const timer = setTimeout(() => {
            if (codeType === 'voucher') {
                validatePromoCode();
            } else {
                validateReferralCode();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [promoCode, codeType]);

    const validateReferralCode = async () => {
        if (!promoCode.trim()) return;

        setReferralLoading(true);
        setReferralError('');

        try {
            const response = await axios.post('/api/referral/validate', { code: promoCode });
            const responseData = response.data;

            if (responseData.valid) {
                setReferralData(responseData);
                setReferralError('');
            } else {
                setReferralData(null);
                setReferralError(responseData.message || t('bundling.checkout.errors.invalidReferral', 'Kode referral tidak valid'));
            }
        } catch (error: any) {
            setReferralData(null);
            setReferralError(error.response?.data?.message || t('bundling.checkout.errors.referralValidateError', 'Terjadi kesalahan saat memvalidasi kode referral'));
        } finally {
            setReferralLoading(false);
        }
    };

    const validatePromoCode = async () => {
        if (!promoCode.trim()) return;

        setPromoLoading(true);
        setPromoError('');

        try {
            const requestData: any = {
                code: promoCode,
                amount: bundle.price,
                product_type: 'bundle',
                product_id: bundle.id,
            };

            if (!isLoggedIn && emailExists && data.email) {
                requestData.email = data.email;
            }

            const response = await axios.post('/api/discount-codes/validate', requestData);

            if (response.data.valid) {
                setDiscountData(response.data);
                setPromoError('');
            } else {
                setDiscountData(null);
                setPromoError(response.data.message || t('bundling.checkout.errors.invalidPromo', 'Kode promo tidak valid'));
            }
        } catch (error: any) {
            setDiscountData(null);
            setPromoError(error.response?.data?.message || t('bundling.checkout.errors.promoValidateError', 'Terjadi kesalahan saat memvalidasi kode promo'));
        } finally {
            setPromoLoading(false);
        }
    };

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        phone_number: '',
        instance: '',
        city: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (!data.email || !data.email.includes('@')) {
            setEmailExists(false);
            return;
        }

        const timer = setTimeout(async () => {
            setCheckingEmail(true);
            try {
                const response = await axios.post('/api/check-email', {
                    email: data.email,
                    bundle_id: bundle.id,
                });

                if (response.data.exists) {
                    setEmailExists(true);
                    setData('name', response.data.name || '');
                    setData('phone_number', response.data.phone_number || '');
                    setData('instance', response.data.instance || '');
                    setData('city', response.data.city || '');

                    if (response.data.active_installment) {
                        setActiveInstallment(response.data.active_installment);
                        setPaymentTab('installment');
                    } else {
                        setActiveInstallment(null);
                    }
                } else {
                    setEmailExists(false);
                    setActiveInstallment(null);
                }
            } catch (error) {
                console.error('Error checking email:', error);
                setEmailExists(false);
                setActiveInstallment(null);
            } finally {
                setCheckingEmail(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [data.email, bundle.id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get('ref');

        if (refFromUrl) {
            sessionStorage.setItem('affiliate_code', refFromUrl);
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

    const ensureAuth = async (): Promise<boolean> => {
        if (isLoggedIn) return true;

        if (!data.email || !data.name || !data.phone_number || !data.instance || !data.city) {
            toast.error(t('bundling.checkout.errors.completePersonalData', 'Lengkapi data terlebih dahulu'));
            return false;
        }

        try {
            if (emailExists) {
                const response = await axios.post('/auto-login', {
                    email: data.email,
                    phone_number: data.phone_number,
                    instance: data.instance,
                    city: data.city,
                });

                if (!response.data.success) {
                    throw new Error(
                        response.data.message ||
                            t('bundling.checkout.errors.autoLoginFailed', 'Login gagal. Pastikan nomor telepon sesuai dengan yang terdaftar.')
                    );
                }
            } else {
                const response = await axios.post('/register', {
                    name: data.name,
                    email: data.email,
                    phone_number: data.phone_number,
                    instance: data.instance,
                    city: data.city,
                    password: data.phone_number,
                    password_confirmation: data.phone_number,
                    affiliate_code: sessionStorage.getItem('affiliate_code') || '',
                });

                if (!(response.data?.success || response.status === 200 || response.status === 201)) {
                    throw new Error(t('bundling.checkout.errors.registerFailed', 'Registrasi gagal.'));
                }
            }
            return true;
        } catch (error: any) {
            console.error('Login/Register error:', error);
            toast.error(error.response?.data?.message || error.message || t('bundling.checkout.errors.processLoginFailed', 'Gagal login/registrasi'));
            return false;
        }
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (activeInstallment && !activeInstallment.is_fully_paid) {
            toast.error(
                t(
                    'bundling.checkout.errors.activeInstallmentNotice',
                    'Anda memiliki transaksi cicilan yang sedang aktif. Silakan lanjutkan pembayaran termin cicilan Anda.'
                )
            );
            setPaymentTab('installment');
            return;
        }

        // 1. Jika belum login, lakukan registrasi / login terlebih dahulu
        if (!isLoggedIn) {
            if (!termsAccepted) {
                toast.error(t('bundling.checkout.errors.termsRequired', 'Anda harus menyetujui syarat dan ketentuan!'));
                return;
            }

            setLoading(true);

            const authed = await ensureAuth();
            if (!authed) {
                setLoading(false);
                return;
            }

            try {
                // Langsung jalankan submitPayment tanpa reload!
                await submitPayment();
            } catch (error: any) {
                console.error('Payment error:', error);
                setLoading(false);
                toast.error(error.response?.data?.message || error.message || t('bundling.checkout.errors.paymentFailed', 'Gagal memproses pembayaran'));
            }
            return;
        }

        // 2. Jika sudah login
        if (!termsAccepted) {
            toast.error(t('bundling.checkout.errors.termsRequired', 'Anda harus menyetujui syarat dan ketentuan!'));
            return;
        }

        setLoading(true);

        try {
            await submitPayment();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || t('bundling.checkout.errors.paymentFailed', 'Terjadi kesalahan saat proses pembayaran.'));
            setLoading(false);
        }
    };

    const submitPayment = async (): Promise<void> => {
        const invoiceData: any = {
            bundle_id: bundle.id,
            discount_amount: bundleDiscount,
            nett_amount: bundle.price - (discountData?.discount_amount || 0),
            transaction_fee: adminFee,
            total_amount: totalPrice,
        };

        if (discountData?.valid && codeType === 'voucher') {
            invoiceData.discount_code_id = discountData.discount_code.id;
            invoiceData.discount_code_amount = discountData.discount_amount;
        }

        if (codeType === 'referral' && referralData?.valid) {
            (invoiceData as any).referral_code = promoCode;
        }

        const storedAffiliate = sessionStorage.getItem('affiliate_code') || new URLSearchParams(window.location.search).get('ref');
        if (storedAffiliate) {
            (invoiceData as any).affiliate_code = storedAffiliate;
        }

        try {
            const res = await axios.post(route('invoice.store.bundle'), invoiceData);

            if (res.data && res.data.success) {
                if (res.data.payment_url) {
                    sessionStorage.removeItem('pendingCheckout');
                    window.location.href = res.data.payment_url;
                } else {
                    throw new Error('Payment URL tidak diterima dari server.');
                }
            } else {
                throw new Error(res.data?.message || t('bundling.checkout.errors.createInvoiceFailed', 'Gagal membuat invoice.'));
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            throw error;
        }
    };

    // const getPaymentChannelName = (code: string): string => {
    //     const channel = channels.find((c) => c.code === code);
    //     return channel?.name || code;
    // };

    // const getPaymentGroupIcon = (channelCode: string): string => {
    //     const channel = channels.find((c) => c.code === channelCode);
    //     return channel?.icon_url || '';
    // };

    const formatExpiryTime = (expiresAt: string): { time: string; status: 'expired' | 'urgent' | 'normal' } => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) {
            return { time: t('webinar.register.statusExpired', 'Sudah kadaluarsa'), status: 'expired' };
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours < 1) {
            return { time: t('webinar.register.minutesLeft', { count: minutes, defaultValue: `${minutes} menit lagi` }), status: 'urgent' };
        }

        return {
            time: t('webinar.register.hoursMinutesLeft', { hours, minutes, defaultValue: `${hours} jam ${minutes} menit lagi` }),
            status: hours < 3 ? 'urgent' : 'normal',
        };
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(t('bundling.checkout.copiedToClipboard', 'Berhasil menyalin ke clipboard!'));
        });
    };

    useEffect(() => {
        const pendingCheckout = sessionStorage.getItem('pendingCheckout');

        if (pendingCheckout && isLoggedIn) {
            try {
                const checkoutData = JSON.parse(pendingCheckout);

                // Validasi timestamp (maksimal 5 menit)
                const timestamp = checkoutData.timestamp || 0;
                const now = Date.now();
                const fiveMinutes = 5 * 60 * 1000;

                if (now - timestamp > fiveMinutes) {
                    sessionStorage.removeItem('pendingCheckout');
                    toast.error(t('bundling.checkout.errors.sessionExpired', 'Sesi checkout telah kadaluarsa'));
                    return;
                }

                // Validasi bundle ID + product type
                if (checkoutData.bundleId !== bundle.id || checkoutData.productType !== 'bundle') {
                    sessionStorage.removeItem('pendingCheckout');
                    return;
                }

                if (checkoutData.source !== 'register') {
                    sessionStorage.removeItem('pendingCheckout');
                    return;
                }

                // Restore state
                setTermsAccepted(checkoutData.termsAccepted || false);

                // Restore promo code jika ada
                if (checkoutData.discountData?.valid) {
                    setPromoCode(checkoutData.discountData.discount_code.code);
                    setDiscountData(checkoutData.discountData);
                }
                toast.success(t('bundling.checkout.continuingPayment', 'Melanjutkan pembayaran...'));

                // Auto-submit setelah delay
                setTimeout(async () => {
                    setLoading(true);

                    const submitPayment = async (retryCount = 0): Promise<void> => {
                        // Hitung ulang total dengan diskon dari sessionStorage
                        let calculatedNettAmount = bundle.price;
                        let calculatedTotalAmount = bundle.price + adminFee;

                        if (checkoutData.discountData?.valid) {
                            calculatedNettAmount = bundle.price - checkoutData.discountData.discount_amount;
                            calculatedTotalAmount = calculatedNettAmount + adminFee;
                        }

                        const invoiceData: any = {
                            bundle_id: bundle.id,
                            discount_amount: bundleDiscount,
                            nett_amount: calculatedNettAmount,
                            transaction_fee: adminFee,
                            total_amount: calculatedTotalAmount,
                        };

                        if (checkoutData.discountData?.valid) {
                            invoiceData.discount_code_id = checkoutData.discountData.discount_code.id;
                            invoiceData.discount_code_amount = checkoutData.discountData.discount_amount;
                        }

                        try {
                            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

                            const res = await fetch(route('invoice.store.bundle'), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': csrfToken || '',
                                    Accept: 'application/json',
                                    'X-Requested-With': 'XMLHttpRequest',
                                },
                                credentials: 'same-origin',
                                body: JSON.stringify(invoiceData),
                            });

                            if (res.status === 419 && retryCount < 2) {
                                await refreshCSRFToken();
                                return submitPayment(retryCount + 1);
                            }

                            if (res.status === 401 && retryCount < 2) {
                                await new Promise((resolve) => setTimeout(resolve, 2000));
                                return submitPayment(retryCount + 1);
                            }

                            const data = await res.json();

                            if (res.ok && data.success) {
                                if (data.payment_url) {
                                    sessionStorage.removeItem('pendingCheckout');
                                    window.location.href = data.payment_url;
                                } else {
                                    throw new Error('Payment URL not received');
                                }
                            } else {
                                throw new Error(data.message || t('bundling.checkout.errors.createInvoiceFailed', 'Gagal membuat invoice.'));
                            }
                        } catch (error) {
                            console.error('Payment error:', error);
                            throw error;
                        }
                    };

                    try {
                        await submitPayment();
                    } catch (error: any) {
                        console.error('Failed to process payment:', error);
                        toast.error(error.message || t('bundling.checkout.errors.paymentFailed', 'Terjadi kesalahan saat proses pembayaran.'));
                        sessionStorage.removeItem('pendingCheckout');
                        setLoading(false);
                    }
                }, 2000);
            } catch (error) {
                console.error('Error processing pending checkout:', error);
                sessionStorage.removeItem('pendingCheckout');
                toast.error(t('bundling.checkout.errors.checkoutFailed', 'Gagal memproses checkout'));
            }
        }
    }, [isLoggedIn, bundle.id]);

    if (isLoggedIn && !isProfileComplete) {
        return (
            <UserLayout>
                <Head title={t('bundling.checkout.incompleteProfileTitle', 'Lengkapi Profil')} />

                <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-700 to-red-700 px-4 py-16">
                    <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />
                    <div className="absolute top-0 left-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/30 blur-3xl" />
                    <div className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-red-400/30 blur-3xl" />

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto max-w-4xl text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm"
                        >
                            <User className="h-4 w-4 text-white" />
                            <span className="text-sm font-medium text-white">
                                {t('bundling.checkout.incompleteProfileTitle', 'Profil Belum Lengkap')}
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                        >
                            {bundle.title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-orange-100"
                        >
                            {t('bundling.checkout.incompleteProfileDesc', 'Lengkapi profil Anda terlebih dahulu untuk melanjutkan')}
                        </motion.p>
                    </motion.div>
                </section>

                <section className="mx-auto my-8 w-full max-w-2xl px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <Card className="overflow-hidden border-2">
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 dark:from-orange-950/20 dark:to-red-950/20">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                                    <User className="h-10 w-10 text-white" />
                                </div>

                                <h2 className="mb-3 text-center text-2xl font-bold">
                                    {t('bundling.checkout.incompleteProfileTitle', 'Lengkapi Profil Anda')}
                                </h2>
                                <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
                                    {t(
                                        'bundling.checkout.incompleteProfileDesc',
                                        'Kami memerlukan nomor telepon, instansi, dan kota domisili Anda untuk melanjutkan pendaftaran paket bundling ini.'
                                    )}
                                </p>

                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                                >
                                    <Link href={route('profile.edit', { redirect: window.location.href })}>
                                        <User className="mr-2 h-4 w-4" />
                                        {t('bundling.checkout.btnCompleteProfile', 'Lengkapi Profil Sekarang')}
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </section>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <Head title={t('bundling.checkout.headTitle', { title: bundle.title, defaultValue: `Checkout - ${bundle.title}` })} />

            {/* Hero Section */}
            <section className="from-primary to-primary-foreground relative overflow-hidden bg-gradient-to-br px-4 py-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto max-w-7xl">
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
                        >
                            <Package className="h-3.5 w-3.5" />
                            {t('bundling.dashboard.catalog.badge', 'Paket Bundling')}
                        </motion.div>

                        {bundleDiscount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-red-700 bg-red-200 px-3 py-1.5 text-sm font-medium text-red-600 backdrop-blur-sm"
                            >
                                <Tag className="h-3.5 w-3.5" />
                                {t('bundling.dashboard.catalog.savePercent', {
                                    percent: Math.round((bundleDiscount / bundle.strikethrough_price) * 100),
                                    defaultValue: `Hemat ${Math.round((bundleDiscount / bundle.strikethrough_price) * 100)}%`,
                                })}
                            </motion.div>
                        )}

                        {bundle.batch && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
                            >
                                <Calendar className="h-3.5 w-3.5" />
                                {bundle.batch}
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
                        >
                            <Gift className="h-3.5 w-3.5" />
                            {t('bundling.dashboard.catalog.programsCount', {
                                count: bundle.bundle_items_count,
                                defaultValue: `${bundle.bundle_items_count} Program`,
                            })}
                        </motion.div>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4 text-3xl font-bold text-black sm:text-4xl lg:text-5xl"
                    >
                        {bundle.title}
                        {bundle.batch && (
                            <span className="ml-3 inline-flex items-center gap-1.5 rounded-md border border-black/10 bg-black/10 px-2.5 py-0.5 text-sm font-medium text-gray-800 backdrop-blur-sm">
                                {bundle.batch}
                            </span>
                        )}
                    </motion.h1>

                    {bundle.description && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-6 max-w-3xl text-justify text-lg text-black"
                        >
                            {bundle.description}
                        </motion.p>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap gap-6"
                    >
                        <div className="flex items-center gap-2 text-black">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                                <Package className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-black">{t('bundling.detail.register.totalProgramsLabel', 'Total Program')}</p>
                                <p className="font-semibold">
                                    {t('bundling.dashboard.catalog.programsCount', {
                                        count: bundle.bundle_items_count,
                                        defaultValue: `${bundle.bundle_items_count} Program`,
                                    })}
                                </p>
                            </div>
                        </div>

                        {bundle.batch && (
                            <div className="flex items-center gap-2 text-black">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-black">{t('bundling.detail.register.batchLabel', 'Batch')}</p>
                                    <p className="font-semibold">{bundle.batch}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-black">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                                <Tag className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-black">{t('bundling.detail.register.saveLabel', 'Hemat')}</p>
                                <p className="font-semibold">{rupiahFormatter.format(bundleDiscount)}</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Main Content */}
            <section className="mx-auto my-8 w-full max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Bundle Details */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
                        <Tabs defaultValue="programs" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="programs" className="gap-2">
                                    <Package className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        {t('bundling.checkout.includedPrograms', { count: bundle.bundle_items_count, defaultValue: 'Program Included' })}
                                    </span>
                                    <span className="sm:hidden">
                                        {t('bundling.dashboard.catalog.programsCount', { count: bundle.bundle_items_count, defaultValue: 'Program' })}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="benefits" className="gap-2">
                                    <BadgeCheck className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('bundling.checkout.packageBenefits', 'Keuntungan')}</span>
                                    <span className="sm:hidden">{t('bundling.checkout.packageBenefits', 'Benefit')}</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="programs" className="mt-4">
                                <Card className="p-6">
                                    <div className="mb-6">
                                        <h2 className="mb-2 text-2xl font-bold">{t('bundling.checkout.programsInBundleTitle', 'Program dalam Paket')}</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('bundling.checkout.programsInBundleSubtitle', {
                                                count: bundle.bundle_items_count,
                                                defaultValue: `${bundle.bundle_items_count} program pembelajaran yang bisa kamu akses`,
                                            })}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {bundle.bundle_items.map((item, idx) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                className="group flex items-center gap-4 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 transition-all hover:shadow-md dark:from-blue-950/20 dark:to-indigo-950/20"
                                            >
                                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-transform group-hover:scale-110">
                                                    <span className="font-bold">{idx + 1}</span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{item.bundleable.title}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {item.bundleable_type.includes('Course')
                                                            ? t('bundling.detail.items.courseBadge', '📚 Kelas Online')
                                                            : item.bundleable_type.includes('Bootcamp')
                                                              ? t('bundling.detail.items.bootcampBadge', '🚀 Bootcamp')
                                                              : t('bundling.detail.items.webinarBadge', '🎥 Webinar')}
                                                    </p>
                                                </div>
                                                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    {item.price === 0 ? (
                                                        <span className="text-green-600">{t('bundling.dashboard.catalog.free', 'Gratis')}</span>
                                                    ) : (
                                                        rupiahFormatter.format(item.price)
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="benefits" className="mt-4">
                                <Card className="p-6">
                                    <div className="mb-6">
                                        <h2 className="mb-2 text-2xl font-bold">{t('bundling.checkout.packageBenefits', 'Keuntungan Paket Bundling')}</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('bundling.checkout.packageBenefitsDesc', 'Benefit yang akan kamu dapatkan dengan membeli paket bundling')}
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {[
                                            t('bundling.checkout.benefitSave', {
                                                percent: Math.round((bundleDiscount / bundle.strikethrough_price) * 100),
                                                defaultValue: `Hemat ${Math.round((bundleDiscount / bundle.strikethrough_price) * 100)}% dari harga normal`,
                                            }),
                                            t('bundling.checkout.benefitAccess', {
                                                count: bundle.bundle_items_count,
                                                defaultValue: `Akses ke ${bundle.bundle_items_count} program pembelajaran sekaligus`,
                                            }),
                                            t('bundling.checkout.benefitCertificates', 'Sertifikat untuk semua program yang diselesaikan'),
                                            t('bundling.checkout.benefitLifetime', 'Akses selamanya ke semua materi pembelajaran'),
                                            t('bundling.checkout.benefitUpdates', 'Update materi gratis selamanya'),
                                            t('bundling.checkout.benefitSupport', 'Prioritas support dari tim instruktur'),
                                        ].map((benefit, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                className="group flex items-start gap-3 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 p-4 transition-all hover:shadow-md dark:from-green-950/20 dark:to-emerald-950/20"
                                            >
                                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform group-hover:scale-110">
                                                    <Check className="h-4 w-4" />
                                                </div>
                                                <p className="text-sm leading-relaxed font-medium text-gray-700 dark:text-gray-300">{benefit}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {!isLoggedIn && (
                            <form
                                className="mt-6 flex flex-col gap-6 rounded-2xl border bg-white/95 p-6 shadow-xl backdrop-blur-sm dark:bg-gray-800/95"
                                onSubmit={submit}
                            >
                                <h1 className="text-xl font-bold">{t('bundling.checkout.personalDataTitle', 'Masukkan Data Diri Anda')}</h1>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">{t('bundling.checkout.emailLabel', 'Email')}</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                tabIndex={1}
                                                autoComplete="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                disabled={processing}
                                                placeholder="email@example.com"
                                                className="pr-10"
                                            />
                                            {checkingEmail && (
                                                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                    <LoaderCircle className="h-4 w-4 animate-spin text-gray-400" />
                                                </div>
                                            )}
                                            {!checkingEmail && emailExists && (
                                                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                    <Check className="h-5 w-5 text-green-600" />
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={async () => {
                                                if (!data.email || !data.email.includes('@')) {
                                                    toast.error(t('bundling.checkout.emailValidRequired', 'Masukkan email yang valid'));
                                                    return;
                                                }

                                                setCheckingEmail(true);
                                                try {
                                                    const response = await axios.post('/api/check-email', {
                                                        email: data.email,
                                                    });

                                                    if (response.data.exists) {
                                                        setEmailExists(true);
                                                        setData('name', response.data.name || '');
                                                        setData('phone_number', response.data.phone_number || '');
                                                        setData('instance', response.data.instance || '');
                                                        setData('city', response.data.city || '');
                                                        toast.success(t('bundling.checkout.emailFound', 'Email ditemukan!'));
                                                    } else {
                                                        setEmailExists(false);
                                                        toast.info(t('bundling.checkout.emailNotRegistered', 'Email tidak terdaftar'));
                                                    }
                                                } catch (error) {
                                                    console.error('Error checking email:', error);
                                                    setEmailExists(false);
                                                    toast.error(t('bundling.checkout.checkEmailFailed', 'Gagal mengecek email'));
                                                } finally {
                                                    setCheckingEmail(false);
                                                }
                                            }}
                                            disabled={checkingEmail || !data.email}
                                            className="flex-shrink-0"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {emailExists && (
                                        <p className="text-xs text-green-600">
                                            {t('bundling.checkout.emailFound', 'Email ditemukan, data terisi otomatis')}
                                        </p>
                                    )}
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">{t('bundling.checkout.nameLabel', 'Nama')}</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            tabIndex={2}
                                            autoComplete="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            disabled={processing || emailExists}
                                            placeholder={t('bundling.checkout.namePlaceholder', 'Nama lengkap Anda')}
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phone_number">{t('bundling.checkout.phoneLabel', 'No. Telepon')}</Label>
                                        <Input
                                            id="phone_number"
                                            type="tel"
                                            required
                                            tabIndex={3}
                                            autoComplete="tel"
                                            value={data.phone_number}
                                            onChange={(e) => setData('phone_number', e.target.value)}
                                            disabled={processing}
                                            placeholder={t('bundling.checkout.phonePlaceholder', '08xxxxxxxxxx')}
                                        />
                                        {!emailExists && (
                                            <p className="text-xs text-gray-500">
                                                {t('bundling.checkout.phoneNotice', 'Nomor telepon akan digunakan sebagai password anda')}
                                            </p>
                                        )}
                                        {emailExists && (
                                            <p className="text-xs text-blue-600">
                                                {t('bundling.checkout.phoneMatchNotice', 'Pastikan nomor telepon sesuai dengan yang terdaftar')}
                                            </p>
                                        )}
                                        <InputError message={errors.phone_number} />
                                    </div>
                                    <div className="grid gap-2 pb-2">
                                        <Label htmlFor="instance">{t('bundling.checkout.instanceLabel', 'Instansi/Perusahaan')}</Label>
                                        <Input
                                            id="instance"
                                            type="text"
                                            tabIndex={4}
                                            autoComplete="organization"
                                            value={data.instance}
                                            onChange={(e) => setData('instance', e.target.value)}
                                            disabled={processing}
                                            placeholder={t('bundling.checkout.instancePlaceholder', 'Instansi atau perusahaan Anda')}
                                            required
                                        />
                                        <InputError message={errors.instance} />
                                    </div>
                                    <div className="grid gap-2 pb-2">
                                        <Label htmlFor="city">{t('bundling.checkout.cityLabel', 'Kota Domisili')}</Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            tabIndex={5}
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            disabled={processing}
                                            placeholder={t('bundling.checkout.cityPlaceholder', 'Kota domisili Anda')}
                                            required
                                        />
                                        <InputError message={errors.city} />
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Payment Channels Section - only show when no pending invoice and no access */}
                        {/* {channels.length > 0 && !pendingInvoice && !hasAccess && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6">
                                <Card className="p-6">
                                    <div className="mb-6">
                                        <h2 className="mb-2 text-2xl font-bold">Metode Pembayaran</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Pilih metode pembayaran yang Anda inginkan</p>
                                    </div>

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
                                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                                Biaya Admin
                                                            </span>
                                                            <span className="font-semibold text-orange-600">
                                                                {rupiahFormatter.format(calculateAdminFee(channel))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )} */}
                    </motion.div>

                    {/* Right Column - Checkout/Status Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-1">
                        <div className="sticky top-4">
                            {hasAccess && (!activeInstallment || activeInstallment.is_fully_paid) ? (
                                <Card className="overflow-hidden border-2 border-green-500/20">
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center dark:from-green-950/20 dark:to-emerald-950/20">
                                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                                            <BadgeCheck className="h-10 w-10 text-white" />
                                        </div>

                                        <h2 className="mb-3 text-2xl font-bold text-green-900 dark:text-green-100">
                                            {t('bundling.checkout.alreadyHaveAccessTitle', 'Sudah Terdaftar')}
                                        </h2>
                                        <p className="mb-6 text-sm text-green-700 dark:text-green-300">
                                            {t(
                                                'bundling.checkout.alreadyHaveAccessDesc',
                                                'Anda sudah memiliki akses ke paket bundling ini. Lanjutkan belajar untuk menyelesaikan materi.'
                                            )}
                                        </p>

                                        <Button
                                            asChild
                                            size="lg"
                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                        >
                                            <Link href={route('profile.index')}>
                                                <Play className="mr-2 h-4 w-4" />
                                                {t('bundling.checkout.btnGoToProfile', 'Lihat Dashboard')}
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>
                            ) : pendingInvoice ? (
                                <Card className="overflow-hidden border-2">
                                    <div
                                        className="border-b p-4"
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
                                                            <h2 className="text-lg font-semibold text-red-700">
                                                                {t('bundling.checkout.paymentExpiredTitle', 'Pembayaran Kedaluwarsa')}
                                                            </h2>
                                                        </>
                                                    );
                                                }
                                                return (
                                                    <>
                                                        <Hourglass className="h-5 w-5 text-yellow-600" />
                                                        <h2 className="text-lg font-semibold text-yellow-900">
                                                            {t('bundling.checkout.pendingInvoiceTitle', 'Transaksi Menunggu Pembayaran')}
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
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {t('bundling.checkout.invoiceNoLabel', 'No. Invoice')}
                                                </span>
                                                <span className="font-semibold text-gray-900 dark:text-white">{pendingInvoice.invoice_code}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {t('bundling.checkout.totalPayment', 'Total Pembayaran')}
                                                </span>
                                                <span className="text-xl font-bold text-orange-600">
                                                    {rupiahFormatter.format(pendingInvoice.amount)}
                                                </span>
                                            </div>
                                        </div>

                                        {(() => {
                                            const expiryInfo = formatExpiryTime(pendingInvoice.expires_at);
                                            const isExpired = expiryInfo.status === 'expired' && pendingInvoice.status === 'pending';

                                            if (isExpired) {
                                                return (
                                                    <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                                                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                                            {t(
                                                                'bundling.checkout.expiredNotice',
                                                                'Waktu pembayaran telah habis. Silakan batalkan transaksi untuk membuat pesanan baru atau hubungi'
                                                            )}
                                                            &nbsp;
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

                                            return null;
                                        })()}

                                        <div className="space-y-2 pt-2">
                                            {pendingInvoice.invoice_url && formatExpiryTime(pendingInvoice.expires_at).status !== 'expired' && (
                                                <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold" size="lg">
                                                    <a href={pendingInvoice.invoice_url}>
                                                        {t('bundling.checkout.btnContinuePayment', 'Lanjutkan Pembayaran')}
                                                    </a>
                                                </Button>
                                            )}

                                            <div className="flex gap-2">
                                                <Button onClick={() => window.location.reload()} variant="outline" className="flex-1" size="lg">
                                                    {t('bundling.checkout.btnCheckStatus', 'Cek Status')}
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                                                    size="lg"
                                                    disabled={cancellingInvoice}
                                                    onClick={async () => {
                                                        if (
                                                            confirm(
                                                                t(
                                                                    'bundling.checkout.confirmCancel',
                                                                    'Apakah Anda yakin ingin membatalkan transaksi ini dan membuat pesanan baru?'
                                                                )
                                                            )
                                                        ) {
                                                            setCancellingInvoice(true);
                                                            try {
                                                                await axios.post(route('invoice.cancel', pendingInvoice.id));
                                                                toast.success(t('bundling.checkout.cancelSuccess', 'Pesanan berhasil dibatalkan.'));
                                                                window.location.reload();
                                                            } catch (err: any) {
                                                                toast.error(
                                                                    err.response?.data?.message ||
                                                                        t('bundling.checkout.cancelFailed', 'Gagal membatalkan pesanan.')
                                                                );
                                                                setCancellingInvoice(false);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {cancellingInvoice
                                                        ? t('bundling.checkout.cancelling', 'Membatalkan...')
                                                        : t('bundling.checkout.btnCancelOrder', 'Batalkan Pesanan')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="overflow-hidden border-2">
                                    <div className="bg-primary border-b p-4">
                                        <h2 className="text-center text-lg font-bold text-white">
                                            {t('bundling.checkout.paymentDetailTitle', 'Detail Pembayaran')}
                                        </h2>
                                    </div>

                                    <form onSubmit={handleCheckout} className="px-4 pt-4 pb-6">
                                        {((installmentTerms && installmentTerms.length > 0) || (activeInstallment && !activeInstallment.is_fully_paid)) ? (
                                            <Tabs
                                                value={paymentTab}
                                                onValueChange={(val) => {
                                                    if (val === 'full' && activeInstallment && !activeInstallment.is_fully_paid) {
                                                        toast.error(
                                                            t(
                                                                'bundling.checkout.errors.fullPaymentDisabled',
                                                                'Anda memiliki cicilan aktif. Pembayaran penuh dinonaktifkan.'
                                                            )
                                                        );
                                                        return;
                                                    }
                                                    if (val === 'installment' && isAnyTermOverdue && !activeInstallment) {
                                                        toast.error(
                                                            t(
                                                                'bundling.checkout.errors.installmentOverdue',
                                                                'Batas waktu pembayaran cicilan telah terlewat.'
                                                            )
                                                        );
                                                        return;
                                                    }
                                                    setPaymentTab(val as 'full' | 'installment');
                                                }}
                                                className="w-full space-y-4"
                                            >
                                                <TabsList className="grid w-full grid-cols-2 h-10">
                                                    <TabsTrigger
                                                        value="full"
                                                        disabled={!!activeInstallment && !activeInstallment.is_fully_paid}
                                                        className="text-xs sm:text-sm"
                                                    >
                                                        {t('bundling.checkout.tabFullPayment', 'Bayar Penuh')}
                                                    </TabsTrigger>
                                                    <TabsTrigger value="installment" disabled={isAnyTermOverdue && !activeInstallment} className="text-xs sm:text-sm">
                                                        {t('bundling.checkout.tabInstallment', 'Cicilan')} ({activeInstallment && !activeInstallment.is_fully_paid ? (activeInstallment.total_terms || activeInstallment.terms?.length) : installmentTerms.length}x)
                                                    </TabsTrigger>
                                                </TabsList>

                                                {/* Tab Bayar Penuh */}
                                                <TabsContent value="full" className="space-y-4 m-0">
                                                    <div className="space-y-4">
                                                        {/* Jenis Kode */}
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                                <Tag className="h-4 w-4" />
                                                                {t('bundling.checkout.codeType', 'Jenis Kode')}
                                                            </Label>
                                                            <RadioGroup
                                                                value={codeType}
                                                                onValueChange={(val: 'voucher' | 'referral') => {
                                                                    setCodeType(val);
                                                                    setPromoCode('');
                                                                    setDiscountData(null);
                                                                    setReferralData(null);
                                                                    setPromoError('');
                                                                    setReferralError('');
                                                                }}
                                                                className="flex gap-4"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="voucher" id="bund-code-voucher" />
                                                                    <Label htmlFor="bund-code-voucher" className="cursor-pointer text-sm">
                                                                        {t('bundling.checkout.voucher', 'Voucher')}
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="referral" id="bund-code-referral" />
                                                                    <Label htmlFor="bund-code-referral" className="cursor-pointer text-sm">
                                                                        {t('bundling.checkout.referral', 'Referral')}
                                                                    </Label>
                                                                </div>
                                                            </RadioGroup>
                                                        </div>

                                                        {/* Input Kode */}
                                                        <div className="space-y-2">
                                                            <Label htmlFor="promo-code" className="text-sm font-medium">
                                                                {codeType === 'voucher'
                                                                    ? t('bundling.checkout.voucherCode', 'Kode Voucher / Promo')
                                                                    : t('bundling.checkout.referralCode', 'Kode Referral')}
                                                            </Label>
                                                            <div className="flex gap-2">
                                                                <div className="relative flex-1">
                                                                    <Input
                                                                        id="promo-code"
                                                                        type="text"
                                                                        placeholder={
                                                                            codeType === 'voucher'
                                                                                ? t('bundling.checkout.enterVoucherCode', 'Masukkan kode promo')
                                                                                : t('bundling.checkout.enterReferralCode', 'Masukkan kode referral')
                                                                        }
                                                                        value={promoCode}
                                                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                                        className="pr-10"
                                                                    />
                                                                    {(promoLoading || referralLoading) && (
                                                                        <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                                            <LoaderCircle className="h-4 w-4 animate-spin text-gray-400" />
                                                                        </div>
                                                                    )}
                                                                    {!(promoLoading || referralLoading) && promoCode && (
                                                                        <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                                            {codeType === 'voucher' ? (
                                                                                discountData?.valid ? (
                                                                                    <Check className="h-5 w-5 text-green-600" />
                                                                                ) : promoError ? (
                                                                                    <X className="h-5 w-5 text-red-600" />
                                                                                ) : null
                                                                            ) : (
                                                                                referralData?.valid ? (
                                                                                    <Check className="h-5 w-5 text-green-600" />
                                                                                ) : referralError ? (
                                                                                    <X className="h-5 w-5 text-red-600" />
                                                                                ) : null
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={async () => {
                                                                        if (!promoCode.trim()) {
                                                                            toast.error(
                                                                                t('bundling.checkout.errors.enterCodeRequired', {
                                                                                    type: codeType === 'voucher' ? 'promo' : 'referral',
                                                                                    defaultValue: `Masukkan kode ${codeType === 'voucher' ? 'promo' : 'referral'} terlebih dahulu`,
                                                                                })
                                                                            );
                                                                            return;
                                                                        }
                                                                        if (codeType === 'voucher') await validatePromoCode();
                                                                        else await validateReferralCode();
                                                                    }}
                                                                    disabled={promoLoading || referralLoading || !promoCode.trim()}
                                                                    className="flex-shrink-0"
                                                                >
                                                                    <RefreshCw className="h-4 w-4" />
                                                                </Button>
                                                            </div>

                                                            {/* Voucher feedback */}
                                                            {codeType === 'voucher' && promoError && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/20"
                                                                >
                                                                    <X className="h-4 w-4 flex-shrink-0 text-red-600" />
                                                                    <p className="text-sm text-red-600 dark:text-red-400">{promoError}</p>
                                                                </motion.div>
                                                            )}
                                                            {codeType === 'voucher' && discountData?.valid && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-950/20 dark:to-emerald-950/20"
                                                                >
                                                                    <div className="mb-2 flex items-center gap-2">
                                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                                                                            <Check className="h-4 w-4 text-white" />
                                                                        </div>
                                                                        <p className="font-semibold text-green-800 dark:text-green-200">
                                                                            {t('bundling.checkout.voucherSuccess', {
                                                                                code: discountData.discount_code.code,
                                                                                defaultValue: `Promo "${discountData.discount_code.code}" diterapkan!`,
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-sm text-green-700 dark:text-green-300">
                                                                        <span className="font-mono font-bold">{discountData.discount_code.code}</span> -{' '}
                                                                        {discountData.discount_code.name}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                                                        {t('bundling.detail.register.saveLabel', 'Hemat')}{' '}
                                                                        {discountData.discount_code.formatted_value}
                                                                    </p>
                                                                </motion.div>
                                                            )}

                                                            {/* Referral feedback */}
                                                            {codeType === 'referral' && referralError && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/20"
                                                                >
                                                                    <X className="h-4 w-4 flex-shrink-0 text-red-600" />
                                                                    <p className="text-sm text-red-600 dark:text-red-400">{referralError}</p>
                                                                </motion.div>
                                                            )}
                                                            {codeType === 'referral' && referralData?.valid && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-950/20 dark:to-emerald-950/20"
                                                                >
                                                                    <div className="mb-2 flex items-center gap-2">
                                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                                                                            <Check className="h-4 w-4 text-white" />
                                                                        </div>
                                                                        <p className="font-semibold text-green-800 dark:text-green-200">
                                                                            {t('bundling.checkout.referralSuccess', 'Kode Referral Valid!')}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-sm text-green-700 dark:text-green-300">
                                                                        {t('bundling.checkout.referralReferredBy', {
                                                                            name: referralData.referrer?.name,
                                                                            defaultValue: `Pembelian Anda dirujuk oleh ${referralData.referrer?.name}. Reward poin akan masuk setelah pembayaran sukses.`,
                                                                        })}
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Price Breakdown */}
                                                    <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {t('bundling.checkout.bundlePrice', 'Harga Paket')}
                                                            </span>
                                                            <span className="font-semibold">{rupiahFormatter.format(bundle.price)}</span>
                                                        </div>

                                                        {discountData?.valid && (
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                                    <Gift className="h-3.5 w-3.5" />
                                                                    {t('bundling.checkout.promoDiscount', {
                                                                        code: discountData.discount_code.code,
                                                                        defaultValue: `Promo (${discountData.discount_code.code})`,
                                                                    })}
                                                                </span>
                                                                <span className="font-semibold text-green-600">
                                                                    -{rupiahFormatter.format(discountData.discount_amount)}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {t('bundling.checkout.transactionFee', 'Biaya Transaksi')}
                                                            </span>
                                                            <span className="font-semibold">{rupiahFormatter.format(adminFee)}</span>
                                                        </div>

                                                        <Separator />

                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold">
                                                                {t('bundling.checkout.totalPayment', 'Total Pembayaran')}
                                                            </span>
                                                            <span className="text-2xl font-bold text-orange-600">
                                                                {rupiahFormatter.format(totalPrice)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Security Note */}
                                                    <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
                                                        <Shield className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                                        <div className="text-xs text-blue-700 dark:text-blue-300">
                                                            <p className="mb-1 font-semibold">
                                                                {t('bundling.checkout.securityTitle', 'Pembayaran Aman & Terpercaya')}
                                                            </p>
                                                            <p>{t('bundling.checkout.securityDesc', 'Transaksi Anda dilindungi dengan enkripsi SSL')}</p>
                                                        </div>
                                                    </div>

                                                    {/* Terms Checkbox */}
                                                    <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                                                        <Checkbox
                                                            id="terms"
                                                            checked={termsAccepted}
                                                            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                                            className="mt-0.5"
                                                        />
                                                        <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed">
                                                            {t('bundling.checkout.agreeTerms', 'Saya menyetujui')}{' '}
                                                            <a
                                                                href="/terms-and-conditions"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-medium text-blue-600 hover:underline"
                                                            >
                                                                {t('bundling.checkout.termsAndConditions', 'syarat dan ketentuan')}
                                                            </a>{' '}
                                                            {t('bundling.checkout.termsApplicable', 'yang berlaku')}
                                                        </Label>
                                                    </div>

                                                    {/* Submit Button */}
                                                    <Button type="submit" size="lg" disabled={!termsAccepted || loading} className="w-full disabled:opacity-50">
                                                        {loading ? (
                                                            <>
                                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                                {t('bundling.checkout.processing', 'Memproses...')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CreditCard className="mr-2 h-5 w-5" />
                                                                {t('bundling.checkout.btnPayNow', 'Lanjutkan Pembayaran')}
                                                            </>
                                                        )}
                                                    </Button>
                                                </TabsContent>

                                                {/* Tab Cicilan */}
                                                <TabsContent value="installment" className="space-y-4 m-0">
                                                    <InstallmentOptions
                                                        productType="bundle"
                                                        productId={bundle.id}
                                                        productPrice={bundle.price}
                                                        terms={installmentTerms}
                                                        activeInstallment={activeInstallment}
                                                        termsAccepted={termsAccepted}
                                                        onTermsAcceptedChange={setTermsAccepted}
                                                        onBeforePay={async () => {
                                                            if (!activeInstallment && !termsAccepted) {
                                                                toast.error(t('bundling.checkout.errors.termsRequired', 'Anda harus menyetujui syarat dan ketentuan!'));
                                                                return false;
                                                            }
                                                            return await ensureAuth();
                                                        }}
                                                    />
                                                </TabsContent>
                                            </Tabs>
                                        ) : (
                                            <>
                                                <div className="mb-4 space-y-4">
                                                    {/* Jenis Kode */}
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium flex items-center gap-2">
                                                            <Tag className="h-4 w-4" />
                                                            {t('bundling.checkout.codeType', 'Jenis Kode')}
                                                        </Label>
                                                        <RadioGroup
                                                            value={codeType}
                                                            onValueChange={(val: 'voucher' | 'referral') => {
                                                                setCodeType(val);
                                                                setPromoCode('');
                                                                setDiscountData(null);
                                                                setReferralData(null);
                                                                setPromoError('');
                                                                setReferralError('');
                                                            }}
                                                            className="flex gap-4"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="voucher" id="bund-code-voucher" />
                                                                <Label htmlFor="bund-code-voucher" className="cursor-pointer text-sm">
                                                                    {t('bundling.checkout.voucher', 'Voucher')}
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="referral" id="bund-code-referral" />
                                                                <Label htmlFor="bund-code-referral" className="cursor-pointer text-sm">
                                                                    {t('bundling.checkout.referral', 'Referral')}
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>

                                                    {/* Input Kode */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="promo-code" className="text-sm font-medium">
                                                            {codeType === 'voucher'
                                                                ? t('bundling.checkout.voucherCode', 'Kode Voucher / Promo')
                                                                : t('bundling.checkout.referralCode', 'Kode Referral')}
                                                        </Label>
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <Input
                                                                    id="promo-code"
                                                                    type="text"
                                                                    placeholder={
                                                                        codeType === 'voucher'
                                                                            ? t('bundling.checkout.enterVoucherCode', 'Masukkan kode promo')
                                                                            : t('bundling.checkout.enterReferralCode', 'Masukkan kode referral')
                                                                    }
                                                                    value={promoCode}
                                                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                                    className="pr-10"
                                                                />
                                                                {(promoLoading || referralLoading) && (
                                                                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                                        <LoaderCircle className="h-4 w-4 animate-spin text-gray-400" />
                                                                    </div>
                                                                )}
                                                                {!(promoLoading || referralLoading) && promoCode && (
                                                                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                                        {codeType === 'voucher' ? (
                                                                            discountData?.valid ? (
                                                                                <Check className="h-5 w-5 text-green-600" />
                                                                            ) : promoError ? (
                                                                                <X className="h-5 w-5 text-red-600" />
                                                                            ) : null
                                                                        ) : (
                                                                            referralData?.valid ? (
                                                                                <Check className="h-5 w-5 text-green-600" />
                                                                            ) : referralError ? (
                                                                                <X className="h-5 w-5 text-red-600" />
                                                                            ) : null
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={async () => {
                                                                    if (!promoCode.trim()) {
                                                                        toast.error(
                                                                            t('bundling.checkout.errors.enterCodeRequired', {
                                                                                type: codeType === 'voucher' ? 'promo' : 'referral',
                                                                                defaultValue: `Masukkan kode ${codeType === 'voucher' ? 'promo' : 'referral'} terlebih dahulu`,
                                                                            })
                                                                        );
                                                                        return;
                                                                    }
                                                                    if (codeType === 'voucher') await validatePromoCode();
                                                                    else await validateReferralCode();
                                                                }}
                                                                disabled={promoLoading || referralLoading || !promoCode.trim()}
                                                                className="flex-shrink-0"
                                                            >
                                                                <RefreshCw className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        {/* Voucher feedback */}
                                                        {codeType === 'voucher' && promoError && <p className="text-sm text-red-600">{promoError}</p>}
                                                        {codeType === 'voucher' && discountData?.valid && (
                                                            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                                                                <div className="flex items-center gap-2">
                                                                    <Check className="h-4 w-4 text-green-600" />
                                                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                                        {t('bundling.checkout.voucherSuccess', {
                                                                            code: discountData.discount_code.code,
                                                                            defaultValue: `Promo "${discountData.discount_code.code}" diterapkan!`,
                                                                        })}
                                                                    </p>
                                                                </div>
                                                                <p className="mt-1 text-xs text-green-600 dark:text-green-300">
                                                                    {discountData.discount_code.name}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Referral feedback */}
                                                        {codeType === 'referral' && referralError && <p className="text-sm text-red-600">{referralError}</p>}
                                                        {codeType === 'referral' && referralData?.valid && (
                                                            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                                                                <div className="flex items-center gap-2">
                                                                    <Check className="h-4 w-4 text-green-600" />
                                                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                                        {t('bundling.checkout.referralSuccess', 'Kode Referral Valid!')}
                                                                    </p>
                                                                </div>
                                                                <p className="mt-1 text-xs text-green-600 dark:text-green-300">
                                                                    {t('bundling.checkout.referralReferredBy', {
                                                                        name: referralData.referrer?.name,
                                                                        defaultValue: `Pembelian Anda dirujuk oleh ${referralData.referrer?.name}. Reward poin akan masuk setelah pembayaran sukses.`,
                                                                    })}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Price Breakdown */}
                                                <div className="mb-6 space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900/50">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {t('bundling.checkout.normalPrice', 'Harga Normal')}
                                                        </span>
                                                        <span className="font-medium text-gray-500 line-through">
                                                            {rupiahFormatter.format(bundle.strikethrough_price)}
                                                        </span>
                                                    </div>

                                                    {bundleDiscount > 0 && (
                                                        <>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    {t('bundling.checkout.bundleDiscount', 'Diskon Bundle')}
                                                                </span>
                                                                <span className="font-semibold text-red-600">-{rupiahFormatter.format(bundleDiscount)}</span>
                                                            </div>
                                                            <Separator />
                                                        </>
                                                    )}

                                                    {discountData?.valid && (
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {t('bundling.checkout.promoDiscount', {
                                                                    code: discountData.discount_code.code,
                                                                    defaultValue: `Diskon Promo (${discountData.discount_code.code})`,
                                                                })}
                                                            </span>
                                                            <span className="font-semibold text-green-600">
                                                                -{rupiahFormatter.format(discountData.discount_amount)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {t('bundling.checkout.bundlePrice', 'Harga Paket')}
                                                        </span>
                                                        <span className="font-semibold">{rupiahFormatter.format(bundle.price)}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {t('bundling.checkout.transactionFee', 'Biaya Transaksi')}
                                                        </span>
                                                        <span className="font-semibold">{rupiahFormatter.format(adminFee)}</span>
                                                    </div>

                                                    <Separator />

                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold">
                                                            {t('bundling.checkout.totalPayment', 'Total Pembayaran')}
                                                        </span>
                                                        <div className="text-right">
                                                            {bundleDiscount > 0 && (
                                                                <div className="text-xs text-gray-500 line-through">
                                                                    {rupiahFormatter.format(bundle.strikethrough_price + adminFee)}
                                                                </div>
                                                            )}
                                                            <span className="text-2xl font-bold text-blue-600">{rupiahFormatter.format(totalPrice)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Referral Info */}
                                                {referralInfo.hasActive && (
                                                    <div className="mb-4 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-950/20 dark:to-indigo-950/20">
                                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                                                            {t('bundling.checkout.referralActiveNotice', {
                                                                code: referralInfo.code,
                                                                defaultValue: `🎁 Menggunakan kode referral: ${referralInfo.code}`,
                                                            })}
                                                        </p>
                                                        <p className="mt-1 text-xs text-blue-600 dark:text-blue-500">
                                                            {t('bundling.checkout.referralHelpFriend', 'Anda membantu teman Anda mendapatkan komisi!')}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Security Note */}
                                                <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
                                                    <Shield className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                                    <div className="text-xs text-blue-700 dark:text-blue-300">
                                                        <p className="mb-1 font-semibold">
                                                            {t('bundling.checkout.securityTitle', 'Pembayaran Aman & Terpercaya')}
                                                        </p>
                                                        <p>{t('bundling.checkout.securityDesc', 'Transaksi Anda dilindungi dengan enkripsi SSL')}</p>
                                                    </div>
                                                </div>

                                                {/* Terms Checkbox */}
                                                <div className="mb-4 flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                                                    <Checkbox
                                                        id="terms"
                                                        checked={termsAccepted}
                                                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                                        className="mt-0.5"
                                                    />
                                                    <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed">
                                                        {t('bundling.checkout.agreeTerms', 'Saya menyetujui')}{' '}
                                                        <a
                                                            href="/terms-and-conditions"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-medium text-blue-600 hover:underline"
                                                        >
                                                            {t('bundling.checkout.termsAndConditions', 'syarat dan ketentuan')}
                                                        </a>{' '}
                                                        {t('bundling.checkout.termsApplicable', 'yang berlaku')}
                                                    </Label>
                                                </div>

                                                {/* Submit Button */}
                                                <Button type="submit" size="lg" disabled={!termsAccepted || loading} className="w-full disabled:opacity-50">
                                                    {loading ? (
                                                        <>
                                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                            {t('bundling.checkout.processing', 'Memproses...')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CreditCard className="mr-2 h-5 w-5" />
                                                            {t('bundling.checkout.btnPayNow', 'Lanjutkan Pembayaran')}
                                                        </>
                                                    )}
                                                </Button>
                                            </>
                                        )}
                                    </form>
                                </Card>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>
            <Toaster position="top-center" richColors />
        </UserLayout>
    );
}
