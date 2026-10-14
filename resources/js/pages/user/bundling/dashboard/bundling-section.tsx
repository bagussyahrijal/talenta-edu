import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Magnetic } from '@/components/ui/magnetic';
import { Link } from '@inertiajs/react';
import { Clock, GalleryVerticalEnd, Package, Percent } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

interface User {
    name: string;
    bio?: string;
    avatar?: string | null;
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
    user?: User;
}

interface BundlingSectionProps {
    bundles: Bundle[];
}

export default function BundlingSection({ bundles }: BundlingSectionProps) {
    const { t, i18n } = useTranslation('user');
    const [search, setSearch] = useState('');
    const [visibleCount, setVisibleCount] = useState(8);

    const filteredBundles = bundles.filter((bundle) => {
        const matchSearch = bundle.title.toLowerCase().includes(search.toLowerCase());
        return matchSearch && bundle.status === 'published';
    });

    const visibleBundles = filteredBundles.slice(0, visibleCount);

    const calculateDiscount = (original: number, discounted: number) => {
        if (original === 0) return 0;
        return Math.round(((original - discounted) / original) * 100);
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-12" id="bundles">
            <div className="mb-8 text-center">
                <h2 className="dark:text-primary-foreground mx-auto mb-4 max-w-3xl text-2xl font-semibold text-gray-900 md:text-3xl">
                    {t('bundling.dashboard.catalog.title', 'Pilih Paket Bundling Terbaik Untukmu')}
                </h2>
                <p className="mx-auto text-gray-600 dark:text-gray-400">
                    {t('bundling.dashboard.catalog.subtitle', 'Hemat lebih banyak dengan membeli paket bundling program pembelajaran.')}
                </p>
            </div>

            <div className="mb-6">
                <Input
                    type="search"
                    placeholder={t('bundling.dashboard.catalog.searchPlaceholder', 'Cari paket bundling...')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mx-auto max-w-md"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {visibleBundles.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12">
                        <img src="/assets/images/character-3.png" alt={t('bundling.dashboard.catalog.emptyDefault', 'Belum ada paket bundling yang tersedia saat ini.')} className="w-48" />
                        <div className="text-center text-gray-500">
                            {search ? t('bundling.dashboard.catalog.emptySearch', 'Tidak ada paket bundling yang sesuai dengan pencarian.') : t('bundling.dashboard.catalog.emptyDefault', 'Belum ada paket bundling yang tersedia saat ini.')}
                        </div>
                    </div>
                ) : (
                    visibleBundles.map((bundle) => {
                        const discount = calculateDiscount(bundle.strikethrough_price, bundle.price);
                        const hasDeadline = bundle.registration_deadline;

                        let daysLeft = 0;
                        if (hasDeadline) {
                            const deadline = new Date(bundle.registration_deadline!);
                            const now = new Date();
                            daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        }

                        return (
                            <Link key={bundle.id} href={route('bundle.detail', bundle.slug)} className="group h-full">
                                <div className="group-hover:ring-primary/40 relative h-full overflow-hidden rounded-2xl border transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:ring-2 dark:bg-zinc-700/30">
                                    <div className="relative flex h-full flex-col rounded-lg bg-white dark:bg-zinc-800">
                                        <div className="w-full flex-shrink-0 overflow-hidden rounded-t-lg">
                                            <div className="relative">
                                                <img
                                                    src={bundle.thumbnail ? `/storage/${bundle.thumbnail}` : '/assets/images/placeholder.png'}
                                                    alt={bundle.title}
                                                    className="h-48 w-full rounded-t-lg object-cover transition-transform duration-300 group-hover:scale-105"
                                                />

                                                {/* Bundle Badge - Top Left */}
                                                <span className="absolute top-2 left-2 z-20 rounded-lg border border-white/40 bg-white/30 px-1 py-1 text-xs font-semibold shadow backdrop-blur-md dark:bg-gray-800/30">
                                                    {t('bundling.dashboard.catalog.badge', 'Bundle')}
                                                </span>

                                                {/* Items Count Badge - Bottom Left */}
                                                <div className="absolute bottom-2 left-2 z-20">
                                                    <Badge
                                                        variant="secondary"
                                                        className="border border-white/40 bg-white/30 font-semibold text-black shadow backdrop-blur-md dark:bg-gray-800/30 dark:text-white"
                                                    >
                                                        <Package size={12} className="mr-1" />
                                                        {t('bundling.dashboard.catalog.programsCount', { count: bundle.bundle_items_count, defaultValue: `${bundle.bundle_items_count} Program` })}
                                                    </Badge>
                                                </div>

                                                {/* Deadline Display - Bottom Right */}
                                                {hasDeadline && (
                                                    <div className="absolute right-2 bottom-2 z-20 rounded-lg border border-white/40 bg-white/30 px-2 py-1 shadow backdrop-blur-md dark:bg-gray-800/30">
                                                        <div className="flex items-center gap-2">
                                                            <Clock
                                                                size={12}
                                                                className={daysLeft <= 3 ? 'text-red-500' : 'text-black dark:text-gray-400'}
                                                            />
                                                            <p
                                                                className={`text-xs font-semibold ${daysLeft <= 3 ? 'text-red-500' : 'text-black dark:text-gray-400'}`}
                                                            >
                                                                {daysLeft > 0 ? t('bundling.dashboard.catalog.daysLeft', { count: daysLeft, defaultValue: `${daysLeft} hari lagi` }) : t('bundling.dashboard.catalog.closed', 'Ditutup')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Discount Badge - Top Right */}
                                                {discount > 0 && (
                                                    <div className="absolute top-2 right-2">
                                                        <Badge className="bg-red-500 text-white shadow-lg">
                                                            <Percent size={12} className="mr-1" />
                                                            {t('bundling.dashboard.catalog.savePercent', { percent: discount, defaultValue: `Hemat ${discount}%` })}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {bundle.batch && (
                                                <div className="mx-4 mt-3">
                                                    <Badge variant="outline" className="border-primary text-primary text-[10px] font-semibold">
                                                        {bundle.batch.toLowerCase().includes('batch') ? bundle.batch : t('bundling.dashboard.catalog.batch', { batch: bundle.batch, defaultValue: `Batch ${bundle.batch}` })}
                                                    </Badge>
                                                </div>
                                            )}

                                            <h2 className={`mx-4 line-clamp-2 text-left text-lg font-semibold ${bundle.batch ? 'mt-1' : 'mt-2'}`}>
                                                {bundle.title}
                                            </h2>
                                        </div>

                                        <div className="mt-auto w-full p-2 text-left">
                                            {bundle.strikethrough_price > 0 && bundle.strikethrough_price > bundle.price && (
                                                <p className="mb-0.5 px-2 text-xs text-red-600 line-through dark:text-gray-400">
                                                    Rp {bundle.strikethrough_price.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                                </p>
                                            )}
                                            <div className="mb-2 flex items-center justify-between gap-2 px-2">
                                                {bundle.price === 0 ? (
                                                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                        {t('bundling.dashboard.catalog.free', 'Gratis')}
                                                    </p>
                                                ) : (
                                                    <p className="text-primary text-base font-bold dark:text-gray-200">
                                                        Rp {bundle.price.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="bg-primary/50 my-2 h-0.5 w-full rounded-full px-4" />

                                            {/* Mentor Info Section */}
                                            <div className="mx-4 mt-4 flex items-center gap-3">
                                                {bundle.user?.avatar ? (
                                                    <img
                                                        src={`/storage/${bundle.user.avatar}`}
                                                        alt={bundle.user.name}
                                                        className="h-10 w-10 rounded-full object-cover shadow-lg"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-600">
                                                        {bundle.user?.name
                                                            ? bundle.user.name
                                                                  .split(' ')
                                                                  .map((n) => n[0])
                                                                  .join('')
                                                                  .substring(0, 2)
                                                                  .toUpperCase()
                                                            : '-'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                        {bundle.user?.name ?? '-'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {bundle.user?.bio ?? t('bundling.dashboard.catalog.noBio', 'Tidak ada bio')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>

            {visibleCount < filteredBundles.length && (
                <div className="mt-8 flex justify-center">
                    <Magnetic>
                        <Button type="button" className="hover:cursor-pointer" onClick={() => setVisibleCount((prev) => prev + 8)}>
                            {t('bundling.dashboard.catalog.loadMore', 'Lihat Lebih Banyak')} <GalleryVerticalEnd />
                        </Button>
                    </Magnetic>
                </div>
            )}
        </section>
    );
}
