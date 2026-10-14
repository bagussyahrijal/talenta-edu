import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const gambar = [
  { key: 'galeri-1', src: '/assets/images/carousel-1.png', alt: 'Galeri 1', info: 'SMAN 1 Malang', kategori: 'sma' },
  { key: 'galeri-2', src: '/assets/images/carousel-1.png', alt: 'Galeri 2', info: 'UIN Malang', kategori: 'universitas' },
  { key: 'galeri-3', src: '/assets/images/carousel-1.png', alt: 'Galeri 3', info: 'Polinema', kategori: 'universitas' },
  { key: 'galeri-4', src: '/assets/images/carousel-1.png', alt: 'Galeri 4', info: 'Dinas Pendidikan', kategori: 'institusi' },
  { key: 'galeri-5', src: '/assets/images/carousel-1.png', alt: 'Galeri 5', info: 'SMKN 2 Batu', kategori: 'sma' },
];

function renderGalleryLayout(images: typeof gambar) {
  const rows = [];
  let i = 0;
  while (i < images.length) {
    // Row 1: 1 landscape
    if (i < images.length) {
      rows.push(
        <div className="w-full relative" key={`row-landscape-${i}`}>
          <img
            key={images[i].key}
            src={images[i].src}
            alt={images[i].alt}
            className="w-full h-48 sm:h-64 md:h-80 lg:h-100 object-cover rounded-lg shadow"
          />
          <div className="absolute left-0 bottom-0 bg-black/60 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-br-lg rounded-tl-lg m-1 sm:m-2">
            {images[i].info} <span className="ml-1 sm:ml-2 bg-white/20 px-1 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">{images[i].kategori.toUpperCase()}</span>
          </div>
        </div>
      );
      i++;
    }
    // Row 2: 2 grid (30% 70%) on desktop, stacked on mobile
    if (i < images.length) {
      rows.push(
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6" key={`row-grid-${i}`}>
          <div className="w-full sm:w-[30%] relative">
            <img
              key={images[i].key}
              src={images[i].src}
              alt={images[i].alt}
              className="w-full h-48 sm:h-64 md:h-80 lg:h-100 object-cover rounded-lg shadow"
            />
            <div className="absolute left-0 bottom-0 bg-black/60 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-br-lg rounded-tl-lg m-1 sm:m-2">
              {images[i].info} <span className="ml-1 sm:ml-2 bg-white/20 px-1 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">{images[i].kategori.toUpperCase()}</span>
            </div>
          </div>
          <div className="w-full sm:w-[70%] relative">
            {i + 1 < images.length ? (
              <>
                <img
                  key={images[i + 1].key}
                  src={images[i + 1].src}
                  alt={images[i + 1].alt}
                  className="w-full h-48 sm:h-64 md:h-80 lg:h-100 object-cover rounded-lg shadow"
                />
                <div className="absolute left-0 bottom-0 bg-black/60 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-br-lg rounded-tl-lg m-1 sm:m-2">
                  {images[i + 1].info} <span className="ml-1 sm:ml-2 bg-white/20 px-1 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">{images[i + 1].kategori.toUpperCase()}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      );
      i += 2;
    }
  }
  return rows;
}

export default function GalleryIndex() {
    const { t } = useTranslation('user');
    const [activeTab, setActiveTab] = useState('all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('galleryPage.home'), href: '/' },
        { title: t('galleryPage.title'), href: '/galeri' },
    ];

    const tabs = [
        { key: 'all', label: t('galleryPage.tabAll') },
        { key: 'sma', label: t('galleryPage.tabSma') },
        { key: 'universitas', label: t('galleryPage.tabUniversity') },
        { key: 'institusi', label: t('galleryPage.tabInstitution') },
    ];

    // Filter gambar sesuai tab
    const filteredGambar =
      activeTab === 'all'
        ? gambar
        : gambar.filter((g) => g.kategori === activeTab);

    return (
        <UserLayout>
            <Head title={t('galleryPage.title')} />
            <div className="container mx-auto px-4 py-8 text-primary">
                <div className="mb-8 mx-auto text-center">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-literata">{t('galleryPage.title')}</h1>
                    <div className="mb-8 sm:mb-12 lg:mb-16 flex justify-center">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 sm:mb-8 flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-36 text-sm sm:text-base">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`font-medium px-2 py-1 ${
                                activeTab === tab.key
                                    ? 'text-primary underline underline-offset-4 sm:underline-offset-6'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  {filteredGambar.length > 0 ? (
                    renderGalleryLayout(filteredGambar)
                  ) : (
                    <div className="text-center py-12 col-span-full">
                      <p className="text-muted-foreground">{t('galleryPage.empty')}</p>
                    </div>
                  )}
                </div>
            </div>
        </UserLayout>
    );
}