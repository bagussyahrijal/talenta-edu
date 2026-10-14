import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import HeroSection from './hero-section';
import LegalitasSection from './legalitas-section';
import MentorSection from './mentor-section';

type Category = {
    id: string;
    name: string;
};

interface PartnershipProduct {
    id: string;
    title: string;
    short_description: string | null;
    thumbnail: string | null;
    slug: string;
    strikethrough_price: number;
    price: number;
    registration_deadline: string;
    duration_days: number;
    schedule_days: string[];
    category: Category;
}

interface PartnershipProductPageProps {
    categories: Category[];
    partnershipProducts: PartnershipProduct[];
}

export default function PartnershipProductPage({ categories, partnershipProducts }: PartnershipProductPageProps) {
    const { t } = useTranslation('user');

    return (
        <UserLayout>
            <Head title={t('about.dashboard.headTitle')} />

            <HeroSection />
            <LegalitasSection />
            <MentorSection />
            {/* <PartnershipProductSection categories={categories} partnershipProducts={partnershipProducts} /> */}
        </UserLayout>
    );
}
