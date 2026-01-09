import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Star, User, Wrench } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';


interface Course {
    title: string;
    description?: string | null;
    key_points?: string | null;
    user?: { id: string; name: string; bio: string | null };
    images?: { image_url: string }[];
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
    tools?: { name: string; description?: string | null; icon: string | null }[]    ; // Tools dapat berupa string atau object
}

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

const tabList = [
    { key: 'highlight', label: 'Highlight' },
    { key: 'points', label: 'Poin Utama' },
    { key: 'modules', label: 'Modul' },
    { key: 'tools', label: 'Tools' },
];

export default function AboutSection({ course }: { course: Course }) {
    const [activeTab, setActiveTab] = useState('highlight');
    const keyPoints = parseList(course.key_points);

    // State for expanded accordion item
    const [expanded, setExpanded] = useState<React.Key | null>(null);

    return (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 lg:mb-16" id="about">
            
            {/* Tabs */}
            <div className="mb-6 sm:mb-8 overflow-x-auto">
                <div className="flex justify-start items-start gap-8 md:gap-40  min-w-max">
                    {tabList.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`py-2 text-sm sm:text-base md:text-lg whitespace-nowrap transition ${
                                activeTab === tab.key
                                    ? 'underline underline-offset-12 md:underline-offset-18 decoration-2 sm:decoration-3 md:decoration-4 text-primary font-medium'
                                    : 'hover:cursor-pointer hover:text-primary/70'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <Separator className="mt-0.1 sm:mt-0.5 py-0.4 md:py-0.5 max-w-xs md:max-w-3xl " />
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'highlight' && (
                    <>
                        <p className='font-literata font-medium text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4'>Highlight kelas</p>
                        <p className='mb-6 sm:mb-8 text-sm sm:text-base text-gray-600'>berisi highlight dari kelas ini yang akan memberikan gambaran singkat tentang apa yang akan kamu pelajari.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {course.images?.map((image, index) => (
                                <img
                                    key={index}
                                    src={image.image_url ? `/storage/${image.image_url}` : '/assets/images/placeholder.png'}
                                    alt={course.title}
                                    className="aspect-video rounded-lg border border-gray-200 object-cover shadow-md w-full"
                                />
                            ))}
                        </div>
                    </>
                )}
                {activeTab === 'points' && (
                    <>
                        <p className='font-literata font-medium text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4'>Poin Utama</p>
                        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-400">{course.description}</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {keyPoints.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2 sm:gap-3">
                                    <BadgeCheck className="mt-0.5 sm:mt-1 min-w-8 sm:min-w-10 md:min-w-12 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-green-600 flex-shrink-0" />
                                    <p className="text-sm sm:text-base">{req}</p>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                {activeTab === 'modules' && (
                    <div className="">
                        <p className='font-literata font-medium text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4'>Modul</p>
                        <p className='mb-6 sm:mb-8 text-sm sm:text-base text-gray-600'>berisi modul-modul pembelajaran yang akan membantu kamu memahami materi dengan lebih baik.</p>
                        {course.modules && course.modules.length > 0 ? (
                            <Accordion
                                className="flex w-full flex-col gap-2 sm:gap-3"
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                expandedValue={expanded}
                                onValueChange={setExpanded}
                            >
                                {course.modules.map((module, idx) => (
                                    <AccordionItem key={idx} value={String(idx)} className="w-full">
                                        <AccordionTrigger className="w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-semibold cursor-pointer rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                                <div className="border-primary bg-primary/20 text-primary dark:text-primary-foreground rounded-full border px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium dark:bg-zinc-800 flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <span className="font-semibold text-sm sm:text-base md:text-lg truncate sm:whitespace-normal">{module.title}</span>
                                            </div>
                                            <ArrowRight 
                                                className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-transform duration-200 ${
                                                    expanded === String(idx) ? 'rotate-90' : ''
                                                }`}
                                            />
                                        </AccordionTrigger>
                                        <AccordionContent className="w-full">
                                            <ul className="mt-2 px-3 sm:px-4 pb-2 text-xs sm:text-sm md:text-base text-zinc-500 dark:text-zinc-400">
                                                {module.lessons && module.lessons.length > 0 ? (
                                                    module.lessons.map((lesson, lidx) => (
                                                        <li key={lidx} className="ms-4 sm:ms-6 md:ms-8 flex items-start gap-2 py-1 sm:py-1.5">
                                                            {lesson.is_free ? (
                                                                <svg width="14" height="14" className="sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" className="text-green-500" strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke="currentColor" className="text-green-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                            ) : (
                                                                <svg width="14" height="14" className="sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"><rect x="6" y="11" width="12" height="8" rx="2" stroke="currentColor" className="text-gray-400" strokeWidth="2"/><path d="M12 7v4" stroke="currentColor" className="text-gray-400" strokeWidth="2" strokeLinecap="round"/></svg>
                                                            )}
                                                            <span className="flex-1">{lesson.title}</span>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="ms-4 sm:ms-6 md:ms-8 text-zinc-400 text-xs sm:text-sm">Belum ada materi</li>
                                                )}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <p className="text-gray-500 text-sm sm:text-base">Belum ada modul.</p>
                        )}
                    </div>
                )}
                {activeTab === 'tools' && (
                    <>
                        <p className='font-literata font-medium text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4'>Tools</p>
                        <p className='mb-6 sm:mb-8 text-sm sm:text-base text-gray-600'>berisi berbagai alat/software yang digunakan dalam kursus ini.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                            {course.tools?.map((tool) => (
                                <div
                                    key={tool.name}
                                    className="flex flex-col items-center justify-center gap-2 rounded-lg bg-white py-5 sm:py-6 shadow-md dark:bg-zinc-800 hover:shadow-lg transition-shadow"
                                >
                                    <img 
                                        src={tool.icon ? `/storage/${tool.icon}` : '/assets/images/placeholder.png'} 
                                        alt={tool.name} 
                                        className="w-12 h-12 md:w-14 md:h-14object-contain" 
                                    />
                                    <h3 className="text-xs sm:text-sm md:text-base font-semibold text-center line-clamp-2">{tool.name}</h3>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}