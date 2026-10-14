import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, BookText, FileText, Video, Users, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Mentor {
    id: string;
    name: string;
    bio?: string;
    avatar?: string;
    total_courses: number;
    total_articles: number;
    total_webinars: number;
    total_bootcamps: number;
}

interface MentorIndexProps {
    mentors: Mentor[];
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
            ease: "easeOut" as const,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut" as const,
        },
    },
};

export default function MentorIndex({ mentors }: MentorIndexProps) {
    const { t } = useTranslation('user');
    const getInitials = useInitials();

    const getTotalContent = (mentor: Mentor) => {
        return mentor.total_courses + mentor.total_articles + mentor.total_webinars + mentor.total_bootcamps;
    };

    return (
        <UserLayout>
            <Head title={t('mentor.headTitle')} />

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
                        <motion.div
                            className="relative text-center"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                        >
                            <motion.div
                                variants={itemVariants}
                                className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                            >
                                <Award className="h-4 w-4" />
                                <span>{t('mentor.proBadge')}</span>
                            </motion.div>
                            
                            <motion.h1 variants={itemVariants} className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
                                {t('mentor.heroTitle1')}
                                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"> {t('mentor.heroHighlight')} </span>
                                {t('mentor.heroTitle2')}
                            </motion.h1>
                            
                            <motion.p
                                variants={itemVariants}
                                className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400"
                            >
                                {t('mentor.heroDesc')}
                            </motion.p>

                            {/* Stats */}
                            <motion.div
                                variants={containerVariants}
                                className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4"
                            >
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
                                >
                                    <Users className="mx-auto mb-2 h-8 w-8 text-primary" />
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{mentors.length}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('mentor.activeMentors')}</p>
                                </motion.div>
                                
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
                                >
                                    <BookText className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {mentors.reduce((sum, m) => sum + m.total_courses, 0)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('mentor.totalCourses')}</p>
                                </motion.div>
                                
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
                                >
                                    <Video className="mx-auto mb-2 h-8 w-8 text-green-600" />
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {mentors.reduce((sum, m) => sum + m.total_bootcamps, 0)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('mentor.totalBootcamps')}</p>
                                </motion.div>
                                
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
                                >
                                    <FileText className="mx-auto mb-2 h-8 w-8 text-purple-600" />
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {mentors.reduce((sum, m) => sum + m.total_articles, 0)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('mentor.totalArticles')}</p>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Mentors Grid */}
                <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
                    {mentors.length > 0 ? (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                        >
                            {mentors.map((mentor) => (
                                <motion.div key={mentor.id} variants={cardVariants}>
                                    <Link href={`/mentor/${mentor.id}`}>
                                        <div className="group relative h-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 dark:border-gray-700 dark:bg-gray-800">
                                            {/* Background Pattern */}
                                            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-2xl transition-transform group-hover:scale-150" />

                                            <div className="relative p-6">
                                                {/* Avatar & Name */}
                                                <div className="mb-6 text-center">
                                                    <div className="relative mx-auto mb-4 inline-block">
                                                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-4 ring-primary/20 transition-all group-hover:ring-primary/40 dark:border-gray-800">
                                                            <AvatarImage src={mentor.avatar} alt={mentor.name} />
                                                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-2xl font-bold text-white">
                                                                {getInitials(mentor.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute -bottom-2 -right-2 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 shadow-lg">
                                                            <Star className="h-4 w-4 fill-white text-white" />
                                                        </div>
                                                    </div>
                                                    <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-primary dark:text-white">
                                                        {mentor.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {mentor.bio || t('mentor.defaultBio')}
                                                    </p>
                                                </div>

                                                {/* Divider */}
                                                <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />

                                                {/* Stats Grid */}
                                                <div className="mb-6 grid grid-cols-2 gap-3">
                                                    <div className="group/stat rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 transition-all hover:shadow-md dark:from-blue-900/20 dark:to-blue-800/10">
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <BookText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                            <Badge variant="secondary" className="bg-blue-600 text-xs text-white">
                                                                {mentor.total_courses}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">{t('mentor.onlineCourse')}</p>
                                                    </div>

                                                    {/* <div className="group/stat rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 p-4 transition-all hover:shadow-md dark:from-green-900/20 dark:to-green-800/10">
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <Video className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                            <Badge variant="secondary" className="bg-green-600 text-xs text-white">
                                                                {mentor.total_webinars}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs font-medium text-green-700 dark:text-green-300">Webinar</p>
                                                    </div> */}

                                                    <div className="group/stat rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 transition-all hover:shadow-md dark:from-orange-900/20 dark:to-orange-800/10">
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                            <Badge variant="secondary" className="bg-orange-600 text-xs text-white">
                                                                {mentor.total_bootcamps}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs font-medium text-orange-700 dark:text-orange-300">{t('mentor.stats.bootcamps')}</p>
                                                    </div>

                                                    <div className="group/stat rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 transition-all hover:shadow-md dark:from-purple-900/20 dark:to-purple-800/10">
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                            <Badge variant="secondary" className="bg-purple-600 text-xs text-white">
                                                                {mentor.total_articles}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs font-medium text-purple-700 dark:text-purple-300">{t('mentor.stats.articles')}</p>
                                                    </div>
                                                </div>

                                                {/* Total Content Badge */}
                                                <div className="mb-4 rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700/50">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('mentor.totalContent')}</p>
                                                    <p className="text-2xl font-bold text-primary">{getTotalContent(mentor)}</p>
                                                </div>

                                                {/* CTA Button */}
                                                <Button className="group/btn relative w-full overflow-hidden bg-gradient-to-r from-primary to-primary/80 transition-all hover:shadow-lg hover:shadow-primary/30">
                                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                                        {t('mentor.viewProfile')}
                                                        <svg
                                                            className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </span>
                                                </Button>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50"
                        >
                            <div className="mb-6 text-8xl">👨‍🏫</div>
                            <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{t('mentor.noMentors')}</h3>
                            <p className="mb-8 max-w-md text-center text-gray-600 dark:text-gray-400">
                                {t('mentor.noMentorsDesc2')}
                            </p>
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/">{t('mentor.backHome')}</Link>
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}   