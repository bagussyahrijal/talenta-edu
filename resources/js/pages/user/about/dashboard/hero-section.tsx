import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
    const { t } = useTranslation('user');

    return (
        <section className="relative py-20 text-gray-900 dark:text-white">
            <div className="relative mx-auto max-w-7xl px-4 flex flex-col lg:flex-row items-center gap-12">
                {/* Left side - Single Image */}
                <div className="w-full lg:w-[40%] hidden sm:flex justify-center mb-8 lg:mb-0">
                    <img
                        src="/assets/images/about.png"
                        alt="About Talenta Academy"
                        className="w-full max-w-sm object-contain"
                    />
                </div>

                {/* Right side - Content */}
                <div className="w-full lg:w-[60%]">
                    <span className="text-primary inline-block text-md font-semibold">
                        {t('about.dashboard.aboutUs')}
                    </span>

                    <h1 className="mb-6 text-2xl leading-tight font-bold sm:text-3xl font-literata">
                        {t('about.dashboard.companyName')}
                    </h1>

                    <p className="mb-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                        {t('about.dashboard.description')}
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Feature 1 */}
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-primary">
                                    <Check className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm mb-1">{t('about.dashboard.f1Title')}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {t('about.dashboard.f1Desc')}
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-primary">
                                    <Check className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm mb-1">{t('about.dashboard.f2Title')}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {t('about.dashboard.f2Desc')}
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-primary">
                                    <Check className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm mb-1">{t('about.dashboard.f3Title')}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {t('about.dashboard.f3Desc')}
                                </p>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-primary">
                                    <Check className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm mb-1">{t('about.dashboard.f4Title')}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {t('about.dashboard.f4Desc')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}