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
import { Album, BookText, BriefcaseBusiness, FileText, Home, MonitorPlay, Presentation, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SearchCommand } from './search-command';
import { NavigationMenuHeader } from './ui/nav-header';

const layananMenu = [
    { href: '/course', title: 'Kelas Online', description: 'Belajar dengan video pembelajaran terstruktur dan materi lengkap', icon: BookText },
    { href: '/bootcamp', title: 'Bootcamp', description: 'Program intensif dengan mentor profesional dan project-based learning', icon: Presentation },
    { href: '/webinar', title: 'Webinar', description: 'Seminar online dengan topik terkini dan expert speaker', icon: MonitorPlay },
    { href: '/bundle', title: 'Bundling', description: 'Paket bundling dengan harga spesial dan materi lengkap', icon: Album },
];

const publikasiMenu = [
    { href: '/galeri', title: 'Galeri', description: 'Kumpulan foto kegiatan dan event', icon: FileText },
    { href: '/alumni', title: 'Alumni', description: 'Kisah sukses alumni setelah mengikuti program kami', icon: User },
    { href: '/review', title: 'Review', description: 'Testimoni dari peserta tentang pengalaman mereka', icon: User },
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
                        <img src="/assets/images/logo-primary.png" alt="Talenta" className="block w-10 fill-current dark:hidden" />
                        <img src="/assets/images/logo-secondary.png" alt="Talenta" className="hidden w-10 fill-current dark:block" />
                    </Link>

                    <div className="ml-auto hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2 gap-1">
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
                                            Beranda
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
                                        Program & Layanan
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-[.75fr_1fr]">
                                            

                                            {/* 3 Produk Utama */}
                                            <ListItem href="/course" title="Kelas Online">
                                                Belajar dengan video pembelajaran terstruktur dan materi lengkap
                                            </ListItem>
                                            <ListItem href="/bootcamp" title="Bootcamp">
                                                Program intensif dengan mentor profesional dan project-based learning
                                            </ListItem>
                                            <ListItem href="/webinar" title="Webinar">
                                                Seminar online dengan topik terkini dan expert speaker
                                            </ListItem>
                                            <ListItem href="/bundle" title="Bundling">
                                                Seminar online dengan topik terkini dan expert speaker
                                            </ListItem>
                                        </ul>
                                    </NavigationMenuContent>
                                    {isServicesActive && (
                                        <div className="bg-primary absolute bottom-0 left-0 h-0.5 w-full translate-y-px dark:bg-white"></div>
                                    )}
                                </NavigationMenuItem>

                                {/* Publikasi */}
                                <NavigationMenuItem className="relative flex h-full items-center">
                                    <NavigationMenuTrigger
                                        className={cn('hover:bg-primary/5 dark:hover:bg-primary/40 h-9 px-3')}
                                    >
                                        Publikasi
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-[.75fr_1fr]">
                                            <ListItem href="/galeri" title="Galeri">
                                                Kumpulan foto kegiatan dan event
                                            </ListItem>
                                            <ListItem href="/alumni" title="Alumni">
                                                Kisah sukses alumni setelah mengikuti program kami
                                            </ListItem>
                                            <ListItem href="/review" title="Review">
                                                Testimoni dari peserta tentang pengalaman mereka
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
                                            Tentang Kami
                                        </Link>
                                    </NavigationMenuLink>
                                    {page.url.startsWith('/about') && (
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
                                                Profil Saya
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
                                    <Link href={route('login')}>Masuk</Link>
                                </Button>
                                <Button variant="default" asChild className="hidden lg:inline-flex">
                                    <Link href={route('register')}>Daftar</Link>
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
                            <span className="text-center text-xs leading-none font-medium">Beranda</span>
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
                                    <span className="text-center text-xs leading-none font-medium">Program & Layanan</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="center" className="mb-2 w-72 sm:w-80 p-3" sideOffset={8}>
                                <div className="space-y-1">
                                    <h4 className="mb-3 px-2 text-sm font-semibold">Program & Layanan</h4>
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
                                                    <p className="mb-1 text-sm leading-none font-medium">{item.title}</p>
                                                    <p className="text-muted-foreground line-clamp-2 text-xs">{item.description}</p>
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
                                    <span className="text-center text-xs leading-none font-medium">Publikasi</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="center" className="mb-2 w-72 sm:w-80 p-3" sideOffset={8}>
                                <div className="space-y-1">
                                    <h4 className="mb-3 px-2 text-sm font-semibold">Publikasi</h4>
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
                                                    <p className="mb-1 text-sm leading-none font-medium">{item.title}</p>
                                                    <p className="text-muted-foreground line-clamp-2 text-xs">{item.description}</p>
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
                            <span className="text-center text-xs leading-none font-medium">Tentang Kami</span>
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
                                <span className="text-center text-xs leading-none font-medium">Profil</span>
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

