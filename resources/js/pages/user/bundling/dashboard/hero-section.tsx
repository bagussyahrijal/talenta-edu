import { Button } from '@/components/ui/button';
import { Check, Package, Sparkles, Layers, Infinity, Percent } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
    const { t } = useTranslation('user');

    const benefits = [
        t('bundling.dashboard.hero.benefit1', 'Hemat hingga 70% dari harga normal'),
        t('bundling.dashboard.hero.benefit2', 'Akses ke beberapa program sekaligus'),
        t('bundling.dashboard.hero.benefit3', 'Sertifikat untuk semua program'),
        t('bundling.dashboard.hero.benefit4', 'Pembelajaran fleksibel'),
    ];

    return (
        <section className="relative overflow-hidden py-24 text-black dark:text-white">
            <div className="relative z-10 mx-auto max-w-7xl px-4">
                <div className="mx-auto max-w-4xl text-center">
                    {/* Badge headline */}
                    <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary shadow-sm">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {t('bundling.dashboard.hero.badge', 'Penawaran Spesial Paket Bundling')}
                    </span>

                    {/* Headline */}
                    <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                        <span className="text-primary">{t('bundling.dashboard.hero.titlePart1', 'Belajar Lebih Banyak')}</span>,<br />
                        <span className="text-secondary">{t('bundling.dashboard.hero.titlePart2', 'Bayar Lebih Hemat!')}</span> 🎉
                    </h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mx-auto mb-10 max-w-2xl text-lg text-gray-700 dark:text-gray-300"
                    >
                        {t('bundling.dashboard.hero.desc', 'Dapatkan akses ke beberapa program pembelajaran sekaligus dengan harga spesial. Tingkatkan skill-mu dengan paket bundling yang dirancang khusus untuk percepatan karirmu!')}
                    </motion.p>

                    {/* Benefits Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={benefit}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                                className="flex items-center gap-3 rounded-2xl border-2 border-primary/10 bg-white/70 p-5 shadow-md backdrop-blur-md dark:bg-zinc-900/60"
                            >
                                <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                                    <Check size={16} />
                                </div>
                                <p className="text-left text-base font-medium text-gray-800 dark:text-gray-200">{benefit}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <a href="#bundles">
                            <Button size="lg" className="gap-2 px-8 text-base font-bold shadow-lg">
                                <Layers size={20} />
                                {t('bundling.dashboard.hero.btnViewBundles', 'Lihat Paket Bundling')}
                            </Button>
                        </a>
                        <a href="https://wa.me/+6281252683108" target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline" className="gap-2 px-8 text-base font-bold border-primary text-primary hover:bg-primary/10">
                                {t('bundling.dashboard.hero.btnFreeConsultation', 'Konsultasi Gratis')}
                            </Button>
                        </a>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="mt-16 flex flex-wrap justify-center gap-8 text-center"
                    >
                        <div className="flex flex-col items-center rounded-2xl bg-primary/10 px-8 py-6 shadow">
                            <Percent className="mb-2 h-8 w-8 text-primary" />
                            <p className="text-3xl font-bold text-primary">70%</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('bundling.dashboard.hero.statSave', 'Hemat Lebih Banyak')}</p>
                        </div>
                        <div className="flex flex-col items-center rounded-2xl bg-secondary/10 px-8 py-6 shadow">
                            <Layers className="mb-2 h-8 w-8 text-secondary" />
                            <p className="text-3xl font-bold text-secondary">2+</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('bundling.dashboard.hero.statPrograms', 'Program dalam 1 Paket')}</p>
                        </div>
                        <div className="flex flex-col items-center rounded-2xl bg-green-100/40 px-8 py-6 shadow">
                            <Infinity className="mb-2 h-8 w-8 text-green-600" />
                            <p className="text-3xl font-bold text-green-600">100%</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('bundling.dashboard.hero.statLifetime', 'Akses Selamanya')}</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}   