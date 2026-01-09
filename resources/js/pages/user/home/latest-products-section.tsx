import { Badge } from '@/components/ui/badge';
import { Spotlight } from '@/components/ui/spotlight';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { Calendar, Clock, Package, Users } from 'lucide-react';

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    title: string;
    thumbnail: string;
    slug: string;
    strikethrough_price: number;
    price: number;
    level?: 'beginner' | 'intermediate' | 'advanced';
    start_date?: string;
    end_date?: string;
    start_time?: string;
    registration_deadline?: string;
    duration_days?: number;
    category?: Category;
    type: 'course' | 'bootcamp' | 'webinar' | 'bundle' | 'partnership';
    created_at: string;
}

interface MyProductIds {
    courses: string[];
    bootcamps: string[];
    webinars: string[];
    bundles: string[];
    partnerships: string[];
}

interface LatestProductsProps {
    latestProducts: Product[];
    myProductIds: MyProductIds;
}

export default function LatestProductsSection({ latestProducts, myProductIds }: LatestProductsProps) {
    const safeMyProductIds = {
        courses: myProductIds?.courses || [],
        bootcamps: myProductIds?.bootcamps || [],
        webinars: myProductIds?.webinars || [],
        bundles: myProductIds?.bundles || [],
        partnerships: myProductIds?.partnerships || [],
    };

    // Helper function to get badge color based on type
    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'course':
                return 'border-green-500 text-green-700';
            case 'bootcamp':
                return 'border-orange-500 text-orange-700';
            case 'webinar':
                return 'border-pink-500 text-pink-700';
            case 'bundle':
                return 'border-blue-500 text-blue-700';
            case 'partnership':
                return 'border-purple-500 text-purple-700';
            default:
                return 'border-gray-500 text-gray-700';
        }
    };

    // Helper function to get type label
    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'course':
                return 'kelas online';
            case 'bootcamp':
                return 'bootcamp';
            case 'webinar':
                return 'webinar';
            case 'bundle':
                return 'bundle';
            case 'partnership':
                return 'partnership';
            default:
                return type;
        }
    };

    const hasAccess = (product: Product) => {
        switch (product.type) {
            case 'course':
                return safeMyProductIds.courses.includes(product.id);
            case 'bootcamp':
                return safeMyProductIds.bootcamps.includes(product.id);
            case 'webinar':
                return safeMyProductIds.webinars.includes(product.id);
            case 'bundle':
                return safeMyProductIds.bundles.includes(product.id);
            case 'partnership':
                return safeMyProductIds.partnerships.includes(product.id);
            default:
                return false;
        }
    };

    const getProductUrl = (product: Product) => {
        const hasProductAccess = hasAccess(product);
        switch (product.type) {
            case 'course':
                return hasProductAccess ? `profile/my-courses/${product.slug}` : `/course/${product.slug}`;
            case 'bootcamp':
                return hasProductAccess ? `profile/my-bootcamps/${product.slug}` : `/bootcamp/${product.slug}`;
            case 'webinar':
                return hasProductAccess ? `profile/my-webinars/${product.slug}` : `/webinar/${product.slug}`;
            case 'bundle':
                return `/bundle/${product.slug}`;
            case 'partnership':
                return `/certification/${product.slug}`;
            default:
                return '#';
        }
    };

    const safeLatestProducts = Array.isArray(latestProducts) ? latestProducts : [];
    const availableProducts = safeLatestProducts.filter((product) => !hasAccess(product));

    return (
        <section className="mx-auto w-full py-8">
            <div className='bg-secondary flex flex-col items-center justify-center space-y-8 px-4 py-14'>
                <h1 className='text-5xl font-bold font-literata text-primary'>Kelas Terpopuler</h1>
                <p>Tingkatkan pengetahuan dan keterampilan kamu disini</p>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl w-full pb-4">
                    {(() => {
                        if (safeLatestProducts.length === 0) {
                            return (
                                <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12">
                                    <img src="/assets/images/not-found.webp" alt="Produk Belum Tersedia" className="w-48" />
                                    <div className="text-center text-gray-500">Belum ada produk yang tersedia saat ini.</div>
                                </div>
                            );
                        }

                        if (availableProducts.length === 0) {
                            return (
                                <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12">
                                    <div className="text-center text-lg font-semibold">Anda sudah memiliki akses semua produk terbaru kami. 😁🙏</div>
                                    <p className="text-center text-gray-500">Terima kasih telah menjadi bagian dari Talenta!</p>
                                </div>
                            );
                        }

                        return availableProducts.map((product) => {
                            const productUrl = getProductUrl(product);

                            return (
                                <Link key={product.id} href={productUrl} className="group h-full">
                                    <div className="relative h-full overflow-hidden rounded-xl 
                                                    border border-primary bg-white shadow-sm 
                                                    transition-all duration-300 
                                                    hover:shadow-xl hover:scale-105 
                                                    dark:border-primary dark:bg-zinc-800
                                                    before:absolute before:inset-0 before:rounded-xl 
                                                    before:bg-gradient-to-br before:from-white before:to-primary-2 before:via-primary 
                                                    before:opacity-0 before:transition-opacity before:duration-300 
                                                    hover:before:opacity-100
                                                    before:z-[-1]
                                                    ">
                                        {/* Image Section */}
                                        <div className="relative h-48 w-full overflow-hidden">
                                            <img
                                                src={product.thumbnail ? `/storage/${product.thumbnail}` : '/assets/images/placeholder.png'}
                                                alt={product.title}
                                                className="h-full w-full object-cover transition-transform duration-300"
                                            />


                                            {/* Category Badge - Top Right */}
                                            {product.category && (
                                                <span className="absolute top-3 right-3 rounded-full bg-gray-100/70 border border-primary px-3 py-1 text-xs text-black dark:bg-gray-700 dark:text-black ">
                                                    {product.category.name}
                                                </span>
                                            )}
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex flex-col p-4 ">
                                            {/* Type Badge */}
                                            <span className={`mb-2 inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${getTypeBadgeColor(product.type)} group-hover:bg-white group-hover:border-white`}>
                                                {getTypeLabel(product.type)}
                                            </span>

                                            {/* Title */}
                                            <h2 className="group-hover:text-white mb-3 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white ">
                                                {product.title}
                                            </h2>

                                            {/* Price */}
                                            <div className="mb-3">
                                                <p className="group-hover:text-white text-xl font-bold text-gray-900 dark:text-white">
                                                    {product.price === 0 ? (
                                                        <span className="text-green-600 dark:text-green-400">Gratis</span>
                                                    ) : (
                                                        `Rp ${product.price.toLocaleString('id-ID')}`
                                                    )}
                                                </p>
                                            </div>

                                            {/* Date/Time Info */}
                                            <div className="group-hover:text-white mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Calendar size={16} />
                                                <span>
                                                    {product.type === 'bootcamp' && product.start_date && (
                                                        <>
                                                            {new Date(product.start_date).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric',
                                                            })}
                                                        </>
                                                    )}
                                                    {product.type === 'webinar' && product.start_time && (
                                                        <>
                                                            {new Date(product.start_time).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric',
                                                            })}
                                                        </>
                                                    )}
                                                    {product.type === 'course' && 'Akses Selamanya'}
                                                </span>
                                                <div className='flex flex-row items-center justify-center ml-auto'>
                                                    <Users size={16} />
                                                    <span>10/10</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        });
                    })()}
                </div>
            </div>
        </section>
    );
}