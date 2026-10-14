import { Button } from '@/components/ui/button';
import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface UnavailableItem {
    title?: string;
    slug?: string;
    status?: string;
}

export default function UnavailablePage({
    title,
    item,
    message,
    adminWhatsappUrl,
    backUrl,
    backLabel,
}: {
    title?: string;
    item?: UnavailableItem;
    message?: string;
    adminWhatsappUrl: string;
    backUrl?: string;
    backLabel?: string;
}) {
    const { t } = useTranslation('user');
    const pageTitle = title || t('unavailable.title');
    const itemTitle = item?.title ? `"${item.title}"` : t('unavailable.thisPage');

    return (
        <div className="from-primary/10 to-secondary/10 relative min-h-screen bg-gradient-to-br via-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Global Decorative Background */}
            <div className="bg-primary/20 pointer-events-none absolute -top-32 -left-32 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />
            <div className="bg-secondary/20 pointer-events-none absolute -top-32 -right-0 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />
            <div className="bg-primary/20 pointer-events-none absolute -bottom-0 -left-32 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />
            <div className="bg-secondary/20 pointer-events-none absolute -right-0 -bottom-0 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />

            <UserLayout>
                <Head title={pageTitle} />

                {/* Hero Section */}
                <section className="relative overflow-hidden px-4 pt-16 text-gray-900 dark:text-white">
                    {/* Animated Background Elements */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute top-20 left-10 h-72 w-72 animate-pulse rounded-full bg-yellow-500/10 blur-3xl" />
                        <div
                            className="absolute right-10 bottom-20 h-72 w-72 animate-pulse rounded-full bg-orange-500/10 blur-3xl"
                            style={{ animationDelay: '1s' }}
                        />
                    </div>

                    <div className="relative z-10 mx-auto max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            <h1 className="mb-4 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                                <span className="from-primary via-secondary to-primary animate-gradient bg-gradient-to-r bg-clip-text text-transparent">
                                    {pageTitle}
                                </span>
                            </h1>
                            <p className="text-base text-gray-600 md:text-lg dark:text-gray-300">
                                {itemTitle} {t('unavailable.currentlyNotAccessible')}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="relative z-10 mx-auto my-8 w-full max-w-3xl px-4 md:my-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
                    >
                        <div className="p-8 md:p-12">
                            <div className="flex flex-col items-center space-y-6 text-center">
                                {/* Icon with animated background */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.4, type: 'spring' }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 animate-pulse rounded-full bg-yellow-500/20 blur-2xl" />
                                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-yellow-200 bg-gradient-to-br from-yellow-100 to-orange-100 md:h-32 md:w-32 dark:border-yellow-800 dark:from-yellow-900/30 dark:to-orange-900/30">
                                        <AlertTriangle className="h-12 w-12 text-yellow-600 md:h-16 md:w-16 dark:text-yellow-500" />
                                    </div>
                                </motion.div>

                                {/* Message */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                    className="space-y-3"
                                >
                                    <h2 className="text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
                                        {message || t('unavailable.defaultMessage')}
                                    </h2>
                                    <p className="mx-auto max-w-md text-sm text-gray-600 md:text-base dark:text-gray-400">
                                        {t('unavailable.errorHint')}
                                    </p>
                                </motion.div>

                                {/* Action Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.8 }}
                                    className="flex w-full flex-col gap-3 pt-4 sm:flex-row"
                                >
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="h-12 flex-1 rounded-xl border-2 text-base font-semibold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                    >
                                        {backUrl ? (
                                            <Link href={backUrl} className="flex items-center justify-center gap-2">
                                                <ArrowLeft className="h-5 w-5" />
                                                {backLabel || t('unavailable.back')}
                                            </Link>
                                        ) : (
                                            <Link href="/" className="flex items-center justify-center gap-2">
                                                <ArrowLeft className="h-5 w-5" />
                                                {backLabel || t('unavailable.back')}
                                            </Link>
                                        )}
                                    </Button>
                                    <Button
                                        asChild
                                        className="from-primary to-secondary h-12 flex-1 rounded-xl bg-gradient-to-r text-base font-semibold shadow-lg transition-all duration-200 hover:opacity-90"
                                    >
                                        <a
                                            href={adminWhatsappUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                            {t('unavailable.contactAdmin')}
                                        </a>
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </UserLayout>
        </div>
    );
}
