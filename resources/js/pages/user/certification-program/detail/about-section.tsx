import { useState } from 'react';
import { BadgeCheck, FileText, Info, GraduationCap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CertificationProgram {
    description?: string | null;
    benefits?: string | null;
    terms_conditions?: string | null;
    scholarship_flow?: string | null;
    type: 'regular' | 'scholarship';
}

export default function AboutSection({ program }: { program: CertificationProgram }) {
    const tabs = [
        { key: 'description', label: 'Tentang Program' },
        { key: 'benefits', label: 'Manfaat' },
        { key: 'terms_conditions', label: 'Syarat & Ketentuan' },
    ];

    if (program.type === 'scholarship') {
        tabs.push({ key: 'scholarship_flow', label: 'Alur Beasiswa' });
    }

    const [activeTab, setActiveTab] = useState(tabs[0].key);

    return (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 lg:mb-16" id="about">
            {/* Tabs */}
            <div className="mb-6 sm:mb-8 overflow-x-auto">
                <div className="flex justify-start items-start gap-8 md:gap-40 min-w-max">
                    {tabs.map((tab) => (
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
                <Separator className="mt-0.1 sm:mt-0.5 py-0.4 md:py-0.5 max-w-xs md:max-w-4xl" />
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'description' && (
                    <>
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <Info className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                            <p className="font-literata font-medium text-xl sm:text-2xl md:text-3xl">Tentang Program</p>
                        </div>
                        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            Gambaran lengkap tentang program ini dan apa yang akan Anda pelajari.
                        </p>
                        <div className="prose prose-sm sm:prose-base max-w-none">
                            <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: program.description || 'Tidak ada deskripsi tersedia.' }} />
                        </div>
                    </>
                )}

                {activeTab === 'benefits' && (
                    <>
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <BadgeCheck className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                            <p className="font-literata font-medium text-xl sm:text-2xl md:text-3xl">Manfaat Program</p>
                        </div>
                        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            Berbagai manfaat dan keuntungan yang akan Anda dapatkan setelah mengikuti program ini.
                        </p>
                        <div className="prose prose-sm sm:prose-base max-w-none">
                            <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: program.benefits || 'Tidak ada manfaat tersedia.' }} />
                        </div>
                    </>
                )}

                {activeTab === 'terms_conditions' && (
                    <>
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <FileText className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                            <p className="font-literata font-medium text-xl sm:text-2xl md:text-3xl">Syarat & Ketentuan</p>
                        </div>
                        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            Persyaratan yang perlu Anda penuhi sebelum mengikuti program ini.
                        </p>
                        <div className="prose prose-sm sm:prose-base max-w-none">
                            <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: program.terms_conditions || 'Tidak ada syarat dan ketentuan khusus.' }} />
                        </div>
                    </>
                )}

                {activeTab === 'scholarship_flow' && (
                    <>
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                            <p className="font-literata font-medium text-xl sm:text-2xl md:text-3xl">Alur Beasiswa</p>
                        </div>
                        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            Tahapan alur proses pendaftaran beasiswa untuk program ini.
                        </p>
                        <div className="prose prose-sm sm:prose-base max-w-none">
                            <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: program.scholarship_flow || 'Tidak ada informasi alur beasiswa.' }} />
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
