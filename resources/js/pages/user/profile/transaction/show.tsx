import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle,
    Clock,
    CreditCard,
    ExternalLink,
    FileText,
    Home,
    Lock,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface CourseItem {
    id: string;
    course: {
        id: string;
        title: string;
        slug: string;
        thumbnail: string;
    };
}

interface BootcampItem {
    id: string;
    bootcamp: {
        id: string;
        title: string;
        slug: string;
        thumbnail: string;
    };
}

interface WebinarItem {
    id: string;
    webinar: {
        id: string;
        title: string;
        slug: string;
        thumbnail: string;
    };
}

interface CertificationProgramItem {
    id: string;
    is_scholarship?: boolean;
    certificationProgram: {
        id: string;
        title: string;
        slug: string;
        thumbnail: string;
    };
}

interface BundleItem {
    id: string;
    bundle?: {
        id: string;
        title: string;
        slug: string;
        thumbnail?: string;
    };
}

interface InstallmentTerm {
    id: string;
    invoice_id?: string;
    child_invoice_id?: string | null;
    term_number?: number;
    installment_number?: number;
    amount: number;
    due_date?: string;
    installment_due_date?: string | null;
    status: 'pending' | 'paid' | 'overdue' | string;
    paid_at?: string | null;
    payment_method?: string | null;
    payment_channel?: string | null;
    is_overdue?: boolean;
    invoice?: {
        id: string;
        invoice_code: string;
        invoice_url: string | null;
        status: string;
    };
}

interface Invoice {
    id: string;
    invoice_code: string;
    invoice_url: string;
    amount: number;
    nett_amount: number;
    discount_amount: number;
    status: 'paid' | 'pending' | 'failed' | 'installment_pending' | 'completed' | string;
    paid_at: string | null;
    expires_at: string | null;
    payment_method: string | null;
    payment_channel: string | null;
    is_installment?: boolean;
    access_suspended_at?: string | null;
    parent_invoice_id?: string | null;
    parent_invoice?: Invoice | null;
    parentInvoice?: Invoice | null;
    installment_terms?: InstallmentTerm[];
    installmentTerms?: InstallmentTerm[];
    course_items?: CourseItem[];
    courseItems?: CourseItem[];
    bootcamp_items?: BootcampItem[];
    bootcampItems?: BootcampItem[];
    webinar_items?: WebinarItem[];
    webinarItems?: WebinarItem[];
    certificationProgramItems?: CertificationProgramItem[];
    certification_program_items?: CertificationProgramItem[];
    bundle_enrollments?: BundleItem[];
    bundleEnrollments?: BundleItem[];
}

interface Props {
    invoice: Invoice;
}

export default function TransactionShow({ invoice }: Props) {
    const { t, i18n } = useTranslation('profile');
    const localeCode = i18n.language === 'en' ? 'en-US' : 'id-ID';
    const [cancelLoading, setCancelLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const isExpired = invoice.expires_at && new Date() > new Date(invoice.expires_at);
    const timeLeft = invoice.expires_at ? new Date(invoice.expires_at).getTime() - new Date().getTime() : 0;
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    // Installment detection & helpers
    const terms: InstallmentTerm[] =
        invoice.installment_terms ||
        invoice.installmentTerms ||
        invoice.parent_invoice?.installment_terms ||
        invoice.parent_invoice?.installmentTerms ||
        invoice.parentInvoice?.installment_terms ||
        invoice.parentInvoice?.installmentTerms ||
        [];

    const isInstallment = Boolean(
        invoice.is_installment ||
        invoice.status === 'installment_pending' ||
        terms.length > 0 ||
        invoice.parent_invoice?.is_installment ||
        invoice.parentInvoice?.is_installment
    );

    const paidTerms = terms.filter((t) => t.status === 'paid');
    const isFullyPaid = (terms.length > 0 && paidTerms.length === terms.length) || invoice.status === 'paid' || invoice.status === 'completed';
    const isSuspended = Boolean(
        invoice.access_suspended_at ||
        invoice.parent_invoice?.access_suspended_at ||
        invoice.parentInvoice?.access_suspended_at
    );
    const isTerm1Paid = paidTerms.some((t) => (t.term_number ?? t.installment_number) === 1);
    const canAccessProduct = invoice.status === 'paid' || invoice.status === 'completed' || (isInstallment && isTerm1Paid && !isSuspended);

    const getProductInfo = () => {
        const target = invoice.parent_invoice || invoice.parentInvoice || invoice;
        const courseItems = target.course_items || target.courseItems;
        const bootcampItems = target.bootcamp_items || target.bootcampItems;
        const webinarItems = target.webinar_items || target.webinarItems;
        const certItems = target.certificationProgramItems || target.certification_program_items;
        const bundleItems = target.bundle_enrollments || target.bundleEnrollments;

        if (courseItems && courseItems.length > 0) {
            const course = courseItems[0].course;
            return {
                type: 'course',
                routeParam: 'course',
                name: course.title,
                slug: course.slug,
                thumbnail: course.thumbnail,
                profileRoute: 'profile.course.detail',
                publicRoute: 'course.detail',
                badge: t('transaction.badgeCourse'),
            };
        } else if (bootcampItems && bootcampItems.length > 0) {
            const bootcamp = bootcampItems[0].bootcamp;
            return {
                type: 'bootcamp',
                routeParam: 'bootcamp',
                name: bootcamp.title,
                slug: bootcamp.slug,
                thumbnail: bootcamp.thumbnail,
                profileRoute: 'profile.bootcamp.detail',
                publicRoute: 'bootcamp.detail',
                badge: t('transaction.badgeBootcamp'),
            };
        } else if (webinarItems && webinarItems.length > 0) {
            const webinar = webinarItems[0].webinar;
            return {
                type: 'webinar',
                routeParam: 'webinar',
                name: webinar.title,
                slug: webinar.slug,
                thumbnail: webinar.thumbnail,
                profileRoute: 'profile.webinar.detail',
                publicRoute: 'webinar.detail',
                badge: t('transaction.badgeWebinar'),
            };
        } else if (certItems && certItems.length > 0) {
            const certificationProgram = certItems[0].certificationProgram;
            return {
                type: 'certification-program',
                routeParam: 'program',
                name: certificationProgram.title,
                slug: certificationProgram.slug,
                thumbnail: certificationProgram.thumbnail,
                profileRoute: 'profile.certification-program.detail',
                publicRoute: 'certification-programs.detail',
                badge: t('transaction.badgeCertification'),
            };
        } else if (bundleItems && bundleItems.length > 0) {
            const bundleItem = bundleItems[0];
            return {
                type: 'bundle',
                routeParam: 'bundle',
                name: bundleItem.bundle?.title || t('transaction.bundleDefaultTitle'),
                slug: bundleItem.bundle?.slug || '',
                thumbnail: bundleItem.bundle?.thumbnail || '',
                profileRoute: 'profile.index',
                publicRoute: 'bundle.detail',
                badge: t('transaction.badgeBundle'),
            };
        }
        return null;
    };

    const productInfo = getProductInfo();

    const handleCancelConfirm = async () => {
        setCancelLoading(true);
        setDialogOpen(false);

        try {
            const res = await axios.post(route('invoice.cancel', { id: invoice.id }));
            if (res.data?.success) {
                toast.success(t('transaction.toastCancelSuccess'));
                window.location.reload();
            } else {
                toast.error(res.data?.message || t('transaction.toastCancelFailed'));
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || t('transaction.toastCancelError'));
            } else {
                toast.error(t('transaction.toastCancelError'));
            }
        } finally {
            setCancelLoading(false);
        }
    };

    const getStatusIcon = () => {
        if (isInstallment) {
            if (isFullyPaid || invoice.status === 'paid' || invoice.status === 'completed') {
                return <CheckCircle className="mt-1 h-6 w-6 text-green-500" />;
            }
            if (isSuspended) {
                return <Lock className="mt-1 h-6 w-6 text-red-500" />;
            }
            if (isTerm1Paid) {
                return <CalendarClock className="mt-1 h-6 w-6 text-indigo-400" />;
            }
            return <Clock className="mt-1 h-6 w-6 text-yellow-500" />;
        }
        switch (invoice.status) {
            case 'paid':
            case 'completed':
                return <CheckCircle className="mt-1 h-6 w-6 text-green-500" />;
            case 'pending':
                return <Clock className="mt-1 h-6 w-6 text-yellow-500" />;
            case 'failed':
                return <XCircle className="mt-1 h-6 w-6 text-red-500" />;
            default:
                return <AlertTriangle className="mt-1 h-6 w-6 text-gray-500" />;
        }
    };

    const getStatusText = () => {
        if (isInstallment) {
            if (isFullyPaid || invoice.status === 'paid' || invoice.status === 'completed') {
                return t('transaction.installmentFullyPaidExcl');
            }
            if (isSuspended) {
                return t('transaction.accessSuspended');
            }
            if (isTerm1Paid) {
                return t('transaction.installmentActiveTerms', {
                    paid: paidTerms.length,
                    total: terms.length || 2,
                });
            }
            return t('transaction.waitingDP');
        }
        switch (invoice.status) {
            case 'paid':
            case 'completed':
                return t('transaction.paymentSuccessExcl');
            case 'pending':
                return isExpired ? t('transaction.statusExpired') : t('transaction.statusPending');
            case 'failed':
                return t('transaction.statusCancelled');
            default:
                return t('transaction.statusUnknown');
        }
    };

    const getStatusColor = () => {
        if (isInstallment) {
            if (isFullyPaid || invoice.status === 'paid' || invoice.status === 'completed') {
                return 'text-green-400';
            }
            if (isSuspended) {
                return 'text-red-400';
            }
            if (isTerm1Paid) {
                return 'text-indigo-400';
            }
            return 'text-yellow-400';
        }
        switch (invoice.status) {
            case 'paid':
            case 'completed':
                return 'text-green-400';
            case 'pending':
                return isExpired ? 'text-red-400' : 'text-yellow-400';
            case 'failed':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <UserLayout>
            <Head title={t('transaction.headTitle', { code: invoice.invoice_code })} />

            <div className="min-h-screen bg-gray-50 py-4 md:py-8 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
                        {/* Header Banner */}
                        <div className="to-primary flex gap-3 bg-gradient-to-tl from-black px-6 py-4 text-white">
                            {getStatusIcon()}
                            <div>
                                <h1 className={`text-xl font-bold md:text-2xl ${getStatusColor()}`}>{getStatusText()}</h1>
                                <p className="mt-1 text-sm text-blue-100 md:text-base">
                                    {t('transaction.invoiceNumber', { code: invoice.invoice_code })}
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Product Info Card */}
                            {productInfo && (
                                <div className="mb-6 rounded-lg border bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                                        {t('transaction.purchasedProduct')}
                                    </h3>
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={productInfo.thumbnail ? `/storage/${productInfo.thumbnail}` : '/assets/images/placeholder.png'}
                                            alt={productInfo.name}
                                            className="h-16 rounded-lg object-cover md:h-20"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{productInfo.name}</h4>
                                            <p className="text-sm text-gray-600 capitalize dark:text-gray-400">
                                                {productInfo.badge}
                                            </p>
                                            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                                {canAccessProduct ? (
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link
                                                            href={
                                                                productInfo.type === 'bundle'
                                                                    ? '/profile'
                                                                    : productInfo.profileRoute
                                                                    ? route(productInfo.profileRoute, {
                                                                          [productInfo.routeParam || productInfo.type]: productInfo.slug,
                                                                      })
                                                                    : route(productInfo.publicRoute, {
                                                                          [productInfo.routeParam || productInfo.type]: productInfo.slug,
                                                                      })
                                                            }
                                                        >
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            {productInfo.type === 'bundle'
                                                                ? t('transaction.openInProfile')
                                                                : t('transaction.accessProduct', { name: productInfo.badge })}
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <Button asChild size="sm" variant="ghost">
                                                        <Link
                                                            href={
                                                                productInfo.type === 'bundle'
                                                                    ? `/bundle/${productInfo.slug}`
                                                                    : route(productInfo.publicRoute, {
                                                                          [productInfo.routeParam || productInfo.type]: productInfo.slug,
                                                                      })
                                                            }
                                                        >
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            {t('transaction.viewProductDetail')}
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status Alerts */}
                            {isInstallment && isSuspended && (
                                <Alert className="mb-6 border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-700 dark:text-red-300">
                                        <span className="font-semibold block mb-1">{t('transaction.alertSuspendedTitle')}</span>
                                        {t('transaction.alertSuspendedDesc')}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {isInstallment && !isFullyPaid && isTerm1Paid && !isSuspended && (
                                <Alert className="mb-6 border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30">
                                    <Clock className="h-4 w-4 text-indigo-600" />
                                    <AlertDescription className="text-indigo-700 dark:text-indigo-300">
                                        <span className="font-semibold block mb-1">{t('transaction.alertActiveTitle')}</span>
                                        {t('transaction.alertActiveDesc')}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {isInstallment && !isTerm1Paid && invoice.status !== 'failed' && (
                                <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30">
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                                        <span className="font-semibold block mb-1">{t('transaction.alertDPTitle')}</span>
                                        {t('transaction.alertDPDesc')}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {!isInstallment && invoice.status === 'pending' && !isExpired && (
                                <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30">
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                                        <span className="font-semibold block mb-1">{t('transaction.alertPendingTitle')}</span>
                                        {t('transaction.alertPendingDesc', { hours: hoursLeft, minutes: minutesLeft })}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {!isInstallment && invoice.status === 'pending' && isExpired && (
                                <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-700 dark:text-red-300">
                                        <span className="font-semibold block mb-1">{t('transaction.alertExpiredTitle')}</span>
                                        {t('transaction.alertExpiredDesc')}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {invoice.status === 'failed' && (
                                <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-700 dark:text-red-300">
                                        <span className="font-semibold block mb-1">{t('transaction.alertCancelledTitle')}</span>
                                        {t('transaction.alertCancelledDesc')}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Details Grid */}
                            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                                        {t('transaction.paymentDetailsTitle')}
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        {invoice.discount_amount > 0 && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">{t('transaction.originalPrice')}</span>
                                                    <span className="medium">
                                                        Rp {(invoice.discount_amount + invoice.nett_amount)?.toLocaleString(localeCode)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">{t('transaction.discountLabel')}</span>
                                                    <span className="text-gray-500 line-through">
                                                        Rp {invoice.discount_amount?.toLocaleString(localeCode) || '0'}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">{t('transaction.subtotalLabel')}</span>
                                            <span className="font-medium">Rp {invoice.nett_amount?.toLocaleString(localeCode) || '0'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">{t('transaction.transactionFee')}</span>
                                            <span className="font-medium">
                                                Rp {((invoice.amount || 0) - (invoice.nett_amount || 0)).toLocaleString(localeCode)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                                            <span>{t('transaction.totalLabel')}</span>
                                            <span>Rp {invoice.amount?.toLocaleString(localeCode) || '0'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{t('transaction.paymentInfo')}</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">{t('transaction.statusLabel')}</span>
                                            <span className={`font-medium ${getStatusColor()}`}>{getStatusText()}</span>
                                        </div>
                                        {invoice.payment_method && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('transaction.paymentMethod')}</span>
                                                <span className="font-medium">{invoice.payment_method}</span>
                                            </div>
                                        )}
                                        {invoice.payment_channel && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('transaction.paymentChannel')}</span>
                                                <span className="font-medium">{invoice.payment_channel}</span>
                                            </div>
                                        )}
                                        {invoice.paid_at && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('transaction.paidOn')}</span>
                                                <span className="font-medium">{new Date(invoice.paid_at).toLocaleString(localeCode)}</span>
                                            </div>
                                        )}
                                        {invoice.expires_at && invoice.status === 'pending' && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('transaction.expiresOn')}</span>
                                                <span className="font-medium">{new Date(invoice.expires_at).toLocaleString(localeCode)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Installment terms list if available */}
                            {isInstallment && terms.length > 0 && (
                                <div className="mb-6 rounded-lg border bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {t('transaction.installmentTerms')}
                                        </h3>
                                        <Link
                                            href={route('profile.installments')}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                        >
                                            {t('transaction.installmentsPageLink')}
                                        </Link>
                                    </div>
                                    <div className="space-y-2">
                                        {terms.map((term) => {
                                            const termNumber = term.term_number ?? term.installment_number ?? 1;
                                            const isPaid = term.status === 'paid';
                                            const isOverdue = term.status === 'overdue' || Boolean(term.is_overdue);
                                            const dueDate = term.due_date || term.installment_due_date;
                                            const dueDateFormatted = dueDate
                                                ? new Date(dueDate).toLocaleDateString(localeCode, {
                                                      day: 'numeric',
                                                      month: 'short',
                                                      year: 'numeric',
                                                  })
                                                : null;
                                            const paidDateFormatted = term.paid_at
                                                ? new Date(term.paid_at).toLocaleDateString(localeCode, {
                                                      day: 'numeric',
                                                      month: 'short',
                                                      year: 'numeric',
                                                  })
                                                : null;

                                            return (
                                                <div
                                                    key={term.id}
                                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-white p-3 dark:bg-gray-800 ${
                                                        isPaid
                                                            ? 'border-green-200 dark:border-green-800/40'
                                                            : isOverdue
                                                            ? 'border-red-200 dark:border-red-800/40'
                                                            : 'border-gray-200 dark:border-gray-600'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white mt-0.5 ${
                                                                isPaid ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-slate-400'
                                                            }`}
                                                        >
                                                            {termNumber}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {termNumber === 1
                                                                        ? t('transaction.termDP', { number: termNumber })
                                                                        : t('transaction.termNumber', { number: termNumber })}
                                                                </p>
                                                                {isPaid ? (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 font-medium">
                                                                        <CheckCircle className="h-3 w-3" /> {t('transaction.termPaid')}
                                                                    </span>
                                                                ) : isOverdue ? (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs px-2 py-0.5 font-medium">
                                                                        <AlertTriangle className="h-3 w-3 text-red-500" /> {t('transaction.termOverdueBadge')}
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs px-2 py-0.5">
                                                                        <Clock className="h-3 w-3" /> {t('transaction.termWaiting')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                                                                {isPaid && paidDateFormatted ? (
                                                                    <p className="text-green-600 dark:text-green-400">
                                                                        <CheckCircle className="h-3 w-3 inline-block mr-1 -mt-0.5" />
                                                                        {t('transaction.paidAtDate', { date: paidDateFormatted })}
                                                                        {term.payment_channel && t('transaction.viaChannel', { channel: term.payment_channel })}
                                                                    </p>
                                                                ) : dueDateFormatted ? (
                                                                    <p className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                                                                        <CalendarClock className="h-3 w-3 inline-block mr-1 -mt-0.5" />
                                                                        {t('transaction.dueDate', { date: dueDateFormatted })}
                                                                    </p>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-10 sm:pl-0">
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            Rp {Number(term.amount).toLocaleString(localeCode)}
                                                        </span>
                                                        {!isPaid && (
                                                            <Button asChild size="sm" variant={isOverdue ? 'destructive' : 'default'}>
                                                                {term.invoice?.invoice_url ? (
                                                                    <a href={term.invoice.invoice_url} target="_blank" rel="noopener noreferrer">
                                                                        {t('transaction.pay')}
                                                                    </a>
                                                                ) : (
                                                                    <Link href={route('profile.installments')}>
                                                                        {t('transaction.pay')}
                                                                    </Link>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col justify-center gap-4 sm:flex-row flex-wrap">
                                {invoice.status === 'pending' && !isExpired && invoice.invoice_url && (
                                    <>
                                        <Button asChild size="lg" className="w-full sm:w-auto">
                                            <a href={invoice.invoice_url} target="_blank" rel="noopener noreferrer">
                                                {isInstallment ? t('transaction.payDPBtn') : t('transaction.continuePayment')}
                                            </a>
                                        </Button>

                                        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    className="w-full border-red-600 text-red-600 hover:bg-red-50 sm:w-auto"
                                                    disabled={cancelLoading}
                                                >
                                                    {cancelLoading ? t('transaction.canceling') : t('transaction.cancelOrderBtn')}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t('transaction.cancelOrderTitle')}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t('transaction.cancelOrderDesc')}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{t('transaction.cancelOrderNo')}</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleCancelConfirm}
                                                        className="border-red-600 bg-red-600 hover:bg-red-700"
                                                    >
                                                        {t('transaction.cancelOrderYes')}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}

                                {canAccessProduct && productInfo && (
                                    <Button asChild size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                        <Link
                                            href={
                                                productInfo.type === 'bundle'
                                                    ? '/profile'
                                                    : productInfo.profileRoute
                                                    ? route(productInfo.profileRoute, {
                                                          [productInfo.routeParam || productInfo.type]: productInfo.slug,
                                                      })
                                                    : route(productInfo.publicRoute, {
                                                          [productInfo.routeParam || productInfo.type]: productInfo.slug,
                                                      })
                                            }
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            {t('transaction.accessProduct', { name: productInfo.badge })}
                                        </Link>
                                    </Button>
                                )}

                                {(invoice.status === 'paid' || invoice.status === 'completed' || isTerm1Paid) && (
                                    <Button asChild size="lg" className="w-full sm:w-auto" variant="outline">
                                        <a href={route('invoice.pdf', { id: invoice.id })} target="_blank" rel="noopener noreferrer">
                                            <FileText className="mr-2 h-4 w-4" />
                                            {t('transaction.downloadInvoicePdf')}
                                        </a>
                                    </Button>
                                )}

                                {isInstallment && (
                                    <Button asChild className="w-full sm:w-auto" variant="outline" size="lg">
                                        <Link href={route('profile.installments')}>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            {t('transaction.manageInstallments')}
                                        </Link>
                                    </Button>
                                )}

                                {(invoice.status === 'failed' || (!isInstallment && isExpired)) && (
                                    <>
                                        <Button asChild size="lg" className="w-full sm:w-auto">
                                            <Link href="/">
                                                <Home className="mr-2 h-4 w-4" /> {t('transaction.backToHome')}
                                            </Link>
                                        </Button>

                                        {productInfo && (
                                            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                                                <Link
                                                    href={
                                                        productInfo.type === 'bundle'
                                                            ? `/bundle/${productInfo.slug}`
                                                            : route(productInfo.publicRoute, {
                                                                  [productInfo.routeParam || productInfo.type]: productInfo.slug,
                                                              })
                                                    }
                                                >
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    {t('transaction.viewProductDetail')}
                                                </Link>
                                            </Button>
                                        )}
                                    </>
                                )}

                                <Button asChild className="w-full sm:w-auto" variant="ghost" size="lg">
                                    <Link href="/profile/transactions">{t('transaction.viewAllTransactions')}</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Customer Service Footer */}
                        <div className="border-t bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {t('transaction.csNeedHelp')}{' '}
                                <a
                                    href="https://wa.me/+6289528514480"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-orange-600 hover:underline"
                                >
                                    {t('transaction.csContact')}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
