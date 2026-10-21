import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
    const { t } = useTranslation('user');

    const advantageSection = [
        {
            title: t('course.hero.adv1Title', 'Pembelajaran Bertahap & Terstruktur.'),
            description: t('course.hero.adv1Desc', 'Materi disampaikan dalam beberapa sesi untuk memastikan pemahaman peserta terbentuk secara mendalam.'),
        },
        {
            title: t('course.hero.adv2Title', 'Akses Fleksibel'),
            description: t('course.hero.adv2Desc', 'Kelas dapat diikuti dari mana saja melalui platform online yang mudah digunakan.'),
        },
        {
            title: t('course.hero.adv3Title', 'Interaktif & Praktis.'),
            description: t('course.hero.adv3Desc', 'Terdapat diskusi, tanya jawab, dan latihan sehingga peserta aktif dan tidak hanya menerima teori.'),
        },
        {
            title: t('course.hero.adv4Title', 'Didukung Materi Pembelajaran.'),
            description: t('course.hero.adv4Desc', 'Pembelajaran berbasis praktik dan studi kasus nyata sehingga skill yang diperoleh siap diterapkan di dunia kerja.Peserta mendapatkan modul dan bahan pendukung untuk memperkuat pemahaman di setiap pertemuan.'),
        },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="relative mx-auto max-w-7xl px-4 py-6 sm:py-8 md:py-12">
                <div className="relative overflow-hidden rounded-xl p-4 sm:p-6 md:p-16 h-[250px] sm:h-[350px] md:h-[450px] flex items-center justify-center" style={{
                    background: 'linear-gradient(to right, #1976D3 10%, #1976D3 50%, #a0a0a0 95%)'
                }}>
                    <div className="relative z-10 text-white">
                        <h1 className="mb-3 sm:mb-4 md:mb-6 text-xl sm:text-3xl md:text-5xl font-bold leading-tight font-literata">
                            {t('course.hero.title', 'Online Class Program')}
                        </h1>
                        <p className="w-full sm:w-3/4 md:w-1/2 text-[10px] sm:text-xs md:text-base">
                            {t('course.hero.description', 'Online Class Program merupakan kelas daring yang dilaksanakan dalam beberapa sesi dan pertemuan terstruktur untuk memantapkan pemahaman peserta. Didukung materi terarah, diskusi interaktif, dan praktik aplikatif, program ini dirancang agar peserta benar-benar menguasai materi secara bertahap dan berkelanjutan.')}
                        </p>
                    </div>

                    {/* Background Image */}
                    <div className="absolute right-0 top-0 h-full w-full">
                        <img
                            src="assets/images/hero-bootcamp.png"
                            alt="Bootcamp"
                            className="h-full w-full object-cover"
                            style={{
                                maskImage: 'linear-gradient(to right, transparent 0%, black 100%)',
                                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 100%)'
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Advantages Section */}
            <section className="relative mx-auto max-w-7xl px-4 md:py-12">
                <div className="grid gap-12 lg:grid-cols-3 items-center">
                    {/* Left Content */}
                    <div className="lg:col-span-2 flex flex-col justify-center h-full gap-8">
                        <h2 className="md:mb-8 text-2xl sm:text-3xl md:text-4xl font-bold text-primary font-literata w-full sm:w-2/3">
                            {t('course.hero.advantagesTitle', 'Online Class Profesional Talenta Academy')}
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            {advantageSection.map((item) => (
                                <div key={item.title} className="flex gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-blue-500">
                                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white text-base sm:text-lg md:text-xl">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="relative flex justify-center lg:justify-end cols-span-1">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-primary rounded-tr-[60px] rounded-bl-[60px] sm:rounded-tr-[90px] sm:rounded-bl-[90px] md:rounded-tr-[125px] md:rounded-bl-[125px] h-[180px] w-[180px] sm:h-[280px] sm:w-[280px] md:h-[380px] md:w-[380px]" style={{
                            boxShadow: 'inset 0 5px 15px rgba(0, 0, 0, 0.3), inset 0 -5px 15px rgba(0, 0, 0, 0.3)'
                        }}></div>
                        <div className="relative">
                            {/* Main image */}
                            <img
                                src="assets/images/hero-course.png"
                                alt=""
                                className="relative z-10 h-[200px] w-full max-w-xs sm:h-[300px] sm:max-w-sm md:h-[400px] md:max-w-md rounded-3xl object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
