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
                            <p className="md:text-lg font-semibold text-primary">Apa itu Talenta Academy ? </p>
                            <ChevronUp className="p-1 h-7 w-7 bg-primary rounded-full text-white transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-sm text-black md:text-base dark:text-black-400 mt-2">
                            Talenta Academy adalah lembaga pelatihan profesional yang fokus pada pengembangan kompetensi di bidang akuntansi, perpajakan, audit, dan software akuntansi, dll dengan pendekatan praktis dan aplikatif
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="animation-properties" className="rounded-lg border-1 border-zinc-400 px-4 py-2">
                    <AccordionTrigger className="w-full text-left text-zinc-950 hover:cursor-pointer dark:text-zinc-50">
                        <div className="flex items-center justify-between">
                            <p className="md:text-lg font-semibold text-primary">Apa Saja Fitur dan di Talenta Academy ?</p>
                            <ChevronUp className="p-1 h-7 w-7 bg-primary rounded-full text-white transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-sm text-black md:text-base dark:text-black-400 mt-2">
                            Talenta Academy menyediakan berbagai program pembelajaran seperti Kelas Online, Bootcamp, serta pelatihan berbasis Webinar. Setiap program dirancang secara interaktif dan aplikatif untuk membantu peserta mengembangkan keterampilan secara optimal dan siap diterapkan di dunia kerja.
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
                            Pendaftaran dapat dilakukan melalui website resmi Talenta Academy atau dengan menghubungi admin melalui WhatsApp yang tersedia di website atau DM di IG @brevetpajak_talenta.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="community-and-support" className="rounded-lg border-1 border-zinc-400 px-4 py-2">
                    <AccordionTrigger className="w-full text-left text-zinc-950 hover:cursor-pointer dark:text-zinc-50">
                        <div className="flex items-center justify-between">
                            <p className="md:text-lg font-semibold text-primary">Kemana Saya bisa mendapatkan informasi untuk bekerjasama atau jika terdapat kendala ?</p>
                            <ChevronUp className="p-1 h-7 w-7 bg-primary rounded-full text-white transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="text-sm text-black md:text-base dark:text-black-400 mt-2">
                            Untuk informasi lebih lanjut mengenai Talenta Academy, silakan menghubungi admin kami melalui WhatsApp{' '}
                            <a href="https://wa.me/+6289528514480" className="text-primary hover:underline">
                                +6289528514480
                            </a>
                            . Kami juga aktif di berbagai media sosial, jadi pastikan untuk mengikuti Talenta Academy di Instagram, TikTok, dan LinkedIn untuk mendapatkan update terbaru serta tips seputar akuntansi dan perpajakan.
                        </p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>
    );
}
