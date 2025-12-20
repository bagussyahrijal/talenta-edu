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
        name: 'Billie Joe',
        role: 'Enterpreneur',
        image: '/assets/default-avatar.jpg',
        text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet.',
    },
    {
        name: 'Sarah Wijaya',
        role: 'UI/UX Designer',
        image: '/assets/default-avatar.jpg',
        text: 'Materi bootcamp UI/UX di Aksademy sangat komprehensif. Sekarang saya sudah bekerja di startup unicorn. Terima kasih Aksademy! Program mentoring yang diberikan sangat membantu saya memahami design thinking dan user research. Portofolio yang saya kembangkan selama bootcamp menjadi nilai plus saat interview.',
    },
    {
        name: 'Budi Santoso',
        role: 'Full Stack Developer',
        image: '/assets/default-avatar.jpg',
        text: 'Dari nol sampai bisa bikin aplikasi web kompleks. Mentor di Aksademy sangat sabar dan supportif. Worth it banget! Materi yang diajarkan sangat terstruktur dan project-based learning membuat saya cepat memahami konsep programming. Sekarang saya bekerja di perusahaan teknologi ternama.',
    },
    {
        name: 'Maya Sari',
        role: 'Product Manager',
        image: '/assets/default-avatar.jpg',
        text: 'Webinar product management-nya eye opening banget! Sekarang saya lebih percaya diri memimpin tim produk di perusahaan. Insight yang diberikan sangat aplikatif dan langsung bisa diterapkan di pekerjaan sehari-hari.',
    },
    {
        name: 'Denny Pratama',
        role: 'DevOps Engineer',
        image: '/assets/default-avatar.jpg',
        text: 'Kelas DevOps-nya sangat detail dan praktis. Dari basic Docker sampai Kubernetes semua dijelaskan dengan baik. Hands-on project yang diberikan membuat pemahaman saya semakin mendalam tentang infrastructure automation.',
    },
];

function TestimonyCard({ testimonial, isCenter }: { testimonial: Testimonial; isCenter: boolean }) {
    if (!testimonial) return null;

    return (
        <div className={`flex h-[400px] flex-col rounded-3xl bg-white ${isCenter ? 'p-8 shadow-xl' : 'p-6 shadow-md'}`}>
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
            <div className="flex items-center justify-center gap-6">
                {/* Left Arrow */}
                <Button
                    onClick={() => setIndex(getPrevIndex())}
                    variant="ghost"
                    size="icon"
                    className="z-10 h-13 w-13 shrink-0 rounded-full bg-blue-600 text-white shadow-lg transition-all hover:scale-110 hover:bg-blue-700 hover:text-white"
                >
                    <ChevronLeft className="h-7 w-7" />
                </Button>

                {/* Testimonial Cards */}
                <div className="relative w-full max-w-6xl overflow-hidden">
                    <div className="grid grid-cols-3 gap-6 py-16">
                        {/* Left card (blurred) */}
                        <div className="blur-[2px] opacity-50">
                            <TestimonyCard testimonial={testimonials[getPrevIndex()]} isCenter={false} />
                        </div>

                        {/* Center card (active) */}
                        <div className="scale-105">
                            <TestimonyCard testimonial={testimonials[validIndex]} isCenter={true} />
                        </div>

                        {/* Right card (blurred) */}
                        <div className="blur-[2px] opacity-50">
                            <TestimonyCard testimonial={testimonials[getNextIndex()]} isCenter={false} />
                        </div>
                    </div>
                </div>

                {/* Right Arrow */}
                <Button
                    onClick={() => setIndex(getNextIndex())}
                    variant="ghost"
                    size="icon"
                    className="z-10 h-13 w-13 shrink-0 rounded-full bg-blue-600 text-white shadow-lg transition-all hover:scale-110 hover:bg-blue-700 hover:text-white"
                >
                    <ChevronRight className="" />
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
                <div className="mb-16 text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">What our costumers say about us</p>
                    <h2 className="text-5xl font-bold font-literata text-primary">Testimonials</h2>
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
