import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, useCarousel } from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Testimonial {
    name: string;
    role: string;
    image: string;
    text: string;
}

const testimonials: Testimonial[] = [
    {
        name: 'Renandia Ridhaning Pangesti',
        role: 'Mahasiswa',
        image: '/assets/images/Renandia-Ridhaning-Pangesti.jpg',
        text: 'Sebagai mahasiswa, mengikuti Brevet AB di Talenta sangat membantu saya memahami perpajakan secara aplikatif, tidak hanya teori. Materinya terstruktur, relevan, dan meningkatkan kesiapan saya menghadapi dunia kerja.',
    },
    {
        name: 'Silva Pardah Aulia',
        role: 'Peserta Brevet Pajak AB',
        image: '/assets/images/Silva-Pardah-Aulia.jpg',
        text: 'Kelas Brevet Pajak AB memberikan pengalaman belajar yang komprehensif. Saya merasa lebih percaya diri dalam mengerjakan administrasi dan pelaporan pajak setelah mengikuti pelatihan ini serta banyak mendapatkan pelajaran yang baru wawasan dan teman diskusi yang menyenangkan',
    },
    {
        name: 'Jonathan Dorman Christobal',
        role: 'Peserta Brevet AB',
        image: '/assets/images/Jonathan-Dorman.jpg',
        text: 'Kesan saya selama mengikuti Brevet AB di Talenta sangat positif. Para pengajar mampu menyampaikan materi dengan jelas, menggunakan bahasa yang mudah dipahami, sehingga saya dapat memahami konsep perpajakan, baik untuk Wajib Pajak Orang Pribadi maupun Badan, dengan lebih baik dan mendalam',
    },
    {
        name: 'St. Nur Adibah',
        role: 'Peserta Kelas Software Akuntansi',
        image: '/assets/images/St.-Nur-Adibah.jpg',
        text: 'Instruktur komunikatif dan sabar. Setelah ikut kelas software akuntansi, input transaksi jadi lebih rapi dan cepat. Pelatihan aplikatif dan sesuai kebutuhan kerja sehari-hari. Sangat direkomendasikan bagi siapa pun yang ingin meningkatkan skill software akuntansi.',
    },
    {
        name: 'Elia Kurniawati',
        role: 'Peserta Akuntansi Intermediate',
        image: '/assets/images/Elia-Kurniawati.jpg',
        text: 'Pelatihan Akuntansi Intermediate ini sangat membantu meningkatkan pemahaman saya dalam penyusunan laporan keuangan dan pelaporan perpajakan. Materi disampaikan secara runtut dan mudah dipahami, dilengkapi dengan praktik Excel yang sangat aplikatif. Ilmunya langsung bisa diterapkan dalam pekerjaan sehari-hari.',
    },
    {
        name: 'Nelissa Lenjau',
        role: 'Peserta Pelatihan Jago Audit',
        image: '/assets/images/Nelissa-Lenjau.jpg',
        text: 'Pelatihan Jago Audit sangat membantu saya memahami proses audit secara menyeluruh, baik audit internal maupun audit eksternal. Materi disampaikan secara sistematis mulai dari perencanaan, pelaksanaan, hingga pelaporan audit. Pembahasan Audit ATLAS juga sangat aplikatif dan sesuai dengan praktik yang digunakan saat ini.',
    },
    {
        name: 'Merta Kurniawan',
        role: 'Praktisi Akuntansi',
        image: '/assets/images/Merta-Kurniawan.jpg',
        text: 'Materi yang diberikan sangat lengkap dan mudah diikuti, baik untuk pemula maupun yang sudah bekerja di bidang akuntansi. Setelah mengikuti pelatihan, pekerjaan pencatatan transaksi dan pembuatan laporan keuangan menjadi lebih cepat, rapi, dan terstruktur.',
    },
    {
        name: 'Ryco Tarnuwardhana Putra, S.AP.',
        role: 'Profesional',
        image: '/assets/images/Ryco-Tarnuwardhana-Putra.jpg',
        text: 'Pelatihan yang komprehensif dan aplikatif. Tidak hanya teori, tetapi juga banyak praktik langsung yang relevan dengan kondisi di lapangan. Setelah mengikuti kelas ini, saya menjadi lebih percaya diri dalam menyusun laporan keuangan dan melakukan pelaporan pajak.',
    },
    {
        name: 'Amanda Putri',
        role: 'Peserta Kelas Akuntansi',
        image: '/assets/images/Amanda-Putri.jpg',
        text: 'Mengikuti kelas akuntansi jasa, dagang, dan manufaktur sangat membantu saya memahami pencatatan dan penyusunan laporan keuangan secara menyeluruh. Materi disampaikan jelas, aplikatif, dan relevan dengan praktik di dunia kerja.',
    },
    {
        name: 'Nisa Aulia Firnanda',
        role: 'Peserta Sertifikasi CFTR',
        image: '/assets/images/Nisa-Aulia-Firnanda.jpeg',
        text: 'Pelatihan Sertifikasi CFTR sangat membantu saya memahami ketentuan dan praktik perpajakan secara komprehensif. Materi disampaikan jelas, terstruktur, dan sesuai dengan kebutuhan sertifikasi.',
    },
    {
        name: 'Fransisko Caserio Daur',
        role: 'Peserta Brevet AB',
        image: '/assets/images/Fransisko-Caserio-Daur.jpeg',
        text: 'Secara keseluruhan, kesan setelah mengikuti Brevet AB di Talenta ini adalah sangat positif dan memberdayakan. Saya merasa lebih siap dan kompeten dalam menghadapi berbagai aspek perpajakan, serta mendapatkan nilai tambah signifikan untuk perkembangan karier dan pemahaman pribadi.',
    },
];

function TestimonyCard({ testimonial, isCenter }: { testimonial: Testimonial; isCenter: boolean }) {
    if (!testimonial) return null;

    return (
        <div className={`flex flex-col rounded-3xl bg-white ${isCenter ? 'p-8 shadow-xl' : 'p-6 shadow-md'} h-full`}>
            <div className={`${isCenter ? 'mb-6' : 'mb-4'} flex items-start gap-4`}>
                <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className={`${isCenter ? 'h-16 w-16 ring-4 ring-blue-100' : 'h-14 w-14'} shrink-0 rounded-full object-cover`}
                    onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`;
                    }}
                />
                <div>
                    <h3 className={`${isCenter ? 'text-xl' : 'text-base'} font-bold text-gray-900`}>{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
            </div>
            <p className={`overflow-hidden ${isCenter ? 'text-base' : 'text-sm'} leading-relaxed text-gray-700 line-clamp-9`}>{testimonial.text}</p>
        </div>
    );
}

function TestimonyCarousel() {
    const { index, setIndex, itemsCount } = useCarousel();

    const getPrevIndex = () => {
        const totalItems = itemsCount || testimonials.length;
        return (index - 1 + totalItems) % totalItems;
    };

    const getNextIndex = () => {
        const totalItems = itemsCount || testimonials.length;
        return (index + 1) % totalItems;
    };

    // Pastikan index valid
    const validIndex = Math.min(Math.max(index, 0), testimonials.length - 1);

    return (
        <div className="relative">
            <div className="flex items-center justify-center gap-2 md:gap-6">
                {/* Left Arrow */}
                <Button
                    onClick={() => setIndex(getPrevIndex())}
                    variant="ghost"
                    size="icon"
                    className="z-10 h-12 w-12 shrink-0 rounded-full bg-blue-600 text-white shadow-lg transition-all hover:scale-110 hover:bg-blue-700 hover:text-white"
                >
                    <ChevronLeft className="h-7 w-7" />
                </Button>

                {/* Testimonial Cards */}
                <div className="relative w-full max-w-6xl overflow-hidden">
                    <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6 py-8 md:py-16">
                        {/* Left card (blurred) */}
                        <div className="hidden md:block blur-[2px] opacity-50 h-[400px]">
                            <TestimonyCard testimonial={testimonials[getPrevIndex()]} isCenter={false} />
                        </div>
                        {/* Center card (active) */}
                        <div className="h-[400px] scale-105">
                            <TestimonyCard testimonial={testimonials[validIndex]} isCenter={true} />
                        </div>
                        {/* Right card (blurred) */}
                        <div className="hidden md:block blur-[2px] opacity-50 h-[400px]">
                            <TestimonyCard testimonial={testimonials[getNextIndex()]} isCenter={false} />
                        </div>
                    </div>
                </div>

                {/* Right Arrow */}
                <Button
                    onClick={() => setIndex(getNextIndex())}
                    variant="ghost"
                    size="icon"
                    className="z-10 h-12 w-12 shrink-0 rounded-full bg-blue-600 text-white shadow-lg transition-all hover:scale-110 hover:bg-blue-700 hover:text-white"
                >
                    <ChevronRight className="h-7 w-7" />
                </Button>
            </div>
        </div>
    );
}

export default function TestimonySection() {
    const [carouselIndex, setCarouselIndex] = useState(0);

    return (
        <section className="w-full py-8">
            <div className="mx-auto w-full max-w-7xl px-4">
                {/* Header */}
                <div className="mb-10 md:mb-16 text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">What our costumers say about us</p>
                    <h2 className="text-3xl md:text-5xl font-bold font-literata text-primary">Testimonials</h2>
                </div>

                {/* Carousel */}
                <Carousel index={carouselIndex} onIndexChange={setCarouselIndex} disableDrag={false} className="w-full">
                    <CarouselContent className="ml-0">
                        {testimonials.map((testimonial, idx) => (
                            <CarouselItem key={idx} className="pl-0">
                                <div className="hidden">
                                    <TestimonyCard testimonial={testimonial} isCenter={false} />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <TestimonyCarousel />
                </Carousel>
            </div>
        </section>
    );
}
