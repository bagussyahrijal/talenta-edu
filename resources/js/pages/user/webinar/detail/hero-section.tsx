import { Button } from '@/components/ui/button';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Webinar {
    title: string;
    thumbnail?: string | null;
    description?: string | null;
    start_time: string;
    end_time: string;
}

export default function HeroSection({ webinar }: { webinar: Webinar }) {
    const { t, i18n } = useTranslation('user');

    return (
        <section className="relative overflow-hidden dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4 py-12 md:py-16 lg:py-20">
            <div className="relative z-10 mx-auto px-4 max-w-7xl">
                <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-center">
                    {/* Right Column - Image (order-first on mobile) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="relative order-first lg:order-last"
                    >
                        <div className="relative overflow-hidden rounded-xl md:rounded-2xl border-2 shadow-xl md:shadow-2xl dark:border-zinc-700">
                            <img
                                src={webinar.thumbnail ? `/storage/${webinar.thumbnail}` : '/assets/images/placeholder.png'}
                                alt={webinar.title}
                                className="aspect-video md:aspect-[4/3] w-full object-cover"
                            />
                            
                            {/* Overlay Badge */}
                            <div className="absolute top-3 right-3 md:top-4 md:right-4">
                                <div className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 shadow-lg">
                                    <p className="text-xs md:text-sm font-bold text-primary">🎯 {t('webinar.detail.liveWebinar')}</p>
                                </div>
                            </div>

                            {/* Bottom Gradient Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-white">
                                    <div>
                                        <p className="text-xs md:text-sm font-bold">
                                           {t('webinar.detail.durationHours', {
                                               hours: Math.ceil((new Date(webinar.end_time).getTime() - new Date(webinar.start_time).getTime()) / (1000 * 60 * 60)),
                                           })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                                        <span className="text-xs md:text-sm font-medium">{t('webinar.detail.interactiveSession')}</span>
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
                        className="space-y-4 md:space-y-6 order-last lg:order-first"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-white dark:bg-zinc-900 px-3 md:px-4 py-1.5 md:py-2 shadow-lg"
                        >
                            <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                            <span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                                {t('webinar.detail.interactiveBadge')}
                            </span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight"
                        >
                            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                                {webinar.title}
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-sm md:text-base lg:text-lg leading-relaxed text-gray-600 dark:text-gray-300"
                        >
                            {webinar.description || t('webinar.detail.heroDefaultDesc')}
                        </motion.p>

                        {/* Info Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="grid grid-cols-2 gap-3 md:gap-4"
                        >
                            {/* Start Time */}
                            <div className="flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl border-2 bg-white dark:bg-zinc-900 dark:border-zinc-700 p-3 md:p-4 shadow-sm">
                                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                                    <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{t('webinar.detail.date')}</p>
                                    <p className="font-bold text-xs md:text-sm lg:text-base text-gray-900 dark:text-white truncate">
                                        {new Date(webinar.start_time).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Time Range */}
                            <div className="flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl border-2 bg-white dark:bg-zinc-900 dark:border-zinc-700 p-3 md:p-4 shadow-sm">
                                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-secondary/10 flex-shrink-0">
                                    <Clock className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{t('webinar.detail.time')}</p>
                                    <p className="font-bold text-xs md:text-sm lg:text-base text-gray-900 dark:text-white truncate">
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
                                        })} {t('webinar.detail.timeZoneWib')}
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
                                <Button size="default" className="px-6 md:px-8 text-sm md:text-base font-bold shadow-lg">
                                    <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                                    {t('webinar.detail.btnRegisterNow')}
                                </Button>
                            </a>
                            <a href="https://wa.me/+6281252683108" target="_blank" rel="noopener noreferrer">
                                <Button size="default" variant="outline" className="px-6 md:px-8 text-sm md:text-base font-bold">
                                    {t('webinar.detail.btnContactUs')}
                                </Button>
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}