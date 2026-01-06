import { TransitionPanel } from '@/components/ui/transition-panel';
import { useEffect, useState } from 'react';

const items = [
    {
        title: 'Sertifikat Resmi dari Partner Industri',
        subtitle: 'Dapatkan sertifikat yang diakui industri dari lembaga dan perusahaan partner terpercaya.',
        image: '/assets/images/feature-certification-1.webp',
    },
    {
        title: 'Materi Terupdate',
        subtitle: 'Konten pembelajaran selalu diperbarui mengikuti perkembangan teknologi dan tren industri terkini.',
        image: '/assets/images/feature-certification-2.webp',
    },
    {
        title: 'Fleksibel & Terjangkau',
        subtitle: 'Jadwal yang fleksibel dengan harga terjangkau. Investasi terbaik untuk pengembangan karirmu.',
        image: '/assets/images/feature-certification-3.webp',
    },
];

export default function LegalitasSection() {
    return (
        <section className="w-full bg-[#E6F2FB] py-12">
            <div className="mx-auto w-full max-w-7xl px-4">
                <h2 className="text-center text-5xl font-bold mb-6 font-literata text-gray-900">Legalitas</h2>
                <p className="text-center text-gray-600 mb-10">Kredibilitas & Legalitas Resmi Lembaga Pelatihan Kami</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Akta Notaris */}
                    <div className="flex flex-col items-center">
                        <img src="/assets/images/aktanotaris.png" alt="Akta Notaris" className="w-24 h-24 mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-center">Akta Notaris</h3>
                        <div className=" text-center text-gray-800 text-base">
                            Akta Notaris No. 07 Tahun 2024<br />
                            (Notaris Shrimanti Indira Pratiwi, S.H., MKn.)
                        </div>
                    </div>
                    {/* Surat Kemenkumham */}
                    <div className="flex flex-col items-center">
                        <img src="/assets/images/suratkemenkum.png" alt="Surat Kemenkumham" className="w-24 h-24 mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-center">Surat Kemenkumham</h3>
                        <div className="text-center text-gray-800 text-base">
                            Surat Keterangan Terdaftar Kemenkumham<br />
                            (No: AHU-0000695 Tahun 2024)
                        </div>
                    </div>
                    {/* NIB */}
                    <div className="flex flex-col items-center">
                        <img src="/assets/images/nib.png" alt="NIB" className="w-24 h-24 mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-center">NIB</h3>
                        <div className="text-center text-gray-800 text-base">
                            Telah Terbit Nomor Induk Berusaha<br />
                            (No. 090124005728)
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
