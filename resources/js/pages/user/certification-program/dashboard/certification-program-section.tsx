import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/react';
import { Calendar, Search, Users, GraduationCap } from 'lucide-react';
import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

type Category = {
    id: string;
    name: string;
};

interface Program {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    type: 'regular' | 'scholarship';
    category: Category;
    price: number;
    scholarship_price?: number;
    strikethrough_price?: number;
    thumbnail?: string | null;
    registration_deadline?: string;
    socialization_registration_deadline?: string;
    mentors?: Array<{
        name: string;
    }>;
}

interface MyProgramIds {
    certificationPrograms?: string[];
}

interface CertificationProgramSectionProps {
    categories: Category[];
    programs: Program[];
    myProgramIds?: string[] | MyProgramIds;
}

export default function CertificationProgramSection({ categories, programs, myProgramIds }: CertificationProgramSectionProps) {
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

    const filteredPrograms = programs.filter((program) => {
        const matchSearch = program.title.toLowerCase().includes(search.toLowerCase());
        const matchCategory = selectedCategory === null ? true : program.category.id === selectedCategory;
        return matchSearch && matchCategory;
    });

    const visiblePrograms = filteredPrograms.slice(0, visibleCount);

    const safeMyProgramIds = Array.isArray(myProgramIds) ? myProgramIds : myProgramIds?.certificationPrograms || [];

    const hasProgramAccess = (programId: string) => safeMyProgramIds.includes(programId);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-12" id="certification-programs">
            <div className="mb-4 flex flex-col items-center justify-between md:flex-row">
                <h1 className="font-literata text-primary mb-8 text-center text-5xl font-bold md:mb-0 md:text-left">Program Sertifikasi</h1>
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
                    placeholder="Cari program sertifikasi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-6 pl-10"
                />
            </div>
            <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visiblePrograms.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12">
                        <img src="/assets/images/not-found.webp" alt="Program Belum Tersedia" className="w-48" />
                        <div className="text-center text-gray-500">Belum ada program sertifikasi yang tersedia saat ini.</div>
                    </div>
                ) : (
                    visiblePrograms.map((program) => {
                        const hasAccess = hasProgramAccess(program.id);
                        const mentorNames = program.mentors?.length ? program.mentors.map((mentor) => mentor.name).join(', ') : 'Talenta Edu';
                        const displayPrice = program.type === 'scholarship' ? (program.scholarship_price ?? program.price) : program.price;
                        const deadline = program.type === 'scholarship' ? program.socialization_registration_deadline : program.registration_deadline;
                        const deadlineDate = deadline ? new Date(deadline) : null;
                        
                        const programUrl = hasAccess
                            ? route('profile.certification-program.detail', program.slug)
                            : route('certification-programs.detail', program.slug);

                        return (
                            <Link
                                key={program.id}
                                href={programUrl}
                                className="group hover:shadow-primary border-primary h-full rounded-xl border-1 hover:shadow-sm"
                            >
                                <div className="before:to-primary-2 before:via-primary relative flex h-[450px] flex-col overflow-hidden rounded-xl transition-all duration-300 before:absolute before:inset-0 before:z-[-1] before:rounded-xl before:bg-gradient-to-br before:from-white before:opacity-0 before:transition-opacity before:duration-300 hover:scale-100 hover:shadow-xl hover:before:opacity-100">
                                    {/* Image Section */}
                                    <div className="relative h-48 w-full flex-shrink-0 overflow-hidden">
                                        <img
                                            src={program.thumbnail ? `/storage/${program.thumbnail}` : '/assets/images/placeholder.png'}
                                            alt={program.title}
                                            className="h-full w-full object-cover transition-transform duration-300"
                                        />
                                        {/* Badges - Top Right */}
                                        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                                            {program.category && (
                                                <span className="border-primary rounded-full border bg-gray-100/70 px-3 py-1 text-xs text-black dark:bg-gray-700 dark:text-black shadow-sm">
                                                    {program.category.name}
                                                </span>
                                            )}
                                            <span className={`flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm ${program.type === 'scholarship' ? 'bg-purple-100/90 text-purple-700' : 'bg-blue-100/90 text-blue-700'}`}>
                                                <GraduationCap size={12} className="mr-1" />
                                                {program.type === 'scholarship' ? 'Beasiswa' : 'Reguler'}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Content Section */}
                                    <div className="flex min-h-0 flex-1 flex-col justify-start p-4">
                                        {/* Title */}
                                        <h2 className="font-literata mb-1 line-clamp-2 text-xl font-semibold text-gray-900 group-hover:text-white dark:text-white">
                                            {program.title}
                                        </h2>
                                        {/* Price */}
                                        <div className="mb-3">
                                            {hasAccess ? (
                                                <p className="text-primary text-sm font-medium">Anda sudah memiliki akses</p>
                                            ) : displayPrice === 0 ? (
                                                <span className="text-xl font-bold text-green-600 dark:text-green-400">Gratis</span>
                                            ) : (
                                                <>
                                                    {program.strikethrough_price && program.strikethrough_price > 0 && (
                                                        <p className="text-sm text-red-500 line-through">
                                                            {formatRupiah(program.strikethrough_price)}
                                                        </p>
                                                    )}
                                                    <p className="font-literata text-2xl font-semibold text-gray-900 group-hover:text-white dark:text-white">
                                                        {formatRupiah(displayPrice)}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        {/* Date/Time Info */}
                                        {deadlineDate && (
                                            <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 group-hover:text-white dark:text-gray-400">
                                                <Calendar size={16} />
                                                <span>
                                                    Daftar sebelum: {format(deadlineDate, 'dd MMM yyyy', { locale: id })}
                                                </span>
                                            </div>
                                        )}
                                        {/* <div className="mr-auto flex flex-row items-center justify-center gap-2 text-sm text-gray-600 group-hover:text-white dark:text-gray-400">
                                            <Users size={16} />
                                            <span>Sertifikat Tersedia</span>
                                        </div> */}
                                        <div>
                                            <p className="mt-auto mb-3 line-clamp-3 text-sm text-gray-700 group-hover:text-white dark:text-gray-300">
                                                Mentor by{' '}
                                                <span className="text-primary font-semibold group-hover:text-white">
                                                    {' '}
                                                    {mentorNames}{' '}
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
            {visibleCount < filteredPrograms.length && (
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
