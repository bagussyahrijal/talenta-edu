import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function PageNotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F5F5F0] dark:bg-gray-900 px-4 sm:px-6">
            <Head title="Page Not Found" />
            
            <div className="container flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-12 py-8 lg:py-12">
                {/* Left: Image */}
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                    <img
                        src="/assets/images/not-found.png"
                        alt="Page not found"
                        className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[450px] lg:max-w-[600px] lg:-translate-x-[180px] lg:-translate-y-[120px]"
                    />
                </div>
                {/* Right: 404 and text */}
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <h1 className="text-[80px] sm:text-[120px] md:text-[150px] lg:text-[200px] font-extrabold leading-none mb-2 sm:mb-4 font-literata text-gray-900 dark:text-white">
                        404
                    </h1>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white font-literata">
                        Page Not Found
                    </h2>
                    <p className="mb-6 max-w-md text-base sm:text-lg text-gray-600 dark:text-gray-400 px-4 lg:px-0">
                        The Page is not found.
                    </p>
                    <Button 
                        asChild 
                        size="lg" 
                        variant="outline" 
                        className="px-6 sm:px-8 py-5 sm:py-6 rounded-full text-base sm:text-lg border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-colors dark:border-white dark:hover:bg-white dark:hover:text-gray-900"
                    >
                        <Link href="/">
                            Back to Home
                            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}