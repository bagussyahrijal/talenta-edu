import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { Link } from '@inertiajs/react';
import { ArrowRight, Award, Sparkles, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Mentor {
    id: string;
    name: string;
    bio?: string;
    avatar?: string | null;
}

interface Bootcamp {
    mentors?: Mentor[];
}

export default function MentorSection({ bootcamp }: { bootcamp: Bootcamp }) {
    const { t } = useTranslation('user');
    const getInitials = useInitials();
    const mentors = bootcamp.mentors ?? [];

    const getAvatarSrc = (avatar?: string | null) => {
        if (!avatar) {
            return null;
        }

        if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/')) {
            return avatar;
        }

        return `/storage/${avatar}`;
    };

    if (mentors.length === 0) {
        return null;
    }

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
                        <Sparkles className="text-primary h-5 w-5" />
                        <span className="bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-semibold">
                            {mentors.length === 1 ? t('bootcamp.detail.mentorBadgeSingle') : t('bootcamp.detail.mentorBadgeMultiple')}
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
                        {mentors.length === 1 ? t('bootcamp.detail.mentorTitleSingle') : t('bootcamp.detail.mentorTitleMultiple')}
                    </h2>
                </motion.div>

                {/* Mentor Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
                >
                    {mentors.map((mentor) => (
                        <Link
                            key={mentor.id}
                            href={`/mentor/${mentor.id}`}
                            className="group hover:border-primary/40 relative block overflow-hidden rounded-2xl border-2 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col items-center gap-6 text-center">
                                    <div className="relative flex-shrink-0">
                                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg md:h-28 md:w-28 dark:border-zinc-800">
                                            <AvatarImage src={getAvatarSrc(mentor.avatar) ?? undefined} alt={mentor.name} />
                                            <AvatarFallback className="from-primary to-secondary bg-gradient-to-br text-3xl font-bold text-white">
                                                {getInitials(mentor.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-green-500 shadow-lg dark:border-zinc-900">
                                            <Award className="h-4 w-4 text-white" />
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <h3 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl dark:text-white">{mentor.name}</h3>

                                        <div className="mb-3 flex items-center justify-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={16} className="text-yellow-500" fill="currentColor" />
                                            ))}
                                            <span className="ml-2 text-sm font-semibold text-gray-600 dark:text-gray-400">5.0</span>
                                        </div>

                                        <p className="mb-4 line-clamp-3 min-h-[3.75rem] text-sm text-gray-600 md:text-base dark:text-gray-400">
                                            {mentor.bio ?? t('bootcamp.detail.mentorDefaultBio')}
                                        </p>

                                        <div className="text-primary inline-flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3">
                                            <span>{t('bootcamp.detail.viewFullProfile')}</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
