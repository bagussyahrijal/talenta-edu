import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className=" relative py-20 text-gray-900 dark:text-white">
            <div className="relative mx-auto max-w-7xl px-4 flex flex-col lg:flex-row items-center gap-12">
                {/* Left side - Single Image */}
                <div className="w-full lg:w-[40%] flex justify-center mb-8 lg:mb-0 hidden sm:flex">
                    <img
                        src="/assets/images/about.png"
                        alt="About Talenta Academy"
                        className="w-full max-w-sm object-contain"
                    />
                </div>

                {/* Right side - Content */}
                <div className="w-full lg:w-[60%]">
                    <span className="text-primary inline-block text-md font-semibold">
                        About Us
                    </span>

                    <h1 className="mb-6 text-2xl leading-tight font-bold sm:text-3xl font-literata">
                        Talenta Academy.
                    </h1>

                    <p className="mb-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                        Talenta Academy adalah lembaga pelatihan profesional di bidang akuntansi, perpajakan, dan audit dan lainya yang berfokus pada pembelajaran praktis dan aplikatif. Didukung oleh instruktur berpengalaman, kami membantu peserta meningkatkan kompetensi dan kesiapan menghadapi dunia kerja melalui program pelatihan yang terstruktur dan relevan.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Feature 1 */}
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-primary">
                                    <Check className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm mb-1">Materi Praktis & Aplikatif</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Fokus pada praktik nyata dan studi kasus sesuai kebutuhan dunia kerja..
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-primary">
                                    <Check className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm mb-1">Program Fleksibel & Terstruktur.</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Tersedia kelas online, bootcamp, webinar, dan bundling kelas dengan kurikulum yang jelas.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-primary">
                                    <Check className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm mb-1">Instruktur Praktisi Berpengalaman</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Dibimbing langsung oleh profesional yang aktif di bidang akuntansi, pajak, dan audit..
                                </p>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-primary">
                                    <Check className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm mb-1">Sertifikat & Modul Pembelajaran</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Setiap program dilengkapi sertifikat dan modul sebagai pendukung pengembangan kompetensi..
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}