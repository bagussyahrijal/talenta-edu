import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Mentor {
    id: string;
    name: string;
    avatar?: string | null;
}

interface Bootcamp {
    title: string;
    thumbnail?: string | null;
    description?: string | null;
    start_date: string;
    end_date: string;
    mentors?: Mentor[];
}

export default function HeroSection({ bootcamp }: { bootcamp: Bootcamp }) {
    const { t, i18n } = useTranslation('user');
    const getInitials = useInitials();
    const mentors = bootcamp.mentors ?? [];

    const getAvatarSrc = (avatar?: string | null) => {
        if (!avatar) {
            return null;
        }

        if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/')) {
            return avatar;
        }

        return `/storage/${avatar}`;
    };

    return (
        <section className="relative overflow-hidden px-4 py-12 md:py-16 lg:py-20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <div className="relative z-10 mx-auto max-w-7xl px-4">
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Right Column - Image (order-first on mobile) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="relative order-first lg:order-last"
                    >
                        <div className="relative overflow-hidden rounded-xl border-2 shadow-xl md:rounded-2xl md:shadow-2xl dark:border-zinc-700">
                            <img
                                src={bootcamp.thumbnail ? `/storage/${bootcamp.thumbnail}` : '/assets/images/placeholder.png'}
                                alt={bootcamp.title}
                                className="aspect-video w-full object-cover md:aspect-[4/3]"
                            />

                            {/* Overlay Badge */}
                            <div className="absolute top-3 right-3 md:top-4 md:right-4">
                                <div className="rounded-full bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur-sm md:px-4 md:py-2">
                                    <p className="text-primary text-xs font-bold md:text-sm">{t('bootcamp.detail.registrationOpen')}</p>
                                </div>
                            </div>

                            {/* Bottom Gradient Overlay */}
                            <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6">
                                <div className="flex flex-col items-start justify-between gap-2 text-white sm:flex-row sm:items-center">
                                    <div>
                                        <p className="text-xs font-bold md:text-sm">
                                            {t('bootcamp.detail.programDuration', {
                                                days: Math.ceil(
                                                    (new Date(bootcamp.end_date).getTime() - new Date(bootcamp.start_date).getTime()) /
                                                        (1000 * 60 * 60 * 24),
                                                ),
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                                        <span className="text-xs font-medium md:text-sm">{t('bootcamp.detail.intensiveSchedule')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Left Column - Content (order-last on mobile) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="order-last space-y-4 md:space-y-6 lg:order-first"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="border-primary/30 inline-flex items-center gap-2 rounded-full border-2 bg-white px-3 py-1.5 shadow-lg md:px-4 md:py-2 dark:bg-zinc-900"
                        >
                            <Sparkles className="text-primary h-3 w-3 md:h-4 md:w-4" />
                            <span className="text-xs font-semibold text-gray-900 md:text-sm dark:text-white">{t('bootcamp.detail.intensiveBadge')}</span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl"
                        >
                            <span className="from-primary via-secondary to-primary bg-gradient-to-r bg-clip-text text-transparent">
                                {bootcamp.title}
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-sm leading-relaxed text-gray-600 md:text-base lg:text-lg dark:text-gray-300"
                        >
                            {bootcamp.description || t('bootcamp.detail.heroDefaultDesc')}
                        </motion.p>

                        {mentors.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.35 }}
                                className="border-primary/15 flex flex-wrap items-center gap-3 rounded-2xl border bg-white/80 p-3 shadow-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/80"
                            >
                                <div className="flex -space-x-3">
                                    {mentors.slice(0, 3).map((mentor) =>
                                        getAvatarSrc(mentor.avatar) ? (
                                            <img
                                                key={mentor.id}
                                                src={getAvatarSrc(mentor.avatar) ?? undefined}
                                                alt={mentor.name}
                                                className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm dark:border-zinc-900"
                                            />
                                        ) : (
                                            <div
                                                key={mentor.id}
                                                className="bg-primary flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-sm dark:border-zinc-900"
                                            >
                                                {getInitials(mentor.name)}
                                            </div>
                                        ),
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {mentors.length === 1
                                            ? t('bootcamp.detail.mentorSingle')
                                            : t('bootcamp.detail.mentorMultiple', { count: mentors.length })}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {mentors
                                            .slice(0, 2)
                                            .map((mentor) => mentor.name)
                                            .join(', ')}
                                        {mentors.length > 2
                                            ? t('bootcamp.detail.andOtherMentors', { count: mentors.length - 2 })
                                            : ''}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Info Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="grid grid-cols-2 gap-3 md:gap-4"
                        >
                            {/* Start Date */}
                            <div className="flex items-center gap-2 rounded-lg border-2 bg-white p-3 shadow-sm md:gap-3 md:rounded-xl md:p-4 dark:border-zinc-700 dark:bg-zinc-900">
                                <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg md:h-12 md:w-12">
                                    <Calendar className="text-primary h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-[10px] font-medium text-gray-500 md:text-xs dark:text-gray-400">{t('bootcamp.detail.startDate')}</p>
                                    <p className="truncate text-xs font-bold text-gray-900 md:text-sm lg:text-base dark:text-white">
                                        {new Date(bootcamp.start_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* End Date */}
                            <div className="flex items-center gap-2 rounded-lg border-2 bg-white p-3 shadow-sm md:gap-3 md:rounded-xl md:p-4 dark:border-zinc-700 dark:bg-zinc-900">
                                <div className="bg-secondary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg md:h-12 md:w-12">
                                    <Clock className="text-secondary h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-[10px] font-medium text-gray-500 md:text-xs dark:text-gray-400">{t('bootcamp.detail.endDate')}</p>
                                    <p className="truncate text-xs font-bold text-gray-900 md:text-sm lg:text-base dark:text-white">
                                        {new Date(bootcamp.end_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="flex flex-wrap gap-3 md:gap-4"
                        >
                            <a href="#register">
                                <Button size="default" className="px-6 text-sm font-bold shadow-lg md:px-8 md:text-base">
                                    <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                                    {t('bootcamp.detail.btnRegisterNow')}
                                </Button>
                            </a>
                            <a href="https://wa.me/+6281252683108" target="_blank" rel="noopener noreferrer">
                                <Button size="default" variant="outline" className="px-6 text-sm font-bold md:px-8 md:text-base">
                                    {t('bootcamp.detail.btnContactUs')}
                                </Button>
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
