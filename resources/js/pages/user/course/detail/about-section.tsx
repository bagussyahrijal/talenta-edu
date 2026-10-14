import { Link } from '@inertiajs/react';
import { BadgeCheck, Star, User, Award, Target, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Course {
    title: string;
    description?: string | null;
    key_points?: string | null;
    user?: { id: string; name: string; bio: string | null };
    images?: { image_url: string }[];
}

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

export default function AboutSection({ course }: { course: Course }) {
    const { t } = useTranslation('user');
    const keyPoints = parseList(course.key_points);

    return (
        <div className="space-y-12">
            {/* Deskripsi Kelas */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mx-auto w-full max-w-7xl px-4 "
                id="about"
            >
                        <div>
                            <h2 className="text-2xl md:text-3xl mb-2 font-bold text-gray-900 dark:text-white">
                                {t('course.detail.aboutTitle')}
                            </h2>
                            <p className="text-md mb-8 text-gray-600 dark:text-gray-400">
                                {t('course.detail.aboutSubtitle')}
                            </p>
                        </div>
                <div className="rounded-2xl border-2 bg-gradient-to-br from-primary/5 to-secondary/5 p-8 shadow-lg dark:from-primary/10 dark:to-secondary/10 dark:border-zinc-700">
                    
                    <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                        {course.description}
                    </p>
                </div>
            </motion.section>

            {/* Highlight Images */}
            {course.images && course.images.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mx-auto w-full max-w-7xl px-4"
                >
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                            <Target className="h-5 w-5 text-secondary" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {t('course.detail.classHighlight')}
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {course.images.map((image, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.1 * index }}
                                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg transition-all hover:shadow-2xl dark:border-zinc-700"
                            >
                                <img
                                    src={image.image_url ? `/storage/${image.image_url}` : '/assets/images/placeholder.png'}
                                    alt={`${course.title} - Highlight ${index + 1}`}
                                    className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Key Points */}
            {keyPoints.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mx-auto w-full max-w-7xl px-4"
                >
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                            <BadgeCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {t('course.detail.whatYouWillLearn')}
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {keyPoints.map((point, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.05 * idx }}
                                className="flex items-start gap-3 rounded-xl border-2 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-zinc-900 dark:border-zinc-700"
                            >
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <BadgeCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                    {point}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Mentor Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mx-auto w-full max-w-7xl px-4"
            >
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t('course.detail.learnFromExperts')}
                    </h3>
                </div>

                {course.user?.name === 'Admin' ? (
                    <div className="rounded-2xl border-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-zinc-700">
                        <div className="flex items-center gap-6">
                            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg">
                                <User className="h-10 w-10 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    {course.user?.name}
                                </h4>
                                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                    {course.user?.bio || t('course.detail.defaultBio')}
                                </p>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={20} className="text-yellow-500" fill="currentColor" />
                                    ))}
                                    <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        5.0 {t('course.detail.rating')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link
                        href={`/mentor/${course.user?.id}`}
                        className="block rounded-2xl border-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02] dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-zinc-700"
                    >
                        <div className="flex items-center gap-6">
                            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg">
                                <User className="h-10 w-10 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    {course.user?.name}
                                </h4>
                                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                    {course.user?.bio || t('course.detail.professionalInstructor')}
                                </p>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={20} className="text-yellow-500" fill="currentColor" />
                                    ))}
                                    <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        5.0 {t('course.detail.rating')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}
            </motion.section>
        </div>
    );
}