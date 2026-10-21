import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BadgeCheck, CalendarDays, ChartArea, Clock, Hourglass, MapPin, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
}

export default function RegisterSection({ bootcamp }: { bootcamp: Bootcamp }) {
    const { t, i18n } = useTranslation('user');
    const { auth } = usePage<SharedData>().props;
    const locale = i18n.language === 'en' ? 'en-US' : 'id-ID';
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
    buttonText = t('bootcamp.detail.btnRegisterNow', 'Daftar Sekarang');
    warningMessage = null;

    const deadline = new Date(bootcamp.registration_deadline);
    const isRegistrationOpen = new Date() < deadline;

    return (
        <section className="mx-auto mt-4 md:mt-8 mb-8 sm:mb-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8" id="register">
            <Badge className='border-orange-400 bg-white text-orange-400 px-2 py-1 text-xs sm:text-sm'>{t('bootcamp.detail.intensiveBadge', 'Bootcamp Online')}</Badge>
            <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
                {/* Left Column - Bootcamp Details */}
                <div className="flex flex-col gap-4 sm:gap-6">
                    <div>
                        <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold font-literata text-gray-900 dark:text-gray-100 leading-tight">{bootcamp.title}</h1>
                    </div>
                    <div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            {bootcamp.description || t('bootcamp.detail.locationScheduleSubtitle', 'Daftar sekarang dan dapatkan bimbingan dari mentor ahli dan akses materi pembelajaran yang lengkap.')}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                {new Date(bootcamp.start_date).toLocaleDateString(locale, {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}{' '}
                                -{' '}
                                {new Date(bootcamp.end_date).toLocaleDateString(locale, {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ChartArea className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                {diffDays < 7 ? t('bootcamp.detail.daysCount', { count: diffDays, defaultValue: `${diffDays} Hari` }) : t('bootcamp.detail.weeksCount', { count: totalWeeks, defaultValue: `${totalWeeks} Minggu` })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                {bootcamp.quota ? t('bootcamp.detail.quotaParticipants', { quota: bootcamp.quota, defaultValue: `Kuota ${bootcamp.quota} Peserta` }) : t('bootcamp.detail.unlimitedQuota', 'Kuota Tidak Terbatas')}
                            </p>
                        </div>
                    </div>

                    {/* Bootcamp Image */}
                    <img
                        src={bootcamp.thumbnail ? `/storage/${bootcamp.thumbnail}` : '/assets/images/placeholder.png'}
                        alt={bootcamp.title}
                        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg sm:rounded-xl object-cover border border-primary/50"
                    />
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
                            <h3 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-bold font-literata text-gray-900 dark:text-gray-100">{t('bootcamp.detail.free', 'GRATIS')}</h3>
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
                                {t('bootcamp.detail.registrationClosed', 'Pendaftaran Ditutup')}
                            </Button>
                        )}

                        <Separator className="mb-4 sm:mb-6" />

                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('bootcamp.detail.online', 'Online')}</span>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <Hourglass className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('bootcamp.detail.batch', { batch: bootcamp.batch, defaultValue: `Batch ${bootcamp.batch}` })}</span>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <Users className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                    {bootcamp.quota ? t('bootcamp.detail.quotaParticipants', { quota: bootcamp.quota, defaultValue: `Kuota ${bootcamp.quota} Peserta` }) : t('bootcamp.detail.unlimitedQuota', 'Kuota Tidak Terbatas')}
                                </span>
                            </div>
                        </div>

                        <Separator className="my-4 sm:my-6" />

                        {/* Jadwal Section */}
                        {bootcamp.schedules && bootcamp.schedules.length > 0 && (
                            <>
                                <div className="mb-3">
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('bootcamp.detail.bootcampSchedule', 'Jadwal Pertemuan:')}</p>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {bootcamp.schedules.map((schedule, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900 p-2 rounded">
                                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                                                <p className="capitalize">
                                                    {schedule.day}, {new Date(schedule.schedule_date).toLocaleDateString(locale, {
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
                            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{t('bootcamp.detail.deadline', 'Terakhir pendaftaran:')}</p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                {new Date(bootcamp.registration_deadline).toLocaleDateString(locale, {
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
                                {t('bootcamp.register.whatYouWillGet', 'Yang Akan Kamu Dapatkan')}
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm">
                                    <BadgeCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">{t('bootcamp.detail.guidedByExpert', 'Dibimbing Mentor Expert')}</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <BadgeCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">{t('bootcamp.detail.practicalMaterial', 'Materi Praktis & Aplikatif')}</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <BadgeCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">{t('bootcamp.detail.moduleAvailable', 'Tersedia Modul Pembelajaran')}</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <BadgeCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">{t('bootcamp.detail.handsOn', 'Project Real World')}</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}