import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/react';
import { Calendar, Search, Users, Package, Percent } from 'lucide-react';
import { useRef, useState } from 'react';

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
    status: 'draft' | 'published' | 'archived';
    bundle_items: BundleItem[];
    bundle_items_count: number;
    category?: { id: string; name: string }; // optional, if you want to add category filter
}

interface BundlingSectionProps {
    bundles: Bundle[];
    categories?: { id: string; name: string }[]; // optional, if you want to add category filter
}

export default function BundlingSection({ bundles, categories = [] }: BundlingSectionProps) {
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
        const walk = (x - startX.current) * 1.5;
        categoryRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const filteredBundles = bundles.filter((bundle) => {
        const matchSearch = bundle.title.toLowerCase().includes(search.toLowerCase());
        const matchCategory = selectedCategory === null ? true : bundle.category?.id === selectedCategory;
        return matchSearch && bundle.status === 'published' && matchCategory;
    });

    const visibleBundles = filteredBundles.slice(0, visibleCount);

    const formatRupiah = (amount: number) => {
        return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
    };

    const calculateDiscount = (original: number, discounted: number) => {
        if (original === 0) return 0;
        return Math.round(((original - discounted) / original) * 100);
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-12" id="bundles">
            <div className='flex flex-col md:flex-row items-center justify-between mb-4'>
                <h1 className='text-5xl font-bold font-literata text-primary text-center md:text-left mb-8 md:mb-0'>Bundling Program</h1>
                {categories.length > 0 && (
                    <div
                        className="overflow-x-auto bg-primary p-2 rounded-xl mb-2 md:mb-0"
                        ref={categoryRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        style={{ scrollbarWidth: 'none', cursor: isDragging.current ? 'grabbing' : 'grab' }}
                    >
                        <div className="flex w-max flex-nowrap gap-2 select-none">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory(null)}
                                className={`rounded-xl px-4 py-2 text-sm transition hover:cursor-pointer ${selectedCategory === null
                                    ? 'to-primary text-primary border-primary bg-white'
                                    : 'hover:bg-white hover:text-primary dark:hover:bg-primary/10 bg-primary border-gray-300 text-white dark:border-zinc-100/20 dark:bg-zinc-800 dark:text-zinc-100'
                                    } `}
                            >
                                Semua
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`rounded-xl  px-4 py-2 text-sm transition hover:cursor-pointer ${selectedCategory === category.id
                                        ? 'to-primary text-primary border-primary bg-white'
                                        : ' hover:bg-white hover:text-primary dark:hover:bg-primary/10 bg-primary border-gray-300 text-white dark:border-zinc-100/20 dark:bg-zinc-800 dark:text-zinc-100'
                                        } `}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="relative mb-8 flex">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Search size={20} />
                </span>
                <Input
                    type="search"
                    placeholder="Cari Program bundling..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='px-4 py-6 pl-10'
                />
            </div>
            <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleBundles.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12">
                        <img src="/assets/images/not-found.webp" alt="Paket Bundling Belum Tersedia" className="w-48" />
                        <div className="text-center text-gray-500">
                            {search ? 'Tidak ada paket bundling yang sesuai dengan pencarian.' : 'Belum ada paket bundling yang tersedia saat ini.'}
                        </div>
                    </div>
                ) : (
                    visibleBundles.map((bundle) => {
                        const discount = calculateDiscount(bundle.strikethrough_price, bundle.price);

                        return (
                            <Link
                                key={bundle.id}
                                href={route ? route('bundle.detail', bundle.slug) : `/bundling/${bundle.slug}`}
                                className="group h-full rounded-xl hover:shadow-sm hover:shadow-primary border-1 border-primary"
                            >
                                <div className="relative flex flex-col h-[480px] overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-100 before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white before:to-primary-2 before:via-primary before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:z-[-1]">
                                    {/* Image Section */}
                                    <div className="relative h-48 w-full overflow-hidden flex-shrink-0">
                                        <img
                                            src={bundle.thumbnail ? `/storage/${bundle.thumbnail}` : '/assets/images/placeholder.png'}
                                            alt={bundle.title}
                                            className="h-full w-full object-cover transition-transform duration-300"
                                        />
                                        {/* Category Badge - Top Right */}
                                        {bundle.category && (
                                            <span className="absolute top-3 right-3 rounded-full bg-gray-100/70 border border-primary px-3 py-1 text-xs text-black dark:bg-gray-700 dark:text-black">
                                                {bundle.category.name}
                                            </span>
                                        )}
                                        {/* Discount Badge */}
                                        {discount > 0 && (
                                            <span className="absolute top-3 left-3 rounded-full bg-red-500 px-3 py-1 text-xs text-white flex items-center gap-1">
                                                <Percent size={12} />
                                                Hemat {discount}%
                                            </span>
                                        )}
                                        {/* Items Count Badge */}
                                        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs text-gray-900 flex items-center gap-1 dark:bg-gray-900/90 dark:text-white">
                                            <Package size={12} />
                                            {bundle.bundle_items_count} Program
                                        </span>
                                    </div>
                                    {/* Content Section */}
                                    <div className="flex flex-col flex-1 justify-start p-4 min-h-0">
                                        {/* Title */}
                                        <h2 className="group-hover:text-white mb-1 line-clamp-2 text-xl font-semibold text-gray-900 dark:text-white font-literata">
                                            {bundle.title}
                                        </h2>
                                        {/* Price */}
                                        <div className="mb-3">
                                            {bundle.price === 0 ? (
                                                <span className="text-green-600 dark:text-green-400 text-xl font-bold">Gratis</span>
                                            ) : (
                                                <>
                                                    {bundle.strikethrough_price > 0 && (
                                                        <p className="text-sm text-red-500 line-through">
                                                            {formatRupiah(bundle.strikethrough_price)}
                                                        </p>
                                                    )}
                                                    <p className="group-hover:text-white text-2xl font-literata font-semibold text-gray-900 dark:text-white">
                                                        {formatRupiah(bundle.price)}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        {/* Deadline Info */}
                                        {bundle.registration_deadline && (
                                            <div className="group-hover:text-white mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Calendar size={16} />
                                                <span>
                                                    {new Date(bundle.registration_deadline).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {/* Items Count */}
                                        <div className='group-hover:text-white flex flex-row items-center justify-center mr-auto gap-2 text-sm text-gray-600 dark:text-gray-400'>
                                            <Users size={16} />
                                            <span>{bundle.bundle_items_count} Program</span>
                                        </div>
                                        {/* Description */}
                                        <div>
                                            <p className="mb-3 group-hover:text-white mt-2 line-clamp-3 text-gray-700 dark:text-gray-300 text-sm">
                                                {bundle.short_description}
                                            </p>
                                        </div>
                                        <div className='justify-self-end text-center text-primary group-hover:text-white group-hover:border-white border-1 border-primary rounded-lg py-1 mt-auto'>
                                            Mulai Belajar
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
            {visibleCount < filteredBundles.length && (
                <div className="mb-8 flex justify-center">
                    <Button type="button" className="mt-8 hover:cursor-pointer text-lg px-16 bg-primary py-6 border border-white shadow-xl hover:scale-105 transition-all duration-300 hover:text-white" onClick={() => setVisibleCount((prev) => prev + 6)}>
                        Lihat Lebih Banyak
                    </Button>
                </div>
            )}
        </section>
    );
}
