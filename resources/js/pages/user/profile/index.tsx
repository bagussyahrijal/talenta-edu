import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ProfileLayout from '@/layouts/profile/layout';
import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { enUS, id as idLocale } from 'date-fns/locale';
import { BookTextIcon, BriefcaseBusiness, ExternalLink, GraduationCap, MessageCircle, MonitorPlay, Play, Presentation } from 'lucide-react';
import { formatExternalUrl } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Product {
    id: string;
    title: string;
    slug: string;
    type: 'course' | 'bootcamp' | 'webinar' | 'certification-program';
    routeParam?: string;
    is_scholarship?: boolean;
    progress?: number;
    completed_at?: string;
    start_date?: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    group_url?: string;
    enrolled_at: string;
    is_installment?: boolean;
    is_fully_paid?: boolean;
    is_suspended?: boolean;
}

interface ProfileProps {
    stats: {
        courses: number;
        bootcamps: number;
        webinars: number;
        certificationPrograms: number;
        total: number;
    };
    recentProducts: Product[];
}

export default function Profile({ stats, recentProducts }: ProfileProps) {
    const { t, i18n } = useTranslation(['profile', 'common']);
    const dateLocale = i18n.language === 'en' ? enUS : idLocale;

    const getProductTypeLabel = (type: string): string => {
        switch (type) {
            case 'course':
                return t('dashboard.stats.courses', 'Kelas Online');
            case 'bootcamp':
                return t('dashboard.stats.bootcamps', 'Bootcamp');
            case 'webinar':
                return t('dashboard.stats.webinars', 'Webinar');
            case 'certification-program':
                return t('dashboard.stats.certifications', 'Sertifikasi Program');
            default:
                return t('dashboard.table.product', 'Produk');
        }
    };

    const getProductTypeIcon = (type: string) => {
        switch (type) {
            case 'course':
                return <BookTextIcon className="h-4 w-4" />;
            case 'bootcamp':
                return <Presentation className="h-4 w-4" />;
            case 'webinar':
                return <MonitorPlay className="h-4 w-4" />;
            case 'certification-program':
                return <BriefcaseBusiness className="h-4 w-4" />;
            default:
                return <GraduationCap className="h-4 w-4" />;
        }
    };

    const getProgressBadge = (progress: number) => {
        if (progress === 100) {
            return <Badge className="border-green-300 bg-green-100 text-green-700">{t('dashboard.table.statusCompleted', 'Selesai')}</Badge>;
        } else if (progress > 0) {
            return <Badge className="border-blue-300 bg-blue-100 text-blue-700">{t('dashboard.table.statusOngoing', 'Berlangsung')}</Badge>;
        } else {
            return <Badge className="border-gray-300 bg-gray-100 text-gray-700">{t('dashboard.table.statusNotStarted', 'Belum Dimulai')}</Badge>;
        }
    };

    const getProductDetailUrl = (product: Product): string => {
        if (!product.slug) return '#';
        if (product.type === 'certification-program') {
            return route('profile.certification-program.detail', { program: product.slug });
        }
        const paramKey = product.routeParam || product.type;
        return route(`profile.${product.type}.detail`, { [paramKey]: product.slug });
    };

    const formatSchedule = (product: Product): string => {
        if (product.type === 'bootcamp') {
            if (!product.start_date) return '-';
            const startDate = format(new Date(product.start_date), 'dd MMM yyyy', { locale: dateLocale });
            const endDate = product.end_date ? format(new Date(product.end_date), 'dd MMM yyyy', { locale: dateLocale }) : '';
            return endDate ? `${startDate} - ${endDate}` : startDate;
        }

        if (product.type === 'webinar') {
            if (!product.start_time) return '-';
            const startTime = format(new Date(product.start_time), 'dd MMM yyyy, HH:mm', { locale: dateLocale });
            const endTime = product.end_time ? format(new Date(product.end_time), 'HH:mm', { locale: dateLocale }) : '';
            return endTime ? `${startTime} - ${endTime}` : startTime;
        }

        return '-';
    };

    return (
        <UserLayout>
            <Head title={t('sidebar.title', 'Profil')} />
            <ProfileLayout>
                <Heading title={t('dashboard.title', 'Dashboard')} description={t('dashboard.description', 'Pantau aktivitas dan progres belajar Anda di sini.')} />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.stats.total', 'Total Produk')}</CardTitle>
                            <GraduationCap className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-muted-foreground text-xs">{t('dashboard.stats.totalDesc', 'Total item yang Anda ikuti')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.stats.courses', 'Kelas Online')}</CardTitle>
                            <BookTextIcon className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.courses}</div>
                            <p className="text-muted-foreground text-xs">{t('dashboard.stats.coursesDesc', 'Kelas yang telah Anda beli')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.stats.bootcamps', 'Bootcamp')}</CardTitle>
                            <Presentation className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.bootcamps}</div>
                            <p className="text-muted-foreground text-xs">{t('dashboard.stats.bootcampsDesc', 'Bootcamp yang Anda ikuti')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.stats.webinars', 'Webinar')}</CardTitle>
                            <MonitorPlay className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.webinars}</div>
                            <p className="text-muted-foreground text-xs">{t('dashboard.stats.webinarsDesc', 'Webinar yang Anda ikuti')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.stats.certifications', 'Sertifikasi Program')}</CardTitle>
                            <BriefcaseBusiness className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.certificationPrograms}</div>
                            <p className="text-muted-foreground text-xs">{t('dashboard.stats.certificationsDesc', 'Program sertifikasi yang Anda ikuti')}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <Heading title={t('dashboard.myProducts', 'Produk Saya')} description={t('dashboard.myProductsDesc', 'Daftar produk yang telah Anda beli dan ikuti.')} />
                    <Card className="p-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('dashboard.table.product', 'Produk')}</TableHead>
                                    <TableHead>{t('dashboard.table.type', 'Tipe')}</TableHead>
                                    <TableHead>{t('dashboard.table.schedule', 'Jadwal')}</TableHead>
                                    <TableHead>{t('dashboard.table.statusProgress', 'Status/Progress')}</TableHead>
                                    <TableHead>{t('dashboard.table.action', 'Aksi')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentProducts.length > 0 ? (
                                    recentProducts.map((product) => (
                                        <TableRow key={`${product.type}-${product.id}`}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {getProductTypeIcon(product.type)}
                                                    <Link
                                                        href={getProductDetailUrl(product)}
                                                        className="hover:text-primary"
                                                    >
                                                        {product.title}
                                                    </Link>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getProductTypeLabel(product.type)}</TableCell>
                                            <TableCell>
                                                {product.type === 'course' ? (
                                                    <span className="text-gray-500">{t('dashboard.table.selfPaced', 'Belajar Mandiri')}</span>
                                                ) : product.type === 'certification-program' ? (
                                                    <span className="text-gray-500">{t('dashboard.table.certRegistration', 'Pendaftaran Sertifikasi')}</span>
                                                ) : (
                                                    formatSchedule(product)
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {product.type === 'course' ? (
                                                    <div className="space-y-2">
                                                        {getProgressBadge(product.progress || 0)}
                                                        <div className="flex items-center gap-2">
                                                            <Progress value={product.progress || 0} className="w-20" />
                                                            <span className="text-xs text-gray-500">{product.progress || 0}%</span>
                                                        </div>
                                                        {product.is_installment && (
                                                            <div>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        product.is_fully_paid
                                                                            ? 'border-green-300 bg-green-50 text-green-700'
                                                                            : product.is_suspended
                                                                            ? 'border-red-300 bg-red-50 text-red-700'
                                                                            : 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                                                    }
                                                                >
                                                                    {product.is_fully_paid ? t('dashboard.table.installmentPaid', 'Cicilan Lunas') : product.is_suspended ? t('dashboard.table.installmentSuspended', 'Cicilan Dibekukan') : t('dashboard.table.installmentActive', 'Cicilan Aktif')}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : product.type === 'certification-program' ? (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                                            {product.is_scholarship ? t('dashboard.table.scholarship', 'Beasiswa') : t('dashboard.table.regular', 'Reguler')}
                                                        </Badge>
                                                        {product.is_installment && (
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    product.is_fully_paid
                                                                        ? 'border-green-300 bg-green-50 text-green-700'
                                                                        : product.is_suspended
                                                                        ? 'border-red-300 bg-red-50 text-red-700'
                                                                        : 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                                                }
                                                            >
                                                                {product.is_fully_paid ? t('dashboard.table.installmentPaid', 'Cicilan Lunas') : product.is_suspended ? t('dashboard.table.installmentSuspended', 'Cicilan Dibekukan') : t('dashboard.table.installmentActive', 'Cicilan Aktif')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                                            {t('dashboard.table.statusRegistered', 'Terdaftar')}
                                                        </Badge>
                                                        {product.is_installment && (
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    product.is_fully_paid
                                                                        ? 'border-green-300 bg-green-50 text-green-700'
                                                                        : product.is_suspended
                                                                        ? 'border-red-300 bg-red-50 text-red-700'
                                                                        : 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                                                }
                                                            >
                                                                {product.is_fully_paid ? t('dashboard.table.installmentPaid', 'Cicilan Lunas') : product.is_suspended ? t('dashboard.table.installmentSuspended', 'Cicilan Dibekukan') : t('dashboard.table.installmentActive', 'Cicilan Aktif')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {product.is_installment && !product.is_fully_paid && (
                                                        <Button
                                                             asChild
                                                             size="sm"
                                                             variant="outline"
                                                             className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                         >
                                                             <Link href={route('profile.installments')}>
                                                                 {t('dashboard.table.btnInstallment', 'Cicilan')}
                                                             </Link>
                                                         </Button>
                                                     )}
                                                     {product.type === 'course' ? (
                                                         <Button asChild size="sm" variant="outline">
                                                             <Link href={route('profile.course.detail', { course: product.slug })}>
                                                                 <Play className="mr-1 h-4 w-4" />
                                                                 {t('dashboard.table.btnLearn', 'Belajar')}
                                                             </Link>
                                                         </Button>
                                                     ) : (
                                                         <>
                                                             <Button asChild size="sm" variant="outline">
                                                                 <Link
                                                                     href={getProductDetailUrl(product)}
                                                                 >
                                                                     <ExternalLink className="mr-1 h-4 w-4" />
                                                                     {t('dashboard.table.btnDetail', 'Detail')}
                                                                 </Link>
                                                             </Button>
                                                             {product.group_url && (
                                                                 <Button asChild size="sm" variant="default">
                                                                     <a href={formatExternalUrl(product.group_url)} target="_blank" rel="noopener noreferrer">
                                                                         <MessageCircle className="mr-1 h-4 w-4" />
                                                                         {t('dashboard.table.btnGroup', 'Grup WA')}
                                                                     </a>
                                                                 </Button>
                                                             )}
                                                         </>
                                                     )}
                                                 </div>
                                             </TableCell>
                                         </TableRow>
                                     ))
                                 ) : (
                                     <TableRow>
                                         <TableCell colSpan={5} className="py-8 text-center">
                                             <div className="text-gray-500">
                                                 <GraduationCap className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                                 <p>{t('dashboard.table.empty', 'Belum ada produk yang dibeli.')}</p>
                                                 <Button asChild className="mt-4" variant="outline">
                                                     <Link href={route('course.index')}>{t('dashboard.table.browseCourses', 'Jelajahi Kelas')}</Link>
                                                 </Button>
                                             </div>
                                         </TableCell>
                                     </TableRow>
                                 )}
                             </TableBody>
                         </Table>
                     </Card>
                 </div>
             </ProfileLayout>
         </UserLayout>
     );
 }
