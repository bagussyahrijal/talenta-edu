import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useState } from 'react';
import { Search } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Beranda', href: '/' },
    { title: 'Alumni', href: '/alumni' },
];

const tabs = [
    { key: 'all', label: 'Semua' },
    { key: 'pajak', label: 'Pajak' },
    { key: 'akuntansi', label: 'Akuntansi' },
];

const alumniData = [
    { no: '001', nama: 'Mariah Carey', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '002', nama: 'Nurul Fatimah', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '003', nama: 'Fitria Retno', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '004', nama: 'Alif Zaidan', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '005', nama: 'Siti Aminah', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '006', nama: 'Tebe Hebat', batch: '83', program: 'Brevet Pajak', kategori: 'akuntansi' },
    { no: '001', nama: 'Mariah Carey', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '002', nama: 'Nurul Fatimah', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '003', nama: 'Fitria Retno', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '004', nama: 'Alif Zaidan', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '005', nama: 'Siti Aminah', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '006', nama: 'Tebe Hebat', batch: '83', program: 'Brevet Pajak', kategori: 'akuntansi' },
    { no: '001', nama: 'Mariah Carey', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '002', nama: 'Nurul Fatimah', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '003', nama: 'Fitria Retno', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '004', nama: 'Alif Zaidan', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '005', nama: 'Siti Aminah', batch: '83', program: 'Brevet Pajak', kategori: 'pajak' },
    { no: '006', nama: 'Tebe Hebat', batch: '83', program: 'Brevet Pajak', kategori: 'akuntansi' },
    // ...tambahkan data lain sesuai kebutuhan
];

export default function AlumniIndex() {
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Filter data sesuai tab dan search
    const filteredData = alumniData.filter((item) => {
        const matchTab = activeTab === 'all' ? true : item.kategori === activeTab;
        const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    // Pagination
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage);

    return (
        <UserLayout>
            <Head title="Alumni" />
            <div className="container mx-auto px-4 py-8 text-primary">
                <div className="mb-8 mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-2 font-literata text-primary">Alumni</h1>
                    <div className="mb-16 flex justify-center">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8 flex justify-center gap-16 ">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setPage(1); }}
                            className={`transition ${
                                activeTab === tab.key
                                    ? 'text-primary underline underline-offset-6'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="mb-6 flex justify-center">
                    <div className="relative w-full max-w-7xl">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                            <Search size={20} />
                        </span>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
                            placeholder="Search"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-center">
                        <thead>
                            <tr className="bg-white text-primary border-b">
                                <th className="py-3 px-2 font-medium">No</th>
                                <th className="py-3 px-2 font-medium underline text-primary cursor-pointer">Nama Peserta <span className="inline-block align-middle">⇅</span></th>
                                <th className="py-3 px-2 font-medium underline text-primary cursor-pointer">Batch <span className="inline-block align-middle">⇅</span></th>
                                <th className="py-3 px-2 font-medium underline text-primary cursor-pointer">Program Yang Diikuti <span className="inline-block align-middle">⇅</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length > 0 ? paginatedData.map((item, idx) => (
                                <tr key={item.no + item.nama + idx} className="border-b">
                                    <td className="py-3 px-2">{item.no}</td>
                                    <td className="py-3 px-2">{item.nama}</td>
                                    <td className="py-3 px-2">{item.batch}</td>
                                    <td className="py-3 px-2">{item.program}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="py-6 text-muted-foreground">Data tidak ditemukan</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                    <div className="text-muted-foreground text-sm">
                        {`1-${Math.min(perPage, totalItems)} of ${totalItems} items`}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="px-2 py-1 rounded bg-primary text-white disabled:bg-muted"
                            disabled={page === 1}
                            onClick={() => setPage(1)}
                        >◀◀</button>
                        <button
                            className="px-2 py-1 rounded bg-primary text-white disabled:bg-muted"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >◀</button>
                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx}
                                className={`px-3 py-1 rounded ${page === idx + 1 ? 'bg-primary text-white' : 'bg-white text-primary'}`}
                                onClick={() => setPage(idx + 1)}
                            >{idx + 1}</button>
                        ))}
                        <button
                            className="px-2 py-1 rounded bg-primary text-white disabled:bg-muted"
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >▶</button>
                        <button
                            className="px-2 py-1 rounded bg-primary text-white disabled:bg-muted"
                            disabled={page === totalPages}
                            onClick={() => setPage(totalPages)}
                        >▶▶</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            className="border rounded px-2 py-1 text-primary"
                            value={perPage}
                            onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                        >
                            {[10, 20, 50].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                        <span className="text-muted-foreground text-sm">Items per Page</span>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}