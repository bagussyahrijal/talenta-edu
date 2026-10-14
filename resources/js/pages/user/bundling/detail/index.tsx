import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import BenefitsSection from './benefits-section';
import BundleItemsSection from './bundle-items-section';
import HeroSection from './hero-section';
import RegisterSection from './register-section';
import RelatedBundles from './related-bundles';

interface Product {
    id: string;
    title: string;
    slug: string;
    price: number;
}

interface BundleItem {
    id: string;
    bundleable_type: string;
    bundleable_id: string;
    bundleable: Product;
    price: number;
    order: number;
}

interface GroupedItems {
    courses: BundleItem[];
    bootcamps: BundleItem[];
    webinars: BundleItem[];
}

interface Bundle {
    id: string;
    title: string;
    slug: string;
    short_description?: string | null;
    description?: string | null;
    benefits?: string | null;
    thumbnail?: string | null;
    batch?: string | null;
    price: number;
    strikethrough_price: number;
    registration_deadline?: string | null;
    registration_url: string;
    status: string;
    bundle_items: BundleItem[];
    bundle_items_count: number;
}

interface BundleDetailProps {
    bundle: Bundle;
    groupedItems: GroupedItems;
    totalOriginalPrice: number;
    discountAmount: number;
    discountPercentage: number;
    relatedBundles: Bundle[];
    hasOwnedItems: boolean;
    ownedItems: Array<{
        id: string;
        title: string;
        type: string;
    }>;
}

export default function BundleDetail({
    bundle,
    groupedItems,
    totalOriginalPrice,
    discountAmount,
    discountPercentage,
    relatedBundles,
    hasOwnedItems,
    ownedItems,
}: BundleDetailProps) {
    const { t } = useTranslation('user');

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10">
            {/* Global Decorative Background */}
            <div className="pointer-events-none absolute -top-32 -left-32 z-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -top-32 -right-0 z-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-0  -left-32 z-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-0 -right-0 z-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />
          
        <UserLayout>
            <Head title={t('bundling.detail.headTitle', { title: bundle.title, defaultValue: `${bundle.title} - Paket Bundling` })} />

            <HeroSection bundle={bundle} discountPercentage={discountPercentage} />
            <BundleItemsSection bundle={bundle} groupedItems={groupedItems} totalOriginalPrice={totalOriginalPrice} />
            <BenefitsSection bundle={bundle} />
            <RegisterSection
                bundle={bundle}
                totalOriginalPrice={totalOriginalPrice}
                discountAmount={discountAmount}
                discountPercentage={discountPercentage}
                hasOwnedItems={hasOwnedItems}
                ownedItems={ownedItems}
            />
            <RelatedBundles relatedBundles={relatedBundles} />
        </UserLayout>
        </div>
    );
}
