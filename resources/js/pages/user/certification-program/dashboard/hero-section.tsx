import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
    const { t } = useTranslation('user');

    return (
        <section className=" dark:via-background dark:to-background relative overflow-hidden bg-gradient-to-b py-24 text-gray-900 dark:text-white">
            <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-3">
                {/* Animated Certificate Illustration */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="col-span-1 hidden lg:flex items-center justify-center"
                >
                    <div className="relative h-[500px] w-full">
                        {/* Certificate 1 */}
                        <motion.div
                            initial={{ y: 50, rotate: 0, opacity: 0 }}
                            animate={{ y: 0, rotate: -3, opacity: 1 }}
                            transition={{
                                duration: 0.8,
                                delay: 0.3,
                                ease: 'easeOut',
                            }}
                            className="absolute top-8 left-4 z-10 w-80 rounded-2xl border-4 border-primary/30 bg-white p-6 shadow-2xl dark:bg-zinc-900"
                        >
                            <div className="mb-4 flex items-center justify-center">
                                <Award className="h-12 w-12 text-primary" />
                            </div>
                            <div className="mb-2 h-2 w-3/4 rounded bg-gray-200 dark:bg-zinc-700"></div>
                            <div className="mb-4 h-2 w-1/2 rounded bg-gray-200 dark:bg-zinc-700"></div>
                            <div className="mb-2 h-8 w-full rounded bg-primary/20"></div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="h-2 w-1/4 rounded bg-gray-200 dark:bg-zinc-700"></div>
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                            </div>
                        </motion.div>

                        {/* Certificate 2 */}
                        <motion.div
                            initial={{ y: 50, rotate: 0, opacity: 0 }}
                            animate={{ y: 0, rotate: 2, opacity: 1 }}
                            transition={{
                                duration: 0.8,
                                delay: 0.5,
                                ease: 'easeOut',
                            }}
                            className="absolute top-24 left-8 z-20 w-80 rounded-2xl border-4 border-secondary/30 bg-white p-6 shadow-2xl dark:bg-zinc-900"
                        >
                            <div className="mb-4 flex items-center justify-center">
                                <Sparkles className="h-12 w-12 text-secondary" />
                            </div>
                            <div className="mb-2 h-2 w-2/3 rounded bg-gray-200 dark:bg-zinc-700"></div>
                            <div className="mb-4 h-2 w-1/3 rounded bg-gray-200 dark:bg-zinc-700"></div>
                            <div className="mb-2 h-8 w-full rounded bg-secondary/20"></div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="h-2 w-1/3 rounded bg-gray-200 dark:bg-zinc-700"></div>
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                            </div>
                        </motion.div>

                        {/* Certificate 3 */}
                        <motion.div
                            initial={{ y: 50, rotate: 0, opacity: 0 }}
                            animate={{ y: 0, rotate: -2, opacity: 1 }}
                            transition={{
                                duration: 0.8,
                                delay: 0.7,
                                ease: 'easeOut',
                            }}
                            className="absolute top-40 left-12 z-30 w-80 rounded-2xl border-4 border-green-500/30 bg-white p-6 shadow-2xl dark:bg-zinc-900"
                        >
                            <div className="mb-4 flex items-center justify-center">
                                <Award className="h-12 w-12 text-green-600" />
                            </div>
                            <div className="mb-2 h-2 w-3/5 rounded bg-gray-200 dark:bg-zinc-700"></div>
                            <div className="mb-4 h-2 w-2/5 rounded bg-gray-200 dark:bg-zinc-700"></div>
                            <div className="mb-2 h-8 w-full rounded bg-green-500/20"></div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="h-2 w-1/4 rounded bg-gray-200 dark:bg-zinc-700"></div>
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Content */}
                <div className="col-span-2">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 border border-secondary px-4 py-1.5 text-sm font-semibold text-secondary shadow-sm"
                    >
                        <Award className="h-4 w-4" />
                        {t('certificationProgram.dashboard.hero.badge', 'Program Sertifikasi')}
                    </motion.span>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
                    >
                        <span className="text-primary">{t('certificationProgram.dashboard.hero.titlePart1', 'Dapatkan Sertifikasi')}</span>{' '}
                        {t('certificationProgram.dashboard.hero.and', 'dan')} <br />
                        <span className="text-secondary">{t('certificationProgram.dashboard.hero.titlePart2', 'Tingkatkan Kredibilitas')}</span>{' '}
                        {t('certificationProgram.dashboard.hero.titlePart3', 'Profesional Anda')}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mb-8 max-w-2xl text-lg text-gray-700 dark:text-gray-300"
                    >
                        {t(
                            'certificationProgram.dashboard.hero.description',
                            'Program sertifikasi yang dirancang bersama pakar industri terkemuka untuk meningkatkan kompetensi dan membuka peluang karir lebih luas.'
                        )}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-wrap gap-4"
                    >
                        <a href="#certification-programs">
                            <Button size="lg" className="px-8 text-base font-bold shadow-lg">
                                <Award className="mr-2 h-5 w-5" />
                                {t('certificationProgram.dashboard.hero.btnViewPrograms', 'Lihat Program Sertifikasi')}
                            </Button>
                        </a>
                        <a href="https://wa.me/+6281252683108" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="lg" className="border-primary px-8 text-base font-bold text-primary hover:bg-primary/10">
                                {t('certificationProgram.dashboard.hero.btnFreeConsultation', 'Konsultasi Gratis')}
                            </Button>
                        </a>
                    </motion.div>

                    {/* Stats/Benefits */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3"
                    >
                        <div className="flex items-center gap-3 rounded-xl border bg-white/70 p-4 shadow-sm backdrop-blur-md dark:bg-zinc-900/60">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {t('certificationProgram.dashboard.hero.statPartner', 'Partner')}
                                </p>
                                <p className="text-lg font-bold">
                                    {t('certificationProgram.dashboard.hero.statPartnerVal', 'Terpercaya')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border bg-white/70 p-4 shadow-sm backdrop-blur-md dark:bg-zinc-900/60">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {t('certificationProgram.dashboard.hero.statCert', 'Sertifikat')}
                                </p>
                                <p className="text-lg font-bold">
                                    {t('certificationProgram.dashboard.hero.statCertVal', 'Profesional')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border bg-white/70 p-4 shadow-sm backdrop-blur-md dark:bg-zinc-900/60">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {t('certificationProgram.dashboard.hero.statCareer', 'Peluang Karir')}
                                </p>
                                <p className="text-lg font-bold">
                                    {t('certificationProgram.dashboard.hero.statCareerVal', 'Lebih Luas')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
