import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { BookOpen, Calendar, ListChecks, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeroSection from './hero-section';
import InformationSection from './information-section';
import MentorSection from './mentor-section';
import RegisterSection from './register-section';
import RelatedPrograms from './related-programs';
import RequirementSection from './requirement-section';
import ScheduleInfoSection from './schedule-info-section';

interface Mentor {
    id: string;
    name: string;
    bio?: string;
    avatar?: string;
}

interface Schedule {
    id: string;
    title?: string | null;
    schedule_date?: string;
    start_date?: string;
    day?: string;
    start_time?: string;
    end_time?: string;
}

interface Program {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    description: string;
    benefits: string;
    terms_conditions?: string | null;
    scholarship_flow?: string | null;
    type: 'regular' | 'scholarship';
    status: string;
    category: { id: string; name: string };
    price: number;
    scholarship_price?: number;
    strikethrough_price?: number;
    thumbnail?: string | null;
    registration_deadline?: string;
    socialization_registration_deadline?: string;
    group_url?: string;
    batch?: string;
    document_required?: boolean;
    document_description?: string | null;
    schedules: Schedule[];
    socializationSchedules: Schedule[];
    mentors: Mentor[];
}

interface RelatedProgram {
    id: string;
    title: string;
    slug: string;
    type: 'regular' | 'scholarship';
    price: number;
    strikethrough_price?: number;
    category?: { name: string };
    thumbnail?: string | null;
    registration_deadline?: string;
}

interface DetailProps {
    program: Program;
    relatedPrograms: RelatedProgram[];
    myProgramIds: string[];
    scholarshipApplication?: { status: string } | null;
    approvedScholarshipProgramIds?: string[];
}

export default function Detail({ program, relatedPrograms, myProgramIds, scholarshipApplication, approvedScholarshipProgramIds = [] }: DetailProps) {
    const { t } = useTranslation('user');
    const isEnrolled = myProgramIds.includes(program.id);
    const [activeTab, setActiveTab] = useState('information');

    const hasMentors = program.mentors && program.mentors.length > 0;
    const hasRequirements = program.terms_conditions || (program.type === 'scholarship' && program.scholarship_flow);
    const hasSchedule = program.schedules && program.schedules.length > 0;

    // Count tabs for responsive grid
    const tabCount = 1 + (hasSchedule ? 1 : 0) + (hasRequirements ? 1 : 0) + (hasMentors ? 1 : 0);
    const gridColsClass = tabCount === 4 ? 'sm:grid-cols-4' : tabCount === 3 ? 'sm:grid-cols-3' : tabCount === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-1';

    return (
        <div className="from-primary/10 to-secondary/10 relative min-h-screen bg-gradient-to-br via-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Global Decorative Background */}
            <div className="bg-primary/20 pointer-events-none absolute -top-32 -left-32 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />
            <div className="bg-secondary/20 pointer-events-none absolute -top-32 -right-0 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />
            <div className="bg-primary/20 pointer-events-none absolute -bottom-0 -left-32 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />
            <div className="bg-secondary/20 pointer-events-none absolute -right-0 -bottom-0 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />

            <UserLayout>
                <Head title={t('certificationProgram.detail.headTitle', { title: program.title, defaultValue: `${program.title} - Program Sertifikasi` })} />

                <HeroSection program={program} />

                {/* Tabs Section */}
                <div className="relative z-10 mx-auto mt-6 mb-6 w-full max-w-7xl px-3 sm:px-4 md:mt-8 md:mb-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className={`grid h-auto w-full grid-cols-2 gap-2 ${gridColsClass} rounded-xl border-2 border-gray-200 bg-white p-1.5 shadow-lg sm:rounded-2xl sm:p-1 dark:border-zinc-700 dark:bg-zinc-900`}>
                            <TabsTrigger
                                value="information"
                                className="data-[state=active]:bg-primary flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all duration-200 data-[state=active]:text-white sm:gap-2 sm:rounded-xl sm:px-3 sm:py-3 sm:text-sm"
                            >
                                <BookOpen className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">{t('certificationProgram.detail.tabs.information', 'Informasi')}</span>
                                <span className="sm:hidden">{t('certificationProgram.detail.tabs.informationShort', 'Info')}</span>
                            </TabsTrigger>
                            
                            {hasSchedule && (
                                <TabsTrigger
                                    value="schedule"
                                    className="data-[state=active]:bg-primary flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all duration-200 data-[state=active]:text-white sm:gap-2 sm:rounded-xl sm:px-3 sm:py-3 sm:text-sm"
                                >
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                                    <span>{t('certificationProgram.detail.tabs.schedule', 'Jadwal')}</span>
                                </TabsTrigger>
                            )}

                            {hasRequirements && (
                                <TabsTrigger
                                    value="requirements"
                                    className="data-[state=active]:bg-primary flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all duration-200 data-[state=active]:text-white sm:gap-2 sm:rounded-xl sm:px-3 sm:py-3 sm:text-sm"
                                >
                                    <ListChecks className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">{t('certificationProgram.detail.tabs.requirements', 'Persyaratan')}</span>
                                    <span className="sm:hidden">{t('certificationProgram.detail.tabs.requirementsShort', 'Syarat')}</span>
                                </TabsTrigger>
                            )}

                            {hasMentors && (
                                <TabsTrigger
                                    value="mentor"
                                    className="data-[state=active]:bg-primary flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all duration-200 data-[state=active]:text-white sm:gap-2 sm:rounded-xl sm:px-3 sm:py-3 sm:text-sm"
                                >
                                    <Users className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                                    <span>{t('certificationProgram.detail.tabs.mentor', 'Mentor')}</span>
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="information" className="mt-4 sm:mt-6 md:mt-8">
                            <InformationSection program={program} />
                        </TabsContent>

                        {hasSchedule && (
                            <TabsContent value="schedule" className="mt-4 sm:mt-6 md:mt-8">
                                <ScheduleInfoSection program={program} />
                            </TabsContent>
                        )}

                        {hasRequirements && (
                            <TabsContent value="requirements" className="mt-4 sm:mt-6 md:mt-8">
                                <RequirementSection program={program} />
                            </TabsContent>
                        )}

                        {hasMentors && (
                            <TabsContent value="mentor" className="mt-4 sm:mt-6 md:mt-8">
                                <MentorSection program={program} />
                            </TabsContent>
                        )}
                    </Tabs>
                </div>

                <RegisterSection program={program} isEnrolled={isEnrolled} scholarshipApplication={scholarshipApplication} />
                <RelatedPrograms relatedPrograms={relatedPrograms} approvedScholarshipProgramIds={approvedScholarshipProgramIds} />
            </UserLayout>
        </div>
    );
}
