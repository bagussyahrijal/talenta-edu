import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { enUS, id } from 'date-fns/locale';
import { Calendar, GraduationCap, Percent } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Mentor {
    id?: string;
    name: string;
    avatar?: string | null;
}

interface RelatedProgram {
    id: string;
    title: string;
    slug: string;
    type: 'regular' | 'scholarship';
    price: number;
    strikethrough_price?: number;
    category?: { name: string };
    thumbnail?: string | null;
    registration_deadline?: string;
    socialization_registration_deadline?: string;
    mentors?: Mentor[];
}

export default function RelatedPrograms({
    relatedPrograms,
    approvedScholarshipProgramIds = [],
}: {
    relatedPrograms: RelatedProgram[];
    approvedScholarshipProgramIds?: string[];
}) {
    const { t, i18n } = useTranslation('user');
    const dateLocale = i18n.language === 'en' ? enUS : id;

    if (!relatedPrograms || relatedPrograms.length === 0) return null;

    const calculateDiscount = (original: number, discounted: number) => {
        if (!original || original === 0) return 0;
        return Math.round(((original - discounted) / original) * 100);
    };

    return (
        <section className="mx-auto mt-16 w-full max-w-7xl px-4" id="related">
            <h2 className="dark:text-primary-foreground mb-4 text-center text-2xl font-semibold text-gray-900 md:text-3xl">
                {t('certificationProgram.detail.related.title', 'Program Sertifikasi Lainnya')}
            </h2>
            <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
                {t('certificationProgram.detail.related.subtitle', 'Program sertifikasi lain yang mungkin menarik untuk Anda')}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedPrograms.map((program) => {
                    const deadline = program.type === 'scholarship' ? program.socialization_registration_deadline : program.registration_deadline;
                    const deadlineDate = deadline ? new Date(deadline) : null;
                    const discount = calculateDiscount(program.strikethrough_price ?? 0, program.price);

                    return (
                        <Link key={program.id} href={route('certification-programs.detail', program.slug)} className="group h-full">
                            <div className="group-hover:ring-primary/40 relative h-full overflow-hidden rounded-2xl border transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:ring-2 dark:bg-zinc-700/30">
                                <div className="relative flex h-full flex-col rounded-lg bg-white dark:bg-zinc-800">
                                    <div className="w-full flex-shrink-0 overflow-hidden rounded-t-lg">
                                        <div className="relative">
                                            <img
                                                src={program.thumbnail ? `/storage/${program.thumbnail}` : '/assets/images/placeholder.png'}
                                                alt={program.title}
                                                className="h-48 w-full rounded-t-lg object-cover transition-transform duration-300 group-hover:scale-105"
                                            />

                                            {/* Type Badge - Top Left */}
                                            <span className="absolute top-2 left-2 z-20 rounded-lg border border-white/40 bg-white/30 px-2 py-1 text-xs font-semibold shadow backdrop-blur-md dark:bg-gray-800/30 flex items-center gap-1">
                                                <GraduationCap size={12} />
                                                {program.type === 'scholarship'
                                                    ? t('certificationProgram.detail.related.badgeScholarship', 'Beasiswa')
                                                    : t('certificationProgram.detail.related.badgeRegular', 'Reguler')}
                                            </span>

                                            {/* Date Display - Bottom Right */}
                                            {deadlineDate && (
                                                <div className="absolute right-2 bottom-2 z-20 rounded-lg border border-white/40 bg-white/30 px-2 py-1 shadow backdrop-blur-md dark:bg-gray-800/30">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={12} />
                                                        <p className="text-xs font-semibold text-black dark:text-gray-400">
                                                            {format(deadlineDate, 'dd MMM yyyy', { locale: dateLocale })}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Discount Badge - Top Right */}
                                            {discount > 0 && (
                                                <div className="absolute top-2 right-2">
                                                    <Badge className="bg-red-500 text-white shadow-lg">
                                                        <Percent size={12} className="mr-1" />
                                                        {t('certificationProgram.detail.related.savePercent', {
                                                            percent: discount,
                                                            defaultValue: `Hemat ${discount}%`,
                                                        })}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <h2 className="mx-4 mt-2 line-clamp-2 text-left text-lg font-semibold">{program.title}</h2>
                                    </div>

                                    <div className="mt-auto w-full p-2 text-left">
                                        {(program.strikethrough_price ?? 0) > 0 && program.strikethrough_price! > program.price && (
                                            <p className="mb-0.5 px-2 text-xs text-red-600 line-through dark:text-gray-400">
                                                Rp {program.strikethrough_price!.toLocaleString('id-ID')}
                                            </p>
                                        )}
                                        <div className="mb-2 flex items-center justify-between gap-2 px-2">
                                            {(() => {
                                                const isApprovedScholarship = program.type === 'scholarship' && approvedScholarshipProgramIds?.includes(program.id);
                                                const isScholarshipNotApproved = program.type === 'scholarship' && !isApprovedScholarship;
                                                const displayPrice = isScholarshipNotApproved ? 0 : program.price;

                                                return displayPrice === 0 ? (
                                                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                        {t('certificationProgram.detail.related.free', 'Gratis')}
                                                    </p>
                                                ) : (
                                                    <p className="text-primary text-base font-bold dark:text-gray-200">
                                                        Rp {displayPrice.toLocaleString('id-ID')}
                                                    </p>
                                                );
                                            })()}
                                            {program.category && (
                                                <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                                                    {program.category.name}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="bg-primary/50 my-2 h-0.5 w-full rounded-full px-4" />
                                        
                                        {program.mentors && program.mentors.length > 0 && (
                                            <div className="mx-4 mt-2 flex items-center gap-2">
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
                                                                className="h-6 w-6 rounded-full border-2 border-white object-cover shadow dark:border-zinc-800"
                                                            />
                                                        ) : (
                                                            <div
                                                                key={mentor.id || idx}
                                                                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[9px] font-bold text-gray-600 shadow dark:border-zinc-800"
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

                                        <div className="mx-4 mt-3 flex items-center justify-center py-2">
                                            <span className="text-sm font-medium text-primary hover:underline">
                                                {t('certificationProgram.detail.related.viewDetail', 'Lihat Detail Program →')}
                                            </span>
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
