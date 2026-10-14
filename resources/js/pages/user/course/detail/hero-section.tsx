import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, X, Award, UserCheck, BarChart3, Clock, BookOpen, Star, Users, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Course {
    title: string;
    short_description?: string | null;
    thumbnail?: string | null;
    level: 'beginner' | 'intermediate' | 'advanced';
    created_at: string;
    updated_at: string;
}

export default function HeroSection({ course }: { course: Course }) {
    const { t, i18n } = useTranslation('user');
    const courseCertificate = 'yes' as 'yes' | 'no';
    const courseConsultation = 'yes' as 'yes' | 'no';

    // Level label & color
    const levelMap = {
        beginner: { 
            label: t('course.catalog.beginner'), 
            color: 'from-green-500 to-emerald-600', 
            textColor: 'text-green-600', 
            bgColor: 'bg-green-50 dark:bg-green-900/20', 
            borderColor: 'border-green-200 dark:border-green-800' 
        },
        intermediate: { 
            label: t('course.catalog.intermediate'), 
            color: 'from-yellow-500 to-orange-600', 
            textColor: 'text-yellow-600', 
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', 
            borderColor: 'border-yellow-200 dark:border-yellow-800' 
        },
        advanced: { 
            label: t('course.catalog.advanced'), 
            color: 'from-red-500 to-rose-600', 
            textColor: 'text-red-600', 
            bgColor: 'bg-red-50 dark:bg-red-900/20', 
            borderColor: 'border-red-200 dark:border-red-800' 
        },
    };

    return (
        <section className="relative overflow-hidden px-4 py-8 md:py-12 lg:py-16 xl:py-20 text-gray-900 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 dark:text-white">
            {/* Animated Background Elements */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-10 md:top-20 left-5 md:left-10 h-48 w-48 md:h-72 md:w-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />
                <div className="absolute bottom-10 md:bottom-20 right-5 md:right-10 h-48 w-48 md:h-72 md:w-72 rounded-full bg-secondary/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            <div className="relative z-10 mx-auto max-w-7xl">
                <div className="flex flex-col lg:grid lg:gap-8 xl:gap-10 lg:grid-cols-5">
                    {/* Thumbnail - Show first on mobile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="lg:col-span-2 lg:order-last mb-6 lg:mb-0"
                    >
                        <div className="relative lg:sticky lg:top-24 overflow-hidden rounded-xl md:rounded-2xl border-2 shadow-xl md:shadow-2xl dark:border-zinc-700">
                            <img
                                src={course.thumbnail ? `/storage/${course.thumbnail}` : '/assets/images/placeholder.png'}
                                alt={course.title}
                                className="aspect-video w-full object-cover"
                            />
                            
                            {/* Info Overlay at Bottom */}
                            <div className="bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 p-3 md:p-4 lg:p-6">
                                <div className="flex items-center justify-between gap-2 text-white">
                                    <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                                        <span className="text-[10px] md:text-xs lg:text-sm font-medium truncate">
                                            {t('course.detail.releaseLabel', {
                                                date: new Date(course.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                                    month: 'short',
                                                    year: 'numeric',
                                                }),
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                                        <BarChart3 className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                                        <span className="text-[10px] md:text-xs lg:text-sm font-medium truncate">
                                            {t('course.detail.levelLabel', { level: levelMap[course.level].label })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Info - Show second on mobile */}
                    <div className="lg:col-span-3 lg:order-first">
                        {/* Meta Badges */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="mb-3 md:mb-4 lg:mb-6 flex flex-wrap gap-2 md:gap-3"
                        >
                            <div className="flex items-center gap-1.5 md:gap-2 rounded-full border-2 bg-white px-2.5 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 text-[10px] md:text-xs lg:text-sm font-semibold shadow-sm dark:bg-zinc-900 dark:border-zinc-700">
                                <BookOpen className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-primary" />
                                <span>{t('course.title')}</span>
                            </div>
                        </motion.div>

                        {/* Title with Gradient */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="mb-3 md:mb-4 lg:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight"
                        >
                            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                                {course.title}
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="mb-4 md:mb-6 lg:mb-8 text-sm md:text-base lg:text-lg leading-relaxed text-gray-600 dark:text-gray-300"
                        >
                            {course.short_description}
                        </motion.p>

                        {/* Stats Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4"
                        >
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 bg-white p-2 sm:p-3 md:p-4 shadow-sm dark:bg-zinc-900 dark:border-zinc-700">
                                <div className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                                </div>
                                <div className="min-w-0 text-center sm:text-left">
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                                        {t('course.detail.lastUpdatedLabel')}
                                    </p>
                                    <p className="font-bold text-xs sm:text-sm md:text-base text-gray-900 dark:text-white truncate">
                                        {new Date(course.updated_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 bg-white p-2 sm:p-3 md:p-4 shadow-sm dark:bg-zinc-900 dark:border-zinc-700">
                                <div className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex-shrink-0">
                                    <Star className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-600" />
                                </div>
                                <div className="min-w-0 text-center sm:text-left">
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {t('course.detail.rating')}
                                    </p>
                                    <p className="font-bold text-xs sm:text-sm md:text-base text-gray-900 dark:text-white">4.8/5.0</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 bg-white p-2 sm:p-3 md:p-4 shadow-sm dark:bg-zinc-900 dark:border-zinc-700">
                                <div className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                                    <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
                                </div>
                                <div className="min-w-0 text-center sm:text-left">
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {t('course.detail.students')}
                                    </p>
                                    <p className="font-bold text-xs sm:text-sm md:text-base text-gray-900 dark:text-white">1,200+</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}