import { motion } from 'framer-motion';
import { Info, Gift, Sparkles, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Bundle {
    description?: string | null;
    benefits?: string | null;
}

interface BenefitsSectionProps {
    bundle: Bundle;
}

export default function BenefitsSection({ bundle }: BenefitsSectionProps) {
    const { t } = useTranslation('user');

    if (!bundle.description && !bundle.benefits) {
        return null;
    }

    // Parse benefits if it's HTML list
    const parseBenefits = (benefitsHtml: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(benefitsHtml, 'text/html');
        const listItems = doc.querySelectorAll('li');
        return Array.from(listItems).map((li) => li.textContent || '');
    };

    const benefitsList = bundle.benefits ? parseBenefits(bundle.benefits) : [];

    return (
        <section className="relative mx-auto w-full max-w-7xl px-4 py-12">
            {/* Decorative Background */}
            <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Description Card */}
                {bundle.description && (
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="h-full"
                    >
                        <div className="group relative h-full overflow-hidden rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-blue-100/50 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-blue-800 dark:from-blue-950/30 dark:via-gray-900 dark:to-blue-900/20">
                            {/* Icon Header */}
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                    <Info className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {t('bundling.detail.about.aboutTitle', 'Tentang Bundle')}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('bundling.detail.about.aboutDesc', 'Informasi lengkap paket ini')}
                                    </p>
                                </div>
                            </div>

                            {/* Description Content */}
                            <div className="relative">
                                <div className="absolute -left-4 top-0 h-full w-1 rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
                                <div className="prose prose-lg max-w-none dark:prose-invert pl-4">
                                    <p className="whitespace-pre-line leading-relaxed text-gray-700 dark:text-gray-300">
                                        {bundle.description}
                                    </p>
                                </div>
                            </div>

                            {/* Decorative Corner */}
                            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl transition-all duration-500 group-hover:bg-blue-400/20" />
                            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl transition-all duration-500 group-hover:bg-blue-500/20" />
                        </div>
                    </motion.div>
                )}

                {/* Benefits Card */}
                {bundle.benefits && (
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="h-full"
                    >
                        <div className="group relative h-full overflow-hidden rounded-3xl border-2 border-green-200 bg-gradient-to-br from-green-50/80 via-white to-green-100/50 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-green-800 dark:from-green-950/30 dark:via-gray-900 dark:to-green-900/20">
                            {/* Icon Header */}
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                                    <Gift className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {t('bundling.detail.about.benefitsTitle', 'Keuntungan')}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('bundling.detail.about.benefitsDesc', 'Yang Anda dapatkan')}
                                    </p>
                                </div>
                            </div>

                            {/* Benefits List */}
                            {benefitsList.length > 0 ? (
                                <div className="space-y-3">
                                    {benefitsList.map((benefit, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                                            className="group/item flex items-start gap-3 rounded-xl bg-white/60 p-4 transition-all duration-200 hover:bg-white hover:shadow-md dark:bg-gray-800/60 dark:hover:bg-gray-800"
                                        >
                                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow">
                                                <Check className="h-4 w-4 text-white" strokeWidth={3} />
                                            </div>
                                            <p className="flex-1 text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                                                {benefit}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div
                                    className="prose prose-sm max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: bundle.benefits }}
                                />
                            )}

                            {/* Decorative Corner */}
                            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-green-400/10 blur-2xl transition-all duration-500 group-hover:bg-green-400/20" />
                            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-green-500/10 blur-2xl transition-all duration-500 group-hover:bg-green-500/20" />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Full Width Version if only one exists */}
            {(bundle.description && !bundle.benefits) || (!bundle.description && bundle.benefits) ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-8"
                >
                    <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-white to-secondary/5 p-8 shadow-xl dark:from-primary/10 dark:via-gray-900 dark:to-secondary/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                                <Sparkles className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {bundle.description ? t('bundling.detail.about.aboutTitle', 'Tentang Bundle') : t('bundling.detail.about.benefitsTitle', 'Keuntungan')}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {bundle.description ? t('bundling.detail.about.aboutDesc', 'Informasi lengkap paket ini') : t('bundling.detail.about.benefitsDesc', 'Yang Anda dapatkan')}
                                </p>
                            </div>
                        </div>

                        {bundle.description && (
                            <div className="prose prose-lg max-w-none dark:prose-invert">
                                <p className="whitespace-pre-line leading-relaxed text-gray-700 dark:text-gray-300">
                                    {bundle.description}
                                </p>
                            </div>
                        )}

                        {bundle.benefits && benefitsList.length > 0 && (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {benefitsList.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="flex items-start gap-3 rounded-xl bg-white/60 p-4 dark:bg-gray-800/60"
                                    >
                                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow">
                                            <Check className="h-4 w-4 text-white" strokeWidth={3} />
                                        </div>
                                        <p className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{benefit}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : null}
        </section>
    );
}