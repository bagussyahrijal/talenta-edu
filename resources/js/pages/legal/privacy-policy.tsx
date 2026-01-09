import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';

export default function PrivacyPolicy() {
    return (
        <UserLayout>
            <Head title="Kebijakan Privasi" />

            <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                        <div className="mb-8 text-center">
                            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Kebijakan Privasi</h1>
                            <p className="text-gray-600 dark:text-gray-400">Terakhir diperbarui: 12 Juli 2025</p>
                        </div>

                        <div className="prose prose-gray dark:prose-invert max-w-none">
                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Pendahuluan</h2>
                                <p className="mb-4 text-gray-700 dark:text-gray-300">
                                    Talenta Academy ("kami", "kita", atau "Talenta Academy") berkomitmen untuk menjaga privasi serta melindungi keamanan data pribadi pengguna. Kebijakan Privasi ini menjelaskan cara kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan layanan pembelajaran yang kami sediakan.
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Dengan mengakses dan menggunakan layanan Talenta Academy, Anda menyatakan setuju terhadap praktik pengelolaan data sebagaimana diatur dalam Kebijakan Privasi ini. Apabila Anda tidak menyetujui kebijakan ini, mohon untuk tidak menggunakan layanan kami.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">2. Informasi yang Kami Kumpulkan</h2>

                                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                    <div>
                                        <h3 className="mb-2 font-semibold">2.1 Informasi yang Anda Berikan Secara Langsung</h3>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Nama lengkap</li>
                                            <li>Alamat email</li>
                                            <li>Nomor telepon</li>
                                            <li>Tanggal lahir</li>
                                            <li>Alamat domisili</li>
                                            <li>Pekerjaan dan latar belakang pendidikan</li>
                                            <li>Foto profil (opsional)</li>
                                            <li>Informasi pembayaran</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="mb-2 font-semibold">2.2 Informasi yang Dikumpulkan Secara Otomatis</h3>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Alamat IP dan perkiraan lokasi</li>
                                            <li>Jenis perangkat dan sistem operasi</li>
                                            <li>Browser yang digunakan</li>
                                            <li>Aktivitas penggunaan platform</li>
                                            <li>Waktu dan durasi akses</li>
                                            <li>Halaman yang dikunjungi</li>
                                            <li>Progres pembelajaran</li>
                                            <li>Interaksi dengan materi dan fitur</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="mb-2 font-semibold">2.3 Informasi dari Pihak Ketiga</h3>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Data dari akun media sosial (jika Anda memilih login melalui media sosial)</li>
                                            <li>Informasi dari penyedia layanan pembayaran</li>
                                            <li>Data dari mitra atau rekanan resmi Talenta Academy</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">3. Tujuan Penggunaan Informasi</h2>
                                <p className="mb-3 text-gray-700 dark:text-gray-300">Informasi pribadi Anda kami gunakan untuk:</p>
                                <ul className="ml-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
                                    <li>Menyediakan dan mengelola layanan pembelajaran</li>
                                    <li>Memproses pendaftaran dan transaksi pembayaran</li>
                                    <li>Memberikan layanan dukungan dan bantuan pengguna</li>
                                    <li>Menyampaikan informasi terkait layanan dan program</li>
                                    <li>Menyesuaikan pengalaman belajar pengguna</li>
                                    <li>Menganalisis serta meningkatkan kualitas layanan</li>
                                    <li>Mencegah penyalahgunaan dan aktivitas yang merugikan</li>
                                    <li>Memenuhi kewajiban hukum dan regulasi</li>
                                    <li>Mengirimkan materi promosi (dengan persetujuan pengguna)</li>
                                    <li>Melakukan riset dan pengembangan produk</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">4. Pembagian Informasi</h2>
                                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                    <p>
                                        Talenta Academy tidak menjual atau memperdagangkan data pribadi pengguna. Namun, informasi dapat dibagikan dalam kondisi berikut:
                                    </p>

                                    <div>
                                        <h3 className="mb-2 font-semibold">4.1 Penyedia Layanan Pendukung</h3>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Penyedia sistem pembayaran</li>
                                            <li>Layanan cloud dan hosting</li>
                                            <li>Layanan email dan komunikasi</li>
                                            <li>Layanan analitik dan teknologi pendukung</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="mb-2 font-semibold">4.2 Kewajiban Hukum</h3>
                                        <p>Apabila diwajibkan oleh peraturan perundang-undangan, putusan pengadilan, atau permintaan resmi dari otoritas berwenang.</p>
                                    </div>

                                    <div>
                                        <h3 className="mb-2 font-semibold">4.3 Perlindungan Hak dan Keamanan</h3>
                                        <p>Untuk melindungi hak, aset, keamanan Talenta Academy, pengguna, maupun kepentingan publik.</p>
                                    </div>

                                    <div>
                                        <h3 className="mb-2 font-semibold">4.4 Transaksi Bisnis</h3>
                                        <p>Dalam hal terjadi penggabungan usaha, akuisisi, atau pengalihan aset perusahaan.</p>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">5. Keamanan Data</h2>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <p>
                                        Kami menerapkan langkah-langkah teknis dan organisasi yang wajar untuk melindungi data pribadi pengguna, antara lain:
                                    </p>
                                    <ul className="ml-4 list-inside list-disc space-y-1">
                                        <li>Enkripsi data saat pengiriman dan penyimpanan</li>
                                        <li>Pembatasan dan kontrol akses</li>
                                        <li>Pemantauan keamanan sistem</li>
                                        <li>Pelatihan keamanan bagi tim internal</li>
                                        <li>Audit keamanan berkala</li>
                                        <li>Pencadangan data secara rutin</li>
                                    </ul>
                                    <p>
                                        Meskipun demikian, tidak ada sistem yang sepenuhnya bebas risiko. Pengguna diimbau untuk menjaga keamanan akun dan menggunakan kata sandi yang kuat.
                                    </p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">6. Penyimpanan dan Retensi Data</h2>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <p>Data pribadi disimpan sesuai kebutuhan dan ketentuan berikut:</p>
                                    <ul className="ml-4 list-inside list-disc space-y-1">
                                        <li>Selama akun pengguna aktif</li>
                                        <li>Data transaksi: hingga 10 tahun setelah transaksi terakhir</li>
                                        <li>Data komunikasi: hingga 3 tahun</li>
                                        <li>Log sistem: hingga 1 tahun</li>
                                        <li>Data pemasaran: hingga persetujuan dicabut</li>
                                    </ul>
                                    <p>
                                        Setelah masa retensi berakhir, data akan dihapus secara aman kecuali diwajibkan lain oleh hukum.
                                    </p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">7. Hak Pengguna atas Data Pribadi</h2>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <p>Pengguna berhak untuk:</p>
                                    <ul className="ml-4 list-inside list-disc space-y-1">
                                        <li>Mengakses data pribadi yang kami simpan</li>
                                        <li>Memperbaiki data yang tidak akurat</li>
                                        <li>Meminta penghapusan data</li>
                                        <li>Membatasi pemrosesan data</li>
                                        <li>Meminta pemindahan data</li>
                                        <li>Menyampaikan keberatan atas pemrosesan tertentu</li>
                                        <li>Menarik kembali persetujuan yang telah diberikan</li>
                                    </ul>
                                    <p>
                                        Permintaan terkait hak tersebut dapat diajukan melalui kontak resmi Talenta Academy.
                                    </p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">8. Cookies dan Teknologi Serupa</h2>
                                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                    <p>Kami menggunakan cookies untuk:</p>
                                    <ul className="ml-4 list-inside list-disc space-y-1">
                                        <li>Menjaga sesi login</li>
                                        <li>Menyimpan preferensi pengguna</li>
                                        <li>Menganalisis penggunaan platform</li>
                                        <li>Menyajikan konten yang relevan</li>
                                        <li>Meningkatkan keamanan sistem</li>
                                    </ul>

                                    <p>
                                        Jenis cookies yang digunakan meliputi cookies esensial, analitik, fungsional, dan pemasaran. Pengguna dapat mengatur preferensi cookies melalui pengaturan browser, dengan catatan bahwa pembatasan tertentu dapat memengaruhi fungsi layanan.
                                    </p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">9. Transfer Data Internasional</h2>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Data pribadi dapat disimpan atau diproses di server yang berada di luar Indonesia. Kami memastikan setiap transfer data dilakukan dengan perlindungan yang memadai sesuai dengan peraturan yang berlaku.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">10. Perlindungan Data Anak</h2>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Layanan Talenta Academy tidak ditujukan bagi anak di bawah usia 13 tahun. Kami tidak secara sengaja mengumpulkan data pribadi anak. Apabila diketahui terdapat data anak yang tersimpan, kami akan segera menghapusnya setelah menerima pemberitahuan.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">11. Perubahan Kebijakan Privasi</h2>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Talenta Academy dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Setiap perubahan akan diumumkan melalui platform atau media komunikasi resmi, dan berlaku sejak tanggal pembaruan yang tercantum.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">12. Dasar Hukum Pemrosesan Data</h2>
                                <div className="text-gray-700 dark:text-gray-300">
                                    <p className="mb-3">Pemrosesan data pribadi dilakukan berdasarkan:</p>
                                    <ul className="ml-4 list-inside list-disc space-y-1">
                                        <li>Persetujuan pengguna</li>
                                        <li>Pelaksanaan perjanjian layanan</li>
                                        <li>Kewajiban hukum</li>
                                        <li>Kepentingan sah Talenta Academy</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">13. Hubungi Kami</h2>
                                <div className="text-gray-700 dark:text-gray-300">
                                    <p className="mb-3">
                                        Jika Anda memiliki pertanyaan, permintaan, atau keluhan terkait Kebijakan Privasi ini, silakan menghubungi Talenta Academy melalui kontak resmi yang tersedia di website.
                                    </p>
                                </div>
                            </section>
                        </div>

                        <div className="mt-8 border-t border-gray-200 pt-8 text-center dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Dengan menggunakan layanan Talenta Academy, Anda menyetujui kebijakan privasi di atas.
                            </p>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Baca juga{' '}
                                <Link href={route('terms-and-conditions')} className="text-blue-600 underline hover:text-blue-800">
                                    Syarat dan Ketentuan
                                </Link>{' '}
                                kami.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
