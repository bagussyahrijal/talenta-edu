import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
    const { t } = useTranslation('user');

    return (
        <section className="relative overflow-hidden py-24 text-gray-900 dark:text-white">
            <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-3">
                {/* Illustration */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="col-span-1 hidden lg:flex items-center justify-center"
                >
                    <div className="relative flex justify-center">
                        <img
                            src="assets/images/character-4.png"
                            alt="Ilustrasi Bootcamp"
                            className="h-[420px] w-auto rounded-3xl object-contain"
                            draggable={false}
                        />
                    </div>
                </motion.div>
                {/* Content */}
                <div className="col-span-2 flex flex-col items-start justify-center">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary shadow-sm"
                    >
                        <Sparkles className="h-4 w-4 text-primary" />
                        {t('course.hero.badge')}
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
                    >
                        <span className="text-primary">{t('course.hero.mainTitle1')}</span>
                        {t('course.hero.mainTitle2')}<br />
                        <span className="text-secondary">{t('course.hero.mainTitle3')}</span>
                        {t('course.hero.mainTitle4')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mb-8 max-w-2xl text-lg text-gray-700 dark:text-gray-300"
                    >
                        {t('course.hero.description')}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-wrap gap-4"
                    >
                        <a href="#course">
                            <Button size="lg" className="px-8 text-base font-bold shadow-lg">
                                {t('course.hero.btnCourses')}
                            </Button>
                        </a>
                        <a href="https://wa.me/+6281252683108" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="lg" className="px-8 text-base font-bold border-primary text-primary">
                                {t('course.hero.btnConsult')}
                            </Button>
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}