import { Cursor } from '@/components/ui/cursor';
import { Tilt } from '@/components/ui/tilt';
import { Link } from '@inertiajs/react';
import { SVGProps, useEffect, useState } from 'react';

const MouseIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={26} height={31} fill="none" {...props}>
            <g clipPath="url(#a)">
                <path
                    fill={'#FF7F3E'} // Ubah warna di sini
                    fillRule="evenodd"
                    stroke={'#fff'}
                    strokeLinecap="square"
                    strokeWidth={2}
                    d="M21.993 14.425 2.549 2.935l4.444 23.108 4.653-10.002z"
                    clipRule="evenodd"
                />
            </g>
            <defs>
                <clipPath id="a">
                    <path fill={'#FF7F3E'} d="M0 0h26v31H0z" />
                </clipPath>
            </defs>
        </svg>
    );
};

const AnimatedCounter = ({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        const startValue = 0;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function (easeOutExpo)
            const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            const currentCount = Math.floor(easeOutExpo * (end - startValue) + startValue);
            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration]);

    return (
        <h1 className='font-literata text-5xl font-bold'>
            {count.toLocaleString('id-ID')}{suffix}
        </h1>
    );
};

export default function AboutSection() {
    return (
        <section className="relative mx-auto w-full max-w-7xl px-4 py-8">
            <div className="mx-auto text-center w-full max-w-4xl space-y-8">
                <h1 className='text-5xl font-bold font-literata text-primary'>Perjalanan Kami</h1>
                <p className=''>Kami telah membantu ribuan peserta meningkatkan kompetensi akuntansi dan perpajakan melalui pelatihan berbasis praktik.
                    “Mencetak Talenta Akuntansi & Pajak yang Siap Dunia Kerja”</p>

                <div className="grid grid-cols-2  lg:grid-cols-4 pt-8">
                    <div className='flex flex-col items-center justify-center gap-1'>
                        <AnimatedCounter end={30} suffix="+" />
                        <p>Pelatihan Online</p>
                    </div>
                    <div className='flex flex-col items-center justify-center gap-1'>
                        <AnimatedCounter end={15992} suffix="+" />
                        <p>Alumni & Peserta Terlatih</p>
                    </div>
                    <div className='flex flex-col items-center justify-center gap-1'>
                        <AnimatedCounter end={15} suffix="+" />
                        <p>Partner Kerjasama</p>
                    </div>
                    <div className='flex flex-col items-center justify-center gap-1'>
                        <AnimatedCounter end={98} suffix="%" />
                        <p>Kepuasan Peserta</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
