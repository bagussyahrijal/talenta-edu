import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const reviewData = [
    {
        key: 'review-1',
        name: 'Mariah Carey',
        role: 'Mahasiswa',
        avatar: '/assets/images/carousel-1.png',
        text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit ut massa mi. Aliquam in hendrerit urna. Pellentesque ut amet sapien.Lorem ipsum dolor sit amet consectetur adipiscing elit ut massa mi. Aliquam in hendrerit urna. Pellentesque ut amet sapien.',
        kategori: 'pajak',
    },
    {
        key: 'review-2',
        name: 'Mariah Carey',
        role: 'Mahasiswa',
        avatar: '/assets/images/carousel-1.png',
        text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit himenaeos aptent, curae ut mus scelerisque donec neque felis praesent parturient elementum, pellentesque cubilia etiam suscipit nostra tristique lectus augue. Mauris pretium ornare non facilisis taciti conubia leo varius, fames placerat convallis volutpat blandit nisi vel tempus ultrices, vehicula mus himenaeos aptent risus nunc quisque. Donec turpis nunc venenatis class mauris interdum inceptos neque habitant in dis, pretium molestie eget placerat dapibus orci vel porta cras vitae eu',
        kategori: 'pajak',
    },
    {
        key: 'review-3',
        name: 'Mariah Carey',
        role: 'Mahasiswa',
        avatar: '/assets/images/carousel-1.png',
        text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit ut massa mi. Aliquam in hendrerit urna. Pellentesque ut amet sapien.Lorem ipsum dolor sit amet consectetur adipiscing elit ut massa mi. Aliquam in hendrerit urna. Pellentesque ut amet sapien.',
        kategori: 'akuntansi',
    },
    {
        key: 'review-4',
        name: 'Mariah Carey',
        role: 'Mahasiswa',
        avatar: '/assets/images/carousel-1.png',
        text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit ut massa mi. Aliquam in hendrerit urna. Pellentesque ut amet sapien.',
        kategori: 'pajak',
    },
    {
        key: 'review-5',
        name: 'Mariah Carey',
        role: 'Mahasiswa',
        avatar: '/assets/images/carousel-1.png',
        text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit ut massa mi. Aliquam in hendrerit urna. Pellentesque ut amet sapien.Lorem ipsum dolor sit amet consectetur adipiscing elit ut massa mi. Aliquam in hendrerit urna.',
        kategori: 'akuntansi',
    },
    {
        key: 'review-6',
        name: 'Mariah Carey',
        role: 'Mahasiswa',
        avatar: '/assets/images/carousel-1.png',
        text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit ut massa mi. Aliquam in hendrerit urna. Pellentesque ut amet sapien.Lorem ipsum dolor sit amet consectetur adipiscing elit ut massa mi. Aliquam in hendrerit urna.',
        kategori: 'pajak',
    },
    {
        key: 'review-7',
        name: 'Mariah Carey',
        role: 'Mahasiswa',
        avatar: '/assets/images/carousel-1.png',
        text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit ut massa mi. Aliquam in hendrerit urna. Pellentesque ut amet sapien.Lorem ipsum dolor sit amet consectetur adipiscing elit ut massa mi. Aliquam in hendrerit urna. Pellentesque ut amet sapien.',
        kategori: 'pajak',
    },
    {
        key: 'review-8',
        name: 'Mariah Carey',
        role: 'Mahasiswa',
        avatar: '/assets/images/carousel-1.png',
        text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit himenaeos aptent, curae ut mus scelerisque donec neque felis praesent parturient elementum, pellentesque cubilia etiam suscipit nostra tristique lectus augue. Mauris pretium ornare non facilisis taciti conubia leo varius, fames placerat convallis volutpat blandit nisi vel tempus ultrices, vehicula mus himenaeos aptent risus nunc quisque. Donec turpis nunc venenatis class mauris interdum inceptos neque habitant in dis, pretium molestie eget placerat dapibus orci vel porta cras vitae eu',
        kategori: 'pajak',
    },
    {
        key: 'review-9',
        name: 'Mariah Carey',
        role: 'Mahasiswa',
        avatar: '/assets/images/carousel-1.png',
        text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit ut massa mi. Aliquam in hendrerit urna. Pellentesque ut amet sapien.Lorem ipsum dolor sit amet consectetur adipiscing elit ut massa mi. Aliquam in hendrerit urna. Pellentesque ut amet sapien.',
        kategori: 'akuntansi',
    },
];

interface ReviewCardProps {
    review: typeof reviewData[0];
}

function ReviewCard({ review }: ReviewCardProps) {
    return (
        <div className="bg-blue-50 rounded-2xl p-6 shadow-md">
            <div className="flex items-start gap-4 mb-3">
                <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                    <h3 className="font-semibold text-lg">{review.name}</h3>
                    <p className="text-sm text-muted-foreground">{review.role}</p>
                </div>
            </div>
            <p className="text-sm ml-20 leading-relaxed text-gray-700">{review.text}</p>
        </div>
    );
}

function renderReviewLayout(reviews: typeof reviewData) {
    if (reviews.length === 0) return null;
    
    // Distribusi review ke 3 kolom secara merata berurutan
    const col1: typeof reviewData = [];
    const col2: typeof reviewData = [];
    const col3: typeof reviewData = [];
    
    reviews.forEach((review, index) => {
        const colIndex = index % 3;
        
        if (colIndex === 0) {
            col1.push(review);
        } else if (colIndex === 1) {
            col2.push(review);
        } else {
            col3.push(review);
        }
    });
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-justify">
            {/* Column 1 */}
            <div className="flex flex-col gap-3">
                {col1.map((review, idx) => (
                    <ReviewCard key={`col1-${review.key}-${idx}`} review={review} />
                ))}
            </div>
            
            {/* Column 2 */}
            <div className="flex flex-col gap-3">
                {col2.map((review, idx) => (
                    <ReviewCard key={`col2-${review.key}-${idx}`} review={review} />
                ))}
            </div>
            
            {/* Column 3 */}
            <div className="flex flex-col gap-3">
                {col3.map((review, idx) => (
                    <ReviewCard key={`col3-${review.key}-${idx}`} review={review} />
                ))}
            </div>
        </div>
    );
}

export default function ReviewIndex() {
    const { t } = useTranslation('user');
    const [activeTab, setActiveTab] = useState('all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('reviewPage.home'), href: '/' },
        { title: t('reviewPage.title'), href: '/review' },
    ];

    const tabs = [
        { key: 'all', label: t('reviewPage.tabAll') },
        { key: 'pajak', label: t('reviewPage.tabTax') },
        { key: 'akuntansi', label: t('reviewPage.tabAccounting') },
    ];

    // Filter reviews sesuai tab
    const filteredReviews =
      activeTab === 'all'
        ? reviewData
        : reviewData.filter((r) => r.kategori === activeTab);

    return (
        <UserLayout>
            <Head title={t('reviewPage.title')} />
            <div className="container mx-auto px-4 py-8 text-primary">
                <div className="mb-8 mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-2 font-literata text-primary">{t('reviewPage.title')}</h1>
                    <div className="mb-16 flex justify-center">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-12 flex justify-center gap-16">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
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

                {/* Review Content */}
                <div>
                  {filteredReviews.length > 0 ? (
                    renderReviewLayout(filteredReviews)
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">{t('reviewPage.empty')}</p>
                    </div>
                  )}
                </div>
            </div>
        </UserLayout>
    );
}