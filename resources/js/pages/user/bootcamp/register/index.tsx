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
import { BadgeCheck, Calendar, Check, CreditCard, Gift, Hourglass, LoaderCircle, RefreshCw, Shield, Star, Tag, Upload, User, X } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    description?: string | null;
    benefits?: string | null;
    requirements?: string | null;
    curriculum?: string | null;
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

type RegisterForm = {
    name: string;
    email: string;
    phone_number: string;
    instance: string;
    city: string;
    password: string;
    password_confirmation: string;
};
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

interface InvoiceData {
    type: string;
    id: string;
    discount_amount: number;
    nett_amount: number;
    total_amount: number;
    // payment_channel?: string;
    discount_code_id?: string;
    discount_code_amount?: number;
    referral_code?: string;
}

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

export default function RegisterBootcamp({
    bootcamp,
    hasAccess,
    activeInstallment: initialActiveInstallment = null,
    pendingInvoice,
    transactionDetail,
    referralInfo,
    installmentTerms = [],
}: {
    bootcamp: Bootcamp;
    hasAccess: boolean;
    activeInstallment?: ActiveInstallmentData | null;
    pendingInvoice?: PendingInvoice | null;
    transactionDetail?: TransactionDetail | null;
    referralInfo: ReferralInfo;
    installmentTerms?: InstallmentTermOption[];
}) {
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

    const { t, i18n } = useTranslation('user');
    const [paymentTab, setPaymentTab] = useState<'full' | 'installment'>(initialActiveInstallment ? 'installment' : 'full');
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number && auth.user?.instance && auth.user?.city;

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
    // const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(channels.length > 0 ? channels[0] : null);

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

    const requirementList = parseList(bootcamp.requirements);
    const benefitList = parseList(bootcamp.benefits);
    const curriculumList = parseList(bootcamp.curriculum);
    const isFree = bootcamp.price === 0;

    const basePrice = bootcamp.price;
    const discountAmount = discountData?.discount_amount || 0;
    const finalBootcampPrice = basePrice - discountAmount;

    // const calculateAdminFee = (channel: PaymentChannel | null): number => {
    //     if (!channel || isFree) return 0;
    //     const flatFee = channel.fee_customer.flat || 0;
    //     const percentFee = Math.round(finalBootcampPrice * ((channel.fee_customer.percent || 0) / 100));
    //     return flatFee + percentFee;
    // };

    const adminFee = isFree ? 0 : 5000; //calculateAdminFee(selectedChannel);
    const totalPrice = isFree ? 0 : finalBootcampPrice + adminFee;
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
                    bootcamp_id: bootcamp.id,
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
    }, [data.email, bootcamp.id]);

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
    }, [promoCode, codeType]);

    const validateReferralCode = async () => {
        if (!promoCode.trim() || isFree) return;

        setReferralLoading(true);
        setReferralError('');

        try {
            const response = await axios.post('/api/referral/validate', { code: promoCode });
            const data = response.data;

            if (data.valid) {
                setReferralData(data);
                setReferralError('');
            } else {
                setReferralData(null);
                setReferralError(data.message || t('bootcamp.register.errors.invalidReferral', 'Kode referral tidak valid'));
            }
        } catch (error: any) {
            setReferralData(null);
            setReferralError(error.response?.data?.message || t('bootcamp.register.errors.referralValidateError', 'Terjadi kesalahan saat memvalidasi kode referral'));
        } finally {
            setReferralLoading(false);
        }
    };

    const validatePromoCode = async () => {
        if (!promoCode.trim() || isFree) return;

        setPromoLoading(true);
        setPromoError('');

        try {
            const requestData: any = {
                code: promoCode,
                amount: bootcamp.price,
                product_type: 'bootcamp',
                product_id: bootcamp.id,
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
                setPromoError(response.data.message || t('bootcamp.register.errors.invalidPromo', 'Kode promo tidak valid'));
            }
        } catch (error: any) {
            setDiscountData(null);
            setPromoError(error.response?.data?.message || t('bootcamp.register.errors.promoValidateError', 'Terjadi kesalahan saat memvalidasi kode promo'));
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
            toast.error(t('bootcamp.register.incompleteProfileDesc', 'Profil Anda belum lengkap! Harap lengkapi nomor telepon, instansi, dan kota domisili terlebih dahulu untuk mendaftar bootcamp.'));
            setTimeout(() => {
                window.location.href = route('profile.edit');
            }, 1500);
            return;
        }

        if (!freeFormData.requirement_1_proof || !freeFormData.requirement_2_proof || !freeFormData.requirement_3_proof) {
            toast.error(t('bootcamp.register.errors.uploadAllProof', 'Harap upload semua bukti yang diperlukan!'));
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('type', 'bootcamp');
        formData.append('id', bootcamp.id);
        formData.append('requirement_1_proof', freeFormData.requirement_1_proof);
        formData.append('requirement_2_proof', freeFormData.requirement_2_proof);
        formData.append('requirement_3_proof', freeFormData.requirement_3_proof);

        router.post(route('enroll.free'), formData, {
            onError: (errors) => {
                toast.error(errors.message || t('bootcamp.register.errors.enrollFreeFailed', 'Gagal mendaftar bootcamp gratis.'));
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    const ensureAuth = async (): Promise<boolean> => {
        if (isLoggedIn) return true;

        if (!data.email || !data.name || !data.phone_number || !data.instance || !data.city) {
            toast.error(t('bootcamp.register.errors.completePersonalData', 'Lengkapi semua data diri terlebih dahulu.'));
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
                    throw new Error(response.data.message || t('bootcamp.register.errors.autoLoginFailed', 'Gagal login otomatis. Pastikan nomor telepon sesuai dengan yang terdaftar.'));
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
                    throw new Error(t('bootcamp.register.errors.registerFailed', 'Gagal registrasi.'));
                }
            }
            return true;
        } catch (error: any) {
            console.error('Login/Register error:', error);
            toast.error(error.response?.data?.message || error.message || t('bootcamp.register.errors.processLoginFailed', 'Gagal memproses login/registrasi otomatis.'));
            return false;
        }
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (activeInstallment && !activeInstallment.is_fully_paid) {
            toast.error(t('bootcamp.register.activeInstallmentAlert', 'Anda sedang memiliki program cicilan berjalan. Silakan selesaikan pembayaran melalui tab Cicilan.'));
            setPaymentTab('installment');
            return;
        }

        // 1. Jika belum login, lakukan registrasi / login terlebih dahulu
        if (!isLoggedIn) {
            if (!termsAccepted && !isFree) {
                toast.error(t('bootcamp.register.errors.termsRequired', 'Anda harus menyetujui syarat dan ketentuan!'));
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

                // Langsung jalankan submitPayment tanpa reload halaman!
                await submitPayment();
            } catch (error: any) {
                console.error('Payment error:', error);
                setLoading(false);
                toast.error(error.response?.data?.message || error.message || t('bootcamp.register.errors.paymentFailed', 'Gagal memproses pembayaran.'));
            }
            return;
        }

        // 2. Jika sudah login
        if (!termsAccepted && !isFree) {
            toast.error(t('bootcamp.register.errors.termsRequired', 'Anda harus menyetujui syarat dan ketentuan!'));
            return;
        }

        if (isFree) {
            setShowFreeForm(true);
            return;
        }

        setLoading(true);
        try {
            await submitPayment();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || t('bootcamp.register.errors.paymentFailed', 'Gagal memproses pembayaran.'));
            setLoading(false);
        }
    };

    const submitPayment = async (): Promise<void> => {
        const originalDiscountAmount = bootcamp.strikethrough_price > 0 ? bootcamp.strikethrough_price - bootcamp.price : 0;
        const promoDiscountAmount = discountData?.discount_amount || 0;

        const invoiceData: InvoiceData = {
            type: 'bootcamp',
            id: bootcamp.id,
            discount_amount: originalDiscountAmount + promoDiscountAmount,
            nett_amount: finalBootcampPrice,
            total_amount: totalPrice,
        };

        if (discountData?.valid && codeType === 'voucher') {
            invoiceData.discount_code_id = discountData.discount_code.id;
            invoiceData.discount_code_amount = discountData.discount_amount;
        }

        if (codeType === 'referral' && referralData?.valid) {
            invoiceData.referral_code = promoCode;
        }

        const storedAffiliate = sessionStorage.getItem('affiliate_code');
        if (storedAffiliate) {
            (invoiceData as any).affiliate_code = storedAffiliate;
        }

        try {
            const res = await axios.post(route('invoice.store'), invoiceData);

            if (res.data && res.data.success) {
                if (res.data.payment_url) {
                    sessionStorage.removeItem('pendingCheckout');
                    window.location.href = res.data.payment_url;
                } else {
                    throw new Error('Payment URL tidak diterima dari server.');
                }
            } else {
                throw new Error(res.data?.message || t('bootcamp.register.errors.createInvoiceFailed', 'Gagal membuat invoice.'));
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            throw error;
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
            toast.error(t('bootcamp.register.errors.fileTooLarge', 'Ukuran file terlalu besar. Maksimal 2MB.'));
            return;
        }

        if (!file.type.startsWith('image/')) {
            setFileErrors((prev) => ({ ...prev, [fieldName]: true }));
            const input = document.querySelector(`input[data-field="${fieldName}"]`) as HTMLInputElement;
            if (input) input.value = '';
            toast.error(t('bootcamp.register.errors.fileMustBeImage', 'Hanya file gambar (JPG, PNG, GIF, dll) yang diperbolehkan.'));
            return;
        }

        setFreeFormData((prev) => ({ ...prev, [fieldName]: file }));
        setFileErrors((prev) => ({ ...prev, [fieldName]: false }));
        toast.success(t('bootcamp.register.errors.fileUploaded', 'File berhasil diunggah.'));
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
            return { time: t('common.expired', 'Sudah kadaluarsa'), status: 'expired' };
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours < 1) {
            return {
                time: i18n.language === 'en' ? `${minutes} minutes left` : `${minutes} menit lagi`,
                status: 'urgent',
            };
        }

        return {
            time: i18n.language === 'en'
                ? `${hours} hours ${minutes} minutes left`
                : `${hours} jam ${minutes} menit lagi`,
            status: hours < 3 ? 'urgent' : 'normal',
        };
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(t('common.copied', 'Berhasil menyalin ke clipboard!'));
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
                    toast.error(t('common.sessionExpired', 'Sesi checkout telah kadaluarsa'));
                    return;
                }

                // Validasi bootcamp ID
                if (checkoutData.bootcampId !== bootcamp.id) {
                    sessionStorage.removeItem('pendingCheckout');
                    return;
                }

                if (checkoutData.source !== 'register') {
                    sessionStorage.removeItem('pendingCheckout');
                    return;
                }

                // Restore state
                if (checkoutData.promoCode) {
                    setPromoCode(checkoutData.promoCode);
                }
                if (checkoutData.discountData) {
                    setDiscountData(checkoutData.discountData);
                }
                setTermsAccepted(checkoutData.termsAccepted || false);

                // Toast notification
                toast.success(t('common.continuingPayment', 'Melanjutkan pembayaran...'));

                // Auto-submit setelah delay
                setTimeout(async () => {
                    setLoading(true);

                    const submitPayment = async (retryCount = 0): Promise<void> => {
                        const originalDiscountAmount = bootcamp.strikethrough_price > 0 ? bootcamp.strikethrough_price - bootcamp.price : 0;
                        const promoDiscountAmount = checkoutData.discountData?.discount_amount || 0;
                        const finalPrice = bootcamp.price - promoDiscountAmount;
                        const totalAmount = finalPrice + 5000; // Admin fee

                        const invoiceData: InvoiceData = {
                            type: 'bootcamp',
                            id: bootcamp.id,
                            discount_amount: originalDiscountAmount + promoDiscountAmount,
                            nett_amount: finalPrice,
                            total_amount: totalAmount,
                        };

                        if (checkoutData.discountData?.valid) {
                            invoiceData.discount_code_id = checkoutData.discountData.discount_code.id;
                            invoiceData.discount_code_amount = checkoutData.discountData.discount_amount;
                        }

                        try {
                            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

                            const res = await fetch(route('invoice.store'), {
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
                                throw new Error(data.message || t('bootcamp.register.errors.createInvoiceFailed', 'Gagal membuat invoice.'));
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
                        toast.error(error.message || t('bootcamp.register.errors.paymentFailed', 'Terjadi kesalahan saat proses pembayaran.'));
                        sessionStorage.removeItem('pendingCheckout');
                        setLoading(false);
                    }
                }, 2000);
            } catch (error) {
                console.error('Error processing pending checkout:', error);
                sessionStorage.removeItem('pendingCheckout');
                toast.error(t('common.checkoutError', 'Gagal memproses checkout'));
            }
        }
    }, [isLoggedIn, bootcamp.id]);

    // if (!isLoggedIn) {
    //     const currentUrl = window.location.href;
    //     const loginUrl = route('login', { redirect: currentUrl });

    //     return (
    //         <UserLayout>
    //             <Head title="Login Required" />

    //             <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 px-4 py-16">
    //                 <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />
    //                 <div className="absolute top-0 left-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/30 blur-3xl" />
    //                 <div className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-purple-400/30 blur-3xl" />

    //                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto max-w-4xl text-center">
    //                     <motion.div
    //                         initial={{ opacity: 0, scale: 0.9 }}
    //                         animate={{ opacity: 1, scale: 1 }}
    //                         transition={{ delay: 0.1 }}
    //                         className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm"
    //                     >
    //                         <Lock className="h-4 w-4 text-white" />
    //                         <span className="text-sm font-medium text-white">Login Diperlukan</span>
    //                     </motion.div>

    //                     <motion.h1
    //                         initial={{ opacity: 0, y: 20 }}
    //                         animate={{ opacity: 1, y: 0 }}
    //                         transition={{ delay: 0.2 }}
    //                         className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
    //                     >
    //                         {bootcamp.title}
    //                     </motion.h1>

    //                     <motion.p
    //                         initial={{ opacity: 0, y: 20 }}
    //                         animate={{ opacity: 1, y: 0 }}
    //                         transition={{ delay: 0.3 }}
    //                         className="text-lg text-blue-100"
    //                     >
    //                         Silakan login terlebih dahulu untuk melanjutkan pendaftaran
    //                     </motion.p>
    //                 </motion.div>
    //             </section>

    //             <section className="mx-auto my-8 w-full max-w-2xl px-4">
    //                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
    //                     <Card className="overflow-hidden border-2">
    //                         <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 dark:from-blue-950/20 dark:to-purple-950/20">
    //                             <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
    //                                 <User className="h-10 w-10 text-white" />
    //                             </div>

    //                             <h2 className="mb-3 text-center text-2xl font-bold">Login untuk Melanjutkan</h2>
    //                             <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
    //                                 Anda perlu login untuk mendaftar bootcamp ini.
    //                                 {referralInfo.hasActive && ' Kode referral Anda akan tetap tersimpan.'}
    //                             </p>

    //                             <div className="flex flex-col gap-3 sm:flex-row">
    //                                 <Button
    //                                     asChild
    //                                     size="lg"
    //                                     className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    //                                 >
    //                                     <a href={loginUrl}>
    //                                         <User className="mr-2 h-4 w-4" />
    //                                         Login Sekarang
    //                                     </a>
    //                                 </Button>
    //                                 <Button asChild variant="outline" size="lg" className="flex-1 border-2">
    //                                     <Link href={route('register', referralInfo.code ? { ref: referralInfo.code } : {})}>Buat Akun Baru</Link>
    //                                 </Button>
    //                             </div>
    //                         </div>
    //                     </Card>
    //                 </motion.div>
    //             </section>
    //         </UserLayout>
    //     );
    // }

    if (isLoggedIn && !isProfileComplete) {
        return (
            <UserLayout>
                <Head title={t('bootcamp.register.incompleteProfileTitle', 'Lengkapi Profil')} />

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
                            <span className="text-sm font-medium text-white">{t('bootcamp.register.incompleteProfileTitle', 'Profil Belum Lengkap')}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                        >
                            {bootcamp.title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-orange-100"
                        >
                            {t('bootcamp.register.incompleteProfileDesc', 'Lengkapi profil Anda terlebih dahulu untuk melanjutkan')}
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

                                <h2 className="mb-3 text-center text-2xl font-bold">{t('bootcamp.register.incompleteProfileTitle', 'Lengkapi Profil Anda')}</h2>
                                <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
                                    {t('bootcamp.register.incompleteProfileDesc', 'Kami memerlukan nomor telepon, instansi, dan kota domisili Anda untuk melanjutkan pendaftaran bootcamp ini.')}
                                </p>

                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                                >
                                    <Link href={route('profile.edit', { redirect: window.location.href })}>
                                        <User className="mr-2 h-4 w-4" />
                                        {t('bootcamp.register.btnCompleteProfile', 'Lengkapi Profil Sekarang')}
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
            <Head title={`${t('bootcamp.register.headTitle', 'Checkout')} - ${bootcamp.title}`} />

            {/* Hero Section */}
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
                                {t('bootcamp.catalog.free', 'Gratis')}
                            </motion.div>
                        )}

                        {bootcamp.strikethrough_price > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-red-700 bg-red-200 px-3 py-1.5 text-sm font-medium text-red-600 backdrop-blur-sm"
                            >
                                <Tag className="h-3.5 w-3.5" />
                                {t('bootcamp.detail.savePercent', {
                                    percent: Math.round(((bootcamp.strikethrough_price - bootcamp.price) / bootcamp.strikethrough_price) * 100),
                                })}
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-md"
                        >
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(bootcamp.start_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long' })} -{' '}
                            {new Date(bootcamp.end_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </motion.div>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4 text-3xl font-bold text-black sm:text-4xl lg:text-5xl"
                    >
                        {bootcamp.title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-6 max-w-3xl text-justify text-lg text-black"
                    >
                        {bootcamp.description}
                    </motion.p>
                </motion.div>
            </section>

            {/* Main Content */}
            <section className="mx-auto my-8 w-full max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Bootcamp Details */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
                        <Tabs defaultValue="detail" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="detail" className="gap-2">
                                    <BadgeCheck className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('bootcamp.register.tabDetail', 'Detail Bootcamp')}</span>
                                    <span className="sm:hidden">{t('bootcamp.detail.tabRequirementsShort', 'Detail')}</span>
                                </TabsTrigger>
                                <TabsTrigger value="curriculum" className="gap-2">
                                    <Star className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('bootcamp.register.tabCurriculum', 'Kurikulum')}</span>
                                    <span className="sm:hidden">{t('bootcamp.detail.tabCurriculumShort', 'Materi')}</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="detail" className="mt-4">
                                <Card className="p-6">
                                    <div className="mb-6">
                                        <h2 className="mb-2 text-2xl font-bold">{t('bootcamp.register.whatYouWillGet', 'Yang Akan Kamu Dapatkan')}</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('bootcamp.register.whatYouWillGetDesc', 'Manfaat yang akan kamu peroleh setelah mengikuti bootcamp ini')}
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

                                    <div className="mt-8">
                                        <h2 className="mb-4 text-2xl font-bold">{t('bootcamp.register.participantRequirements', 'Persyaratan Peserta')}</h2>
                                        <div className="space-y-2">
                                            {requirementList.map((requirement, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-start gap-3 rounded-lg border bg-gray-50 p-3 dark:bg-gray-900/50"
                                                >
                                                    <BadgeCheck size={18} className="mt-1 min-w-6 flex-shrink-0 text-blue-600" />
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">{requirement}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="curriculum" className="mt-4">
                                <Card className="p-6">
                                    <div className="mb-6">
                                        <h2 className="mb-2 text-2xl font-bold">{t('bootcamp.register.curriculumTitle', 'Kurikulum Pembelajaran')}</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('bootcamp.register.curriculumDesc', 'Daftar materi yang akan dipelajari selama bootcamp')}</p>
                                    </div>

                                    <div className="space-y-3">
                                        {curriculumList.map((curriculum, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                className="flex items-start gap-4 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-950/20 dark:to-indigo-950/20"
                                            >
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white shadow-lg">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-sm leading-relaxed font-medium text-gray-700 dark:text-gray-300">{curriculum}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* {!isFree && channels.length > 0 && !pendingInvoice && !hasAccess && (
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
                                                                Rp {calculateAdminFee(channel).toLocaleString('id-ID')}
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
                        {!isLoggedIn && (
                            <Card className="mt-6">
                                <form className="flex flex-col gap-6 p-6 pt-0" onSubmit={submit}>
                                    <h1 className="text-xl font-bold">{t('bootcamp.register.personalDataTitle', 'Masukkan Data Diri Anda')}</h1>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">{t('bootcamp.register.emailLabel', 'Email')}</Label>
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
                                                        toast.error(t('bootcamp.register.errors.emailPhoneRequired', 'Masukkan email yang valid'));
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
                                                            toast.success(t('bootcamp.register.emailFound', 'Email ditemukan!'));
                                                        } else {
                                                            setEmailExists(false);
                                                            toast.info(t('bootcamp.register.errors.autoLoginFailed', 'Email tidak terdaftar'));
                                                        }
                                                    } catch (error) {
                                                        console.error('Error checking email:', error);
                                                        setEmailExists(false);
                                                        toast.error(t('bootcamp.register.errors.processLoginFailed', 'Gagal mengecek email'));
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
                                        {emailExists && <p className="text-xs text-green-600">{t('bootcamp.register.emailFound', 'Email ditemukan, data terisi otomatis')}</p>}
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">{t('bootcamp.register.nameLabel', 'Nama')}</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                tabIndex={2}
                                                autoComplete="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                disabled={processing || emailExists}
                                                placeholder={t('bootcamp.register.namePlaceholder', 'Nama lengkap Anda')}
                                            />
                                            <InputError message={errors.name} className="mt-2" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone_number">{t('bootcamp.register.phoneLabel', 'No. Telepon')}</Label>
                                            <Input
                                                id="phone_number"
                                                type="tel"
                                                required
                                                tabIndex={3}
                                                autoComplete="tel"
                                                value={data.phone_number}
                                                onChange={(e) => setData('phone_number', e.target.value)}
                                                disabled={processing}
                                                placeholder={t('bootcamp.register.phonePlaceholder', '08xxxxxxxxxx')}
                                            />
                                            {!emailExists && (
                                                <p className="text-xs text-gray-500">{t('bootcamp.register.phoneNotice', 'Nomor telepon akan digunakan sebagai password anda')}</p>
                                            )}
                                            {emailExists && (
                                                <p className="text-xs text-blue-600">{t('bootcamp.register.accountLockedNotice', 'Pastikan nomor telepon sesuai dengan yang terdaftar')}</p>
                                            )}
                                            <InputError message={errors.phone_number} />
                                        </div>
                                        <div className="grid gap-2 pb-2">
                                            <Label htmlFor="instance">{t('bootcamp.register.instanceLabel', 'Instansi/Perusahaan')}</Label>
                                            <Input
                                                id="instance"
                                                type="text"
                                                tabIndex={4}
                                                autoComplete="organization"
                                                value={data.instance}
                                                onChange={(e) => setData('instance', e.target.value)}
                                                disabled={processing}
                                                placeholder={t('bootcamp.register.instancePlaceholder', 'Instansi atau perusahaan Anda')}
                                                required
                                            />
                                            <InputError message={errors.instance} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="city">{t('bootcamp.register.cityLabel', 'Kota Domisili')}</Label>
                                            <Input
                                                id="city"
                                                type="text"
                                                placeholder={t('bootcamp.register.cityPlaceholder', 'Kota domisili Anda')}
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                disabled={processing}
                                                required
                                            />
                                            <InputError message={errors.city} />
                                        </div>
                                    </div>
                                </form>
                            </Card>
                        )}
                    </motion.div>

                    {/* Right Column - Checkout Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-1">
                        <div className="sticky top-4">
                            {hasAccess && (!activeInstallment || activeInstallment.is_fully_paid) ? (
                                <Card className="overflow-hidden border-2 border-green-500/20">
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center dark:from-green-950/20 dark:to-emerald-950/20">
                                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                                            <BadgeCheck className="h-10 w-10 text-white" />
                                        </div>

                                        <h2 className="mb-3 text-2xl font-bold text-green-900 dark:text-green-100">{t('bootcamp.register.alreadyHaveAccessTitle', 'Sudah Terdaftar')}</h2>
                                        <p className="mb-6 text-sm text-green-700 dark:text-green-300">
                                            {t('bootcamp.register.alreadyHaveAccessDesc', 'Anda sudah terdaftar di bootcamp ini. Silakan masuk ke grup.')}
                                        </p>

                                        <Button
                                            asChild
                                            size="lg"
                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                        >
                                            <a href={bootcamp.group_url ?? ''} target="_blank" rel="noopener noreferrer">
                                                {t('bootcamp.register.btnEnterGroup', 'Masuk Group Bootcamp')}
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
                                                            <h2 className="text-lg font-semibold text-red-700">{t('common.paymentExpired', 'Pembayaran Kedaluwarsa')}</h2>
                                                        </>
                                                    );
                                                }
                                                return (
                                                    <>
                                                        <Hourglass className="h-5 w-5 text-yellow-600" />
                                                        <h2 className="text-lg font-semibold text-yellow-900">{t('bootcamp.register.pendingInvoiceTitle', 'Transaksi Menunggu Pembayaran')}</h2>
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
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{t('bootcamp.register.totalPayment', 'Total Pembayaran')}</span>
                                                <span className="text-xl font-bold text-orange-600">
                                                    Rp {pendingInvoice.amount.toLocaleString('id-ID')}
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
                                                            {i18n.language === 'en'
                                                                ? 'Payment time has expired. Please cancel the transaction to create a new order or contact '
                                                                : 'Waktu pembayaran telah habis. Silakan batalkan transaksi untuk membuat pesanan baru atau hubungi '}
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
                                                        {t('bootcamp.register.btnContinuePayment', 'Lanjutkan Pembayaran')}
                                                    </a>
                                                </Button>
                                            )}

                                            <div className="flex gap-2">
                                                <Button onClick={() => window.location.reload()} variant="outline" className="flex-1" size="lg">
                                                    {t('bootcamp.register.btnCheckStatus', 'Cek Status')}
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                                                    size="lg"
                                                    disabled={cancellingInvoice}
                                                    onClick={async () => {
                                                        if (confirm(t('bootcamp.register.confirmCancel', 'Apakah Anda yakin ingin membatalkan transaksi ini dan membuat pesanan baru?'))) {
                                                            setCancellingInvoice(true);
                                                            try {
                                                                await axios.post(route('invoice.cancel', pendingInvoice.id));
                                                                toast.success(t('bootcamp.register.cancelSuccess', 'Pesanan berhasil dibatalkan.'));
                                                                window.location.reload();
                                                            } catch (err: any) {
                                                                toast.error(err.response?.data?.message || t('bootcamp.register.cancelFailed', 'Gagal membatalkan pesanan.'));
                                                                setCancellingInvoice(false);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {cancellingInvoice ? t('bootcamp.register.cancelling', 'Membatalkan...') : t('bootcamp.register.btnCancelOrder', 'Batalkan Pesanan')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ) : !showFreeForm ? (
                                <Card className="overflow-hidden border-2">
                                    <div className="bg-primary border-b p-4">
                                        <h2 className="text-center text-lg font-bold text-white">
                                            {isFree ? t('bootcamp.register.freeBadge', 'Pendaftaran Gratis') : t('bootcamp.register.paymentDetailTitle', 'Detail Pembayaran')}
                                        </h2>
                                    </div>

                                    <form onSubmit={handleCheckout} className="p-6">
                                        {isFree ? (
                                            <div className="mb-6 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center dark:from-green-950/20 dark:to-emerald-950/20">
                                                <Gift className="mx-auto mb-3 h-12 w-12 text-green-600" />
                                                <p className="mb-2 text-2xl font-bold text-green-600">{t('bootcamp.register.freeBadge', 'BOOTCAMP GRATIS')}</p>
                                                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{t('bootcamp.register.freeSubtitle', 'Dapatkan akses penuh tanpa biaya')}</p>
                                                <div className="space-y-2 text-left text-sm text-gray-700 dark:text-gray-300">
                                                    <p className="font-semibold">{t('bootcamp.register.freeInstruction', 'Untuk mendapatkan akses gratis:')}</p>
                                                    <ul className="space-y-1">
                                                        {bootcamp.requirement_1 && <li>• {bootcamp.requirement_1}</li>}
                                                        {bootcamp.requirement_2 && <li>• {bootcamp.requirement_2}</li>}
                                                        {bootcamp.requirement_3 && <li>• {bootcamp.requirement_3}</li>}
                                                    </ul>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Bootcamp Thumbnail */}
                                                {bootcamp.thumbnail && (
                                                    <div className="mb-6 overflow-hidden rounded-lg border">
                                                        <img
                                                            src={
                                                                bootcamp.thumbnail.startsWith('http') || bootcamp.thumbnail.startsWith('/storage')
                                                                    ? bootcamp.thumbnail
                                                                    : `/storage/${bootcamp.thumbnail}`
                                                            }
                                                            alt={bootcamp.title}
                                                            className="h-40 w-full object-cover"
                                                        />
                                                    </div>
                                                )}

                                                {/* Payment Form (Full vs Installment) */}
                                                {((installmentTerms && installmentTerms.length > 0) || (activeInstallment && !activeInstallment.is_fully_paid)) ? (
                                                    <Tabs
                                                        value={paymentTab}
                                                        onValueChange={(val) => {
                                                            if (val === 'full' && activeInstallment && !activeInstallment.is_fully_paid) {
                                                                toast.error(t('bootcamp.register.activeInstallmentAlert', 'Anda memiliki cicilan aktif. Pembayaran penuh dinonaktifkan.'));
                                                                return;
                                                            }
                                                            if (val === 'installment' && isAnyTermOverdue && !activeInstallment) {
                                                                toast.error('Batas waktu pembayaran cicilan telah terlewat.');
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
                                                                {t('bootcamp.register.tabFullPayment', 'Bayar Penuh')}
                                                            </TabsTrigger>
                                                            <TabsTrigger value="installment" disabled={isAnyTermOverdue && !activeInstallment} className="text-xs sm:text-sm">
                                                                {t('bootcamp.register.tabInstallment', 'Cicilan')} ({activeInstallment && !activeInstallment.is_fully_paid ? (activeInstallment.total_terms || activeInstallment.terms?.length) : installmentTerms.length}x)
                                                            </TabsTrigger>
                                                        </TabsList>

                                                        {/* Tab Bayar Penuh */}
                                                        <TabsContent value="full" className="space-y-4 m-0">
                                                            {/* Promo / Referral Code Section */}
                                                            <div className="space-y-4">
                                                                {/* Jenis Kode */}
                                                                <div className="space-y-2">
                                                                    <Label className="flex items-center gap-2 text-sm font-medium">
                                                                        <Tag className="h-4 w-4" />
                                                                        {t('bootcamp.register.codeType', 'Jenis Kode')}
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
                                                                            <RadioGroupItem value="voucher" id="boot-code-voucher" />
                                                                            <Label htmlFor="boot-code-voucher" className="cursor-pointer text-sm">{t('bootcamp.register.voucher', 'Voucher')}</Label>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <RadioGroupItem value="referral" id="boot-code-referral" />
                                                                            <Label htmlFor="boot-code-referral" className="cursor-pointer text-sm">{t('bootcamp.register.referral', 'Referral')}</Label>
                                                                        </div>
                                                                    </RadioGroup>
                                                                </div>

                                                                {/* Input Kode */}
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="promo-code" className="text-sm font-medium">
                                                                        {codeType === 'voucher' ? t('bootcamp.register.voucherCode', 'Kode Voucher') : t('bootcamp.register.referralCode', 'Kode Referral')}
                                                                    </Label>
                                                                    <div className="flex gap-2">
                                                                        <div className="relative flex-1">
                                                                            <Input
                                                                                id="promo-code"
                                                                                type="text"
                                                                                placeholder={codeType === 'voucher' ? t('bootcamp.register.enterVoucherCode', 'Masukkan kode promo') : t('bootcamp.register.enterReferralCode', 'Masukkan kode referral')}
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
                                                                                    toast.error(codeType === 'voucher' ? t('bootcamp.register.enterVoucherCode', 'Masukkan kode promo terlebih dahulu') : t('bootcamp.register.enterReferralCode', 'Masukkan kode referral terlebih dahulu'));
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

                                                                    {promoError && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: -10 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            className="flex items-center gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-950/50"
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
                                                                                    {t('bootcamp.register.voucherSuccess', { code: discountData.discount_code.code })}
                                                                                </p>
                                                                            </div>
                                                                            <p className="text-sm text-green-700 dark:text-green-300">
                                                                                {discountData.discount_code.name} - {discountData.discount_code.formatted_value}
                                                                            </p>
                                                                        </motion.div>
                                                                    )}

                                                                    {referralError && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: -10 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            className="flex items-center gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-950/50"
                                                                        >
                                                                            <X className="h-4 w-4 flex-shrink-0 text-red-600" />
                                                                            <p className="text-sm text-red-600 dark:text-red-400">{referralError}</p>
                                                                        </motion.div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Price Breakdown */}
                                                            <div className="space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900/50">
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-gray-600 dark:text-gray-400">{t('bootcamp.register.bootcampPrice', 'Harga Bootcamp')}</span>
                                                                    <span className="font-semibold">Rp {bootcamp.price.toLocaleString('id-ID')}</span>
                                                                </div>

                                                                {discountData?.valid && (
                                                                    <div className="flex items-center justify-between text-sm text-green-600">
                                                                        <span>{t('bootcamp.register.promoDiscount', { code: discountData.discount_code.code })}</span>
                                                                        <span className="font-semibold">
                                                                            -Rp {discountData.discount_amount.toLocaleString('id-ID')}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-gray-600 dark:text-gray-400">{t('bootcamp.register.transactionFee', 'Biaya Transaksi')}</span>
                                                                    <span className="font-semibold">Rp {adminFee.toLocaleString('id-ID')}</span>
                                                                </div>

                                                                <Separator />

                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-base font-bold">{t('bootcamp.register.totalPayment', 'Total Pembayaran')}</span>
                                                                    <span className="text-2xl font-bold text-orange-600">
                                                                        Rp {totalPrice.toLocaleString('id-ID')}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Terms and Conditions Checkbox */}
                                                            {!isFree && (
                                                                <div className="flex items-start space-x-2">
                                                                    <Checkbox
                                                                        id="terms"
                                                                        checked={termsAccepted}
                                                                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                                                                    />
                                                                    <label
                                                                        htmlFor="terms"
                                                                        className="text-xs leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                    >
                                                                        {t('bootcamp.register.agreeTerms', 'Saya menyetujui')}{' '}
                                                                        <a
                                                                            href="/terms-and-conditions"
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-primary hover:underline"
                                                                        >
                                                                            {t('bootcamp.register.termsAndConditions', 'syarat dan ketentuan')}
                                                                        </a>{' '}
                                                                        {i18n.language === 'en' ? 'applicable' : 'yang berlaku'}
                                                                    </label>
                                                                </div>
                                                            )}

                                                            {/* Checkout Button */}
                                                            <Button
                                                                type="submit"
                                                                className="w-full"
                                                                size="lg"
                                                                disabled={loading || (!termsAccepted && !isFree)}
                                                                onClick={handleCheckout}
                                                            >
                                                                {loading ? (
                                                                    <>
                                                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                                        {t('bootcamp.register.processing', 'Memproses...')}
                                                                    </>
                                                                ) : isFree ? (
                                                                    t('bootcamp.register.btnGetFreeAccess', 'Daftar Gratis Sekarang')
                                                                ) : (
                                                                    t('bootcamp.register.btnPayNow', 'Lanjutkan ke Pembayaran')
                                                                )}
                                                            </Button>
                                                        </TabsContent>

                                                        {/* Tab Cicilan */}
                                                        <TabsContent value="installment" className="space-y-4 m-0">
                                                            <InstallmentOptions
                                                                productType="bootcamp"
                                                                productId={bootcamp.id}
                                                                productPrice={bootcamp.price}
                                                                terms={installmentTerms}
                                                                activeInstallment={activeInstallment}
                                                                termsAccepted={termsAccepted}
                                                                onTermsAcceptedChange={setTermsAccepted}
                                                                onBeforePay={async () => {
                                                                    if (!activeInstallment && !termsAccepted) {
                                                                        toast.error(t('bootcamp.register.errors.termsRequired', 'Anda harus menyetujui syarat dan ketentuan!'));
                                                                        return false;
                                                                    }
                                                                    return await ensureAuth();
                                                                }}
                                                            />
                                                        </TabsContent>
                                                    </Tabs>
                                                ) : (
                                                    <>
                                                        {/* Promo / Referral Code Section */}
                                                        <div className="mb-6 space-y-4">
                                                            {/* Jenis Kode */}
                                                            <div className="space-y-2">
                                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                                    <Tag className="h-4 w-4" />
                                                                    {t('bootcamp.register.codeType', 'Jenis Kode')}
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
                                                                        <RadioGroupItem value="voucher" id="boot-code-voucher" />
                                                                        <Label htmlFor="boot-code-voucher" className="cursor-pointer text-sm">{t('bootcamp.register.voucher', 'Voucher')}</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value="referral" id="boot-code-referral" />
                                                                        <Label htmlFor="boot-code-referral" className="cursor-pointer text-sm">{t('bootcamp.register.referral', 'Referral')}</Label>
                                                                    </div>
                                                                </RadioGroup>
                                                            </div>

                                                            {/* Input Kode */}
                                                            <div className="space-y-2">
                                                                <Label htmlFor="promo-code" className="text-sm font-medium">
                                                                    {codeType === 'voucher' ? t('bootcamp.register.voucherCode', 'Kode Voucher') : t('bootcamp.register.referralCode', 'Kode Referral')}
                                                                </Label>
                                                                <div className="flex gap-2">
                                                                    <div className="relative flex-1">
                                                                        <Input
                                                                            id="promo-code"
                                                                            type="text"
                                                                            placeholder={codeType === 'voucher' ? t('bootcamp.register.enterVoucherCode', 'Masukkan kode promo') : t('bootcamp.register.enterReferralCode', 'Masukkan kode referral')}
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
                                                                                toast.error(codeType === 'voucher' ? t('bootcamp.register.enterVoucherCode', 'Masukkan kode promo terlebih dahulu') : t('bootcamp.register.enterReferralCode', 'Masukkan kode referral terlebih dahulu'));
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
                                                                                {t('bootcamp.register.voucherSuccess', { code: discountData.discount_code.code })}
                                                                            </p>
                                                                        </div>
                                                                        <p className="text-sm text-green-700 dark:text-green-300">
                                                                            <span className="font-mono font-bold">{discountData.discount_code.code}</span> -{' '}
                                                                            {discountData.discount_code.name}
                                                                        </p>
                                                                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                                                            {t('bootcamp.register.voucherDiscount', { name: discountData.discount_code.name, value: discountData.discount_code.formatted_value })}
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
                                                                            <p className="font-semibold text-green-800 dark:text-green-200">{t('bootcamp.register.referralSuccess', 'Kode Referral Valid!')}</p>
                                                                        </div>
                                                                        <p className="text-sm text-green-700 dark:text-green-300">
                                                                            {t('bootcamp.register.referralReferredBy', { name: referralData.referrer?.name })}
                                                                        </p>
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Price Breakdown */}
                                                        <div className="mb-6 space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900/50">
                                                            {bootcamp.strikethrough_price > 0 && (
                                                                <>
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="text-gray-600 dark:text-gray-400">{t('bootcamp.register.originalPrice', 'Harga Asli')}</span>
                                                                        <span className="font-medium text-gray-500 line-through">
                                                                            Rp {bootcamp.strikethrough_price.toLocaleString('id-ID')}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="text-gray-600 dark:text-gray-400">{t('bootcamp.register.discount', 'Diskon')}</span>
                                                                        <span className="font-semibold text-red-600">
                                                                            -Rp {(bootcamp.strikethrough_price - bootcamp.price).toLocaleString('id-ID')}
                                                                        </span>
                                                                    </div>
                                                                    <Separator />
                                                                </>
                                                            )}

                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400">{t('bootcamp.register.bootcampPrice', 'Harga Bootcamp')}</span>
                                                                <span className="font-semibold">Rp {bootcamp.price.toLocaleString('id-ID')}</span>
                                                            </div>

                                                            {discountData?.valid && (
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                                        <Gift className="h-3.5 w-3.5" />
                                                                        {t('bootcamp.register.promoDiscount', { code: discountData.discount_code.code })}
                                                                    </span>
                                                                    <span className="font-semibold text-green-600">
                                                                        -Rp {discountData.discount_amount.toLocaleString('id-ID')}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400">{t('bootcamp.register.transactionFee', 'Biaya Transaksi')}</span>
                                                                <span className="font-semibold">Rp {adminFee.toLocaleString('id-ID')}</span>
                                                            </div>

                                                            <Separator />

                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold">{t('bootcamp.register.totalPayment', 'Total Pembayaran')}</span>
                                                                <span className="text-2xl font-bold text-orange-600">
                                                                    Rp {totalPrice.toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Security Note */}
                                                        <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
                                                            <Shield className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                                            <div className="text-xs text-blue-700 dark:text-blue-300">
                                                                <p className="mb-1 font-semibold">{t('bootcamp.detail.securePaymentText', 'Pembayaran Aman & Terpercaya')}</p>
                                                                <p>{i18n.language === 'en' ? 'Your transaction is protected with SSL encryption' : 'Transaksi Anda dilindungi dengan enkripsi SSL'}</p>
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
                                                                {t('bootcamp.register.agreeTerms', 'Saya menyetujui')}{' '}
                                                                <a
                                                                    href="/terms-and-conditions"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="font-medium text-blue-600 hover:underline"
                                                                >
                                                                    {t('bootcamp.register.termsAndConditions', 'syarat dan ketentuan')}
                                                                </a>{' '}
                                                                {i18n.language === 'en' ? 'applicable' : 'yang berlaku'}
                                                            </Label>
                                                        </div>

                                                        {/* Submit Button */}
                                                        <Button
                                                            type="submit"
                                                            size="lg"
                                                            disabled={!termsAccepted || loading}
                                                            className="w-full disabled:opacity-50"
                                                        >
                                                            {loading ? (
                                                                <>
                                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                                    {t('bootcamp.register.processing', 'Memproses...')}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CreditCard className="mr-2 h-5 w-5" />
                                                                    {t('bootcamp.register.btnPayNow', 'Lanjutkan Pembayaran')}
                                                                </>
                                                            )}
                                                        </Button>
                                                    </>
                                                )}
                                            </>
                                        )}

                                        {isFree && (
                                            <Button
                                                type="submit"
                                                size="lg"
                                                disabled={loading}
                                                className="w-full disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                        {t('bootcamp.register.processing', 'Memproses...')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="mr-2 h-5 w-5" />
                                                        {t('bootcamp.register.btnUploadProof', 'Upload Bukti Follow')}
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </form>
                                </Card>
                            ) : (
                                <Card className="overflow-hidden border-2">
                                    <div className="border-b bg-gradient-to-r from-green-600 to-emerald-600 p-4">
                                        <h2 className="text-center text-lg font-bold text-white">{t('bootcamp.register.uploadProofTitle', 'Upload Bukti Follow & Tag')}</h2>
                                    </div>

                                    <form onSubmit={handleFreeCheckout} className="p-6">
                                        <div className="space-y-4">
                                            {[1, 2, 3].map((index) => {
                                                const requirementKey = `requirement_${index}` as keyof Bootcamp;
                                                const proofKey = `requirement_${index}_proof` as const;
                                                const requirementText =
                                                    (bootcamp[requirementKey] as string | null | undefined) || `Persyaratan ${index}`;

                                                return (
                                                    <div key={index}>
                                                        <Label htmlFor={proofKey}>{t('bootcamp.register.proofFor', { requirement: requirementText })}</Label>
                                                        <Input
                                                            id={proofKey}
                                                            data-field={proofKey}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(proofKey, e.target.files?.[0] || null)}
                                                            className={fileErrors[proofKey] ? 'border-red-500' : ''}
                                                            required
                                                        />
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {t('bootcamp.register.proofScreenshotNotice', { requirement: requirementText })}
                                                        </p>
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
                                                    {t('bootcamp.register.btnBack', 'Kembali')}
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
                                                    {loading ? t('bootcamp.register.processing', 'Memproses...') : t('bootcamp.register.btnGetFreeAccess', 'Dapatkan Akses Gratis')}
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
