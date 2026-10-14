import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { rupiahFormatter } from '@/lib/utils';
import { motion } from 'framer-motion';
import { BookText, ExternalLink, MonitorPlay, Presentation, Sparkles, Check, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Product {
    id: string;
    title: string;
    slug: string;
    price: number;
    thumbnail?: string | null;
}

interface BundleItem {
    id: string;
    bundleable_type: string;
    bundleable_id: string;
    bundleable: Product;
    price: number;
}

interface GroupedItems {
    courses: BundleItem[];
    bootcamps: BundleItem[];
    webinars: BundleItem[];
}

interface Bundle {
    bundle_items_count: number;
    price: number;
}

interface BundleItemsSectionProps {
    bundle: Bundle;
    groupedItems: GroupedItems;
    totalOriginalPrice: number;
}

export default function BundleItemsSection({ bundle, groupedItems, totalOriginalPrice }: BundleItemsSectionProps) {
    const { t } = useTranslation('user');

    const getProductUrl = (type: string, slug: string) => {
        switch (type) {
            case 'course':
                return route('course.detail', slug);
            case 'bootcamp':
                return route('bootcamp.detail', slug);
            case 'webinar':
                return route('webinar.detail', slug);
            default:
                return '#';
        }
    };

    const calculateSavings = () => {
        const savings = totalOriginalPrice - bundle.price;
        const percentage = Math.round((savings / totalOriginalPrice) * 100);
        return { savings, percentage };
    };

    const { savings, percentage } = calculateSavings();

    const renderItems = (items: BundleItem[], type: 'course' | 'bootcamp' | 'webinar', index: number) => {
        if (items.length === 0) return null;

        const config = {
            course: {
                icon: BookText,
                label: t('bundling.detail.items.courseLabel', 'Kelas Online'),
                badgeClass: 'bg-gradient-to-r from-blue-500 to-blue-600',
                iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
                borderLeft: 'border-l-blue-500',
                iconColor: 'text-blue-500',
            },
            bootcamp: {
                icon: Presentation,
                label: t('bundling.detail.items.bootcampLabel', 'Bootcamp'),
                badgeClass: 'bg-gradient-to-r from-purple-500 to-purple-600',
                iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
                borderLeft: 'border-l-purple-500',
                iconColor: 'text-purple-500',
            },
            webinar: {
                icon: MonitorPlay,
                label: t('bundling.detail.items.webinarLabel', 'Webinar'),
                badgeClass: 'bg-gradient-to-r from-green-500 to-green-600',
                iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
                borderLeft: 'border-l-green-500',
                iconColor: 'text-green-500',
            },
        };

        const { icon: Icon, label, badgeClass, iconBg, borderLeft, iconColor } = config[type];

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="mb-6 md:mb-8"
            >
                {/* Section Header */}
                <div className="mb-4 md:mb-6 flex items-center gap-3 md:gap-4">
                    <div className={`rounded-lg md:rounded-xl ${iconBg} p-2 md:p-3 shadow-lg`}>
                        <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{label}</h3>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                            {t('bundling.detail.items.programsAvailable', { count: items.length, defaultValue: `${items.length} Program tersedia` })}
                        </p>
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                    {items.map((item, idx) => {
                        const productUrl = getProductUrl(type, item.bundleable.slug);

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                            >
                                <div
                                    className={`group relative overflow-hidden rounded-lg md:rounded-xl border-l-4 ${borderLeft} border-y border-r border-gray-200 bg-white transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800`}
                                >
                                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 p-3 md:p-4">
                                        {/* Number Badge & Thumbnail - Horizontal on Mobile */}
                                        <div className="flex gap-3 sm:flex-col sm:gap-0">
                                            {/* Number Badge */}
                                            <div className="flex flex-shrink-0 items-start">
                                                <div className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full ${iconBg} shadow-lg`}>
                                                    <span className="text-base md:text-lg font-bold text-white">{idx + 1}</span>
                                                </div>
                                            </div>

                                            {/* Thumbnail */}
                                            <div className="relative h-20 w-28 sm:h-24 sm:w-32 flex-shrink-0 overflow-hidden rounded-lg sm:mt-3">
                                                <img
                                                    src={
                                                        item.bundleable.thumbnail
                                                            ? `/storage/${item.bundleable.thumbnail}`
                                                            : '/assets/images/placeholder.png'
                                                    }
                                                    alt={item.bundleable.title}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                                                {/* Check Icon - Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-green-500 shadow-lg">
                                                        <Check className="h-4 w-4 md:h-6 md:w-6 text-white" strokeWidth={3} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-1 flex-col min-w-0">
                                            <div className="mb-2 flex items-start justify-between gap-2 md:gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="mb-2 line-clamp-2 text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                                                        {item.bundleable.title}
                                                    </h4>
                                                    <Badge className={`${badgeClass} border-0 text-white shadow text-xs`}>
                                                        <Icon className="mr-1 h-3 w-3" />
                                                        {type === 'course' ? t('bundling.detail.items.courseBadge', 'Kelas Online') : label}
                                                    </Badge>
                                                </div>

                                                {/* External Link Button */}
                                                <a href={productUrl} target="_blank" rel="noopener noreferrer">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0 p-0 hover:bg-primary hover:text-white"
                                                    >
                                                        <ExternalLink size={14} className="md:hidden" />
                                                        <ExternalLink size={16} className="hidden md:block" />
                                                    </Button>
                                                </a>
                                            </div>

                                            {/* Price */}
                                            <div className="mt-auto flex items-center justify-between rounded-lg bg-gray-50 px-2 py-1.5 md:px-3 md:py-2 dark:bg-gray-900">
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {t('bundling.detail.items.normalPrice', 'Harga Normal')}
                                                </span>
                                                <span className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
                                                    {rupiahFormatter.format(item.price)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover Effect Gradient */}
                                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-gray-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:via-gray-700/50" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        );
    };

    return (
        <section className="relative mx-auto w-full max-w-7xl px-3 sm:px-4 py-8 md:py-12">
            {/* Decorative Background */}
            <div className="pointer-events-none absolute left-0 top-0 h-48 w-48 md:h-64 md:w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute right-0 bottom-0 h-48 w-48 md:h-64 md:w-64 rounded-full bg-secondary/10 blur-3xl" />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 mb-8 md:mb-12 text-center"
            >
                <div className="mb-3 md:mb-4 inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/5 px-3 py-1.5 md:px-4 md:py-2">
                    <Package className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    <span className="text-xs md:text-sm font-semibold text-primary">{t('bundling.detail.items.badge', 'Isi Paket Bundle')}</span>
                </div>
                <h2 className="mb-2 md:mb-3 text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                    {t('bundling.detail.items.title', { count: bundle.bundle_items_count, defaultValue: `${bundle.bundle_items_count} Program Pembelajaran Premium` })}
                </h2>
                <p className="mx-auto max-w-2xl text-sm md:text-base text-gray-600 dark:text-gray-400 px-4">
                    {t('bundling.detail.items.subtitle', 'Dapatkan akses lengkap ke semua program ini dalam satu paket hemat. Investasi terbaik untuk karir Anda!')}
                </p>
            </motion.div>

            {/* Content */}
            <div className="relative z-10">
                {renderItems(groupedItems.courses, 'course', 0)}
                {renderItems(groupedItems.bootcamps, 'bootcamp', 1)}
                {renderItems(groupedItems.webinars, 'webinar', 2)}

                {/* Pricing Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-8 md:mt-12"
                >
                    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-white to-secondary/5 p-4 md:p-6 lg:p-8 shadow-2xl dark:from-primary/10 dark:via-gray-900 dark:to-secondary/10">
                        {/* Sparkles Decoration */}
                        <Sparkles className="absolute top-4 right-4 md:top-6 md:right-6 h-8 w-8 md:h-12 md:w-12 text-primary/20" />

                        <div className="relative space-y-4 md:space-y-6">
                            {/* Title */}
                            <div className="text-center">
                                <h3 className="mb-1 md:mb-2 text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                    {t('bundling.detail.items.summaryTitle', 'Ringkasan Harga Bundle')}
                                </h3>
                                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                                    {t('bundling.detail.items.summarySubtitle', { percentage, defaultValue: `Hemat hingga ${percentage}% dengan paket bundling ini!` })}
                                </p>
                            </div>

                            {/* Price Comparison */}
                            <div className="grid gap-3 md:gap-4 sm:grid-cols-3">
                                {/* Normal Price */}
                                <div className="rounded-lg md:rounded-xl border border-gray-200 bg-white p-3 md:p-4 text-center dark:border-gray-700 dark:bg-gray-800">
                                    <p className="mb-1 md:mb-2 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {t('bundling.detail.items.normalPrice', 'Harga Normal')}
                                    </p>
                                    <p className="text-lg md:text-xl font-bold text-gray-500 line-through dark:text-gray-400">
                                        {rupiahFormatter.format(totalOriginalPrice)}
                                    </p>
                                </div>

                                {/* Savings */}
                                <div className="rounded-lg md:rounded-xl border-2 border-green-500 bg-gradient-to-br from-green-50 to-green-100 p-3 md:p-4 text-center shadow-lg dark:from-green-950/50 dark:to-green-900/50">
                                    <p className="mb-1 md:mb-2 text-xs md:text-sm font-medium text-green-700 dark:text-green-400">
                                        {t('bundling.detail.items.youSave', 'Anda Hemat')}
                                    </p>
                                    <p className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400">
                                        {rupiahFormatter.format(savings)}
                                    </p>
                                    <Badge className="mt-1 md:mt-2 bg-green-600 text-white text-xs">-{percentage}%</Badge>
                                </div>

                                {/* Bundle Price */}
                                <div className="rounded-lg md:rounded-xl border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/20 p-3 md:p-4 text-center shadow-lg dark:from-primary/20 dark:to-primary/30">
                                    <p className="mb-1 md:mb-2 text-xs md:text-sm font-medium text-primary dark:text-primary">{t('bundling.detail.items.bundlePrice', 'Harga Paket')}</p>
                                    <p className="text-xl md:text-2xl font-bold text-primary dark:text-primary">
                                        {rupiahFormatter.format(bundle.price)}
                                    </p>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="grid gap-2 md:gap-3 sm:grid-cols-2">
                                {[
                                    t('bundling.detail.items.featureLifetime', 'Akses Selamanya (Lifetime)'),
                                    t('bundling.detail.items.featureCertificate', 'Sertifikat untuk Semua Program'),
                                    t('bundling.detail.items.featureUpdates', 'Update Materi Gratis'),
                                    t('bundling.detail.items.featureCommunity', 'Akses Komunitas Eksklusif'),
                                ].map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 rounded-lg bg-white/50 p-2 md:p-3 dark:bg-gray-800/50"
                                    >
                                        <div className="flex h-5 w-5 md:h-6 md:w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                                            <Check className="h-3 w-3 md:h-4 md:w-4 text-white" strokeWidth={3} />
                                        </div>
                                        <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}