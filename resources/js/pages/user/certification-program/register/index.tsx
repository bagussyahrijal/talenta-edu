import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import UserLayout from '@/layouts/user-layout';
import { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, BadgeCheck, Calendar, CheckCircle2, Clock, GraduationCap, Loader2, Lock, User, ShoppingCart, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
}

interface PendingCheckoutData {
    programSlug: string;
    timestamp: number;
    promoCode: string;
    termsAccepted: boolean;
    discountData: DiscountData | null;
    needsDocumentUpload?: boolean;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

interface RegisterProps {
    program: Program;
    hasAccess: boolean;
    pendingInvoiceUrl?: string | null;
    regularApplication?: Application | null;
    scholarshipApplication?: Application | null;
    isScholarship: boolean;
}

export default function Register({
    program,
    hasAccess,
    pendingInvoiceUrl,
    regularApplication,
    scholarshipApplication,
    isScholarship,
}: RegisterProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as
        | {
              name?: string;
              email?: string;
              phone_number?: string;
              instance?: string;
          }
        | null
        | undefined;
    const isLoggedIn = !!user;
    const isProfileComplete = !!(isLoggedIn && user?.phone_number && user?.instance);

    const [isLoading, setIsLoading] = useState(false);
    const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
    const [documentAttachment, setDocumentAttachment] = useState<File | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [discountData, setDiscountData] = useState<DiscountData | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [guestScholarshipStatus, setGuestScholarshipStatus] = useState<string | null>(null);
    const [guestFormData, setGuestFormData] = useState<GuestFormData>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone_number: user?.phone_number ?? '',
        instance: user?.instance ?? '',
    });

    const formatRupiah = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const displayPrice = isScholarship && program.scholarship_price ? program.scholarship_price : program.price;
    const promoDiscountAmount = discountData?.valid ? discountData.discount_amount : 0;
    const activeFinalPrice = displayPrice - promoDiscountAmount;
    const adminFee = activeFinalPrice <= 0 ? 0 : 5000;
    const totalPrice = activeFinalPrice + adminFee;
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

        const hasEmail = !!guestFormData.email;
        const hasPhone = !!guestFormData.phone_number;
        const hasNameOrEmailExists = !!guestFormData.name || emailExists;
        const hasInstanceOrEmailExists = !!guestFormData.instance || emailExists || guestScholarshipStatus === 'approved';

        return hasEmail && hasPhone && hasNameOrEmailExists && hasInstanceOrEmailExists;
    }, [isLoggedIn, guestFormData, emailExists, guestScholarshipStatus]);

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
                setPromoError(data.message || 'Kode promo tidak valid');
            }
        } catch (error: unknown) {
            setDiscountData(null);
            if (axios.isAxiosError(error)) {
                setPromoError(error.response?.data?.message || 'Terjadi kesalahan saat memvalidasi kode promo');
            } else {
                setPromoError('Terjadi kesalahan saat memvalidasi kode promo');
            }
        } finally {
            setPromoLoading(false);
        }
    }, [displayPrice, emailExists, guestFormData.email, isLoggedIn, program.id, promoCode]);

    useEffect(() => {
        if (!promoCode.trim() || displayPrice === 0) {
            setDiscountData(null);
            setPromoError('');
            return;
        }

        const timer = setTimeout(() => {
            validatePromoCode();
        }, 500);

        return () => clearTimeout(timer);
    }, [displayPrice, promoCode, validatePromoCode]);

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
                    }));
                } else {
                    setEmailExists(false);
                }

                // Always check and store scholarship application status, regardless of user existence
                if (data.scholarship_application_status) {
                    setGuestScholarshipStatus(data.scholarship_application_status);
                } else {
                    setGuestScholarshipStatus(null);
                }
            } catch {
                setEmailExists(false);
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

        if (!guestFormData.email || !guestFormData.phone_number) {
            toast.error('Email dan nomor telepon wajib diisi.');
            return false;
        }

        if (!emailExists && !guestFormData.instance) {
            toast.error('Instansi wajib diisi.');
            return false;
        }

        setIsLoading(true);

        try {
            if (emailExists) {
                const loginResponse = await axios.post(route('auto-login'), {
                    email: guestFormData.email,
                    phone_number: guestFormData.phone_number,
                });

                const loginData = loginResponse.data;
                if (!loginData.success) {
                    throw new Error(loginData.message || 'Gagal login otomatis.');
                }

                toast.success('Login berhasil. Melanjutkan pendaftaran...');
            } else {
                if (!guestFormData.name) {
                    toast.error('Nama wajib diisi.');
                    setIsLoading(false);
                    return false;
                }

                await axios.post(route('register'), {
                    name: guestFormData.name,
                    email: guestFormData.email,
                    phone_number: guestFormData.phone_number,
                    instance: guestFormData.instance,
                    password: guestFormData.phone_number,
                    password_confirmation: guestFormData.phone_number,
                });

                toast.success('Registrasi berhasil. Melanjutkan pendaftaran...');
            }

            savePendingCheckout();
            window.location.reload();
            return false;
        } catch (error: unknown) {
            setIsLoading(false);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Gagal memproses login/registrasi otomatis.');
            } else {
                toast.error(getErrorMessage(error, 'Gagal memproses login/registrasi otomatis.'));
            }
            return false;
        }
    }, [emailExists, guestFormData.email, guestFormData.instance, guestFormData.name, guestFormData.phone_number, isLoggedIn, savePendingCheckout]);

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
            toast.error('Pilih dokumen pendukung terlebih dahulu');
            return;
        }

        const formData = new FormData();
        formData.append('document_attachment', documentAttachment);

        router.post(route('certification-programs.apply-regular', program.slug), formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsDocumentDialogOpen(false);
                setDocumentAttachment(null);
                toast.success('Dokumen berhasil dikirim. Menunggu verifikasi admin.');
            },
            onError: () => {
                toast.error('Gagal mengirim dokumen pendukung');
            },
        });
    };

    const submitPayment = useCallback(
        async (retryCount = 0): Promise<void> => {
            const originalDiscountAmount =
                program.strikethrough_price && program.strikethrough_price > 0 ? program.strikethrough_price - program.price : 0;
            const invoiceData: Record<string, string | number> = {
                type: 'certification_program',
                id: program.id,
                discount_amount: originalDiscountAmount + promoDiscountAmount,
                nett_amount: activeFinalPrice,
                transaction_fee: adminFee,
                total_amount: totalPrice,
                isScholarship: isScholarship ? 1 : 0,
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

                if (res.status === 419 && retryCount < 2) {
                    await refreshCSRFToken();
                    return submitPayment(retryCount + 1);
                }

                const data = await res.json();

                if (res.ok && data.success) {
                    if (data.payment_url) {
                        sessionStorage.removeItem('pendingCertificationCheckout');
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
        },
        [displayPrice, discountData, program.id, program.price, program.strikethrough_price, isScholarship, refreshCSRFToken],
    );

    const handleCheckout = useCallback(async () => {
        if (!termsAccepted && displayPrice > 0) {
            toast.error('Anda harus menyetujui syarat dan ketentuan.');
            return;
        }

        // Check if guest form is complete before proceeding
        if (!isLoggedIn && !isGuestFormComplete()) {
            toast.error('Lengkapi semua data diri terlebih dahulu.');
            return;
        }

        const authenticated = await ensureAuthenticated();
        if (!authenticated) {
            return;
        }

        if (!isProfileComplete) {
            window.location.href = route('profile.edit');
            return;
        }

        if (requiresDocumentUpload && !hasApprovedDocument) {
            if (isDocumentPending || isDocumentRejected) {
                return;
            }

            setIsDocumentDialogOpen(true);
            return;
        }

        setIsLoading(true);

        try {
            await submitPayment();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Terjadi kesalahan saat proses pembayaran.'));
            setIsLoading(false);
        }
    }, [
        displayPrice,
        ensureAuthenticated,
        hasApprovedDocument,
        isDocumentPending,
        isDocumentRejected,
        isProfileComplete,
        requiresDocumentUpload,
        submitPayment,
        termsAccepted,
        isLoggedIn,
        isGuestFormComplete,
    ]);

    const ensureAuthenticatedForDocument = useCallback(async () => {
        if (!guestFormData.email || !guestFormData.phone_number) {
            toast.error('Email dan nomor telepon wajib diisi.');
            return;
        }

        if (!emailExists && !guestFormData.instance) {
            toast.error('Instansi wajib diisi.');
            return;
        }

        setIsLoading(true);

        try {
            if (emailExists) {
                const loginResponse = await axios.post(route('auto-login'), {
                    email: guestFormData.email,
                    phone_number: guestFormData.phone_number,
                });

                const loginData = loginResponse.data;
                if (!loginData.success) {
                    throw new Error(loginData.message || 'Gagal login otomatis.');
                }

                toast.success('Login berhasil. Membuka form upload dokumen...');
            } else {
                if (!guestFormData.name) {
                    toast.error('Nama wajib diisi.');
                    setIsLoading(false);
                    return;
                }

                await axios.post(route('register'), {
                    name: guestFormData.name,
                    email: guestFormData.email,
                    phone_number: guestFormData.phone_number,
                    instance: guestFormData.instance,
                    password: guestFormData.phone_number,
                    password_confirmation: guestFormData.phone_number,
                });

                toast.success('Registrasi berhasil. Membuka form upload dokumen...');
            }

            savePendingCheckout(true);
            window.location.reload();
        } catch (error: unknown) {
            setIsLoading(false);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Gagal memproses login/registrasi otomatis.');
            } else {
                toast.error(getErrorMessage(error, 'Gagal memproses login/registrasi otomatis.'));
            }
        }
    }, [emailExists, guestFormData.email, guestFormData.instance, guestFormData.name, guestFormData.phone_number, savePendingCheckout]);

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

    if (hasAccess) {
        return (
            <UserLayout>
                <Head title={`Terdaftar - ${program.title}`} />
                <div className="min-h-screen bg-[url('/assets/images/bg-product.png')] bg-cover bg-center bg-no-repeat">
                    <section className="flex min-h-screen items-center justify-center px-4 py-12">
                        <div className="w-full max-w-md">
                            <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border bg-white/95 p-8 shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
                                <div className="rounded-full bg-green-100 p-6 dark:bg-green-900/30">
                                    <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="text-center">
                                    <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Anda Sudah Terdaftar!</h1>
                                    <p className="text-gray-600 dark:text-gray-400">Akses materi pembelajaran tersedia di dashboard.</p>
                                </div>
                                <div className="flex w-full gap-3">
                                    <Button asChild className="flex-1" size="lg">
                                        <Link href={route('user.dashboard')}>Ke Dashboard</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="flex-1" size="lg">
                                        <Link href={route('certification-programs.index')}>Lihat Program Lain</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </UserLayout>
        );
    }

    if (isLoggedIn && !isProfileComplete) {
        return (
            <UserLayout>
                <Head title={`Daftar - ${program.title}`} />
                <div className="min-h-screen bg-[url('/assets/images/bg-product.png')] bg-cover bg-center bg-no-repeat">
                    <section className="flex min-h-screen items-center justify-center px-4 py-12">
                        <div className="w-full max-w-md">
                            <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border bg-white/95 p-8 shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
                                <div className="rounded-full bg-orange-100 p-6 dark:bg-orange-900/30">
                                    <User className="h-16 w-16 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="text-center">
                                    <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Profil Belum Lengkap</h1>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Silakan lengkapi nomor telepon dan instansi terlebih dahulu sebelum melanjutkan pendaftaran.
                                    </p>
                                </div>
                                <Button asChild className="w-full" size="lg">
                                    <Link href={route('profile.edit', { redirect: window.location.href })}>Lengkapi Profil</Link>
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>
            </UserLayout>
        );
    }

    const handlePrimaryAction = () => {
        if (requiresDocumentUpload && !hasApprovedDocument) {
            if (isDocumentPending || isDocumentRejected) {
                return;
            }

            // If guest, need to authenticate first
            if (!isLoggedIn) {
                if (!isGuestFormComplete()) {
                    toast.error('Lengkapi semua data diri terlebih dahulu.');
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

    return (
        <UserLayout>
            <Head title={`Daftar - ${program.title}`} />
            <div className="min-h-screen bg-[url('/assets/images/bg-product.png')] bg-cover bg-center bg-no-repeat">
                <section className="mx-auto w-full max-w-7xl px-4 py-12">
                    <div className="mb-8 px-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <Link href="/certification-programs" className="hover:text-blue-600">
                                Certification Program
                            </Link>
                            <span>/</span>
                            <Link href={`/certification-programs/${program.slug}`} className="hover:text-blue-600">
                                {program.title}
                            </Link>
                            <span>/</span>
                            <span className="text-gray-900 dark:text-white">Daftar</span>
                        </div>
                        <h1 className="mt-8 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">Daftar Certification Program</h1>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left - Program Info, Alerts & Guest Form */}
                        <div className={!pendingInvoiceUrl ? 'lg:col-span-2' : 'lg:col-span-3'}>
                            <div className="overflow-hidden rounded-2xl border bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-800/95 mb-6">
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
                                                src={program.thumbnail ? `/storage/${program.thumbnail}` : '/assets/images/placeholder.png'}
                                                alt={program.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                Certification Program
                                            </span>
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{program.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span>
                                                    {isScholarship ? 'Jalur Beasiswa' : 'Jalur Reguler'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {!isLoggedIn && (
                                    <form className="flex flex-col gap-6 p-6 pt-0 border-t">
                                        <h1 className="text-xl font-bold">Masukkan Data Diri Anda</h1>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4">
                                            Sistem akan melanjutkan ke login atau registrasi otomatis.
                                        </p>
    
                                        <div className="grid gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="guest-email">Email</Label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Input
                                                            id="guest-email"
                                                            type="email"
                                                            placeholder="email@example.com"
                                                            value={guestFormData.email}
                                                            onChange={(event) => updateGuestForm('email', event.target.value)}
                                                            required
                                                            className="pr-10"
                                                        />
                                                        {checkingEmail && (
                                                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                                            </div>
                                                        )}
                                                        {!checkingEmail && emailExists && (
                                                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {emailExists && <p className="text-xs text-green-600">Email ditemukan, data terisi otomatis</p>}
                                            </div>
    
                                            <div className="grid gap-2">
                                                <Label htmlFor="guest-name">Nama</Label>
                                                <Input
                                                    id="guest-name"
                                                    type="text"
                                                    placeholder="Nama lengkap"
                                                    value={guestFormData.name}
                                                    onChange={(event) => updateGuestForm('name', event.target.value)}
                                                    disabled={emailExists}
                                                    required
                                                />
                                            </div>
    
                                            <div className="grid gap-2">
                                                <Label htmlFor="guest-phone">No. Telepon</Label>
                                                <Input
                                                    id="guest-phone"
                                                    type="tel"
                                                    placeholder="08xxxxxxxxxx"
                                                    value={guestFormData.phone_number}
                                                    onChange={(event) => updateGuestForm('phone_number', event.target.value)}
                                                    disabled={emailExists}
                                                    required
                                                />
                                            </div>
    
                                            <div className="grid gap-2 pb-2">
                                                <Label htmlFor="guest-instance">Instansi / Perusahaan</Label>
                                                <Input
                                                    id="guest-instance"
                                                    type="text"
                                                    placeholder="Instansi atau perusahaan Anda"
                                                    value={guestFormData.instance}
                                                    onChange={(event) => updateGuestForm('instance', event.target.value)}
                                                    disabled={emailExists}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {pendingInvoiceUrl && !isLoading && (
                                <Alert>
                                    <Clock className="h-4 w-4" />
                                    <AlertTitle>Pembayaran Menunggu</AlertTitle>
                                    <AlertDescription>
                                        Anda memiliki invoice yang belum dibayar.
                                        <Button asChild size="sm" className="mt-2 w-full">
                                            <a href={pendingInvoiceUrl} target="_blank" rel="noopener noreferrer">
                                                Lanjutkan Pembayaran
                                            </a>
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            )}
                            {requiresDocumentUpload && (
                                <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 mb-6">
                                    <Lock className="h-4 w-4 text-amber-600" />
                                    <AlertTitle className="text-amber-900 dark:text-amber-200">Dokumen Pendukung Diperlukan</AlertTitle>
                                    <AlertDescription className="space-y-3 text-amber-800 dark:text-amber-300">
                                        <p>
                                            {program.document_description ?? 'Program ini memerlukan dokumen pendukung sebelum pendaftaran diproses.'}
                                        </p>
                                        {!documentStatus && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="w-full"
                                                variant="secondary"
                                                onClick={() => handlePrimaryAction()}
                                            >
                                                Upload Dokumen Pendukung
                                            </Button>
                                        )}
                                        {isDocumentPending && <p>Dokumen sudah dikirim dan sedang menunggu verifikasi admin.</p>}
                                        {isDocumentRejected && (
                                            <p className="text-red-600 dark:text-red-300">
                                                Dokumen Anda ditolak. Silakan hubungi admin untuk tindak lanjut.
                                            </p>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}
                            {showScholarshipWarning && (
                                <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 mb-6">
                                    <Lock className="h-4 w-4 text-amber-600" />
                                    <AlertTitle className="text-amber-900 dark:text-amber-200">Aplikasi Beasiswa Diperlukan</AlertTitle>
                                    <AlertDescription className="text-amber-800 dark:text-amber-300">
                                        Silakan ajukan aplikasi beasiswa dan tunggu persetujuan admin.
                                        <Button asChild size="sm" className="mt-2 w-full" variant="secondary">
                                            <Link href={route('certification-programs.scholarship-apply', program.slug)}>Ajukan Beasiswa</Link>
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            )}
                            
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-gray-800">
                                <h3 className="mb-3 font-semibold text-lg">Detail Program</h3>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    {program.mentors.length > 0 && (
                                        <li className="flex items-center gap-2">
                                            <BadgeCheck size="16" className="text-green-600" />
                                            <span>Mentor: {program.mentors.map((m) => m.name).join(', ')}</span>
                                        </li>
                                    )}
                                    {program.schedules.length > 0 && (
                                        <li className="flex items-center gap-2">
                                            <BadgeCheck size="16" className="text-green-600" />
                                            <span>Mulai: {format(new Date(getDate(program.schedules[0])), 'dd MMMM yyyy', { locale: id })}</span>
                                        </li>
                                    )}
                                    <li className="flex items-center gap-2">
                                        <BadgeCheck size="16" className="text-green-600" />
                                        <span>Total {program.schedules.length} sesi pertemuan</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Right - Checkout Form */}
                        <div className={!pendingInvoiceUrl ? 'lg:col-span-1' : 'lg:col-span-3'}>
                            <div className="overflow-hidden rounded-2xl border bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
                                <div className="border-b bg-gray-50/80 p-4 dark:bg-gray-900/80">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ringkasan Pembayaran</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="mb-4 space-y-2">
                                        <Label htmlFor="promo-code">Kode Promo (Opsional)</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    id="promo-code"
                                                    type="text"
                                                    placeholder="Masukkan kode promo"
                                                    value={promoCode}
                                                    onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                                                    className="pr-10"
                                                />
                                                {promoLoading && (
                                                    <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                                                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                                    </div>
                                                )}
                                                {!promoLoading && promoCode && (
                                                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                        {discountData?.valid ? (
                                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                        ) : promoError ? (
                                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={async () => {
                                                    if (!promoCode.trim()) {
                                                        toast.error('Masukkan kode promo terlebih dahulu');
                                                        return;
                                                    }
                                                    await validatePromoCode();
                                                }}
                                                disabled={promoLoading || !promoCode.trim()}
                                                className="flex-shrink-0"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {promoError && <p className="text-sm text-red-600">{promoError}</p>}
                                        {discountData?.valid && (
                                            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
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
                                        {program.strikethrough_price && program.strikethrough_price > 0 && (
                                            <>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Harga Asli</span>
                                                    <span className="font-medium text-gray-500 line-through dark:text-gray-400">
                                                        {formatRupiah(program.strikethrough_price)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Diskon</span>
                                                    <span className="font-semibold text-red-600">
                                                        -{formatRupiah(program.strikethrough_price - displayPrice)}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Harga Program</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatRupiah(displayPrice)}
                                            </span>
                                        </div>

                                        {discountData?.valid && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Diskon Promo ({discountData.discount_code.code})
                                                </span>
                                                <span className="font-semibold text-green-600">
                                                    -{formatRupiah(discountData.discount_amount)}
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Biaya Transaksi</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {formatRupiah(adminFee)}
                                            </span>
                                        </div>
                                        
                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-900 dark:text-white">Total Pembayaran</span>
                                            <span className="text-2xl font-bold text-orange-600">
                                                {formatRupiah(totalPrice)}
                                            </span>
                                        </div>
                                    </div>

                                    {deadline && (
                                        <div className="mt-4 flex items-start gap-2 text-sm">
                                            <Calendar size="16" className="text-primary mt-0.5" />
                                            <div>
                                                <p className="font-medium">Batas Pendaftaran:</p>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    {format(deadline, "dd MMMM yyyy 'pukul' HH:mm", { locale: id })} WIB
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {displayPrice > 0 && (
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

                                    <Button
                                        onClick={handlePrimaryAction}
                                        disabled={
                                            isLoading ||
                                            showScholarshipWarning ||
                                            (!isLoggedIn && !isGuestFormComplete()) ||
                                            (requiresDocumentUpload && (isDocumentPending || isDocumentRejected)) ||
                                            (!!regularApplication &&
                                                regularApplication.status !== 'approved' &&
                                                !isScholarship &&
                                                requiresDocumentUpload) ||
                                            scholarshipNotApproved ||
                                            (displayPrice > 0 && !termsAccepted)
                                        }
                                        className="w-full mt-4"
                                        size="lg"
                                    >
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isLoading
                                            ? 'Memproses...'
                                            : requiresDocumentUpload && !hasApprovedDocument && !isDocumentPending && !isDocumentRejected
                                            ? 'Upload Dokumen Pendukung'
                                            : 'Bayar Sekarang'}
                                    </Button>
                                    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">Pembayaran aman dan terenkripsi 🔒</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Upload Dokumen Pendukung</DialogTitle>
                            <DialogDescription>
                                {program.document_description ?? 'Unggah dokumen yang diminta agar admin dapat memverifikasi pendaftaran Anda.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
                                <p className="font-semibold">Format dokumen yang diterima</p>
                                <p className="mt-1">PDF, JPG, JPEG, PNG, atau WebP. Maksimal 5 MB.</p>
                            </div>
                            <Input type="file" accept=".pdf,image/*" onChange={(event) => setDocumentAttachment(event.target.files?.[0] ?? null)} />
                            {documentAttachment && <p className="text-muted-foreground text-sm">File terpilih: {documentAttachment.name}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDocumentDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="button" onClick={handleDocumentSubmit} disabled={isLoading || !documentAttachment}>
                                Upload Dokumen
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </UserLayout>
    );
}
