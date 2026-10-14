import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { BookOpen, ListChecks, Users, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeroSection from './hero-section';
import MentorSection from './mentor-section';
import RegisterSection from './register-section';
import RelatedProduct from './related-product';
import RequirementSection from './requirement-section';
import TimelineSection from './timeline-section';
import ToolsSection from './tools-section';

interface Mentor {
    id: string;
    name: string;
    bio?: string;
    avatar?: string | null;
}

interface Bootcamp {
    id: string;
    title: string;
    category?: { name: string };
    category_id?: string;
    schedules?: { schedule_date: string; day: string; start_time: string; end_time: string }[];
    tools?: { name: string; description?: string | null; icon: string | null }[];
    batch?: string | null;
    strikethrough_price: number;
    price: number;
    quota: number;
    start_date: string;
    end_date: string;
    registration_deadline: string;
    status: string;
    bootcamp_url: string;
    registration_url: string;
    thumbnail?: string | null;
    description?: string | null;
    benefits?: string | null;
    instructions?: string | null;
    requirements?: string | null;
    curriculum?: string | null;
    mentors?: Mentor[];
    created_at: string | Date;
}

interface RelatedBootcamp {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
    price: number;
    strikethrough_price: number;
    start_date: string;
    end_date: string;
    category?: {
        id: string;
        name: string;
    };
    mentors?: Mentor[];
}

interface ReferralInfo {
    code?: string;
    hasActive: boolean;
}

export default function Bootcamp({
    bootcamp,
    relatedBootcamps,
    myBootcampIds,
    referralInfo,
}: {
    bootcamp: Bootcamp;
    relatedBootcamps: RelatedBootcamp[];
    myBootcampIds: string[];
    referralInfo: ReferralInfo;
}) {
    const { t } = useTranslation('user');
    const [activeTab, setActiveTab] = useState('curriculum');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get('ref');

        if (refFromUrl) {
            sessionStorage.setItem('affiliate_code', refFromUrl);
        }
    }, [referralInfo]);

    return (
        <div className="from-primary/10 to-secondary/10 relative min-h-screen bg-gradient-to-br via-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Global Decorative Background */}
            <div className="bg-primary/20 pointer-events-none absolute -top-32 -left-32 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />
            <div className="bg-secondary/20 pointer-events-none absolute -top-32 -right-0 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />
            <div className="bg-primary/20 pointer-events-none absolute -bottom-0 -left-32 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />
            <div className="bg-secondary/20 pointer-events-none absolute -right-0 -bottom-0 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />

            <UserLayout>
                <Head title={t('bootcamp.detail.headTitle', { title: bootcamp.title })} />

                <HeroSection bootcamp={bootcamp} />

                {/* Tabs Section */}
                <div className="relative z-10 mx-auto mt-6 mb-6 w-full max-w-7xl px-3 sm:px-4 md:mt-8 md:mb-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-xl border-2 border-gray-200 bg-white p-1.5 shadow-lg sm:grid-cols-4 sm:rounded-2xl sm:p-1 dark:border-zinc-700 dark:bg-zinc-900">
                            <TabsTrigger
                                value="curriculum"
                                className="data-[state=active]:bg-primary flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all duration-200 data-[state=active]:text-white sm:gap-2 sm:rounded-xl sm:px-3 sm:py-3 sm:text-sm"
                            >
                                <BookOpen className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">{t('bootcamp.detail.tabCurriculum')}</span>
                                <span className="sm:hidden">{t('bootcamp.detail.tabCurriculumShort')}</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="requirements"
                                className="data-[state=active]:bg-primary flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all duration-200 data-[state=active]:text-white sm:gap-2 sm:rounded-xl sm:px-3 sm:py-3 sm:text-sm"
                            >
                                <ListChecks className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">{t('bootcamp.detail.tabRequirements')}</span>
                                <span className="sm:hidden">{t('bootcamp.detail.tabRequirementsShort')}</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="tools"
                                className="data-[state=active]:bg-primary flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all duration-200 data-[state=active]:text-white sm:gap-2 sm:rounded-xl sm:px-3 sm:py-3 sm:text-sm"
                            >
                                <Wrench className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                                <span>{t('bootcamp.detail.tabTools')}</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="mentor"
                                className="data-[state=active]:bg-primary flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all duration-200 data-[state=active]:text-white sm:gap-2 sm:rounded-xl sm:px-3 sm:py-3 sm:text-sm"
                            >
                                <Users className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                                <span>{t('bootcamp.detail.tabMentors')}</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="curriculum" className="mt-4 sm:mt-6 md:mt-8">
                            <TimelineSection bootcamp={bootcamp} />
                        </TabsContent>

                        <TabsContent value="requirements" className="mt-4 sm:mt-6 md:mt-8">
                            <RequirementSection bootcamp={bootcamp} />
                        </TabsContent>

                        <TabsContent value="tools" className="mt-4 sm:mt-6 md:mt-8">
                            <ToolsSection bootcamp={bootcamp} />
                        </TabsContent>

                        <TabsContent value="mentor" className="mt-4 sm:mt-6 md:mt-8">
                            <MentorSection bootcamp={bootcamp} />
                        </TabsContent>
                    </Tabs>
                </div>

                <RegisterSection bootcamp={bootcamp} />
                <RelatedProduct relatedBootcamps={relatedBootcamps} myBootcampIds={myBootcampIds} />
            </UserLayout>
        </div>
    );
}
