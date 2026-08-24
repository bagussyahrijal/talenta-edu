import DeleteConfirmDialog from '@/components/delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/layouts/admin-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    ArrowLeft,
    CheckCircle2,
    Edit,
    KeyRound,
    Mail,
    Phone,
    Shield,
    Trash,
    User as UserIcon,
    XCircle,
} from 'lucide-react';
import React from 'react';
import { PermissionGroup } from './permission-selector';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Staff',
        href: '/admin/staff',
    },
    {
        title: 'Detail Staff',
        href: '#',
    },
];

interface StaffShowProps {
    staff: {
        id: string;
        name: string;
        email: string;
        phone_number: string;
        instance?: string;
        city?: string;
        avatar?: string;
        email_verified_at?: string;
        created_at: string;
        permissions: string[];
    };
    permission_modules: PermissionGroup[];
}

export default function StaffShow({ staff, permission_modules }: StaffShowProps) {
    const modules = permission_modules
        .map((group) => ({
            ...group,
            modules: group.modules.filter((m) => m.key !== 'earnings'),
        }))
        .filter((group) => group.modules.length > 0);
    const handleDelete = () => {
        router.delete(route('staff.destroy', staff.id));
    };

    const hasPermission = (permissionKey: string) => staff.permissions.includes(permissionKey);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Staff - ${staff.name}`} />

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{staff.name}</h1>
                        <p className="text-muted-foreground text-sm">Informasi profil staff dan hak akses menu yang diberikan.</p>
                    </div>
                    <Button variant="outline" asChild className="hover:cursor-pointer">
                        <Link href={route('staff.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Daftar
                        </Link>
                    </Button>
                </div>

                {/* Profile Overview Card */}
                <div className="flex flex-col gap-4 rounded-lg border bg-card p-6 sm:flex-row sm:items-center sm:justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        {staff.avatar ? (
                            <img
                                src={staff.avatar}
                                alt={staff.name}
                                className="h-16 w-16 rounded-full object-cover border"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                                {getInitials(staff.name)}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold">{staff.name}</h2>
                                <Badge variant="secondary" className="text-xs">
                                    Role: Staff
                                </Badge>
                                {staff.email_verified_at ? (
                                    <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                        Terverifikasi
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                                        Belum Verifikasi
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    {staff.email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5" />
                                    {staff.phone_number}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="hover:cursor-pointer">
                            <Link href={route('staff.edit', staff.id)}>
                                <Edit className="mr-1.5 h-4 w-4" />
                                Edit Data
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Left Column: Details + Permissions */}
                    <Tabs defaultValue="info" className="lg:col-span-2 space-y-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="info">Informasi Akun</TabsTrigger>
                            <TabsTrigger value="permissions">
                                Hak Akses Menu ({staff.permissions.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab 1: Account Information */}
                        <TabsContent value="info">
                            <div className="rounded-lg border">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="w-1/3 font-medium text-muted-foreground">Nama Lengkap</TableCell>
                                            <TableCell className="font-semibold">{staff.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium text-muted-foreground">Email</TableCell>
                                            <TableCell>{staff.email}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium text-muted-foreground">No. Telepon / WA</TableCell>
                                            <TableCell>{staff.phone_number}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium text-muted-foreground">Instansi / Asal</TableCell>
                                            <TableCell>{staff.instance || '-'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium text-muted-foreground">Kota Domisili</TableCell>
                                            <TableCell>{staff.city || '-'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium text-muted-foreground">Status Verifikasi</TableCell>
                                            <TableCell>
                                                {staff.email_verified_at ? (
                                                    <span className="text-green-600 font-medium flex items-center gap-1">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Terverifikasi ({format(new Date(staff.email_verified_at), 'dd MMM yyyy', { locale: id })})
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600 font-medium">Belum Verifikasi</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium text-muted-foreground">Jumlah Hak Akses</TableCell>
                                            <TableCell>
                                                <div className="inline-flex items-center gap-1.5 rounded bg-gray-200 px-2 py-1 font-semibold text-xs text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                                                    <KeyRound className="h-3 w-3 text-primary" />
                                                    <span>{staff.permissions.length} Akses Diberikan</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        {/* Tab 2: Permissions Matrix */}
                        <TabsContent value="permissions">
                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <div>
                                        <h2 className="text-lg font-medium">Hak Akses Menu</h2>
                                        <p className="text-muted-foreground text-xs">
                                            Daftar menu dan tingkat akses yang diizinkan untuk staff ini.
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {staff.permissions.length} Akses Aktif
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    {modules.map((group) => {
                                        const groupModuleKeys = group.modules.flatMap((m) => [`${m.key}.view`, `${m.key}.manage`]);
                                        const groupActiveCount = groupModuleKeys.filter((p) => hasPermission(p)).length;

                                        return (
                                            <div key={group.group} className="rounded-lg border overflow-hidden">
                                                <div className="flex items-center justify-between bg-muted/40 px-4 py-2.5 border-b">
                                                    <h3 className="text-sm font-semibold">{group.group}</h3>
                                                    <span className="text-xs text-muted-foreground">
                                                        {groupActiveCount} dari {groupModuleKeys.length} akses aktif
                                                    </span>
                                                </div>
                                                <div className="divide-y">
                                                    {group.modules.map((module) => {
                                                        const canView = hasPermission(`${module.key}.view`);
                                                        const canManage = hasPermission(`${module.key}.manage`);

                                                        return (
                                                            <div
                                                                key={module.key}
                                                                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/10 transition-colors"
                                                            >
                                                                <span className="font-medium">{module.label}</span>
                                                                <div className="flex items-center gap-2">
                                                                    {canView ? (
                                                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                            Lihat
                                                                        </span>
                                                                    ) : null}

                                                                    {canManage ? (
                                                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-300">
                                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                            Kelola
                                                                        </span>
                                                                    ) : null}

                                                                    {!canView && !canManage && (
                                                                        <span className="inline-flex items-center text-xs text-muted-foreground/60">
                                                                            <XCircle className="mr-1 h-3 w-3" />
                                                                            Tidak Ada Akses
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Right Column: Actions */}
                    <div>
                        <h2 className="my-2 text-lg font-medium">Edit & Kustom</h2>
                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="space-y-2">
                                <Button className="w-full hover:cursor-pointer" variant="secondary" asChild>
                                    <Link href={route('staff.edit', staff.id)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Staff & Hak Akses
                                    </Link>
                                </Button>
                                <DeleteConfirmDialog
                                    trigger={
                                        <Button variant="destructive" className="w-full hover:cursor-pointer">
                                            <Trash className="mr-2 h-4 w-4" /> Hapus Staff
                                        </Button>
                                    }
                                    title="Apakah Anda yakin ingin menghapus staff ini?"
                                    itemName={staff.name}
                                    onConfirm={handleDelete}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer timestamp */}
                <div className="mt-4 rounded-lg border p-4">
                    <h3 className="text-muted-foreground text-center text-sm">
                        Dibuat pada : {format(new Date(staff.created_at), 'dd MMMM yyyy HH:mm', { locale: id })}
                    </h3>
                </div>
            </div>
        </AdminLayout>
    );
}
