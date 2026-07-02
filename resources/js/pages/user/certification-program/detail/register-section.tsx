import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BadgeCheck, Calendar, CalendarDays, Clock, GraduationCap, MapPin, Users } from 'lucide-react';

interface Mentor {
    id: string;
    name: string;
}

interface Schedule {
    id: string;
    title?: string | null;
    schedule_date?: string;
    start_date?: string;
    day?: string;
    start_time?: string;
    end_time?: string;
}

interface CertificationProgram {
    id: string;
    title: string;
    slug: string;
    short_description?: string | null;
    type: 'regular' | 'scholarship';
    price: number;
    scholarship_price?: number;
    strikethrough_price?: number;
    registration_deadline?: string;
    socialization_registration_deadline?: string;
    thumbnail?: string | null;
    category?: { name: string };
    batch?: string | null;
    mentors: Mentor[];
    schedules: Schedule[];
    document_required?: boolean;
    document_description?: string | null;
}

interface RegisterSectionProps {
    program: CertificationProgram;
    isEnrolled: boolean;
    scholarshipApplication?: { status: string } | null;
}

export default function RegisterSection({ program, isEnrolled, scholarshipApplication }: RegisterSectionProps) {
    const { auth } = usePage<SharedData>().props;

    // Regular program deadline
    const regularDeadline = program.registration_deadline ? new Date(program.registration_deadline) : null;
    const isRegularRegistrationOpen = regularDeadline ? new Date() < regularDeadline : true;

    // Check if scholarship is approved (only matters for scholarship programs)
    const isScholarshipApproved = program.type === 'scholarship' ? scholarshipApplication?.status === 'approved' : true;
    const isScholarshipNotApproved = program.type === 'scholarship' && !isScholarshipApproved;
    const canRegisterRegular = isRegularRegistrationOpen && !isEnrolled && isScholarshipApproved;

    // Scholarship program deadline
    const scholarshipDeadline = program.socialization_registration_deadline ? new Date(program.socialization_registration_deadline) : null;
    const isScholarshipRegistrationOpen = scholarshipDeadline ? new Date() < scholarshipDeadline : true;
    const canRegisterScholarship = isScholarshipRegistrationOpen && !isEnrolled;

    const displayPrice = isScholarshipNotApproved ? 0 : (program.type === 'scholarship' ? (program.scholarship_price ?? program.price) : program.price);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getDate = (s: Schedule) => s.schedule_date || s.start_date || '';
    const firstSchedule = program.schedules.length > 0 ? getDate(program.schedules[0]) : null;
    const lastSchedule = program.schedules.length > 0 ? getDate(program.schedules[program.schedules.length - 1]) : null;

    return (
        <section className="mx-auto mt-4 md:mt-8 mb-8 sm:mb-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8" id="register">
            <div className="flex flex-wrap gap-2">
                {program.category && (
                    <Badge className='border-orange-400 bg-white text-orange-400 px-2 py-1 text-xs sm:text-sm'>{program.category.name}</Badge>
                )}
                <Badge className={`px-2 py-1 text-xs sm:text-sm ${program.type === 'scholarship' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    <GraduationCap size={14} className="mr-1" />
                    {program.type === 'scholarship' ? 'Beasiswa' : 'Reguler'}
                </Badge>
            </div>
            
            <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
                {/* Left Column - Program Details */}
                <div className="flex flex-col gap-4 sm:gap-6">
                    <div>
                        <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold font-literata text-gray-900 dark:text-gray-100 leading-tight">{program.title}</h1>
                    </div>
                    <div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            {program.short_description || 'Daftar sekarang dan tingkatkan kompetensi profesional Anda melalui program sertifikasi bersama para ahli.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                        {firstSchedule && lastSchedule && (
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                    {format(new Date(firstSchedule), 'dd MMM yyyy', { locale: id })} - {format(new Date(lastSchedule), 'dd MMM yyyy', { locale: id })}
                                </p>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                {program.schedules.length} Sesi Pertemuan
                            </p>
                        </div>
                    </div>

                    {/* Program Image */}
                    <img
                        src={program.thumbnail ? `/storage/${program.thumbnail}` : '/assets/images/placeholder.png'}
                        alt={program.title}
                        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg sm:rounded-xl object-cover border border-primary/50"
                    />
                </div>

                {/* Right Column - Price Card */}
                <div className="flex flex-col">
                    <div className="lg:sticky lg:top-4 rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                        {!isScholarshipNotApproved && program.strikethrough_price && program.strikethrough_price > 0 && (
                            <span className="block text-xs sm:text-sm text-gray-500 font-literata line-through mb-1">
                                {formatRupiah(program.strikethrough_price)}
                            </span>
                        )}
                        {displayPrice > 0 ? (
                            <h3 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-bold font-literata text-gray-900 dark:text-gray-100">
                                {formatRupiah(displayPrice)}
                            </h3>
                        ) : (
                            <h3 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-bold font-literata text-gray-900 dark:text-gray-100">GRATIS</h3>
                        )}

                        {!isScholarshipNotApproved && program.type === 'scholarship' && program.scholarship_price !== undefined && program.scholarship_price > 0 && (
                            <p className="mb-4 -mt-4 text-sm text-purple-600 dark:text-purple-400">Harga Beasiswa</p>
                        )}

                        <div className="space-y-3 mb-4 sm:mb-6">
                            {isEnrolled && (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center dark:border-green-800 dark:bg-green-900/20">
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">✓ Anda sudah terdaftar di program ini</p>
                                </div>
                            )}

                            {auth ? (
                                <>
                                    {!isEnrolled && program.type === 'scholarship' && !isScholarshipApproved ? null : (
                                        <Button asChild className="w-full rounded-lg text-sm sm:text-base py-5 sm:py-6" disabled={!canRegisterRegular}>
                                            <Link href={route('certification-programs.register', program.slug)}>
                                                {isEnrolled
                                                    ? '✓ Sudah Terdaftar'
                                                    : canRegisterRegular
                                                    ? 'Daftar Program Reguler'
                                                    : 'Pendaftaran Reguler Ditutup'}
                                            </Link>
                                        </Button>
                                    )}
                                    {program.type === 'scholarship' && !isScholarshipApproved && (
                                        <Button
                                            asChild
                                            disabled={!canRegisterScholarship}
                                            className={`w-full rounded-lg text-sm sm:text-base py-5 sm:py-6 ${!canRegisterScholarship ? 'cursor-not-allowed opacity-50' : ''}`}
                                        >
                                            <Link href={canRegisterScholarship ? route('certification-programs.register', { program: program.slug, scholarship: 1 }) : '#'}>
                                                <GraduationCap className="mr-2 h-5 w-5" />
                                                {canRegisterScholarship ? 'Ajukan Beasiswa' : 'Pendaftaran Beasiswa Ditutup'}
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <Button asChild className="w-full rounded-lg text-sm sm:text-base py-5 sm:py-6">
                                    <Link href={route('certification-programs.register', program.slug)}>Daftar Sekarang</Link>
                                </Button>
                            )}
                        </div>

                        <Separator className="mb-4 sm:mb-6" />

                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Online</span>
                            </div>
                            {program.batch && (
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <Users className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Batch {program.batch}</span>
                                </div>
                            )}
                        </div>

                        {program.document_required && (
                            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
                                <p className="font-semibold">Dokumen Pendukung Wajib</p>
                                <p className="mt-1 whitespace-pre-line text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                                    {program.document_description ?? 'Peserta wajib mengunggah dokumen pendukung.'}
                                </p>
                            </div>
                        )}

                        <Separator className="my-4 sm:my-6" />

                        {/* Jadwal Section */}
                        {program.schedules && program.schedules.length > 0 && (
                            <>
                                <div className="mb-3">
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jadwal Sesi:</p>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {program.schedules.map((schedule, idx) => {
                                            const dateValue = getDate(schedule);
                                            return (
                                                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900 p-2 rounded">
                                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                                                    <p className="capitalize">
                                                        {schedule.title || `Sesi ${idx + 1}`} | {dateValue ? format(new Date(dateValue), 'dd MMM yyyy', { locale: id }) : ''}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <Separator className="my-4 sm:my-6" />
                            </>
                        )}

                        <div className="space-y-2">
                            {program.type === 'scholarship' ? (
                                scholarshipDeadline && (
                                    <>
                                        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Batas Pengisian Form Beasiswa:</p>
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            {format(scholarshipDeadline, "EEEE, dd MMMM yyyy 'pukul' HH:mm", { locale: id })} WIB
                                        </p>
                                    </>
                                )
                            ) : (
                                regularDeadline && (
                                    <>
                                        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Terakhir pendaftaran:</p>
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            {format(regularDeadline, "EEEE, dd MMMM yyyy 'pukul' HH:mm", { locale: id })} WIB
                                        </p>
                                    </>
                                )
                            )}
                        </div>
                    </div>

                    {/* Benefits Section for Mobile - Shown only on mobile */}
                    <div className="block sm:hidden mt-6">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-zinc-700 dark:bg-zinc-800">
                            <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">
                                Yang Akan Kamu Dapatkan
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm">
                                    <BadgeCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">Sertifikat Resmi Profesional</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <BadgeCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">Materi Relevan Industri</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <BadgeCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">Bimbingan Mentor Expert</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <BadgeCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">Networking Profesional</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
