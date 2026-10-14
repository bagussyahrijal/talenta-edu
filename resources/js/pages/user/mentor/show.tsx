import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInitials } from '@/hooks/use-initials';
import UserLayout from '@/layouts/user-layout';
import { rupiahFormatter } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import {
    BookOpen,
    BookText,
    Calendar,
    CalendarDays,
    Clock,
    Eye,
    FileText,
    Mail,
    MonitorPlay,
    Phone,
    Presentation,
    Star,
    Users,
    Video,
    Award,
    TrendingUp,
} from 'lucide-react';
import { motion, easeOut } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Category {
    id: string;
    name: string;
}

interface Course {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    category: Category;
    price: number;
    discount_price?: number;
    level: string;
    students_count: number;
    rating: number;
}

interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    thumbnail?: string;
    category: Category;
    read_time: number;
    views: number;
    published_at: string;
}

interface Webinar {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    category: Category;
    price: number;
    strikethrough_price: number;
    start_time: string;
    end_time: string;
    batch?: number;
    registration_deadline: string;
    is_registration_closed: boolean;
}

interface Bootcamp {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    category: Category;
    price: number;
    strikethrough_price: number;
    start_date: string;
    end_date: string;
    batch?: number;
    registration_deadline: string;
    is_registration_closed: boolean;
    duration_weeks: number;
}

interface Mentor {
    id: string;
    name: string;
    bio?: string;
    avatar?: string;
    email: string;
    phone_number?: string;
}

interface Stats {
    total_courses: number;
    total_articles: number;
    total_webinars: number;
    total_bootcamps: number;
}

interface MentorShowProps {
    mentor: Mentor;
    courses: Course[];
    articles: Article[];
    webinars: Webinar[];
    bootcamps: Bootcamp[];
    stats: Stats;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: easeOut,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: easeOut,
        },
    },
};

export default function MentorShow({ mentor, courses, articles, webinars, bootcamps, stats }: MentorShowProps) {
    const { t, i18n } = useTranslation('user');
    const dateFnsLocale = i18n.language === 'en' ? enUS : id;
    const getInitials = useInitials();

    const levelColors: Record<string, string> = {
        beginner: 'bg-green-100 text-green-700 border-green-200',
        intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        advanced: 'bg-red-100 text-red-700 border-red-200',
    };

    const levelLabels: Record<string, string> = {
        beginner: t('mentor.levels.beginner'),
        intermediate: t('mentor.levels.intermediate'),
        advanced: t('mentor.levels.advanced'),
    };

    const totalContent = stats.total_courses + stats.total_articles + stats.total_webinars + stats.total_bootcamps;

    return (
        <UserLayout>
            <Head title={`Mentor - ${mentor.name}`} />

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="relative"
                        >
                            {/* Profile Section */}
                            <motion.div
                                variants={itemVariants}
                                className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                            >
                                {/* Background Pattern */}
                                <div className="absolute right-0 top-0 h-64 w-64 -translate-y-16 translate-x-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl" />
                                
                                <div className="relative p-8 md:p-10">
                                    <div className="flex flex-col gap-8 md:flex-row md:items-start">
                                        {/* Avatar */}
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                            className="relative mx-auto md:mx-0"
                                        >
                                            <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-4 ring-primary/20 md:h-40 md:w-40 dark:border-gray-800">
                                                <AvatarImage src={mentor.avatar} alt={mentor.name} />
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-4xl font-bold text-white md:text-5xl">
                                                    {getInitials(mentor.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-3 -right-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 p-3 shadow-lg">
                                                <Award className="h-6 w-6 text-white" />
                                            </div>
                                        </motion.div>

                                        {/* Info */}
                                        <div className="flex-1 text-center md:text-left">
                                            <motion.div variants={itemVariants}>
                                                <Badge className="mb-3 bg-primary/10 text-primary">
                                                    <Star className="mr-1 h-3 w-3" />
                                                    {t('mentor.proBadge')}
                                                </Badge>
                                                <h1 className="mb-3 text-3xl font-bold md:text-4xl">{mentor.name}</h1>
                                                <p className="mb-6 text-base text-gray-600 dark:text-gray-400 md:text-lg">
                                                    {mentor.bio || t('mentor.defaultBio')}
                                                </p>
                                            </motion.div>

                                            {/* Contact Info */}
                                            <motion.div variants={itemVariants} className="mb-6 flex flex-wrap justify-center gap-4 md:justify-start">
                                                {mentor.email && (
                                                    <a
                                                        href={`mailto:${mentor.email}`}
                                                        className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                                                    >
                                                        <Mail className="h-4 w-4 text-primary" />
                                                        <span>{mentor.email}</span>
                                                    </a>
                                                )}
                                                {mentor.phone_number && (
                                                    <a
                                                        href={`tel:${mentor.phone_number}`}
                                                        className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                                                    >
                                                        <Phone className="h-4 w-4 text-primary" />
                                                        <span>{mentor.phone_number}</span>
                                                    </a>
                                                )}
                                            </motion.div>

                                            {/* Total Content Badge */}
                                            <motion.div
                                                variants={itemVariants}
                                                className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-3 shadow-sm"
                                            >
                                                <TrendingUp className="h-5 w-5 text-primary" />
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('mentor.totalContent')}</p>
                                                    <p className="text-2xl font-bold text-primary">{totalContent}</p>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <motion.div
                                        variants={containerVariants}
                                        className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3"
                                    >
                                        <motion.div
                                            variants={itemVariants}
                                            className="group relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm transition-all hover:shadow-md dark:border-blue-800 dark:from-blue-900/20 dark:to-gray-800"
                                        >
                                            <div className="relative z-10">
                                                <BookText className="mb-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
                                                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.total_courses}</p>
                                                <p className="text-sm text-blue-600 dark:text-blue-400">{t('mentor.onlineCourse')}</p>
                                            </div>
                                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-100/50 blur-2xl dark:bg-blue-500/10" />
                                        </motion.div>

                                        <motion.div
                                            variants={itemVariants}
                                            className="group relative overflow-hidden rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm transition-all hover:shadow-md dark:border-green-800 dark:from-green-900/20 dark:to-gray-800"
                                        >
                                            <div className="relative z-10">
                                                <Presentation className="mb-3 h-8 w-8 text-green-600 dark:text-green-400" />
                                                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.total_bootcamps}</p>
                                                <p className="text-sm text-green-600 dark:text-green-400">{t('mentor.stats.bootcamps')}</p>
                                            </div>
                                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-green-100/50 blur-2xl dark:bg-green-500/10" />
                                        </motion.div>

                                        {/* <motion.div
                                            variants={itemVariants}
                                            className="group relative overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm transition-all hover:shadow-md dark:border-orange-800 dark:from-orange-900/20 dark:to-gray-800"
                                        >
                                            <div className="relative z-10">
                                                <MonitorPlay className="mb-3 h-8 w-8 text-orange-600 dark:text-orange-400" />
                                                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{stats.total_webinars}</p>
                                                <p className="text-sm text-orange-600 dark:text-orange-400">Webinar</p>
                                            </div>
                                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-100/50 blur-2xl dark:bg-orange-500/10" />
                                        </motion.div> */}

                                        <motion.div
                                            variants={itemVariants}
                                            className="group relative overflow-hidden rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm transition-all hover:shadow-md dark:border-purple-800 dark:from-purple-900/20 dark:to-gray-800"
                                        >
                                            <div className="relative z-10">
                                                <FileText className="mb-3 h-8 w-8 text-purple-600 dark:text-purple-400" />
                                                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{stats.total_articles}</p>
                                                <p className="text-sm text-purple-600 dark:text-purple-400">{t('mentor.stats.articles')}</p>
                                            </div>
                                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-100/50 blur-2xl dark:bg-purple-500/10" />
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Tabs defaultValue="courses" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800">
                                <TabsTrigger value="courses" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                    <BookText className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">{t('mentor.stats.courses')}</span> ({courses.length})
                                </TabsTrigger>
                                <TabsTrigger value="bootcamps" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">{t('mentor.stats.bootcamps')}</span> ({bootcamps.length})
                                </TabsTrigger>
                                {/* <TabsTrigger value="webinars" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                    <Video className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Webinar</span> ({webinars.length})
                                </TabsTrigger> */}
                                <TabsTrigger value="articles" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">{t('mentor.stats.articles')}</span> ({articles.length})
                                </TabsTrigger>
                            </TabsList>

                            {/* Courses Tab */}
                            <TabsContent value="courses" className="mt-6">
                                {courses.length > 0 ? (
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        variants={containerVariants}
                                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                                    >
                                        {courses.map((course) => (
                                            <motion.div key={course.id} variants={cardVariants}>
                                                <Link href={`/course/${course.slug}`} className="group block h-full">
                                                    <div className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                                                        <div className="relative aspect-video overflow-hidden">
                                                            <img
                                                                src={course.thumbnail ? `/storage/${course.thumbnail}` : '/assets/images/placeholder.png'}
                                                                alt={course.title}
                                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                                        </div>
                                                        <div className="p-5">
                                                            <div className="mb-3 flex items-center justify-between">
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {course.category.name}
                                                                </Badge>
                                                                <Badge className={`border text-xs ${levelColors[course.level] || 'bg-gray-100 text-gray-700'}`}>
                                                                    {levelLabels[course.level] || course.level}
                                                                </Badge>
                                                            </div>

                                                            <h3 className="mb-3 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
                                                                {course.title}
                                                            </h3>

                                                            <div className="mb-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                                <div className="flex items-center gap-1">
                                                                    <Users className="h-4 w-4" />
                                                                    {course.students_count}
                                                                </div>
                                                                {course.rating > 0 && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                        {course.rating}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <Separator className="mb-4" />

                                                            <div className="flex items-center justify-between">
                                                                {course.discount_price ? (
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 line-through">
                                                                            {rupiahFormatter.format(course.price)}
                                                                        </p>
                                                                        <p className="text-xl font-bold text-primary">
                                                                            {rupiahFormatter.format(course.discount_price)}
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xl font-bold text-primary">
                                                                        {course.price === 0 ? t('mentor.free') : rupiahFormatter.format(course.price)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50"
                                    >
                                        <div className="mb-4 text-6xl">📚</div>
                                        <h3 className="mb-2 text-xl font-semibold">{t('mentor.emptyCourseTitle')}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{t('mentor.emptyCourseDesc')}</p>
                                    </motion.div>
                                )}
                            </TabsContent>

                            {/* Bootcamps Tab */}
                            <TabsContent value="bootcamps" className="mt-6">
                                {bootcamps.length > 0 ? (
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        variants={containerVariants}
                                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                                    >
                                        {bootcamps.map((bootcamp) => {
                                            const isDisabled = bootcamp.is_registration_closed;
                                            const content = (
                                                <div
                                                    className={`h-full overflow-hidden rounded-xl border border-gray-200 bg-white transition-all dark:border-gray-700 dark:bg-gray-800 ${
                                                        isDisabled ? 'opacity-60' : 'hover:-translate-y-1 hover:shadow-xl'
                                                    }`}
                                                >
                                                    <div className="relative aspect-video overflow-hidden">
                                                        <img
                                                            src={bootcamp.thumbnail ? `/storage/${bootcamp.thumbnail}` : '/assets/images/placeholder.png'}
                                                            alt={bootcamp.title}
                                                            className={`h-full w-full object-cover ${!isDisabled && 'transition-transform duration-300 group-hover:scale-110'}`}
                                                        />
                                                        {isDisabled && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                                                <Badge variant="destructive" className="px-4 py-2 text-sm font-semibold">
                                                                    {t('mentor.registrationClosed')}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-5">
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <Badge variant="secondary" className="text-xs">
                                                                {bootcamp.category.name}
                                                            </Badge>
                                                            {bootcamp.batch && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {t('mentor.batch', { batch: bootcamp.batch })}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <h3
                                                            className={`mb-3 line-clamp-2 text-lg font-semibold transition-colors ${
                                                                !isDisabled && 'group-hover:text-primary'
                                                            }`}
                                                        >
                                                            {bootcamp.title}
                                                        </h3>

                                                        <div className="mb-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarDays className="h-4 w-4" />
                                                                {format(new Date(bootcamp.start_date), 'dd MMM', { locale: dateFnsLocale })} -{' '}
                                                                {format(new Date(bootcamp.end_date), 'dd MMM yyyy', { locale: dateFnsLocale })}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4" />
                                                                {t('mentor.weeks', { count: bootcamp.duration_weeks })}
                                                            </div>
                                                        </div>

                                                        <Separator className="mb-4" />

                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                {bootcamp.strikethrough_price > 0 && (
                                                                    <p className="text-xs text-gray-500 line-through">
                                                                        {rupiahFormatter.format(bootcamp.strikethrough_price)}
                                                                    </p>
                                                                )}
                                                                <p className={`text-xl font-bold ${isDisabled ? 'text-gray-500' : 'text-primary'}`}>
                                                                    {bootcamp.price === 0 ? t('mentor.free') : rupiahFormatter.format(bootcamp.price)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );

                                            return (
                                                <motion.div key={bootcamp.id} variants={cardVariants}>
                                                    {isDisabled ? (
                                                        <div className="group block h-full cursor-not-allowed">
                                                            {content}
                                                        </div>
                                                    ) : (
                                                        <Link href={`/bootcamp/${bootcamp.slug}`} className="group block h-full">
                                                            {content}
                                                        </Link>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50"
                                    >
                                        <div className="mb-4 text-6xl">🎓</div>
                                        <h3 className="mb-2 text-xl font-semibold">{t('mentor.emptyBootcampTitle')}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{t('mentor.emptyBootcampDesc')}</p>
                                    </motion.div>
                                )}
                            </TabsContent>

                            {/* Webinars Tab */}
                            {/* <TabsContent value="webinars" className="mt-6">
                                {webinars.length > 0 ? (
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        variants={containerVariants}
                                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                                    >
                                        {webinars.map((webinar) => {
                                            const isDisabled = webinar.is_registration_closed;
                                            const LinkOrDiv = isDisabled ? 'div' : Link;
                                            const linkProps = isDisabled ? {} : { href: `/webinar/${webinar.slug}` };

                                            return (
                                                <motion.div key={webinar.id} variants={cardVariants}>
                                                    <LinkOrDiv {...linkProps} className={`group block h-full ${isDisabled ? 'cursor-not-allowed' : ''}`}>
                                                        <div
                                                            className={`h-full overflow-hidden rounded-xl border border-gray-200 bg-white transition-all dark:border-gray-700 dark:bg-gray-800 ${
                                                                isDisabled ? 'opacity-60' : 'hover:-translate-y-1 hover:shadow-xl'
                                                            }`}
                                                        >
                                                            <div className="relative aspect-video overflow-hidden">
                                                                <img
                                                                    src={webinar.thumbnail ? `/storage/${webinar.thumbnail}` : '/assets/images/placeholder.png'}
                                                                    alt={webinar.title}
                                                                    className={`h-full w-full object-cover ${!isDisabled && 'transition-transform duration-300 group-hover:scale-110'}`}
                                                                />
                                                                {isDisabled && (
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                                                        <Badge variant="destructive" className="px-4 py-2 text-sm font-semibold">
                                                                            Pendaftaran Ditutup
                                                                        </Badge>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="p-5">
                                                                <div className="mb-3 flex items-center justify-between">
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {webinar.category.name}
                                                                    </Badge>
                                                                    {webinar.batch && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            Batch {webinar.batch}
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <h3
                                                                    className={`mb-3 line-clamp-2 text-lg font-semibold transition-colors ${
                                                                        !isDisabled && 'group-hover:text-primary'
                                                                    }`}
                                                                >
                                                                    {webinar.title}
                                                                </h3>

                                                                <div className="mb-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                                    <div className="flex items-center gap-2">
                                                                        <CalendarDays className="h-4 w-4" />
                                                                        {format(new Date(webinar.start_time), 'dd MMM yyyy', { locale: id })}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4" />
                                                                        {format(new Date(webinar.start_time), 'HH:mm', { locale: id })} -{' '}
                                                                        {format(new Date(webinar.end_time), 'HH:mm', { locale: id })} WIB
                                                                    </div>
                                                                </div>

                                                                <Separator className="mb-4" />

                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        {webinar.strikethrough_price > 0 && (
                                                                            <p className="text-xs text-gray-500 line-through">
                                                                                {rupiahFormatter.format(webinar.strikethrough_price)}
                                                                            </p>
                                                                        )}
                                                                        <p className={`text-xl font-bold ${isDisabled ? 'text-gray-500' : 'text-primary'}`}>
                                                                            {webinar.price === 0 ? 'Gratis' : rupiahFormatter.format(webinar.price)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </LinkOrDiv>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50"
                                    >
                                        <div className="mb-4 text-6xl">🎥</div>
                                        <h3 className="mb-2 text-xl font-semibold">Belum Ada Webinar</h3>
                                        <p className="text-gray-600 dark:text-gray-400">Mentor belum mengajar webinar apapun.</p>
                                    </motion.div>
                                )}
                            </TabsContent> */}

                            {/* Articles Tab */}
                            <TabsContent value="articles" className="mt-6">
                                {articles.length > 0 ? (
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        variants={containerVariants}
                                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                                    >
                                        {articles.map((article) => (
                                            <motion.div key={article.id} variants={cardVariants}>
                                                <Link href={`/article/${article.slug}`} className="group block h-full">
                                                    <div className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                                                        <div className="relative aspect-video overflow-hidden">
                                                            <img
                                                                src={article.thumbnail ? `/storage/${article.thumbnail}` : '/assets/images/placeholder.png'}
                                                                alt={article.title}
                                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                            />
                                                        </div>
                                                        <div className="p-5">
                                                            <Badge variant="secondary" className="mb-3 text-xs">
                                                                {article.category.name}
                                                            </Badge>

                                                            <h3 className="mb-3 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
                                                                {article.title}
                                                            </h3>

                                                            {article.excerpt && (
                                                                <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{article.excerpt}</p>
                                                            )}

                                                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="h-4 w-4" />
                                                                        {t('article.min', { count: article.read_time })}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Eye className="h-4 w-4" />
                                                                        {article.views}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4" />
                                                                    {format(new Date(article.published_at), 'dd MMM', { locale: dateFnsLocale })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50"
                                    >
                                        <div className="mb-4 text-6xl">📝</div>
                                        <h3 className="mb-2 text-xl font-semibold">{t('mentor.emptyArticleTitle')}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{t('mentor.emptyArticleDesc')}</p>
                                    </motion.div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </div>
            </div>
        </UserLayout>
    );
}