import { Badge } from '@/components/ui/badge';
import { rupiahFormatter } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Clock, Package, Percent } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Category {
    id: string;
    name: string;
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
    thumbnail?: string | null;
    price: number;
    strikethrough_price: number;
    registration_deadline?: string | null;
    batch?: string | null;
    bundle_items_count: number;
    category?: Category;
    user?: User;
}

interface RelatedBundlesProps {
    relatedBundles: Bundle[];
}

export default function RelatedBundles({ relatedBundles }: RelatedBundlesProps) {
    const { t } = useTranslation('user');

    if (!relatedBundles || relatedBundles.length === 0) {
        return null;
    }

    const calculateDiscount = (original: number, discounted: number) => {
        if (original === 0) return 0;
        return Math.round(((original - discounted) / original) * 100);
    };

    return (
        <section className="mx-auto mt-16 w-full max-w-7xl px-4 pb-12" id="related">
            <h2 className="dark:text-primary-foreground mb-4 text-center text-2xl font-semibold text-gray-900 md:text-3xl">
                {t('bundling.detail.related.title', 'Paket Bundling Lainnya')}
            </h2>
            <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
                {t('bundling.detail.related.subtitle', 'Paket bundling lain yang mungkin menarik untuk Anda')}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedBundles.map((bundle) => {
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
                                                    {t('bundling.dashboard.catalog.programsCount', {
                                                        count: bundle.bundle_items_count,
                                                        defaultValue: `${bundle.bundle_items_count} Program`,
                                                    })}
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
                                                            {daysLeft > 0
                                                                ? t('bundling.dashboard.catalog.daysLeft', {
                                                                      count: daysLeft,
                                                                      defaultValue: `${daysLeft} hari lagi`,
                                                                  })
                                                                : t('bundling.dashboard.catalog.closed', 'Ditutup')}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Discount Badge - Top Right */}
                                            {discount > 0 && (
                                                <div className="absolute top-2 right-2">
                                                    <Badge className="bg-red-500 text-white shadow-lg">
                                                        <Percent size={12} className="mr-1" />
                                                        {t('bundling.dashboard.catalog.savePercent', {
                                                            percent: discount,
                                                            defaultValue: `Hemat ${discount}%`,
                                                        })}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>

                                        {bundle.batch && (
                                            <div className="mx-4 mt-3">
                                                <Badge variant="outline" className="border-primary text-primary text-[10px] font-semibold">
                                                    {bundle.batch.toLowerCase().includes('batch')
                                                        ? bundle.batch
                                                        : t('bundling.dashboard.catalog.batch', {
                                                              batch: bundle.batch,
                                                              defaultValue: `Batch ${bundle.batch}`,
                                                          })}
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
                                                {rupiahFormatter.format(bundle.strikethrough_price)}
                                            </p>
                                        )}
                                        <div className="mb-2 flex items-center justify-between gap-2 px-2">
                                            {bundle.price === 0 ? (
                                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                    {t('bundling.dashboard.catalog.free', 'Gratis')}
                                                </p>
                                            ) : (
                                                <p className="text-primary text-base font-bold dark:text-gray-200">
                                                    {rupiahFormatter.format(bundle.price)}
                                                </p>
                                            )}
                                            {bundle.category && (
                                                <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                                                    {bundle.category.name}
                                                </span>
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
                })}
            </div>
        </section>
    );
}
