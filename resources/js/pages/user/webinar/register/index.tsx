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
import { SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BadgeCheck, Calendar, Check, CreditCard, Gift, Hourglass, LoaderCircle, RefreshCw, Tag, User, X } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface Webinar {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    strikethrough_price: number;
    price: number;
    thumbnail?: string | null;
    description?: string | null;
    benefits?: string | null;
    group_url?: string | null;
    requirement_1?: string | null;
    requirement_2?: string | null;
    requirement_3?: string | null;
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
    payment_method?: string;
    invoice_url?: string | null;
    va_number?: string;
    qr_code_url?: string;
    bank_name?: string;
    created_at: string;
    expires_at: string;
}

interface InvoiceData {
    type: string;
    id: string;
    discount_amount: number;
    nett_amount: number;
    total_amount: number;
    discount_code_id?: string;
    discount_code_amount?: number;
    referral_code?: string;
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

type PendingCheckoutData = {
    webinarId: string;
    productType: 'webinar';
    termsAccepted: boolean;
    promoCode: string;
    discountData: DiscountData | null;
    timestamp: number;
    source: 'register' | 'login';
};

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

export default function RegisterWebinar({
    webinar,
    hasAccess,
    activeInstallment: initialActiveInstallment = null,
    pendingInvoice,
    transactionDetail,
    referralInfo,
    installmentTerms = [],
}: {
    webinar: Webinar;
    hasAccess: boolean;
    activeInstallment?: ActiveInstallmentData | null;
    pendingInvoice?: PendingInvoice | null;
    transactionDetail?: TransactionDetail | null;
    referralInfo: ReferralInfo;
    installmentTerms?: InstallmentTermOption[];
}) {
    const { t, i18n } = useTranslation('user');
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && !!auth.user?.phone_number && !!auth.user?.instance && !!auth.user?.city;

    const [emailExists, setEmailExists] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);
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
    const [codeType, setCodeType] = useState<'voucher' | 'referral'>('voucher');
    const [promoCode, setPromoCode] = useState('');
    const [discountData, setDiscountData] = useState<DiscountData | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [referralData, setReferralData] = useState<{ valid: boolean; referrer?: { name: string } } | null>(null);
    const [referralLoading, setReferralLoading] = useState(false);
    const [referralError, setReferralError] = useState('');

    const [showFreeForm, setShowFreeForm] = useState(false);
    const [freeFormData, setFreeFormData] = useState<Record<string, File | null>>({
        requirement_1_proof: null,
        requirement_2_proof: null,
        requirement_3_proof: null,
    });
    const [fileErrors, setFileErrors] = useState<Record<string, boolean>>({
        requirement_1_proof: false,
        requirement_2_proof: false,
        requirement_3_proof: false,
    });

    const submitInFlightRef = useRef(false);
    const pendingProcessedRef = useRef(false);
    const pendingTimerRef = useRef<number | null>(null);

    const benefitList = parseList(webinar.benefits);
    const isFree = webinar.price === 0;

    const basePrice = webinar.price;
    const discountAmount = discountData?.discount_amount || 0;
    const finalWebinarPrice = basePrice - discountAmount;

    const adminFee = isFree ? 0 : 5000;
    const totalPrice = isFree ? 0 : finalWebinarPrice + adminFee;

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
                    webinar_id: webinar.id,
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
            } catch {
                setEmailExists(false);
                setActiveInstallment(null);
            } finally {
                setCheckingEmail(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [data.email, setData, webinar.id]);

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

    useEffect(() => {
        if (!promoCode.trim() || isFree) {
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
    }, [promoCode, isFree, codeType]);

    const validateReferralCode = async () => {
        if (!promoCode.trim() || isFree) return;

        setReferralLoading(true);
        setReferralError('');

        try {
            const response = await axios.post('/api/referral/validate', { code: promoCode });
            const dataRes = response.data;

            if (dataRes.valid) {
                setReferralData(dataRes);
                setReferralError('');
            } else {
                setReferralData(null);
                setReferralError(dataRes.message || t('webinar.register.errors.invalidReferral', 'Kode referral tidak valid'));
            }
        } catch (error: any) {
            setReferralData(null);
            setReferralError(error.response?.data?.message || t('webinar.register.errors.referralValidateError', 'Terjadi kesalahan saat memvalidasi kode referral'));
        } finally {
            setReferralLoading(false);
        }
    };

    const validatePromoCode = async () => {
        if (!promoCode.trim() || isFree) return;

        setPromoLoading(true);
        setPromoError('');

        try {
            const payload: any = {
                code: promoCode,
                amount: webinar.price,
                product_type: 'webinar',
                product_id: webinar.id,
            };

            if (!isLoggedIn && emailExists && data.email) {
                payload.email = data.email;
            }

            const response = await axios.post('/api/discount-codes/validate', payload);

            if (response.data.valid) {
                setDiscountData(response.data);
                setPromoError('');
            } else {
                setDiscountData(null);
                setPromoError(response.data.message || t('webinar.register.errors.invalidPromo', 'Kode promo tidak valid'));
            }
        } catch (error: any) {
            setDiscountData(null);
            setPromoError(error.response?.data?.message || t('webinar.register.errors.promoValidateError', 'Terjadi kesalahan saat memvalidasi kode promo'));
        } finally {
            setPromoLoading(false);
        }
    };

    const refreshCSRFToken = async (): Promise<string> => {
        const response = await fetch('/csrf-token', {
            method: 'GET',
            credentials: 'same-origin',
        });
        const dataRes = await response.json();

        const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
        if (metaTag) metaTag.content = dataRes.token;

        return dataRes.token;
    };

    const createInvoicePayload = (overrideDiscount?: DiscountData | null): InvoiceData => {
        const activeDiscount = overrideDiscount ?? discountData;
        const originalDiscountAmount = webinar.strikethrough_price > 0 ? webinar.strikethrough_price - webinar.price : 0;
        const promoDiscountAmount = activeDiscount?.discount_amount || 0;

        const payload: InvoiceData = {
            type: 'webinar',
            id: webinar.id,
            discount_amount: originalDiscountAmount + promoDiscountAmount,
            nett_amount: webinar.price - promoDiscountAmount,
            total_amount: webinar.price - promoDiscountAmount + 5000,
        };

        if (activeDiscount?.valid && codeType === 'voucher') {
            payload.discount_code_id = activeDiscount.discount_code.id;
            payload.discount_code_amount = activeDiscount.discount_amount;
        }

        if (codeType === 'referral' && referralData?.valid) {
            payload.referral_code = promoCode;
        }

        const storedAffiliate = sessionStorage.getItem('affiliate_code') || new URLSearchParams(window.location.search).get('ref');
        if (storedAffiliate) {
            (payload as any).affiliate_code = storedAffiliate;
        }

        return payload;
    };

    const submitPayment = async (payload: InvoiceData): Promise<void> => {
        try {
            const res = await axios.post(route('invoice.store'), payload);

            if (res.data && res.data.success) {
                if (res.data.payment_url) {
                    sessionStorage.removeItem('pendingCheckout');
                    window.location.href = res.data.payment_url;
                } else {
                    throw new Error(t('webinar.register.errors.paymentUrlError', 'Payment URL tidak diterima dari server.'));
                }
            } else {
                throw new Error(res.data?.message || t('webinar.register.errors.createInvoiceFailed', 'Gagal membuat invoice.'));
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            throw error;
        }
    };

    const handleFreeCheckout = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isProfileComplete) {
            toast.error(t('webinar.register.incompleteProfileDesc', 'Profil Anda belum lengkap! Harap lengkapi nomor telepon, instansi, dan kota domisili terlebih dahulu untuk mendaftar webinar.'));
            setTimeout(() => {
                window.location.href = route('profile.edit');
            }, 1500);
            return;
        }

        if (!freeFormData.requirement_1_proof || !freeFormData.requirement_2_proof || !freeFormData.requirement_3_proof) {
            toast.error(t('webinar.register.errors.uploadAllProof', 'Harap upload semua bukti yang diperlukan!'));
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('type', 'webinar');
        formData.append('id', webinar.id);
        formData.append('requirement_1_proof', freeFormData.requirement_1_proof);
        formData.append('requirement_2_proof', freeFormData.requirement_2_proof);
        formData.append('requirement_3_proof', freeFormData.requirement_3_proof);

        router.post(route('enroll.free'), formData, {
            onError: (errors) => {
                toast.error(errors.message || t('webinar.register.errors.enrollFreeFailed', 'Gagal mendaftar webinar gratis.'));
            },
            onFinish: () => setLoading(false),
        });
    };

    const ensureAuth = async (): Promise<boolean> => {
        if (isLoggedIn) return true;

        if (!data.email || !data.name || !data.phone_number || !data.instance || !data.city) {
            toast.error(t('webinar.register.errors.completePersonalData', 'Lengkapi semua data diri terlebih dahulu.'));
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
                    throw new Error(response.data.message || t('webinar.register.errors.autoLoginFailed', 'Gagal login otomatis. Pastikan nomor telepon sesuai dengan yang terdaftar.'));
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
                    throw new Error(t('webinar.register.errors.registerFailed', 'Gagal registrasi.'));
                }
            }
            return true;
        } catch (error: any) {
            console.error('Login/Register error:', error);
            toast.error(error.response?.data?.message || error.message || t('webinar.register.errors.processLoginFailed', 'Gagal memproses login/registrasi otomatis.'));
            return false;
        }
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (activeInstallment && !activeInstallment.is_fully_paid) {
            toast.error(t('webinar.register.activeInstallmentAlert', 'Anda sedang memiliki program cicilan berjalan. Silakan selesaikan pembayaran melalui tab Cicilan.'));
            setPaymentTab('installment');
            return;
        }

        // 1. Jika belum login, lakukan registrasi / login terlebih dahulu
        if (!isLoggedIn) {
            if (!termsAccepted && !isFree) {
                toast.error(t('webinar.register.errors.termsRequired', 'Anda harus menyetujui syarat dan ketentuan!'));
                return;
            }

            setLoading(true);

            const authed = await ensureAuth();
            if (!authed) {
                setLoading(false);
                return;
            }

            try {
                if (isFree) {
                    setShowFreeForm(true);
                    setLoading(false);
                    return;
                }

                // Langsung jalankan submitPayment tanpa reload!
                await submitPayment(createInvoicePayload());
            } catch (error: any) {
                setLoading(false);
                toast.error(error.response?.data?.message || error.message || t('webinar.register.errors.paymentFailed', 'Gagal memproses pembayaran.'));
            }
            return;
        }

        // 2. Jika sudah login
        if (!termsAccepted && !isFree) {
            toast.error(t('webinar.register.errors.termsRequired', 'Anda harus menyetujui syarat dan ketentuan!'));
            return;
        }

        if (submitInFlightRef.current) return;
        submitInFlightRef.current = true;
        setLoading(true);

        if (isFree) {
            setShowFreeForm(true);
            setLoading(false);
            submitInFlightRef.current = false;
            return;
        }

        try {
            await submitPayment(createInvoicePayload());
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || t('webinar.register.errors.paymentFailed', 'Terjadi kesalahan saat proses pembayaran.'));
            setLoading(false);
            submitInFlightRef.current = false;
        }
    };

    useEffect(() => {
        const raw = sessionStorage.getItem('pendingCheckout');
        if (!raw || !isLoggedIn || pendingProcessedRef.current) return;

        pendingProcessedRef.current = true;

        let checkoutData: PendingCheckoutData;
        try {
            checkoutData = JSON.parse(raw);
        } catch {
            sessionStorage.removeItem('pendingCheckout');
            return;
        }

        const fiveMinutes = 5 * 60 * 1000;
        if (Date.now() - (checkoutData.timestamp || 0) > fiveMinutes) {
            sessionStorage.removeItem('pendingCheckout');
            toast.error(t('webinar.register.errors.sessionExpired', 'Sesi checkout telah kadaluarsa'));
            return;
        }

        if (checkoutData.webinarId !== webinar.id) {
            sessionStorage.removeItem('pendingCheckout');
            return;
        }

        if (checkoutData.source !== 'register') {
            sessionStorage.removeItem('pendingCheckout');
            return;
        }

        if (checkoutData.promoCode) setPromoCode(checkoutData.promoCode);
        if (checkoutData.discountData) setDiscountData(checkoutData.discountData);
        setTermsAccepted(!!checkoutData.termsAccepted);

        pendingTimerRef.current = window.setTimeout(async () => {
            if (submitInFlightRef.current) return;
            submitInFlightRef.current = true;
            setLoading(true);

            try {
                await submitPayment(createInvoicePayload(checkoutData.discountData ?? null));
            } catch (error: any) {
                toast.error(error.message || t('webinar.register.errors.paymentFailed', 'Terjadi kesalahan saat proses pembayaran.'));
                sessionStorage.removeItem('pendingCheckout');
                setLoading(false);
                submitInFlightRef.current = false;
            }
        }, 1200);

        return () => {
            if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
        };
    }, [isLoggedIn, webinar.id]);

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
            toast.error(t('webinar.register.errors.fileTooLarge', 'Ukuran file terlalu besar. Maksimal 2MB.'));
            return;
        }

        if (!file.type.startsWith('image/')) {
            setFileErrors((prev) => ({ ...prev, [fieldName]: true }));
            const input = document.querySelector(`input[data-field="${fieldName}"]`) as HTMLInputElement;
            if (input) input.value = '';
            toast.error(t('webinar.register.errors.fileMustBeImage', 'Hanya file gambar (JPG, PNG, GIF, dll) yang diperbolehkan.'));
            return;
        }

        setFreeFormData((prev) => ({ ...prev, [fieldName]: file }));
        setFileErrors((prev) => ({ ...prev, [fieldName]: false }));
        toast.success(t('webinar.register.errors.fileUploaded', 'File berhasil diunggah.'));
    };

    const formatExpiryTime = (expiresAt: string): { time: string; status: 'expired' | 'urgent' | 'normal' } => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) return { time: t('webinar.register.alreadyExpired', 'Sudah kadaluarsa'), status: 'expired' };

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours < 1) return { time: `${minutes} ${t('webinar.register.minutesLeft', 'menit lagi')}`, status: 'urgent' };
        return { time: `${hours} jam ${minutes} ${t('webinar.register.minutesLeft', 'menit lagi')}`, status: hours < 3 ? 'urgent' : 'normal' };
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => toast.success(t('webinar.register.copySuccess', 'Berhasil menyalin ke clipboard!')));
    };

    if (isLoggedIn && !isProfileComplete) {
        return (
            <UserLayout>
                <Head title={t('webinar.register.incompleteProfileTitle', 'Lengkapi Profil')} />

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
                            <span className="text-sm font-medium text-white">{t('webinar.register.incompleteProfileTitle', 'Profil Belum Lengkap')}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                        >
                            {webinar.title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-orange-100"
                        >
                            {t('webinar.register.incompleteProfileDesc', 'Lengkapi profil Anda terlebih dahulu untuk melanjutkan')}
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

                                <h2 className="mb-3 text-center text-2xl font-bold">{t('webinar.register.incompleteProfileTitle', 'Lengkapi Profil Anda')}</h2>
                                <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
                                    {t('webinar.register.incompleteProfileDesc', 'Kami memerlukan nomor telepon, instansi, dan kota domisili Anda untuk melanjutkan pendaftaran webinar ini.')}
                                </p>

                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                                >
                                    <Link href={route('profile.edit', { redirect: window.location.href })}>
                                        <User className="mr-2 h-4 w-4" />
                                        {t('webinar.register.btnCompleteProfile', 'Lengkapi Profil Sekarang')}
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
            <Head title={`${t('webinar.register.headTitle', 'Checkout')} - ${webinar.title}`} />

            <section className="from-primary to-primary-foreground relative overflow-hidden bg-gradient-to-br px-4 py-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto max-w-7xl">
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        {isFree && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-white px-3 py-1.5 text-sm font-medium text-green-600 backdrop-blur-sm"
                            >
                                <Gift className="h-3.5 w-3.5" />
                                {t('webinar.register.freeBadge', 'Gratis')}
                            </motion.div>
                        )}

                        {webinar.strikethrough_price > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-red-700 bg-red-200 px-3 py-1.5 text-sm font-medium text-red-600 backdrop-blur-sm"
                            >
                                <Tag className="h-3.5 w-3.5" />
                                {t('webinar.register.discount', 'Diskon')} {Math.round(((webinar.strikethrough_price - webinar.price) / webinar.strikethrough_price) * 100)}%
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-md"
                        >
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(webinar.start_time).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long' })} -{' '}
                            {new Date(webinar.start_time).toLocaleTimeString(i18n.language === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </motion.div>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4 text-3xl font-bold text-black sm:text-4xl lg:text-5xl"
                    >
                        {webinar.title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-6 max-w-3xl text-justify text-lg text-black"
                    >
                        {webinar.description}
                    </motion.p>
                </motion.div>
            </section>

            <section className="mx-auto my-8 w-full max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
                        <Tabs defaultValue="detail" className="w-full">
                            <TabsList className="grid w-full grid-cols-1">
                                <TabsTrigger value="detail" className="gap-2">
                                    <BadgeCheck className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('webinar.register.tabDetail', 'Detail Webinar')}</span>
                                    <span className="sm:hidden">{t('webinar.register.tabDetailShort', 'Detail')}</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="detail" className="mt-4">
                                <Card className="p-6">
                                    <div className="mb-6">
                                        <h2 className="mb-2 text-2xl font-bold">{t('webinar.register.whatYouWillGet', 'Yang Akan Kamu Dapatkan')}</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('webinar.register.whatYouWillGetDesc', 'Manfaat yang akan kamu peroleh setelah mengikuti webinar ini')}
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {benefitList.map((benefit, idx) => (
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
                            <Card className="mt-6">
                                <form className="flex flex-col gap-6 p-6 pt-0" onSubmit={submit}>
                                    <h1 className="text-xl font-bold">{t('webinar.register.enterPersonalData', 'Masukkan Data Diri Anda')}</h1>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">{t('webinar.register.emailLabel', 'Email')}</Label>
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
                                                disabled={checkingEmail || !data.email}
                                                onClick={async () => {
                                                    if (!data.email || !data.email.includes('@')) {
                                                        toast.error(t('webinar.register.enterValidEmail', 'Masukkan email yang valid'));
                                                        return;
                                                    }

                                                    setCheckingEmail(true);
                                                    try {
                                                        const response = await axios.post('/api/check-email', { email: data.email });
                                                        if (response.data.exists) {
                                                            setEmailExists(true);
                                                            setData('name', response.data.name || '');
                                                            setData('phone_number', response.data.phone_number || '');
                                                            setData('instance', response.data.instance || '');
                                                            setData('city', response.data.city || '');
                                                            toast.success(t('webinar.register.emailFoundToast', 'Email ditemukan!'));
                                                        } else {
                                                            setEmailExists(false);
                                                            toast.info(t('webinar.register.emailNotFoundToast', 'Email tidak terdaftar'));
                                                        }
                                                    } catch {
                                                        setEmailExists(false);
                                                        toast.error(t('webinar.register.emailCheckFailed', 'Gagal mengecek email'));
                                                    } finally {
                                                        setCheckingEmail(false);
                                                    }
                                                }}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {emailExists && <p className="text-xs text-green-600">{t('webinar.register.emailAutoFillNotice', 'Email ditemukan, data terisi otomatis')}</p>}
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">{t('webinar.register.nameLabel', 'Nama')}</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                tabIndex={2}
                                                autoComplete="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                disabled={processing || emailExists}
                                                placeholder={t('webinar.register.namePlaceholder', 'Nama lengkap Anda')}
                                            />
                                            <InputError message={errors.name} className="mt-2" />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="phone_number">{t('webinar.register.phoneLabel', 'No. Telepon')}</Label>
                                            <Input
                                                id="phone_number"
                                                type="tel"
                                                required
                                                tabIndex={3}
                                                autoComplete="tel"
                                                value={data.phone_number}
                                                onChange={(e) => setData('phone_number', e.target.value)}
                                                disabled={processing}
                                                placeholder={t('webinar.register.phonePlaceholder', '08xxxxxxxxxx')}
                                            />
                                            {!emailExists && (
                                                <p className="text-xs text-gray-500">{t('webinar.register.phoneNoticeUnregistered', 'Nomor telepon akan digunakan sebagai password anda')}</p>
                                            )}
                                            {emailExists && (
                                                <p className="text-xs text-blue-600">{t('webinar.register.phoneNoticeRegistered', 'Pastikan nomor telepon sesuai dengan yang terdaftar')}</p>
                                            )}
                                            <InputError message={errors.phone_number} />
                                        </div>
                                        <div className="grid gap-2 pb-2">
                                            <Label htmlFor="instance">{t('webinar.register.instanceLabel', 'Instansi/Perusahaan')}</Label>
                                            <Input
                                                id="instance"
                                                type="text"
                                                tabIndex={4}
                                                autoComplete="organization"
                                                value={data.instance}
                                                onChange={(e) => setData('instance', e.target.value)}
                                                disabled={processing}
                                                placeholder={t('webinar.register.instancePlaceholder', 'Instansi atau perusahaan Anda')}
                                                required
                                            />
                                            <InputError message={errors.instance} />
                                        </div>
                                        <div className="grid gap-2 pb-2">
                                            <Label htmlFor="city">{t('webinar.register.cityLabel', 'Kota Domisili')}</Label>
                                            <Input
                                                id="city"
                                                type="text"
                                                tabIndex={5}
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                disabled={processing}
                                                placeholder={t('webinar.register.cityPlaceholder', 'Kota domisili Anda')}
                                                required
                                            />
                                            <InputError message={errors.city} />
                                        </div>
                                    </div>
                                </form>
                            </Card>
                        )}

                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-1">
                        <div className="sticky top-4">
                            {hasAccess && (!activeInstallment || activeInstallment.is_fully_paid) ? (
                                <Card className="overflow-hidden border-2 border-green-500/20">
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:from-green-950/20 dark:to-emerald-950/20">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                                            <BadgeCheck className="h-8 w-8 text-white" />
                                        </div>

                                        <h2 className="mb-2 text-center text-xl font-bold">{t('webinar.register.alreadyHaveAccessTitle', 'Anda Sudah Memiliki Akses')}</h2>
                                        <p className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                            {t('webinar.register.alreadyHaveAccessDesc', 'Anda sudah terdaftar di webinar ini. Silakan masuk ke dalam grup.')}
                                        </p>

                                        <Button
                                            asChild
                                            size="lg"
                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                        >
                                            <a href={webinar.group_url ?? ''} target="_blank" rel="noopener noreferrer">
                                                {t('webinar.register.btnEnterGroup', 'Masuk Group Webinar')}
                                            </a>
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
                                                            <div>
                                                                <p className="font-semibold text-red-800">{t('webinar.register.paymentExpiredTitle', 'Pembayaran Kedaluwarsa')}</p>
                                                            </div>
                                                        </>
                                                    );
                                                }

                                                return (
                                                    <>
                                                        <Hourglass className="h-5 w-5 text-yellow-600" />
                                                        <div>
                                                            <p className="font-semibold text-yellow-900">{t('webinar.register.pendingInvoiceTitle', 'Transaksi Menunggu Pembayaran')}</p>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="space-y-6 p-6">
                                        <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('webinar.register.invoiceCodeLabel', 'Kode Invoice')}</span>
                                                <span className="font-mono text-sm font-semibold">{pendingInvoice.invoice_code}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('webinar.register.totalPayment', 'Total Pembayaran')}</span>
                                                <span className="text-lg font-bold text-orange-600">
                                                    Rp {pendingInvoice.amount.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
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
                                                            {t('webinar.register.paymentExpiredNotice', 'Waktu pembayaran telah habis. Silakan batalkan transaksi untuk membuat pesanan baru.')}
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
                                                        {t('webinar.register.btnContinuePayment', 'Lanjutkan Pembayaran')}
                                                    </a>
                                                </Button>
                                            )}

                                            <div className="flex gap-2">
                                                <Button onClick={() => window.location.reload()} variant="outline" className="flex-1" size="lg">
                                                    {t('webinar.register.btnCheckStatus', 'Cek Status')}
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                                                    size="lg"
                                                    disabled={cancellingInvoice}
                                                    onClick={async () => {
                                                        if (confirm(t('webinar.register.confirmCancel', 'Apakah Anda yakin ingin membatalkan transaksi ini dan membuat pesanan baru?'))) {
                                                            setCancellingInvoice(true);
                                                            try {
                                                                await axios.post(route('invoice.cancel', pendingInvoice.id));
                                                                toast.success(t('webinar.register.cancelSuccess', 'Pesanan berhasil dibatalkan.'));
                                                                window.location.reload();
                                                            } catch (err: any) {
                                                                toast.error(err.response?.data?.message || t('webinar.register.cancelFailed', 'Gagal membatalkan pesanan.'));
                                                                setCancellingInvoice(false);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {cancellingInvoice ? t('webinar.register.cancelling', 'Membatalkan...') : t('webinar.register.btnCancelOrder', 'Batalkan Pesanan')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ) : !showFreeForm ? (
                                <Card className="overflow-hidden border-2">
                                    <div className="border-b bg-gray-50/80 p-6 dark:bg-gray-900/80">
                                        <h2 className="text-xl font-bold">{isFree ? t('webinar.register.registrationDetailTitle', 'Detail Pendaftaran') : t('webinar.register.paymentDetailTitle', 'Detail Pembayaran')}</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {isFree ? t('webinar.register.freeRequirements', 'Persyaratan pendaftaran gratis') : t('webinar.register.paymentSummary', 'Ringkasan pembayaran webinar')}
                                        </p>
                                    </div>

                                    <form onSubmit={handleCheckout} className="p-6">
                                        {isFree ? (
                                            <div className="space-y-4 text-center">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                                                    <Gift className="h-8 w-8 text-white" />
                                                </div>

                                                <h3 className="text-lg font-bold text-green-600">{t('webinar.register.freeWebinarTitle', 'Webinar Gratis!')}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {t('webinar.register.freeWebinarInstruction', 'Untuk mengikuti webinar gratis ini, silakan lengkapi persyaratan berikut:')}
                                                </p>

                                                <ul className="mt-4 space-y-1 text-left text-sm text-green-700 dark:text-green-300">
                                                    {webinar.requirement_1 && <li>• {webinar.requirement_1}</li>}
                                                    {webinar.requirement_2 && <li>• {webinar.requirement_2}</li>}
                                                    {webinar.requirement_3 && <li>• {webinar.requirement_3}</li>}
                                                </ul>

                                                <Button
                                                    className="mt-6 w-full"
                                                    type="submit"
                                                    size="lg"
                                                    disabled={loading}
                                                >
                                                    {loading ? t('webinar.register.processing', 'Memproses...') : t('webinar.register.btnUploadProof', 'Upload Bukti Follow')}
                                                </Button>
                                            </div>
                                        ) : ((installmentTerms && installmentTerms.length > 0) || (activeInstallment && !activeInstallment.is_fully_paid)) ? (
                                            <Tabs
                                                value={paymentTab}
                                                onValueChange={(val) => {
                                                    if (val === 'full' && activeInstallment && !activeInstallment.is_fully_paid) {
                                                        toast.error(t('webinar.register.activeInstallmentFullDisabled', 'Anda memiliki cicilan aktif. Pembayaran penuh dinonaktifkan.'));
                                                        return;
                                                    }
                                                    if (val === 'installment' && isAnyTermOverdue && !activeInstallment) {
                                                toast.error(t('webinar.register.overdueInstallmentError', 'Batas waktu pembayaran cicilan telah terlewat.'));
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
                                                        {t('webinar.register.tabFullPayment', 'Bayar Penuh')}
                                                    </TabsTrigger>
                                                    <TabsTrigger value="installment" disabled={isAnyTermOverdue && !activeInstallment} className="text-xs sm:text-sm">
                                                        {t('webinar.register.tabInstallment', 'Cicilan')} ({activeInstallment && !activeInstallment.is_fully_paid ? (activeInstallment.total_terms || activeInstallment.terms?.length) : installmentTerms.length}x)
                                                    </TabsTrigger>
                                                </TabsList>

                                                {/* Tab Bayar Penuh */}
                                                <TabsContent value="full" className="space-y-6 m-0">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium">{t('webinar.register.webinarPrice', 'Harga Webinar')}</span>
                                                            <div className="text-right">
                                                                {webinar.strikethrough_price > 0 && (
                                                                    <span className="text-sm text-gray-500 line-through">
                                                                        Rp {webinar.strikethrough_price.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                                                    </span>
                                                                )}
                                                                <div className="font-semibold">Rp {webinar.price.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</div>
                                                            </div>
                                                        </div>

                                                        {/* Promo / Referral Code Section */}
                                                        <div className="space-y-4">
                                                            {/* Jenis Kode */}
                                                            <div className="space-y-2">
                                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                                    <Tag className="h-4 w-4" />
                                                                    {t('webinar.register.codeType', 'Jenis Kode')}
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
                                                                        <RadioGroupItem value="voucher" id="web-code-voucher" />
                                                                        <Label htmlFor="web-code-voucher" className="cursor-pointer text-sm">{t('webinar.register.voucher', 'Voucher')}</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value="referral" id="web-code-referral" />
                                                                        <Label htmlFor="web-code-referral" className="cursor-pointer text-sm">{t('webinar.register.referral', 'Referral')}</Label>
                                                                    </div>
                                                                </RadioGroup>
                                                            </div>

                                                            {/* Input Kode */}
                                                            <div className="space-y-2">
                                                                <Label htmlFor="promoCode" className="text-sm font-medium">
                                                                    {codeType === 'voucher' ? t('webinar.register.voucherCode', 'Kode Voucher / Promo') : t('webinar.register.referralCode', 'Kode Referral')}
                                                                </Label>
                                                                <div className="flex gap-2">
                                                                    <div className="relative flex-1">
                                                                        <Input
                                                                            id="promoCode"
                                                                            placeholder={codeType === 'voucher' ? t('webinar.register.enterVoucherCode', 'Masukkan kode promo') : t('webinar.register.enterReferralCode', 'Masukkan kode referral')}
                                                                            value={promoCode}
                                                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                                            className="flex-1"
                                                                        />
                                                                        {(promoLoading || referralLoading) && (
                                                                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                                                <LoaderCircle className="h-4 w-4 animate-spin text-gray-400" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        disabled={promoLoading || referralLoading || !promoCode.trim()}
                                                                        onClick={async () => {
                                                                            if (!promoCode.trim()) {
                                                                                toast.error(t('webinar.register.enterCodeFirst', {
                                                                                    type: codeType === 'voucher' ? t('webinar.register.voucher', 'promo') : t('webinar.register.referral', 'referral'),
                                                                                    defaultValue: `Masukkan kode ${codeType === 'voucher' ? 'promo' : 'referral'} terlebih dahulu`
                                                                                }));
                                                                                return;
                                                                            }
                                                                            if (codeType === 'voucher') await validatePromoCode();
                                                                            else await validateReferralCode();
                                                                        }}
                                                                    >
                                                                        <RefreshCw className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                                {/* Voucher feedback */}
                                                                {codeType === 'voucher' && promoError && <p className="mt-1 text-sm text-red-600">{promoError}</p>}
                                                                {codeType === 'voucher' && discountData?.valid && (
                                                                    <p className="mt-1 text-sm text-green-600">
                                                                        {t('webinar.register.promoAppliedSuccess', { code: discountData.discount_code.code, defaultValue: `Kode promo "${discountData.discount_code.code}" berhasil diterapkan!` })}
                                                                    </p>
                                                                )}
                                                                {/* Referral feedback */}
                                                                {codeType === 'referral' && referralError && <p className="mt-1 text-sm text-red-600">{referralError}</p>}
                                                                {codeType === 'referral' && referralData?.valid && (
                                                                    <p className="mt-1 text-sm text-green-600">
                                                                        {t('webinar.register.referralSuccess', 'Kode referral valid!')} {t('webinar.register.referralAppliedSuccess', { name: referralData.referrer?.name, defaultValue: `Dirujuk oleh ${referralData.referrer?.name}.` })}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {discountData?.valid && (
                                                            <div className="flex items-center justify-between text-green-600">
                                                                <span>{t('webinar.register.discountLabel', { code: discountData.discount_code.code, defaultValue: `Diskon (${discountData.discount_code.code})` })}</span>
                                                                <span>-Rp {discountData.discount_amount.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between text-gray-600">
                                                            <span>{t('webinar.register.adminFee', 'Biaya Admin')}</span>
                                                            <span>Rp {adminFee.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</span>
                                                        </div>

                                                        <Separator />

                                                        <div className="flex items-center justify-between text-lg font-bold">
                                                            <span>{t('webinar.register.total', 'Total')}</span>
                                                            <span className="text-orange-600">Rp {totalPrice.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-3">
                                                        <Checkbox
                                                            id="terms"
                                                            checked={termsAccepted}
                                                            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                                        />
                                                        <Label htmlFor="terms" className="text-sm leading-relaxed">
                                                            {t('webinar.register.agreeTerms', 'Saya menyetujui')}{' '}
                                                            <Link href="/terms" className="font-medium text-blue-600 hover:underline">
                                                                {t('webinar.register.termsAndConditions', 'syarat dan ketentuan')}
                                                            </Link>{' '}
                                                            {t('webinar.register.termsNoticeSuffix', 'yang berlaku')}
                                                        </Label>
                                                    </div>

                                                    <Button
                                                        className="w-full"
                                                        type="submit"
                                                        size="lg"
                                                        disabled={!termsAccepted || loading}
                                                    >
                                                        {loading ? t('webinar.register.processing', 'Memproses...') : t('webinar.register.btnPayNow', 'Lanjutkan Pembayaran')}
                                                    </Button>
                                                </TabsContent>

                                                {/* Tab Cicilan */}
                                                <TabsContent value="installment" className="space-y-4 m-0">
                                                    <InstallmentOptions
                                                        productType="webinar"
                                                        productId={webinar.id}
                                                        productPrice={webinar.price}
                                                        terms={installmentTerms}
                                                        activeInstallment={activeInstallment}
                                                        termsAccepted={termsAccepted}
                                                        onTermsAcceptedChange={setTermsAccepted}
                                                        onBeforePay={async () => {
                                                            if (!activeInstallment && !termsAccepted) {
                                                                toast.error(t('webinar.register.errors.termsRequired', 'Anda harus menyetujui syarat dan ketentuan!'));
                                                                return false;
                                                            }
                                                            return await ensureAuth();
                                                        }}
                                                    />
                                                </TabsContent>
                                            </Tabs>
                                        ) : (
                                            <>
                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium">{t('webinar.register.webinarPrice', 'Harga Webinar')}</span>
                                                            <div className="text-right">
                                                                {webinar.strikethrough_price > 0 && (
                                                                    <span className="text-sm text-gray-500 line-through">
                                                                        Rp {webinar.strikethrough_price.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                                                    </span>
                                                                )}
                                                                <div className="font-semibold">Rp {webinar.price.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</div>
                                                            </div>
                                                        </div>

                                                        {/* Promo / Referral Code Section */}
                                                        <div className="space-y-4">
                                                            {/* Jenis Kode */}
                                                            <div className="space-y-2">
                                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                                    <Tag className="h-4 w-4" />
                                                                    {t('webinar.register.codeType', 'Jenis Kode')}
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
                                                                        <RadioGroupItem value="voucher" id="web-code-voucher" />
                                                                        <Label htmlFor="web-code-voucher" className="cursor-pointer text-sm">{t('webinar.register.voucher', 'Voucher')}</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value="referral" id="web-code-referral" />
                                                                        <Label htmlFor="web-code-referral" className="cursor-pointer text-sm">{t('webinar.register.referral', 'Referral')}</Label>
                                                                    </div>
                                                                </RadioGroup>
                                                            </div>

                                                            {/* Input Kode */}
                                                            <div className="space-y-2">
                                                                <Label htmlFor="promoCode" className="text-sm font-medium">
                                                                    {codeType === 'voucher' ? t('webinar.register.voucherCode', 'Kode Voucher / Promo') : t('webinar.register.referralCode', 'Kode Referral')}
                                                                </Label>
                                                                <div className="flex gap-2">
                                                                    <div className="relative flex-1">
                                                                        <Input
                                                                            id="promoCode"
                                                                            placeholder={codeType === 'voucher' ? t('webinar.register.enterVoucherCode', 'Masukkan kode promo') : t('webinar.register.enterReferralCode', 'Masukkan kode referral')}
                                                                            value={promoCode}
                                                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                                            className="flex-1"
                                                                        />
                                                                        {(promoLoading || referralLoading) && (
                                                                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                                                <LoaderCircle className="h-4 w-4 animate-spin text-gray-400" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        disabled={promoLoading || referralLoading || !promoCode.trim()}
                                                                        onClick={async () => {
                                                                            if (!promoCode.trim()) {
                                                                                toast.error(t('webinar.register.enterCodeFirst', {
                                                                                    type: codeType === 'voucher' ? t('webinar.register.voucher', 'promo') : t('webinar.register.referral', 'referral'),
                                                                                    defaultValue: `Masukkan kode ${codeType === 'voucher' ? 'promo' : 'referral'} terlebih dahulu`
                                                                                }));
                                                                                return;
                                                                            }
                                                                            if (codeType === 'voucher') await validatePromoCode();
                                                                            else await validateReferralCode();
                                                                        }}
                                                                    >
                                                                        <RefreshCw className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                                {/* Voucher feedback */}
                                                                {codeType === 'voucher' && promoError && <p className="mt-1 text-sm text-red-600">{promoError}</p>}
                                                                {codeType === 'voucher' && discountData?.valid && (
                                                                    <p className="mt-1 text-sm text-green-600">
                                                                        {t('webinar.register.promoAppliedSuccess', { code: discountData.discount_code.code, defaultValue: `Kode promo "${discountData.discount_code.code}" berhasil diterapkan!` })}
                                                                    </p>
                                                                )}
                                                                {/* Referral feedback */}
                                                                {codeType === 'referral' && referralError && <p className="mt-1 text-sm text-red-600">{referralError}</p>}
                                                                {codeType === 'referral' && referralData?.valid && (
                                                                    <p className="mt-1 text-sm text-green-600">
                                                                        {t('webinar.register.referralSuccess', 'Kode referral valid!')} {t('webinar.register.referralAppliedSuccess', { name: referralData.referrer?.name, defaultValue: `Dirujuk oleh ${referralData.referrer?.name}.` })}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {discountData?.valid && (
                                                            <div className="flex items-center justify-between text-green-600">
                                                                <span>{t('webinar.register.discountLabel', { code: discountData.discount_code.code, defaultValue: `Diskon (${discountData.discount_code.code})` })}</span>
                                                                <span>-Rp {discountData.discount_amount.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between text-gray-600">
                                                            <span>{t('webinar.register.adminFee', 'Biaya Admin')}</span>
                                                            <span>Rp {adminFee.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</span>
                                                        </div>

                                                        <Separator />

                                                        <div className="flex items-center justify-between text-lg font-bold">
                                                            <span>{t('webinar.register.total', 'Total')}</span>
                                                            <span className="text-orange-600">Rp {totalPrice.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex items-start gap-3">
                                                    <Checkbox
                                                        id="terms"
                                                        checked={termsAccepted}
                                                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                                    />
                                                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                                                        {t('webinar.register.agreeTerms', 'Saya menyetujui')}{' '}
                                                        <Link href="/terms" className="font-medium text-blue-600 hover:underline">
                                                            {t('webinar.register.termsAndConditions', 'syarat dan ketentuan')}
                                                        </Link>{' '}
                                                        {t('webinar.register.termsNoticeSuffix', 'yang berlaku')}
                                                    </Label>
                                                </div>

                                                <Button
                                                    className="mt-6 w-full"
                                                    type="submit"
                                                    size="lg"
                                                    disabled={!termsAccepted || loading}
                                                >
                                                    {loading ? t('webinar.register.processing', 'Memproses...') : t('webinar.register.btnPayNow', 'Lanjutkan Pembayaran')}
                                                </Button>
                                            </>
                                        )}
                                    </form>
                                </Card>
                            ) : (
                                <Card className="overflow-hidden border-2">
                                    <div className="border-b bg-gray-50/80 p-6 dark:bg-gray-900/80">
                                        <h2 className="text-xl font-bold">{t('webinar.register.uploadProofTitle', 'Upload Bukti Follow')}</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('webinar.register.uploadProofDesc', 'Upload bukti bahwa Anda telah memenuhi persyaratan')}</p>
                                    </div>

                                    <form onSubmit={handleFreeCheckout} className="p-6">
                                        <div className="space-y-4">
                                            {[1, 2, 3].map((index) => {
                                                const requirementKey = `requirement_${index}`;
                                                const proofKey = `${requirementKey}_proof` as const;
                                                const requirementText = webinar[requirementKey as keyof Webinar] as string | null | undefined;

                                                return (
                                                    <div key={index}>
                                                        <Label htmlFor={proofKey}>
                                                            {t('webinar.register.proofLabel', { index, requirement: requirementText || `Persyaratan ${index}`, defaultValue: `Bukti Persyaratan ${index}: ${requirementText || `Persyaratan ${index}`}` })}
                                                        </Label>
                                                        <Input
                                                            id={proofKey}
                                                            data-field={proofKey}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(proofKey, e.target.files?.[0] || null)}
                                                            className={fileErrors[proofKey] ? 'border-red-500' : ''}
                                                            required
                                                        />
                                                        <p className="mt-1 text-xs text-gray-500">{t('webinar.register.proofScreenshotNotice', { requirement: requirementText, defaultValue: `${requirementText} (Maks. 2MB)` })}</p>
                                                    </div>
                                                );
                                            })}

                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowFreeForm(false);
                                                        setFileErrors({
                                                            requirement_1_proof: false,
                                                            requirement_2_proof: false,
                                                            requirement_3_proof: false,
                                                        });
                                                        setFreeFormData({
                                                            requirement_1_proof: null,
                                                            requirement_2_proof: null,
                                                            requirement_3_proof: null,
                                                        });
                                                    }}
                                                    className="flex-1"
                                                >
                                                    {t('webinar.register.btnBack', 'Kembali')}
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        loading ||
                                                        !freeFormData.requirement_1_proof ||
                                                        !freeFormData.requirement_2_proof ||
                                                        !freeFormData.requirement_3_proof ||
                                                        Object.values(fileErrors).some((e) => e)
                                                    }
                                                    className="flex-1"
                                                >
                                                    {loading ? t('webinar.register.processing', 'Memproses...') : t('webinar.register.btnGetFreeAccess', 'Dapatkan Akses Gratis')}
                                                </Button>
                                            </div>
                                        </div>
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
