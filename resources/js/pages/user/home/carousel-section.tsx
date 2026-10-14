import { Carousel, CarouselContent, CarouselIndicator, CarouselItem, CarouselNavigation } from '@/components/ui/carousel';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CarouselSection() {
    const { t } = useTranslation('home');
    const [index, setIndex] = useState(0);
    const TOTAL_ITEMS = 4;

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % TOTAL_ITEMS);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative w-full pt-4">
            <Carousel index={index} onIndexChange={setIndex} disableDrag>
                <CarouselContent>
                    <CarouselItem className="px-4">
                        <a href="#program-kami">
                            <img
                                src="/assets/images/carousel-1.webp"
                                alt={t('carousel.slide', { number: 1, defaultValue: 'Slide 1' })}
                                loading="lazy"
                                className="mx-auto w-full max-w-7xl rounded-xl object-cover shadow-lg"
                            />
                        </a>
                    </CarouselItem>
                    <CarouselItem className="px-4">
                        <a href="#program-kami">
                            <img
                                src="/assets/images/carousel-1.webp"
                                alt={t('carousel.slide', { number: 2, defaultValue: 'Slide 2' })}
                                loading="lazy"
                                className="mx-auto w-full max-w-7xl rounded-xl object-cover shadow-lg"
                            />
                        </a>
                    </CarouselItem>
                    <CarouselItem className="px-4">
                        <a href="#program-kami">
                            <img
                                src="/assets/images/carousel-1.webp"
                                alt={t('carousel.slide', { number: 3, defaultValue: 'Slide 3' })}
                                loading="lazy"
                                className="mx-auto w-full max-w-7xl rounded-xl object-cover shadow-lg"
                            />
                        </a>
                    </CarouselItem>
                    <CarouselItem className="px-4">
                        <a href="#program-kami">
                            <img
                                src="/assets/images/carousel-1.webp"
                                alt={t('carousel.slide', { number: 4, defaultValue: 'Slide 4' })}
                                loading="lazy"
                                className="mx-auto w-full max-w-7xl rounded-xl object-cover shadow-lg"
                            />
                        </a>
                    </CarouselItem>
                </CarouselContent>
                <CarouselNavigation />
                <div className="mx-auto max-w-7xl px-4">
                    <CarouselIndicator />
                </div>
            </Carousel>
        </section>
    );
}
