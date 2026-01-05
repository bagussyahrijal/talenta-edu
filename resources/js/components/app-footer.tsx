import { Link } from '@inertiajs/react';
import { Instagram } from 'lucide-react';

export default function AppFooter() {
    return (
        <footer className="w-full bg-gradient-to-b from-background to-primary py-8 sm:py-16">
            {/* Decorative gradient background */}

            <div className="relative mx-auto max-w-7xl p-8 rounded-2xl bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-9">
                    {/* Column 1: Logo and Description */}
                    <div className="lg:col-span-5">
                        <div className="mb-6 flex items-center gap-2">
                            <img src="/assets/images/logo-primary-2.png" alt="Talenta Logo" className="h-12" />
                        </div>
                        <p className="mb-6 text-sm leading-relaxed text-gray-700">
                            Mencetak Talenta Akuntansi & Pajak yang Siap Dunia Kerja
                        </p>
                        <div>
                            <h5 className="mb-2 font-semibold text-gray-900">CV. Talenta Skill</h5>
                            <p className="text-sm text-gray-700">
                                Perumahan Permata Permadani, Blok B1. Kel. Pendem Kec. Junrejo<br />
                                Kota Batu Prov. Jawa Timur, 65324
                            </p>
                        </div>
                    </div>

                    <div className='grid grid-cols-3 lg:col-span-4'>
                        {/* Column 2: Company Links */}
                        <div>
                            <h4 className="mb-6 text-lg font-bold text-gray-900">Company</h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
                                        Beranda
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/program" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
                                        Program & Layanan
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/publication" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
                                        Publikasi
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/about" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
                                        About Us
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-6 text-lg font-bold text-gray-900">Company</h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/bootcamp" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
                                        Bootcamp
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/webinar" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
                                        Webinar
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/course" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
                                        Kelas Online
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
                                        Bundling Class
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        {/* Column 4: Company Links (duplicate) */}
                        <div>
                            <h4 className="mb-6 text-lg font-bold text-gray-900">Company</h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
                                        Syarat & Ketentuan
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/program" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
                                        Kebijakan Privasi
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/publication" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
                                        Artikel & Blog
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/about" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
                                        About Us
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-12">
                            <h4 className="mb-4 text-lg font-bold text-gray-900">Media Sosial</h4>
                            <div className="flex items-center gap-4">
                                <a
                                    href="https://www.instagram.com/aksademy/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
                                >
                                    <Instagram className="h-5 w-5" />
                                </a>
                                <a
                                    href="https://www.tiktok.com/@aksademy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://wa.me/+6285142505794"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Media Social Section */}

                {/* Divider */}
                <div className="my-8 h-px bg-blue-300" />

                {/* Copyright */}
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                        Copyright © Talentaskill, All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
