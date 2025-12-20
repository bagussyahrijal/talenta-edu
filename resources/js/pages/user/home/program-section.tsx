import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { BadgeCheck } from 'lucide-react';

export default function ProgramSection() {
    return (
        <section className="w-full py-8" id="program-kami">
            <div className='bg-secondary flex flex-col items-center justify-center space-y-8 p-4'>
                <h1 className='text-5xl font-bold font-literata text-primary'>Kelas Terpopuler</h1>
                <p>Tingkatkan pengetahuan dan keterampilan kamu disini</p>
                <div className='grid grid-cols-2 lg:grid-cols-4'>
                    <div className="rounded-2xl overflow-hidden shadow-lg bg-white flex flex-col">
                        {/* Gambar */}
                        <div className="relative">
                            <img
                                src="/assets/images/webinar.jpg"
                                alt="Webinar"
                                className="w-full h-40 object-cover"
                            />
                            {/* Badge kategori */}
                            <span className="absolute top-3 right-3 bg-blue-200 text-blue-800 px-4 py-1 rounded-full text-sm font-medium shadow">
                                Brevet Pajak
                            </span>
                        </div>
                        {/* Konten bawah */}
                        <div className="bg-gradient-to-b from-blue-200 to-blue-400 p-5 flex flex-col flex-1">
                            <span className="bg-white text-blue-600 px-4 py-1 rounded-lg text-base font-medium w-fit mb-3 shadow">
                                webinar
                            </span>
                            <div className="flex-1">
                                <h2 className="font-literata font-bold text-white text-xl leading-snug mb-2">
                                    PPH Badan dan akuntansi pajak batch 23
                                </h2>
                                <div className="text-white text-2xl font-bold mb-4">
                                    Rp 500.000
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-white text-sm mt-auto">
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    23 November 2025
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87v-2a4 4 0 00-3-3.87m6 5.87v-2a4 4 0 00-3-3.87" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    10/10
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
