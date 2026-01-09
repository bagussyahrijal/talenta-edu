import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

const advantageSection = [
    {
        title: 'Hemat Hingga 70%',
        description: 'Dapatkan harga spesial untuk akses ke banyak program sekaligus dalam satu paket bundling.',
    },
    {
        title: 'Akses Banyak Program',
        description: 'Satu kali beli, langsung dapat akses ke beberapa program pilihan sesuai kebutuhanmu.',
    },
    {
        title: 'Sertifikat & Akses Selamanya',
        description: 'Setiap program dalam bundling memberikan sertifikat dan akses materi tanpa batas waktu.',
    },
    {
        title: 'Fleksibel & Praktis',
        description: 'Belajar bisa diatur sesuai waktu luangmu, tanpa batasan waktu dan tempat.',
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
                            Bundling Program
                        </h1>
                        <p className="w-1/2">
                            Paket Bundling Talenta Academy adalah solusi hemat untuk upgrade skill. Dapatkan akses ke banyak program sekaligus, sertifikat, dan akses materi selamanya hanya dengan satu kali pembelian. Pilih bundling yang sesuai kebutuhanmu dan mulai belajar lebih banyak dengan harga lebih hemat!
                        </p>
                    </div>
                    {/* Background Image */}
                    <div className="absolute right-0 top-0 h-full w-full hidden md:block">
                        <img
                            src="/assets/images/hero-bootcamp.png"
                            alt="Bundling"
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
                        <h2 className="mb-8 text-4xl font-bold text-primary font-literata md:text-4xl w-1/2">
                            Keunggulan Paket Bundling Talenta Academy
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
                        {/* Blue blob background */}
                        <div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-primary rounded-tr-[125px] rounded-bl-[125px] h-[380px] w-[380px]"
                            style={{
                                boxShadow: 'inset 0 5px 15px rgba(0, 0, 0, 0.3), inset 0 -5px 15px rgba(0, 0, 0, 0.3)'
                            }}
                        ></div>
                        <div className="relative">
                            {/* Main image */}
                            <img
                                src="/assets/images/hero-bundle.png"
                                alt="Bundling Illustration"
                                className="relative z-10 h-[440px] w-full max-w-md rounded-3xl object-cover object-right"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
