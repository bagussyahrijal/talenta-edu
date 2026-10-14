import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import CertificationProgramSection from './certification-program-section';
import FeatureSection from './feature-section';
import HeroSection from './hero-section';

type Category = {
    id: string;
    name: string;
};

interface Program {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    type: 'regular' | 'scholarship';
    category: Category;
    price: number;
    scholarship_price?: number;
    strikethrough_price?: number;
    thumbnail?: string | null;
    registration_deadline?: string;
}

interface DashboardProps {
    categories: Category[];
    programs: Program[];
    myProgramIds: string[];
    approvedScholarshipProgramIds?: string[];
}

export default function Dashboard({ categories, programs, myProgramIds, approvedScholarshipProgramIds = [] }: DashboardProps) {
    const { t } = useTranslation('user');

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Global Decorative Background */}
            <div className="pointer-events-none absolute -top-32 -left-32 z-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -top-32 -right-0 z-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-0  -left-32 z-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-0 -right-0 z-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />
         
            <UserLayout>
                <Head title={t('certificationProgram.dashboard.headTitle', 'Program Sertifikasi')} />

                <HeroSection />
                {/* <FeatureSection /> */}
                <CertificationProgramSection 
                    categories={categories} 
                    programs={programs} 
                    myProgramIds={myProgramIds} 
                    approvedScholarshipProgramIds={approvedScholarshipProgramIds}
                />
            </UserLayout>
        </div>
    );
}
