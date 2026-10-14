import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProfileLayout from '@/layouts/profile/layout';
import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Course {
    id: string;
    title: string;
    slug: string;
}
interface Bootcamp {
    id: string;
    title: string;
    slug: string;
}
interface Webinar {
    id: string;
    title: string;
    slug: string;
}

interface EnrollmentCourse {
    id: string;
    course: Course;
    price: number;
}
interface EnrollmentBootcamp {
    id: string;
    bootcamp: Bootcamp;
    price: number;
}
interface EnrollmentWebinar {
    id: string;
    webinar: Webinar;
    price: number;
}

interface Invoice {
    id: string;
    invoice_code: string;
    invoice_url: string;
    amount: number;
    status: 'paid' | 'pending' | 'expired' | 'failed' | 'completed';
    paid_at: string | null;
    payment_channel: string | null;
    payment_method: string | null;
    course_items: EnrollmentCourse[];
    bootcamp_items: EnrollmentBootcamp[];
    webinar_items: EnrollmentWebinar[];
    created_at: string;
}

interface Props {
    myTransactions: Invoice[];
}

export default function Transactions({ myTransactions }: Props) {
    const { t, i18n } = useTranslation('profile');
    const [search, setSearch] = useState('');

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'Course':
                return t('transactions.typeCourse', 'Kelas Online');
            case 'Bootcamp':
                return t('transactions.typeBootcamp', 'Bootcamp');
            case 'Webinar':
                return t('transactions.typeWebinar', 'Webinar');
            case 'Bundle':
                return t('transactions.typeBundle', 'Bundling');
            default:
                return type;
        }
    };

    // Gabungkan semua items dari semua invoice menjadi satu array
    const allItems = myTransactions.flatMap((invoice) => [
        ...(invoice.course_items || []).map((item) => ({
            type: 'Course',
            title: item.course.title,
            slug: item.course.slug,
            price: item.price,
            invoice_id: invoice.id,
            invoice_status: invoice.status,
            invoice_code: invoice.invoice_code,
            invoice_url: invoice.invoice_url,
            paid_at: invoice.paid_at,
            payment_channel: invoice.payment_channel,
            payment_method: invoice.payment_method,
            created_at: invoice.created_at,
        })),
        ...(invoice.bootcamp_items || []).map((item) => ({
            type: 'Bootcamp',
            title: item.bootcamp.title,
            slug: item.bootcamp.slug,
            price: item.price,
            invoice_id: invoice.id,
            invoice_status: invoice.status,
            invoice_code: invoice.invoice_code,
            invoice_url: invoice.invoice_url,
            paid_at: invoice.paid_at,
            payment_channel: invoice.payment_channel,
            payment_method: invoice.payment_method,
            created_at: invoice.created_at,
        })),
        ...(invoice.webinar_items || []).map((item) => ({
            type: 'Webinar',
            title: item.webinar.title,
            slug: item.webinar.slug,
            price: item.price,
            invoice_id: invoice.id,
            invoice_status: invoice.status,
            invoice_code: invoice.invoice_code,
            invoice_url: invoice.invoice_url,
            paid_at: invoice.paid_at,
            payment_channel: invoice.payment_channel,
            payment_method: invoice.payment_method,
            created_at: invoice.created_at,
        })),
    ]);

    const filteredItems = allItems.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

    const getStatusComponent = (status: Invoice['status']) => {
        if (status === 'paid' || status === 'completed') {
            return <span className="font-medium text-green-600">{t('transactions.statusPaid', 'Sudah Dibayar')}</span>;
        }
        if (status === 'pending') {
            return <span className="font-medium text-yellow-600">{t('transactions.statusPending', 'Menunggu Pembayaran')}</span>;
        }
        return <span className="font-medium text-red-600">{t('transactions.statusFailed', 'Gagal/Kedaluwarsa')}</span>;
    };

    return (
        <UserLayout>
            <Head title={t('transactions.headTitle', 'Transaksi Saya')} />
            <ProfileLayout>
                <Heading title={t('transactions.title', 'Transaksi Saya')} description={t('transactions.description', 'Lihat riwayat transaksi Anda di sini')} />
                <div className="mb-4 flex justify-between gap-2">
                    <Input
                        type="search"
                        placeholder={t('transactions.searchPlaceholder', 'Cari judul transaksi...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-zinc-800">
                            <tr className="text-left">
                                <th className="p-2 font-medium">{t('transactions.colTitle', 'Judul')}</th>
                                <th className="p-2 font-medium">{t('transactions.colType', 'Tipe')}</th>
                                <th className="p-2 font-medium">{t('transactions.colStatus', 'Status')}</th>
                                <th className="p-2 font-medium">{t('transactions.colPaymentMethod', 'Metode Pembayaran')}</th>
                                <th className="p-2 font-medium">{t('transactions.colInvoice', 'Kode Invoice')}</th>
                                <th className="p-2 font-medium">{t('transactions.colPaidAt', 'Dibayar Pada')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        {t('transactions.empty', 'Belum ada transaksi.')}
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item, idx) => (
                                    <tr key={idx} className="border-t dark:border-zinc-800">
                                        <td className="p-2">
                                            <Link
                                                href={`/profile/my-${item.type.toLowerCase()}s/${item.slug}`}
                                                className="text-primary hover:underline"
                                            >
                                                {item.title}
                                            </Link>
                                        </td>
                                        <td className="p-2">{getTypeLabel(item.type)}</td>
                                        <td className="p-2">{getStatusComponent(item.invoice_status)}</td>
                                        <td className="p-2">
                                            {item.price === 0 ? (
                                                <span className="font-semibold text-green-600">{t('transactions.free', 'GRATIS')}</span>
                                            ) : (
                                                item.payment_channel || item.payment_method || '-'
                                            )}
                                        </td>
                                        <td className="p-2">
                                            <Link href={route('invoice.show', { id: item.invoice_id })} className="text-primary hover:underline">
                                                {item.invoice_code}
                                            </Link>
                                        </td>
                                        <td className="p-2">
                                            {item.invoice_status === 'pending' && item.invoice_url ? (
                                                <Button asChild size="sm" variant="outline">
                                                    <a href={item.invoice_url} target="_blank">
                                                        {t('transactions.continuePayment', 'Lanjutkan Pembayaran')}
                                                    </a>
                                                </Button>
                                            ) : item.paid_at ? (
                                                new Date(item.paid_at).toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </ProfileLayout>
        </UserLayout>
    );
}
