import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    CheckCircle2,
    DollarSign,
    ExternalLink,
    FileText,
    Gift,
    GraduationCap,
    KeyRound,
    Layers,
    LayoutGrid,
    Megaphone,
    MonitorPlay,
    Presentation,
    Shield,
    Sparkles,
    Tag,
    UserCheck,
    Users as UsersIcon,
    Video,
    Wrench,
} from 'lucide-react';
import React from 'react';
import { ParticipantChart } from './charts/participant-chart';

interface AccessibleModule {
    key: string;
    label: string;
    group: string;
    can_view: boolean;
    can_manage: boolean;
}

interface PopularProduct {
    id: number | string;
    title: string;
    type: 'course' | 'bootcamp' | 'webinar';
    enrollment_count: number;
    thumbnail?: string;
}

interface ParticipantData {
    date: string;
    count: number;
    type: 'course' | 'bootcamp' | 'webinar';
}

interface StaffDashboardProps {
    stats: {
        total_users: number;
        new_users_last_week: number;
        total_courses: number;
        total_bootcamps: number;
        total_webinars: number;
        total_articles: number;
        total_certification_programs: number;
        total_participants: number;
        permissions_count: number;
        active_permissions: string[];
        accessible_modules: AccessibleModule[];
        popular_products: PopularProduct[];
        participant_data: ParticipantData[];
    };
}

// Module icon mapping
const getModuleIcon = (key: string) => {
    switch (key) {
        case 'courses':
            return <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
        case 'bootcamps':
            return <Presentation className="h-5 w-5 text-green-600 dark:text-green-400" />;
        case 'webinars':
            return <MonitorPlay className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
        case 'articles':
            return <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
        case 'certification-programs':
            return <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
        case 'users':
            return <UsersIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
        case 'categories':
            return <Layers className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />;
        case 'tools':
            return <Wrench className="h-5 w-5 text-slate-600 dark:text-slate-400" />;
        case 'discount-codes':
        case 'promotions':
            return <Tag className="h-5 w-5 text-rose-600 dark:text-rose-400" />;
        case 'certificates':
            return <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
        case 'broadcasts':
            return <Megaphone className="h-5 w-5 text-red-600 dark:text-red-400" />;
        case 'bundles':
            return <Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
        case 'transactions':
        case 'earnings':
            return <DollarSign className="h-5 w-5 text-teal-600 dark:text-teal-400" />;
        default:
            return <LayoutGrid className="h-5 w-5 text-primary" />;
    }
};

// Route mapping for quick links
const getModuleRoute = (key: string) => {
    switch (key) {
        case 'courses':
            return route('courses.index');
        case 'bootcamps':
            return route('bootcamps.index');
        case 'webinars':
            return route('webinars.index');
        case 'articles':
            return route('articles.index');
        case 'certification-programs':
            return route('certification-programs.index');
        case 'users':
            return route('users.index');
        case 'mentors':
            return route('mentors.index');
        case 'affiliates':
            return route('affiliates.index');
        case 'categories':
            return route('categories.index');
        case 'tools':
            return route('tools.index');
        case 'certificates':
            return route('certificates.index');
        case 'discount-codes':
            return route('discount-codes.index');
        case 'promotions':
            return route('promotions.index');
        case 'broadcasts':
            return route('broadcasts.index');
        case 'bundles':
            return route('bundles.index');
        case 'transactions':
            return route('transactions.index');
        case 'earnings':
            return route('earnings.index');
        case 'referral':
            return route('admin.referral.settings');
        default:
            return '#';
    }
};

export default function StaffDashboard({ stats }: StaffDashboardProps) {
    const totalContent =
        (stats.total_courses || 0) +
        (stats.total_bootcamps || 0) +
        (stats.total_webinars || 0) +
        (stats.total_articles || 0) +
        (stats.total_certification_programs || 0);

    return (
        <div className="space-y-6">
            {/* Top Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="dark:to-background rounded-lg border bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm dark:from-blue-950/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Total Pengguna</p>
                            <h3 className="mt-2 text-2xl font-bold">{stats.total_users || 0}</h3>
                            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                +{stats.new_users_last_week || 0} dalam seminggu
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="dark:to-background rounded-lg border bg-gradient-to-br from-green-50 to-white p-4 shadow-sm dark:from-green-950/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Peserta Belajar</p>
                            <h3 className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                                {stats.total_participants || 0}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">Total pendaftaran aktif</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="dark:to-background rounded-lg border bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm dark:from-purple-950/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Katalog Konten</p>
                            <h3 className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {totalContent}
                            </h3>
                            <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                                Kelas, Bootcamp, Webinar, Artikel
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                            <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="dark:to-background rounded-lg border bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm dark:from-amber-950/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">Hak Akses Anda</p>
                            <h3 className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {stats.permissions_count || 0}
                            </h3>
                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                {stats.accessible_modules?.length || 0} modul diizinkan
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <KeyRound className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Catalog Breakdown Cards */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Distribusi Konten Platform
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    <div className="flex flex-col items-center rounded-lg border bg-muted/20 p-3 text-center">
                        <BookOpen className="h-5 w-5 text-blue-600 mb-1" />
                        <span className="text-xs text-muted-foreground">Kelas Online</span>
                        <span className="text-lg font-bold mt-0.5">{stats.total_courses || 0}</span>
                    </div>
                    <div className="flex flex-col items-center rounded-lg border bg-muted/20 p-3 text-center">
                        <Presentation className="h-5 w-5 text-green-600 mb-1" />
                        <span className="text-xs text-muted-foreground">Bootcamp</span>
                        <span className="text-lg font-bold mt-0.5">{stats.total_bootcamps || 0}</span>
                    </div>
                    <div className="flex flex-col items-center rounded-lg border bg-muted/20 p-3 text-center">
                        <MonitorPlay className="h-5 w-5 text-purple-600 mb-1" />
                        <span className="text-xs text-muted-foreground">Webinar</span>
                        <span className="text-lg font-bold mt-0.5">{stats.total_webinars || 0}</span>
                    </div>
                    <div className="flex flex-col items-center rounded-lg border bg-muted/20 p-3 text-center">
                        <Award className="h-5 w-5 text-amber-600 mb-1" />
                        <span className="text-xs text-muted-foreground">Sertifikasi</span>
                        <span className="text-lg font-bold mt-0.5">{stats.total_certification_programs || 0}</span>
                    </div>
                    <div className="flex flex-col items-center rounded-lg border bg-muted/20 p-3 text-center">
                        <FileText className="h-5 w-5 text-orange-600 mb-1" />
                        <span className="text-xs text-muted-foreground">Artikel</span>
                        <span className="text-lg font-bold mt-0.5">{stats.total_articles || 0}</span>
                    </div>
                </div>
            </div>

            {/* Quick Access Modules Navigation */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold">Akses Cepat Modul</h3>
                        <p className="text-xs text-muted-foreground">
                            Pintasan ke modul yang telah diberikan izin akses untuk akun Anda.
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs font-normal">
                        {stats.accessible_modules?.length || 0} Modul Tersedia
                    </Badge>
                </div>

                {stats.accessible_modules && stats.accessible_modules.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {stats.accessible_modules.map((mod) => (
                            <Link
                                key={mod.key}
                                href={getModuleRoute(mod.key)}
                                className="group flex flex-col justify-between rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60 group-hover:bg-primary/10 transition-colors">
                                            {getModuleIcon(mod.key)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {mod.can_manage ? (
                                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-300">
                                                    <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />
                                                    Kelola
                                                </span>
                                            ) : mod.can_view ? (
                                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                                    Lihat
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                                            {mod.label}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">{mod.group}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-end text-xs font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                                    <span>Buka Modul</span>
                                    <ExternalLink className="ml-1 h-3.5 w-3.5" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <KeyRound className="mx-auto h-8 w-8 text-muted-foreground/50" />
                        <p className="mt-2 text-sm font-medium">Belum ada hak akses modul yang diberikan.</p>
                        <p className="text-xs text-muted-foreground">
                            Hubungi Administrator untuk mendapatkan izin akses ke modul yang diperlukan.
                        </p>
                    </div>
                )}
            </div>

            {/* Activity & Popular Products Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Participant Chart (2 cols) */}
                <div className="lg:col-span-2">
                    {stats.participant_data && stats.participant_data.length > 0 ? (
                        <ParticipantChart data={stats.participant_data} />
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Aktivitas Pendaftaran Peserta</CardTitle>
                                <CardDescription>Data pendaftaran siswa di seluruh kelas dan bootcamp.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                                Belum ada data aktivitas terkini.
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Popular Products (1 col - Safe Non-Financial) */}
                <div>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                Produk Terpopuler
                            </CardTitle>
                            <CardDescription>Produk dengan minat pendaftar terbanyak.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            {stats.popular_products && stats.popular_products.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.popular_products.map((item, idx) => (
                                        <div
                                            key={`${item.type}-${item.id}-${idx}`}
                                            className="flex items-center gap-3 rounded-lg border p-2.5 text-sm"
                                        >
                                            {item.thumbnail ? (
                                                <img
                                                    src={`/storage/${item.thumbnail}`}
                                                    alt={item.title}
                                                    className="h-10 w-10 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                                                    {getModuleIcon(item.type === 'course' ? 'courses' : item.type === 'bootcamp' ? 'bootcamps' : 'webinars')}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-xs line-clamp-1">{item.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="outline" className="text-[10px] capitalize px-1 py-0">
                                                        {item.type}
                                                    </Badge>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {item.enrollment_count} Peserta
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground text-center py-8">
                                    Belum ada data produk populer.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
