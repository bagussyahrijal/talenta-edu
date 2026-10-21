'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserLayout from '@/layouts/user-layout';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

interface Program {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    thumbnail?: string | null;
    type: 'regular' | 'scholarship';
    status: string;
}

const getFormSchema = (t: (key: string, defaultValue: string) => string) =>
    z.object({
        name: z.string().nonempty(t('certificationProgram.scholarshipApply.validation.nameRequired', 'Nama lengkap harus diisi')),
        email: z.string().email(t('certificationProgram.scholarshipApply.validation.emailInvalid', 'Email tidak valid')),
        phone: z.string().nonempty(t('certificationProgram.scholarshipApply.validation.phoneRequired', 'Nomor telepon harus diisi')),
        nim: z.string().nonempty(t('certificationProgram.scholarshipApply.validation.nimRequired', 'NIM harus diisi')),
        university: z.string().nonempty(t('certificationProgram.scholarshipApply.validation.univRequired', 'Nama universitas harus diisi')),
        major: z.string().nonempty(t('certificationProgram.scholarshipApply.validation.majorRequired', 'Program studi harus diisi')),
        semester: z.string().nonempty(t('certificationProgram.scholarshipApply.validation.semesterRequired', 'Semester harus dipilih')),
        ktm_photo: z.instanceof(File, { message: t('certificationProgram.scholarshipApply.validation.ktmRequired', 'Foto KTM harus diunggah') }),
        transcript_photo: z.instanceof(File, { message: t('certificationProgram.scholarshipApply.validation.transcriptRequired', 'Foto transkrip nilai harus diunggah') }),
        instagram_follow_photo: z.instanceof(File, { message: t('certificationProgram.scholarshipApply.validation.igFollowRequired', 'Foto bukti follow Instagram harus diunggah') }),
        tiktok_follow_photo: z.instanceof(File, { message: t('certificationProgram.scholarshipApply.validation.tiktokFollowRequired', 'Foto bukti follow TikTok harus diunggah') }),
        comment_tag_photo: z.instanceof(File, { message: t('certificationProgram.scholarshipApply.validation.commentTagRequired', 'Foto bukti komentar & tag harus diunggah') }),
        whatsapp_share_photo: z.instanceof(File, { message: t('certificationProgram.scholarshipApply.validation.waShareRequired', 'Foto bukti share ke grup WhatsApp harus diunggah') }),
        instagram_story_photo: z.instanceof(File, { message: t('certificationProgram.scholarshipApply.validation.igStoryRequired', 'Foto bukti story Instagram harus diunggah') }),
    });

type FormValues = z.infer<ReturnType<typeof getFormSchema>>;

export default function ScholarshipApply({ program }: { program: Program }) {
    const { t } = useTranslation('user');
    const [isLoading, setIsLoading] = useState(false);
    const [ktmPreview, setKtmPreview] = useState<string | null>(null);
    const [transcriptPreview, setTranscriptPreview] = useState<string | null>(null);
    const [igFollowPreview, setIgFollowPreview] = useState<string | null>(null);
    const [tiktokFollowPreview, setTiktokFollowPreview] = useState<string | null>(null);
    const [commentTagPreview, setCommentTagPreview] = useState<string | null>(null);
    const [waSharePreview, setWaSharePreview] = useState<string | null>(null);
    const [igStoryPreview, setIgStoryPreview] = useState<string | null>(null);

    const formSchema = useMemo(() => getFormSchema(t), [t]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '', email: '', phone: '', nim: '', university: '', major: '', semester: '' },
    });

    function onSubmit(values: FormValues) {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('email', values.email);
        formData.append('phone', values.phone);
        formData.append('nim', values.nim);
        formData.append('university', values.university);
        formData.append('major', values.major);
        formData.append('semester', values.semester);
        if (values.ktm_photo) formData.append('ktm_photo', values.ktm_photo);
        if (values.transcript_photo) formData.append('transcript_photo', values.transcript_photo);
        if (values.instagram_follow_photo) formData.append('instagram_follow_photo', values.instagram_follow_photo);
        if (values.tiktok_follow_photo) formData.append('tiktok_follow_photo', values.tiktok_follow_photo);
        if (values.comment_tag_photo) formData.append('comment_tag_photo', values.comment_tag_photo);
        if (values.whatsapp_share_photo) formData.append('whatsapp_share_photo', values.whatsapp_share_photo);
        if (values.instagram_story_photo) formData.append('instagram_story_photo', values.instagram_story_photo);

        router.post(route('certification-programs.scholarship-store', program.slug), formData, {
            onSuccess: () => {
                toast.success(t('certificationProgram.scholarshipApply.toastSuccess', 'Pengajuan beasiswa berhasil dikirim!'));
                setIsLoading(false);
            },
            onError: () => {
                toast.error(t('certificationProgram.scholarshipApply.toastError', 'Terjadi kesalahan saat mengirim pengajuan'));
                setIsLoading(false);
            },
        });
    }

    const handleFilePreview = (e: React.ChangeEvent<HTMLInputElement>, setPreview: React.Dispatch<React.SetStateAction<string | null>>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <UserLayout>
            <Head title={t('certificationProgram.scholarshipApply.headTitle', 'Ajukan Beasiswa - {{title}}', { title: program.title })} />
            <div className="min-h-screen bg-[url('/assets/images/bg-product.png')] bg-cover bg-center bg-no-repeat">
                <section className="mx-auto w-full max-w-5xl px-4 py-12">
                    <div className="mb-8 px-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <a href="/certification-program" className="hover:text-blue-600">
                                {t('certificationProgram.scholarshipApply.breadcrumb', 'Certification Program')}
                            </a>
                            <span>/</span>
                            <a href={`/certification-program/${program.slug}`} className="hover:text-blue-600">
                                {program.title}
                            </a>
                            <span>/</span>
                            <span className="text-gray-900 dark:text-white">
                                {t('certificationProgram.scholarshipApply.scholarshipBreadcrumb', 'Beasiswa')}
                            </span>
                        </div>
                        <h1 className="mt-8 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
                            {t('certificationProgram.scholarshipApply.subtitle', 'Formulir Pengajuan Beasiswa')}
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {t('certificationProgram.scholarshipApply.pageDesc', 'Lengkapi persyaratan untuk mendapatkan beasiswa penuh pada program ini.')}
                        </p>
                    </div>

                    {/* Form */}
                    <div className="rounded-xl border-0 bg-white shadow-lg dark:bg-zinc-800">
                        <div className="to-primary rounded-t-xl border-b border-gray-200 bg-gradient-to-tl from-black px-6 py-6 dark:border-zinc-700">
                            <h2 className="font-bold text-white md:text-2xl">
                                {t('certificationProgram.scholarshipApply.cardTitle', '📝 Formulir Pendaftaran Beasiswa')}
                            </h2>
                            <p className="mt-1 text-sm text-blue-100 md:text-base">
                                {t('certificationProgram.scholarshipApply.cardSubtitle', 'Lengkapi data diri dan dokumen pendukung Anda')}
                            </p>
                        </div>

                        <div className="p-3 md:p-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    {/* Personal Info */}
                                    <div className="space-y-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-5 dark:from-blue-950/20 dark:to-indigo-950/20">
                                        <div className="flex items-center gap-2">
                                            <span className="md:text-2xl">👤</span>
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                {t('certificationProgram.scholarshipApply.personalSection', 'Informasi Pribadi')}
                                            </h3>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('certificationProgram.scholarshipApply.nameLabel', 'Nama Lengkap *')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder={t('certificationProgram.scholarshipApply.namePlaceholder', 'Masukkan nama lengkap Anda')} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('certificationProgram.scholarshipApply.emailLabel', 'Email *')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="email" placeholder={t('certificationProgram.scholarshipApply.emailPlaceholder', 'Masukkan email Anda')} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('certificationProgram.scholarshipApply.phoneLabel', 'Nomor Telepon *')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder={t('certificationProgram.scholarshipApply.phonePlaceholder', 'Masukkan nomor telepon Anda (08XXXX)')} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* University Info */}
                                    <div className="space-y-4 rounded-lg border-t border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 pt-5 md:p-5 dark:border-zinc-700 dark:from-green-950/20 dark:to-emerald-950/20">
                                        <div className="flex items-center gap-2">
                                            <span className="md:text-2xl">🎓</span>
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                {t('certificationProgram.scholarshipApply.univSection', 'Informasi Universitas')}
                                            </h3>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="university"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('certificationProgram.scholarshipApply.univLabel', 'Nama Universitas *')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder={t('certificationProgram.scholarshipApply.univPlaceholder', 'Masukkan nama universitas Anda')} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="major"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('certificationProgram.scholarshipApply.majorLabel', 'Program Studi *')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder={t('certificationProgram.scholarshipApply.majorPlaceholder', 'Contoh: Teknik Informatika, Ekonomi, etc')} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="semester"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('certificationProgram.scholarshipApply.semesterLabel', 'Semester *')}</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={t('certificationProgram.scholarshipApply.semesterPlaceholder', 'Pilih semester Anda')} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                                                <SelectItem key={s} value={String(s)}>
                                                                    {t('certificationProgram.scholarshipApply.semesterItem', 'Semester {{semester}}', { semester: s })}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="nim"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('certificationProgram.scholarshipApply.nimLabel', 'NIM *')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder={t('certificationProgram.scholarshipApply.nimPlaceholder', 'Masukkan NIM Anda')} autoComplete="off" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Documents */}
                                    <div className="space-y-4 rounded-lg border-t border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 pt-5 md:p-5 dark:border-zinc-700 dark:from-orange-950/20 dark:to-amber-950/20">
                                        <div className="flex items-center gap-2">
                                            <span className="md:text-2xl">📄</span>
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                {t('certificationProgram.scholarshipApply.docSection', 'Dokumen Pendukung')}
                                            </h3>
                                        </div>

                                        {/* KTM */}
                                        <FormField
                                            control={form.control}
                                            name="ktm_photo"
                                            render={({ field: { onChange, value, ...field } }) => {
                                                void value;
                                                return (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <span>📋</span> {t('certificationProgram.scholarshipApply.ktmLabel', 'Foto KTM *')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="space-y-3">
                                                                {ktmPreview && (
                                                                    <div className="relative overflow-hidden rounded-lg border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-2 dark:from-green-950/30 dark:to-emerald-950/30">
                                                                        <img src={ktmPreview} alt="KTM Preview" className="h-40 w-full rounded object-contain" />
                                                                        <div className="absolute top-2 right-2 rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white">
                                                                            {t('certificationProgram.scholarshipApply.fileSelected', '✓ Terpilih')}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            onChange(file);
                                                                            handleFilePreview(e, setKtmPreview);
                                                                        }
                                                                    }}
                                                                    className="cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-green-400 dark:border-zinc-600"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormDescription className="text-xs">
                                                            {t('certificationProgram.scholarshipApply.fileFormatDesc', '📸 Format: JPG, PNG, WebP (Maks 5MB)')}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        {/* Transcript */}
                                        <FormField
                                            control={form.control}
                                            name="transcript_photo"
                                            render={({ field: { onChange, value, ...field } }) => {
                                                void value;
                                                return (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <span>📊</span> {t('certificationProgram.scholarshipApply.transcriptLabel', 'Foto Transkrip Nilai *')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="space-y-3">
                                                                {transcriptPreview && (
                                                                    <div className="relative overflow-hidden rounded-lg border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 p-2 dark:from-blue-950/30 dark:to-indigo-950/30">
                                                                        <img src={transcriptPreview} alt="Transcript Preview" className="h-40 w-full rounded object-contain" />
                                                                        <div className="absolute top-2 right-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold text-white">
                                                                            {t('certificationProgram.scholarshipApply.fileSelected', '✓ Terpilih')}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            onChange(file);
                                                                            handleFilePreview(e, setTranscriptPreview);
                                                                        }
                                                                    }}
                                                                    className="cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-blue-400 dark:border-zinc-600"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormDescription className="text-xs">
                                                            {t('certificationProgram.scholarshipApply.fileFormatDesc', '📸 Format: JPG, PNG, WebP (Maks 5MB)')}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        {/* Instagram Follow */}
                                        <FormField
                                            control={form.control}
                                            name="instagram_follow_photo"
                                            render={({ field: { onChange, value, ...field } }) => {
                                                void value;
                                                return (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <span>📱</span> {t('certificationProgram.scholarshipApply.igFollowLabel', 'Screenshot Follow Instagram @brevetpajak_talenta *')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="space-y-3">
                                                                {igFollowPreview && (
                                                                    <div className="relative overflow-hidden rounded-lg border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50 p-2 dark:from-pink-950/30 dark:to-rose-950/30">
                                                                        <img src={igFollowPreview} alt="IG Follow Preview" className="h-40 w-full rounded object-contain" />
                                                                        <div className="absolute top-2 right-2 rounded-full bg-pink-500 px-2 py-1 text-xs font-semibold text-white">
                                                                            {t('certificationProgram.scholarshipApply.fileSelected', '✓ Terpilih')}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            onChange(file);
                                                                            handleFilePreview(e, setIgFollowPreview);
                                                                        }
                                                                    }}
                                                                    className="cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-pink-400 dark:border-zinc-600"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormDescription className="text-xs">
                                                            {t('certificationProgram.scholarshipApply.fileFormatDesc', '📸 Format: JPG, PNG, WebP (Maks 5MB)')}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        {/* TikTok Follow */}
                                        <FormField
                                            control={form.control}
                                            name="tiktok_follow_photo"
                                            render={({ field: { onChange, value, ...field } }) => {
                                                void value;
                                                return (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <span>📱</span> {t('certificationProgram.scholarshipApply.tiktokFollowLabel', 'Screenshot Follow TikTok @brevetpajak_talenta *')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="space-y-3">
                                                                {tiktokFollowPreview && (
                                                                    <div className="relative overflow-hidden rounded-lg border-2 border-cyan-300 bg-gradient-to-br from-cyan-50 to-teal-50 p-2 dark:from-cyan-950/30 dark:to-teal-950/30">
                                                                        <img src={tiktokFollowPreview} alt="TikTok Follow Preview" className="h-40 w-full rounded object-contain" />
                                                                        <div className="absolute top-2 right-2 rounded-full bg-cyan-500 px-2 py-1 text-xs font-semibold text-white">
                                                                            {t('certificationProgram.scholarshipApply.fileSelected', '✓ Terpilih')}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            onChange(file);
                                                                            handleFilePreview(e, setTiktokFollowPreview);
                                                                        }
                                                                    }}
                                                                    className="cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-cyan-400 dark:border-zinc-600"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormDescription className="text-xs">
                                                            {t('certificationProgram.scholarshipApply.fileFormatDesc', '📸 Format: JPG, PNG, WebP (Maks 5MB)')}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        {/* Comment Tag */}
                                        <FormField
                                            control={form.control}
                                            name="comment_tag_photo"
                                            render={({ field: { onChange, value, ...field } }) => {
                                                void value;
                                                return (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <span>👥</span> {t('certificationProgram.scholarshipApply.commentTagLabel', 'Screenshot Komentar & Tag 3 Teman *')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="space-y-3">
                                                                {commentTagPreview && (
                                                                    <div className="relative overflow-hidden rounded-lg border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-violet-50 p-2 dark:from-purple-950/30 dark:to-violet-950/30">
                                                                        <img src={commentTagPreview} alt="Comment Tag Preview" className="h-40 w-full rounded object-contain" />
                                                                        <div className="absolute top-2 right-2 rounded-full bg-purple-500 px-2 py-1 text-xs font-semibold text-white">
                                                                            {t('certificationProgram.scholarshipApply.fileSelected', '✓ Terpilih')}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            onChange(file);
                                                                            handleFilePreview(e, setCommentTagPreview);
                                                                        }
                                                                    }}
                                                                    className="cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-purple-400 dark:border-zinc-600"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormDescription className="text-xs">
                                                            {t('certificationProgram.scholarshipApply.fileFormatDesc', '📸 Format: JPG, PNG, WebP (Maks 5MB)')}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        {/* WhatsApp Share */}
                                        <FormField
                                            control={form.control}
                                            name="whatsapp_share_photo"
                                            render={({ field: { onChange, value, ...field } }) => {
                                                void value;
                                                return (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <span>💬</span> {t('certificationProgram.scholarshipApply.waShareLabel', 'Screenshot Share Postingan Instagram ke 1 Grup WhatsApp *')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="space-y-3">
                                                                {waSharePreview && (
                                                                    <div className="relative overflow-hidden rounded-lg border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 p-2 dark:from-emerald-950/30 dark:to-green-950/30">
                                                                        <img src={waSharePreview} alt="WA Share Preview" className="h-40 w-full rounded object-contain" />
                                                                        <div className="absolute top-2 right-2 rounded-full bg-emerald-500 px-2 py-1 text-xs font-semibold text-white">
                                                                            {t('certificationProgram.scholarshipApply.fileSelected', '✓ Terpilih')}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            onChange(file);
                                                                            handleFilePreview(e, setWaSharePreview);
                                                                        }
                                                                    }}
                                                                    className="cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-emerald-400 dark:border-zinc-600"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormDescription className="text-xs">
                                                            {t('certificationProgram.scholarshipApply.fileFormatDesc', '📸 Format: JPG, PNG, WebP (Maks 5MB)')}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        {/* Instagram Story */}
                                        <FormField
                                            control={form.control}
                                            name="instagram_story_photo"
                                            render={({ field: { onChange, value, ...field } }) => {
                                                void value;
                                                return (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <span>📸</span> {t('certificationProgram.scholarshipApply.igStoryLabel', 'Screenshot Share Postingan ke Story Instagram *')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="space-y-3">
                                                                {igStoryPreview && (
                                                                    <div className="relative overflow-hidden rounded-lg border-2 border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 to-pink-50 p-2 dark:from-fuchsia-950/30 dark:to-pink-950/30">
                                                                        <img src={igStoryPreview} alt="IG Story Preview" className="h-40 w-full rounded object-contain" />
                                                                        <div className="absolute top-2 right-2 rounded-full bg-fuchsia-500 px-2 py-1 text-xs font-semibold text-white">
                                                                            {t('certificationProgram.scholarshipApply.fileSelected', '✓ Terpilih')}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            onChange(file);
                                                                            handleFilePreview(e, setIgStoryPreview);
                                                                        }
                                                                    }}
                                                                    className="cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-fuchsia-400 dark:border-zinc-600"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormDescription className="text-xs">
                                                            {t('certificationProgram.scholarshipApply.fileFormatDesc', '📸 Format: JPG, PNG, WebP (Maks 5MB)')}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                    </div>

                                    {/* Submit */}
                                    <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-zinc-700">
                                        <Button variant="outline" type="button" onClick={() => window.history.back()} className="border-2">
                                            {t('certificationProgram.scholarshipApply.btnBack', '← Kembali')}
                                        </Button>
                                        <Button type="submit" disabled={isLoading} className="flex-1">
                                            {isLoading
                                                ? t('certificationProgram.scholarshipApply.btnSubmitting', '⏳ Mengirim...')
                                                : t('certificationProgram.scholarshipApply.btnSubmit', '✓ Kirim Pengajuan Beasiswa')}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>
                </section>
            </div>
        </UserLayout>
    );
}
