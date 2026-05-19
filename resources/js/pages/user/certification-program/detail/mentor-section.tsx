import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { Link } from '@inertiajs/react';
import { Star } from 'lucide-react';

interface Mentor {
    id: string;
    name: string;
    bio?: string;
    avatar?: string;
}

interface CertificationProgram {
    mentors?: Mentor[];
}

export default function MentorSection({ program }: { program: CertificationProgram }) {
    const getInitials = useInitials();
    const mentors = program.mentors || [];

    if (mentors.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto mt-16 mb-8 sm:mb-12 w-full max-w-5xl px-4" id="mentors">
            <h2 className="dark:text-primary-foreground font-literata mb-4 text-center text-3xl font-bold text-gray-900 md:text-4xl">
                Mentor Program
            </h2>
            <p className="mb-8 text-center text-gray-600 dark:text-gray-400">Mentor profesional yang akan membimbing Anda selama program sertifikasi</p>
            <div className="grid gap-4 md:grid-cols-2">
                {mentors.map((mentor) => (
                    <Link
                        key={mentor.id}
                        href={`/mentor/${mentor.id}`}
                        className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-md transition-shadow duration-200 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                    >
                        <div className="flex w-full items-start gap-4">
                            <Avatar className="ring-primary/20 h-12 w-12 shrink-0 ring-4 md:h-16 md:w-16">
                                <AvatarImage src={mentor.avatar ? `/storage/${mentor.avatar}` : undefined} alt={mentor.name} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold md:text-3xl">
                                    {getInitials(mentor.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="w-full min-w-0">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{mentor.name}</h3>
                                </div>
                                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{mentor.bio || 'Mentor profesional Talenta Edu'}</p>
                                <div className="flex items-center gap-2">
                                    <Star size={18} className="text-yellow-500" fill="currentColor" />
                                    <Star size={18} className="text-yellow-500" fill="currentColor" />
                                    <Star size={18} className="text-yellow-500" fill="currentColor" />
                                    <Star size={18} className="text-yellow-500" fill="currentColor" />
                                    <Star size={18} className="text-yellow-500" fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
