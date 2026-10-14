import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Magnetic } from '@/components/ui/magnetic';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { enUS, id } from 'date-fns/locale';
import { Calendar, Clock, GalleryVerticalEnd, GraduationCap } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Category = {
    id: string;
    name: string;
};

interface Mentor {
    id?: string;
    name: string;
    bio?: string;
    avatar?: string | null;
}

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
    mentors?: Mentor[];
}

interface MyProgramIds {
    certificationPrograms?: string[];
}

interface CertificationProgramSectionProps {
    categories: Category[];
    programs: Program[];
    myProgramIds?: string[] | MyProgramIds;
    approvedScholarshipProgramIds?: string[];
}

export default function CertificationProgramSection({ categories, programs, myProgramIds, approvedScholarshipProgramIds = [] }: CertificationProgramSectionProps) {
    const { t, i18n } = useTranslation('user');
    const dateLocale = i18n.language === 'en' ? enUS : id;
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
        <section className="mx-auto w-full max-w-7xl px-4 pb-20" id="certification-programs">
            <h2 className="dark:text-primary-foreground mx-auto mb-4 max-w-3xl text-center text-3xl font-extrabold text-gray-900 md:text-4xl">
                {t('certificationProgram.dashboard.catalog.title', 'Raih Sertifikasi Profesional dan Tingkatkan Karirmu')}
            </h2>
            <p className="mx-auto mb-8 text-center text-gray-600 dark:text-gray-400">
                {t('certificationProgram.dashboard.catalog.subtitle', 'Pilih program sertifikasi yang sesuai dengan tujuan karirmu.')}
            </p>

            {/* Kategori */}
            <div
                className="mb-8 overflow-x-auto scrollbar-hide"
                ref={categoryRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{ scrollbarWidth: 'none', cursor: isDragging.current ? 'grabbing' : 'grab' }}
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
                        {t('certificationProgram.dashboard.catalog.allCategories', 'Semua Kategori')}
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
                    placeholder={t('certificationProgram.dashboard.catalog.searchPlaceholder', 'Cari program sertifikasi...')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-md rounded-full border-2 border-primary/30 px-6 py-2 shadow-sm focus:border-primary"
                />
            </div>

            {/* Card Products */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {visiblePrograms.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12">
                        <img src="/assets/images/not-found.webp" alt={t('certificationProgram.dashboard.catalog.emptyPrograms', 'Belum ada program sertifikasi yang tersedia saat ini.')} className="w-48" />
                        <div className="text-center text-gray-500">{t('certificationProgram.dashboard.catalog.emptyPrograms', 'Belum ada program sertifikasi yang tersedia saat ini.')}</div>
                    </div>
                ) : (
                    visiblePrograms.map((program) => {
                        const isApprovedScholarship = program.type === 'scholarship' && approvedScholarshipProgramIds?.includes(program.id);
                        const isScholarshipNotApproved = program.type === 'scholarship' && !isApprovedScholarship;
                        const displayPrice = isScholarshipNotApproved ? 0 : (program.type === 'scholarship' ? (program.scholarship_price ?? program.price) : program.price);
                        const deadline = program.type === 'scholarship' ? program.socialization_registration_deadline : program.registration_deadline;
                        const deadlineDate = deadline ? new Date(deadline) : null;
                        
                        let daysLeft = 0;
                        if (deadlineDate) {
                            const now = new Date();
                            daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        }

                        const hasAccess = hasProgramAccess(program.id);
                        const programUrl = hasAccess
                            ? `/profile/my-certification-programs/${program.slug}`
                            : route('certification-programs.detail', program.slug);

                        return (
                            <Link
                                key={program.id}
                                href={programUrl}
                                className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-zinc-800/80 ${
                                    hasAccess ? 'border-emerald-200 dark:border-emerald-900/50' : 'border-transparent hover:border-primary/40'
                                }`}
                            >
                                {/* Badge Type & Status */}
                                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold shadow ${program.type === 'scholarship' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
                                        <GraduationCap size={12} />
                                        {program.type === 'scholarship' ? t('certificationProgram.dashboard.catalog.badgeScholarship', 'Beasiswa') : t('certificationProgram.dashboard.catalog.badgeRegular', 'Reguler')}
                                    </span>
                                </div>

                                {/* Badge Gratis/Deadline/Purchased */}
                                <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1">
                                    {hasAccess ? (
                                        <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow">
                                            {t('certificationProgram.dashboard.catalog.badgeOwned', 'Sudah Dibeli')}
                                        </span>
                                    ) : (
                                        <>
                                            {displayPrice === 0 && (
                                                <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow">
                                                    {t('certificationProgram.dashboard.catalog.free', 'Gratis')}
                                                </span>
                                            )}
                                            {displayPrice > 0 && daysLeft <= 7 && daysLeft > 0 && (
                                                <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow">
                                                    {t('certificationProgram.dashboard.catalog.daysLeft', { count: daysLeft, defaultValue: `${daysLeft} Hari Lagi` })}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Thumbnail */}
                                <div className="relative w-full overflow-hidden rounded-t-2xl">
                                    <img
                                        src={program.thumbnail ? `/storage/${program.thumbnail}` : '/assets/images/placeholder.png'}
                                        alt={program.title}
                                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    {/* Deadline Badge on Image */}
                                    {deadlineDate && (
                                        <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs rounded-lg bg-white/30 backdrop-blur-md px-2 py-1 text-black shadow font-semibold">
                                            <Calendar size={12} />
                                            <span>{format(deadlineDate, 'dd MMM yyyy', { locale: dateLocale })}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Konten */}
                                <div className="flex flex-1 flex-col justify-between px-4">
                                    <h2 className="mb-2 mt-2 line-clamp-2 text-left text-lg font-semibold text-gray-900 dark:text-white">
                                        {program.title}
                                    </h2>
                                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                        {program.short_description || t('certificationProgram.dashboard.catalog.defaultDesc', 'Program sertifikasi profesional')}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mt-auto">
                                        {displayPrice > 0 ? (
                                            <div className="flex flex-col items-start">
                                                {!isScholarshipNotApproved && (program.strikethrough_price ?? 0) > 0 && (
                                                    <span className="text-xs text-red-500 line-through">
                                                        Rp {program.strikethrough_price!.toLocaleString('id-ID')}
                                                    </span>
                                                )}
                                                <span className="text-base font-bold text-primary">
                                                    Rp {displayPrice.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-base font-bold text-green-600">{t('certificationProgram.dashboard.catalog.free', 'Gratis')}</span>
                                        )}
                                    </div>
                                    <div className="px-4 mt-2 h-0.5 w-full rounded-full bg-primary/50" />
                                    {program.mentors && program.mentors.length > 0 && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {program.mentors.slice(0, 3).map((mentor, idx) => {
                                                    const avatarSrc = mentor.avatar
                                                        ? (mentor.avatar.startsWith('http') || mentor.avatar.startsWith('/')
                                                            ? mentor.avatar
                                                            : `/storage/${mentor.avatar}`)
                                                        : null;
                                                    return avatarSrc ? (
                                                        <img
                                                            key={mentor.id || idx}
                                                            src={avatarSrc}
                                                            alt={mentor.name}
                                                            className="h-7 w-7 rounded-full border-2 border-white object-cover shadow dark:border-zinc-800"
                                                        />
                                                    ) : (
                                                        <div
                                                            key={mentor.id || idx}
                                                            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[10px] font-bold text-gray-600 shadow dark:border-zinc-800"
                                                        >
                                                            {mentor.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <span className="truncate text-xs font-medium text-gray-600 dark:text-gray-400">
                                                {program.mentors.map((m) => m.name).join(', ')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mx-4 my-4 flex items-center justify-between">
                                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                        {program.category.name}
                                    </span>
                                    {hasAccess && (
                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            {t('certificationProgram.dashboard.catalog.accessProgram', 'Akses Program →')}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>

            {/* Tombol Lihat Lebih Banyak */}
            {visibleCount < filteredPrograms.length && (
                <div className="mb-8 flex justify-center">
                    <Magnetic>
                        <Button
                            type="button"
                            size="lg"
                            className="rounded-full px-8 py-3 text-base font-bold shadow-lg"
                            onClick={() => setVisibleCount((prev) => prev + 6)}
                        >
                            {t('certificationProgram.dashboard.catalog.loadMore', 'Lihat Lebih Banyak')} <GalleryVerticalEnd className="ml-2" />
                        </Button>
                    </Magnetic>
                </div>
            )}
        </section>
    );
}
