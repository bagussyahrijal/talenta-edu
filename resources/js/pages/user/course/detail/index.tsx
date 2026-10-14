import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AboutSection from './about-section';
import HeroSection from './hero-section';
import ModulesSection from './modules-section';
import RegisterSection from './register-section';
import RelatedProduct from './related-product';
import ToolsSection from './tools-section';
import VideoSection from './video-section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Layers, Wrench, PlayCircle } from 'lucide-react';

interface Course {
    id: string;
    title: string;
    user?: { id: string; name: string; bio: string | null };
    category?: { name: string };
    category_id?: string;
    tools?: { name: string; description?: string | null; icon: string | null }[];
    images?: { image_url: string }[];
    short_description?: string | null;
    description?: string | null;
    key_points?: string | null;
    strikethrough_price: number;
    price: number;
    thumbnail?: string | null;
    course_url: string;
    registration_url: string;
    status: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    created_at: string;
    updated_at: string;
    modules?: {
        title: string;
        description?: string | null;
        lessons?: {
            title: string;
            description?: string | null;
            type: 'text' | 'video' | 'file' | 'quiz';
            attachment?: string | null;
            video_url?: string | null;
            is_free?: boolean;
        }[];
    }[];
}

interface RelatedCourse {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
    price: number;
    strikethrough_price: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    category?: {
        name: string;
    };
}

interface ReferralInfo {
    code?: string;
    hasActive: boolean;
}

export default function DetailCourse({
    course,
    relatedCourses,
    myCourseIds,
    referralInfo,
}: {
    course: Course;
    relatedCourses: RelatedCourse[];
    myCourseIds: string[];
    referralInfo: ReferralInfo;
}) {
    const { t } = useTranslation('user');
    const [activeTab, setActiveTab] = useState('preview');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get('ref');

        if (refFromUrl) {
            sessionStorage.setItem('affiliate_code', refFromUrl);
        }
    }, [referralInfo]);

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Global Decorative Background */}
            <div className="pointer-events-none absolute -top-32 -left-32 z-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -top-32 -right-0 z-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-0 -left-32 z-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-0 -right-0 z-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />

            <UserLayout>
                <Head title={`${course.title} - ${t('course.title')}`} />

                <HeroSection course={course} />

                {/* Tabs Section */}
                <div className="relative z-10 mx-auto mt-6 md:mt-8 mb-6 md:mb-8 w-full max-w-7xl px-3 sm:px-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 h-auto p-1.5 sm:p-1 bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-200 dark:border-zinc-700">
                            <TabsTrigger 
                                value="preview" 
                                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
                            >
                                <PlayCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="hidden sm:inline">{t('course.detail.previewTab')}</span>
                                <span className="sm:hidden">{t('course.detail.previewTabShort')}</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="about" 
                                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
                            >
                                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="hidden sm:inline">{t('course.detail.navAbout')}</span>
                                <span className="sm:hidden">{t('course.detail.infoTabShort')}</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="modules" 
                                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
                            >
                                <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span>{t('course.detail.navModules')}</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="tools" 
                                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
                            >
                                <Wrench className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span>{t('course.detail.navTools')}</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="preview" className="mt-4 sm:mt-6 md:mt-8">
                            <VideoSection course={course} onNavigateToModules={() => setActiveTab('modules')} />
                        </TabsContent>

                        <TabsContent value="about" className="mt-4 sm:mt-6 md:mt-8">
                            <AboutSection course={course} />
                        </TabsContent>

                        <TabsContent value="modules" className="mt-4 sm:mt-6 md:mt-8">
                            <ModulesSection course={course} />
                        </TabsContent>

                        <TabsContent value="tools" className="mt-4 sm:mt-6 md:mt-8">
                            <ToolsSection course={course} />
                        </TabsContent>
                    </Tabs>
                </div>

                <RegisterSection course={course} />
                <RelatedProduct relatedCourses={relatedCourses} myCourseIds={myCourseIds} />
            </UserLayout>
        </div>
    );
}