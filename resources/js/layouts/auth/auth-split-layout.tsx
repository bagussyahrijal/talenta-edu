import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-dvh flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md py-12">
                <Link href={route('home')} className="flex items-center justify-center mb-6">
                    <img src="/assets/images/logo-primary.png" alt="Talenta" className="block w-20 dark:hidden" />
                    <img src="/assets/images/logo-secondary-2.png" alt="Talenta" className="hidden w-20 dark:block" />
                </Link>
                <div className="flex flex-col items-center gap-2 text-center mb-6">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </div>
                {children}
            </div>
        </div>
    );
}