import { Button } from '@/components/ui/button';
import { TransitionPanel } from '@/components/ui/transition-panel';
import { PlayCircle, Clock, FileText, CheckCircle, Lock } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Course {
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

interface VideoSectionProps {
    course: Course;
    onNavigateToModules?: () => void;
}

function getYoutubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
}

export default function VideoSection({ course, onNavigateToModules }: VideoSectionProps) {
    const { t } = useTranslation('user');
    const [activeIndex, setActiveIndex] = useState(0);

    const items =
        course.modules
            ?.flatMap((module) =>
                (module.lessons?.filter((lesson) => lesson.type === 'video') || []).map((lesson) => ({
                    title: lesson.title,
                    videoUrl: lesson.video_url,
                    description: lesson.description,
                })),
            )
            .slice(0, 2) || [];

    const totalLessons = course.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0;
    const totalVideos = course.modules?.reduce((total, module) => total + (module.lessons?.filter(l => l.type === 'video').length || 0), 0) || 0;

    return (
        <section className="mx-auto w-full max-w-7xl px-4 ">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
            >
                <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {t('course.detail.previewTab')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    {t('course.detail.previewSubtitle')}
                </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Video Player */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
                        <TransitionPanel
                            activeIndex={activeIndex}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            variants={{
                                enter: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
                                center: { opacity: 1, scale: 1, filter: 'blur(0px)' },
                                exit: { opacity: 0, scale: 1.05, filter: 'blur(10px)' },
                            }}
                            className="aspect-video w-full"
                        >
                            {items.map((item, index) => (
                                <div key={index} className="aspect-video w-full">
                                    {item?.videoUrl ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={
                                                item?.videoUrl?.includes('youtube.com') || item?.videoUrl?.includes('youtu.be')
                                                    ? `https://www.youtube.com/embed/${getYoutubeId(item.videoUrl)}`
                                                    : ''
                                            }
                                            title="YouTube video player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="h-full w-full"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gray-800">
                                            <div className="text-center">
                                                <PlayCircle className="mx-auto mb-4 h-16 w-16 text-gray-600" />
                                                <p className="text-gray-400">{t('course.detail.videoUnavailable')}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </TransitionPanel>
                        
                        {/* Video Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                            <h3 className="mb-2 text-xl font-bold text-white">
                                {items[activeIndex]?.title}
                            </h3>
                            {items[activeIndex]?.description && (
                                <p className="text-sm text-gray-300 line-clamp-2">
                                    {items[activeIndex]?.description}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Playlist Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="lg:col-span-1"
                >
                    <div className="rounded-2xl border-2 bg-white p-6 shadow-xl dark:bg-zinc-900 dark:border-zinc-700">
                        {/* Header */}
                        <div className="mb-6">
                            <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                                {t('course.detail.materialList')}
                            </h3>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <FileText className="h-4 w-4" />
                                    <span>{t('course.detail.totalLessonsCount', { count: totalLessons })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <PlayCircle className="h-4 w-4" />
                                    <span>{t('course.detail.totalVideosCount', { count: totalVideos })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Playlist */}
                        <div className="mb-6 space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-600">
                            {items.map((item, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`group relative w-full overflow-hidden rounded-xl border-2 transition-all ${
                                        activeIndex === index
                                            ? 'border-primary bg-primary/5 shadow-lg'
                                            : 'border-gray-200 bg-gray-50 hover:border-primary/40 hover:bg-primary/5 dark:border-zinc-700 dark:bg-zinc-800/50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3 p-4">
                                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                                            activeIndex === index 
                                                ? 'bg-primary text-white' 
                                                : 'bg-gray-200 text-gray-600 group-hover:bg-primary/20 group-hover:text-primary dark:bg-zinc-700 dark:text-zinc-400'
                                        }`}>
                                            <PlayCircle className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h4 className={`text-sm font-semibold mb-1 ${
                                                activeIndex === index ? 'text-primary' : 'text-gray-900 dark:text-white'
                                            }`}>
                                                {item?.title}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Clock className="h-3 w-3" />
                                                <span>{t('course.detail.freePreview')}</span>
                                            </div>
                                        </div>
                                        {activeIndex === index && (
                                            <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                            
                            {/* Locked Content */}
                            <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-100 dark:border-zinc-600 dark:bg-zinc-800/50">
                                <div className="flex items-center gap-3 p-4 opacity-60">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-300 dark:bg-zinc-700">
                                        <Lock className="h-5 w-5 text-gray-600 dark:text-zinc-400" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {t('course.detail.otherMaterialsCount', { count: totalLessons - items.length })}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {t('course.detail.accessAfterJoin')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="space-y-3">
                            <a href="#register">
                                <Button className="w-full py-6 text-base font-bold shadow-lg" size="lg">
                                    <PlayCircle className="mr-2 h-5 w-5" />
                                    {t('course.detail.joinNow')}
                                </Button>
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}