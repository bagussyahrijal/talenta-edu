import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import BootcampSection from './bootcamp-section';
import FeatureSection from './feature-section';
import HeroSection from './hero-section';

type Category = {
    id: string;
    name: string;
};

interface Bootcamp {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    slug: string;
    strikethrough_price: number;
    price: number;
    start_date: string;
    end_date: string;
    category: Category;
    user: {
        id: string;
        name: string;
        bio?: string;
        avatar?: string | null;
    };
}

interface BootcampProps {
    categories: Category[];
    bootcamps: Bootcamp[];
    myBootcampIds: string[];
}

export default function Bootcamp({ categories, bootcamps, myBootcampIds }: BootcampProps) {
    const { t } = useTranslation('user');

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10">
            {/* Global Decorative Background */}
            <div className="pointer-events-none absolute -top-32 -left-32 z-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -top-32 -right-0 z-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-0  -left-32 z-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-0 -right-0 z-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />
            
        <UserLayout>
            <Head title={t('bootcamp.title')} />
            <HeroSection />
            {/* <FeatureSection /> */}
            <BootcampSection categories={categories} bootcamps={bootcamps} myBootcampIds={myBootcampIds} />
        </UserLayout>
        </div>
    );
}
