import { Cursor } from '@/components/ui/cursor';
import { Tilt } from '@/components/ui/tilt';
import { Link } from '@inertiajs/react';
import { SVGProps } from 'react';

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

export default function AboutSection() {
    return (
        <section className="relative mx-auto w-full max-w-7xl px-4 py-8">
            <div className="mx-auto text-center w-full max-w-4xl space-y-8">
                <h1 className='text-5xl font-bold font-literata text-primary'>Lorem Ipsum</h1>
                <p className=''>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book</p>

                <div className="grid grid-cols-2  lg:grid-cols-4 pt-8">
                    <div className='flex flex-col items-center justify-center gap-1'>
                        <h1 className='font-literata text-5xl font-bold'>20+</h1>
                        <p>Lorem Ipsum</p>
                    </div>
                    <div className='flex flex-col items-center justify-center gap-1'>
                        <h1 className='font-literata text-5xl font-bold'>20+</h1>
                        <p>Lorem Ipsum</p>
                    </div>
                    <div className='flex flex-col items-center justify-center gap-1'>
                        <h1 className='font-literata text-5xl font-bold'>20+</h1>
                        <p>Lorem Ipsum</p>
                    </div>
                    <div className='flex flex-col items-center justify-center gap-1'>
                        <h1 className='font-literata text-5xl font-bold'>20+</h1>
                        <p>Lorem Ipsum</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
