import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import BundlingSection from './bundling-section';
import HeroSection from './hero-section';

interface BundleItem {
    id: string;
    bundleable_type: string;
    bundleable: {
        id: string;
        title: string;
        slug: string;
    };
    price: number;
}

interface Bundle {
    id: string;
    title: string;
    slug: string;
    short_description: string | null;
    thumbnail: string | null;
    price: number;
    strikethrough_price: number;
    registration_deadline: string | null;
    batch?: string | null;
    status: 'draft' | 'published' | 'archived';
    bundle_items: BundleItem[];
    bundle_items_count: number;
}

interface BundlingDashboardProps {
    bundles: Bundle[];
}

export default function BundlingDashboard({ bundles }: BundlingDashboardProps) {
    const { t } = useTranslation('user');

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10">
            {/* Global Decorative Background */}
            <div className="pointer-events-none absolute -top-32 -left-32 z-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -top-32 -right-0 z-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-0  -left-32 z-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-0 -right-0 z-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />
          
        <UserLayout>
            <Head title={t('bundling.dashboard.headTitle', 'Paket Bundling - Hemat Lebih Banyak')} />

            <HeroSection />
            <BundlingSection bundles={bundles} />
        </UserLayout>
        </div>
    );
}
