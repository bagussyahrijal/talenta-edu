import { useTranslation } from 'react-i18next';

export default function LegalitasSection() {
    const { t } = useTranslation('user');

    return (
        <section className="w-full bg-[#E6F2FB] py-12">
            <div className="mx-auto w-full max-w-7xl px-4">
                <h2 className="text-center text-5xl font-bold mb-6 font-literata text-gray-900">{t('about.dashboard.legalTitle')}</h2>
                <p className="text-center text-gray-600 mb-10">{t('about.dashboard.legalSubtitle')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Akta Notaris */}
                    <div className="flex flex-col items-center">
                        <img src="/assets/images/aktanotaris.png" alt="Akta Notaris" className="w-24 h-24 mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-center">{t('about.dashboard.aktaTitle')}</h3>
                        <div className="text-center text-gray-800 text-base whitespace-pre-line">
                            {t('about.dashboard.aktaDesc')}
                        </div>
                    </div>
                    {/* Surat Kemenkumham */}
                    <div className="flex flex-col items-center">
                        <img src="/assets/images/suratkemenkum.png" alt="Surat Kemenkumham" className="w-24 h-24 mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-center">{t('about.dashboard.kemenkumhamTitle')}</h3>
                        <div className="text-center text-gray-800 text-base whitespace-pre-line">
                            {t('about.dashboard.kemenkumhamDesc')}
                        </div>
                    </div>
                    {/* NIB */}
                    <div className="flex flex-col items-center">
                        <img src="/assets/images/nib.png" alt="NIB" className="w-24 h-24 mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-center">{t('about.dashboard.nibTitle')}</h3>
                        <div className="text-center text-gray-800 text-base whitespace-pre-line">
                            {t('about.dashboard.nibDesc')}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
