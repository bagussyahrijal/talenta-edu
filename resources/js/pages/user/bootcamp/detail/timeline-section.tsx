import { BookOpen, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Bootcamp {
    curriculum?: string | null;
}

function parseCurriculum(curriculum?: string | null): string[] {
    if (!curriculum) return [];
    const matches = curriculum.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

export default function TimelineSection({ bootcamp }: { bootcamp: Bootcamp }) {
    const { t } = useTranslation('user');
    const curriculumList = parseCurriculum(bootcamp.curriculum);

    return (
        <section className="relative mx-auto w-full max-w-7xl px-4 pt-6 py-12">
            {/* Background Decoration */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
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
                            {t('bootcamp.detail.curriculumBadge')}
                        </span>
                    </div>
                    <h2 className="mb-4 text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                        {t('bootcamp.detail.curriculumTitle')}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                        {t('bootcamp.detail.curriculumSubtitle')}
                    </p>
                </motion.div>

                {/* Curriculum Grid */}
                {curriculumList.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {curriculumList.map((curriculum, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.05 }}
                                className="group relative overflow-hidden rounded-xl border-2 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 dark:bg-zinc-900 dark:border-zinc-700"
                            >
                                {/* Number Badge */}
                                <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                    {idx + 1}
                                </div>

                                {/* Icon */}
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-lg">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                                    {curriculum}
                                </h3>

                                {/* Check Icon */}
                                <div className="mt-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="font-medium">{t('bootcamp.detail.curriculumIncluded')}</span>
                                </div>

                                {/* Decorative gradient */}
                                <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center justify-center gap-4 py-12 rounded-2xl border-2 border-dashed border-gray-300 dark:border-zinc-700"
                    >
                        <BookOpen className="h-16 w-16 text-gray-400" />
                        <p className="text-center text-gray-500 dark:text-gray-400">
                            {t('bootcamp.detail.curriculumEmpty')}
                        </p>
                    </motion.div>
                )}

                
            </div>
        </section>
    );
}