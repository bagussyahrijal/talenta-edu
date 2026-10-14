import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { enUS, id } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Calendar, Package, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Bundle {
    title: string;
    thumbnail?: string | null;
    short_description?: string | null;
    registration_deadline?: string | null;
    batch?: string | null;
    bundle_items_count: number;
}

interface HeroSectionProps {
    bundle: Bundle;
    discountPercentage: number;
}

export default function HeroSection({ bundle, discountPercentage }: HeroSectionProps) {
    const { t, i18n } = useTranslation('user');
    const deadlineDate = bundle.registration_deadline ? new Date(bundle.registration_deadline) : null;
    const dateLocale = i18n.language === 'en' ? enUS : id;

    return (
        <section className="dark:via-primary/10 relative bg-gradient-to-b py-20 text-gray-900 dark:text-white">
            <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-3">
                {/* Left Column - Content */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="col-span-2">
                    {/* Badges */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-4 flex flex-wrap items-center gap-3"
                    >
                        <span className="text-primary border-primary bg-background mb-4 inline-flex w-fit items-center gap-2 rounded-full border bg-gradient-to-t from-[#D9E5FF] to-white px-4 py-1 text-sm font-medium shadow-xs">
                            <Sparkles size={14} className="mr-1" />
                            {t('bundling.detail.hero.badge', 'Paket Bundling')}
                        </span>
                        {bundle.batch && (
                            <span className="text-secondary border-secondary bg-background mb-4 inline-flex w-fit items-center gap-2 rounded-full border bg-gradient-to-t from-[#FED6AD] to-white px-4 py-1 text-sm font-medium shadow-xs">
                                <Calendar size={14} className="mr-1" />
                                {bundle.batch.toLowerCase().includes('batch') ? bundle.batch : t('bundling.detail.hero.batch', { batch: bundle.batch, defaultValue: `Batch ${bundle.batch}` })}
                            </span>
                        )}
                        {discountPercentage > 0 && (
                            <span className="text-secondary border-secondary bg-background mb-4 inline-flex w-fit items-center rounded-full border bg-gradient-to-t from-[#FED6AD] to-white px-3 py-1 text-sm font-medium shadow-xs hover:text-[#FF925B]">
                                {t('bundling.detail.hero.savePercent', { percent: discountPercentage, defaultValue: `Hemat ${discountPercentage}%` })}
                            </span>
                        )}
                        <span className="text-primary border-primary bg-background mb-4 inline-flex w-fit items-center gap-2 rounded-full border bg-gradient-to-t from-[#D9E5FF] to-white px-4 py-1 text-sm font-medium shadow-xs">
                            <Package size={14} className="mr-1" />
                            {t('bundling.detail.hero.programsCount', { count: bundle.bundle_items_count, defaultValue: `${bundle.bundle_items_count} Program` })}
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mb-4 text-4xl leading-tight font-bold sm:text-5xl"
                    >
                        {bundle.title}
                    </motion.h1>

                    {/* Description */}
                    {bundle.short_description && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mb-4 text-lg text-gray-600 dark:text-gray-400"
                        >
                            {bundle.short_description}
                        </motion.p>
                    )}

                    {/* Deadline Badge */}
                    {deadlineDate && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                        >
                            {t('bundling.detail.hero.registerBefore', { date: format(deadlineDate, 'dd MMMM yyyy, HH:mm', { locale: dateLocale }), defaultValue: `⏰ Daftar sebelum: ${format(deadlineDate, 'dd MMMM yyyy, HH:mm', { locale: dateLocale })} WIB` })}
                        </motion.div>
                    )}

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex flex-wrap gap-4"
                    >
                        <a href="#register">
                            <Button size="lg">
                                <Package className="mr-2 h-4 w-4" />
                                {t('bundling.detail.hero.btnRegisterNow', 'Daftar Sekarang')}
                            </Button>
                        </a>
                        <a href="https://wa.me/+6281252683108" target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline">
                                {t('bundling.detail.hero.btnContactUs', 'Hubungi Kami')}
                            </Button>
                        </a>
                    </motion.div>
                </motion.div>

                {/* Right Column - Image */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="col-span-1 hidden lg:block"
                >
                    <img
                        src={bundle.thumbnail ? `/storage/${bundle.thumbnail}` : '/assets/images/placeholder.png'}
                        alt={bundle.title}
                        className="rounded-xl shadow-lg"
                    />
                </motion.div>
            </div>
        </section>
    );
}
