import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserLayout from '@/layouts/user-layout';
import { type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { AlertCircle, Award, Calendar, Download, ExternalLink, Mail, Phone, Search } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

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
    const { t, i18n } = useTranslation('user');
    const { auth } = usePage<SharedData>().props;
    const dateLocale = i18n.language === 'en' ? enUS : id;

    const [email, setEmail] = useState(filters.email || (auth.user?.email as string) || '');
    const [phone, setPhone] = useState(filters.phone_number || (auth.user?.phone_number as string) || '');
    const [loading, setLoading] = useState(false);

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
            }
        );
    };

    const getProgramDetails = (participant: CertificateParticipant) => {
        const cert = participant.certificate;
        if (cert.course) {
            return { title: cert.course.title, type: t('certificate.types.course'), color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' };
        }
        if (cert.bootcamp) {
            return { title: cert.bootcamp.title, type: t('certificate.types.bootcamp'), color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400' };
        }
        if (cert.webinar) {
            return { title: cert.webinar.title, type: t('certificate.types.webinar'), color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400' };
        }
        return { title: cert.title, type: t('certificate.types.certificate'), color: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400' };
    };

    const renderCertificatePreview = (participant: CertificateParticipant) => {
        return (
            <div className="relative aspect-[1.414/1] w-full overflow-hidden bg-muted border-b">
                <iframe
                    src={`/certificate/${participant.certificate_code}/pdf#toolbar=0`}
                    className="h-full w-full border-0 select-none pointer-events-none"
                    title={`Sertifikat ${participant.certificate_code}`}
                    loading="lazy"
                />
            </div>
        );
    };

    return (
        <div className="from-primary/10 to-secondary/10 relative min-h-screen bg-gradient-to-br via-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Global Decorative Background */}
            <div className="bg-primary/20 pointer-events-none absolute -top-32 -left-32 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />
            <div className="bg-secondary/20 pointer-events-none absolute -top-32 -right-0 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />
            <div className="bg-primary/20 pointer-events-none absolute -bottom-0 -left-32 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />
            <div className="bg-secondary/20 pointer-events-none absolute -right-0 -bottom-0 z-0 h-[500px] w-[500px] rounded-full blur-3xl" />

            <UserLayout>
                <Head title={t('certificate.headTitle')} />

                {/* Hero Section */}
                <section className="relative overflow-hidden px-4 pt-20 pb-10 text-gray-900 dark:text-white">
                    <div className="relative z-10 mx-auto max-w-3xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="font-sinteca mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                                {t('certificate.title')}
                            </h1>
                            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
                                {t('certificate.subtitle')}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Main Form Section */}
                <section className="relative z-10 mx-auto max-w-7xl px-4 pb-24 space-y-12">
                    {/* Centered Form */}
                    <div className="mx-auto max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            <Card className="shadow-xl border-border/40 bg-card/60 backdrop-blur-md hover:border-primary/30 transition-all duration-300 rounded-2xl overflow-hidden">
                                <CardHeader className="pb-4 text-center border-b border-border/20 bg-muted/10">
                                    <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
                                        <Search className="h-5 w-5 text-primary" />
                                        {t('certificate.searchFormTitle')}
                                    </CardTitle>
                                    <CardDescription className="text-sm text-muted-foreground">
                                        {t('certificate.searchFormDesc')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="flex items-center gap-1.5 font-medium text-foreground text-sm">
                                                    <Mail className="h-4 w-4 text-primary" /> {t('certificate.registeredEmail')}
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="contoh@email.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="h-11 rounded-xl border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="flex items-center gap-1.5 font-medium text-foreground text-sm">
                                                    <Phone className="h-4 w-4 text-primary" /> {t('certificate.waNumber')}
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    type="text"
                                                    placeholder="0812xxxxxxxx"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    required
                                                    className="h-11 rounded-xl border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full gap-2 h-11 text-base font-medium rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all duration-300"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                                    {t('certificate.searching')}
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="h-5 w-5" />
                                                    {t('certificate.searchButton')}
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Results Section Below Form */}
                    <div className="w-full">
                        {searched ? (
                            <div className="space-y-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-border/40">
                                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        {t('certificate.searchResults')}
                                        <Badge variant="secondary" className="font-semibold text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border-none">
                                            {t('certificate.certificatesFound', { count: participants.length })}
                                        </Badge>
                                    </h3>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-start gap-3.5 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive max-w-2xl mx-auto"
                                    >
                                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                                        <div>
                                            <p className="font-bold">{t('certificate.searchFailed')}</p>
                                            <p className="text-muted-foreground mt-1">{error}</p>
                                        </div>
                                    </motion.div>
                                )}

                                {!error && participants.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 p-12 text-center bg-card/40 max-w-2xl mx-auto shadow-sm"
                                    >
                                        <div className="relative mb-4">
                                            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10 blur-xl" />
                                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
                                                <Award className="h-8 w-8 text-primary/60" />
                                            </div>
                                        </div>
                                        <p className="font-bold text-foreground text-lg">{t('certificate.notAvailable')}</p>
                                        <p className="text-muted-foreground mt-2 text-sm max-w-sm">
                                            {t('certificate.notAvailableDesc')}
                                        </p>
                                    </motion.div>
                                )}

                                {!error && participants.length > 0 && (
                                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                        {participants.map((p, index) => {
                                            const details = getProgramDetails(p);
                                            return (
                                                <motion.div
                                                    key={p.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                                >
                                                    <Card className="group h-full flex flex-col justify-between overflow-hidden border border-border/50 bg-card/45 hover:bg-card hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 rounded-xl">
                                                        <div>
                                                            <CardHeader className="p-5 pb-3">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider rounded-md px-2 py-0.5 ${details.color}`}>
                                                                        {details.type}
                                                                    </Badge>
                                                                    <span className="text-[11px] text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded-md border border-border/20">
                                                                        {p.certificate_code}
                                                                    </span>
                                                                </div>
                                                                <CardTitle className="text-base font-bold line-clamp-2 leading-snug text-foreground group-hover:text-primary transition-colors duration-200">
                                                                    {details.title}
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="p-5 pt-0 text-xs text-muted-foreground space-y-2">
                                                                <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg">
                                                                    <Calendar className="h-4 w-4 text-primary/70" />
                                                                    <div>
                                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{t('certificate.issuedDate')}</p>
                                                                        <p className="font-semibold text-foreground mt-0.5 text-xs">
                                                                            {p.certificate.issued_date
                                                                                ? format(new Date(p.certificate.issued_date), 'dd MMMM yyyy', { locale: dateLocale })
                                                                                : '-'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </div>
                                                        <div className="border-t border-border/40 bg-muted/10 px-5 py-4 flex items-center justify-between gap-2 mt-auto">
                                                            <span className="text-[11px] font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded-md border border-border/10">
                                                                No: {p.certificate_number}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <Button asChild size="sm" variant="ghost" className="h-8 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10 px-3 rounded-lg">
                                                                    <a href={route('certificate.participant.detail', p.certificate_code)} target="_blank" rel="noopener noreferrer">
                                                                        {t('certificate.view')}
                                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                                    </a>
                                                                </Button>
                                                                <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs px-3 rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                                                                    <a href={route('certificate.participant.download.public', p.certificate_code)}>
                                                                        {t('certificate.download')}
                                                                        <Download className="h-3.5 w-3.5" />
                                                                    </a>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/75 p-12 text-center bg-card/30 min-h-[320px] max-w-2xl mx-auto shadow-xs"
                            >
                                <div className="relative mb-5">
                                    <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-2xl" />
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/35 bg-primary/10">
                                        <Award className="h-10 w-10 text-primary animate-bounce" style={{ animationDuration: '3s' }} />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-foreground">{t('certificate.initialStateTitle')}</h3>
                                <p className="text-muted-foreground mt-2.5 text-sm max-w-sm leading-relaxed">
                                    {t('certificate.initialStateDesc')}
                                </p>
                            </motion.div>
                        )}
                    </div>
                </section>
            </UserLayout>
        </div>
    );
}
