import { useState } from 'react';
import { BadgeCheck, Lightbulb, Target, Wrench } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Webinar {
    description?: string | null;
    benefits?: string | null;
    instructions?: string | null;
    tools?: { name: string; description?: string | null; icon: string | null }[];
}

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

const tabList = [
    { key: 'description', label: 'Deskripsi' },
    { key: 'benefits', label: 'Manfaat' },
    { key: 'instructions', label: 'Instruksi' },
    { key: 'tools', label: 'Tools' },
];

export default function AboutSection({ webinar }: { webinar: Webinar }) {
    const [activeTab, setActiveTab] = useState('description');
    const benefits = parseList(webinar.benefits);
    const instructions = parseList(webinar.instructions);

    return (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 lg:mb-16" id="about">
            
            {/* Tabs */}
            <div className="mb-6 sm:mb-8 overflow-x-auto">
                <div className="flex justify-start items-start gap-8 md:gap-40 min-w-max">
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
                <Separator className="mt-0.1 sm:mt-0.5 py-0.4 md:py-0.5 max-w-xs md:max-w-3xl" />
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'description' && (
                    <>
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <p className='font-literata font-medium text-xl sm:text-2xl md:text-3xl'>Deskripsi Webinar</p>
                        </div>
                        <p className='mb-6 sm:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-400'>
                            Gambaran lengkap tentang webinar ini dan apa yang akan Anda pelajari.
                        </p>
                        <div className="prose prose-sm sm:prose-base max-w-none">
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                {webinar.description || 'Tidak ada deskripsi tersedia.'}
                            </p>
                        </div>
                    </>
                )}

                {activeTab === 'benefits' && (
                    <>
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <p className='font-literata font-medium text-xl sm:text-2xl md:text-3xl'>Manfaat yang Akan Didapat</p>
                        </div>
                        <p className='mb-6 sm:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-400'>
                            Berbagai manfaat dan keuntungan yang akan Anda dapatkan setelah mengikuti webinar ini.
                        </p>
                        {benefits.length > 0 ? (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {benefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-center gap-2 sm:gap-3">
                                        <BadgeCheck className="mt-0.5 sm:mt-1 min-w-8 sm:min-w-10 md:min-w-12 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-green-600 flex-shrink-0" />
                                        <p className="text-sm sm:text-base  text-gray-700 dark:text-gray-300">{benefit}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="grid grid-cols-1 gap-8 rounded-lg border border-gray-200 bg-white p-6 md:grid-cols-3 dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <h3 className="text-2xl sm:text-3xl font-bold font-literata text-center">Pembicara Ahli</h3>
                                    <p className="text-muted-foreground text-center text-xs sm:text-sm">
                                        Belajar langsung dari para ahli dan praktisi berpengalaman di bidangnya untuk mendapatkan wawasan mendalam.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <h3 className="text-2xl sm:text-3xl font-bold font-literata text-center">Sesi Interaktif</h3>
                                    <p className="text-muted-foreground text-center text-xs sm:text-sm">
                                        Manfaatkan sesi tanya jawab langsung untuk berdiskusi, mengklarifikasi keraguan, dan memperluas pemahaman Anda.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <h3 className="text-2xl sm:text-3xl font-bold font-literata text-center">Wawasan Terkini</h3>
                                    <p className="text-muted-foreground text-center text-xs sm:text-sm">
                                        Dapatkan pemahaman mendalam tentang tren dan teknologi terbaru yang relevan dengan perkembangan karir Anda.
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'instructions' && (
                    <>
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <p className='font-literata font-medium text-xl sm:text-2xl md:text-3xl'>Instruksi & Persiapan</p>
                        </div>
                        <p className='mb-6 sm:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-400'>
                            Panduan persiapan yang perlu Anda lakukan sebelum mengikuti webinar.
                        </p>
                        {instructions.length > 0 ? (
                            <ul className="space-y-3 sm:space-y-4">
                                {instructions.map((instruction, idx) => (
                                    <li key={idx} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs sm:text-sm font-semibold mt-0.5">
                                            {idx + 1}
                                        </div>
                                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 flex-1">{instruction}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm sm:text-base">Tidak ada instruksi khusus yang diperlukan.</p>
                        )}
                    </>
                )}

                {activeTab === 'tools' && (
                    <>
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <p className='font-literata font-medium text-xl sm:text-2xl md:text-3xl'>Tools yang Digunakan</p>
                        </div>
                        <p className='mb-6 sm:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-400'>
                            Berbagai alat/software yang akan digunakan atau dibahas dalam webinar ini.
                        </p>
                        {webinar.tools && webinar.tools.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                                {webinar.tools.map((tool) => (
                                    <div
                                        key={tool.name}
                                        className="flex flex-col items-center justify-center gap-2 rounded-lg bg-white py-5 sm:py-6 shadow-md dark:bg-zinc-800 hover:shadow-lg transition-shadow border border-gray-200 dark:border-zinc-700"
                                    >
                                        <img 
                                            src={tool.icon ? `/storage/${tool.icon}` : '/assets/images/placeholder.png'} 
                                            alt={tool.name} 
                                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain" 
                                        />
                                        <h3 className="text-xs sm:text-sm md:text-base font-semibold text-center line-clamp-2 px-2">
                                            {tool.name}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm sm:text-base">Tidak ada tools khusus yang diperlukan.</p>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}