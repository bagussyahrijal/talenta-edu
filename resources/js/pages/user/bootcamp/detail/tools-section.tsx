import { Wrench, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Bootcamp {
    tools?: { name: string; description?: string | null; icon: string | null }[];
}

export default function ToolsSection({ bootcamp }: { bootcamp: Bootcamp }) {
    const { t } = useTranslation('user');

    return (
        <section className="relative mx-auto w-full max-w-7xl px-4 pt-6 pb-12" id="tools">
            {/* Background Decoration */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
                <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
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
                            {t('bootcamp.detail.toolsBadge')}
                        </span>
                    </div>
                    <h2 className="mb-4 text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                        {t('bootcamp.detail.toolsTitle')}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                        {t('bootcamp.detail.toolsSubtitle')}
                    </p>
                </motion.div>

                {/* Tools Grid */}
                {bootcamp.tools && bootcamp.tools.length > 0 ? (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {bootcamp.tools.map((tool, idx) => (
                                <motion.div
                                    key={tool.name}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    className="group relative overflow-hidden rounded-2xl border-2 bg-white dark:bg-zinc-900 dark:border-zinc-700 p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/40"
                                >
                                    {/* Decorative gradient */}
                                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />

                                    {/* Content */}
                                    <div className="relative flex flex-col items-center text-center">
                                        {/* Icon Container */}
                                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-700 p-3 shadow-md transition-transform group-hover:scale-110">
                                            <img
                                                src={tool.icon ? `/storage/${tool.icon}` : '/assets/images/placeholder.png'}
                                                alt={tool.name}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>

                                        {/* Tool Name */}
                                        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                                            {tool.name}
                                        </h3>

                                        {/* Description */}
                                        {tool.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {tool.description}
                                            </p>
                                        )}

                                        {/* Check Badge */}
                                        <div className="mt-4 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="font-medium">{t('bootcamp.detail.industryStandard')}</span>
                                        </div>
                                    </div>

                                    {/* Corner Badge */}
                                    <div className="absolute top-3 right-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                                            <Wrench className="h-3 w-3 text-primary" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Bottom Info Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="mt-12 rounded-2xl border-2 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 dark:border-zinc-700 p-8"
                        >
                            <div className="grid gap-6 md:grid-cols-3 text-center">
                                <div>
                                    <p className="text-3xl font-bold text-primary">{bootcamp.tools.length}</p>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('bootcamp.detail.totalTools')}</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-secondary">100%</p>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('bootcamp.detail.industryReady')}</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-green-600">{t('bootcamp.detail.handsOn')}</p>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('bootcamp.detail.practicalLearning')}</p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-zinc-700 py-16"
                    >
                        <Wrench className="h-16 w-16 text-gray-400" />
                        <p className="text-center text-gray-500 dark:text-gray-400">
                            {t('bootcamp.detail.toolsEmpty')}
                        </p>
                    </motion.div>
                )}
            </div>
        </section>
    );
}