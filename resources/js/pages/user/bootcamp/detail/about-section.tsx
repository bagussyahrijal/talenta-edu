import { BookOpen, Briefcase, Users, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function AboutSection() {
    const { t } = useTranslation('user');

    const features = [
        {
            icon: BookOpen,
            title: t('bootcamp.detail.curriculumModern'),
            description: t('bootcamp.detail.curriculumModernDesc'),
            color: 'from-blue-500 to-indigo-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            icon: Briefcase,
            title: t('bootcamp.detail.careerReady'),
            description: t('bootcamp.detail.careerReadyDesc'),
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            icon: Users,
            title: t('bootcamp.detail.fullSupport'),
            description: t('bootcamp.detail.fullSupportDesc'),
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        },
    ];

    const benefits = [
        'Akses ke materi pembelajaran selamanya',
        'Sertifikat resmi setelah menyelesaikan bootcamp',
        'Konsultasi langsung dengan mentor ahli',
        'Networking dengan sesama peserta dan alumni',
        'Job placement assistance setelah lulus',
        'Update materi gratis sesuai perkembangan industri',
    ];

    return (
        <section className="relative mx-auto w-full max-w-7xl px-4 pt-8">
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
                        {t('bootcamp.detail.whyChooseUsBadge')}
                    </span>
                </div>
                <h2 className="mb-4 text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                    {t('bootcamp.detail.whyChooseUsTitle')}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                    {t('bootcamp.detail.whyChooseUsSubtitle')}
                </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="mb-16 grid gap-6 md:grid-cols-3">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                        className="group relative overflow-hidden rounded-2xl border-2 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/40 dark:bg-zinc-900 dark:border-zinc-700"
                    >
                        {/* Decorative gradient */}
                        <div className={`absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br ${feature.color} opacity-10 blur-3xl transition-opacity group-hover:opacity-20`} />
                        
                        {/* Icon */}
                        <div className={`relative mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                            <feature.icon className="h-8 w-8 text-white" />
                        </div>

                        {/* Content */}
                        <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                            {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>

        </section>
    );
}