import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { Percent } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Course {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
    price: number;
    strikethrough_price: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    category?: {
        name: string;
    };
    user?: {
        name: string;
        bio?: string;
        avatar?: string | null;
    };
}

interface RelatedProductProps {
    relatedCourses: Course[];
    myCourseIds: string[];
}

export default function RelatedProduct({ relatedCourses, myCourseIds }: RelatedProductProps) {
    const { t } = useTranslation('user');

    if (!relatedCourses || relatedCourses.length === 0) {
        return null;
    }

    // Calculate discount percentage
    const calculateDiscount = (original: number, discounted: number) => {
        if (original === 0) return 0;
        return Math.round(((original - discounted) / original) * 100);
    };

    return (
        <section className="mx-auto mt-16 w-full max-w-7xl px-4" id="related">
            <h2 className="dark:text-primary-foreground mb-4 text-center text-3xl font-bold text-gray-900 md:text-4xl">
                {t('course.detail.similarCourses')}
            </h2>
            <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
                {t('course.detail.similarSubtitle')}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedCourses.map((course) => {
                    const hasAccess = myCourseIds.includes(course.id);
                    const discount = calculateDiscount(course.strikethrough_price, course.price);

                    return (
                        <Link
                            key={course.id}
                            href={hasAccess ? `/profile/my-courses/${course.slug}` : `/course/${course.slug}`}
                            className="h-full group p-2"
                        >
                            <div className="relative h-full overflow-hidden rounded-2xl border dark:bg-zinc-700/30 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-primary/40">
                                <div className="bg-white relative flex h-full flex-col rounded-lg dark:bg-zinc-800">
                                    <div className="w-full flex-shrink-0 overflow-hidden rounded-t-lg">
                                        <div className="relative">
                                            <img
                                                src={course.thumbnail ? `/storage/${course.thumbnail}` : '/assets/images/placeholder.png'}
                                                alt={course.title}
                                                className="h-48 w-full rounded-t-lg object-cover transition-transform duration-300 group-hover:scale-105"
                                            />

                                            {/* Level Badge - Bottom Left */}
                                            {course.level && (
                                                <div className="absolute left-2 bottom-2 z-20">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div
                                                                className={
                                                                    course.level === 'beginner'
                                                                        ? 'rounded-lg font-semibold border border-green-300 bg-green-100 px-3 py-1 text-xs text-green-700 dark:bg-zinc-800 dark:text-green-300'
                                                                        : course.level === 'intermediate'
                                                                          ? 'rounded-lg font-semibold border border-yellow-300 bg-yellow-100 px-3 py-1 text-xs text-yellow-700 dark:bg-zinc-800 dark:text-yellow-300'
                                                                          : 'rounded-lg font-semibold border border-red-300 bg-red-100 px-3 py-1 text-xs text-red-700 dark:bg-zinc-800 dark:text-red-300'
                                                                }
                                                            >
                                                                <p>
                                                                    {course.level === 'beginner'
                                                                        ? t('course.catalog.beginner')
                                                                        : course.level === 'intermediate'
                                                                          ? t('course.catalog.intermediate')
                                                                          : t('course.catalog.advanced')}
                                                                </p>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {course.level === 'beginner' && <p>{t('course.catalog.levelBeginner')}</p>}
                                                            {course.level === 'intermediate' && <p>{t('course.catalog.levelIntermediate')}</p>}
                                                            {course.level === 'advanced' && <p>{t('course.catalog.levelAdvanced')}</p>}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            )}

                                            {/* Product Type Badge - Top Left */}
                                            <span className="absolute top-2 left-2 text-xs font-semibold rounded-lg bg-white/30 backdrop-blur-md border border-white/40 px-1 py-1 shadow z-20 dark:bg-gray-800/30">
                                                {t('course.title')}
                                            </span>

                                            {/* Discount Badge - Top Right */}
                                            {discount > 0 && (
                                                <div className="absolute top-2 right-2">
                                                    <Badge className="bg-red-500 text-white shadow-lg">
                                                        <Percent size={12} className="mr-1" />
                                                        {t('course.detail.saveDiscount', { discount })}
                                                    </Badge>
                                                </div>
                                            )}

                                            {/* Has Access Badge - Top Right */}
                                            {hasAccess && (
                                                <div className="absolute top-2 right-2">
                                                    <Badge className="bg-green-500 text-white shadow-lg">
                                                        {t('course.catalog.owned')}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <h2 className="mx-4 mt-2 line-clamp-2 text-left text-lg font-semibold">
                                            {course.title}
                                        </h2>
                                    </div>

                                    <div className="mt-auto w-full p-2 text-left">
                                        {/* Price Section */}
                                        {course.strikethrough_price > 0 && course.strikethrough_price > course.price && (
                                            <p className="text-xs px-2 text-red-600 line-through dark:text-gray-400 mb-0.5">
                                                Rp {course.strikethrough_price.toLocaleString('id-ID')}
                                            </p>
                                        )}
                                        <div className="flex items-center px-2 justify-between gap-2 mb-2">
                                            {course.price === 0 ? (
                                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">{t('course.catalog.free')}</p>
                                            ) : (
                                                <p className="text-base font-bold text-primary dark:text-gray-200">
                                                    Rp {course.price.toLocaleString('id-ID')}
                                                </p>
                                            )}
                                            {course.category && (
                                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                                    {course.category.name}
                                                </span>
                                            )}
                                        </div>

                                        <div className="px-4 my-2 h-0.5 w-full rounded-full bg-primary/50" />

                                        {/* Mentor Info */}
                                        <div className="mx-4 mt-4 flex items-center gap-3">
                                            {course.user?.avatar ? (
                                                <img
                                                    src={`/storage/${course.user.avatar}`}
                                                    alt={course.user.name}
                                                    className="h-10 w-10 rounded-full object-cover shadow-lg"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold flex-shrink-0">
                                                    {course.user?.name
                                                        ? course.user.name
                                                              .split(' ')
                                                              .map((n) => n[0])
                                                              .join('')
                                                              .substring(0, 2)
                                                              .toUpperCase()
                                                        : '-'}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                                                    {course.user?.name ?? '-'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {course.user?.bio || t('course.catalog.noBio')}
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