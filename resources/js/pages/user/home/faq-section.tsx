import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function FaqSection() {
    const [expanded, setExpanded] = useState<React.Key | null>('getting-started');

    return (
        <section className="mx-auto w-full max-w-7xl py-8 space-y-8 mb-8">
            <div className="mx-auto text-center space-y-8">
                <h1 className='text-5xl font-bold font-literata text-primary'>Pertanyaan yang sering ditanyakan</h1>
                <p>Belajar pajak, brevet, atau akuntansi kadang bikin bingung sendiri, apalagi kalau materinya banyak dan teknis banget!
                    Punya pertanyaan seputar webinar, kelas online, atau sertifikasi pajak dan akuntansi?</p>
            </div>
            <Accordion
                className="flex w-full flex-col gap-2 divide-y divide-zinc-200 dark:divide-zinc-700"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                expandedValue={expanded}
                onValueChange={setExpanded}
            >
                <AccordionItem value="getting-started" className="rounded-lg border-1 border-zinc-400 px-4 py-2">
                    <AccordionTrigger className="w-full text-left text-zinc-950 hover:cursor-pointer dark:text-zinc-50">
                        <div className="flex items-center justify-between">
                            <p className="md:text-lg font-semibold text-primary">Apa itu Aksademi?</p>
                            <ChevronUp className="p-1 h-7 w-7 bg-primary rounded-full text-white transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-sm text-black md:text-base dark:text-black-400 mt-2">
                            Talenta adalah platform edukasi digital yang dikembangkan oleh Talenta dan dirancang untuk mendukung
                            pengembangan skill di era modern mulai dari teknologi, desain, hingga bisnis.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="animation-properties" className="rounded-lg border-1 border-zinc-400 px-4 py-2">
                    <AccordionTrigger className="w-full text-left text-zinc-950 hover:cursor-pointer dark:text-zinc-50">
                        <div className="flex items-center justify-between">
                            <p className="md:text-lg font-semibold text-primary">Apa saja fitur yang tersedia di Aksademi?</p>
                            <ChevronUp className="p-1 h-7 w-7 bg-primary rounded-full text-white transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-sm text-black md:text-base dark:text-black-400 mt-2">
                            Aksademi menawarkan berbagai fitur seperti Kelas Online, Bootcamp, dan pelatihan dalam bentuk Webinar yang mencakup
                            berbagai disiplin ilmu. Setiap fitur dirancang untuk memberikan pengalaman belajar yang interaktif dan mendalam,
                            memungkinkan pengguna untuk mengembangkan keterampilan mereka secara efektif.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="advanced-usage" className="rounded-lg border-1 border-zinc-400 px-4 py-2">
                    <AccordionTrigger className="w-full text-left text-zinc-950 hover:cursor-pointer dark:text-zinc-50">
                        <div className="flex items-center justify-between">
                            <p className="md:text-lg font-semibold text-primary">Bagaimana alur belajar di Talenta?</p>
                            <ChevronUp className="p-1 h-7 w-7 bg-primary rounded-full text-white transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-sm text-black md:text-base dark:text-black-400 mt-2">
                            Alur belajar di Talenta dimulai dengan memilih kelas atau bootcamp yang sesuai dengan minat dan kebutuhan Anda. Setelah
                            mendaftar, Anda akan mendapatkan akses ke materi pembelajaran yang dapat diakses kapan saja. Setiap kelas dilengkapi
                            dengan modul, quiz, dan forum diskusi untuk mendukung proses belajar Anda.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="community-and-support" className="rounded-lg border-1 border-zinc-400 px-4 py-2">
                    <AccordionTrigger className="w-full text-left text-zinc-950 hover:cursor-pointer dark:text-zinc-50">
                        <div className="flex items-center justify-between">
                            <p className="md:text-lg font-semibold text-primary">Kemana saya bisa mendapatkan informasi lebih lanjut tentang Aksademi?</p>
                            <ChevronUp className="p-1 h-7 w-7 bg-primary rounded-full text-white transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-sm text-black md:text-base dark:text-black-400 mt-2">
                            Untuk informasi lebih lanjut tentang Aksademi, Anda dapat menghubungi admin kami di{' '}
                            <a href="https://wa.me/+6289528514480" className="text-primary hover:underline">
                                +6289528514480
                            </a>
                            . Kami juga aktif di media sosial, jadi pastikan untuk mengikuti kami di platform seperti Instagram, Tiktok, dan Linkedin
                            untuk update terbaru dan tips belajar.
                        </p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>
    );
}
