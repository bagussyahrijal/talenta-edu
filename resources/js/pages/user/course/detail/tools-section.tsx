import { Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Course {
    tools?: { name: string; description?: string | null; icon: string | null }[];
}

export default function ToolsSection({ course }: { course: Course }) {
    const { t } = useTranslation('user');

    return (
        <section className="mx-auto w-full max-w-7xl px-4" id="tools">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6 flex items-center gap-3"
            >
                
                <div>
                    <h2 className="dark:text-primary-foreground mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
                        {t('course.detail.supportingTools')}
                    </h2>
                    <p className="text-md text-gray-600 dark:text-gray-400">
                        {t('course.detail.toolsSubtitle')}
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {course.tools?.map((tool, index) => (
                    <motion.div
                        key={tool.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="group flex flex-col items-center justify-center gap-3 rounded-xl border-2 bg-white px-6 py-6 shadow-md transition-all hover:shadow-xl hover:scale-105 dark:bg-zinc-800 dark:border-zinc-700"
                    >
                        <div className="relative">
                            <img
                                src={tool.icon ? `/storage/${tool.icon}` : '/assets/images/placeholder.png'}
                                alt={tool.name}
                                className="h-16 w-16 object-contain transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <h3 className="text-center text-base font-semibold text-gray-900 md:text-lg dark:text-white">
                            {tool.name}
                        </h3>
                        {tool.description && (
                            <p className="text-center text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {tool.description}
                            </p>
                        )}
                    </motion.div>
                ))}
            </div>

            {(!course.tools || course.tools.length === 0) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center justify-center gap-4 py-12"
                >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
                        <Wrench className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                        {t('course.detail.noToolsYet')}
                    </p>
                </motion.div>
            )}
        </section>
    );
}