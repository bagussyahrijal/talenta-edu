import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { Link } from '@inertiajs/react';
import { Star, Award, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Webinar {
    user?: {
        id: string;
        name: string;
        bio?: string;
        avatar?: string;
    };
}

export default function MentorSection({ webinar }: { webinar: Webinar }) {
    const { t } = useTranslation('user');
    const getInitials = useInitials();

    if (!webinar.user) {
        return null;
    }

    const mentor = webinar.user;

    return (
        <section className="relative mx-auto w-full max-w-7xl px-4 pt-6 pb-12">
            <div className="relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 text-center"
                >
                    <div className="mb-3 flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
                            {t('webinar.detail.webinarSpeaker')}
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                        {t('webinar.detail.learnFromExpert')}
                    </h2>
                </motion.div>

                {/* Mentor Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Link
                        href={`/mentor/${mentor.id}`}
                        className="group relative block overflow-hidden rounded-2xl border-2 bg-white dark:bg-zinc-900 dark:border-zinc-700 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40"
                    >
                        <div className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-white dark:border-zinc-800 shadow-lg">
                                        <AvatarImage src={mentor.avatar} alt={mentor.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-3xl font-bold">
                                            {getInitials(mentor.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* Verified Badge */}
                                    <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 border-4 border-white dark:border-zinc-900 shadow-lg">
                                        <Award className="h-4 w-4 text-white" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="mb-2 text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                        {mentor.name}
                                    </h3>

                                    {/* Rating */}
                                    <div className="mb-3 flex items-center justify-center md:justify-start gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className="text-yellow-500"
                                                fill="currentColor"
                                            />
                                        ))}
                                        <span className="ml-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                            5.0
                                        </span>
                                    </div>

                                    {/* Bio */}
                                    {mentor.bio && (
                                        <p className="mb-4 text-sm md:text-base text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {mentor.bio}
                                        </p>
                                    )}

                                    {/* View Profile Link */}
                                    <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                                        <span>{t('webinar.detail.viewFullProfile')}</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}