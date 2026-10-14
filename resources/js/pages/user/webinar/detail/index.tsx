import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BenefitsSection from './benefits-section';
import HeroSection from './hero-section';
import MentorSection from './mentor-section';
import RegisterSection from './register-section';
import RelatedProduct from './related-product';
import ToolsSection from './tools-section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Wrench, Users } from 'lucide-react';

interface Webinar {
    id: string;
    title: string;
    category?: { name: string };
    category_id?: string;
    tools?: { name: string; description?: string | null; icon: string | null }[];
    batch?: string | null;
    strikethrough_price: number;
    price: number;
    quota: number;
    start_time: string;
    end_time: string;
    registration_deadline: string;
    status: string;
    webinar_url: string;
    registration_url: string;
    thumbnail?: string | null;
    description?: string | null;
    benefits?: string | null;
    instructions?: string | null;
    user?: {
        id: string;
        name: string;
        bio?: string;
        avatar?: string;
    };
    created_at: string | Date;
}

interface RelatedWebinar {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
    price: number;
    strikethrough_price: number;
    start_time: string;
    category?: {
        name: string;
    };
}

interface ReferralInfo {
    code?: string;
    hasActive: boolean;
}

export default function Webinar({
    webinar,
    relatedWebinars,
    myWebinarIds,
    referralInfo,
}: {
    webinar: Webinar;
    relatedWebinars: RelatedWebinar[];
    myWebinarIds: string[];
    referralInfo: ReferralInfo;
}) {
    const { t } = useTranslation('user');
    const [activeTab, setActiveTab] = useState('benefits');

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
            <div className="pointer-events-none absolute -bottom-0  -left-32 z-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-0 -right-0 z-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />
         
        <UserLayout>
            <Head title={t('webinar.detail.headTitle', { title: webinar.title })} />

            <HeroSection webinar={webinar} />
            
            {/* Tabs Section */}
            <div className="relative z-10 mx-auto mt-6 md:mt-8 mb-6 md:mb-8 w-full max-w-7xl px-3 sm:px-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 gap-2 h-auto p-1.5 sm:p-1 bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-200 dark:border-zinc-700">
                        <TabsTrigger 
                            value="benefits" 
                            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
                        >
                            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{t('webinar.detail.tabBenefits')}</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="tools" 
                            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
                        >
                            <Wrench className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{t('webinar.detail.tabTools')}</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="mentor" 
                            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
                        >
                            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{t('webinar.detail.tabMentor')}</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="benefits" className="mt-4 sm:mt-6 md:mt-8">
                        <BenefitsSection webinar={webinar} />
                    </TabsContent>

                    <TabsContent value="tools" className="mt-4 sm:mt-6 md:mt-8">
                        <ToolsSection webinar={webinar} />
                    </TabsContent>

                    <TabsContent value="mentor" className="mt-4 sm:mt-6 md:mt-8">
                        <MentorSection webinar={webinar} />
                    </TabsContent>
                </Tabs>
            </div>

            <RegisterSection webinar={webinar} />
            <RelatedProduct relatedWebinars={relatedWebinars} myWebinarIds={myWebinarIds} />
        </UserLayout>
        </div>
    );
}