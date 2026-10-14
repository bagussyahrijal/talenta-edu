import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import FeatureSection from './feature-section';
import HeroSection from './hero-section';
import WebinarSection from './webinar-section';

type Category = {
    id: string;
    name: string;
};

interface Webinar {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    slug: string;
    strikethrough_price: number;
    price: number;
    start_time: string;
    category: Category;
    user: any; // Replace 'any' with the actual user type if available
}

interface WebinarProps {
    categories: Category[];
    webinars: Webinar[];
    myWebinarIds: string[];
}

export default function Webinar({ categories, webinars, myWebinarIds }: WebinarProps) {
    const { t } = useTranslation('user');

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10">
            {/* Global Decorative Background */}
            <div className="pointer-events-none absolute -top-32 -left-32 z-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -top-32 -right-0 z-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-0  -left-32 z-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-0 -right-0 z-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />
         
        <UserLayout>
            <Head title={t('webinar.title')} />

            <HeroSection />
            {/* <FeatureSection /> */}
            <WebinarSection categories={categories} webinars={webinars} myWebinarIds={myWebinarIds} />
        </UserLayout>
        </div>
    );
}
