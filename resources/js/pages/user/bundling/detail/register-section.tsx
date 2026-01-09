import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { rupiahFormatter } from '@/lib/utils';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertTriangle, BookText, Calendar, Check, ExternalLink, MonitorPlay, Package, Presentation, Sparkles } from 'lucide-react';

interface Bundle {
    id: string;
    title: string;
    slug: string;
    price: number;
    benefits?: string | null;
    description?: string | null;
    thumbnail?: string | null;
    registration_deadline?: string | null;
    registration_url: string;
    bundle_items_count: number;
}

interface Product {
    id: string;
    title: string;
    slug: string;
    price: number;
    thumbnail?: string | null;
}

interface BundleItem {
    id: string;
    bundleable_type: string;
    bundleable_id: string;
    bundleable: Product;
    price: number;
}

interface OwnedItem {
    id: string;
    title: string;
    type: string;
}

interface RegisterSectionProps {
    bundle: Bundle;
    bundleItems?: BundleItem[];
    totalOriginalPrice: number;
    discountAmount: number;
    discountPercentage: number;
    hasOwnedItems: boolean;
    ownedItems: OwnedItem[];
}

export default function RegisterSection({
    bundle,
    bundleItems = [],
    totalOriginalPrice,
    discountAmount,
    discountPercentage,
    hasOwnedItems,
    ownedItems,
}: RegisterSectionProps) {
    const { auth } = usePage<SharedData>().props;

    const deadline = bundle.registration_deadline ? new Date(bundle.registration_deadline) : null;

    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number;

    let registrationUrl: string;
    let buttonText: string;
    let warningMessage: string | null = null;
    let isDisabled = false;

    if (hasOwnedItems) {
        registrationUrl = '#';
        buttonText = 'Tidak Dapat Mendaftar';
        warningMessage = 'Anda sudah memiliki beberapa produk dalam bundle ini!';
        isDisabled = true;
    } else if (!isLoggedIn) {
        registrationUrl = bundle.registration_url;
        buttonText = 'Login untuk Mendaftar';
        warningMessage = 'Anda harus login terlebih dahulu!';
    } else if (!isProfileComplete) {
        registrationUrl = route('profile.edit', { redirect: window.location.href });
        buttonText = 'Lengkapi Profil untuk Mendaftar';
        warningMessage = 'Profil Anda belum lengkap!';
    } else {
        registrationUrl = bundle.registration_url;
        buttonText = 'Daftar Sekarang';
        warningMessage = null;
    }

    const getProductUrl = (type: string, slug: string) => {
        const typeNormalized = type.toLowerCase().replace('app\\models\\', '');
        switch (typeNormalized) {
            case 'course':
                return route('course.detail', slug);
            case 'bootcamp':
                return route('bootcamp.detail', slug);
            case 'webinar':
                return route('webinar.detail', slug);
            default:
                return '#';
        }
    };

    type BundleType = 'course' | 'bootcamp' | 'webinar';

    const getTypeConfig = (type: string) => {
        const typeNormalized = type.toLowerCase().replace('app\\models\\', '') as BundleType;
        const config: Record<BundleType, {
            icon: typeof BookText;
            label: string;
            badgeClass: string;
            iconColor: string;
            cardBorder: string;
        }> = {
            course: {
                icon: BookText,
                label: 'KELAS ONLINE',
                badgeClass: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
                iconColor: 'text-green-600 dark:text-green-400',
                cardBorder: 'border-green-200 dark:border-green-800',
            },
            bootcamp: {
                icon: Presentation,
                label: 'BOOTCAMP',
                badgeClass: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400',
                iconColor: 'text-orange-600 dark:text-orange-400',
                cardBorder: 'border-orange-200 dark:border-orange-800',
            },
            webinar: {
                icon: MonitorPlay,
                label: 'WEBINAR',
                badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400',
                iconColor: 'text-purple-600 dark:text-purple-400',
                cardBorder: 'border-purple-200 dark:border-purple-800',
            },
        };
        return config[typeNormalized] ?? config.course;
    };

    return (
        <section className="mx-auto mt-4 md:mt-8 mb-8 sm:mb-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8" id="register">
            <Badge className='border-yellow-400 bg-white text-yellow-400 px-2 py-1 text-xs sm:text-sm'>Paket Bundling</Badge>
            
            {/* Warning if user already owns items */}
            {hasOwnedItems && (
                <Alert variant="destructive" className="mt-4 sm:mt-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <p className="mb-2 font-semibold text-sm sm:text-base">Anda sudah memiliki produk berikut dalam bundle ini:</p>
                        <ul className="ml-4 list-disc space-y-1 text-xs sm:text-sm">
                            {ownedItems.map((item) => (
                                <li key={item.id}>
                                    <span className="font-medium">{item.type}:</span> {item.title}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-2 text-xs sm:text-sm">Untuk menghindari duplikasi, Anda tidak dapat membeli bundle ini.</p>
                    </AlertDescription>
                </Alert>
            )}

            <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
                {/* Left Column - Bundle Details */}
                <div className="flex flex-col gap-4 sm:gap-6">
                    <div>
                        <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold font-literata text-gray-900 dark:text-gray-100 leading-tight">{bundle.title}</h1>
                    </div>
                    <div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            {bundle.description || 'Dapatkan akses ke semua program pembelajaran dalam paket bundling ini dengan harga spesial.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                {bundle.bundle_items_count} Program Pembelajaran
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                Hemat {discountPercentage}%
                            </p>
                        </div>
                        {deadline && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                                    {format(deadline, 'dd MMM yyyy', { locale: id })}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Bundle Items List */}
                    {bundleItems.length > 0 && (
                        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Isi Paket ({bundleItems.length} Program)
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                                {bundleItems.map((item) => {
                                    const typeConfig = getTypeConfig(item.bundleable_type);
                                    const Icon = typeConfig.icon;
                                    const productUrl = getProductUrl(item.bundleable_type, item.bundleable.slug);

                                    return (
                                        <div
                                            key={item.id}
                                            className={`group relative overflow-hidden rounded-lg border ${typeConfig.cardBorder} bg-white transition-all hover:shadow-lg dark:bg-gray-800`}
                                        >
                                            <div className="flex gap-4 p-4">
                                                {/* Thumbnail */}
                                                <div className="relative w-32 flex-shrink-0 overflow-hidden rounded-md">
                                                    <img
                                                        src={
                                                            item.bundleable.thumbnail ? `/storage/${item.bundleable.thumbnail}` : '/assets/images/placeholder.png'
                                                        }
                                                        alt={item.bundleable.title}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="flex flex-1 flex-col">
                                                    <div className="mb-2 flex items-start justify-between gap-2">
                                                        <h4 className="line-clamp-2 font-semibold text-gray-900 dark:text-white">{item.bundleable.title}</h4>
                                                        <a href={productUrl} target="_blank" rel="noopener noreferrer">
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 flex-shrink-0 p-0">
                                                                <ExternalLink size={16} />
                                                            </Button>
                                                        </a>
                                                    </div>

                                                    <Badge variant="outline" className={`mb-auto w-fit text-xs ${typeConfig.badgeClass}`}>
                                                        {typeConfig.label}
                                                    </Badge>

                                                    {/* Price */}
                                                    <div className="mt-3 flex items-end justify-between">
                                                        <div>
                                                            <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                                                                {rupiahFormatter.format(item.price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div>
                        {bundle.benefits && (
                            <div className="mt-8">
                                <p className="font-literata font-medium text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 flex items-center gap-2">
                                    Keuntungan yang Anda Dapatkan
                                </p>
                                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: bundle.benefits }} />
                            </div>
                        )}
                    </div>
                    
                    
                </div>

                {/* Right Column - Price Card */}
                <div className="flex flex-col">
                    <div className="lg:sticky lg:top-4 rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                        {/* Price Comparison */}
                        <div className="mb-3 sm:mb-4">
                            <span className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Harga Normal:</span>
                            <span className="block text-base sm:text-lg text-gray-500 font-literata line-through">
                                {rupiahFormatter.format(totalOriginalPrice)}
                            </span>
                        </div>

                        {discountAmount > 0 && (
                            <div className="mb-3 sm:mb-4">
                                <Badge className="bg-green-500 text-white text-xs sm:text-sm px-2 sm:px-3 py-1">
                                    Hemat {rupiahFormatter.format(discountAmount)} ({discountPercentage}%)
                                </Badge>
                            </div>
                        )}

                        <h3 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-bold font-literata text-gray-900 dark:text-gray-100">
                            {rupiahFormatter.format(bundle.price)}
                        </h3>

                        {warningMessage && (
                            <div className={`mb-3 sm:mb-4 p-2 sm:p-3 text-center rounded-lg ${
                                hasOwnedItems 
                                    ? 'bg-red-50 dark:bg-red-900/20' 
                                    : 'bg-red-50 dark:bg-red-900/20'
                            }`}>
                                <p className={`text-xs sm:text-sm ${
                                    hasOwnedItems 
                                        ? 'text-red-600 dark:text-red-400 font-semibold' 
                                        : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {warningMessage}
                                </p>
                            </div>
                        )}

                        <Button 
                            className="mb-4 sm:mb-6 w-full rounded-lg text-sm sm:text-base py-5 sm:py-6" 
                            asChild={!isDisabled} 
                            disabled={isDisabled}
                        >
                            {isDisabled ? <span>{buttonText}</span> : <Link href={registrationUrl}>{buttonText}</Link>}
                        </Button>

                        <Separator className="mb-4 sm:mb-6" />

                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <Package className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Total Program:</p>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{bundle.bundle_items_count} Program Pembelajaran</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 text-gray-600" />
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Penghematan:</p>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{discountPercentage}% dari harga normal</p>
                                </div>
                            </div>
                        </div>

                        {deadline && (
                            <>
                                <Separator className="my-4 sm:my-6" />
                                <div className="space-y-1 sm:space-y-2">
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Terakhir pendaftaran:</p>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        {format(deadline, "EEEE, dd MMMM yyyy 'pukul' HH:mm", { locale: id })} WIB
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/* Benefits Section for Mobile - Shown only on mobile */}
                    <div className="block sm:hidden mt-6">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-zinc-700 dark:bg-zinc-800">
                            <h3 className="flex items-center gap-2 mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Keuntungan Paket Bundling
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm">
                                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">Hemat {discountPercentage}% dari harga normal</p>
                                </li>
                                <li className="flex items-start gap-2 text-sm">
                                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">Akses ke {bundle.bundle_items_count} program pembelajaran sekaligus</p>
                                </li>
                                <li className="flex items-start gap-2 text-sm">
                                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">Sertifikat untuk semua program yang diselesaikan</p>
                                </li>
                                <li className="flex items-start gap-2 text-sm">
                                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                                    <p className="text-gray-700 dark:text-gray-300">Akses selamanya untuk semua materi</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}