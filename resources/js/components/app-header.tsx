import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './language-switcher';
'use client';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Album, Award, BookText, BriefcaseBusiness, FileText, Home, MonitorPlay, Presentation, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SearchCommand } from './search-command';

const layananMenu = [
    { href: '/course', titleKey: 'nav.course', defaultTitle: 'Kelas Online', descKey: 'nav.courseDesc', defaultDesc: 'Belajar dengan video pembelajaran terstruktur dan materi lengkap', icon: BookText },
    {
        href: '/bootcamp',
        titleKey: 'nav.bootcamp',
        defaultTitle: 'Bootcamp',
        descKey: 'nav.bootcampDesc',
        defaultDesc: 'Program intensif dengan mentor profesional dan project-based learning',
        icon: Presentation,
    },
    { href: '/webinar', titleKey: 'nav.webinar', defaultTitle: 'Webinar', descKey: 'nav.webinarDesc', defaultDesc: 'Seminar online dengan topik terkini dan expert speaker', icon: MonitorPlay },
    { href: '/bundle', titleKey: 'nav.bundling', defaultTitle: 'Bundling', descKey: 'nav.bundlingDesc', defaultDesc: 'Paket bundling dengan harga spesial dan materi lengkap', icon: Album },
];

const publikasiMenu = [
    { href: '/galeri', titleKey: 'nav.gallery', defaultTitle: 'Galeri', descKey: 'nav.galleryDesc', defaultDesc: 'Kumpulan foto kegiatan dan event', icon: FileText },
    { href: '/alumni', titleKey: 'nav.alumni', defaultTitle: 'Alumni', descKey: 'nav.alumniDesc', defaultDesc: 'Kisah sukses alumni setelah mengikuti program kami', icon: User },
    { href: '/review', titleKey: 'nav.review', defaultTitle: 'Review', descKey: 'nav.reviewDesc', defaultDesc: 'Testimoni dari peserta tentang pengalaman mereka', icon: User },
];

const activeItemStyles = 'text-primary bg-primary/10 dark:text-white dark:bg-primary/50';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

function ListItem({
    title,
    children,
    href,
    icon: IconComponent,
}: {
    title: string;
    children: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    const page = usePage<SharedData>();
    const isActive = page.url.startsWith(href);

    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    href={href}
                    className={cn(
                        'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors select-none',
                        isActive && 'bg-primary/10 text-primary',
                    )}
                >
                    <div className="flex items-center gap-2">
                        {IconComponent && <Icon iconNode={IconComponent} className="h-4 w-4" />}
                        <div className="text-sm leading-none font-medium">{title}</div>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{children}</p>
                </Link>
            </NavigationMenuLink>
        </li>
    );
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const { t } = useTranslation('common');
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const [searchOpen, setSearchOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);

    const isServicesActive = layananMenu.some((item) => page.url.startsWith(item.href)) || page.url.startsWith('/bundle');

    const isHomepage = page.url === '/' || page.url === '';

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setSearchOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return (
        <>
            <div className="border-sidebar-border/80 bg-background fixed top-0 right-0 left-0 z-40 border-b shadow-xs">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    <Link href="/" prefetch className="flex items-center space-x-2">
                        <img src="/assets/images/logo-primary.png" alt="Talenta" className="block w-10 fill-current" />
                    </Link>

                    <div className="ml-auto hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch gap-1 space-x-2">
                                {/* Beranda */}
                                <NavigationMenuItem className="relative flex h-full items-center">
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link
                                            href="/"
                                            className={cn(
                                                'hover:bg-primary/5 dark:hover:bg-primary/40 h-9 cursor-pointer px-3',
                                                isHomepage && activeItemStyles,
                                            )}
                                        >
                                            {t('nav.home', 'Beranda')}
                                        </Link>
                                    </NavigationMenuLink>
                                    {isHomepage && (
                                        <div className="bg-primary absolute bottom-0 left-0 h-0.5 w-full translate-y-px dark:bg-white"></div>
                                    )}
                                </NavigationMenuItem>

                                {/* Program & Layanan */}
                                <NavigationMenuItem className="relative flex h-full items-center">
                                    <NavigationMenuTrigger
                                        className={cn('hover:bg-primary/5 dark:hover:bg-primary/40 h-9 px-3', isServicesActive && activeItemStyles)}
                                    >
                                        {t('nav.programsAndServices', 'Program & Layanan')}
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-[.75fr_1fr]">
                                            {/* 3 Produk Utama */}
                                            <ListItem href="/course" title={t('nav.course', 'Kelas Online')}>
                                                {t('nav.courseDesc', 'Belajar dengan video pembelajaran terstruktur dan materi lengkap')}
                                            </ListItem>
                                            <ListItem href="/bootcamp" title={t('nav.bootcamp', 'Bootcamp')}>
                                                {t('nav.bootcampDesc', 'Program intensif dengan mentor profesional dan project-based learning')}
                                            </ListItem>
                                            <ListItem href="/webinar" title={t('nav.webinar', 'Webinar')}>
                                                {t('nav.webinarDesc', 'Seminar online dengan topik terkini dan expert speaker')}
                                            </ListItem>
                                            <ListItem href="/bundle" title={t('nav.bundling', 'Bundling')}>
                                                {t('nav.bundlingDesc', 'Paket bundling dengan harga spesial dan materi lengkap')}
                                            </ListItem>
                                        </ul>
                                    </NavigationMenuContent>
                                    {isServicesActive && (
                                        <div className="bg-primary absolute bottom-0 left-0 h-0.5 w-full translate-y-px dark:bg-white"></div>
                                    )}
                                </NavigationMenuItem>

                                {/* Publikasi */}
                                <NavigationMenuItem className="relative flex h-full items-center">
                                    <NavigationMenuTrigger className={cn('hover:bg-primary/5 dark:hover:bg-primary/40 h-9 px-3')}>
                                        {t('nav.publications', 'Publikasi')}
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-[.75fr_1fr]">
                                            <ListItem href="/galeri" title={t('nav.gallery', 'Galeri')}>
                                                {t('nav.galleryDesc', 'Kumpulan foto kegiatan dan event')}
                                            </ListItem>
                                            <ListItem href="/alumni" title={t('nav.alumni', 'Alumni')}>
                                                {t('nav.alumniDesc', 'Kisah sukses alumni setelah mengikuti program kami')}
                                            </ListItem>
                                            <ListItem href="/review" title={t('nav.review', 'Review')}>
                                                {t('nav.reviewDesc', 'Testimoni dari peserta tentang pengalaman mereka')}
                                            </ListItem>
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>

                                {/* Tentang Kami */}
                                <NavigationMenuItem className="relative flex h-full items-center">
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link
                                            href="/about"
                                            className={cn(
                                                'hover:bg-primary/5 dark:hover:bg-primary/40 h-9 cursor-pointer px-3',
                                                page.url.startsWith('/about') && activeItemStyles,
                                            )}
                                        >
                                            {t('nav.about', 'Tentang Kami')}
                                        </Link>
                                    </NavigationMenuLink>
                                    {page.url.startsWith('/about') && (
                                        <div className="bg-primary absolute bottom-0 left-0 h-0.5 w-full translate-y-px dark:bg-white"></div>
                                    )}
                                </NavigationMenuItem>

                                <NavigationMenuItem className="relative flex h-full items-center">
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link
                                            href="/certification-program"
                                            className={cn(
                                                'hover:bg-primary/5 dark:hover:bg-primary/40 h-9 cursor-pointer px-3',
                                                page.url.startsWith('/certification-program') && activeItemStyles,
                                            )}
                                        >
                                            {t('nav.certification', 'Sertifikasi')}
                                        </Link>
                                    </NavigationMenuLink>
                                    {page.url.startsWith('/certification-program') && (
                                        <div className="bg-primary absolute bottom-0 left-0 h-0.5 w-full translate-y-px dark:bg-white"></div>
                                    )}
                                </NavigationMenuItem>

                                <NavigationMenuItem className="relative flex h-full items-center">
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link
                                            href="/check-certificate"
                                            className={cn(
                                                'hover:bg-primary/5 dark:hover:bg-primary/40 h-9 cursor-pointer px-3',
                                                page.url.startsWith('/check-certificate') && activeItemStyles,
                                            )}
                                        >
                                            {t('nav.checkCertificate', 'Cek Sertifikat')}
                                        </Link>
                                    </NavigationMenuLink>
                                    {page.url.startsWith('/check-certificate') && (
                                        <div className="bg-primary absolute bottom-0 left-0 h-0.5 w-full translate-y-px dark:bg-white"></div>
                                    )}
                                </NavigationMenuItem>

                                {/* Profil Saya (if logged in) */}
                                {auth.user && (
                                    <NavigationMenuItem className="relative flex h-full items-center">
                                        <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                            <Link
                                                href="/profile"
                                                className={cn(
                                                    'hover:bg-primary/5 dark:hover:bg-primary/40 h-9 cursor-pointer px-3',
                                                    page.url.startsWith('/profile') && activeItemStyles,
                                                )}
                                            >
                                                {t('nav.myProfile', 'Profil Saya')}
                                            </Link>
                                        </NavigationMenuLink>
                                        {page.url.startsWith('/profile') && (
                                            <div className="bg-primary absolute bottom-0 left-0 h-0.5 w-full translate-y-px dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                )}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-4 flex items-center space-x-2">
                        <LanguageSwitcher variant="segmented" />

                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="size-10 rounded-full p-1">
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                            <AvatarFallback className="bg-primary text-primary-foreground rounded-lg dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={route('login')}>{t('nav.login', 'Masuk')}</Link>
                                </Button>
                                <Button variant="default" asChild className="hidden lg:inline-flex">
                                    <Link href={route('register')}>{t('nav.register', 'Daftar')}</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Dock */}
            <div className="fixed right-0 bottom-0 left-0 z-50 lg:hidden">
                <div className="bg-background/95 border-border border-t pb-2 shadow-lg backdrop-blur-md">
                    <div className={`grid gap-1 px-2 py-2 ${auth.user ? 'grid-cols-5' : 'grid-cols-4'}`}>
                        {/* Beranda */}
                        <Link
                            href="/"
                            className={cn(
                                'flex flex-col items-center justify-center rounded-lg px-2 py-3 transition-colors duration-200',
                                page.url === '/' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                            )}
                        >
                            <Home className="mb-1 h-5 w-6" />
                            <span className="text-center text-xs leading-none font-medium">{t('nav.home', 'Beranda')}</span>
                        </Link>

                        {/* Program & Layanan */}
                        <Popover open={servicesOpen} onOpenChange={setServicesOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    className={cn(
                                        'flex flex-col items-center justify-center rounded-lg px-2 py-3 transition-colors duration-200',
                                        isServicesActive
                                            ? 'text-primary bg-primary/10'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                                    )}
                                >
                                    <Album className="mb-1 h-5 w-6" />
                                    <span className="text-center text-xs leading-none font-medium">{t('nav.programsAndServices', 'Program & Layanan')}</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="center" className="mb-2 w-72 p-3 sm:w-80" sideOffset={8}>
                                <div className="space-y-1">
                                    <h4 className="mb-3 px-2 text-sm font-semibold">{t('nav.programsAndServices', 'Program & Layanan')}</h4>
                                    {layananMenu.map((item) => {
                                        const isActive = page.url.startsWith(item.href);
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setServicesOpen(false)}
                                                className={cn(
                                                    'flex items-start gap-3 rounded-lg p-3 transition-colors duration-200',
                                                    isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 hover:text-foreground',
                                                )}
                                            >
                                                <Icon
                                                    iconNode={item.icon}
                                                    className={cn(
                                                        'mt-0.5 h-5 w-5 flex-shrink-0',
                                                        isActive ? 'text-primary' : 'text-muted-foreground',
                                                    )}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="mb-1 text-sm leading-none font-medium">{t(item.titleKey, item.defaultTitle)}</p>
                                                    <p className="text-muted-foreground line-clamp-2 text-xs">{t(item.descKey, item.defaultDesc)}</p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Publikasi */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className={cn(
                                        'flex flex-col items-center justify-center rounded-lg px-2 py-3 transition-colors duration-200',
                                        page.url.startsWith('/galeri') || page.url.startsWith('/alumni') || page.url.startsWith('/review')
                                            ? 'text-primary bg-primary/10'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                                    )}
                                >
                                    <FileText className="mb-1 h-5 w-6" />
                                    <span className="text-center text-xs leading-none font-medium">{t('nav.publications', 'Publikasi')}</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="center" className="mb-2 w-72 p-3 sm:w-80" sideOffset={8}>
                                <div className="space-y-1">
                                    <h4 className="mb-3 px-2 text-sm font-semibold">{t('nav.publications', 'Publikasi')}</h4>
                                    {publikasiMenu.map((item) => {
                                        const isActive = page.url.startsWith(item.href);
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    'flex items-start gap-3 rounded-lg p-3 transition-colors duration-200',
                                                    isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 hover:text-foreground',
                                                )}
                                            >
                                                <Icon
                                                    iconNode={item.icon}
                                                    className={cn(
                                                        'mt-0.5 h-5 w-5 flex-shrink-0',
                                                        isActive ? 'text-primary' : 'text-muted-foreground',
                                                    )}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="mb-1 text-sm leading-none font-medium">{t(item.titleKey, item.defaultTitle)}</p>
                                                    <p className="text-muted-foreground line-clamp-2 text-xs">{t(item.descKey, item.defaultDesc)}</p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Tentang Kami */}
                        <Link
                            href="/about"
                            className={cn(
                                'flex flex-col items-center justify-center rounded-lg px-2 py-3 transition-colors duration-200',
                                page.url.startsWith('/about')
                                    ? 'text-primary bg-primary/10'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                            )}
                        >
                            <BriefcaseBusiness className="mb-1 h-5 w-6" />
                            <span className="text-center text-xs leading-none font-medium">{t('nav.about', 'Tentang Kami')}</span>
                        </Link>

                        {/* Profil (if logged in) */}
                        {auth.user && (
                            <Link
                                href="/profile"
                                className={cn(
                                    'flex flex-col items-center justify-center rounded-lg px-2 py-3 transition-colors duration-200',
                                    page.url.startsWith('/profile')
                                        ? 'text-primary bg-primary/10'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                                )}
                            >
                                <User className="mb-1 h-5 w-6" />
                                <span className="text-center text-xs leading-none font-medium">{t('nav.profile', 'Profil')}</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />

            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
