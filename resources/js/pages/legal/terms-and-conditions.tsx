import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';

export default function TermsAndConditions() {
    return (
        <UserLayout>
            <Head title="Syarat dan Ketentuan" />

            <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                        <div className="mb-8 text-center">
                            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Syarat dan Ketentuan</h1>
                            <p className="text-gray-600 dark:text-gray-400">Terakhir diperbarui: 12 Juli 2025</p>
                        </div>

                        <div className="prose prose-gray dark:prose-invert max-w-none">
                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">1. Pendahuluan</h2>
                                <p className="mb-4 text-gray-700 dark:text-gray-300">
                                    Selamat datang di Talenta Academy. Syarat dan Ketentuan ini mengatur penggunaan seluruh layanan pembelajaran yang disediakan oleh Talenta Academy ("kami", "kita", atau "Talenta Academy").
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Dengan mengakses dan menggunakan platform Talenta Academy, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan yang berlaku. Apabila Anda tidak menyetujui ketentuan ini, kami menyarankan untuk tidak melanjutkan penggunaan layanan kami.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">2. Definisi</h2>
                                <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
                                    <li>
                                        <strong>Platform:</strong> Situs web dan/atau sistem pembelajaran Talenta Academy
                                    </li>
                                    <li>
                                        <strong>Pengguna:</strong> Setiap individu yang mengakses atau menggunakan layanan Talenta Academy
                                    </li>
                                    <li>
                                        <strong>Kelas Online:</strong> Program pembelajaran digital yang dapat diakses melalui platform
                                    </li>
                                    <li>
                                        <strong>Bootcamp:</strong> Program pelatihan intensif dengan durasi dan jadwal tertentu
                                    </li>
                                    <li>
                                        <strong>Webinar:</strong> Kegiatan seminar daring interaktif dengan waktu pelaksanaan terjadwal
                                    </li>
                                    <li>
                                        <strong>Konten:</strong> Seluruh materi pembelajaran, termasuk video, modul tertulis, presentasi, dan file pendukung
                                    </li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">3. Layanan Talenta Academy</h2>
                                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                    <div>
                                        <h3 className="mb-2 font-semibold">3.1 Kelas Online</h3>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Akses pembelajaran sesuai ketentuan program yang dibeli</li>
                                            <li>Materi dapat diakses setelah pembayaran terkonfirmasi</li>
                                            <li>Pembaruan materi dilakukan secara berkala sesuai kebijakan Talenta Academy</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold">3.2 Bootcamp</h3>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Program pembelajaran intensif dengan jadwal dan durasi tertentu</li>
                                            <li>Dipandu oleh instruktur atau praktisi berpengalaman</li>
                                            <li>Sertifikat diberikan kepada peserta yang memenuhi ketentuan kelulusan</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold">3.3 Webinar</h3>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Diselenggarakan secara daring sesuai jadwal yang ditentukan</li>
                                            <li>Peserta dapat mengikuti sesi interaktif dan tanya jawab</li>
                                            <li>Rekaman webinar dapat diberikan sesuai kebijakan program</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">4. Pembayaran dan Pengembalian Dana</h2>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <div>
                                        <h3 className="mb-2 font-semibold">4.1 Pembayaran</h3>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Seluruh pembayaran menggunakan mata uang Rupiah (IDR)</li>
                                            <li>Metode pembayaran disesuaikan dengan opsi yang tersedia</li>
                                            <li>Akses layanan diberikan setelah pembayaran dikonfirmasi</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold">4.2 Kebijakan Pengembalian Dana</h3>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Pengajuan pengembalian dana dapat dilakukan maksimal 7 hari setelah pembelian</li>
                                            <li>Syarat pengembalian dana: materi belum diakses lebih dari 20%</li>
                                            <li>Untuk Bootcamp dan Webinar, pengembalian dana penuh berlaku apabila pembatalan dilakukan sebelum program dimulai</li>
                                            <li>Proses pengembalian dana membutuhkan waktu 7–14 hari kerja</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">5. Hak Kekayaan Intelektual</h2>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <p>Seluruh konten yang tersedia di platform Talenta Academy merupakan milik Talenta Academy atau pihak ketiga yang memberikan lisensi resmi kepada kami.</p>
                                    <p>Pengguna dilarang untuk:</p>
                                    <ul className="ml-4 list-inside list-disc space-y-1">
                                        <li>Menyalin, menyebarluaskan, atau mendistribusikan konten tanpa izin</li>
                                        <li>Menggunakan konten untuk kepentingan komersial</li>
                                        <li>Mengubah atau memodifikasi materi pembelajaran</li>
                                        <li>Memberikan akses akun kepada pihak lain</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">6. Kewajiban dan Larangan Pengguna</h2>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <p>Pengguna wajib:</p>
                                    <ul className="ml-4 list-inside list-disc space-y-1">
                                        <li>Menggunakan platform sesuai tujuan pembelajaran</li>
                                        <li>Menghormati hak dan kenyamanan pengguna lain</li>
                                        <li>Tidak melakukan tindakan yang merugikan sistem atau reputasi Talenta Academy</li>
                                        <li>Mematuhi peraturan perundang-undangan yang berlaku</li>
                                    </ul>
                                    <p>Pengguna dilarang:</p>
                                    <ul className="ml-4 list-inside list-disc space-y-1">
                                        <li>Menggunakan platform untuk tujuan yang melanggar hukum</li>
                                        <li>Mengunggah konten yang bersifat ilegal atau merugikan</li>
                                        <li>Melakukan spam, gangguan, atau penyalahgunaan sistem</li>
                                        <li>Mengakses sistem tanpa izin resmi</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">7. Privasi dan Perlindungan Data</h2>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Pengelolaan data pribadi pengguna diatur dalam Kebijakan Privasi Talenta Academy. Dengan menggunakan layanan ini, pengguna menyetujui pengumpulan dan penggunaan data sesuai kebijakan tersebut.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">9. Pembatasan Tanggung Jawab</h2>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <p>Talenta Academy tidak bertanggung jawab atas:</p>
                                    <ul className="ml-4 list-inside list-disc space-y-1">
                                        <li>Gangguan teknis, pemeliharaan sistem, atau kendala jaringan</li>
                                        <li>Kehilangan data akibat kelalaian pengguna</li>
                                        <li>Kerugian langsung maupun tidak langsung yang timbul dari penggunaan platform</li>
                                        <li>Informasi yang berasal dari pihak ketiga di luar kendali kami</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">10. Perubahan Syarat dan Ketentuan</h2>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Talenta Academy berhak melakukan perubahan terhadap Syarat dan Ketentuan ini sewaktu-waktu. Perubahan akan berlaku efektif setelah dipublikasikan di platform, dan pengguna dianjurkan untuk meninjaunya secara berkala.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">11. Hukum yang Berlaku</h2>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Syarat dan Ketentuan ini diatur dan ditafsirkan berdasarkan hukum yang berlaku di Republik Indonesia. Setiap sengketa akan diselesaikan melalui pengadilan yang berwenang di Indonesia.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">12. Hubungi Kami</h2>
                                <div className="text-gray-700 dark:text-gray-300">
                                    <p className="mb-3">
                                        Apabila Anda memiliki pertanyaan terkait Syarat dan Ketentuan ini, silakan menghubungi tim Talenta Academy melalui kontak resmi yang tersedia di website.
                                    </p>
                                </div>
                            </section>
                        </div>

                        <div className="mt-8 border-t border-gray-200 pt-8 text-center dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Dengan menggunakan layanan Talenta Academy, Anda menyetujui syarat dan ketentuan di atas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
