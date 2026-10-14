import { BookOpen, CheckCircle, Gift, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface CertificationProgram {
    description?: string | null;
    benefits?: string | null;
}

interface ListItem {
    text: string;
    html?: string;
}

function parseList(items?: string | null): ListItem[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => {
        const html = li.replace(/<\/?li>/g, '').trim();
        const text = html.replace(/<[^>]*>/g, '').trim();
        return { text, html };
    });
}

export default function InformationSection({ program }: { program: CertificationProgram }) {
    const { t } = useTranslation('user');
    if (!program.description && !program.benefits) return null;

    const benefitList = parseList(program.benefits);

    return (
        <section className="relative mx-auto w-full max-w-7xl px-4 pt-6 pb-12">
            {/* Background Decoration */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute right-10 bottom-20 h-64 w-64 rounded-full bg-green-500/10 blur-3xl" />
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
                        <Sparkles className="text-primary h-6 w-6" />
                        <span className="bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-semibold">
                            {t('certificationProgram.detail.information.badge', 'Informasi Program')}
                        </span>
                    </div>
                    <h2 className="mb-4 text-3xl font-extrabold text-gray-900 md:text-4xl dark:text-white">
                        {t('certificationProgram.detail.information.title', 'Kenali Lebih Dalam')}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                        {t('certificationProgram.detail.information.subtitle', 'Pelajari detail program dan temukan berbagai manfaat yang akan kamu peroleh')}
                    </p>
                </motion.div>

                {/* Content Grid */}
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* About Card */}
                    {program.description && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative overflow-hidden rounded-2xl border-2 bg-white p-8 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                        >
                            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-3xl" />

                            <div className="relative mb-6 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {t('certificationProgram.detail.information.aboutTitle', 'Tentang Program')}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('certificationProgram.detail.information.aboutSubtitle', 'Deskripsi singkat')}
                                    </p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                                    <div dangerouslySetInnerHTML={{ __html: program.description }} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Benefits Card */}
                    {program.benefits && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className={`relative overflow-hidden rounded-2xl border-2 bg-white p-8 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 ${!program.description ? 'lg:col-span-2 max-w-3xl mx-auto' : ''}`}
                        >
                            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 blur-3xl" />

                            <div className="relative mb-6 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                                    <Gift className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {t('certificationProgram.detail.information.benefitsTitle', 'Manfaat yang Didapatkan')}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('certificationProgram.detail.information.benefitsSubtitle', 'Investasi yang menguntungkan')}
                                    </p>
                                </div>
                            </div>

                            <ul className="relative space-y-4">
                                {benefitList.length > 0 ? (
                                    benefitList.map((benefit, idx) => (
                                        <motion.li
                                            key={idx}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                                            className="flex items-start gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-900/20"
                                        >
                                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {benefit.html ? <span dangerouslySetInnerHTML={{ __html: benefit.html }} /> : benefit.text}
                                            </span>
                                        </motion.li>
                                    ))
                                ) : (
                                    <div className="prose max-w-none text-gray-700 dark:text-gray-300">
                                        <div dangerouslySetInnerHTML={{ __html: program.benefits }} />
                                    </div>
                                )}
                            </ul>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
