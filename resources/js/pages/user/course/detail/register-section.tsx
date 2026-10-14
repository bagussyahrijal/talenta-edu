import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BadgeCheck, InfinityIcon, Presentation, Smartphone, TvMinimalPlay, Sparkles, AlertCircle, Check, Percent } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Course {
    title: string;
    thumbnail?: string | null;
    strikethrough_price: number;
    price: number;
    registration_url: string;
    modules?: {
        title: string;
        description?: string | null;
        lessons?: {
            title: string;
            description?: string | null;
            type: 'text' | 'video' | 'file' | 'quiz';
            video_url?: string | null;
        }[];
    }[];
}

export default function RegisterSection({ course }: { course: Course }) {
    const { t } = useTranslation('user');
    const { auth } = usePage<SharedData>().props;
    const totalLessons = course.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0;

    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number;

    let registrationUrl: string;
    let buttonText: string;
    let warningMessage: string | null = null;

    if (!isLoggedIn) {
        registrationUrl = course.registration_url;
        buttonText = t('course.detail.loginToRegister');
        warningMessage = t('course.detail.loginFirstWarning');
    } else if (!isProfileComplete) {
        registrationUrl = route('profile.edit', { redirect: window.location.href });
        buttonText = t('course.detail.completeProfileToRegister');
        warningMessage = t('course.detail.incompleteProfileWarning');
    } else {
        registrationUrl = course.registration_url;
        buttonText = t('course.detail.joinNow');
        warningMessage = null;
    }

    const discount = course.strikethrough_price > 0 
        ? Math.round(((course.strikethrough_price - course.price) / course.strikethrough_price) * 100)
        : 0;

    return (
        <section className="relative mx-auto mt-16 w-full max-w-6xl overflow-hidden px-4 pb-16" id="register">
            {/* Background Decoration */}
            

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
                            {t('course.detail.limitedOffer')}
                        </span>
                    </div>
                    <h2 className="dark:text-primary-foreground mb-4 text-2xl font-extrabold text-gray-900 md:text-3xl">
                        {t('course.detail.startLearningTitle')}
                    </h2>
                    <p className="text-md text-gray-600 dark:text-gray-400">
                        {t('course.detail.startLearningSubtitle')}
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
                                        <span className="text-lg font-bold">{t('course.detail.savePromo', { discount })}</span>
                                    </div>
                                </div>
                            )}

                            <div className="p-8">
                                {/* Price */}
                                <div className="mb-6 text-center">
                                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                        {t('course.detail.investmentTitle')}
                                    </p>
                                    {course.price > 0 ? (
                                        <>
                                            {course.strikethrough_price > 0 && (
                                                 <span className="block text-xl text-red-500 line-through">
                                                     Rp {course.strikethrough_price.toLocaleString('id-ID')}
                                                 </span>
                                            )}
                                            <span className="block text-4xl font-extrabold text-primary">
                                                Rp {course.price.toLocaleString('id-ID')}
                                            </span>
                                            <span className="mt-2 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                                                {t('course.detail.payOnce')}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="block text-5xl font-extrabold text-green-600">
                                            {t('course.detail.freeBadge')}
                                        </span>
                                    )}
                                </div>

                                <Separator className="my-6" />

                                {/* Quick Info */}
                                <div className="mb-6 space-y-3">
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('course.detail.totalMaterial')}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{t('course.detail.totalLessonsCount', { count: totalLessons })}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('course.detail.access')}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{t('course.detail.forever')}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-zinc-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('course.detail.consultation')}</span>
                                        <span className="font-bold text-green-600">{t('course.detail.free')}</span>
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
                                <Button className="w-full py-4 text-md font-bold shadow-lg" size="lg" asChild>
                                    <Link href={registrationUrl}>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        {buttonText}
                                    </Link>
                                </Button>

                                {/* Trust Badges */}
                                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <BadgeCheck className="h-4 w-4 text-green-600" />
                                        <span>{t('course.detail.trusted')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BadgeCheck className="h-4 w-4 text-green-600" />
                                        <span>{t('course.detail.safe')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BadgeCheck className="h-4 w-4 text-green-600" />
                                        <span>{t('course.detail.quality')}</span>
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
                                {t('course.detail.safePayment')}
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
                                src={course.thumbnail ? `/storage/${course.thumbnail}` : '/assets/images/placeholder.png'}
                                alt={course.title}
                                className="aspect-video w-full object-cover"
                            />
                        </div>

                        {/* Benefits List */}
                        <div className="rounded-2xl border-2 p-6 shadow-lg dark:border-zinc-700">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                                <Check className="h-6 w-6 text-green-600" />
                                {t('course.detail.whatYouGet')}
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    { icon: InfinityIcon, text: t('course.detail.benefit1'), color: 'text-blue-600' },
                                    { icon: TvMinimalPlay, text: t('course.detail.benefit2', { count: totalLessons }), color: 'text-purple-600' },
                                    { icon: Presentation, text: t('course.detail.benefit3'), color: 'text-green-600' },
                                    { icon: Smartphone, text: t('course.detail.benefit4'), color: 'text-orange-600' },
                                    { icon: BadgeCheck, text: t('course.detail.benefit5'), color: 'text-pink-600' },
                                ].map((item, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                                        className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm dark:bg-zinc-800"
                                    >
                                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-700`}>
                                            <item.icon className={`h-5 w-5 ${item.color}`} />
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">{item.text}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}