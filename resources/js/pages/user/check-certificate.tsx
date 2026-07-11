import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserLayout from '@/layouts/user-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, Award, Calendar, Check, Copy, Download, ExternalLink, Mail, Phone, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CertificateParticipant {
    id: string;
    certificate_code: string;
    certificate_number: number;
    created_at: string;
    user?: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    } | null;
    certificate: {
        id: string;
        title: string;
        issued_date: string;
        course?: { title: string } | null;
        bootcamp?: { title: string } | null;
        webinar?: { title: string } | null;
        design?: {
            id: string;
            name: string;
            image_1: string | null;
            image_2: string | null;
        } | null;
    };
}

interface CheckCertificateProps {
    participants: CertificateParticipant[];
    searched: boolean;
    error: string | null;
    filters: {
        email: string | null;
        phone_number: string | null;
    };
}

export default function CheckCertificate({ participants, searched, error, filters }: CheckCertificateProps) {
    const { auth } = usePage<SharedData>().props;

    const [email, setEmail] = useState(filters.email || (auth.user?.email as string) || '');
    const [phone, setPhone] = useState(filters.phone_number || (auth.user?.phone_number as string) || '');
    const [loading, setLoading] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Beranda', href: '/' },
        { title: 'Cek Sertifikat', href: '/certificates/check' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !phone.trim()) return;

        setLoading(true);
        router.get(
            route('certificates.check'),
            { email, phone_number: phone },
            {
                preserveState: true,
                onFinish: () => setLoading(false),
            },
        );
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success('Kode sertifikat berhasil disalin!');
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getProgramDetails = (participant: CertificateParticipant) => {
        const cert = participant.certificate;
        if (cert.course) {
            return {
                title: cert.course.title,
                type: 'Kelas Online',
                color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
            };
        }
        if (cert.bootcamp) {
            return {
                title: cert.bootcamp.title,
                type: 'Bootcamp',
                color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400',
            };
        }
        if (cert.webinar) {
            return {
                title: cert.webinar.title,
                type: 'Webinar',
                color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
            };
        }
        return {
            title: cert.title,
            type: 'Sertifikat',
            color: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400',
        };
    };

    return (
        <UserLayout breadcrumbs={breadcrumbs}>
            <Head title="Cek Sertifikat" />

            {/* Premium Hero Banner */}
            <section className="bg-secondary/35 border-primary/10 relative w-full overflow-hidden border-b py-12 md:py-16">
                <div className="absolute inset-0 bg-[radial-gradient(#1976D3_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                <div className="relative mx-auto max-w-3xl px-4 text-center">
                    <div className="mb-4 flex justify-center">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                    <h1 className="font-literata text-primary mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">Cek Sertifikat Anda</h1>
                    <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed sm:text-base">
                        Masukkan email dan nomor WhatsApp Anda yang terdaftar untuk mencari, melihat, dan mengunduh sertifikat kelulusan program resmi
                        Anda.
                    </p>
                </div>
            </section>

            {/* Main Form & Results Section */}
            <section className="bg-background mx-auto max-w-7xl space-y-12 px-4 py-12">
                {/* Centered Premium Search Form Card */}
                <div className="mx-auto max-w-2xl">
                    <Card className="border-border/80 border bg-white/80 shadow-md backdrop-blur-md transition-all duration-300 hover:shadow-lg dark:bg-zinc-900/80">
                        <CardHeader className="pb-5">
                            <CardTitle className="text-primary flex items-center justify-center gap-2 text-center text-lg font-bold">
                                <Award className="text-primary h-5 w-5" />
                                Form Pencarian Sertifikat
                            </CardTitle>
                            <CardDescription className="text-center text-sm">
                                Silakan lengkapi data di bawah untuk melihat sertifikat Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-foreground flex items-center gap-1.5 text-xs font-medium">
                                            <Mail className="text-primary h-4 w-4" /> Email Terdaftar
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="contoh@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="border-input focus-visible:ring-primary focus-visible:border-primary h-10 bg-white/50 dark:bg-zinc-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-foreground flex items-center gap-1.5 text-xs font-medium">
                                            <Phone className="text-primary h-4 w-4" /> Nomor WhatsApp
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="text"
                                            placeholder="0812xxxxxxxx"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                            className="border-input focus-visible:ring-primary focus-visible:border-primary h-10 bg-white/50 dark:bg-zinc-800"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary hover:bg-primary/90 mt-2 h-10 w-full cursor-pointer gap-2 font-bold text-white shadow-xs transition-all"
                                >
                                    <Search className="h-4 w-4" />
                                    {loading ? 'Mencari...' : 'Cari Sertifikat'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Section */}
                <div className="w-full">
                    {searched ? (
                        <div className="space-y-8">
                            <div className="mx-auto flex max-w-7xl items-center justify-between border-b pb-4">
                                <h3 className="text-foreground font-literata flex items-center gap-2.5 text-xl font-bold">Hasil Pencarian</h3>
                                <Badge variant="secondary" className="bg-secondary text-primary px-3 py-1 text-xs font-semibold dark:bg-zinc-800">
                                    {participants.length} Sertifikat ditemukan
                                </Badge>
                            </div>

                            {error && (
                                <div className="border-destructive/20 bg-destructive/5 text-destructive mx-auto flex max-w-2xl items-start gap-4 rounded-xl border p-5 text-sm shadow-xs">
                                    <AlertCircle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
                                    <div>
                                        <p className="text-base font-bold">Pencarian Gagal</p>
                                        <p className="text-muted-foreground mt-1 leading-relaxed">{error}</p>
                                    </div>
                                </div>
                            )}

                            {!error && participants.length === 0 && (
                                <div className="border-muted-foreground/20 mx-auto flex min-h-[300px] max-w-2xl flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white/40 p-12 text-center shadow-xs">
                                    <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                        <Award className="text-muted-foreground/60 h-8 w-8" />
                                    </div>
                                    <h4 className="text-foreground font-literata text-lg font-bold">Sertifikat Belum Ditemukan</h4>
                                    <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                                        Email dan nomor WhatsApp terdaftar, tetapi saat ini tidak ada sertifikat resmi yang terbit atas akun tersebut.
                                    </p>
                                </div>
                            )}

                            {!error && participants.length > 0 && (
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {participants.map((p) => {
                                        const details = getProgramDetails(p);
                                        return (
                                            <Card
                                                key={p.id}
                                                className="group border-border/80 hover:border-primary/30 relative flex flex-col justify-between overflow-hidden border bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md dark:bg-zinc-900"
                                            >
                                                {/* Visual indicator bar */}
                                                <div className="from-primary absolute top-0 right-0 left-0 h-1 bg-gradient-to-r to-blue-400" />

                                                <CardHeader className="pt-6 pb-4">
                                                    <div className="mb-3 flex items-center justify-between gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${details.color}`}
                                                        >
                                                            {details.type}
                                                        </Badge>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5 font-mono text-[10px] dark:bg-zinc-800">
                                                                {p.certificate_code}
                                                            </span>
                                                            <button
                                                                onClick={() => handleCopyCode(p.certificate_code)}
                                                                className="text-muted-foreground hover:text-primary hover:bg-muted cursor-pointer rounded p-1 transition-colors dark:hover:bg-zinc-800"
                                                                title="Salin Kode Sertifikat"
                                                            >
                                                                {copiedCode === p.certificate_code ? (
                                                                    <Check className="h-3 w-3 text-green-600" />
                                                                ) : (
                                                                    <Copy className="h-3 w-3" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <CardTitle className="text-foreground group-hover:text-primary line-clamp-2 text-base leading-snug font-bold transition-colors duration-200">
                                                        {details.title}
                                                    </CardTitle>
                                                </CardHeader>

                                                <CardContent className="flex flex-1 flex-col justify-between pt-0 pb-6">
                                                    <div className="text-muted-foreground space-y-2 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="text-primary/70 h-4 w-4" />
                                                            <span>Diterbitkan: </span>
                                                            <span className="text-foreground font-semibold">
                                                                {p.certificate.issued_date
                                                                    ? format(new Date(p.certificate.issued_date), 'dd MMMM yyyy', { locale: id })
                                                                    : '-'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Award className="text-primary/70 h-4 w-4" />
                                                            <span>No. Sertifikat: </span>
                                                            <span className="text-foreground font-mono font-semibold">{p.certificate_number}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>

                                                <div className="bg-muted/20 mt-auto flex items-center justify-end gap-3 border-t px-6 py-4 dark:bg-zinc-800/20">
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-primary hover:text-primary hover:bg-primary/5 h-8 gap-1.5 px-3 text-xs"
                                                    >
                                                        <a
                                                            href={route('certificate.participant.detail', p.certificate_code)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            Lihat
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-primary/20 text-primary hover:bg-primary hover:border-primary h-8 gap-1.5 px-3 text-xs hover:text-white"
                                                    >
                                                        <a href={route('certificate.participant.download.public', p.certificate_code)}>
                                                            Unduh
                                                            <Download className="h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="border-primary/20 mx-auto flex min-h-[320px] max-w-2xl flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white/40 p-12 text-center shadow-xs">
                            <div className="bg-primary/5 mb-5 flex h-16 w-16 animate-bounce items-center justify-center rounded-full duration-1000">
                                <Award className="text-primary h-8 w-8" />
                            </div>
                            <h3 className="text-foreground font-literata text-xl font-bold">Temukan Sertifikat Anda</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                                Silakan masukkan email dan nomor WhatsApp terdaftar Anda pada formulir pencarian di atas untuk memverifikasi dan
                                menampilkan seluruh sertifikat Anda.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </UserLayout>
    );
}
