import { BadgeCheck, Sparkles, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Webinar {
    benefits?: string | null;
}

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

export default function BenefitsSection({ webinar }: { webinar: Webinar }) {
    const { t } = useTranslation('user');
    const benefitList = parseList(webinar.benefits);

    return (
        <section className="relative mx-auto w-full max-w-7xl px-4 pt-6 pb-12">
            {/* Background Decoration */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-green-500/10 blur-3xl" />
                <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
            </div>

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
                            {t('webinar.detail.exclusiveBenefits')}
                        </span>
                    </div>
                    <h2 className="mb-4 text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                        {t('webinar.detail.whatYouWillGet')}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                        {t('webinar.detail.whatYouWillGetSubtitle')}
                    </p>
                </motion.div>

                {/* Benefits Grid */}
                {benefitList.length > 0 ? (
                    <>
                        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                            {benefitList.map((benefit, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    className="group relative overflow-hidden rounded-2xl border-2 bg-white dark:bg-zinc-900 dark:border-zinc-700 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40"
                                >
                                    {/* Decorative gradient */}
                                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />

                                    {/* Content */}
                                    <div className="relative flex items-start gap-4">
                                        {/* Icon Container */}
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg transition-transform group-hover:scale-110">
                                            <BadgeCheck className="h-6 w-6 text-white" />
                                        </div>

                                        {/* Benefit Text */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-relaxed">
                                                {benefit}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Corner Badge */}
                                    <div className="absolute top-4 right-4">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                                            <Gift className="h-3 w-3 text-primary" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-zinc-700 py-16"
                    >
                        <Gift className="h-16 w-16 text-gray-400" />
                        <p className="text-center text-gray-500 dark:text-gray-400">
                            {t('webinar.detail.benefitsEmpty')}
                        </p>
                    </motion.div>
                )}
            </div>
        </section>
    );
}