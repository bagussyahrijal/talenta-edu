import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { Calendar, Percent } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Category {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
    bio?: string;
    avatar?: string | null;
}

interface Bootcamp {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
    price: number;
    strikethrough_price: number;
    start_date: string;
    end_date: string;
    category?: Category;
    mentors?: User[];
}

interface RelatedProductProps {
    relatedBootcamps: Bootcamp[];
    myBootcampIds: string[];
}

export default function RelatedProduct({ relatedBootcamps, myBootcampIds }: RelatedProductProps) {
    const { t, i18n } = useTranslation('user');

    // Calculate discount percentage
    const calculateDiscount = (original: number, discounted: number) => {
        if (original === 0) return 0;
        return Math.round(((original - discounted) / original) * 100);
    };

    const getAvatarSrc = (avatar?: string | null) => {
        if (!avatar) {
            return null;
        }

        if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/')) {
            return avatar;
        }

        return `/storage/${avatar}`;
    };

    if (!relatedBootcamps || relatedBootcamps.length === 0) {
        return null;
    }

    // Filter out bootcamps that user already has access to
    const availableBootcamps = relatedBootcamps.filter((bootcamp) => !myBootcampIds.includes(bootcamp.id));

    if (availableBootcamps.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto mt-16 w-full max-w-7xl px-4" id="related">
            <h2 className="dark:text-primary-foreground mb-4 text-center text-2xl font-semibold text-gray-900 md:text-3xl">{t('bootcamp.detail.similarTitle')}</h2>
            <p className="mb-8 text-center text-gray-600 dark:text-gray-400">{t('bootcamp.detail.similarSubtitle')}</p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {availableBootcamps.map((bootcamp) => {
                    const discount = calculateDiscount(bootcamp.strikethrough_price, bootcamp.price);
                    const mentors = bootcamp.mentors ?? [];
                    const primaryMentor = mentors[0];

                    return (
                        <Link key={bootcamp.id} href={`/bootcamp/${bootcamp.slug}`} className="group h-full">
                            <div className="group-hover:ring-primary/40 relative h-full overflow-hidden rounded-2xl border transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:ring-2 dark:bg-zinc-700/30">
                                <div className="relative flex h-full flex-col rounded-lg bg-white dark:bg-zinc-800">
                                    <div className="w-full flex-shrink-0 overflow-hidden rounded-t-lg">
                                        <div className="relative">
                                            <img
                                                src={bootcamp.thumbnail ? `/storage/${bootcamp.thumbnail}` : '/assets/images/placeholder.png'}
                                                alt={bootcamp.title}
                                                className="h-48 w-full rounded-t-lg object-cover transition-transform duration-300 group-hover:scale-105"
                                            />

                                            {/* Bootcamp Badge - Top Left */}
                                            <span className="absolute top-2 left-2 z-20 rounded-lg border border-white/40 bg-white/30 px-1 py-1 text-xs font-semibold shadow backdrop-blur-md dark:bg-gray-800/30">
                                                {t('bootcamp.title')}
                                            </span>

                                            {/* Date Display - Bottom Right */}
                                            <div className="absolute right-2 bottom-2 z-20 rounded-lg border border-white/40 bg-white/30 px-2 py-1 shadow backdrop-blur-md dark:bg-gray-800/30">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size="12" />
                                                    <p className="text-xs font-semibold text-black dark:text-gray-400">
                                                        {new Date(bootcamp.start_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}{' '}
                                                        -{' '}
                                                        {new Date(bootcamp.end_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Discount Badge - Top Right */}
                                            {discount > 0 && (
                                                <div className="absolute top-2 right-2">
                                                    <Badge className="bg-red-500 text-white shadow-lg">
                                                        <Percent size={12} className="mr-1" />
                                                        {t('bootcamp.detail.savePercent', { percent: discount })}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <h2 className="mx-4 mt-2 line-clamp-2 text-left text-lg font-semibold">{bootcamp.title}</h2>
                                    </div>

                                    <div className="mt-auto w-full p-2 text-left">
                                        {bootcamp.strikethrough_price > 0 && bootcamp.strikethrough_price > bootcamp.price && (
                                            <p className="mb-0.5 px-2 text-xs text-red-600 line-through dark:text-gray-400">
                                                Rp {bootcamp.strikethrough_price.toLocaleString('id-ID')}
                                            </p>
                                        )}
                                        <div className="mb-2 flex items-center justify-between gap-2 px-2">
                                            {bootcamp.price === 0 ? (
                                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">{t('bootcamp.catalog.free')}</p>
                                            ) : (
                                                <p className="text-primary text-base font-bold dark:text-gray-200">
                                                    Rp {bootcamp.price.toLocaleString('id-ID')}
                                                </p>
                                            )}
                                            {bootcamp.category && (
                                                <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                                                    {bootcamp.category.name}
                                                </span>
                                            )}
                                        </div>

                                        <div className="bg-primary/50 my-2 h-0.5 w-full rounded-full px-4" />

                                        {/* Mentor Info Section */}
                                        <div className="mx-4 mt-4 flex items-center gap-3">
                                            {primaryMentor && getAvatarSrc(primaryMentor.avatar) ? (
                                                <img
                                                    src={getAvatarSrc(primaryMentor.avatar) ?? undefined}
                                                    alt={primaryMentor.name}
                                                    className="h-10 w-10 rounded-full object-cover shadow-lg"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-600">
                                                    {primaryMentor?.name
                                                        ? primaryMentor.name
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
                                                    {primaryMentor?.name ?? '-'}
                                                    {mentors.length > 1 ? ` ${t('bootcamp.detail.otherMentorsCount', { count: mentors.length - 1 })}` : ''}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {primaryMentor?.bio ?? t('bootcamp.catalog.noBio')}
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
