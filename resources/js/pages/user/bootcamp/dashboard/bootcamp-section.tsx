import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Magnetic } from '@/components/ui/magnetic';
import { Spotlight } from '@/components/ui/spotlight';
import { Link } from '@inertiajs/react';
import { Calendar, GalleryVerticalEnd } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

export default function BootcampSection({ categories, bootcamps, myBootcampIds }: BootcampProps) {
    const { t, i18n } = useTranslation('user');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [visibleCount, setVisibleCount] = useState(6);
    const categoryRef = useRef<HTMLDivElement | null>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        startX.current = e.pageX - (categoryRef.current?.offsetLeft ?? 0);
        scrollLeft.current = categoryRef.current?.scrollLeft ?? 0;
    };

    const handleMouseLeave = () => {
        isDragging.current = false;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !categoryRef.current) return;
        e.preventDefault();
        const x = e.pageX - categoryRef.current.offsetLeft;
        const walk = (x - startX.current) * 1.5; // scroll speed
        categoryRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const filteredBootcamp = bootcamps.filter((bootcamp) => {
        const matchSearch = bootcamp.title.toLowerCase().includes(search.toLowerCase());
        const matchCategory = selectedCategory === null ? true : bootcamp.category.id === selectedCategory;
        return matchSearch && matchCategory;
    });

    const visibleBootcamps = filteredBootcamp.slice(0, visibleCount);

    return (
        <section className="mx-auto w-full max-w-7xl px-4 pb-20" id="bootcamp">
            <h2 className="dark:text-primary-foreground mx-auto mb-4 max-w-3xl text-center text-3xl font-extrabold text-gray-900 md:text-4xl">
                {t('bootcamp.catalog.title')}
            </h2>
            <p className="mx-auto mb-8 text-center text-gray-600 dark:text-gray-400">
                {t('bootcamp.catalog.subtitle')}
            </p>
            {/* Kategori */}
            <div
                className="mb-8 overflow-x-auto scrollbar-hide"
                ref={categoryRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
            >
                <div className="flex w-max flex-nowrap gap-3 select-none">
                <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={`rounded-full border-2 px-6 py-2 text-sm font-semibold transition-all duration-200
                    ${selectedCategory === null
                        ? 'border-primary bg-primary/10 text-primary shadow'
                        : 'border-gray-300 bg-white text-gray-800 hover:border-primary/40 hover:bg-primary/5 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700'}
                    `}
                >
                    {t('bootcamp.catalog.allCategories')}
                </button>
                {categories.map((category) => (
                    <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`rounded-full border-2 px-6 py-2 text-sm font-semibold transition-all duration-200
                        ${selectedCategory === category.id
                        ? 'border-primary bg-primary/10 text-primary shadow'
                        : 'border-gray-300 bg-white text-gray-800 hover:border-primary/40 hover:bg-primary/5 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700'}
                    `}
                    >
                    {category.name}
                    </button>
                ))}
                </div>
            </div>
            {/* Search */}
            <div className="mb-8 flex justify-center">
                <Input
                type="search"
                placeholder={t('bootcamp.catalog.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md rounded-full border-2 border-primary/30 px-6 py-2 shadow-sm focus:border-primary"
                />
            </div>
            {/* Card Bootcamp */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {visibleBootcamps.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12">
                    <img src="/assets/images/not-found.webp" alt={t('bootcamp.catalog.empty')} className="w-48" />
                    <div className="text-center text-gray-500">{t('bootcamp.catalog.empty')}</div>
                </div>
                ) : (
                visibleBootcamps.map((bootcamp) => {
                    const hasAccess = myBootcampIds.includes(bootcamp.id);

                    return (
                    <Link
                        key={bootcamp.id}
                        href={hasAccess ? `profile/my-bootcamps/${bootcamp.slug}` : `/bootcamp/${bootcamp.slug}`}
                        className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/40 dark:bg-zinc-800/80"
                    >
                        {/* Badge akses/gratis */}
                        {hasAccess && (
                        <span className="absolute top-3 right-3 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow">
                            {t('bootcamp.catalog.owned')}
                        </span>
                        )}
                        {!hasAccess && bootcamp.price === 0 && (
                        <span className="absolute top-3 right-3 z-10 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow">
                            {t('bootcamp.catalog.free')}
                        </span>
                        )}
                        {/* Thumbnail */}
                        <div className="relative w-full overflow-hidden rounded-t-2xl">
                        <img
                            src={bootcamp.thumbnail ? `/storage/${bootcamp.thumbnail}` : '/assets/images/placeholder.png'}
                            alt={bootcamp.title}
                            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Date display */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs rounded-lg bg-white/30 backdrop-blur-md px-2 py-1 text-black shadow font-semibold">
                            <Calendar size={12} />
                            <span>
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
                            </span>
                        </div>
                        </div>
                        {/* Konten */}
                        <div className="flex flex-1 flex-col justify-between px-4 ">
                        <h2 className="mb-2  mt-2 line-clamp-2 text-left text-lg font-semibold text-gray-900 dark:text-white">{bootcamp.title}</h2>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{bootcamp.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                            {!hasAccess && bootcamp.price > 0 && (
                            <div className="flex flex-col items-start">
                                {bootcamp.strikethrough_price > 0 && (
                                <span className="text-xs text-red-500 line-through">
                                    Rp {bootcamp.strikethrough_price.toLocaleString('id-ID')}
                                </span>
                                )}
                                <span className="text-base font-bold text-primary">
                                Rp {bootcamp.price.toLocaleString('id-ID')}
                                </span>
                            </div>
                            )}
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {bootcamp.category.name}
                            </span>

                                                
                        </div>
                            <div className="px-4 mt-2 h-0.5 w-full rounded-full bg-primary/50" />
                        </div>

                        <div className="mx-4 my-4 flex items-center gap-3">
                            {bootcamp.user?.avatar ? (
                                                        <img
                                                        src={`/storage/${bootcamp.user.avatar}`}
                                                        alt={bootcamp.user.name}
                                                        className="h-10 w-10 rounded-full object-cover shadow-lg"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold flex-shrink-0">
                                                        {bootcamp.user?.name
                                                            ? bootcamp.user.name
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
                                                        {bootcamp.user?.name ?? '-'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {bootcamp.user?.bio ?? t('bootcamp.catalog.noBio')}
                                                        </div>
                                                    </div>
                                                </div>
                                                    
                    </Link>
                    );
                })
                )}
            </div>
            {/* Tombol Lihat Lebih Banyak */}
            {visibleCount < filteredBootcamp.length && (
                <div className="mb-8 flex justify-center">
                <Magnetic>
                    <Button
                    type="button"
                    size="lg"
                    className="rounded-full px-8 py-3 text-base font-bold shadow-lg"
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    >
                    {t('bootcamp.catalog.loadMore')} <GalleryVerticalEnd className="ml-2" />
                    </Button>
                </Magnetic>
                </div>
            )}
            </section>
    );
}
