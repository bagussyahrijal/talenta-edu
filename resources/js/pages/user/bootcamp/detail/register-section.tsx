import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BadgeCheck, CalendarDays, ChartArea, Clock, Hourglass, MapPin, Users, Sparkles, AlertCircle, Check, Percent } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Bootcamp {
    title: string;
    batch?: string | null;
    strikethrough_price: number;
    price: number;
    quota: number;
    start_date: string;
    end_date: string;
    schedules?: { schedule_date: string; day: string; start_time: string; end_time: string }[];
    registration_deadline: string;
    registration_url: string;
    thumbnail?: string | null;
}

export default function RegisterSection({ bootcamp }: { bootcamp: Bootcamp }) {
    const { t, i18n } = useTranslation('user');
    const { auth } = usePage<SharedData>().props;
    const start = new Date(bootcamp.start_date);
    const end = new Date(bootcamp.end_date);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000)) + 1;
    const totalWeeks = Math.ceil(diffDays / 7);

    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number;

    let registrationUrl: string;
    let buttonText: string;
    let warningMessage: string | null = null;

        registrationUrl = bootcamp.registration_url;
        buttonText = t('bootcamp.detail.btnRegisterNow');
        warningMessage = null;

    const deadline = new Date(bootcamp.registration_deadline);
    const isRegistrationOpen = new Date() < deadline;

    const discount = bootcamp.strikethrough_price > 0 
        ? Math.round(((bootcamp.strikethrough_price - bootcamp.price) / bootcamp.strikethrough_price) * 100)
        : 0;

    return (
        <section className="relative mx-auto mt-16 w-full max-w-7xl overflow-hidden px-4 pb-16" id="register">
            <div className="relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <div className="mb-4 flex items-center justify-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
                            {t('bootcamp.detail.limitedOffer')}
                        </span>
                    </div>
                    <h2 className="dark:text-primary-foreground mb-4 text-3xl font-extrabold text-gray-900 md:text-4xl">
                        {t('bootcamp.detail.startJourneyTitle')}
                    </h2>
                    <p className="text-md text-gray-600 dark:text-gray-400">
                        {t('bootcamp.detail.startJourneySubtitle')}
                    </p>
                </motion.div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Left Column - Pricing Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:sticky lg:top-24 lg:self-start"
                    >
                        <div className="overflow-hidden rounded-2xl border-2 border-primary/30 bg-white shadow-lg dark:bg-zinc-900 dark:border-primary/50">
                            {/* Discount Badge */}
                            {discount > 0 && (
                                <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2 text-white">
                                        <Percent className="h-5 w-5" />
                                        <span className="text-lg font-bold">{t('bootcamp.detail.savePercentPromo', { percent: discount })}</span>
                                    </div>
                                </div>
                            )}

                            <div className="p-8">
                                {/* Price */}
                                <div className="mb-6 text-center">
                                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                        {t('bootcamp.detail.investmentForFuture')}
                                    </p>
                                    {bootcamp.price > 0 ? (
                                        <>
                                            {bootcamp.strikethrough_price > 0 && (
                                                <span className="block text-xl text-red-500 line-through">
                                                    Rp {bootcamp.strikethrough_price.toLocaleString('id-ID')}
                                                </span>
                                            )}
                                            <span className="block text-4xl font-extrabold text-primary">
                                                Rp {bootcamp.price.toLocaleString('id-ID')}
                                            </span>
                                            <span className="mt-2 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                                                {t('bootcamp.detail.payOnceLifetime')}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="block text-5xl font-extrabold text-green-600">
                                            {t('bootcamp.detail.free')}
                                        </span>
                                    )}
                                </div>

                                <Separator className="my-6" />

                                {/* Quick Info */}
                                <div className="mb-6 space-y-3">
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('bootcamp.detail.location')}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{t('bootcamp.detail.online')}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Batch</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{bootcamp.batch || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('bootcamp.detail.quota')}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {bootcamp.quota ? t('bootcamp.detail.quotaParticipants', { quota: bootcamp.quota }) : t('bootcamp.detail.unlimitedQuota')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('bootcamp.detail.duration')}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {diffDays < 7 ? t('bootcamp.detail.daysCount', { count: diffDays }) : t('bootcamp.detail.weeksCount', { count: totalWeeks })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('bootcamp.detail.deadline')}</span>
                                        <span className="font-bold text-red-600">
                                            {new Date(bootcamp.registration_deadline).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Warning Message */}
                                {warningMessage && (
                                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <span>{warningMessage}</span>
                                    </div>
                                )}

                                {/* CTA Button */}
                                {isRegistrationOpen ? (
                                    <Button className="w-full py-4 text-md font-bold shadow-lg" size="lg" asChild>
                                        <Link href={registrationUrl}>
                                            <Sparkles className="mr-2 h-5 w-5" />
                                            {buttonText}
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button className="w-full py-4 text-md font-bold" size="lg" disabled>
                                        {t('bootcamp.detail.registrationClosed')}
                                    </Button>
                                )}

                                {/* Trust Badges */}
                                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <BadgeCheck className="h-4 w-4 text-green-600" />
                                        <span>{t('bootcamp.detail.trusted')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BadgeCheck className="h-4 w-4 text-green-600" />
                                        <span>{t('bootcamp.detail.secure')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BadgeCheck className="h-4 w-4 text-green-600" />
                                        <span>{t('bootcamp.detail.highQuality')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Money Back Guarantee */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mt-4 text-center"
                        >
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('bootcamp.detail.securePaymentText')}
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Right Column - Thumbnail & Benefits */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Thumbnail Card */}
                        <div className="overflow-hidden rounded-2xl border-2 shadow-xl dark:border-zinc-700">
                            <img
                                src={bootcamp.thumbnail ? `/storage/${bootcamp.thumbnail}` : '/assets/images/placeholder.png'}
                                alt={bootcamp.title}
                                className="aspect-video w-full object-cover"
                            />
                        </div>

                        {/* Jadwal List */}
                        <div className="rounded-2xl border-2 p-6 shadow-lg dark:border-zinc-700">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                                <CalendarDays className="h-6 w-6 text-primary" />
                                {t('bootcamp.detail.bootcampSchedule')}
                            </h3>
                            
                            {/* Date Range */}
                            <div className="mb-4 rounded-lg bg-primary/5 p-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">{t('bootcamp.detail.programPeriod')}</p>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {new Date(bootcamp.start_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}{' '}
                                    -{' '}
                                    {new Date(bootcamp.end_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>

                            {/* Schedule Details */}
                            <ul className="space-y-3">
                                {bootcamp.schedules && bootcamp.schedules.length > 0 ? (
                                    bootcamp.schedules.map((schedule, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                                            className="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm dark:bg-zinc-800"
                                        >
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-700">
                                                <Clock className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                                                    {schedule.day}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(schedule.schedule_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                                <p className="text-sm font-medium text-primary">
                                                    {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)} WIB
                                                </p>
                                            </div>
                                        </motion.li>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-500 dark:text-gray-400">
                                        <Clock className="h-12 w-12 opacity-50" />
                                        <p className="text-sm">{t('bootcamp.detail.scheduleAnnouncedSoon')}</p>
                                    </div>
                                )}
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}