import InstallmentOptions, { ActiveInstallmentData, InstallmentTermOption } from '@/components/installment-options';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserLayout from '@/layouts/user-layout';
import { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { enUS, id as idLocale } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    AlertCircle,
    BadgeCheck,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Gift,
    GraduationCap,
    Hourglass,
    Loader2,
    LoaderCircle,
    Lock,
    RefreshCw,
    Tag,
    User,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Mentor {
    id: string;
    name: string;
}
interface Schedule {
    id: string;
    schedule_date?: string;
    start_date?: string;
}

interface Program {
    id: string;
    title: string;
    slug: string;
    description?: string;
    benefits?: string;
    terms_conditions?: string | null;
    scholarship_flow?: string | null;
    type: 'regular' | 'scholarship';
    price: number;
    scholarship_price?: number;
    strikethrough_price?: number;
    thumbnail?: string | null;
    registration_deadline?: string;
    mentors: Mentor[];
    schedules: Schedule[];
    document_required?: boolean;
    document_description?: string | null;
}

interface Application {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
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

interface GuestFormData {
    name: string;
    email: string;
    phone_number: string;
    instance: string;
    city: string;
}

interface PendingCheckoutData {
    programSlug: string;
    timestamp: number;
    promoCode: string;
    termsAccepted: boolean;
    discountData: DiscountData | null;
    needsDocumentUpload?: boolean;
}

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

interface PendingInvoice {
    id: string;
    invoice_code: string;
    status: string;
    amount: number;
    payment_method?: string;
    invoice_url?: string | null;
    created_at: string;
    expires_at: string;
}

interface RegisterProps {
    program: Program;
    hasAccess: boolean;
    pendingInvoice?: PendingInvoice | null;
    pendingInvoiceUrl?: string | null;
    regularApplication?: Application | null;
    scholarshipApplication?: Application | null;
    isScholarship: boolean;
    referralInfo?: {
        code?: string | null;
        hasActive?: boolean;
    };
    installmentTerms?: InstallmentTermOption[];
    activeInstallment?: ActiveInstallmentData | null;
}

export default function Register({
    program,
    hasAccess,
    pendingInvoice,
    pendingInvoiceUrl,
    regularApplication,
    scholarshipApplication,
    isScholarship,
    referralInfo,
    installmentTerms = [],
    activeInstallment: initialActiveInstallment = null,
}: RegisterProps) {
    const { t, i18n } = useTranslation('user');
    const dateLocale = i18n.language === 'en' ? enUS : idLocale;
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as
        | {
              name?: string;
              email?: string;
              phone_number?: string;
              instance?: string;
              city?: string;
          }
        | null
        | undefined;
    const isLoggedIn = !!user;
    const isProfileComplete = !!(isLoggedIn && user?.phone_number && user?.instance && user?.city);

    const [cancellingInvoice, setCancellingInvoice] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
    const [documentAttachment, setDocumentAttachment] = useState<File | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
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
    const [codeType, setCodeType] = useState<'voucher' | 'referral'>('voucher');
    const [promoCode, setPromoCode] = useState('');
    const [discountData, setDiscountData] = useState<DiscountData | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [referralData, setReferralData] = useState<{ valid: boolean; referrer?: { name: string } } | null>(null);
    const [referralLoading, setReferralLoading] = useState(false);
    const [referralError, setReferralError] = useState('');
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [guestScholarshipStatus, setGuestScholarshipStatus] = useState<string | null>(null);
    const [guestFormData, setGuestFormData] = useState<GuestFormData>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone_number: user?.phone_number ?? '',
        instance: user?.instance ?? '',
        city: user?.city ?? '',
    });

    const guestFormDataRef = useRef(guestFormData);
    guestFormDataRef.current = guestFormData;

    const formatRupiah = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const isApprovedScholarship = scholarshipApplication?.status === 'approved' || guestScholarshipStatus === 'approved';
    const isScholarshipNotApproved = program.type === 'scholarship' && !isApprovedScholarship;
    const displayPrice = isScholarshipNotApproved ? 0 : (isScholarship && program.scholarship_price ? program.scholarship_price : program.price);
    const deadline = program.registration_deadline ? new Date(program.registration_deadline) : null;
    const getDate = (s: Schedule) => s.schedule_date || s.start_date || '';
    const requiresDocumentUpload = program.type === 'regular' && !!program.document_required && !isScholarship;
    const documentStatus = regularApplication?.status ?? null;
    const hasApprovedDocument = !requiresDocumentUpload || documentStatus === 'approved';
    const isDocumentPending = documentStatus === 'pending';
    const isDocumentRejected = documentStatus === 'rejected';

    const updateGuestForm = (field: keyof GuestFormData, value: string) => {
        setGuestFormData((prev) => ({ ...prev, [field]: value }));
    };

    const isGuestFormComplete = useCallback(() => {
        if (isLoggedIn) return true;

        const currentFormData = guestFormDataRef.current;
        const hasEmail = !!currentFormData.email?.trim();
        const hasPhone = !!currentFormData.phone_number?.trim();
        const hasNameOrEmailExists = !!currentFormData.name?.trim() || emailExists;
        const hasInstanceOrEmailExists = !!currentFormData.instance?.trim() || guestScholarshipStatus === 'approved';
        const hasCityOrEmailExists = !!currentFormData.city?.trim();

        return hasEmail && hasPhone && hasNameOrEmailExists && hasInstanceOrEmailExists && hasCityOrEmailExists;
    }, [isLoggedIn, emailExists, guestScholarshipStatus]);

    const validatePromoCode = useCallback(async () => {
        if (!promoCode.trim() || displayPrice === 0) return;

        setPromoLoading(true);
        setPromoError('');

        try {
            const requestData: Record<string, string | number> = {
                code: promoCode,
                amount: displayPrice,
                product_type: 'certification_program',
                product_id: program.id,
            };

            if (!isLoggedIn && emailExists && guestFormData.email) {
                requestData.email = guestFormData.email;
            }

            const response = await axios.post('/api/discount-codes/validate', requestData);
            const data = response.data;

            if (data.valid) {
                setDiscountData(data);
                setPromoError('');
            } else {
                setDiscountData(null);
                setPromoError(data.message || t('certificationProgram.register.promoInvalid', 'Kode promo tidak valid'));
            }
        } catch (error: unknown) {
            setDiscountData(null);
            if (axios.isAxiosError(error)) {
                setPromoError(error.response?.data?.message || t('certificationProgram.register.promoError', 'Terjadi kesalahan saat memvalidasi kode promo'));
            } else {
                setPromoError(t('certificationProgram.register.promoError', 'Terjadi kesalahan saat memvalidasi kode promo'));
            }
        } finally {
            setPromoLoading(false);
        }
    }, [displayPrice, emailExists, guestFormData.email, isLoggedIn, program.id, promoCode, t]);

    const validateReferralCode = useCallback(async () => {
        if (!promoCode.trim() || displayPrice === 0) return;

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
                setReferralError(data.message || t('certificationProgram.register.referralInvalid', 'Kode referral tidak valid'));
            }
        } catch (error: unknown) {
            setReferralData(null);
            if (axios.isAxiosError(error)) {
                setReferralError(error.response?.data?.message || t('certificationProgram.register.referralError', 'Terjadi kesalahan saat memvalidasi kode referral'));
            } else {
                setReferralError(t('certificationProgram.register.referralError', 'Terjadi kesalahan saat memvalidasi kode referral'));
            }
        } finally {
            setReferralLoading(false);
        }
    }, [displayPrice, promoCode, t]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get('ref');
        if (refFromUrl) {
            sessionStorage.setItem('affiliate_code', refFromUrl);
        }
    }, [referralInfo]);

    useEffect(() => {
        if (!promoCode.trim() || displayPrice === 0) {
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
    }, [displayPrice, promoCode, codeType, validatePromoCode, validateReferralCode]);

    useEffect(() => {
        if (isLoggedIn) return;

        const email = guestFormData.email.trim();
        if (!email || !email.includes('@')) {
            setEmailExists(false);
            return;
        }

        const timer = setTimeout(async () => {
            setCheckingEmail(true);

            try {
                const response = await axios.post('/api/check-email', {
                    email,
                    program_id: program.id,
                });
                const data = response.data;

                if (data.exists) {
                    setEmailExists(true);
                    setGuestFormData((prev) => ({
                        ...prev,
                        name: data.name || prev.name,
                        phone_number: data.phone_number || prev.phone_number,
                        instance: data.instance || prev.instance,
                        city: data.city || prev.city,
                    }));

                    if (data.active_installment) {
                        setActiveInstallment(data.active_installment);
                        setPaymentTab('installment');
                    } else {
                        setActiveInstallment(null);
                    }
                } else {
                    setEmailExists(false);
                    setActiveInstallment(null);
                }

                // Always check and store scholarship application status, regardless of user existence
                if (data.scholarship_application_status) {
                    setGuestScholarshipStatus(data.scholarship_application_status);
                } else {
                    setGuestScholarshipStatus(null);
                }
            } catch {
                setEmailExists(false);
                setActiveInstallment(null);
                setGuestScholarshipStatus(null);
            } finally {
                setCheckingEmail(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [guestFormData.email, isLoggedIn, program.id]);

    const savePendingCheckout = useCallback(
        (needsDocumentUpload = false) => {
            const pendingCheckoutData: PendingCheckoutData = {
                programSlug: program.slug,
                timestamp: Date.now(),
                promoCode,
                termsAccepted,
                discountData,
                needsDocumentUpload,
            };

            sessionStorage.setItem('pendingCertificationCheckout', JSON.stringify(pendingCheckoutData));
        },
        [discountData, program.slug, promoCode, termsAccepted],
    );

    const refreshCSRFToken = useCallback(async (): Promise<string> => {
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
    }, []);

    const ensureAuthenticated = useCallback(async (): Promise<boolean> => {
        if (isLoggedIn) return true;

        const currentFormData = guestFormDataRef.current;

        if (!currentFormData.email?.trim() || !currentFormData.phone_number?.trim()) {
            toast.error(t('certificationProgram.register.emailPhoneRequired', 'Email dan nomor telepon wajib diisi.'));
            return false;
        }

        if (!currentFormData.instance?.trim() || !currentFormData.city?.trim()) {
            toast.error(t('certificationProgram.register.instanceCityRequired', 'Instansi dan Kota Domisili wajib diisi.'));
            return false;
        }

        setIsLoading(true);

        try {
            if (emailExists) {
                const loginResponse = await axios.post(route('auto-login'), {
                    email: currentFormData.email.trim(),
                    phone_number: currentFormData.phone_number.trim(),
                    instance: currentFormData.instance.trim(),
                    city: currentFormData.city.trim(),
                });

                const loginData = loginResponse.data;
                if (!loginData.success) {
                    throw new Error(loginData.message || t('certificationProgram.register.autoLoginFailed', 'Gagal login otomatis.'));
                }

                toast.success(t('certificationProgram.register.autoLoginSuccess', 'Login berhasil. Melanjutkan pendaftaran...'));
                return true;
            } else {
                if (!currentFormData.name?.trim()) {
                    toast.error(t('certificationProgram.register.nameRequired', 'Nama wajib diisi.'));
                    setIsLoading(false);
                    return false;
                }

                const regResponse = await axios.post(route('register'), {
                    name: currentFormData.name.trim(),
                    email: currentFormData.email.trim(),
                    phone_number: currentFormData.phone_number.trim(),
                    instance: currentFormData.instance.trim(),
                    city: currentFormData.city.trim(),
                    password: currentFormData.phone_number.trim(),
                    password_confirmation: currentFormData.phone_number.trim(),
                    affiliate_code: sessionStorage.getItem('affiliate_code') || '',
                });

                if (!(regResponse.data?.success || regResponse.status === 200 || regResponse.status === 201)) {
                    throw new Error(t('certificationProgram.register.registerFailed', 'Registrasi gagal.'));
                }

                toast.success(t('certificationProgram.register.registerSuccess', 'Registrasi berhasil. Melanjutkan pendaftaran...'));
                return true;
            }
        } catch (error: unknown) {
            setIsLoading(false);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || t('certificationProgram.register.authFailed', 'Gagal memproses login/registrasi otomatis.'));
            } else {
                toast.error(getErrorMessage(error, t('certificationProgram.register.authFailed', 'Gagal memproses login/registrasi otomatis.')));
            }
            return false;
        }
    }, [emailExists, guestFormData, isLoggedIn, t]);

    // Show scholarship prompt only when the user hasn't applied yet or their application was rejected.
    // For guests, consider `guestScholarshipStatus` returned by `/api/check-email`.
    const showScholarshipWarning = !!(
        isScholarship &&
        ((!scholarshipApplication && !guestScholarshipStatus) ||
            (scholarshipApplication && scholarshipApplication.status === 'rejected') ||
            guestScholarshipStatus === 'rejected')
    );

    // Determine if scholarship is not approved (either for logged user or guest)
    const scholarshipNotApproved = !!(
        isScholarship &&
        ((scholarshipApplication && scholarshipApplication.status !== 'approved') ||
            (guestScholarshipStatus && guestScholarshipStatus !== 'approved'))
    );

    const handleDocumentSubmit = () => {
        if (!documentAttachment) {
            toast.error(t('certificationProgram.register.selectDocFirst', 'Pilih dokumen pendukung terlebih dahulu'));
            return;
        }

        const formData = new FormData();
        formData.append('document_attachment', documentAttachment);

        router.post(route('certification-programs.apply-regular', program.slug), formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsDocumentDialogOpen(false);
                setDocumentAttachment(null);
                toast.success(t('certificationProgram.register.docSentSuccess', 'Dokumen berhasil dikirim. Menunggu verifikasi admin.'));
            },
            onError: () => {
                toast.error(t('certificationProgram.register.docSentError', 'Gagal mengirim dokumen pendukung'));
            },
        });
    };

    const submitPayment = useCallback(
        async (): Promise<void> => {
            const originalDiscountAmount =
                program.strikethrough_price && program.strikethrough_price > 0 ? program.strikethrough_price - program.price : 0;
            const promoDiscountAmount = discountData?.valid ? discountData.discount_amount : 0;
            const activeFinalPrice = displayPrice - promoDiscountAmount;
            const adminFee = displayPrice === 0 ? 0 : 5000;
            const invoiceData: Record<string, string | number> = {
                type: 'certification_program',
                id: program.id,
                discount_amount: originalDiscountAmount + promoDiscountAmount,
                nett_amount: activeFinalPrice,
                transaction_fee: adminFee,
                total_amount: activeFinalPrice + adminFee,
                isScholarship: isScholarship ? 1 : 0,
                is_scholarship: isScholarship ? 1 : 0,
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
                        sessionStorage.removeItem('pendingCertificationCheckout');
                        window.location.href = res.data.payment_url;
                    } else {
                        throw new Error(t('certificationProgram.register.paymentUrlError', 'Payment URL tidak diterima dari server.'));
                    }
                } else {
                    throw new Error(res.data?.message || t('certificationProgram.register.createInvoiceError', 'Gagal membuat invoice.'));
                }
            } catch (error) {
                console.error('Payment error:', error);
                throw error;
            }
        },
        [displayPrice, discountData, program.id, program.strikethrough_price, isScholarship, codeType, promoCode, referralData, t],
    );

    const handleCheckout = useCallback(async () => {
        if (activeInstallment && !activeInstallment.is_fully_paid) {
            toast.error(t('certificationProgram.register.activeInstallmentNotice', 'Anda memiliki transaksi cicilan yang sedang aktif. Silakan lanjutkan pembayaran termin cicilan Anda.'));
            setPaymentTab('installment');
            return;
        }

        if (!termsAccepted && displayPrice > 0) {
            toast.error(t('certificationProgram.register.mustAgreeTerms', 'Anda harus menyetujui syarat dan ketentuan.'));
            return;
        }

        // Check if guest form is complete before proceeding
        if (!isLoggedIn && !isGuestFormComplete()) {
            toast.error(t('certificationProgram.register.completeDataFirst', 'Lengkapi semua data diri terlebih dahulu.'));
            return;
        }

        const authenticated = await ensureAuthenticated();
        if (!authenticated) {
            return;
        }

        if (requiresDocumentUpload && !hasApprovedDocument) {
            if (isDocumentPending) {
                return;
            }

            setIsDocumentDialogOpen(true);
            return;
        }

        setIsLoading(true);

        try {
            await submitPayment();
        } catch (error) {
            toast.error(getErrorMessage(error, t('certificationProgram.register.paymentProcessError', 'Terjadi kesalahan saat proses pembayaran.')));
            setIsLoading(false);
        }
    }, [
        displayPrice,
        ensureAuthenticated,
        hasApprovedDocument,
        isDocumentPending,
        isDocumentRejected,
        requiresDocumentUpload,
        submitPayment,
        termsAccepted,
        isLoggedIn,
        isGuestFormComplete,
        activeInstallment,
        t,
    ]);

    const ensureAuthenticatedForDocument = useCallback(async () => {
        const currentFormData = guestFormDataRef.current;

        if (!currentFormData.email?.trim() || !currentFormData.phone_number?.trim()) {
            toast.error(t('certificationProgram.register.emailPhoneRequired', 'Email dan nomor telepon wajib diisi.'));
            return;
        }

        if (!currentFormData.instance?.trim() || !currentFormData.city?.trim()) {
            toast.error(t('certificationProgram.register.instanceCityRequired', 'Instansi dan Kota Domisili wajib diisi.'));
            return;
        }

        setIsLoading(true);

        try {
            if (emailExists) {
                const loginResponse = await axios.post(route('auto-login'), {
                    email: currentFormData.email.trim(),
                    phone_number: currentFormData.phone_number.trim(),
                    instance: currentFormData.instance.trim(),
                    city: currentFormData.city.trim(),
                });

                const loginData = loginResponse.data;
                if (!loginData.success) {
                    throw new Error(loginData.message || t('certificationProgram.register.autoLoginFailed', 'Gagal login otomatis.'));
                }

                toast.success(t('certificationProgram.register.loginOpenDocSuccess', 'Login berhasil. Membuka form upload dokumen...'));
            } else {
                if (!currentFormData.name?.trim()) {
                    toast.error(t('certificationProgram.register.nameRequired', 'Nama wajib diisi.'));
                    setIsLoading(false);
                    return;
                }

                await axios.post(route('register'), {
                    name: currentFormData.name.trim(),
                    email: currentFormData.email.trim(),
                    phone_number: currentFormData.phone_number.trim(),
                    instance: currentFormData.instance.trim(),
                    city: currentFormData.city.trim(),
                    password: currentFormData.phone_number.trim(),
                    password_confirmation: currentFormData.phone_number.trim(),
                    affiliate_code: sessionStorage.getItem('affiliate_code') || '',
                });

                toast.success(t('certificationProgram.register.registerOpenDocSuccess', 'Registrasi berhasil. Membuka form upload dokumen...'));
            }

            savePendingCheckout(true);
            window.location.reload();
        } catch (error: unknown) {
            setIsLoading(false);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || t('certificationProgram.register.authFailed', 'Gagal memproses login/registrasi otomatis.'));
            } else {
                toast.error(getErrorMessage(error, t('certificationProgram.register.authFailed', 'Gagal memproses login/registrasi otomatis.')));
            }
        }
    }, [emailExists, guestFormData, savePendingCheckout, t]);

    useEffect(() => {
        if (!isLoggedIn) return;

        const pendingCheckoutRaw = sessionStorage.getItem('pendingCertificationCheckout');
        if (!pendingCheckoutRaw) return;

        try {
            const pendingCheckout = JSON.parse(pendingCheckoutRaw) as PendingCheckoutData;

            const fiveMinutes = 5 * 60 * 1000;
            if (Date.now() - pendingCheckout.timestamp > fiveMinutes) {
                sessionStorage.removeItem('pendingCertificationCheckout');
                return;
            }

            if (pendingCheckout.programSlug !== program.slug) {
                sessionStorage.removeItem('pendingCertificationCheckout');
                return;
            }

            // Check if pending document upload
            if (pendingCheckout.needsDocumentUpload) {
                sessionStorage.removeItem('pendingCertificationCheckout');
                setIsDocumentDialogOpen(true);
                return;
            }

            if (pendingCheckout.promoCode) {
                setPromoCode(pendingCheckout.promoCode);
            }

            setTermsAccepted(pendingCheckout.termsAccepted || false);
            setDiscountData(pendingCheckout.discountData || null);
            sessionStorage.removeItem('pendingCertificationCheckout');

            void handleCheckout();
        } catch {
            sessionStorage.removeItem('pendingCertificationCheckout');
        }
    }, [handleCheckout, isLoggedIn, program.slug]);

    if (hasAccess && (!activeInstallment || activeInstallment.is_fully_paid)) {
        return (
            <UserLayout>
                <Head title={t('certificationProgram.register.headTitleEnrolled', { title: program.title })} />
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-800">
                    <div className="to-primary relative overflow-hidden bg-gradient-to-tl from-black px-4 py-8 md:py-12">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 size-96 rounded-full bg-white blur-3xl" />
                            <div className="absolute right-0 bottom-0 size-96 rounded-full bg-white blur-3xl" />
                        </div>
                        <div className="relative mx-auto w-full max-w-3xl text-center">
                            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-300" />
                            <h1 className="text-3xl font-bold text-white md:text-4xl">{t('certificationProgram.register.enrolledTitle')}</h1>
                            <p className="mt-2 text-blue-100 md:text-lg">{t('certificationProgram.register.enrolledDesc')}</p>
                        </div>
                    </div>
                    <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-4 py-8">
                        <Button asChild className="w-full">
                            <Link href={route('profile.index')}>{t('certificationProgram.register.btnToDashboard')}</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href={route('certification-programs.index')}>{t('certificationProgram.register.btnViewOtherPrograms')}</Link>
                        </Button>
                    </div>
                </div>
            </UserLayout>
        );
    }

    if (isLoggedIn && !isProfileComplete) {
        return (
            <UserLayout>
                <Head title={t('certificationProgram.register.completeProfileTitle', 'Lengkapi Profil')} />

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
                            <span className="text-sm font-medium text-white">{t('certificationProgram.register.incompleteProfileTitle')}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                        >
                            {program.title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-orange-100"
                        >
                            {t('certificationProgram.register.completeProfileSubtitle')}
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

                                <h2 className="mb-3 text-center text-2xl font-bold">{t('certificationProgram.register.completeProfileCardTitle')}</h2>
                                <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
                                    {t('certificationProgram.register.completeProfileCardDesc')}
                                </p>

                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                                >
                                    <Link href={route('profile.edit', { redirect: window.location.href })}>
                                        <User className="mr-2 h-4 w-4" />
                                        {t('certificationProgram.register.completeProfileNow')}
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </section>
            </UserLayout>
        );
    }

    const handlePrimaryAction = () => {
        if (requiresDocumentUpload && !hasApprovedDocument) {
            if (isDocumentPending) {
                return;
            }

            // If guest, need to authenticate first
            if (!isLoggedIn) {
                if (!isGuestFormComplete()) {
                    toast.error(t('certificationProgram.register.completeDataFirst', 'Lengkapi semua data diri terlebih dahulu.'));
                    return;
                }

                // Proceed with auto-login/register
                void ensureAuthenticatedForDocument();
                return;
            }

            setIsDocumentDialogOpen(true);
            return;
        }

        void handleCheckout();
    };

    const requirementList = parseList(program.terms_conditions || program.scholarship_flow);
    const benefitList = parseList(program.benefits);

    return (
        <UserLayout>
            <Head title={t('certificationProgram.register.headTitle', { title: program.title })} />

            {/* Hero Section */}
            <section className="from-primary to-primary-foreground relative overflow-hidden bg-gradient-to-br px-4 py-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto max-w-7xl">
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        {displayPrice === 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-white px-3 py-1.5 text-sm font-medium text-green-600 backdrop-blur-sm"
                            >
                                <Gift className="h-3.5 w-3.5" />
                                {t('certificationProgram.register.freeBadge', 'Gratis')}
                            </motion.div>
                        )}

                        {program.strikethrough_price && program.strikethrough_price > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-red-700 bg-red-200 px-3 py-1.5 text-sm font-medium text-red-600 backdrop-blur-sm"
                            >
                                <Tag className="h-3.5 w-3.5" />
                                {t('certificationProgram.register.discountBadge', { percent: Math.round(((program.strikethrough_price - displayPrice) / program.strikethrough_price) * 100) })}
                            </motion.div>
                        )}

                        {program.schedules.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-md"
                            >
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(getDate(program.schedules[0])), 'dd MMMM yyyy', { locale: dateLocale })}
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className={`inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-sm font-medium shadow-lg backdrop-blur-md ${isScholarship ? 'bg-purple-500/20 text-purple-100' : 'bg-white/20 text-white'}`}
                        >
                            <GraduationCap className="h-3.5 w-3.5" />
                            {isScholarship ? t('certificationProgram.detail.hero.badgeScholarship', 'Beasiswa') : t('certificationProgram.detail.hero.badgeRegular', 'Reguler')}
                        </motion.div>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                    >
                        {program.title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-6 max-w-3xl text-justify text-lg text-blue-100"
                    >
                        {program.description}
                    </motion.p>
                </motion.div>
            </section>

            {/* Main Content */}
            <section className="mx-auto my-8 w-full max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Details & Forms */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6 lg:col-span-2"
                    >
                        <Tabs defaultValue="detail" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="detail" className="gap-2">
                                    <BadgeCheck className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('certificationProgram.register.tabDetail', 'Detail Program')}</span>
                                    <span className="sm:hidden">{t('certificationProgram.register.tabDetailShort', 'Detail')}</span>
                                </TabsTrigger>
                                <TabsTrigger value="schedule" className="gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('certificationProgram.register.tabSchedule', 'Jadwal Pelaksanaan')}</span>
                                    <span className="sm:hidden">{t('certificationProgram.register.tabScheduleShort', 'Jadwal')}</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="detail" className="mt-4">
                                <Card className="p-6">
                                    {benefitList.length > 0 && (
                                        <div className="mb-8">
                                            <div className="mb-6">
                                                <h2 className="mb-2 text-2xl font-bold">{t('certificationProgram.register.whatYouWillGet', 'Yang Akan Kamu Dapatkan')}</h2>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {t('certificationProgram.register.benefitsSubtitle', 'Manfaat yang akan kamu peroleh setelah mengikuti program ini')}
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
                                                        <p className="text-sm leading-relaxed font-medium text-gray-700 dark:text-gray-300">
                                                            {benefit}
                                                        </p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {requirementList.length > 0 && (
                                        <div className="mt-8">
                                            <h2 className="mb-4 text-2xl font-bold">{t('certificationProgram.register.requirementsTitle', 'Persyaratan Peserta')}</h2>
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
                                    )}

                                    {program.mentors && program.mentors.length > 0 && (
                                        <div className="mt-8">
                                            <h2 className="mb-4 text-2xl font-bold">{t('certificationProgram.register.mentorTitle', 'Mentor Program')}</h2>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {program.mentors.map((mentor, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm dark:bg-zinc-800"
                                                    >
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50">
                                                            <User size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold">{mentor.name}</h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('certificationProgram.register.proMentor', 'Mentor Profesional')}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </TabsContent>

                            <TabsContent value="schedule" className="mt-4">
                                <Card className="p-6">
                                    <div className="mb-6">
                                        <h2 className="mb-2 text-2xl font-bold">{t('certificationProgram.register.scheduleTitle', 'Jadwal Pelaksanaan')}</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('certificationProgram.register.scheduleSubtitle', 'Daftar jadwal pertemuan selama program berlangsung')}</p>
                                    </div>

                                    <div className="space-y-3">
                                        {program.schedules.map((schedule, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                className="flex items-center justify-between rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-950/20 dark:to-indigo-950/20"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white shadow-lg">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            {t('certificationProgram.register.meetingNumber', { index: idx + 1 })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm dark:bg-zinc-800 dark:text-gray-300">
                                                    <Calendar size={14} className="text-blue-500" />
                                                    {format(new Date(getDate(schedule)), 'dd MMMM yyyy', { locale: dateLocale })}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {!isLoggedIn && (
                            <Card className="p-6">
                                <form
                                    className="flex flex-col gap-6"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                    }}
                                >
                                    <div className="mb-2">
                                        <h1 className="text-xl font-bold">{t('certificationProgram.register.guestFormTitle', 'Masukkan Data Diri Anda')}</h1>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t('certificationProgram.register.personalDataDesc')}
                                        </p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="guest-email">{t('certificationProgram.register.labelEmail')}</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    id="guest-email"
                                                    type="email"
                                                    required
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    value={guestFormData.email}
                                                    onChange={(e) => updateGuestForm('email', e.target.value)}
                                                    disabled={isLoading}
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
                                        </div>
                                        {emailExists && <p className="text-xs text-green-600">{t('certificationProgram.register.emailAutoFilled')}</p>}
                                    </div>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="guest-name">{t('certificationProgram.register.labelName')}</Label>
                                            <Input
                                                id="guest-name"
                                                type="text"
                                                required
                                                tabIndex={2}
                                                autoComplete="name"
                                                value={guestFormData.name}
                                                onChange={(e) => updateGuestForm('name', e.target.value)}
                                                disabled={isLoading || emailExists}
                                                placeholder={t('certificationProgram.register.placeholderName')}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="guest-phone">{t('certificationProgram.register.labelPhone')}</Label>
                                            <Input
                                                id="guest-phone"
                                                type="tel"
                                                required
                                                tabIndex={3}
                                                autoComplete="tel"
                                                value={guestFormData.phone_number}
                                                onChange={(e) => updateGuestForm('phone_number', e.target.value)}
                                                disabled={isLoading}
                                                placeholder={t('certificationProgram.register.placeholderPhone')}
                                            />
                                            {!emailExists && (
                                                <p className="text-xs text-gray-500">{t('certificationProgram.register.phoneAsPassword')}</p>
                                            )}
                                            {emailExists && (
                                                <p className="text-xs text-blue-600">{t('certificationProgram.register.phoneMustMatch')}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-2 pb-2">
                                            <Label htmlFor="guest-instance">{t('certificationProgram.register.labelInstanceOrg')}</Label>
                                            <Input
                                                id="guest-instance"
                                                type="text"
                                                tabIndex={4}
                                                autoComplete="organization"
                                                value={guestFormData.instance}
                                                onChange={(e) => updateGuestForm('instance', e.target.value)}
                                                disabled={isLoading}
                                                placeholder={t('certificationProgram.register.placeholderInstanceFull')}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2 pb-2">
                                            <Label htmlFor="guest-city">{t('certificationProgram.register.labelCity')}</Label>
                                            <Input
                                                id="guest-city"
                                                type="text"
                                                tabIndex={5}
                                                value={guestFormData.city}
                                                onChange={(e) => updateGuestForm('city', e.target.value)}
                                                disabled={isLoading}
                                                placeholder={t('certificationProgram.register.placeholderCity')}
                                                required
                                            />
                                        </div>
                                    </div>
                                </form>
                            </Card>
                        )}

                        {/* Alerts for Pending Invoice / Scholarship / Documents */}
                        {pendingInvoiceUrl && !isLoading && (
                            <Alert>
                                <Clock className="h-4 w-4" />
                                <AlertTitle>{t('certificationProgram.register.pendingPaymentAlert', 'Pembayaran Menunggu')}</AlertTitle>
                                <AlertDescription>
                                    {t('certificationProgram.register.pendingInvoiceAlertDesc', 'Anda memiliki invoice yang belum dibayar.')}
                                    <Button asChild size="sm" className="mt-2 w-full">
                                        <a href={pendingInvoiceUrl} target="_blank" rel="noopener noreferrer">
                                            {t('certificationProgram.register.btnContinuePayment')}
                                        </a>
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}
                        {requiresDocumentUpload && (
                            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                                <Lock className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="text-amber-900 dark:text-amber-200">{t('certificationProgram.register.docRequiredTitle')}</AlertTitle>
                                <AlertDescription className="space-y-3 text-amber-800 dark:text-amber-300">
                                    <p>{program.document_description ?? t('certificationProgram.register.docRequiredDefaultDesc')}</p>
                                    {!documentStatus && (
                                        <Button type="button" size="sm" className="w-full" variant="secondary" onClick={() => handlePrimaryAction()}>
                                            {t('certificationProgram.register.btnUploadDoc')}
                                        </Button>
                                    )}
                                    {isDocumentPending && <p>{t('certificationProgram.register.docSentWaiting')}</p>}
                                    {isDocumentRejected && (
                                            <div className="space-y-2">
                                                <p className="text-red-600 dark:text-red-300 font-semibold">
                                                    {t('certificationProgram.register.docRejectedNotice')}
                                                </p>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="w-full rounded-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                                                    variant="outline"
                                                    onClick={() => handlePrimaryAction()}
                                                >
                                                    {t('certificationProgram.register.btnReuploadDoc')}
                                                </Button>
                                            </div>
                                        )}
                                </AlertDescription>
                            </Alert>
                        )}
                        {showScholarshipWarning && (
                            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                                <Lock className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="text-amber-900 dark:text-amber-200">{t('certificationProgram.register.scholarshipRequiredTitle')}</AlertTitle>
                                <AlertDescription className="text-amber-800 dark:text-amber-300">
                                    {t('certificationProgram.register.scholarshipRequiredDesc')}
                                    <Button asChild size="sm" className="mt-2 w-full" variant="secondary">
                                        <Link href={route('certification-programs.scholarship-apply', program.slug)}>{t('certificationProgram.register.btnApplyScholarship')}</Link>
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}
                        {regularApplication && regularApplication.status !== 'approved' && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>{t('certificationProgram.register.docStatusWithStatus', { status: regularApplication.status })}</AlertTitle>
                                <AlertDescription>
                                    {regularApplication.status === 'pending' ? (
                                        t('certificationProgram.register.docVerifying')
                                    ) : (
                                        <div className="space-y-2">
                                                <span className="text-red-600 dark:text-red-300 font-semibold">{t('certificationProgram.register.docRejectedReapply')}</span>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="mt-1 w-full"
                                                    variant="secondary"
                                                    onClick={() => handlePrimaryAction()}
                                                >
                                                    {t('certificationProgram.register.btnReuploadDoc')}
                                                </Button>
                                            </div>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}
                        {scholarshipApplication && scholarshipApplication.status !== 'approved' && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>{t('certificationProgram.register.scholarshipStatusWithStatus', { status: scholarshipApplication.status })}</AlertTitle>
                                <AlertDescription>
                                    {scholarshipApplication.status === 'pending' ? (
                                        t('certificationProgram.register.scholarshipVerifying')
                                    ) : (
                                        <span className="text-red-600 dark:text-red-300">{t('certificationProgram.register.scholarshipRejected')}</span>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}

                        {guestScholarshipStatus && guestScholarshipStatus !== 'approved' && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>{t('certificationProgram.register.scholarshipStatusWithStatus', { status: guestScholarshipStatus })}</AlertTitle>
                                <AlertDescription>
                                    {guestScholarshipStatus === 'pending' ? (
                                        t('certificationProgram.register.scholarshipVerifying')
                                    ) : (
                                        <span className="text-red-600 dark:text-red-300">{t('certificationProgram.register.scholarshipRejected')}</span>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}

                        {guestScholarshipStatus === 'approved' && (
                            <Alert className="border-emerald-200 bg-emerald-50">
                                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                                <AlertTitle>{t('certificationProgram.register.scholarshipApprovedTitle')}</AlertTitle>
                                <AlertDescription>{t('certificationProgram.register.scholarshipApprovedDesc')}</AlertDescription>
                            </Alert>
                        )}
                    </motion.div>

                    {/* Right Column - Checkout Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-1">
                        <div className="sticky top-4">
                            {hasAccess ? (
                                <Card className="overflow-hidden border-2 border-green-500/20">
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:from-green-950/20 dark:to-emerald-950/20">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                                            <BadgeCheck className="h-8 w-8 text-white" />
                                        </div>

                                        <h2 className="mb-2 text-center text-xl font-bold">{t('certificationProgram.register.alreadyHaveAccess')}</h2>
                                        <p className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                            {t('certificationProgram.register.alreadyEnrolledDesc')}
                                        </p>

                                        <Button asChild size="lg" className="w-full bg-green-600 hover:bg-green-700">
                                            <Link href={route('profile.certification-program.detail', program.slug)}>
                                                {t('certificationProgram.register.openLearning')}
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>
                            ) : pendingInvoice ? (
                                <Card className="overflow-hidden border-2">
                                    <div className="border-b p-4 bg-yellow-50/50 dark:bg-yellow-950/20">
                                        <div className="flex items-center gap-2">
                                            <Hourglass className="h-5 w-5 text-yellow-600" />
                                            <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                                                {t('certificationProgram.register.pendingInvoiceTitle')}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="space-y-6 p-6">
                                        <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{t('certificationProgram.register.invoiceNo')}</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">{pendingInvoice.invoice_code}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{t('certificationProgram.register.totalPayment')}</span>
                                                <span className="text-xl font-bold text-orange-600">
                                                    {formatRupiah(pendingInvoice.amount)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2">
                                            {pendingInvoice.invoice_url && (
                                                <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold" size="lg">
                                                    <a href={pendingInvoice.invoice_url}>
                                                        {t('certificationProgram.register.btnContinuePayment')}
                                                    </a>
                                                </Button>
                                            )}

                                            <div className="flex gap-2">
                                                <Button onClick={() => window.location.reload()} variant="outline" className="flex-1" size="lg">
                                                    {t('certificationProgram.register.btnCheckStatus')}
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                                                    size="lg"
                                                    disabled={cancellingInvoice}
                                                    onClick={async () => {
                                                        if (confirm(t('certificationProgram.register.confirmCancelInvoice'))) {
                                                            setCancellingInvoice(true);
                                                            try {
                                                                await axios.post(route('invoice.cancel', pendingInvoice.id));
                                                                toast.success(t('certificationProgram.register.orderCancelledSuccess'));
                                                                window.location.reload();
                                                            } catch (err: any) {
                                                                toast.error(err.response?.data?.message || t('certificationProgram.register.orderCancelledFailed'));
                                                                setCancellingInvoice(false);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {cancellingInvoice ? t('certificationProgram.register.cancelling') : t('certificationProgram.register.btnCancelOrder')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                            <Card className="overflow-hidden border-2">
                                <div className="bg-primary border-b p-4">
                                    <h2 className="text-center text-lg font-bold text-white">
                                        {displayPrice === 0 ? t('certificationProgram.register.freeRegistrationTitle') : t('certificationProgram.register.paymentDetailTitle')}
                                    </h2>
                                </div>

                                <div className="p-6">
                                    {/* Thumbnail */}
                                    {program.thumbnail && (
                                        <div className="mb-6 overflow-hidden rounded-lg border">
                                            <img
                                                src={
                                                    program.thumbnail.startsWith('http') || program.thumbnail.startsWith('/storage')
                                                        ? program.thumbnail
                                                        : `/storage/${program.thumbnail}`
                                                }
                                                alt={program.title}
                                                className="h-40 w-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {!isScholarship && ((installmentTerms && installmentTerms.length > 0) || (activeInstallment && !activeInstallment.is_fully_paid)) && displayPrice > 0 ? (
                                        <Tabs
                                            value={paymentTab}
                                            onValueChange={(val) => {
                                                if (val === 'full' && activeInstallment && !activeInstallment.is_fully_paid) {
                                                    toast.error(t('certificationProgram.register.activeInstallmentFullDisabled', 'Anda memiliki cicilan aktif. Pembayaran penuh dinonaktifkan.'));
                                                    return;
                                                }
                                                if (val === 'installment' && isAnyTermOverdue && !activeInstallment) {
                                                toast.error(t('certificationProgram.register.termOverdue', 'Batas waktu pembayaran cicilan telah terlewat.'));
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
                                                    {t('certificationProgram.register.tabFull')}
                                                </TabsTrigger>
                                                <TabsTrigger value="installment" disabled={isAnyTermOverdue && !activeInstallment} className="text-xs sm:text-sm">
                                                    {t('certificationProgram.register.tabInstallmentWithCount', { count: activeInstallment && !activeInstallment.is_fully_paid ? (activeInstallment.total_terms || activeInstallment.terms?.length) : installmentTerms.length })}
                                                </TabsTrigger>
                                            </TabsList>

                                            {/* Tab Bayar Penuh */}
                                            <TabsContent value="full" className="space-y-4 m-0">
                                                <div className="space-y-4">
                                                    {/* Jenis Kode */}
                                                    <div className="space-y-2">
                                                        <Label className="flex items-center gap-2 text-sm font-medium">
                                                            <Tag className="h-4 w-4" />
                                                            {t('certificationProgram.register.codeTypeLabel')}
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
                                                                <RadioGroupItem value="voucher" id="cert-code-voucher" />
                                                                <Label htmlFor="cert-code-voucher" className="cursor-pointer text-sm">{t('certificationProgram.register.voucherTab')}</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="referral" id="cert-code-referral" />
                                                                <Label htmlFor="cert-code-referral" className="cursor-pointer text-sm">{t('certificationProgram.register.referralTab')}</Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>

                                                    {/* Input Kode */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="promo-code" className="text-sm font-medium">
                                                            {codeType === 'voucher' ? t('certificationProgram.register.voucherOrPromoCode') : t('certificationProgram.register.referralCode')}
                                                        </Label>
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <Input
                                                                    id="promo-code"
                                                                    type="text"
                                                                    placeholder={codeType === 'voucher' ? t('certificationProgram.register.placeholderPromoCode') : t('certificationProgram.register.placeholderReferralCode')}
                                                                    value={promoCode}
                                                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                                    className="pr-10"
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
                                                                onClick={codeType === 'voucher' ? validatePromoCode : validateReferralCode}
                                                                disabled={promoLoading || referralLoading || !promoCode.trim()}
                                                                className="flex-shrink-0"
                                                            >
                                                                <RefreshCw className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        {/* Voucher feedback */}
                                                        {codeType === 'voucher' && promoError && <p className="text-sm text-red-600">{promoError}</p>}
                                                        {codeType === 'voucher' && discountData?.valid && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="mt-3 rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-950/20 dark:to-emerald-950/20"
                                                            >
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                                                                        <Check className="h-4 w-4 text-white" />
                                                                    </div>
                                                                    <p className="font-semibold text-green-800 dark:text-green-200">{t('certificationProgram.register.promoApplied')}</p>
                                                                </div>
                                                                <p className="text-sm text-green-700 dark:text-green-300">
                                                                    <span className="font-mono font-bold">{discountData.discount_code.code}</span> -{' '}
                                                                    {discountData.discount_code.name}
                                                                </p>
                                                                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                                                    {t('certificationProgram.register.saveAmount', { amount: discountData.discount_code.formatted_value })}
                                                                </p>
                                                            </motion.div>
                                                        )}

                                                        {/* Referral feedback */}
                                                        {codeType === 'referral' && referralError && <p className="text-sm text-red-600">{referralError}</p>}
                                                        {codeType === 'referral' && referralData?.valid && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="mt-3 rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-950/20 dark:to-emerald-950/20"
                                                            >
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                                                                        <Check className="h-4 w-4 text-white" />
                                                                    </div>
                                                                    <p className="font-semibold text-green-800 dark:text-green-200">{t('certificationProgram.register.referralValid')}</p>
                                                                </div>
                                                                <p className="text-sm text-green-700 dark:text-green-300">
                                                                    {t('certificationProgram.register.referralReferredBy', { name: referralData.referrer?.name })}
                                                                </p>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Price Breakdown */}
                                                <div className="space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900/50">
                                                    {!isScholarshipNotApproved && (program.strikethrough_price ?? 0) > 0 && (
                                                        <>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400">{t('certificationProgram.register.originalPrice')}</span>
                                                                <span className="font-medium text-gray-500 line-through">
                                                                    {formatRupiah(program.strikethrough_price!)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400">{t('certificationProgram.register.discount')}</span>
                                                                <span className="font-semibold text-red-600">
                                                                    -{formatRupiah(program.strikethrough_price! - displayPrice)}
                                                                </span>
                                                            </div>
                                                            <Separator />
                                                        </>
                                                    )}

                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">{t('certificationProgram.register.programPrice')}</span>
                                                        <span className="font-semibold">{formatRupiah(displayPrice)}</span>
                                                    </div>

                                                    {discountData?.valid && (
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                                <Gift className="h-3.5 w-3.5" />
                                                                {t('certificationProgram.register.promoCodeBreakdown', { code: discountData.discount_code.code })}
                                                            </span>
                                                            <span className="font-semibold text-green-600">-{formatRupiah(discountData.discount_amount)}</span>
                                                        </div>
                                                    )}

                                                    {displayPrice > 0 && (
                                                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                                            <span>{t('certificationProgram.register.adminFee')}</span>
                                                            <span className="font-semibold text-gray-900 dark:text-gray-100">{formatRupiah(5000)}</span>
                                                        </div>
                                                    )}

                                                    <Separator />

                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold">{t('certificationProgram.register.totalPayment')}</span>
                                                        <span className="text-2xl font-bold text-orange-600">
                                                            {displayPrice === 0 ? t('certificationProgram.register.free') : formatRupiah(displayPrice - (discountData?.discount_amount || 0) + 5000)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {deadline && (
                                                    <div className="flex items-start gap-2 text-sm">
                                                        <Calendar size="16" className="text-primary mt-0.5" />
                                                        <div>
                                                            <p className="font-medium">{t('certificationProgram.register.deadline')}</p>
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                {format(deadline, i18n.language === 'en' ? "dd MMMM yyyy 'at' HH:mm" : "dd MMMM yyyy 'pukul' HH:mm", { locale: dateLocale })} WIB
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-start gap-3 rounded-lg border border-dashed p-3 text-sm">
                                                    <Checkbox
                                                        id="terms"
                                                        checked={termsAccepted}
                                                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                                        className="mt-0.5"
                                                    />
                                                    <Label htmlFor="terms" className="leading-5">
                                                        {t('certificationProgram.register.agreeTerms')}
                                                    </Label>
                                                </div>

                                                <div className="space-y-2">
                                                    <Button
                                                        onClick={handlePrimaryAction}
                                                        disabled={
                                                            isLoading ||
                                                            showScholarshipWarning ||
                                                            (!isLoggedIn && !isGuestFormComplete()) ||
                                                            (requiresDocumentUpload && isDocumentPending) ||
                                                            (!!regularApplication &&
                                                                regularApplication.status === 'pending' &&
                                                                !isScholarship &&
                                                                requiresDocumentUpload) ||
                                                            scholarshipNotApproved ||
                                                            (displayPrice > 0 && !termsAccepted)
                                                        }
                                                        className="w-full"
                                                        size="lg"
                                                    >
                                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        {isLoading
                                                            ? t('certificationProgram.register.processing')
                                                            : requiresDocumentUpload && !hasApprovedDocument && !isDocumentPending
                                                              ? isDocumentRejected
                                                                  ? t('certificationProgram.register.btnReuploadDoc')
                                                                  : t('certificationProgram.register.btnUploadDoc')
                                                              : t('certificationProgram.register.btnPayNow')}
                                                    </Button>
                                                    <Button asChild variant="outline" className="w-full" size="lg">
                                                        <Link href={route('certification-programs.detail', program.slug)}>{t('certificationProgram.register.btnBackToDetail')}</Link>
                                                    </Button>
                                                </div>
                                            </TabsContent>

                                            {/* Tab Cicilan */}
                                            <TabsContent value="installment" className="space-y-4 m-0">
                                                <InstallmentOptions
                                                    productType="certification_program"
                                                    productId={program.id}
                                                    productPrice={program.price}
                                                    terms={installmentTerms}
                                                    activeInstallment={activeInstallment}
                                                    termsAccepted={termsAccepted}
                                                    onTermsAcceptedChange={setTermsAccepted}
                                                    onBeforePay={async () => {
                                                        if (!activeInstallment && !termsAccepted) {
                                                            toast.error(t('installmentOptions.errors.agreeTermsRequired'));
                                                            return false;
                                                        }
                                                        if (!isLoggedIn && !isGuestFormComplete()) {
                                                            toast.error(t('certificationProgram.register.completeDataFirst'));
                                                            return false;
                                                        }
                                                        const authenticated = await ensureAuthenticated();
                                                        return authenticated;
                                                    }}
                                                />
                                            </TabsContent>
                                        </Tabs>
                                    ) : (
                                        <>
                                            {displayPrice > 0 && (
                                                <div className="mb-6 space-y-4">
                                                    {/* Jenis Kode */}
                                                    <div className="space-y-2">
                                                        <Label className="flex items-center gap-2 text-sm font-medium">
                                                            <Tag className="h-4 w-4" />
                                                            {t('certificationProgram.register.codeTypeLabel')}
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
                                                                <RadioGroupItem value="voucher" id="cert-code-voucher" />
                                                                <Label htmlFor="cert-code-voucher" className="cursor-pointer text-sm">{t('certificationProgram.register.voucherTab')}</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="referral" id="cert-code-referral" />
                                                                <Label htmlFor="cert-code-referral" className="cursor-pointer text-sm">{t('certificationProgram.register.referralTab')}</Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>

                                                    {/* Input Kode */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="promo-code" className="text-sm font-medium">
                                                            {codeType === 'voucher' ? t('certificationProgram.register.voucherOrPromoCode') : t('certificationProgram.register.referralCode')}
                                                        </Label>
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <Input
                                                                    id="promo-code"
                                                                    type="text"
                                                                    placeholder={codeType === 'voucher' ? t('certificationProgram.register.placeholderPromoCode') : t('certificationProgram.register.placeholderReferralCode')}
                                                                    value={promoCode}
                                                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                                    className="pr-10"
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
                                                                onClick={codeType === 'voucher' ? validatePromoCode : validateReferralCode}
                                                                disabled={promoLoading || referralLoading || !promoCode.trim()}
                                                                className="flex-shrink-0"
                                                            >
                                                                <RefreshCw className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        {/* Voucher feedback */}
                                                        {codeType === 'voucher' && promoError && <p className="text-sm text-red-600">{promoError}</p>}
                                                        {codeType === 'voucher' && discountData?.valid && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="mt-3 rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-950/20 dark:to-emerald-950/20"
                                                            >
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                                                                        <Check className="h-4 w-4 text-white" />
                                                                    </div>
                                                                    <p className="font-semibold text-green-800 dark:text-green-200">{t('certificationProgram.register.promoApplied')}</p>
                                                                </div>
                                                                <p className="text-sm text-green-700 dark:text-green-300">
                                                                    <span className="font-mono font-bold">{discountData.discount_code.code}</span> -{' '}
                                                                    {discountData.discount_code.name}
                                                                </p>
                                                                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                                                    {t('certificationProgram.register.saveAmount', { amount: discountData.discount_code.formatted_value })}
                                                                </p>
                                                            </motion.div>
                                                        )}

                                                        {/* Referral feedback */}
                                                        {codeType === 'referral' && referralError && <p className="text-sm text-red-600">{referralError}</p>}
                                                        {codeType === 'referral' && referralData?.valid && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="mt-3 rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-950/20 dark:to-emerald-950/20"
                                                            >
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                                                                        <Check className="h-4 w-4 text-white" />
                                                                    </div>
                                                                    <p className="font-semibold text-green-800 dark:text-green-200">{t('certificationProgram.register.referralValid')}</p>
                                                                </div>
                                                                <p className="text-sm text-green-700 dark:text-green-300">
                                                                    {t('certificationProgram.register.referralReferredBy', { name: referralData.referrer?.name })}
                                                                </p>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Price Breakdown */}
                                            <div className="mb-6 space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900/50">
                                                {!isScholarshipNotApproved && (program.strikethrough_price ?? 0) > 0 && (
                                                    <>
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">{t('certificationProgram.register.originalPrice')}</span>
                                                            <span className="font-medium text-gray-500 line-through">
                                                                {formatRupiah(program.strikethrough_price!)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">{t('certificationProgram.register.discount')}</span>
                                                            <span className="font-semibold text-red-600">
                                                                -{formatRupiah(program.strikethrough_price! - displayPrice)}
                                                            </span>
                                                        </div>
                                                        <Separator />
                                                    </>
                                                )}

                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">{t('certificationProgram.register.programPrice')}</span>
                                                    <span className="font-semibold">{formatRupiah(displayPrice)}</span>
                                                </div>

                                                {discountData?.valid && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                            <Gift className="h-3.5 w-3.5" />
                                                            {t('certificationProgram.register.promoCodeBreakdown', { code: discountData.discount_code.code })}
                                                        </span>
                                                        <span className="font-semibold text-green-600">-{formatRupiah(discountData.discount_amount)}</span>
                                                    </div>
                                                )}

                                                {displayPrice > 0 && (
                                                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                                        <span>{t('certificationProgram.register.adminFee')}</span>
                                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{formatRupiah(5000)}</span>
                                                    </div>
                                                )}

                                                <Separator />

                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold">{t('certificationProgram.register.totalPayment')}</span>
                                                    <span className="text-2xl font-bold text-orange-600">
                                                        {displayPrice === 0 ? t('certificationProgram.register.free') : formatRupiah(displayPrice - (discountData?.discount_amount || 0) + 5000)}
                                                    </span>
                                                </div>
                                            </div>

                                            {deadline && (
                                                <div className="mt-4 mb-4 flex items-start gap-2 text-sm">
                                                    <Calendar size="16" className="text-primary mt-0.5" />
                                                    <div>
                                                        <p className="font-medium">{t('certificationProgram.register.deadline')}</p>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            {format(deadline, i18n.language === 'en' ? "dd MMMM yyyy 'at' HH:mm" : "dd MMMM yyyy 'pukul' HH:mm", { locale: dateLocale })} WIB
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {displayPrice > 0 && (
                                                <div className="mt-4 mb-6 flex items-start gap-3 rounded-lg border border-dashed p-3 text-sm">
                                                    <Checkbox
                                                        id="terms"
                                                        checked={termsAccepted}
                                                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                                        className="mt-0.5"
                                                    />
                                                    <Label htmlFor="terms" className="leading-5">
                                                        {t('certificationProgram.register.agreeTerms')}
                                                    </Label>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Button
                                                    onClick={handlePrimaryAction}
                                                    disabled={
                                                        isLoading ||
                                                        showScholarshipWarning ||
                                                        (!isLoggedIn && !isGuestFormComplete()) ||
                                                        (requiresDocumentUpload && isDocumentPending) ||
                                                        (!!regularApplication &&
                                                            regularApplication.status === 'pending' &&
                                                            !isScholarship &&
                                                            requiresDocumentUpload) ||
                                                        scholarshipNotApproved ||
                                                        (displayPrice > 0 && !termsAccepted)
                                                    }
                                                    className="w-full"
                                                    size="lg"
                                                >
                                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    {isLoading
                                                        ? t('certificationProgram.register.processing')
                                                        : requiresDocumentUpload && !hasApprovedDocument && !isDocumentPending
                                                              ? isDocumentRejected
                                                                  ? t('certificationProgram.register.btnReuploadDoc')
                                                                  : t('certificationProgram.register.btnUploadDoc')
                                                          : t('certificationProgram.register.btnPayNow')}
                                                </Button>
                                                <Button asChild variant="outline" className="w-full" size="lg">
                                                    <Link href={route('certification-programs.detail', program.slug)}>{t('certificationProgram.register.btnBackToDetail')}</Link>
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                </motion.div>
                </div>
            </section>

            <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t('certificationProgram.register.docDialogTitle')}</DialogTitle>
                        <DialogDescription>
                            {program.document_description ?? t('certificationProgram.register.docRequiredDefaultDesc')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
                            <p className="font-semibold">{t('certificationProgram.register.docDialogAccepted')}</p>
                            <p className="mt-1">{t('certificationProgram.register.docDialogAcceptedFormats')}</p>
                        </div>
                        <Input type="file" accept=".pdf,image/*" onChange={(event) => setDocumentAttachment(event.target.files?.[0] ?? null)} />
                        {documentAttachment && <p className="text-muted-foreground text-sm">{t('certificationProgram.register.docDialogSelected', { fileName: documentAttachment.name })}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDocumentDialogOpen(false)}>
                            {t('certificationProgram.register.docDialogCancel')}
                        </Button>
                        <Button type="button" onClick={handleDocumentSubmit} disabled={isLoading || !documentAttachment}>
                            {t('certificationProgram.register.docDialogSubmit')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </UserLayout>
    );
}
