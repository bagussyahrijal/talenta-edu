import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const advantageSection = [
    {
        title: 'Pembelajaran Bertahap & Terstruktur.',
        description: 'Materi disampaikan dalam beberapa sesi untuk memastikan pemahaman peserta terbentuk secara mendalam.',
    },
    {
        title: 'Akses Fleksibel',
        description: 'LKelas dapat diikuti dari mana saja melalui platform online yang mudah digunakan.'
    },
    {
        title: 'Interaktif & Praktis.',
        description: 'Terdapat diskusi, tanya jawab, dan latihan sehingga peserta aktif dan tidak hanya menerima teori.'
    },
    {
        title: 'Didukung Materi Pembelajaran.',
        description: 'Pembelajaran berbasis praktik dan studi kasus nyata sehingga skill yang diperoleh siap diterapkan di dunia kerja.Peserta mendapatkan modul dan bahan pendukung untuk memperkuat pemahaman di setiap pertemuan.'
    }
];

export default function HeroSection() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative mx-auto max-w-7xl px-4 py-12">
                <div className="relative overflow-hidden rounded-xl p-8 md:p-16 h-[450px] flex items-center justify-center" style={{
                    background: 'linear-gradient(to right, #1976D3 10%, #1976D3 50%, #a0a0a0 95%)'
                }}>
                    <div className="relative z-10 text-white">
                        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-5xl font-literata">
                            Online Class Program
                        </h1>
                        <p className="w-1/2">
                            Online Class Program merupakan kelas daring yang dilaksanakan dalam beberapa sesi dan pertemuan terstruktur untuk memantapkan pemahaman peserta. Didukung materi terarah, diskusi interaktif, dan praktik aplikatif, program ini dirancang agar peserta benar-benar menguasai materi secara bertahap dan berkelanjutan.                        </p>
                    </div>

                    {/* Background Image */}
                    <div className="absolute right-0 top-0 h-full w-full hidden md:block">
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
            <section className="relative mx-auto max-w-7xl px-4 py-12">
                <div className="grid gap-12 lg:grid-cols-3 items-center">
                    {/* Left Content */}
                    <div className='lg:col-span-2 flex flex-col justify-center h-full gap-8'>
                        <h2 className="mb-8 text-4xl font-bold text-primary font-literata md:text-4xl w-2/3">
                            Online Class Profesional
                            Talenta Academy
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            {advantageSection.map((item) => (
                                <div key={item.title} className="flex gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                                            <CheckCircle2 className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="relative flex justify-center lg:justify-end cols-span-1">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-primary rounded-tr-[125px] rounded-bl-[125px] h-[380px] w-[380px]" style={{
                            boxShadow: 'inset 0 5px 15px rgba(0, 0, 0, 0.3), inset 0 -5px 15px rgba(0, 0, 0, 0.3)'
                        }}></div>
                        <div className="relative">
                            {/* Blue blob background */}
                            {/* Main image */}
                            <img
                                src="assets/images/hero-course.png"
                                alt=""
                                className="relative z-10 h-[400px] w-full max-w-md rounded-3xl object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
