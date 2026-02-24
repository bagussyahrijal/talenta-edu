import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BadgeCheck, CalendarDays, ChartArea, Clock, Hourglass, MapPin, Users } from 'lucide-react';

interface Bootcamp {
    title: string;
    batch?: string | null;
    strikethrough_price: number;
    price: number;
    quota: number;
    description?: string | null;
    start_date: string;
    end_date: string;
    schedules?: { schedule_date: string; day: string; start_time: string; end_time: string }[];
    registration_deadline: string;
    registration_url: string;
    thumbnail?: string | null;
    user?: {
        id: string;
        name: string;
        bio?: string;
        avatar?: string;
    };
}

export default function RegisterSection({ bootcamp }: { bootcamp: Bootcamp }) {
    const { auth } = usePage<SharedData>().props;
    const start = new Date(bootcamp.start_date);
    const end = new Date(bootcamp.end_date);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000)) + 1;
    const totalWeeks = Math.ceil(diffDays / 7);

    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number;

    let registrationUrl: string;
    let buttonText: string;
    let warningMessage: string | null = null;

    registrationUrl = bootcamp.registration_url;
    buttonText = 'Daftar Sekarang';
    warningMessage = null;


    const deadline = new Date(bootcamp.registration_deadline);
    const isRegistrationOpen = new Date() < deadline;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <section className="mx-auto mt-4 md:mt-8 mb-8 sm:mb-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8" id="register">
            <Badge className='border-orange-400 bg-white text-orange-400 px-2 py-1 text-xs sm:text-sm'>Bootcamp Online</Badge>
            <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
                {/* Left Column - Bootcamp Details */}
                <div className="flex flex-col gap-4 sm:gap-6">
                    <div>
                        <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold font-literata text-gray-900 dark:text-gray-100 leading-tight">{bootcamp.title}</h1>
                    </div>
                    <div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            {bootcamp.description || 'Daftar sekarang dan dapatkan bimbingan dari mentor ahli dan akses materi pembelajaran yang lengkap.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                {new Date(bootcamp.start_date).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}{' '}
                                -{' '}
                                {new Date(bootcamp.end_date).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ChartArea className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                {diffDays < 7 ? `${diffDays} Hari` : `${totalWeeks} Minggu`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                Kuota {bootcamp.quota ? `${bootcamp.quota} Peserta` : 'Tidak Terbatas'}
                            </p>
                        </div>
                    </div>

                    {/* Bootcamp Image */}
                    <img
                        src={bootcamp.thumbnail ? `/storage/${bootcamp.thumbnail}` : '/assets/images/placeholder.png'}
                        alt={bootcamp.title}
                        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg sm:rounded-xl object-cover border border-primary/50"
                    />

                    {/* Mentor Section - Hidden on mobile, shown on tablet+ */}
                    {bootcamp.user && (
                        <div className="hidden sm:block">
                            <Link
                                href={`/mentor/${bootcamp.user.id}`}
                                className="flex items-center justify-between gap-4 dark:border-zinc-700 dark:bg-zinc-800"
                            >
                                <div className="flex w-full items-center gap-4">
                                    <Avatar className="ring-primary/20 h-12 w-12 ring-4 md:h-16 md:w-16">
                                        <AvatarImage src={bootcamp.user.avatar} alt={bootcamp.user.name} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold md:text-3xl">
                                            {getInitials(bootcamp.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="w-full">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{bootcamp.user.name}</h3>
                                        </div>
                                        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{bootcamp.user.bio}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Right Column - Price Card */}
                <div className="flex flex-col">
                    <div className="lg:sticky lg:top-4 rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                        {bootcamp.strikethrough_price > 0 && (
                            <span className="block text-xs sm:text-sm text-gray-500 font-literata line-through mb-1">
                                Rp {bootcamp.strikethrough_price.toLocaleString('id-ID')}
                            </span>
                        )}
                        {bootcamp.price > 0 ? (
                            <h3 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-bold font-literata text-gray-900 dark:text-gray-100">
                                Rp {bootcamp.price.toLocaleString('id-ID')}
                            </h3>
                        ) : (
                            <h3 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-bold font-literata text-gray-900 dark:text-gray-100">GRATIS</h3>
                        )}

                        {warningMessage && (
                            <div className="mb-3 sm:mb-4 p-2 sm:p-3 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{warningMessage}</p>
                            </div>
                        )}

                        {isRegistrationOpen ? (
                            <Button className="mb-4 sm:mb-6 w-full rounded-lg text-sm sm:text-base py-5 sm:py-6" asChild>
                                <Link href={registrationUrl}>{buttonText}</Link>
                            </Button>
                        ) : (
                            <Button className="mb-4 sm:mb-6 w-full rounded-lg text-sm sm:text-base py-5 sm:py-6" disabled>
                                Pendaftaran Ditutup
                            </Button>
                        )}

                        <Separator className="mb-4 sm:mb-6" />

                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Online</span>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <Hourglass className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Batch {bootcamp.batch}</span>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <Users className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                    Kuota {bootcamp.quota ? `${bootcamp.quota} Peserta` : 'Tidak Terbatas'}
                                </span>
                            </div>
                        </div>

                        <Separator className="my-4 sm:my-6" />

                        {/* Jadwal Section */}
                        {bootcamp.schedules && bootcamp.schedules.length > 0 && (
                            <>
                                <div className="mb-3">
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jadwal Pertemuan:</p>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {bootcamp.schedules.map((schedule, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900 p-2 rounded">
                                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                                                <p className="capitalize">
                                                    {schedule.day}, {new Date(schedule.schedule_date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })} | {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)} WIB
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator className="my-4 sm:my-6" />
                            </>
                        )}

                        <div className="space-y-1 sm:space-y-2">
                            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Terakhir pendaftaran:</p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                {new Date(bootcamp.registration_deadline).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
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
                                    <p className="text-gray-700 dark:text-gray-300">Dibimbing Mentor Expert</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <BadgeCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">Materi Praktis & Aplikatif</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <BadgeCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">Tersedia Modul Pembelajaran</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <BadgeCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">Project Real World</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Mentor Section for Mobile - Shown only on mobile */}
                    {bootcamp.user && (
                        <div className="block sm:hidden mt-6">
                            <p className="text-primary border-primary bg-background mb-4 w-fit rounded-full border bg-gradient-to-t from-[#D9E5FF] to-white px-4 py-1 text-sm font-medium shadow-xs">
                                Mentor Bootcamp
                            </p>
                            <Link
                                href={`/mentor/${bootcamp.user.id}`}
                                className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-md transition active:shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                            >
                                <div className="flex w-full items-center gap-4">
                                    <Avatar className="ring-primary/20 h-12 w-12 ring-4">
                                        <AvatarImage src={bootcamp.user.avatar} alt={bootcamp.user.name} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                                            {getInitials(bootcamp.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="w-full">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{bootcamp.user.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{bootcamp.user.bio}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}