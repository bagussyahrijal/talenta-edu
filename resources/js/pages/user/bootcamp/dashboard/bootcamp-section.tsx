import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/react';
import { Calendar, Search, Users } from 'lucide-react';
import { useRef, useState } from 'react';

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
    mentors?: Array<{
        name: string;
    }>;
    user?: {
        name: string;
    };
}

interface BootcampProps {
    categories: Category[];
    bootcamps: Bootcamp[];
    myBootcampIds: string[];
}

export default function BootcampSection({ categories, bootcamps, myBootcampIds }: BootcampProps) {
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

    const filteredBootcamp = bootcamps.filter((bootcamp) => {
        const matchSearch = bootcamp.title.toLowerCase().includes(search.toLowerCase());
        const matchCategory = selectedCategory === null ? true : bootcamp.category.id === selectedCategory;
        return matchSearch && matchCategory;
    });

    const visibleBootcamps = filteredBootcamp.slice(0, visibleCount);

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-12" id="bootcamp">
            <div className="mb-4 flex flex-col items-center justify-between md:flex-row">
                <h1 className="font-literata text-primary mb-8 text-center text-5xl font-bold md:mb-0 md:text-left">Bootcamp Program</h1>
                <div
                    className="bg-primary mb-2 overflow-x-auto rounded-xl p-2 md:mb-0"
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
                            className={`rounded-xl px-4 py-2 text-sm transition hover:cursor-pointer ${
                                selectedCategory === null
                                    ? 'to-primary text-primary border-primary bg-white'
                                    : 'hover:text-primary dark:hover:bg-primary/10 bg-primary border-gray-300 text-white hover:bg-white dark:border-zinc-100/20 dark:bg-zinc-800 dark:text-zinc-100'
                            } `}
                        >
                            Semua
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setSelectedCategory(category.id)}
                                className={`rounded-xl px-4 py-2 text-sm transition hover:cursor-pointer ${
                                    selectedCategory === category.id
                                        ? 'to-primary text-primary border-primary bg-white'
                                        : 'hover:text-primary dark:hover:bg-primary/10 bg-primary border-gray-300 text-white hover:bg-white dark:border-zinc-100/20 dark:bg-zinc-800 dark:text-zinc-100'
                                } `}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="relative mb-8 flex">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
                    <Search size={20} />
                </span>
                <Input
                    type="search"
                    placeholder="Cari Program bootcamp..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-6 pl-10"
                />
            </div>
            <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleBootcamps.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12">
                        <img src="/assets/images/not-found.webp" alt="Bootcamp Belum Tersedia" className="w-48" />
                        <div className="text-center text-gray-500">Belum ada bootcamp yang tersedia saat ini.</div>
                    </div>
                ) : (
                    visibleBootcamps.map((bootcamp) => {
                        const hasAccess = myBootcampIds.includes(bootcamp.id);
                        const mentorNames = bootcamp.mentors?.length ? bootcamp.mentors.map((mentor) => mentor.name).join(', ') : bootcamp.user?.name;

                        return (
                            <Link
                                key={bootcamp.id}
                                href={hasAccess ? `profile/my-bootcamps/${bootcamp.slug}` : `/bootcamp/${bootcamp.slug}`}
                                className="group hover:shadow-primary border-primary h-full rounded-xl border-1 hover:shadow-sm"
                            >
                                <div className="before:to-primary-2 before:via-primary relative flex h-[450px] flex-col overflow-hidden rounded-xl transition-all duration-300 before:absolute before:inset-0 before:z-[-1] before:rounded-xl before:bg-gradient-to-br before:from-white before:opacity-0 before:transition-opacity before:duration-300 hover:scale-100 hover:shadow-xl hover:before:opacity-100">
                                    {/* Image Section */}
                                    <div className="relative h-48 w-full flex-shrink-0 overflow-hidden">
                                        <img
                                            src={bootcamp.thumbnail ? `/storage/${bootcamp.thumbnail}` : '/assets/images/placeholder.png'}
                                            alt={bootcamp.title}
                                            className="h-full w-full object-cover transition-transform duration-300"
                                        />
                                        {/* Category Badge - Top Right */}
                                        {bootcamp.category && (
                                            <span className="border-primary absolute top-3 right-3 rounded-full border bg-gray-100/70 px-3 py-1 text-xs text-black dark:bg-gray-700 dark:text-black">
                                                {bootcamp.category.name}
                                            </span>
                                        )}
                                    </div>
                                    {/* Content Section */}
                                    <div className="flex min-h-0 flex-1 flex-col justify-start p-4">
                                        {/* Title */}
                                        <h2 className="font-literata mb-1 line-clamp-2 text-xl font-semibold text-gray-900 group-hover:text-white dark:text-white">
                                            {bootcamp.title}
                                        </h2>
                                        {/* Price */}
                                        <div className="mb-3">
                                            {hasAccess ? (
                                                <p className="text-primary text-sm font-medium">Anda sudah memiliki akses</p>
                                            ) : bootcamp.price === 0 ? (
                                                <span className="text-xl font-bold text-green-600 dark:text-green-400">Gratis</span>
                                            ) : (
                                                <>
                                                    {bootcamp.strikethrough_price > 0 && (
                                                        <p className="text-sm text-red-500 line-through">
                                                            Rp {bootcamp.strikethrough_price.toLocaleString('id-ID')}
                                                        </p>
                                                    )}
                                                    <p className="font-literata text-2xl font-semibold text-gray-900 group-hover:text-white dark:text-white">
                                                        Rp {bootcamp.price.toLocaleString('id-ID')}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        {/* Date/Time Info */}
                                        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 group-hover:text-white dark:text-gray-400">
                                            <Calendar size={16} />
                                            <span>
                                                {bootcamp.start_date && (
                                                    <>
                                                        {new Date(bootcamp.start_date).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        })}
                                                    </>
                                                )}
                                                {bootcamp.end_date && (
                                                    <>
                                                        {' - '}
                                                        {new Date(bootcamp.end_date).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        })}
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                        <div className="mr-auto flex flex-row items-center justify-center gap-2 text-sm text-gray-600 group-hover:text-white dark:text-gray-400">
                                            <Users size={16} />
                                            <span>10/10</span>
                                        </div>
                                        <div>
                                            <p className="mt-2 mb-3 line-clamp-3 text-sm text-gray-700 group-hover:text-white dark:text-gray-300">
                                                Mentor by{' '}
                                                <span className="text-primary font-semibold group-hover:text-white">
                                                    {' '}
                                                    {mentorNames || 'Talenta Edu'}{' '}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="text-primary border-primary mt-auto justify-self-end rounded-lg border-1 py-1 text-center group-hover:border-white group-hover:text-white">
                                            Mulai Belajar
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
            {visibleCount < filteredBootcamp.length && (
                <div className="mb-8 flex justify-center">
                    <Button
                        type="button"
                        className="bg-primary mt-8 border border-white px-16 py-6 text-lg shadow-xl transition-all duration-300 hover:scale-105 hover:cursor-pointer hover:text-white"
                        onClick={() => setVisibleCount((prev) => prev + 6)}
                    >
                        Lihat Lebih Banyak
                    </Button>
                </div>
            )}
        </section>
    );
}
