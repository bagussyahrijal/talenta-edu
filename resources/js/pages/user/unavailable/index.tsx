import { Button } from '@/components/ui/button';
import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

interface UnavailableItem {
    title?: string;
    slug?: string;
    status?: string;
}

export default function UnavailablePage({
    title,
    item,
    message,
    adminWhatsappUrl,
    backUrl,
    backLabel,
}: {
    title?: string;
    item?: UnavailableItem;
    message?: string;
    adminWhatsappUrl: string;
    backUrl?: string;
    backLabel?: string;
}) {
    const pageTitle = title || 'Tidak Tersedia';
    const itemTitle = item?.title ? `"${item.title}"` : 'Halaman ini';

    return (
        <UserLayout>
            <Head title={pageTitle} />
            <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg sm:p-8 lg:p-12 dark:border-gray-700 dark:bg-zinc-900">
                    <div className="mb-4 rounded-full bg-yellow-50 p-3 sm:mb-6 sm:p-4 dark:bg-yellow-900/20">
                        <AlertTriangle size={48} className="h-10 w-10 text-yellow-500 sm:h-12 sm:w-12 dark:text-yellow-400" />
                    </div>

                    <h2 className="mb-2 text-xl font-bold sm:mb-3 sm:text-2xl lg:text-3xl">
                        {message || `${itemTitle} tidak tersedia. Silahkan hubungi admin.`}
                    </h2>

                    <p className="mb-6 max-w-lg text-sm text-gray-600 sm:mb-8 sm:text-base dark:text-gray-400">
                        {itemTitle} sedang tidak dapat diakses. Jika Anda merasa ini kesalahan, silakan hubungi admin untuk bantuan lebih lanjut.
                    </p>

                    <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
                        <Button asChild variant="outline" className="h-10 flex-1 sm:h-11">
                            {backUrl ? <Link href={backUrl}>{backLabel || 'Kembali'}</Link> : <Link href="/">{backLabel || 'Kembali'}</Link>}
                        </Button>
                        <Button asChild className="h-10 flex-1 sm:h-11">
                            <a href={adminWhatsappUrl} target="_blank" rel="noopener noreferrer">
                                Hubungi Admin
                            </a>
                        </Button>
                    </div>
                </div>
            </section>
        </UserLayout>
    );
}
