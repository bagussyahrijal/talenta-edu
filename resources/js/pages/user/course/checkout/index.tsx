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
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BadgeCheck, Check, Clock, CreditCard, Gift, Hourglass, Lock, Play, Shield, Star, Tag, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    slug: string;
    strikethrough_price: number;
    price: number;
    key_points?: string | null;
    level: 'beginner' | 'intermediate' | 'advanced';
    modules?: {
        title: string;
        description?: string | null;
        lessons?: {
            title: string;
            description?: string | null;
            type: 'text' | 'video' | 'file' | 'quiz';
            attachment?: string | null;
            video_url?: string | null;
            is_free?: boolean;
        }[];
    }[];
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

function getYoutubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
}

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

const levelColors = {
    beginner: 'bg-primary-foreground text-black border-primary-500/20 dark:text-red-400',
    intermediate: 'bg-primary-foreground text-black border-primary-500/20 dark:text-red-400',
    advanced: 'bg-primary-foreground text-black border-primary-500/20 dark:text-red-400',
};

const levelLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
};

export default function CheckoutCourse({
    course,
    hasAccess,
    activeInstallment: initialActiveInstallment = null,
    pendingInvoice,
    transactionDetail,
    // channels,
    referralInfo,
    installmentTerms = [],
}: {
    course: Course;
    hasAccess: boolean;
    activeInstallment?: ActiveInstallmentData | null;
    pendingInvoice?: PendingInvoice | null;
    transactionDetail?: TransactionDetail | null;
    // channels: PaymentChannel[];
    referralInfo: ReferralInfo;
    installmentTerms?: InstallmentTermOption[];
}) {
    const { t } = useTranslation('user');
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number;

    const [activeInstallment, setActiveInstallment] = useState<ActiveInstallmentData | null>(initialActiveInstallment);
    const [paymentTab, setPaymentTab] = useState<'full' | 'installment'>(initialActiveInstallment ? 'installment' : 'full');
    const firstVideoLesson = course.modules?.flatMap((module) => module.lessons || []).find((lesson) => lesson.type === 'video' && lesson.video_url);
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

    const keyPointList = parseList(course.key_points);

    const totalModules = course.modules?.length || 0;
    const totalLessons = course.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0;
    // const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(channels.length > 0 ? channels[0] : null);

    const isFree = course.price === 0;

    const basePrice = course.price;
    const discountAmount = discountData?.discount_amount || 0;
    const finalCoursePrice = basePrice - discountAmount;

    // const calculateAdminFee = (channel: PaymentChannel | null): number => {
    //     if (!channel || isFree) return 0;
    //     const flatFee = channel.fee_customer.flat || 0;
    //     const percentFee = Math.round(finalCoursePrice * ((channel.fee_customer.percent || 0) / 100));
    //     return flatFee + percentFee;
    // };

    const adminFee = isFree ? 0 : 5000; //calculateAdminFee(selectedChannel);
    const totalPrice = isFree ? 0 : finalCoursePrice + adminFee;

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
                setReferralError(data.message || t('course.checkout.errors.invalidReferral'));
            }
        } catch (error: any) {
            setReferralData(null);
            setReferralError(error.response?.data?.message || t('course.checkout.errors.referralValidateError'));
        } finally {
            setReferralLoading(false);
        }
    };

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
                    amount: course.price,
                    product_type: 'course',
                    product_id: course.id,
                }),
            });

            const data = await response.json();

            if (data.valid) {
                setDiscountData(data);
                setPromoError('');
            } else {
                setDiscountData(null);
                setPromoError(data.message || t('course.checkout.errors.invalidPromo'));
            }
        } catch {
            setDiscountData(null);
            setPromoError(t('course.checkout.errors.promoValidateError'));
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
            toast.error(t('course.checkout.profileIncompletePhone'));
            setTimeout(() => {
                window.location.href = route('profile.edit');
            }, 1500);
            return;
        }

        setLoading(true);

        router.post(
            route('enroll.free'),
            {
                type: 'course',
                id: course.id,
            },
            {
                onError: (errors) => {
                    console.log('Free enrollment errors:', errors);
                    toast.error(errors.message || t('course.checkout.errors.enrollFreeFailed'));
                },
                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (activeInstallment && !activeInstallment.is_fully_paid) {
            toast.error(t('course.checkout.activeInstallmentAlertError'));
            setPaymentTab('installment');
            return;
        }

        if (!isProfileComplete) {
            toast.error(t('course.checkout.profileIncompletePhone'));
            setTimeout(() => {
                window.location.href = route('profile.edit');
            }, 1500);
            return;
        }

        if (!termsAccepted && !isFree) {
            toast.error(t('course.checkout.errors.termsRequired'));
            return;
        }

        setLoading(true);

        if (isFree) {
            return handleFreeCheckout(e);
        }

        const submitPayment = async (): Promise<void> => {
            const originalDiscountAmount = course.strikethrough_price > 0 ? course.strikethrough_price - course.price : 0;
            const promoDiscountAmount = discountData?.discount_amount || 0;

            const invoiceData: InvoiceData = {
                type: 'course',
                id: course.id,
                discount_amount: originalDiscountAmount + promoDiscountAmount,
                nett_amount: finalCoursePrice,
                total_amount: totalPrice,
            };

            if (discountData?.valid && codeType === 'voucher') {
                invoiceData.discount_code_id = discountData.discount_code.id;
                invoiceData.discount_code_amount = discountData.discount_amount;
            }

            if (codeType === 'referral' && referralData?.valid) {
                invoiceData.referral_code = promoCode;
            }

            const storedAffiliate = sessionStorage.getItem('affiliate_code') || new URLSearchParams(window.location.search).get('ref');
            if (storedAffiliate) {
                (invoiceData as any).affiliate_code = storedAffiliate;
            }

            try {
                const res = await axios.post(route('invoice.store'), invoiceData);

                if (res.data && res.data.success) {
                    if (res.data.payment_url) {
                        window.location.href = res.data.payment_url;
                    } else {
                        throw new Error(t('course.checkout.paymentUrlNotReceived'));
                    }
                } else {
                    throw new Error(res.data?.message || t('course.checkout.errors.createInvoiceFailed'));
                }
            } catch (error: any) {
                console.error('Payment error:', error);
                throw error;
            }
        };

        try {
            await submitPayment();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || t('course.checkout.errors.paymentFailed'));
            setLoading(false);
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
            return { time: t('course.checkout.expired'), status: 'expired' };
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours < 1) {
            return { time: t('course.checkout.minutesLeft', { minutes }), status: 'urgent' };
        }

        return { time: t('course.checkout.hoursMinutesLeft', { hours, minutes }), status: hours < 3 ? 'urgent' : 'normal' };
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(t('course.checkout.copiedToClipboard'));
        });
    };

    if (!isLoggedIn) {
        const currentUrl = window.location.href;
        const loginUrl = route('login', { redirect: currentUrl });

        return (
            <UserLayout>
                <Head title={t('course.checkout.loginRequired')} />

                <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 px-4 py-16">
                    <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />
                    <div className="absolute top-0 left-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/30 blur-3xl" />
                    <div className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-purple-400/30 blur-3xl" />

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto max-w-4xl text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm"
                        >
                            <Lock className="h-4 w-4 text-white" />
                            <span className="text-sm font-medium text-white">{t('course.checkout.loginRequired')}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                        >
                            {course.title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-blue-100"
                        >
                            {t('course.checkout.loginSubtitle')}
                        </motion.p>
                    </motion.div>
                </section>

                <section className="mx-auto my-8 w-full max-w-2xl px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <Card className="overflow-hidden border-2">
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 dark:from-blue-950/20 dark:to-purple-950/20">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                                    <User className="h-10 w-10 text-white" />
                                </div>

                                <h2 className="mb-3 text-center text-2xl font-bold">{t('course.checkout.loginToContinue')}</h2>
                                <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
                                    {t('course.checkout.loginDesc')}
                                    {referralInfo.hasActive && ` ${t('course.checkout.referralPersistNotice')}`}
                                </p>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        <a href={loginUrl}>
                                            <User className="mr-2 h-4 w-4" />
                                            {t('course.checkout.loginNow')}
                                        </a>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="flex-1 border-2">
                                        <Link href={route('register', referralInfo.code ? { ref: referralInfo.code } : {})}>{t('course.checkout.registerNewAccount')}</Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </section>
            </UserLayout>
        );
    }

    if (!isProfileComplete) {
        return (
            <UserLayout>
                <Head title={t('course.checkout.incompleteProfileTitle')} />

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
                            <span className="text-sm font-medium text-white">{t('course.checkout.incompleteProfileTitle')}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                        >
                            {course.title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-orange-100"
                        >
                            {t('course.checkout.completeProfileSubtitle')}
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

                                <h2 className="mb-3 text-center text-2xl font-bold">{t('course.checkout.incompleteProfileTitle')}</h2>
                                <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
                                    {t('course.checkout.completeProfilePhoneDesc')}
                                </p>

                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                                >
                                    <Link href={route('profile.edit', { redirect: window.location.href })}>
                                        <User className="mr-2 h-4 w-4" />
                                        {t('course.checkout.btnCompleteProfileNow')}
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
            <Head title={`${t('course.checkout.headTitle')} - ${course.title}`} />

            {/* Hero Section */}
            <section className="from-primary to-primary-foreground relative overflow-hidden bg-gradient-to-br px-4 py-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto max-w-7xl">
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium backdrop-blur-sm ${levelColors[course.level]}`}
                        >
                            <Star className="h-3.5 w-3.5" />
                            {t(`course.level.${course.level}`, { defaultValue: course.level })}
                        </motion.div>

                        {isFree && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-white px-3 py-1.5 text-sm font-medium text-green-600 backdrop-blur-sm"
                            >
                                <Gift className="h-3.5 w-3.5" />
                                {t('course.checkout.free')}
                            </motion.div>
                        )}

                        {course.strikethrough_price > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-red-700 bg-red-200 px-3 py-1.5 text-sm font-medium text-red-600 backdrop-blur-sm"
                            >
                                <Tag className="h-3.5 w-3.5" />
                                {t('course.checkout.discountPercent', { percent: Math.round(((course.strikethrough_price - course.price) / course.strikethrough_price) * 100) })}
                            </motion.div>
                        )}
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4 text-3xl font-bold text-black sm:text-4xl lg:text-5xl"
                    >
                        {course.title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-6 max-w-3xl text-justify text-lg text-black"
                    >
                        {course.description}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap gap-6"
                    >
                        <div className="flex items-center gap-2 text-black">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                                <Play className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-black">{t('course.checkout.totalModules')}</p>
                                <p className="font-semibold">{t('course.checkout.modulesCount', { count: totalModules })}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-black">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-black">{t('course.checkout.totalLessons')}</p>
                                <p className="font-semibold">{t('course.checkout.lessonsCount', { count: totalLessons })}</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Main Content */}
            <section className="mx-auto my-8 w-full max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Course Details */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
                        <Tabs defaultValue="detail" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="detail" className="gap-2">
                                    <BadgeCheck className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('course.checkout.tabWhatWillLearn')}</span>
                                    <span className="sm:hidden">{t('course.checkout.tabDetail')}</span>
                                </TabsTrigger>
                                <TabsTrigger value="preview" className="gap-2">
                                    <Play className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('course.checkout.videoPreviewTitle')}</span>
                                    <span className="sm:hidden">{t('course.checkout.tabPreview')}</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="detail" className="mt-4">
                                <Card className="p-6">
                                    <div className="mb-6">
                                        <h2 className="mb-2 text-2xl font-bold">{t('course.checkout.whatYouWillLearn')}</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('course.checkout.detailSubtitle')}
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {keyPointList.map((keyPoint, idx) => (
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
                                                <p className="text-sm leading-relaxed font-medium text-gray-700 dark:text-gray-300">{keyPoint}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="preview" className="mt-4">
                                <Card className="overflow-hidden p-6">
                                    <div className="mb-4">
                                        <h2 className="mb-2 text-2xl font-bold">{t('course.checkout.videoPreviewHeader')}</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('course.checkout.videoPreviewDesc', { title: course.title })}
                                        </p>
                                    </div>

                                    <div className="aspect-video w-full overflow-hidden rounded-xl border-4 border-gray-200 shadow-2xl dark:border-gray-800">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={
                                                firstVideoLesson?.video_url &&
                                                (firstVideoLesson.video_url.includes('youtube.com') ||
                                                    firstVideoLesson.video_url.includes('youtu.be'))
                                                    ? `https://www.youtube.com/embed/${getYoutubeId(firstVideoLesson.video_url)}`
                                                    : ''
                                            }
                                            title="YouTube video player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="h-full w-full"
                                        ></iframe>
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

                                        <h2 className="mb-3 text-2xl font-bold text-green-900 dark:text-green-100">{t('course.checkout.alreadyHaveAccessTitle')}</h2>
                                        <p className="mb-6 text-sm text-green-700 dark:text-green-300">
                                            {t('course.checkout.alreadyHaveAccessDesc')}
                                        </p>

                                        <Button
                                            asChild
                                            size="lg"
                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                        >
                                            <a href={`/profile/my-courses/${course.slug}`}>
                                                <Play className="mr-2 h-4 w-4" />
                                                {t('course.checkout.btnEnterClass')}
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
                                                            <h2 className="text-lg font-semibold text-red-700">{t('course.checkout.paymentExpiredTitle')}</h2>
                                                        </>
                                                    );
                                                }
                                                return (
                                                    <>
                                                        <Hourglass className="h-5 w-5 text-yellow-600" />
                                                        <h2 className="text-lg font-semibold text-yellow-900">{t('course.checkout.pendingInvoiceTitle')}</h2>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="space-y-6 p-6">
                                        {/* Invoice Info */}
                                        <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{t('course.checkout.invoiceNumber')}</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">{pendingInvoice.invoice_code}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{t('course.checkout.totalPayment')}</span>
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
                                                            {t('course.checkout.paymentExpiredDesc')}&nbsp;
                                                            <a
                                                                href="https://wa.me/6289528514480"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-bold text-orange-600 underline"
                                                            >
                                                                {t('course.checkout.waAdmin')}
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
                                                        {t('course.checkout.btnContinuePayment')}
                                                    </a>
                                                </Button>
                                            )}

                                            <div className="flex gap-2">
                                                <Button onClick={() => window.location.reload()} variant="outline" className="flex-1" size="lg">
                                                    {t('course.checkout.btnCheckStatus')}
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                                                    size="lg"
                                                    disabled={cancellingInvoice}
                                                    onClick={async () => {
                                                        if (confirm(t('course.checkout.confirmCancel'))) {
                                                            setCancellingInvoice(true);
                                                            try {
                                                                await axios.post(route('invoice.cancel', pendingInvoice.id));
                                                                toast.success(t('course.checkout.cancelSuccess'));
                                                                window.location.reload();
                                                            } catch (err: any) {
                                                                toast.error(err.response?.data?.message || t('course.checkout.cancelFailed'));
                                                                setCancellingInvoice(false);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {cancellingInvoice ? t('course.checkout.cancelling') : t('course.checkout.btnCancelOrder')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="overflow-hidden border-2">
                                    <div className="bg-primary border-b p-4">
                                        <h2 className="text-center text-lg font-bold text-white">
                                            {isFree ? t('course.checkout.freeRegistration') : t('course.checkout.paymentDetailTitle')}
                                        </h2>
                                    </div>

                                    <form onSubmit={handleCheckout} className="px-4 pb-6">
                                        {isFree ? (
                                                    <div className="mb-2 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center dark:from-green-950/20 dark:to-emerald-950/20">
                                                <Gift className="mx-auto mb-3 h-12 w-12 text-green-600" />
                                                <p className="text-2xl font-bold text-green-600">{t('course.checkout.freeClassBadge')}</p>
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('course.checkout.freeAccessDesc')}</p>
                                            </div>
                                        ) : (
                                            <>
                                                {!isFree && ((installmentTerms && installmentTerms.length > 0) || (activeInstallment && !activeInstallment.is_fully_paid)) ? (
                                                    <Tabs
                                                        value={paymentTab}
                                                        onValueChange={(val) => {
                                                            if (val === 'full' && activeInstallment && !activeInstallment.is_fully_paid) {
                                                                toast.error(t('course.checkout.activeInstallmentAlertFull'));
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
                                                                {t('course.checkout.tabFullPayment')}
                                                            </TabsTrigger>
                                                            <TabsTrigger value="installment" className="text-xs sm:text-sm">
                                                                {t('course.checkout.tabInstallment')} ({activeInstallment && !activeInstallment.is_fully_paid ? (activeInstallment.total_terms || activeInstallment.terms?.length) : installmentTerms.length}x)
                                                            </TabsTrigger>
                                                        </TabsList>

                                                        {/* Tab Bayar Penuh */}
                                                        <TabsContent value="full" className="space-y-4 m-0">
                                                            <div className="space-y-2">
                                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                                    <Tag className="h-4 w-4" />
                                                                    {t('course.checkout.codeType')}
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
                                                                        <RadioGroupItem value="voucher" id="code-voucher" />
                                                                        <Label htmlFor="code-voucher" className="cursor-pointer text-sm">{t('course.checkout.voucher')}</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value="referral" id="code-referral" />
                                                                        <Label htmlFor="code-referral" className="cursor-pointer text-sm">{t('course.checkout.referral')}</Label>
                                                                    </div>
                                                                </RadioGroup>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="promo-code" className="text-sm font-medium">
                                                                    {codeType === 'voucher' ? t('course.checkout.promoCodeLabel') : t('course.checkout.referralCode')}
                                                                </Label>
                                                                <div className="relative">
                                                                    <Input
                                                                        id="promo-code"
                                                                        type="text"
                                                                        placeholder={codeType === 'voucher' ? t('course.checkout.enterPromoPlaceholder') : t('course.checkout.enterReferralCode')}
                                                                        value={promoCode}
                                                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                                        className="pr-10 font-mono"
                                                                    />
                                                                    {(promoLoading || referralLoading) && (
                                                                        <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                                                                        </div>
                                                                    )}
                                                                    {!(promoLoading || referralLoading) && promoCode && (
                                                                        <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                                                                            {codeType === 'voucher' ? (
                                                                                discountData?.valid ? (
                                                                                    <Check className="h-4 w-4 text-green-600" />
                                                                                ) : promoError ? (
                                                                                    <X className="h-4 w-4 text-red-600" />
                                                                                ) : null
                                                                            ) : (
                                                                                referralData?.valid ? (
                                                                                    <Check className="h-4 w-4 text-green-600" />
                                                                                ) : referralError ? (
                                                                                    <X className="h-4 w-4 text-red-600" />
                                                                                ) : null
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>

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
                                                                            <p className="font-semibold text-green-800 dark:text-green-200">{t('course.checkout.promoApplied')}</p>
                                                                        </div>
                                                                        <p className="text-sm text-green-700 dark:text-green-300">
                                                                            <span className="font-mono font-bold">{discountData.discount_code.code}</span> -{' '}
                                                                            {discountData.discount_code.name}
                                                                        </p>
                                                                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                                                            {t('course.checkout.saveAmount', { amount: discountData.discount_code.formatted_value })}
                                                                        </p>
                                                                    </motion.div>
                                                                )}

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
                                                                            <p className="font-semibold text-green-800 dark:text-green-200">{t('course.checkout.referralSuccess')}</p>
                                                                        </div>
                                                                        <p className="text-sm text-green-700 dark:text-green-300">
                                                                            {t('course.checkout.referralReferredBy', { name: referralData.referrer?.name })}
                                                                        </p>
                                                                    </motion.div>
                                                                )}
                                                            </div>

                                                            <div className="space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900/50">
                                                                {course.strikethrough_price > 0 && (
                                                                    <>
                                                                        <div className="flex items-center justify-between text-sm">
                                                                            <span className="text-gray-600 dark:text-gray-400">{t('course.checkout.originalPrice')}</span>
                                                                            <span className="font-medium text-gray-500 line-through">
                                                                                Rp {course.strikethrough_price.toLocaleString('id-ID')}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between text-sm">
                                                                            <span className="text-gray-600 dark:text-gray-400">{t('course.checkout.discount')}</span>
                                                                            <span className="font-semibold text-red-600">
                                                                                -Rp {(course.strikethrough_price - course.price).toLocaleString('id-ID')}
                                                                            </span>
                                                                        </div>
                                                                        <Separator />
                                                                    </>
                                                                )}

                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-gray-600 dark:text-gray-400">{t('course.checkout.coursePrice')}</span>
                                                                    <span className="font-semibold">Rp {course.price.toLocaleString('id-ID')}</span>
                                                                </div>

                                                                {discountData?.valid && (
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                                            <Gift className="h-3.5 w-3.5" />
                                                                            {t('course.checkout.promoDiscount', { code: discountData.discount_code.code })}
                                                                        </span>
                                                                        <span className="font-semibold text-green-600">
                                                                            -Rp {discountData.discount_amount.toLocaleString('id-ID')}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-gray-600 dark:text-gray-400">{t('course.checkout.transactionFee')}</span>
                                                                    <span className="font-semibold">Rp {adminFee.toLocaleString('id-ID')}</span>
                                                                </div>

                                                                <Separator />

                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-bold">{t('course.checkout.totalPayment')}</span>
                                                                    <div className="text-right">
                                                                        {discountData?.valid && finalCoursePrice < course.price && (
                                                                            <div className="text-xs text-gray-500 line-through">
                                                                                Rp {(course.price + adminFee).toLocaleString('id-ID')}
                                                                            </div>
                                                                        )}
                                                                        <span className="text-2xl font-bold text-blue-600">
                                                                            Rp {totalPrice.toLocaleString('id-ID')}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
                                                                <Shield className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                                                <div className="text-xs text-blue-700 dark:text-blue-300">
                                                                    <p className="mb-1 font-semibold">{t('course.checkout.safePaymentTitle')}</p>
                                                                    <p>{t('course.checkout.safePaymentDesc')}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                                                                <Checkbox
                                                                    id="terms"
                                                                    checked={termsAccepted}
                                                                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                                                    className="mt-0.5"
                                                                />
                                                                <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed">
                                                                    {t('course.checkout.agreeTermsPrefix')}{' '}
                                                                    <a
                                                                        href="/terms-and-conditions"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="font-medium text-blue-600 hover:underline"
                                                                    >
                                                                        {t('course.checkout.termsAndConditions')}
                                                                    </a>{' '}
                                                                    {t('course.checkout.agreeTermsSuffix')}
                                                                </Label>
                                                            </div>

                                                            <Button
                                                                type="submit"
                                                                size="lg"
                                                                disabled={!termsAccepted || loading}
                                                                className="w-full disabled:opacity-50"
                                                            >
                                                                {loading ? (
                                                                    <>
                                                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                                        {t('course.checkout.processing')}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CreditCard className="mr-2 h-5 w-5" />
                                                                        {t('course.checkout.btnPayNow')}
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </TabsContent>

                                                        {/* Tab Cicilan */}
                                                        <TabsContent value="installment" className="space-y-4 m-0">
                                                            <InstallmentOptions
                                                                productType="course"
                                                                productId={course.id}
                                                                productPrice={course.price}
                                                                terms={installmentTerms}
                                                                activeInstallment={activeInstallment}
                                                                termsAccepted={termsAccepted}
                                                                onTermsAcceptedChange={setTermsAccepted}
                                                                onBeforePay={async () => {
                                                                    if (!isProfileComplete) {
                                                                        toast.error(t('course.checkout.profileIncompletePhone'));
                                                                        setTimeout(() => {
                                                                            window.location.href = route('profile.edit');
                                                                        }, 1500);
                                                                        return false;
                                                                    }
                                                                    if (!activeInstallment && !termsAccepted) {
                                                                        toast.error(t('course.checkout.errors.termsRequired'));
                                                                        return false;
                                                                    }
                                                                    return true;
                                                                }}
                                                            />
                                                        </TabsContent>
                                                    </Tabs>
                                                ) : (
                                                    <div className="mb-6 space-y-4">
                                                        {/* Jenis Kode */}
                                                        <div className="space-y-2">
                                                            <Label className="flex items-center gap-2 text-sm font-medium">
                                                                <Tag className="h-4 w-4" />
                                                                {t('course.checkout.codeType')}
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
                                                                    <RadioGroupItem value="voucher" id="code-voucher" />
                                                                    <Label htmlFor="code-voucher" className="cursor-pointer text-sm">{t('course.checkout.voucher')}</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="referral" id="code-referral" />
                                                                    <Label htmlFor="code-referral" className="cursor-pointer text-sm">{t('course.checkout.referral')}</Label>
                                                                </div>
                                                            </RadioGroup>
                                                        </div>

                                                        {/* Input Kode */}
                                                        <div className="space-y-2">
                                                            <Label htmlFor="promo-code" className="text-sm font-medium">
                                                                {codeType === 'voucher' ? t('course.checkout.promoCodeLabel') : t('course.checkout.referralCode')}
                                                            </Label>
                                                            <div className="relative">
                                                                <Input
                                                                    id="promo-code"
                                                                    type="text"
                                                                    placeholder={codeType === 'voucher' ? t('course.checkout.enterPromoPlaceholder') : t('course.checkout.enterReferralCode')}
                                                                    value={promoCode}
                                                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                                    className="pr-10 font-mono"
                                                                />
                                                                {(promoLoading || referralLoading) && (
                                                                    <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                                                                    </div>
                                                                )}
                                                                {!(promoLoading || referralLoading) && promoCode && (
                                                                    <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                                                                        {codeType === 'voucher' ? (
                                                                            discountData?.valid ? (
                                                                                <Check className="h-4 w-4 text-green-600" />
                                                                            ) : promoError ? (
                                                                                <X className="h-4 w-4 text-red-600" />
                                                                            ) : null
                                                                        ) : (
                                                                            referralData?.valid ? (
                                                                                <Check className="h-4 w-4 text-green-600" />
                                                                            ) : referralError ? (
                                                                                <X className="h-4 w-4 text-red-600" />
                                                                            ) : null
                                                                        )}
                                                                    </div>
                                                                )}
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
                                                                        <p className="font-semibold text-green-800 dark:text-green-200">{t('course.checkout.promoApplied')}</p>
                                                                    </div>
                                                                    <p className="text-sm text-green-700 dark:text-green-300">
                                                                        <span className="font-mono font-bold">{discountData.discount_code.code}</span> -{' '}
                                                                        {discountData.discount_code.name}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                                                        {t('course.checkout.saveAmount', { amount: discountData.discount_code.formatted_value })}
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
                                                                        <p className="font-semibold text-green-800 dark:text-green-200">{t('course.checkout.referralSuccess')}</p>
                                                                    </div>
                                                                    <p className="text-sm text-green-700 dark:text-green-300">
                                                                        {t('course.checkout.referralReferredBy', { name: referralData.referrer?.name })}
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                        </div>

                                                        {/* Price Breakdown */}
                                                        <div className="space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900/50">
                                                            {course.strikethrough_price > 0 && (
                                                                <>
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="text-gray-600 dark:text-gray-400">{t('course.checkout.originalPrice')}</span>
                                                                        <span className="font-medium text-gray-500 line-through">
                                                                            Rp {course.strikethrough_price.toLocaleString('id-ID')}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="text-gray-600 dark:text-gray-400">{t('course.checkout.discount')}</span>
                                                                        <span className="font-semibold text-red-600">
                                                                            -Rp {(course.strikethrough_price - course.price).toLocaleString('id-ID')}
                                                                        </span>
                                                                    </div>
                                                                    <Separator />
                                                                </>
                                                            )}

                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400">{t('course.checkout.coursePrice')}</span>
                                                                <span className="font-semibold">Rp {course.price.toLocaleString('id-ID')}</span>
                                                            </div>

                                                            {discountData?.valid && (
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                                        <Gift className="h-3.5 w-3.5" />
                                                                        {t('course.checkout.promoDiscount', { code: discountData.discount_code.code })}
                                                                    </span>
                                                                    <span className="font-semibold text-green-600">
                                                                        -Rp {discountData.discount_amount.toLocaleString('id-ID')}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400">{t('course.checkout.transactionFee')}</span>
                                                                <span className="font-semibold">Rp {adminFee.toLocaleString('id-ID')}</span>
                                                            </div>

                                                            <Separator />

                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold">{t('course.checkout.totalPayment')}</span>
                                                                <div className="text-right">
                                                                    {discountData?.valid && finalCoursePrice < course.price && (
                                                                        <div className="text-xs text-gray-500 line-through">
                                                                            Rp {(course.price + adminFee).toLocaleString('id-ID')}
                                                                        </div>
                                                                    )}
                                                                    <span className="text-2xl font-bold text-blue-600">
                                                                        Rp {totalPrice.toLocaleString('id-ID')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Security Note */}
                                                        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
                                                            <Shield className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                                            <div className="text-xs text-blue-700 dark:text-blue-300">
                                                                <p className="mb-1 font-semibold">{t('course.checkout.safePaymentTitle')}</p>
                                                                <p>{t('course.checkout.safePaymentDesc')}</p>
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
                                                                {t('course.checkout.agreeTermsPrefix')}{' '}
                                                                <a
                                                                    href="/terms-and-conditions"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="font-medium text-blue-600 hover:underline"
                                                                >
                                                                    {t('course.checkout.termsAndConditions')}
                                                                </a>{' '}
                                                                {t('course.checkout.agreeTermsSuffix')}
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
                                                                    {t('course.checkout.processing')}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CreditCard className="mr-2 h-5 w-5" />
                                                                    {t('course.checkout.btnPayNow')}
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {isFree && (
                                            /* Submit Button for Free */
                                            <Button
                                                type="submit"
                                                size="lg"
                                                disabled={loading}
                                                className="w-full disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                        {t('course.checkout.processing')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Gift className="mr-2 h-5 w-5" />
                                                        {t('course.checkout.btnGetFreeAccess')}
                                                    </>
                                                )}
                                            </Button>
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
