import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronUp, Lock, PlayCircle, Layers } from 'lucide-react';
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
            is_free?: boolean;
        }[];
    }[];
}

export default function ModulesSection({ course }: { course: Course }) {
    const { t } = useTranslation('user');
    const [expanded, setExpanded] = useState<React.Key | null>('0');

    return (
        <section className="mx-auto w-full max-w-7xl px-4 " id="modules">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6 flex items-center gap-3"
            >
                {/* <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Layers className="h-5 w-5 text-primary" />
                </div> */}
                <div>
                    <h2 className="dark:text-primary-foreground  mb-2 text-2xl font-bold md:text-3xl">
                        {t('course.detail.learningModules')}
                    </h2>
                    <p className="text-md text-gray-600 dark:text-gray-400">
                        {t('course.detail.modulesSubtitle')}
                    </p>
                </div>
            </motion.div>

            <Accordion
                className="flex w-full flex-col gap-2 divide-y divide-zinc-200 dark:divide-zinc-700"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                expandedValue={expanded}
                onValueChange={setExpanded}
            >
                {course.modules?.map((module, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * idx }}
                    >
                        <AccordionItem value={String(idx)} className="rounded-lg border-2 border-gray-300 p-4 dark:border-zinc-700">
                            <AccordionTrigger className="w-full text-left text-zinc-950 hover:cursor-pointer dark:text-zinc-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="border-primary bg-primary/20 text-primary dark:text-primary-foreground rounded-full border px-3 py-1 text-sm font-medium dark:bg-zinc-800">
                                            <p>{idx + 1}</p>
                                        </div>
                                        <p className="md:text-lg">{module.title}</p>
                                    </div>
                                    <ChevronUp className="text-primary h-4 w-4 transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul className="mt-2 space-y-2 text-sm text-zinc-500 md:text-base dark:text-zinc-400">
                                    {module.lessons?.length ? (
                                        module.lessons.map((lesson, lidx) => (
                                            <motion.li
                                                key={lidx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: 0.05 * lidx }}
                                                className="ms-8 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {lesson.is_free ? (
                                                        <PlayCircle size="14" className="text-green-500" />
                                                    ) : (
                                                        <Lock size="14" className="text-gray-400" />
                                                    )}
                                                    <p>{lesson.title}</p>
                                                </div>
                                            </motion.li>
                                        ))
                                    ) : (
                                        <li className="ms-8 text-zinc-400">{t('course.detail.noLessonsYet')}</li>
                                    )}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </motion.div>
                ))}
            </Accordion>
        </section>
    );
}