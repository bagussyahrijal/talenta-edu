import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BadgeCheck, BookOpen, Calendar, ChartBar, Clock, FileText, MessageCircle, Monitor, User } from 'lucide-react';

interface Course {
    title: string;
    thumbnail?: string | null;
    strikethrough_price: number;
    short_description?: string | null;
    user?: { id: string; name: string; bio: string | null };
    price: number;
    registration_url: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    created_at: string;
    modules?: {
        title: string;
        description?: string | null;
        lessons?: {
            title: string;
            description?: string | null;
            type: 'text' | 'video' | 'file' | 'quiz';
            video_url?: string | null;
        }[];
    }[];
}

export default function RegisterSection({ course }: { course: Course }) {
    const { auth } = usePage<SharedData>().props;
    const totalLessons = course.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0;

    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number;

    let registrationUrl: string;
    let buttonText: string;
    let warningMessage: string | null = null;

    if (!isLoggedIn) {
        registrationUrl = course.registration_url;
        buttonText = 'Login untuk Mendaftar';
        warningMessage = 'Anda harus login terlebih dahulu!';
    } else if (!isProfileComplete) {
        registrationUrl = route('profile.edit', { redirect: window.location.href });
        buttonText = 'Lengkapi Profil untuk Mendaftar';
        warningMessage = 'Profil Anda belum lengkap!';
    } else {
        registrationUrl = course.registration_url;
        buttonText = 'Beli Sekarang';
        warningMessage = null;
    }

    return (
        <section className="mx-auto mt-4 md:mt-8 mb-8 sm:mb-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8" id="register">
            <Badge className='border-green-400 bg-white text-green-400 px-2 py-1 text-xs sm:text-sm'>Kelas Online</Badge>
            <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
                {/* Left Column - Course Details */}
                <div className="flex flex-col gap-4 sm:gap-6">
                    <div>
                        <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold font-literata text-gray-900 dark:text-gray-100 leading-tight">{course.title}</h1>
                    </div>
                    <div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{course.short_description}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                        <div className="flex items-center gap-2">
                            <ChartBar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 capitalize">{course.level}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                            {new Date(course.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })}
                            </p>
                        </div>
                    </div>
                    
                    {/* Course Image */}
                    <img
                        src={course.thumbnail ? `/storage/${course.thumbnail}` : '/assets/images/placeholder.png'}
                        alt={course.title}
                        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg sm:rounded-xl object-cover border border-primary/50"
                    />

                    {/* Instructor Section - Hidden on mobile, shown on tablet+ */}
                    <div className="hidden sm:block">
                        {course.user?.name === 'Admin' ? (
                            <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4">
                                <div className="rounded-full bg-gray-200 p-2">
                                    <User className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">{course.user?.name}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{course.user?.bio}</p>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href={`/mentor/${course.user?.id}`}
                                className="flex items-center gap-3 sm:gap-4 rounded-lg border border-gray-200 bg-white p-3 sm:p-4 shadow-md transition hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                            >
                                <div className="rounded-full bg-gray-200 p-2">
                                    <User className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">{course.user?.name}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{course.user?.bio}</p>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Right Column - Price Card */}
                <div className="flex flex-col">
                    <div className="lg:sticky lg:top-4 rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                        {course.strikethrough_price > 0 && (
                            <span className="block text-xs sm:text-sm text-gray-500 font-literata line-through mb-1">
                                Rp {course.strikethrough_price.toLocaleString('id-ID')}
                            </span>
                        )}
                        {course.price > 0 ? (
                            <h3 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-bold font-literata text-gray-900 dark:text-gray-100">
                                Rp {course.price.toLocaleString('id-ID')}
                            </h3>
                        ) : (
                            <h3 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-bold font-literata text-gray-900 dark:text-gray-100">GRATIS</h3>
                        )}

                        {warningMessage && (
                            <div className="mb-3 sm:mb-4 p-2 sm:p-3 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{warningMessage}</p>
                            </div>
                        )}

                        <Button className="mb-4 sm:mb-6 w-full rounded-lg text-sm sm:text-base py-5 sm:py-6" asChild>
                            <Link href={registrationUrl}>{buttonText}</Link>
                        </Button>

                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{totalLessons} modul pembelajaran</span>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">akses selamanya</span>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">grup diskusi aktif</span>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">E-modul</span>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">E-Sertifikat</span>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <Monitor className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">dapat diakses di komputer, laptop dan mobile</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Instructor Section for Mobile - Shown only on mobile */}
                    <div className="block sm:hidden mt-6">
                        {course.user?.name === 'Admin' ? (
                            <div className="flex items-center gap-3 py-3">
                                <div className="rounded-full bg-gray-200 p-2">
                                    <User className="h-10 w-10 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{course.user?.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{course.user?.bio}</p>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href={`/mentor/${course.user?.id}`}
                                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-md transition active:shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                            >
                                <div className="rounded-full bg-gray-200 p-2">
                                    <User className="h-10 w-10 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{course.user?.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{course.user?.bio}</p>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}