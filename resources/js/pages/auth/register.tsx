import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { useTranslation } from 'react-i18next';

type RegisterForm = {
    name: string;
    email: string;
    phone_number: string;
    instance: string;
    city: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { t } = useTranslation('auth');
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        phone_number: '',
        instance: '',
        city: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title={t('register.title')} description={t('register.description')}>
            <Head title={t('register.headTitle')} />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t('register.name')}</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder={t('register.namePlaceholder')}
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('login.email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone_number">{t('register.phone')}</Label>
                        <Input
                            id="phone_number"
                            type="phone_number"
                            required
                            tabIndex={2}
                            autoComplete="phone_number"
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                            disabled={processing}
                            placeholder={t('register.phonePlaceholder')}
                        />
                        <InputError message={errors.phone_number} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="instance">{t('register.instance')}</Label>
                        <Input
                            id="instance"
                            type="text"
                            tabIndex={3}
                            autoComplete="instance"
                            value={data.instance}
                            onChange={(e) => setData('instance', e.target.value)}
                            disabled={processing}
                            placeholder={t('register.instancePlaceholder')}
                            required
                        />
                        <InputError message={errors.instance} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="city">{t('register.city')}</Label>
                        <Input
                            id="city"
                            type="text"
                            required
                            tabIndex={2}
                            autoComplete="address-level2"
                            value={data.city}
                            onChange={(e) => setData('city', e.target.value)}
                            disabled={processing}
                            placeholder={t('register.cityPlaceholder')}
                        />
                        <InputError message={errors.city} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">{t('login.password')}</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder={t('login.password')}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 h-full px-3 hover:cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <Eye className="size-4 text-gray-500" /> : <EyeOff className="size-4 text-gray-500" />}
                                <span className="sr-only">{showPassword ? t('login.hidePassword') : t('login.showPassword')}</span>
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">{t('register.confirmPassword')}</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder={t('register.confirmPassword')}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 h-full px-3 hover:cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <Eye className="size-4 text-gray-500" /> : <EyeOff className="size-4 text-gray-500" />}
                                <span className="sr-only">{showPassword ? t('login.hidePassword') : t('login.showPassword')}</span>
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('register.submit')}
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    {t('register.hasAccount')}{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        {t('register.login')}
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
