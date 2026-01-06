import { Button } from '@/components/ui/button';
import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Crown, FileText, Sparkles, ArrowRight } from 'lucide-react';

interface CourseItem {
    course: { title: string; slug: string; thumbnail: string };
}
interface BootcampItem {
    bootcamp: { title: string; slug: string; thumbnail: string };
}
interface WebinarItem {
    webinar: { title: string; slug: string; thumbnail: string };
}

interface Invoice {
    id: string;
    amount: number;
    course_items?: CourseItem[];
    bootcamp_items?: BootcampItem[];
    webinar_items?: WebinarItem[];
}

interface InvoiceProps {
    invoice: Invoice;
}

export default function CheckoutSuccess({ invoice }: InvoiceProps) {
    const courseItems = invoice.course_items ?? [];
    const bootcampItems = invoice.bootcamp_items ?? [];
    const webinarItems = invoice.webinar_items ?? [];

    let title = '';
    let link = '';
    let label = '';
    let subtitle = '';

    if (courseItems.length > 0) {
        title = courseItems[0].course.title;
        link = `/profile/my-courses/${courseItems[0].course.slug}`;
        label = 'Akses Kelas Sekarang';
        subtitle = 'Kelas';
    } else if (bootcampItems.length > 0) {
        title = bootcampItems[0].bootcamp.title;
        link = `/profile/my-bootcamps/${bootcampItems[0].bootcamp.slug}`;
        label = 'Akses Bootcamp Sekarang';
        subtitle = 'Bootcamp';
    } else if (webinarItems.length > 0) {
        title = webinarItems[0].webinar.title;
        link = `/profile/my-webinars/${webinarItems[0].webinar.slug}`;
        label = 'Akses Webinar Sekarang';
        subtitle = 'Webinar';
    } else {
        title = 'Pembelian Anda';
        link = '/profile';
        label = 'Lihat Profil';
        subtitle = 'Produk';
    }

    return (
        <UserLayout>
            <Head title="Checkout Berhasil" />
            <section className="relative w-full min-h-screen  dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-16 overflow-hidden">
                

                <div className="relative mx-auto max-w-4xl">
                    {/* Success Icon with Animation */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-400/20 dark:bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700 rounded-full p-6 shadow-2xl shadow-emerald-500/50">
                                <CheckCircle2 className="w-20 h-20 text-white animate-bounce" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    <div className="text-center mb-8 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-semibold  text-emerald-700 dark:text-emerald-300">Pembayaran Berhasil</span>
                        </div>
                        
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-literata text-gray-900 dark:text-white mb-4">
                            Selamat! 🎉
                        </h1>
                        
                        <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 font-medium">
                            Anda berhasil membeli {subtitle}
                        </p>
                        
                        <div className=" dark:bg-gray-800 p-6  dark:border-gray-700 max-w-2xl mx-auto">
                            <p className="text-2xl sm:text-3xl underline font-bold text-gray-900 dark:text-white">
                                "{title}"
                            </p>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className=" rounded-2xl p-6 sm:p-8 mb-8 border border-blue-200 dark:border-blue-800">
                        <p className="text-center text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                            Terima kasih telah menyelesaikan pembayaran! 🙏
                            <br />
                            <span className="font-semibold text-gray-900 dark:text-white">Invoice sudah dikirimkan ke nomor WhatsApp Anda.</span>
                            <br />
                            Klik tombol di bawah untuk mulai mengakses konten Anda.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button 
                            size="lg" 
                            className=" shadow-lg  transition-all duration-300 text-lg px-8 py-6 rounded-xl font-semibold group w-full sm:w-auto"
                            asChild
                        >
                            <Link href={link}>
                                <Crown className="w-5 h-5" />
                                {label}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            size="lg"
                            className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white shadow-md hover:shadow-lg transition-all duration-300 text-lg px-8 py-6 rounded-xl font-semibold w-full sm:w-auto"
                            asChild
                        >
                            <a href={route('invoice.pdf', { id: invoice.id })} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-5 h-5" />
                                Unduh Invoice
                            </a>
                        </Button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-12 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Butuh bantuan? <a href="/contact" className="text-primary dark:text-emerald-400 hover:underline font-semibold">Hubungi Support</a>
                        </p>
                    </div>
                </div>
            </section>
        </UserLayout>
    );
}