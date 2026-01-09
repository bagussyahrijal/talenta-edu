interface Mentor {
    id: number;
    name: string;
    role: string;
    image: string;
}

const mentorsData: Mentor[] = [
    {
        id: 1,
        name: 'Fajar Nurdin, M.Ak., BKP.',
        role: 'Mentor Perpajakan',
        image: '/assets/images/mentors/fajar.png',
    },
    {
        id: 2,
        name: 'Citra Kharisma Utami, S.E., M.Ak.',
        role: 'Mentor Perpajakan',
        image: '/assets/images/mentors/citra.png',
    },
    {
        id: 3,
        name: 'Rizki Indrawan, M.Ak., Ak.',
        role: 'Mentor Perpajakan',
        image: '/assets/images/mentors/rizki.png',
    },
    {
        id: 4,
        name: 'Wildan Dwi Dermawan, M.Ak.',
        role: 'Mentor Perpajakan',
        image: '/assets/images/mentors/wildan.png',
    },
];

const MentorCard = ({ mentor }: { mentor: Mentor }) => {
    return (
        <section className="relative mx-auto h-[370px] w-full max-w-xs overflow-hidden rounded-[20px] sm:max-w-sm md:max-w-md lg:w-[300px]">
            {/* Blue Side Bar with "MENTOR" text */}
            <div className="absolute left-0 top-0 h-full w-[70px] rounded-[20px_0px_0px_20px] bg-[#1976d3] sm:w-[90px]">
                <div className="absolute left-1/2 top-1/3 flex -translate-x-1/2 -translate-y-1/2 -rotate-90 items-center justify-center">
                    <span className="whitespace-nowrap font-literata font-bold text-3xl uppercase leading-none text-primary sm:text-5xl" style={{ WebkitTextStroke: '0.5px white' }}>
                        MENTOR
                    </span>
                </div>
            </div>
            {/* Mentor Image */}
            <div className="absolute bottom-0 right-0 h-[340px] w-[220px]">
                <img
                    className="h-full w-full object-cover object-top"
                    alt={`${mentor.name} - ${mentor.role}`}
                    src={mentor.image}
                    onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=1976d3&color=fff&size=400`;
                    }}
                />
            </div>
            {/* Gradient Overlay at bottom */}
            <div className="absolute bottom-0 left-0 h-[80px] w-full bg-[linear-gradient(180deg,rgba(25,118,211,0)_0%,rgba(25,118,211,1)_26%)] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] sm:h-[120px]" />
            {/* Mentor Name */}
            <h3 className="absolute bottom-[38px] left-0 w-full px-4 text-left font-bold text-lg leading-tight text-white sm:bottom-[45px] sm:px-6 sm:text-[28px]">
                {mentor.name}
            </h3>
            {/* Mentor Role */}
            <p className="absolute bottom-[16px] left-0 w-full px-4 text-left font-normal text-xs text-white/90 sm:bottom-[20px] sm:px-6 sm:text-[14px]">
                {mentor.role}
            </p>
        </section>
    );
};

export default function MentorSection() {
    return (
        <section className="relative w-full bg-secondary px-4 py-10 sm:px-8 sm:py-16 md:px-16">
            <div className="mx-auto w-full max-w-7xl">
                {/* Header */}
                <div className="mb-10 text-center sm:mb-16">
                    <h2 className="text-3xl font-bold font-literata text-primary sm:text-5xl">
                        Meet Our Mentor
                    </h2>
                </div>
                {/* Mentor Cards Grid */}
                <div className="grid grid-cols-1 gap-8 justify-items-center sm:grid-cols-2 lg:grid-cols-4">
                    {mentorsData.map((mentor) => (
                        <MentorCard key={mentor.id} mentor={mentor} />
                    ))}
                </div>
            </div>
        </section>
    );
}