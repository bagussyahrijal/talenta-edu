import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (_appearance: Appearance = 'light') => {
    if (typeof document === 'undefined') {
        return;
    }
    document.documentElement.classList.remove('dark');
};

export function initializeTheme() {
    if (typeof window !== 'undefined') {
        localStorage.setItem('appearance', 'light');
    }
    setCookie('appearance', 'light');
    applyTheme('light');
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = useCallback((_mode: Appearance) => {
        setAppearance('light');
        if (typeof window !== 'undefined') {
            localStorage.setItem('appearance', 'light');
        }
        setCookie('appearance', 'light');
        applyTheme('light');
    }, []);

    useEffect(() => {
        initializeTheme();
    }, []);

    return { appearance, updateAppearance } as const;
}

