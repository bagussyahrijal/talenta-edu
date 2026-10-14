import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BadgeCheck, CalendarDays, ChartArea, Clock, Hourglass, MapPin, Users, Sparkles, AlertCircle, Check, Percent } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Webinar {
    title: string;
    batch?: string | null;
    strikethrough_price: number;
    price: number;
    quota: number;
    start_time: string;
    end_time: string;
    registration_deadline: string;
    registration_url: string;
    thumbnail?: string | null;
}

export default function RegisterSection({ webinar }: { webinar: Webinar }) {
    const { t, i18n } = useTranslation('user');
    const { auth } = usePage<SharedData>().props;

    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number;

    let registrationUrl: string;
    let buttonText: string;
    let warningMessage: string | null = null;
    
    registrationUrl = webinar.registration_url;
    buttonText = t('webinar.detail.btnJoinNow');
    warningMessage = null;

    const deadline = new Date(webinar.registration_deadline);
    const isRegistrationOpen = new Date() < deadline;

    const startTime = new Date(webinar.start_time);
    const endTime = new Date(webinar.end_time);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = Math.ceil(durationMs / (60 * 60 * 1000));

    const discount = webinar.strikethrough_price > 0
        ? Math.round(((webinar.strikethrough_price - webinar.price) / webinar.strikethrough_price) * 100)
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
                            {t('webinar.detail.exclusiveWebinar')}
                        </span>
                    </div>
                    <h2 className="dark:text-primary-foreground mb-4 text-3xl font-extrabold text-gray-900 md:text-4xl">
                        {t('webinar.detail.dontMissOpportunity')}
                    </h2>
                    <p className="text-md text-gray-600 dark:text-gray-400">
                        {t('webinar.detail.registerSubtitle')}
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
                                        <span className="text-lg font-bold">{t('webinar.detail.savePercentPromo', { percent: discount })}</span>
                                    </div>
                                </div>
                            )}

                            <div className="p-8">
                                {/* Price */}
                                <div className="mb-6 text-center">
                                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                        {t('webinar.detail.affordableInvestment')}
                                    </p>
                                    {webinar.price > 0 ? (
                                        <>
                                            {webinar.strikethrough_price > 0 && (
                                                <span className="block text-xl text-red-500 line-through">
                                                    Rp {webinar.strikethrough_price.toLocaleString('id-ID')}
                                                </span>
                                            )}
                                            <span className="block text-4xl font-extrabold text-primary">
                                                Rp {webinar.price.toLocaleString('id-ID')}
                                            </span>
                                            <span className="mt-2 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                                                {t('webinar.detail.recordingAndMaterialIncluded')}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="block text-5xl font-extrabold text-green-600">
                                            {t('webinar.detail.free')}
                                        </span>
                                    )}
                                </div>

                                <Separator className="my-6" />

                                {/* Quick Info */}
                                <div className="mb-6 space-y-3">
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('webinar.detail.platform')}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">Google Meet/Zoom</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Batch</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{webinar.batch || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('webinar.detail.quota')}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {webinar.quota ? t('webinar.detail.quotaParticipants', { quota: webinar.quota }) : t('webinar.detail.unlimitedQuota')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('webinar.detail.duration')}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {t('webinar.detail.durationVal', { hours: durationHours })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('webinar.detail.deadline')}</span>
                                        <span className="font-bold text-red-600">
                                            {new Date(webinar.registration_deadline).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
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
                                        {t('webinar.detail.registrationClosed')}
                                    </Button>
                                )}

                                {/* Trust Badges */}
                                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <BadgeCheck className="h-4 w-4 text-green-600" />
                                        <span>{t('webinar.detail.trusted')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BadgeCheck className="h-4 w-4 text-green-600" />
                                        <span>{t('webinar.detail.secure')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BadgeCheck className="h-4 w-4 text-green-600" />
                                        <span>{t('webinar.detail.highQuality')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Secure Payment */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mt-4 text-center"
                        >
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('webinar.detail.securePayment')}
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Right Column - Thumbnail & Schedule */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Thumbnail Card */}
                        <div className="overflow-hidden rounded-2xl border-2 shadow-xl dark:border-zinc-700">
                            <img
                                src={webinar.thumbnail ? `/storage/${webinar.thumbnail}` : '/assets/images/placeholder.png'}
                                alt={webinar.title}
                                className="aspect-video w-full object-cover"
                            />
                        </div>

                        {/* Schedule Detail */}
                        <div className="rounded-2xl border-2 p-6 shadow-lg dark:border-zinc-700">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                                <CalendarDays className="h-6 w-6 text-primary" />
                                {t('webinar.detail.webinarSchedule')}
                            </h3>

                            {/* Date & Time */}
                            <div className="mb-4 rounded-lg bg-primary/5 p-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">{t('webinar.detail.eventTime')}</p>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {new Date(webinar.start_time).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                                <p className="text-sm font-medium text-primary">
                                    {new Date(webinar.start_time).toLocaleTimeString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: 'Asia/Jakarta',
                                    })}{' '}
                                    -{' '}
                                    {new Date(webinar.end_time).toLocaleTimeString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: 'Asia/Jakarta',
                                    })}{' '}
                                    {t('webinar.detail.timeZoneWib')}
                                </p>
                            </div>

                            {/* Features List */}
                            <ul className="space-y-3">
                                <motion.li
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                    className="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm dark:bg-zinc-800"
                                >
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-700">
                                        <BadgeCheck className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {t('webinar.detail.relevantMaterial')}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('webinar.detail.relevantMaterialDesc')}
                                        </p>
                                    </div>
                                </motion.li>

                                <motion.li
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.4 }}
                                    className="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm dark:bg-zinc-800"
                                >
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-700">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {t('webinar.detail.professionalSpeaker')}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('webinar.detail.professionalSpeakerDesc')}
                                        </p>
                                    </div>
                                </motion.li>

                                <motion.li
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.5 }}
                                    className="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm dark:bg-zinc-800"
                                >
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-700">
                                        <Clock className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {t('webinar.detail.recordingAvailable')}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {t('webinar.detail.recordingAvailableDesc')}
                                        </p>
                                    </div>
                                </motion.li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}